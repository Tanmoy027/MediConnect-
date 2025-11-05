-- Add admin_notes field to appointments table
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add indexes for better performance on appointments
CREATE INDEX IF NOT EXISTS idx_appointments_hospital_id ON public.appointments(hospital_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);

-- Add indexes for vaccine tables
CREATE INDEX IF NOT EXISTS idx_vaccine_availability_hospital_id ON public.vaccine_availability(hospital_id);
CREATE INDEX IF NOT EXISTS idx_vaccine_availability_vaccine_id ON public.vaccine_availability(vaccine_id);
CREATE INDEX IF NOT EXISTS idx_vaccines_name ON public.vaccines(name);
