-- Simple RLS Fix for MediConnect Database
-- This fixes the infinite recursion error by using auth.users metadata
-- Run this script in your Supabase SQL editor

-- Drop ALL existing problematic policies
DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Super admins can manage all blood banks" ON public.blood_banks;
DROP POLICY IF EXISTS "Super admins can manage all inventory" ON public.blood_inventory;
DROP POLICY IF EXISTS "Super admins can manage all hospitals" ON public.hospitals;
DROP POLICY IF EXISTS "Super admins can manage all pet hospitals" ON public.pet_hospitals;
DROP POLICY IF EXISTS "Blood bank admins can manage their inventory" ON public.blood_inventory;
DROP POLICY IF EXISTS "Blood bank admins can manage their bank" ON public.blood_banks;
DROP POLICY IF EXISTS "Hospital admins can manage their hospital" ON public.hospitals;
DROP POLICY IF EXISTS "Pet hospital admins can manage their hospital" ON public.pet_hospitals;
DROP POLICY IF EXISTS "Anyone can view active blood banks" ON public.blood_banks;
DROP POLICY IF EXISTS "Anyone can view blood inventory" ON public.blood_inventory;
DROP POLICY IF EXISTS "Anyone can view active hospitals" ON public.hospitals;
DROP POLICY IF EXISTS "Anyone can view active pet hospitals" ON public.pet_hospitals;

-- Create helper functions using auth.users metadata (no circular dependency)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(raw_user_meta_data->>'role', 'normal_user') = 'super_admin'
  FROM auth.users 
  WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_hospital_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(raw_user_meta_data->>'role', 'normal_user') = 'hospital_admin'
  FROM auth.users 
  WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_blood_bank_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(raw_user_meta_data->>'role', 'normal_user') = 'blood_bank_admin'
  FROM auth.users 
  WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_pet_hospital_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(raw_user_meta_data->>'role', 'normal_user') = 'pet_hospital_admin'
  FROM auth.users 
  WHERE id = auth.uid();
$$;

-- Simple policies for users table (NO circular dependency)
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Blood Banks policies
CREATE POLICY "Anyone can view active blood banks" ON public.blood_banks
  FOR SELECT USING (is_active = true);

CREATE POLICY "Super admins can manage all blood banks" ON public.blood_banks
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "Blood bank admins can manage their own bank" ON public.blood_banks
  FOR ALL USING (public.is_blood_bank_admin() AND admin_id = auth.uid());

-- Blood Inventory policies
CREATE POLICY "Anyone can view blood inventory" ON public.blood_inventory
  FOR SELECT USING (true);

CREATE POLICY "Super admins can manage all inventory" ON public.blood_inventory
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "Blood bank admins can manage their inventory" ON public.blood_inventory
  FOR ALL USING (
    public.is_blood_bank_admin() AND 
    EXISTS (SELECT 1 FROM public.blood_banks WHERE id = blood_inventory.blood_bank_id AND admin_id = auth.uid())
  );

-- Hospitals policies
CREATE POLICY "Anyone can view active hospitals" ON public.hospitals
  FOR SELECT USING (is_active = true);

CREATE POLICY "Super admins can manage all hospitals" ON public.hospitals
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "Hospital admins can manage their own hospital" ON public.hospitals
  FOR ALL USING (public.is_hospital_admin() AND admin_id = auth.uid());

-- Pet Hospitals policies
CREATE POLICY "Anyone can view active pet hospitals" ON public.pet_hospitals
  FOR SELECT USING (is_active = true);

CREATE POLICY "Super admins can manage all pet hospitals" ON public.pet_hospitals
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "Pet hospital admins can manage their own hospital" ON public.pet_hospitals
  FOR ALL USING (public.is_pet_hospital_admin() AND admin_id = auth.uid());

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'RLS policies fixed successfully! Infinite recursion issue resolved.';
END $$;
