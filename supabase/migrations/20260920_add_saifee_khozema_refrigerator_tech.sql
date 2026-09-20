-- ==============================================================================
-- SUPABASE MIGRATION: REGISTER SAIFEE KHOZEMA (REFRIGERATOR SPECIALIST)
-- Target: hnawwvxvfdnkmwtytwre (https://hnawwvxvfdnkmwtytwre.supabase.co)
-- Description:
--   Inserts / Upserts Saifee Khozema (+91 98267 27487 / 9826727487)
--   Specialty: Refrigerator Repair Work
--   Residence / Base Location: Khatiwala Tank, Indore, Madhya Pradesh
--   Service Coverage: All areas (provides home services across the city)
-- ==============================================================================

BEGIN;

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
    'Saifee Khozema (Senior Refrigerator & Cold Appliance Specialist)',
    '+91 98267 27487',
    4.97,
    380,
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&h=200&q=80',
    'Service Bike (MP 09 SK 2748)',
    'Prompt Arrival',
    TRUE,
    'Available',
    'Khatiwala Tank, Indore, Madhya Pradesh',
    'All areas (provides home services across the city)',
    'Refrigerator Repair Work'
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

COMMIT;
