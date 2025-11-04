-- Add blood bank setup requirement tracking
ALTER TABLE blood_banks 
ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS setup_completed_at TIMESTAMP WITH TIME ZONE;

-- Create blood bank setup status table for tracking first-time setup
CREATE TABLE IF NOT EXISTS public.blood_bank_setup_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blood_bank_id UUID REFERENCES public.blood_banks(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  setup_completed BOOLEAN DEFAULT false,
  setup_completed_at TIMESTAMP WITH TIME ZONE,
  first_inventory_added BOOLEAN DEFAULT false,
  first_campaign_created BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blood_bank_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_blood_bank_setup_admin ON public.blood_bank_setup_status(admin_id);
