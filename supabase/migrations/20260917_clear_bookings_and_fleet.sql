-- ==============================================================================
-- PLUMBERINDORE DATABASE RESET & FLEET CONSOLIDATION SCRIPT
-- Target: hnawwvxvfdnkmwtytwre (https://hnawwvxvfdnkmwtytwre.supabase.co)
-- Description:
--   1. Clears all booking records, order line items, technician assignments,
--      status history, invoices, and payments from 'Bookings & Dispatch' (0 bookings).
--   2. Deletes all technician records except for Pankaj Sharma and Ajay Mahajan.
--   3. Guarantees profiles, contact details, and assigned operational corridors
--      for Pankaj Sharma and Ajay Mahajan remain 100% intact.
--   4. Resets customer lifetime booking counters to 0.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. CLEAR ALL BOOKINGS & DISPATCH RECORDS ENTIRELY
-- ------------------------------------------------------------------------------
TRUNCATE TABLE 
    public.bookings,
    public.booking_items,
    public.technician_assignments,
    public.booking_status_history,
    public.payments,
    public.invoices,
    public.invoice_items
RESTART IDENTITY CASCADE;

-- Reset customer booking counters
UPDATE public.customers 
SET total_bookings = 0;

-- ------------------------------------------------------------------------------
-- 2. PURGE TECHNICIANS EXCEPT AJAY MAHAJAN & PANKAJ SHARMA
-- ------------------------------------------------------------------------------
DELETE FROM public.technicians
WHERE phone NOT IN ('+91 84595 59141', '+91 98267 43299', '8459559141', '9826743299')
  AND title NOT ILIKE '%Ajay Mahajan%'
  AND title NOT ILIKE '%Pankaj Sharma%';

-- ------------------------------------------------------------------------------
-- 3. ENSURE AJAY MAHAJAN & PANKAJ SHARMA PROFILES EXIST WITH INTACT DETAILS
-- ------------------------------------------------------------------------------
INSERT INTO public.technicians (
    title,
    phone,
    rating,
    repairs_count,
    photo_url,
    vehicle_number,
    eta,
    is_active
)
VALUES (
    'Ajay Mahajan (Lead Plumber & Sanitary Tech - South Corridor)',
    '+91 84595 59141',
    4.96,
    610,
    'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=200&h=200&q=80',
    'Service Bike (MP 09 MD 8821)',
    'Prompt Arrival',
    TRUE
)
ON CONFLICT (phone) DO UPDATE 
SET 
    title = EXCLUDED.title,
    rating = EXCLUDED.rating,
    repairs_count = EXCLUDED.repairs_count,
    photo_url = EXCLUDED.photo_url,
    vehicle_number = EXCLUDED.vehicle_number,
    eta = EXCLUDED.eta,
    is_active = TRUE;

INSERT INTO public.technicians (
    title,
    phone,
    rating,
    repairs_count,
    photo_url,
    vehicle_number,
    eta,
    is_active
)
VALUES (
    'Pankaj Sharma (Bicholi & Bypass Lead Technician)',
    '+91 98267 43299',
    4.94,
    390,
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80',
    'Service Bike (MP 09 BM 4329)',
    'Prompt Arrival',
    TRUE
)
ON CONFLICT (phone) DO UPDATE 
SET 
    title = EXCLUDED.title,
    rating = EXCLUDED.rating,
    repairs_count = EXCLUDED.repairs_count,
    photo_url = EXCLUDED.photo_url,
    vehicle_number = EXCLUDED.vehicle_number,
    eta = EXCLUDED.eta,
    is_active = TRUE;

COMMIT;

-- ==============================================================================
-- VERIFICATION CHECK QUERY
-- ==============================================================================
-- SELECT 
--     (SELECT COUNT(*) FROM public.bookings) AS total_bookings_remaining,
--     (SELECT COUNT(*) FROM public.technicians WHERE is_active = TRUE) AS active_technicians_count;
