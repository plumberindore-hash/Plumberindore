-- ==============================================================================
-- PLUMBERINDORE PRODUCTION DATABASE UNIFIED SCHEMA & RLS MIGRATION
-- Project: hnawwvxvfdnkmwtytwre (https://hnawwvxvfdnkmwtytwre.supabase.co)
-- Description: Complete schema for Bookings, Leads, Services, Invoices,
--              Contact Inquiries, Payments, Triggers & Row Level Security.
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CORE USERS, CUSTOMERS & TECHNICIANS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'technician', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    loyalty_tier VARCHAR(50) DEFAULT 'standard',
    total_bookings INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_profile_id ON public.customers(profile_id);

CREATE TABLE IF NOT EXISTS public.technicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
    title VARCHAR(100) NOT NULL DEFAULT 'Verified Doorstep Technician',
    phone VARCHAR(20) NOT NULL,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 4.95,
    repairs_count INTEGER NOT NULL DEFAULT 100,
    photo_url TEXT,
    vehicle_number VARCHAR(50) DEFAULT 'Service Vehicle (MP 09)',
    eta VARCHAR(50) DEFAULT '30-45 Mins',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_technicians_active ON public.technicians(is_active);

-- ==============================================================================
-- 3. SERVICE CATALOG & CATEGORIES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    starting_price NUMERIC(10, 2) NOT NULL DEFAULT 149.00,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.service_categories(id) ON DELETE CASCADE,
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
    CONSTRAINT uq_service_category_slug UNIQUE (category_id, slug, package_title)
);

CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);

CREATE TABLE IF NOT EXISTS public.customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    full_name VARCHAR(150),
    phone VARCHAR(20),
    address_line TEXT NOT NULL,
    landmark VARCHAR(150),
    pincode VARCHAR(10) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Indore',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON public.customer_addresses(customer_id);

-- ==============================================================================
-- 4. BOOKINGS & BOOKING ITEMS (Doorstep Orders)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. IND-84920
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    address_id UUID REFERENCES public.customer_addresses(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    service_address TEXT NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    scheduled_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    package_title VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'Technician Assigned' 
        CHECK (status IN ('Technician Assigned', 'On The Way (45-Min)', 'In Progress', 'Payment Verified & Completed', 'Rescheduled', 'Cancelled')),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending (Pay on Completion)' 
        CHECK (payment_status IN ('Pending (Pay on Completion)', 'Paid', 'Refunded', 'Failed')),
    payment_method VARCHAR(50) DEFAULT 'Cash / UPI on Doorstep',
    payment_ref VARCHAR(100),
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    parts_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_bookings_number ON public.bookings(booking_number);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON public.bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(scheduled_date);

CREATE TABLE IF NOT EXISTS public.booking_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    service_name VARCHAR(200) NOT NULL,
    package_title VARCHAR(200) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_booking_items_booking_id ON public.booking_items(booking_id);

CREATE TABLE IF NOT EXISTS public.technician_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    technician_id UUID NOT NULL REFERENCES public.technicians(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'assigned' 
        CHECK (status IN ('assigned', 'accepted', 'in_transit', 'arrived', 'completed', 'cancelled')),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    completed_at TIMESTAMPTZ,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_technician_assignments_booking_id ON public.technician_assignments(booking_id);
CREATE INDEX IF NOT EXISTS idx_technician_assignments_technician_id ON public.technician_assignments(technician_id);

CREATE TABLE IF NOT EXISTS public.booking_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_status_history_booking_id ON public.booking_status_history(booking_id);

-- ==============================================================================
-- 5. PAYMENTS & INVOICES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('UPI', 'Cash', 'Card', 'Net Banking', 'Wallet')),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'verified' CHECK (payment_status IN ('pending', 'verified', 'failed', 'refunded')),
    payment_ref VARCHAR(100),
    transaction_notes TEXT,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. INV-2026-IND-84920
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20) NOT NULL,
    billing_address TEXT NOT NULL,
    labor_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    parts_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_paid NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Cash / UPI Verified',
    payment_ref VARCHAR(100),
    issued_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_invoices_booking_id ON public.invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);

CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);

-- ==============================================================================
-- 6. LEADS, CONTACT DESK & ESTIMATE QUOTE REQUESTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_number VARCHAR(50) UNIQUE DEFAULT ('LEAD-' || LPAD(FLOOR(RANDOM() * 90000 + 10000)::TEXT, 5, '0')),
    source VARCHAR(50) NOT NULL DEFAULT 'website', -- 'booking_form', 'contact_desk', 'cost_calculator', 'whatsapp', 'call'
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    service_category VARCHAR(100),
    service_name VARCHAR(255),
    issue_description TEXT,
    service_address TEXT,
    pincode VARCHAR(10),
    estimated_price NUMERIC(10, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'new' 
        CHECK (status IN ('new', 'contacted', 'assigned', 'converted', 'closed', 'junk')),
    notes TEXT,
    raw_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_contact_phone ON public.contact_messages(phone);
CREATE INDEX IF NOT EXISTS idx_contact_status ON public.contact_messages(status);

CREATE TABLE IF NOT EXISTS public.quote_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    model_type VARCHAR(100),
    issue TEXT NOT NULL,
    estimated_price NUMERIC(10, 2),
    customer_name VARCHAR(150),
    customer_phone VARCHAR(20),
    customer_pincode VARCHAR(10),
    remarks TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'booked', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_quote_phone ON public.quote_requests(customer_phone);
CREATE INDEX IF NOT EXISTS idx_quote_category ON public.quote_requests(category);

-- ==============================================================================
-- 7. REVIEWS, NOTIFICATIONS, EMAIL LOGS & AUDIT LOGS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON public.reviews(booking_id);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    email_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'delivered')),
    message_id VARCHAR(100),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON public.email_logs(recipient);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- 8. AUTOMATED TRIGGERS & PROCEDURES
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_technicians_updated_at ON public.technicians;
CREATE TRIGGER update_technicians_updated_at BEFORE UPDATE ON public.technicians FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_customer_addresses_updated_at ON public.customer_addresses;
CREATE TRIGGER update_customer_addresses_updated_at BEFORE UPDATE ON public.customer_addresses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.handle_booking_number_generation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_number IS NULL OR NEW.booking_number = '' THEN
        NEW.booking_number := 'IND-' || LPAD(FLOOR(RANDOM() * 90000 + 10000)::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_booking_number ON public.bookings;
CREATE TRIGGER trg_generate_booking_number BEFORE INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.handle_booking_number_generation();

CREATE OR REPLACE FUNCTION public.handle_invoice_number_generation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 90000 + 10000)::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_invoice_number ON public.invoices;
CREATE TRIGGER trg_generate_invoice_number BEFORE INSERT ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.handle_invoice_number_generation();

CREATE OR REPLACE FUNCTION public.log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.booking_status_history (booking_id, status, notes)
        VALUES (NEW.id, NEW.status, 'Status transitioned from ' || COALESCE(OLD.status, 'none') || ' to ' || NEW.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_booking_status_history ON public.bookings;
CREATE TRIGGER trg_booking_status_history AFTER UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.log_booking_status_change();

CREATE OR REPLACE FUNCTION public.sync_booking_to_leads()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.leads (
        source,
        name,
        phone,
        email,
        service_category,
        service_name,
        issue_description,
        service_address,
        pincode,
        estimated_price,
        status,
        notes
    ) VALUES (
        'booking_form',
        NEW.customer_name,
        NEW.customer_phone,
        NEW.customer_email,
        NEW.service_name,
        NEW.service_name || ' - ' || COALESCE(NEW.package_title, 'Standard'),
        COALESCE(NEW.notes, 'Direct Doorstep Booking #' || NEW.booking_number),
        NEW.service_address,
        NEW.pincode,
        NEW.total_amount,
        'assigned',
        'Auto-synced from booking ' || NEW.booking_number
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_booking_to_leads ON public.bookings;
CREATE TRIGGER trg_sync_booking_to_leads AFTER INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.sync_booking_to_leads();

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9.1 PUBLIC INSERT POLICIES (Allow web visitors to book & inquire)
DROP POLICY IF EXISTS "Allow public insert leads" ON public.leads;
CREATE POLICY "Allow public insert leads" ON public.leads FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow public insert bookings" ON public.bookings;
CREATE POLICY "Allow public insert bookings" ON public.bookings FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow public insert booking items" ON public.booking_items;
CREATE POLICY "Allow public insert booking items" ON public.booking_items FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow public insert contact messages" ON public.contact_messages;
CREATE POLICY "Allow public insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow public insert quote requests" ON public.quote_requests;
CREATE POLICY "Allow public insert quote requests" ON public.quote_requests FOR INSERT WITH CHECK (TRUE);

-- 9.2 PUBLIC READ CATALOG POLICIES
DROP POLICY IF EXISTS "Allow public read active categories" ON public.service_categories;
CREATE POLICY "Allow public read active categories" ON public.service_categories FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Allow public read active services" ON public.services;
CREATE POLICY "Allow public read active services" ON public.services FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Allow public read reviews" ON public.reviews;
CREATE POLICY "Allow public read reviews" ON public.reviews FOR SELECT USING (is_verified = TRUE);

-- 9.3 CUSTOMER POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Customers can view own customer record" ON public.customers;
CREATE POLICY "Customers can view own customer record" ON public.customers FOR SELECT USING (profile_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Customers can update own customer record" ON public.customers;
CREATE POLICY "Customers can update own customer record" ON public.customers FOR UPDATE USING (profile_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Customers can manage own addresses" ON public.customer_addresses;
CREATE POLICY "Customers can manage own addresses" ON public.customer_addresses FOR ALL USING (
    EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND (c.profile_id = auth.uid() OR public.is_admin()))
);

DROP POLICY IF EXISTS "Customers can view own bookings" ON public.bookings;
CREATE POLICY "Customers can view own bookings" ON public.bookings FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.profile_id = auth.uid()) OR public.is_admin()
);

DROP POLICY IF EXISTS "Customers can view own booking items" ON public.booking_items;
CREATE POLICY "Customers can view own booking items" ON public.booking_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.bookings b 
        LEFT JOIN public.customers c ON c.id = b.customer_id
        WHERE b.id = booking_id AND (c.profile_id = auth.uid() OR public.is_admin())
    )
);

DROP POLICY IF EXISTS "Customers can view own invoices" ON public.invoices;
CREATE POLICY "Customers can view own invoices" ON public.invoices FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.bookings b 
        LEFT JOIN public.customers c ON c.id = b.customer_id
        WHERE b.id = booking_id AND (c.profile_id = auth.uid() OR public.is_admin())
    )
);

DROP POLICY IF EXISTS "Customers can view own invoice items" ON public.invoice_items;
CREATE POLICY "Customers can view own invoice items" ON public.invoice_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.invoices i
        JOIN public.bookings b ON b.id = i.booking_id
        LEFT JOIN public.customers c ON c.id = b.customer_id
        WHERE i.id = invoice_id AND (c.profile_id = auth.uid() OR public.is_admin())
    )
);

DROP POLICY IF EXISTS "Customers can view own payments" ON public.payments;
CREATE POLICY "Customers can view own payments" ON public.payments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.bookings b 
        LEFT JOIN public.customers c ON c.id = b.customer_id
        WHERE b.id = booking_id AND (c.profile_id = auth.uid() OR public.is_admin())
    )
);

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Customers can insert reviews for own bookings" ON public.reviews;
CREATE POLICY "Customers can insert reviews for own bookings" ON public.reviews FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.profile_id = auth.uid()) OR public.is_admin()
);

DROP POLICY IF EXISTS "Users can view booking status history" ON public.booking_status_history;
CREATE POLICY "Users can view booking status history" ON public.booking_status_history FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.bookings b 
        LEFT JOIN public.customers c ON c.id = b.customer_id
        WHERE b.id = booking_id AND (c.profile_id = auth.uid() OR public.is_admin())
    )
);

-- 9.4 TECHNICIAN POLICIES
DROP POLICY IF EXISTS "Technicians can view assigned bookings" ON public.bookings;
CREATE POLICY "Technicians can view assigned bookings" ON public.bookings FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.technician_assignments ta
        JOIN public.technicians t ON t.id = ta.technician_id
        WHERE ta.booking_id = public.bookings.id AND t.profile_id = auth.uid()
    ) OR public.is_admin()
);

DROP POLICY IF EXISTS "Technicians can view assigned jobs" ON public.technician_assignments;
CREATE POLICY "Technicians can view assigned jobs" ON public.technician_assignments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.technicians t WHERE t.id = technician_id AND (t.profile_id = auth.uid() OR public.is_admin()))
);

DROP POLICY IF EXISTS "Technicians can update job status" ON public.technician_assignments;
CREATE POLICY "Technicians can update job status" ON public.technician_assignments FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.technicians t WHERE t.id = technician_id AND (t.profile_id = auth.uid() OR public.is_admin()))
);

-- 9.5 ADMIN FULL ACCESS POLICIES
DROP POLICY IF EXISTS "Admins full access profiles" ON public.profiles;
CREATE POLICY "Admins full access profiles" ON public.profiles FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access customers" ON public.customers;
CREATE POLICY "Admins full access customers" ON public.customers FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access technicians" ON public.technicians;
CREATE POLICY "Admins full access technicians" ON public.technicians FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access categories" ON public.service_categories;
CREATE POLICY "Admins full access categories" ON public.service_categories FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access services" ON public.services;
CREATE POLICY "Admins full access services" ON public.services FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access customer_addresses" ON public.customer_addresses;
CREATE POLICY "Admins full access customer_addresses" ON public.customer_addresses FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access bookings" ON public.bookings;
CREATE POLICY "Admins full access bookings" ON public.bookings FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access booking_items" ON public.booking_items;
CREATE POLICY "Admins full access booking_items" ON public.booking_items FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access technician_assignments" ON public.technician_assignments;
CREATE POLICY "Admins full access technician_assignments" ON public.technician_assignments FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access booking_status_history" ON public.booking_status_history;
CREATE POLICY "Admins full access booking_status_history" ON public.booking_status_history FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access payments" ON public.payments;
CREATE POLICY "Admins full access payments" ON public.payments FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access invoices" ON public.invoices;
CREATE POLICY "Admins full access invoices" ON public.invoices FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access invoice_items" ON public.invoice_items;
CREATE POLICY "Admins full access invoice_items" ON public.invoice_items FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access reviews" ON public.reviews;
CREATE POLICY "Admins full access reviews" ON public.reviews FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access notifications" ON public.notifications;
CREATE POLICY "Admins full access notifications" ON public.notifications FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access contact_messages" ON public.contact_messages;
CREATE POLICY "Admins full access contact_messages" ON public.contact_messages FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access quote_requests" ON public.quote_requests;
CREATE POLICY "Admins full access quote_requests" ON public.quote_requests FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access leads" ON public.leads;
CREATE POLICY "Admins full access leads" ON public.leads FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access email_logs" ON public.email_logs;
CREATE POLICY "Admins full access email_logs" ON public.email_logs FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access audit_logs" ON public.audit_logs;
CREATE POLICY "Admins full access audit_logs" ON public.audit_logs FOR ALL USING (public.is_admin());
