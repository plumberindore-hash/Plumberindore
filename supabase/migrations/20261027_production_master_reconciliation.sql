-- ==============================================================================
-- PLUMBERINDORE MASTER PRODUCTION RECONCILIATION & RESOLUTION MIGRATION
-- Migration: 20261027_production_master_reconciliation.sql
-- Target Project: rxbrkbnubionfsyswohe (PostgreSQL 17.6.1)
-- Fully Hardened & Preflight-Certified
-- ==============================================================================

-- 1. UNIVERSAL TIMESTAMP TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers safely
DROP TRIGGER IF EXISTS trg_bookings_updated_at ON public.bookings;
CREATE TRIGGER trg_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_workers_updated_at ON public.workers;
CREATE TRIGGER trg_workers_updated_at
BEFORE UPDATE ON public.workers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_jobs_updated_at ON public.jobs;
CREATE TRIGGER trg_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_quote_requests_updated_at ON public.quote_requests;
CREATE TRIGGER trg_quote_requests_updated_at
BEFORE UPDATE ON public.quote_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. ALIGN COLUMNS ON BOOKINGS & INVOICES
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS technician_id uuid REFERENCES public.technicians(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_worker_id uuid REFERENCES public.workers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz,
  ADD COLUMN IF NOT EXISTS locality text;

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS customer_email text,
  ADD COLUMN IF NOT EXISTS billing_address text,
  ADD COLUMN IF NOT EXISTS labor_cost numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS parts_cost numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_paid numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS payment_ref text,
  ADD COLUMN IF NOT EXISTS issued_at timestamptz DEFAULT timezone('utc', now()),
  ADD COLUMN IF NOT EXISTS sent_at timestamptz;

ALTER TABLE public.invoice_items
  ADD COLUMN IF NOT EXISTS amount numeric DEFAULT 0;

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT true;

-- 3. CREATE PUBLIC.SERVICES (DYNAMIC CATALOG TABLE WITH CLEAN URL SLUGS)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
    slug VARCHAR(150) NOT NULL,
    name VARCHAR(200) NOT NULL,
    package_title VARCHAR(200) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    duration VARCHAR(50) DEFAULT '45-60 Mins',
    warranty_days INTEGER NOT NULL DEFAULT 30,
    description TEXT,
    diagnostics_checklist JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT uq_service_slug_package UNIQUE (slug, package_title)
);

CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "services_public_view" ON public.services;
CREATE POLICY "services_public_view" ON public.services FOR SELECT TO public USING (is_active = true);

DROP POLICY IF EXISTS "services_admin_all" ON public.services;
CREATE POLICY "services_admin_all" ON public.services FOR ALL TO authenticated 
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "services_service_role" ON public.services;
CREATE POLICY "services_service_role" ON public.services FOR ALL TO service_role USING (true);

-- Seed core services from service_catalog with robust alphanumeric URL slug sanitization
INSERT INTO public.services (category_id, slug, name, package_title, price, description, is_active)
SELECT 
    sc.category_id,
    TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(sc.name), '[^a-z0-9]+', '-', 'g')),
    sc.name,
    'Standard ' || sc.name,
    ROUND((sc.price_paise / 100.0), 2),
    'Professional verified service in Indore with 30-day warranty.',
    sc.is_active
FROM public.service_catalog sc
WHERE NOT EXISTS (SELECT 1 FROM public.services)
ON CONFLICT (slug, package_title) DO NOTHING;

-- 4. HARDEN AUTHENTICATION HELPERS (SECURITY FIX: VULN-ADM01)
-- REMOVED auth.jwt() -> 'user_metadata' check which allowed client-side privilege escalation
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT (
    auth.role() = 'service_role'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin', 'owner')
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'superadmin', 'owner')
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_worker_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT id FROM public.workers
  WHERE profile_id = auth.uid()
     OR id = auth.uid()
  LIMIT 1;
$$;

-- 5. DUAL-ENGINE SYNCHRONIZATION BRIDGE (BOOKINGS -> JOBS)
-- Fully sanitized to prevent check constraint violations and recursion
CREATE OR REPLACE FUNCTION public.sync_booking_to_partner_job()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_job_id uuid;
  v_category_id uuid;
  v_total_paise bigint;
  v_subtotal_paise bigint;
  v_commission_paise bigint;
  v_worker_share_paise bigint;
  v_inspection_fee_paise bigint;
  v_commission_pct numeric;
  v_locality varchar(100);
  v_payment_method varchar(50);
  v_payment_status varchar(50);
  v_job_status varchar(50);
BEGIN
  -- 1. Recursion guard
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  -- 2. Determine locality
  v_locality := COALESCE(NEW.locality, 'Indore');

  -- 3. Convert amounts to Paise (1 INR = 100 Paise)
  v_total_paise := ROUND(COALESCE(NEW.total_amount, 299) * 100);
  v_subtotal_paise := ROUND(COALESCE(NEW.subtotal, NEW.total_amount, 299) * 100);
  v_inspection_fee_paise := LEAST(29900::bigint, v_total_paise);

  -- 4. Dynamic commission lookup from settings (default 10%)
  SELECT COALESCE(NULLIF(value, '')::numeric, 10.0) INTO v_commission_pct
  FROM public.settings
  WHERE key = 'platform_commission_percent'
  LIMIT 1;

  IF v_commission_pct IS NULL THEN
    v_commission_pct := 10.0;
  END IF;

  v_commission_paise := ROUND(v_total_paise * (v_commission_pct / 100.0));
  v_worker_share_paise := v_total_paise - v_commission_paise;

  -- 5. Sanitize payment_method against CHECK (payment_method IN ('CASH', 'UPI', 'PENDING'))
  v_payment_method := CASE
    WHEN NEW.payment_method ILIKE '%upi%' THEN 'UPI'
    WHEN NEW.payment_method ILIKE '%cash%' THEN 'CASH'
    ELSE 'PENDING'
  END;

  -- 6. Sanitize payment_status against CHECK (payment_status IN ('UNPAID', 'PAID', 'WAIVED'))
  v_payment_status := CASE
    WHEN NEW.payment_status ILIKE '%paid%' AND NEW.payment_status NOT ILIKE '%pending%' THEN 'PAID'
    WHEN NEW.payment_status ILIKE '%waive%' THEN 'WAIVED'
    ELSE 'UNPAID'
  END;

  -- 7. Sanitize status against CHECK status IN ('NEW', 'REQUESTED', 'ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'PAYMENT_PENDING', 'COMPLETED', 'CANCELLED', 'REASSIGN_REQUIRED')
  v_job_status := CASE 
    WHEN NEW.status = 'Pending' THEN 'NEW'
    WHEN NEW.status = 'Technician Assigned' AND NEW.assigned_worker_id IS NOT NULL THEN 'ASSIGNED'
    WHEN NEW.status = 'Technician Assigned' THEN 'REQUESTED'
    WHEN NEW.status = 'On The Way (45-Min)' THEN 'EN_ROUTE'
    WHEN NEW.status = 'In Progress' THEN 'IN_PROGRESS'
    WHEN NEW.status = 'Payment Verified & Completed' THEN 'COMPLETED'
    WHEN NEW.status = 'Rescheduled' THEN 'REASSIGN_REQUIRED'
    WHEN NEW.status = 'Cancelled' THEN 'CANCELLED'
    ELSE 'NEW'
  END;

  -- Fetch default category ID if possible
  SELECT id INTO v_category_id FROM public.service_categories LIMIT 1;

  -- 8. Check if job already exists for this booking number
  SELECT id INTO v_job_id FROM public.jobs WHERE job_number = NEW.booking_number;

  IF v_job_id IS NULL THEN
    -- Insert new Job in Partner Engine
    INSERT INTO public.jobs (
      job_number,
      customer_name,
      customer_phone,
      address,
      locality,
      issue,
      service_category_id,
      service_category,
      priority,
      status,
      assigned_worker_id,
      subtotal_paise,
      inspection_fee_paise,
      total_paise,
      commission_paise,
      worker_share_paise,
      payment_method,
      payment_status,
      start_otp,
      end_otp,
      notes,
      created_at,
      updated_at
    ) VALUES (
      NEW.booking_number,
      NEW.customer_name,
      NEW.customer_phone,
      NEW.service_address,
      v_locality,
      COALESCE(NEW.service_name || ' - ' || COALESCE(NEW.package_title, ''), 'Plumbing Service'),
      v_category_id,
      'plumber',
      'Normal',
      v_job_status,
      NEW.assigned_worker_id,
      v_subtotal_paise,
      v_inspection_fee_paise,
      v_total_paise,
      v_commission_paise,
      v_worker_share_paise,
      v_payment_method,
      v_payment_status,
      LPAD(FLOOR(RANDOM() * 9000 + 1000)::text, 4, '0'),
      LPAD(FLOOR(RANDOM() * 9000 + 1000)::text, 4, '0'),
      NEW.notes,
      COALESCE(NEW.created_at, TIMEZONE('utc', NOW())),
      TIMEZONE('utc', NOW())
    );
  ELSE
    -- Update existing Partner Engine Job
    UPDATE public.jobs
    SET 
      customer_name = NEW.customer_name,
      customer_phone = NEW.customer_phone,
      address = NEW.service_address,
      assigned_worker_id = NEW.assigned_worker_id,
      status = v_job_status,
      total_paise = v_total_paise,
      subtotal_paise = v_subtotal_paise,
      commission_paise = v_commission_paise,
      worker_share_paise = v_worker_share_paise,
      payment_method = v_payment_method,
      payment_status = v_payment_status,
      updated_at = TIMEZONE('utc', NOW())
    WHERE id = v_job_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_booking_to_partner_job ON public.bookings;
CREATE TRIGGER trg_sync_booking_to_partner_job
AFTER INSERT OR UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.sync_booking_to_partner_job();

-- 6. HARDEN ATOMIC CLAIM RPC (SECURITY FIX: VULN-RPC01)
CREATE OR REPLACE FUNCTION public.claim_booking(
  p_booking_id uuid,
  p_worker_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_booking record;
BEGIN
  -- 1. Caller Authorization Check (Admin, service_role, or the authentic worker)
  IF NOT (
    public.is_admin()
    OR auth.uid() = p_worker_id
    OR EXISTS (
      SELECT 1 FROM public.workers 
      WHERE id = p_worker_id AND profile_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  ) THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error_code', 'UNAUTHORIZED', 
      'message', 'Caller is not authorized to claim as this worker'
    );
  END IF;

  -- 2. Verify worker exists and is active
  IF NOT EXISTS (
    SELECT 1 FROM public.workers 
    WHERE id = p_worker_id AND status = 'active'
  ) THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error_code', 'INACTIVE_WORKER', 
      'message', 'Worker is not active or does not exist'
    );
  END IF;

  -- 3. Lock row exclusively to prevent race conditions
  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'NOT_FOUND', 'message', 'Booking not found');
  END IF;

  -- 4. Case-insensitive pending status check
  IF v_booking.assigned_worker_id IS NOT NULL OR v_booking.status NOT ILIKE 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'ALREADY_CLAIMED', 'message', 'Booking has already been claimed');
  END IF;

  -- 5. Update Ops Portal Booking
  UPDATE public.bookings
  SET assigned_worker_id = p_worker_id,
      status = 'Technician Assigned',
      claimed_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  WHERE id = p_booking_id;

  -- 6. Update Partner Engine Job
  UPDATE public.jobs
  SET assigned_worker_id = p_worker_id,
      status = 'ASSIGNED',
      assigned_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  WHERE job_number = v_booking.booking_number;

  RETURN jsonb_build_object('success', true, 'booking_id', p_booking_id);
END;
$$;

-- Revoke anonymous execution on claim_booking
REVOKE EXECUTE ON FUNCTION public.claim_booking(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_booking(uuid, uuid) TO authenticated, service_role;

-- 7. COVERING INDEXES FOR UNINDEXED FOREIGN KEYS (PERFORMANCE)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_job_services_service_catalog_id ON public.job_services(service_catalog_id);
CREATE INDEX IF NOT EXISTS idx_jobs_reassigned_from ON public.jobs(reassigned_from_worker_id);
CREATE INDEX IF NOT EXISTS idx_jobs_service_category_id ON public.jobs(service_category_id);
CREATE INDEX IF NOT EXISTS idx_notification_jobs_template_id ON public.notification_jobs(template_id);
CREATE INDEX IF NOT EXISTS idx_operational_alerts_job_id ON public.operational_alerts(related_job_id);
CREATE INDEX IF NOT EXISTS idx_operational_alerts_worker_id ON public.operational_alerts(related_worker_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhook_job_id ON public.payment_webhook_events(job_id);
CREATE INDEX IF NOT EXISTS idx_service_catalog_category_id ON public.service_catalog(category_id);
CREATE INDEX IF NOT EXISTS idx_settlements_wallet_tx_id ON public.settlements(wallet_transaction_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_job_id ON public.support_tickets(related_job_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_worker_id ON public.support_tickets(related_worker_id);
CREATE INDEX IF NOT EXISTS idx_technicians_profile_id ON public.technicians(profile_id);

-- 8. CONSOLIDATE AND HARDEN RLS POLICIES (SECURITY FIX: VULN-PAY01)
-- Drop all existing policies on payments to ensure clean, hardened baseline
DROP POLICY IF EXISTS "payments_authenticated_all" ON public.payments;
DROP POLICY IF EXISTS "payments_admin_all" ON public.payments;
DROP POLICY IF EXISTS "payments_service_role" ON public.payments;
DROP POLICY IF EXISTS "payments_worker_view_assigned" ON public.payments;
DROP POLICY IF EXISTS "Admins full access to payments" ON public.payments;
DROP POLICY IF EXISTS "Workers view their job payments" ON public.payments;
DROP POLICY IF EXISTS "payments_worker_view" ON public.payments;

-- Strict Payments RLS: Admin & Service Role full access
CREATE POLICY "payments_admin_all" ON public.payments 
  FOR ALL TO authenticated 
  USING (public.is_admin()) 
  WITH CHECK (public.is_admin());

CREATE POLICY "payments_service_role" ON public.payments 
  FOR ALL TO service_role 
  USING (true);

-- Strict Payments RLS: Workers can ONLY view payments for their assigned jobs
CREATE POLICY "payments_worker_view_assigned" ON public.payments 
  FOR SELECT TO authenticated 
  USING (
    job_id IN (
      SELECT id FROM public.jobs 
      WHERE assigned_worker_id = public.get_current_worker_id()
    )
  );

-- Strict Settings RLS: Public read, Admin modification only
DROP POLICY IF EXISTS "settings_public_read" ON public.settings;
DROP POLICY IF EXISTS "settings_public_view" ON public.settings;
DROP POLICY IF EXISTS "settings_view_all" ON public.settings;
DROP POLICY IF EXISTS "settings_admin_all" ON public.settings;
DROP POLICY IF EXISTS "settings_admin_manage" ON public.settings;
DROP POLICY IF EXISTS "settings_service_role" ON public.settings;

CREATE POLICY "settings_public_view" ON public.settings 
  FOR SELECT TO public 
  USING (true);

CREATE POLICY "settings_admin_manage" ON public.settings 
  FOR ALL TO authenticated 
  USING (public.is_admin()) 
  WITH CHECK (public.is_admin());

CREATE POLICY "settings_service_role" ON public.settings 
  FOR ALL TO service_role 
  USING (true);

-- 9. INITIALIZE STANDARDIZED MIGRATION TRACKING (14-DIGIT TIMESTAMPS)
CREATE SCHEMA IF NOT EXISTS supabase_migrations;
CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
    version text PRIMARY KEY,
    statements text[],
    name text
);

INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES 
    ('20260901000000', 'initial_schema'),
    ('20260901010000', 'storage_buckets'),
    ('20260903000000', 'unified_plumberindore_schema'),
    ('20261007000000', 'partner_engine_core_schema'),
    ('20261008000000', 'phase6_verified_payments'),
    ('20261012000000', 'production_forward_migration'),
    ('20261021000000', 'partner_engine_schema_reconciliation'),
    ('20261027000000', 'master_production_reconciliation')
ON CONFLICT (version) DO NOTHING;
