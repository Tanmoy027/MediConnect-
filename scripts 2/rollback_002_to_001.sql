-- Rollback script for migration from scripts 1 to scripts 2
-- WARNING: This will remove all new features and data added after migration
-- Use with caution and ensure you have backups

-- Drop new tables (in reverse order due to dependencies)
DROP TABLE IF EXISTS public.system_logs CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.medical_records CASCADE;
DROP TABLE IF EXISTS public.vaccination_records CASCADE;
DROP TABLE IF EXISTS public.pharmacy_inventory CASCADE;
DROP TABLE IF EXISTS public.medicines CASCADE;
DROP TABLE IF EXISTS public.emergency_requests CASCADE;
DROP TABLE IF EXISTS public.emergency_services CASCADE;
DROP TABLE IF EXISTS public.hospital_beds CASCADE;

-- Remove new columns from existing tables
ALTER TABLE public.notifications 
DROP COLUMN IF EXISTS priority,
DROP COLUMN IF EXISTS related_id,
DROP COLUMN IF EXISTS action_url,
DROP COLUMN IF EXISTS sent_at,
DROP COLUMN IF EXISTS read_at,
DROP COLUMN IF EXISTS expires_at;

-- Restore appointments table to original structure
CREATE TABLE IF NOT EXISTS public.appointments_temp AS SELECT * FROM public.appointments;

DROP TABLE IF EXISTS public.appointments CASCADE;

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrate back old appointment data
INSERT INTO public.appointments (id, user_id, hospital_id, appointment_date, reason, notes, created_at, updated_at)
SELECT id, user_id, hospital_id, appointment_date, reason, notes, created_at, updated_at 
FROM public.appointments_temp
WHERE id IS NOT NULL;

DROP TABLE IF EXISTS public.appointments_temp;

-- Remove new columns from vaccine_availability
ALTER TABLE public.vaccine_availability 
DROP COLUMN IF EXISTS reserved_doses,
DROP COLUMN IF EXISTS batch_number,
DROP COLUMN IF EXISTS expiry_date,
DROP COLUMN IF EXISTS storage_temperature_current;

-- Restore original unique constraint
ALTER TABLE public.vaccine_availability DROP CONSTRAINT IF EXISTS vaccine_availability_vaccine_id_hospital_id_batch_number_key;
ALTER TABLE public.vaccine_availability ADD CONSTRAINT vaccine_availability_vaccine_id_hospital_id_key UNIQUE(vaccine_id, hospital_id);

-- Remove new columns from vaccines
ALTER TABLE public.vaccines 
DROP COLUMN IF EXISTS vaccine_type,
DROP COLUMN IF EXISTS interval_between_doses,
DROP COLUMN IF EXISTS side_effects,
DROP COLUMN IF EXISTS contraindications,
DROP COLUMN IF EXISTS storage_temperature,
DROP COLUMN IF EXISTS efficacy_rate,
DROP COLUMN IF EXISTS duration_of_protection,
DROP COLUMN IF EXISTS who_recommendation,
DROP COLUMN IF EXISTS country_approval_status,
DROP COLUMN IF EXISTS is_active,
DROP COLUMN IF EXISTS updated_at;

-- Remove new columns from pharmacies
ALTER TABLE public.pharmacies 
DROP COLUMN IF EXISTS admin_id,
DROP COLUMN IF EXISTS license_number,
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS services,
DROP COLUMN IF EXISTS home_delivery,
DROP COLUMN IF EXISTS online_ordering,
DROP COLUMN IF EXISTS website;

-- Remove new columns from campaign_registrations
ALTER TABLE public.campaign_registrations 
DROP COLUMN IF EXISTS donated,
DROP COLUMN IF EXISTS notes;

-- Remove new columns from campaigns
ALTER TABLE public.campaigns 
DROP COLUMN IF EXISTS actual_donors,
DROP COLUMN IF EXISTS blood_collected,
DROP COLUMN IF EXISTS contact_email,
DROP COLUMN IF EXISTS requirements;

-- Remove new columns from blood_requests
ALTER TABLE public.blood_requests 
DROP COLUMN IF EXISTS patient_age,
DROP COLUMN IF EXISTS doctor_name,
DROP COLUMN IF EXISTS medical_report_url,
DROP COLUMN IF EXISTS fulfilled_date,
DROP COLUMN IF EXISTS notes;

-- Remove new columns from blood_donors
ALTER TABLE public.blood_donors 
DROP COLUMN IF EXISTS next_eligible_date,
DROP COLUMN IF EXISTS total_donations,
DROP COLUMN IF EXISTS medications;

-- Remove new columns from pet_hospitals
ALTER TABLE public.pet_hospitals 
DROP COLUMN IF EXISTS emergency_phone,
DROP COLUMN IF EXISTS services,
DROP COLUMN IF EXISTS emergency_hours,
DROP COLUMN IF EXISTS website;

-- Remove new columns from hospitals
ALTER TABLE public.hospitals 
DROP COLUMN IF EXISTS emergency_phone,
DROP COLUMN IF EXISTS services,
DROP COLUMN IF EXISTS trauma_center,
DROP COLUMN IF EXISTS icu_beds,
DROP COLUMN IF EXISTS icu_available,
DROP COLUMN IF EXISTS emergency_beds,
DROP COLUMN IF EXISTS emergency_available_beds,
DROP COLUMN IF EXISTS accreditation,
DROP COLUMN IF EXISTS website,
DROP COLUMN IF EXISTS operating_hours,
DROP COLUMN IF EXISTS emergency_hours;

-- Remove new columns from blood_inventory
ALTER TABLE public.blood_inventory 
DROP COLUMN IF EXISTS expiry_date;

-- Remove new columns from blood_banks
ALTER TABLE public.blood_banks 
DROP COLUMN IF EXISTS emergency_contact,
DROP COLUMN IF EXISTS website;

-- Remove new columns from users
ALTER TABLE public.users 
DROP COLUMN IF EXISTS date_of_birth,
DROP COLUMN IF EXISTS gender,
DROP COLUMN IF EXISTS emergency_contact_name,
DROP COLUMN IF EXISTS emergency_contact_phone,
DROP COLUMN IF EXISTS blood_type,
DROP COLUMN IF EXISTS allergies,
DROP COLUMN IF EXISTS medical_conditions;

-- Drop new enum types
DROP TYPE IF EXISTS vaccine_type CASCADE;
DROP TYPE IF EXISTS bed_status CASCADE;
DROP TYPE IF EXISTS emergency_priority CASCADE;
DROP TYPE IF EXISTS emergency_status CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;

-- Note: Cannot remove enum values from existing enums in PostgreSQL
-- The 'emergency_admin' value will remain in user_role enum

-- Drop new indexes
DROP INDEX IF EXISTS idx_hospital_beds_hospital_id;
DROP INDEX IF EXISTS idx_hospital_beds_status;
DROP INDEX IF EXISTS idx_emergency_services_city;
DROP INDEX IF EXISTS idx_emergency_requests_status;
DROP INDEX IF EXISTS idx_emergency_requests_priority;
DROP INDEX IF EXISTS idx_medicines_name;
DROP INDEX IF EXISTS idx_pharmacy_inventory_pharmacy_id;
DROP INDEX IF EXISTS idx_vaccination_records_patient_id;
DROP INDEX IF EXISTS idx_vaccination_records_vaccine_id;
DROP INDEX IF EXISTS idx_appointments_status;
DROP INDEX IF EXISTS idx_appointments_date;
DROP INDEX IF EXISTS idx_medical_records_patient_id;
DROP INDEX IF EXISTS idx_reviews_reviewee;
DROP INDEX IF EXISTS idx_system_logs_user_id;
DROP INDEX IF EXISTS idx_system_logs_table_name;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Rollback completed! Database has been restored to scripts 1 structure.';
    RAISE WARNING 'Note: Any data in the new columns/tables has been permanently lost.';
END $$;
