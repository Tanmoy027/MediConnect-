-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccine_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccination_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Super admins can manage all users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Blood Banks policies
CREATE POLICY "Anyone can view active blood banks" ON public.blood_banks
  FOR SELECT USING (is_active = true);

CREATE POLICY "Blood bank admins can manage their bank" ON public.blood_banks
  FOR ALL USING (admin_id = auth.uid());

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

CREATE POLICY "Super admins can manage all inventory" ON public.blood_inventory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Hospitals policies
CREATE POLICY "Anyone can view active hospitals" ON public.hospitals
  FOR SELECT USING (is_active = true);

CREATE POLICY "Hospital admins can manage their hospital" ON public.hospitals
  FOR ALL USING (admin_id = auth.uid());

CREATE POLICY "Super admins can manage all hospitals" ON public.hospitals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Hospital Beds policies
CREATE POLICY "Anyone can view hospital beds" ON public.hospital_beds
  FOR SELECT USING (true);

CREATE POLICY "Hospital admins can manage their beds" ON public.hospital_beds
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.hospitals 
      WHERE id = hospital_id AND admin_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage all beds" ON public.hospital_beds
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Pet Hospitals policies
CREATE POLICY "Anyone can view active pet hospitals" ON public.pet_hospitals
  FOR SELECT USING (is_active = true);

CREATE POLICY "Pet hospital admins can manage their hospital" ON public.pet_hospitals
  FOR ALL USING (admin_id = auth.uid());

CREATE POLICY "Super admins can manage all pet hospitals" ON public.pet_hospitals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Emergency Services policies
CREATE POLICY "Anyone can view active emergency services" ON public.emergency_services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Emergency admins can manage their service" ON public.emergency_services
  FOR ALL USING (admin_id = auth.uid());

CREATE POLICY "Super admins can manage all emergency services" ON public.emergency_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Emergency Requests policies
CREATE POLICY "Users can view their own emergency requests" ON public.emergency_requests
  FOR SELECT USING (requester_id = auth.uid());

CREATE POLICY "Users can create emergency requests" ON public.emergency_requests
  FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Emergency admins can view requests for their service" ON public.emergency_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.emergency_services 
      WHERE id = emergency_service_id AND admin_id = auth.uid()
    )
  );

CREATE POLICY "Emergency admins can update requests for their service" ON public.emergency_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.emergency_services 
      WHERE id = emergency_service_id AND admin_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage all emergency requests" ON public.emergency_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Blood Donors policies
CREATE POLICY "Users can view their own donor profile" ON public.blood_donors
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own donor profile" ON public.blood_donors
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Blood bank admins can view donors" ON public.blood_donors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'blood_bank_admin'
    )
  );

CREATE POLICY "Super admins can manage all donors" ON public.blood_donors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Blood Requests policies
CREATE POLICY "Users can view their own blood requests" ON public.blood_requests
  FOR SELECT USING (requester_id = auth.uid());

CREATE POLICY "Users can create blood requests" ON public.blood_requests
  FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update their own blood requests" ON public.blood_requests
  FOR UPDATE USING (requester_id = auth.uid());

CREATE POLICY "Blood bank admins can view all requests" ON public.blood_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'blood_bank_admin'
    )
  );

CREATE POLICY "Super admins can manage all blood requests" ON public.blood_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Campaigns policies
CREATE POLICY "Anyone can view active campaigns" ON public.campaigns
  FOR SELECT USING (true);

CREATE POLICY "Users can create campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Organizers can manage their campaigns" ON public.campaigns
  FOR ALL USING (organizer_id = auth.uid());

CREATE POLICY "Blood bank admins can manage campaigns" ON public.campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.blood_banks 
      WHERE id = blood_bank_id AND admin_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage all campaigns" ON public.campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Campaign Registrations policies
CREATE POLICY "Users can view their own registrations" ON public.campaign_registrations
  FOR SELECT USING (donor_id = auth.uid());

CREATE POLICY "Users can register for campaigns" ON public.campaign_registrations
  FOR INSERT WITH CHECK (donor_id = auth.uid());

CREATE POLICY "Campaign organizers can view registrations" ON public.campaign_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE id = campaign_id AND organizer_id = auth.uid()
    )
  );

CREATE POLICY "Campaign organizers can update registrations" ON public.campaign_registrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE id = campaign_id AND organizer_id = auth.uid()
    )
  );

-- Pharmacies policies
CREATE POLICY "Anyone can view active pharmacies" ON public.pharmacies
  FOR SELECT USING (is_active = true);

CREATE POLICY "Pharmacy admins can manage their pharmacy" ON public.pharmacies
  FOR ALL USING (admin_id = auth.uid());

CREATE POLICY "Super admins can manage all pharmacies" ON public.pharmacies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Medicines policies
CREATE POLICY "Anyone can view medicines" ON public.medicines
  FOR SELECT USING (true);

CREATE POLICY "Super admins can manage medicines" ON public.medicines
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Pharmacy Inventory policies
CREATE POLICY "Anyone can view pharmacy inventory" ON public.pharmacy_inventory
  FOR SELECT USING (true);

CREATE POLICY "Pharmacy admins can manage their inventory" ON public.pharmacy_inventory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.pharmacies 
      WHERE id = pharmacy_id AND admin_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage all pharmacy inventory" ON public.pharmacy_inventory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Vaccines policies
CREATE POLICY "Anyone can view vaccines" ON public.vaccines
  FOR SELECT USING (is_active = true);

CREATE POLICY "Super admins can manage vaccines" ON public.vaccines
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Hospital admins can create vaccines" ON public.vaccines
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'hospital_admin'
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

CREATE POLICY "Super admins can manage all vaccine availability" ON public.vaccine_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Vaccination Records policies
CREATE POLICY "Users can view their own vaccination records" ON public.vaccination_records
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Hospital admins can manage records for their hospital" ON public.vaccination_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.hospitals 
      WHERE id = hospital_id AND admin_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage all vaccination records" ON public.vaccination_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Appointments policies
CREATE POLICY "Users can view their own appointments" ON public.appointments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own appointments" ON public.appointments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Hospital admins can view appointments for their hospital" ON public.appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.hospitals 
      WHERE id = hospital_id AND admin_id = auth.uid()
    )
  );

CREATE POLICY "Hospital admins can update appointments for their hospital" ON public.appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.hospitals 
      WHERE id = hospital_id AND admin_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage all appointments" ON public.appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Medical Records policies
CREATE POLICY "Users can view their own medical records" ON public.medical_records
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Hospital admins can manage records for their hospital" ON public.medical_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.hospitals 
      WHERE id = hospital_id AND admin_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage all medical records" ON public.medical_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Super admins can manage all notifications" ON public.notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Reviews policies
CREATE POLICY "Anyone can view public reviews" ON public.reviews
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own reviews" ON public.reviews
  FOR SELECT USING (reviewer_id = auth.uid());

CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (reviewer_id = auth.uid());

CREATE POLICY "Super admins can manage all reviews" ON public.reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- System Logs policies (Admin only)
CREATE POLICY "Super admins can view system logs" ON public.system_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "System can create logs" ON public.system_logs
  FOR INSERT WITH CHECK (true);

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
