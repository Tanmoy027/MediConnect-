-- Fix for infinite recursion in RLS policies
-- This fixes the circular dependency issue in public.users table policies

-- Drop ALL existing problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Super admins can manage all blood banks" ON public.blood_banks;
DROP POLICY IF EXISTS "Super admins can manage all inventory" ON public.blood_inventory;
DROP POLICY IF EXISTS "Super admins can manage all hospitals" ON public.hospitals;
DROP POLICY IF EXISTS "Super admins can manage all pet hospitals" ON public.pet_hospitals;
DROP POLICY IF EXISTS "Blood bank admins can manage their inventory" ON public.blood_inventory;

-- Drop policies for tables that may not exist yet
DROP POLICY IF EXISTS "Super admins can manage all beds" ON public.hospital_beds;
DROP POLICY IF EXISTS "Hospital admins can manage their beds" ON public.hospital_beds;
DROP POLICY IF EXISTS "Super admins can manage all emergency services" ON public.emergency_services;
DROP POLICY IF EXISTS "Emergency admins can manage their own services" ON public.emergency_services;

-- Create helper functions to check roles from auth.users metadata (no circular dependency)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(raw_user_meta_data->>'role', 'normal_user')::TEXT 
  FROM auth.users 
  WHERE id = auth.uid();
$$;

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

-- Create simple policies without circular dependencies for users table
-- Users can only view and update their own profile
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for other tables using the helper functions
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

-- Add policies for tables that exist (hospital_beds, emergency_services will be added when tables are created)
-- These policies will only be created if the tables exist

-- Create policies for hospital_beds table (only if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hospital_beds') THEN
        EXECUTE 'CREATE POLICY "Super admins can manage all beds" ON public.hospital_beds FOR ALL USING (public.is_super_admin())';
        EXECUTE 'CREATE POLICY "Hospital admins can manage their beds" ON public.hospital_beds FOR ALL USING (public.is_hospital_admin() AND EXISTS (SELECT 1 FROM public.hospitals WHERE id = hospital_beds.hospital_id AND admin_id = auth.uid()))';
    END IF;
END$$;

-- Create policies for emergency_services table (only if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'emergency_services') THEN
        EXECUTE 'CREATE POLICY "Super admins can manage all emergency services" ON public.emergency_services FOR ALL USING (public.is_super_admin())';
        EXECUTE 'CREATE POLICY "Emergency admins can manage their own services" ON public.emergency_services FOR ALL USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND COALESCE(raw_user_meta_data->>''role'', ''normal_user'') = ''emergency_admin'') AND admin_id = auth.uid())';
    END IF;
END$$;
