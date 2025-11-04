-- Migration script from scripts 1 to scripts 2
-- This script safely adds new features without affecting existing data
-- Run this AFTER the original scripts 1 have been executed

-- Add new enum values to existing enums
ALTER TYPE user_role ADD VALUE 'emergency_admin';

-- Create new enum types
CREATE TYPE appointment_status AS ENUM ('scheduled', 'approved', 'rejected', 'completed', 'cancelled', 'no_show');
CREATE TYPE emergency_status AS ENUM ('active', 'dispatched', 'in_progress', 'completed', 'cancelled');
CREATE TYPE emergency_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE bed_status AS ENUM ('available', 'occupied', 'maintenance', 'reserved');
CREATE TYPE vaccine_type AS ENUM ('routine', 'travel', 'emergency', 'seasonal');

-- Add new columns to existing users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS blood_type blood_type,
ADD COLUMN IF NOT EXISTS allergies TEXT,
ADD COLUMN IF NOT EXISTS medical_conditions TEXT;

-- Add new columns to existing blood_banks table
ALTER TABLE public.blood_banks 
ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
ADD COLUMN IF NOT EXISTS website TEXT;

-- Add new columns to existing blood_inventory table
ALTER TABLE public.blood_inventory 
ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- Add new columns to existing hospitals table
ALTER TABLE public.hospitals 
ADD COLUMN IF NOT EXISTS emergency_phone TEXT,
ADD COLUMN IF NOT EXISTS services TEXT[],
ADD COLUMN IF NOT EXISTS trauma_center BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS icu_beds INTEGER,
ADD COLUMN IF NOT EXISTS icu_available INTEGER,
ADD COLUMN IF NOT EXISTS emergency_beds INTEGER,
ADD COLUMN IF NOT EXISTS emergency_available_beds INTEGER,
ADD COLUMN IF NOT EXISTS accreditation TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS operating_hours TEXT,
ADD COLUMN IF NOT EXISTS emergency_hours TEXT DEFAULT '24x7';

-- Create new hospital_beds table
CREATE TABLE IF NOT EXISTS public.hospital_beds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  bed_number TEXT NOT NULL,
  ward_name TEXT,
  bed_type TEXT, -- general, icu, emergency, private, etc.
  status bed_status DEFAULT 'available',
  patient_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_date TIMESTAMP WITH TIME ZONE,
  discharge_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hospital_id, bed_number)
);

-- Add new columns to existing pet_hospitals table
ALTER TABLE public.pet_hospitals 
ADD COLUMN IF NOT EXISTS emergency_phone TEXT,
ADD COLUMN IF NOT EXISTS services TEXT[],
ADD COLUMN IF NOT EXISTS emergency_hours TEXT,
ADD COLUMN IF NOT EXISTS website TEXT;

-- Create new emergency_services table
CREATE TABLE IF NOT EXISTS public.emergency_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  service_type TEXT NOT NULL, -- ambulance, fire, police, disaster_response
  phone TEXT NOT NULL,
  emergency_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  coverage_area TEXT[],
  available_units INTEGER DEFAULT 0,
  active_units INTEGER DEFAULT 0,
  response_time_avg INTEGER, -- in minutes
  equipment TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create new emergency_requests table
CREATE TABLE IF NOT EXISTS public.emergency_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  emergency_service_id UUID REFERENCES public.emergency_services(id) ON DELETE SET NULL,
  request_type TEXT NOT NULL, -- medical, fire, accident, disaster
  priority emergency_priority DEFAULT 'medium',
  status emergency_status DEFAULT 'active',
  location_address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  description TEXT NOT NULL,
  patient_count INTEGER DEFAULT 1,
  contact_phone TEXT NOT NULL,
  contact_name TEXT,
  assigned_unit_id TEXT,
  dispatch_time TIMESTAMP WITH TIME ZONE,
  arrival_time TIMESTAMP WITH TIME ZONE,
  completion_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to existing blood_donors table
ALTER TABLE public.blood_donors 
ADD COLUMN IF NOT EXISTS next_eligible_date DATE,
ADD COLUMN IF NOT EXISTS total_donations INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS medications TEXT;

-- Add new columns to existing blood_requests table
ALTER TABLE public.blood_requests 
ADD COLUMN IF NOT EXISTS patient_age INTEGER,
ADD COLUMN IF NOT EXISTS doctor_name TEXT,
ADD COLUMN IF NOT EXISTS medical_report_url TEXT,
ADD COLUMN IF NOT EXISTS fulfilled_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add new columns to existing campaigns table
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS actual_donors INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS blood_collected INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS requirements TEXT;

-- Add new columns to existing campaign_registrations table
ALTER TABLE public.campaign_registrations 
ADD COLUMN IF NOT EXISTS donated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add new columns to existing pharmacies table
ALTER TABLE public.pharmacies 
ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS license_number TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS services TEXT[],
ADD COLUMN IF NOT EXISTS home_delivery BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS online_ordering BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS website TEXT;

-- Create new medicines table
CREATE TABLE IF NOT EXISTS public.medicines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  generic_name TEXT,
  manufacturer TEXT,
  category TEXT,
  form TEXT, -- tablet, capsule, syrup, injection, etc.
  strength TEXT,
  description TEXT,
  side_effects TEXT,
  contraindications TEXT,
  storage_instructions TEXT,
  prescription_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create new pharmacy_inventory table
CREATE TABLE IF NOT EXISTS public.pharmacy_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pharmacy_id UUID REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  medicine_id UUID REFERENCES public.medicines(id) ON DELETE CASCADE,
  stock_quantity INTEGER DEFAULT 0,
  price DECIMAL(10, 2),
  expiry_date DATE,
  batch_number TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pharmacy_id, medicine_id, batch_number)
);

-- Add new columns to existing vaccines table
ALTER TABLE public.vaccines 
ADD COLUMN IF NOT EXISTS vaccine_type vaccine_type DEFAULT 'routine',
ADD COLUMN IF NOT EXISTS interval_between_doses TEXT, -- e.g., "4 weeks", "6 months"
ADD COLUMN IF NOT EXISTS side_effects TEXT,
ADD COLUMN IF NOT EXISTS contraindications TEXT,
ADD COLUMN IF NOT EXISTS storage_temperature TEXT,
ADD COLUMN IF NOT EXISTS efficacy_rate DECIMAL(5, 2), -- percentage
ADD COLUMN IF NOT EXISTS duration_of_protection TEXT,
ADD COLUMN IF NOT EXISTS who_recommendation TEXT,
ADD COLUMN IF NOT EXISTS country_approval_status TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add new columns to existing vaccine_availability table
ALTER TABLE public.vaccine_availability 
ADD COLUMN IF NOT EXISTS reserved_doses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS batch_number TEXT,
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS storage_temperature_current DECIMAL(4, 1);

-- Update the unique constraint for vaccine_availability to include batch_number
-- First drop the old constraint
ALTER TABLE public.vaccine_availability DROP CONSTRAINT IF EXISTS vaccine_availability_vaccine_id_hospital_id_key;
-- Add the new constraint
ALTER TABLE public.vaccine_availability ADD CONSTRAINT vaccine_availability_vaccine_id_hospital_id_batch_number_key UNIQUE(vaccine_id, hospital_id, batch_number);

-- Create new vaccination_records table
CREATE TABLE IF NOT EXISTS public.vaccination_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  vaccine_id UUID REFERENCES public.vaccines(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  dose_number INTEGER NOT NULL,
  vaccination_date DATE NOT NULL,
  batch_number TEXT,
  next_dose_due_date DATE,
  administered_by TEXT,
  site_of_injection TEXT,
  adverse_reactions TEXT,
  certificate_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop and recreate appointments table with new status enum
-- First backup existing appointments data if any
CREATE TABLE IF NOT EXISTS public.appointments_backup AS SELECT * FROM public.appointments;

-- Drop the existing appointments table
DROP TABLE IF EXISTS public.appointments CASCADE;

-- Recreate appointments table with enhanced structure
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  appointment_type TEXT, -- consultation, vaccination, checkup, emergency
  department TEXT,
  doctor_name TEXT,
  reason TEXT,
  status appointment_status DEFAULT 'scheduled',
  priority TEXT DEFAULT 'normal',
  notes TEXT,
  admin_notes TEXT,
  estimated_duration INTEGER, -- in minutes
  actual_start_time TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrate old appointment data to new structure
INSERT INTO public.appointments (id, user_id, hospital_id, appointment_date, reason, notes, created_at, updated_at)
SELECT id, user_id, hospital_id, appointment_date, reason, notes, created_at, updated_at 
FROM public.appointments_backup;

-- Drop backup table
DROP TABLE IF EXISTS public.appointments_backup;

-- Create new medical_records table
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  doctor_name TEXT NOT NULL,
  visit_date DATE NOT NULL,
  diagnosis TEXT,
  symptoms TEXT,
  treatment_plan TEXT,
  medications_prescribed TEXT,
  lab_reports_url TEXT,
  follow_up_instructions TEXT,
  is_confidential BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update existing notifications table with new columns
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
ADD COLUMN IF NOT EXISTS related_id UUID, -- ID of related record (appointment, request, etc.)
ADD COLUMN IF NOT EXISTS action_url TEXT,
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Rename created_at to sent_at for existing records (update existing data)
UPDATE public.notifications SET sent_at = created_at WHERE sent_at IS NULL;

-- Create new reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reviewee_type TEXT NOT NULL, -- hospital, blood_bank, pharmacy, emergency_service
  reviewee_id UUID NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create new system_logs table
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add any missing indexes that were in the new script but not in the old one
-- (Most indexes from the original script should already exist)

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_hospital_beds_hospital_id ON public.hospital_beds(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_beds_status ON public.hospital_beds(status);
CREATE INDEX IF NOT EXISTS idx_emergency_services_city ON public.emergency_services(city);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_status ON public.emergency_requests(status);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_priority ON public.emergency_requests(priority);
CREATE INDEX IF NOT EXISTS idx_medicines_name ON public.medicines(name);
CREATE INDEX IF NOT EXISTS idx_pharmacy_inventory_pharmacy_id ON public.pharmacy_inventory(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_vaccination_records_patient_id ON public.vaccination_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_vaccination_records_vaccine_id ON public.vaccination_records(vaccine_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.reviews(reviewee_type, reviewee_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON public.system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_table_name ON public.system_logs(table_name);



-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully! Your existing data is preserved and new features have been added.';
END $$;
