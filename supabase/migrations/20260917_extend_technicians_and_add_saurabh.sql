-- ==============================================================================
-- SUPABASE MIGRATION: EXTEND TECHNICIAN METADATA & REGISTER SAURABH ELECTRICIAN
-- Target: hnawwvxvfdnkmwtytwre (https://hnawwvxvfdnkmwtytwre.supabase.co)
-- Description:
--   1. Adds 3 metadata fields to public.technicians:
--      - service_area (Coverage territory)
--      - located_in (Current residential locality)
--      - specialization (Skills / trades)
--   2. Inserts / Upserts Saurabh Electrician (+917869709526)
--   3. Guarantees Ajay Mahajan and Pankaj Sharma retain their records and have
--      the 3 new metadata attributes populated.
--   4. Configures permissive RLS UPDATE policy on public.bookings and public.technicians
--      so dashboard actions persist reliably without RLS rejection.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. ADD 3 METADATA ATTRIBUTES TO TECHNICIANS SCHEMA
-- ------------------------------------------------------------------------------
ALTER TABLE public.technicians 
    ADD COLUMN IF NOT EXISTS service_area TEXT DEFAULT 'All over Indore',
    ADD COLUMN IF NOT EXISTS located_in VARCHAR(100) DEFAULT 'Indore',
    ADD COLUMN IF NOT EXISTS specialization TEXT DEFAULT 'General Maintenance',
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Available';

-- ------------------------------------------------------------------------------
-- 2. ENSURE ALL 3 FIELD FLEET PROFILES ARE REGISTERED & POPULATED
-- ------------------------------------------------------------------------------

-- Ajay Mahajan (South Corridor Lead)
INSERT INTO public.technicians (
    title,
    phone,
    rating,
    repairs_count,
    photo_url,
    vehicle_number,
    eta,
    is_active,
    status,
    located_in,
    service_area,
    specialization
)
VALUES (
    'Ajay Mahajan (Lead Plumber & Sanitary Tech - South Corridor)',
    '+91 84595 59141',
    4.96,
    610,
    'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=200&h=200&q=80',
    'Service Bike (MP 09 MD 8821)',
    'Prompt Arrival',
    TRUE,
    'Available',
    'Rau / Bhawarkua',
    'Rau, Mhow, Bhawarkua, Bijalpur, Rajendra Nagar, Sudama Nagar, Tejaji Nagar, Nimbodi',
    'Plumbing, Leakages & Sanitary Fixtures'
)
ON CONFLICT (phone) DO UPDATE 
SET 
    title = EXCLUDED.title,
    rating = EXCLUDED.rating,
    repairs_count = EXCLUDED.repairs_count,
    photo_url = EXCLUDED.photo_url,
    vehicle_number = EXCLUDED.vehicle_number,
    eta = EXCLUDED.eta,
    is_active = TRUE,
    status = 'Available',
    located_in = EXCLUDED.located_in,
    service_area = EXCLUDED.service_area,
    specialization = EXCLUDED.specialization;

-- Pankaj Sharma (East Bypass Corridor Lead)
INSERT INTO public.technicians (
    title,
    phone,
    rating,
    repairs_count,
    photo_url,
    vehicle_number,
    eta,
    is_active,
    status,
    located_in,
    service_area,
    specialization
)
VALUES (
    'Pankaj Sharma (Bicholi & Bypass Lead Technician)',
    '+91 98267 43299',
    4.94,
    390,
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80',
    'Service Bike (MP 09 BM 4329)',
    'Prompt Arrival',
    TRUE,
    'Available',
    'Bicholi Mardana',
    'Bicholi Mardana, Bicholi Hapsi, Silicon City, Bypass',
    'Plumbing, Water Motors & Pipeline Overhauls'
)
ON CONFLICT (phone) DO UPDATE 
SET 
    title = EXCLUDED.title,
    rating = EXCLUDED.rating,
    repairs_count = EXCLUDED.repairs_count,
    photo_url = EXCLUDED.photo_url,
    vehicle_number = EXCLUDED.vehicle_number,
    eta = EXCLUDED.eta,
    is_active = TRUE,
    status = 'Available',
    located_in = EXCLUDED.located_in,
    service_area = EXCLUDED.service_area,
    specialization = EXCLUDED.specialization;

-- Saurabh Electrician (Master Electrician & POP Specialist)
INSERT INTO public.technicians (
    title,
    phone,
    rating,
    repairs_count,
    photo_url,
    vehicle_number,
    eta,
    is_active,
    status,
    located_in,
    service_area,
    specialization
)
VALUES (
    'Saurabh Electrician (Senior Master Electrician & POP Specialist)',
    '+917869709526',
    4.98,
    420,
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&h=200&q=80',
    'Service Bike (MP 09 EA 7869)',
    'Prompt Arrival',
    TRUE,
    'Available',
    'Vijay Nagar',
    'All over Indore',
    'Electrician, POP and False Ceiling'
)
ON CONFLICT (phone) DO UPDATE 
SET 
    title = EXCLUDED.title,
    rating = EXCLUDED.rating,
    repairs_count = EXCLUDED.repairs_count,
    photo_url = EXCLUDED.photo_url,
    vehicle_number = EXCLUDED.vehicle_number,
    eta = EXCLUDED.eta,
    is_active = TRUE,
    status = 'Available',
    located_in = EXCLUDED.located_in,
    service_area = EXCLUDED.service_area,
    specialization = EXCLUDED.specialization;

-- ------------------------------------------------------------------------------
-- 3. PERMISSIVE ROW LEVEL SECURITY POLICIES FOR PORTAL DISPATCH & UPDATES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public update access bookings" ON public.bookings;
CREATE POLICY "Public update access bookings" ON public.bookings 
    FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read access technicians" ON public.technicians;
CREATE POLICY "Public read access technicians" ON public.technicians 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public update access technicians" ON public.technicians;
CREATE POLICY "Public update access technicians" ON public.technicians 
    FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert access technicians" ON public.technicians;
CREATE POLICY "Public insert access technicians" ON public.technicians 
    FOR INSERT WITH CHECK (true);

COMMIT;
