-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccine_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Super admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Blood Banks policies
CREATE POLICY "Anyone can view active blood banks" ON public.blood_banks
  FOR SELECT USING (is_active = true);

CREATE POLICY "Blood bank admins can update their own blood bank" ON public.blood_banks
  FOR UPDATE USING (admin_id = auth.uid());

CREATE POLICY "Super admins can manage all blood banks" ON public.blood_banks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Blood Inventory policies
CREATE POLICY "Anyone can view blood inventory" ON public.blood_inventory
  FOR SELECT USING (true);

CREATE POLICY "Blood bank admins can manage their inventory" ON public.blood_inventory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.blood_banks
      WHERE id = blood_bank_id AND admin_id = auth.uid()
    )
  );

-- Hospitals policies
CREATE POLICY "Anyone can view active hospitals" ON public.hospitals
  FOR SELECT USING (is_active = true);

CREATE POLICY "Hospital admins can update their own hospital" ON public.hospitals
  FOR UPDATE USING (admin_id = auth.uid());

CREATE POLICY "Super admins can manage all hospitals" ON public.hospitals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Pet Hospitals policies
CREATE POLICY "Anyone can view active pet hospitals" ON public.pet_hospitals
  FOR SELECT USING (is_active = true);

CREATE POLICY "Pet hospital admins can update their own hospital" ON public.pet_hospitals
  FOR UPDATE USING (admin_id = auth.uid());

CREATE POLICY "Super admins can manage all pet hospitals" ON public.pet_hospitals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Blood Donors policies
CREATE POLICY "Anyone can view available donors" ON public.blood_donors
  FOR SELECT USING (is_available = true);

CREATE POLICY "Users can manage their own donor profile" ON public.blood_donors
  FOR ALL USING (user_id = auth.uid());

-- Blood Requests policies
CREATE POLICY "Anyone can view blood requests" ON public.blood_requests
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create blood requests" ON public.blood_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their own requests" ON public.blood_requests
  FOR UPDATE USING (requester_id = auth.uid());

-- Campaigns policies
CREATE POLICY "Anyone can view active campaigns" ON public.campaigns
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their campaigns" ON public.campaigns
  FOR UPDATE USING (organizer_id = auth.uid());

-- Campaign Registrations policies
CREATE POLICY "Users can view their registrations" ON public.campaign_registrations
  FOR SELECT USING (donor_id = auth.uid());

CREATE POLICY "Users can register for campaigns" ON public.campaign_registrations
  FOR INSERT WITH CHECK (auth.uid() = donor_id);

-- Pharmacies policies
CREATE POLICY "Anyone can view active pharmacies" ON public.pharmacies
  FOR SELECT USING (is_active = true);

CREATE POLICY "Super admins can manage pharmacies" ON public.pharmacies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Vaccines policies
CREATE POLICY "Anyone can view vaccines" ON public.vaccines
  FOR SELECT USING (true);

CREATE POLICY "Super admins can manage vaccines" ON public.vaccines
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Vaccine Availability policies
CREATE POLICY "Anyone can view vaccine availability" ON public.vaccine_availability
  FOR SELECT USING (true);

CREATE POLICY "Hospital admins can manage their vaccine availability" ON public.vaccine_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.hospitals
      WHERE id = hospital_id AND admin_id = auth.uid()
    )
  );

-- Appointments policies
CREATE POLICY "Users can view their own appointments" ON public.appointments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their appointments" ON public.appointments
  FOR UPDATE USING (user_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());
