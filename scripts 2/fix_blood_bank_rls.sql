-- Fix Blood Banks RLS policy to allow INSERT for blood bank admins
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Blood bank admins can update their own blood bank" ON public.blood_banks;
DROP POLICY IF EXISTS "Blood bank admins can manage their bank" ON public.blood_banks;

-- Create a new comprehensive policy that allows INSERT and UPDATE
CREATE POLICY "Blood bank admins can create and manage their bank" ON public.blood_banks
  FOR INSERT WITH CHECK (
    admin_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'blood_bank_admin'
    )
  );

CREATE POLICY "Blood bank admins can view and update their bank" ON public.blood_banks
  FOR UPDATE USING (admin_id = auth.uid());

CREATE POLICY "Blood bank admins can read their bank" ON public.blood_banks
  FOR SELECT USING (admin_id = auth.uid() OR is_active = true);
