-- Performance Indexes for MediConnect Database
-- Run this after creating tables to optimize query performance

-- User table indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_city ON public.users(city);
CREATE INDEX IF NOT EXISTS idx_users_state ON public.users(state);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_blood_type ON public.users(blood_type);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- Blood Banks indexes
CREATE INDEX IF NOT EXISTS idx_blood_banks_city ON public.blood_banks(city);
CREATE INDEX IF NOT EXISTS idx_blood_banks_state ON public.blood_banks(state);
CREATE INDEX IF NOT EXISTS idx_blood_banks_admin_id ON public.blood_banks(admin_id);
CREATE INDEX IF NOT EXISTS idx_blood_banks_is_active ON public.blood_banks(is_active);
CREATE INDEX IF NOT EXISTS idx_blood_banks_is_verified ON public.blood_banks(is_verified);
CREATE INDEX IF NOT EXISTS idx_blood_banks_location ON public.blood_banks(latitude, longitude);

-- Blood Inventory indexes
CREATE INDEX IF NOT EXISTS idx_blood_inventory_blood_bank_id ON public.blood_inventory(blood_bank_id);
CREATE INDEX IF NOT EXISTS idx_blood_inventory_blood_type ON public.blood_inventory(blood_type);
CREATE INDEX IF NOT EXISTS idx_blood_inventory_units_available ON public.blood_inventory(units_available);

-- Hospitals indexes
CREATE INDEX IF NOT EXISTS idx_hospitals_city ON public.hospitals(city);
CREATE INDEX IF NOT EXISTS idx_hospitals_state ON public.hospitals(state);
CREATE INDEX IF NOT EXISTS idx_hospitals_admin_id ON public.hospitals(admin_id);
CREATE INDEX IF NOT EXISTS idx_hospitals_emergency_available ON public.hospitals(emergency_available);
CREATE INDEX IF NOT EXISTS idx_hospitals_is_active ON public.hospitals(is_active);
CREATE INDEX IF NOT EXISTS idx_hospitals_is_verified ON public.hospitals(is_verified);
CREATE INDEX IF NOT EXISTS idx_hospitals_location ON public.hospitals(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_hospitals_specialties ON public.hospitals USING GIN(specialties);

-- Hospital Beds indexes
CREATE INDEX IF NOT EXISTS idx_hospital_beds_hospital_id ON public.hospital_beds(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_beds_status ON public.hospital_beds(status);
CREATE INDEX IF NOT EXISTS idx_hospital_beds_patient_id ON public.hospital_beds(patient_id);
CREATE INDEX IF NOT EXISTS idx_hospital_beds_bed_type ON public.hospital_beds(bed_type);

-- Pet Hospitals indexes
CREATE INDEX IF NOT EXISTS idx_pet_hospitals_city ON public.pet_hospitals(city);
CREATE INDEX IF NOT EXISTS idx_pet_hospitals_state ON public.pet_hospitals(state);
CREATE INDEX IF NOT EXISTS idx_pet_hospitals_admin_id ON public.pet_hospitals(admin_id);
CREATE INDEX IF NOT EXISTS idx_pet_hospitals_emergency_available ON public.pet_hospitals(emergency_available);
CREATE INDEX IF NOT EXISTS idx_pet_hospitals_is_active ON public.pet_hospitals(is_active);
CREATE INDEX IF NOT EXISTS idx_pet_hospitals_location ON public.pet_hospitals(latitude, longitude);

-- Emergency Services indexes
CREATE INDEX IF NOT EXISTS idx_emergency_services_city ON public.emergency_services(city);
CREATE INDEX IF NOT EXISTS idx_emergency_services_state ON public.emergency_services(state);
CREATE INDEX IF NOT EXISTS idx_emergency_services_service_type ON public.emergency_services(service_type);
CREATE INDEX IF NOT EXISTS idx_emergency_services_is_active ON public.emergency_services(is_active);
CREATE INDEX IF NOT EXISTS idx_emergency_services_location ON public.emergency_services(latitude, longitude);

-- Emergency Requests indexes
CREATE INDEX IF NOT EXISTS idx_emergency_requests_requester_id ON public.emergency_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_service_id ON public.emergency_requests(emergency_service_id);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_status ON public.emergency_requests(status);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_priority ON public.emergency_requests(priority);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_type ON public.emergency_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_created_at ON public.emergency_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_location ON public.emergency_requests(latitude, longitude);

-- Blood Donors indexes
CREATE INDEX IF NOT EXISTS idx_blood_donors_user_id ON public.blood_donors(user_id);
CREATE INDEX IF NOT EXISTS idx_blood_donors_blood_type ON public.blood_donors(blood_type);
CREATE INDEX IF NOT EXISTS idx_blood_donors_available ON public.blood_donors(is_available);
CREATE INDEX IF NOT EXISTS idx_blood_donors_last_donation ON public.blood_donors(last_donation_date);

-- Blood Requests indexes
CREATE INDEX IF NOT EXISTS idx_blood_requests_requester_id ON public.blood_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_blood_requests_blood_type ON public.blood_requests(blood_type);
CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON public.blood_requests(status);
CREATE INDEX IF NOT EXISTS idx_blood_requests_city ON public.blood_requests(city);
CREATE INDEX IF NOT EXISTS idx_blood_requests_created_at ON public.blood_requests(created_at);

-- Campaigns indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_organizer_id ON public.campaigns(organizer_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_blood_bank_id ON public.campaigns(blood_bank_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_city ON public.campaigns(city);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON public.campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_location ON public.campaigns(latitude, longitude);

-- Campaign Registrations indexes
CREATE INDEX IF NOT EXISTS idx_campaign_registrations_campaign_id ON public.campaign_registrations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_registrations_donor_id ON public.campaign_registrations(donor_id);
CREATE INDEX IF NOT EXISTS idx_campaign_registrations_attended ON public.campaign_registrations(attended);

-- Pharmacies indexes
CREATE INDEX IF NOT EXISTS idx_pharmacies_city ON public.pharmacies(city);
CREATE INDEX IF NOT EXISTS idx_pharmacies_state ON public.pharmacies(state);
CREATE INDEX IF NOT EXISTS idx_pharmacies_admin_id ON public.pharmacies(admin_id);
CREATE INDEX IF NOT EXISTS idx_pharmacies_is_24x7 ON public.pharmacies(is_24x7);
CREATE INDEX IF NOT EXISTS idx_pharmacies_is_active ON public.pharmacies(is_active);
CREATE INDEX IF NOT EXISTS idx_pharmacies_location ON public.pharmacies(latitude, longitude);

-- Medicines indexes
CREATE INDEX IF NOT EXISTS idx_medicines_name ON public.medicines(name);
CREATE INDEX IF NOT EXISTS idx_medicines_generic_name ON public.medicines(generic_name);
CREATE INDEX IF NOT EXISTS idx_medicines_manufacturer ON public.medicines(manufacturer);
CREATE INDEX IF NOT EXISTS idx_medicines_category ON public.medicines(category);
CREATE INDEX IF NOT EXISTS idx_medicines_prescription_required ON public.medicines(prescription_required);

-- Pharmacy Inventory indexes
CREATE INDEX IF NOT EXISTS idx_pharmacy_inventory_pharmacy_id ON public.pharmacy_inventory(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_inventory_medicine_id ON public.pharmacy_inventory(medicine_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_inventory_stock ON public.pharmacy_inventory(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_pharmacy_inventory_expiry ON public.pharmacy_inventory(expiry_date);

-- Vaccines indexes
CREATE INDEX IF NOT EXISTS idx_vaccines_name ON public.vaccines(name);
CREATE INDEX IF NOT EXISTS idx_vaccines_manufacturer ON public.vaccines(manufacturer);
CREATE INDEX IF NOT EXISTS idx_vaccines_type ON public.vaccines(vaccine_type);
CREATE INDEX IF NOT EXISTS idx_vaccines_age_group ON public.vaccines(age_group);
CREATE INDEX IF NOT EXISTS idx_vaccines_is_active ON public.vaccines(is_active);

-- Vaccine Availability indexes
CREATE INDEX IF NOT EXISTS idx_vaccine_availability_vaccine_id ON public.vaccine_availability(vaccine_id);
CREATE INDEX IF NOT EXISTS idx_vaccine_availability_hospital_id ON public.vaccine_availability(hospital_id);
CREATE INDEX IF NOT EXISTS idx_vaccine_availability_doses ON public.vaccine_availability(available_doses);
CREATE INDEX IF NOT EXISTS idx_vaccine_availability_expiry ON public.vaccine_availability(expiry_date);

-- Vaccination Records indexes
CREATE INDEX IF NOT EXISTS idx_vaccination_records_patient_id ON public.vaccination_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_vaccination_records_vaccine_id ON public.vaccination_records(vaccine_id);
CREATE INDEX IF NOT EXISTS idx_vaccination_records_hospital_id ON public.vaccination_records(hospital_id);
CREATE INDEX IF NOT EXISTS idx_vaccination_records_date ON public.vaccination_records(vaccination_date);
CREATE INDEX IF NOT EXISTS idx_vaccination_records_next_dose ON public.vaccination_records(next_dose_due_date);

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_hospital_id ON public.appointments(hospital_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_type ON public.appointments(appointment_type);
CREATE INDEX IF NOT EXISTS idx_appointments_department ON public.appointments(department);

-- Medical Records indexes
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_hospital_id ON public.medical_records(hospital_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_appointment_id ON public.medical_records(appointment_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_visit_date ON public.medical_records(visit_date);
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor ON public.medical_records(doctor_name);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON public.notifications(sent_at);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON public.notifications(expires_at);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.reviews(reviewee_type, reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_is_public ON public.reviews(is_public);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at);

-- System Logs indexes
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON public.system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_action ON public.system_logs(action);
CREATE INDEX IF NOT EXISTS idx_system_logs_table_name ON public.system_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_system_logs_record_id ON public.system_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_blood_inventory_type_available ON public.blood_inventory(blood_type, units_available) WHERE units_available > 0;
CREATE INDEX IF NOT EXISTS idx_vaccine_availability_hospital_available ON public.vaccine_availability(hospital_id, available_doses) WHERE available_doses > 0;
CREATE INDEX IF NOT EXISTS idx_appointments_hospital_status_date ON public.appointments(hospital_id, status, appointment_date);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_status_priority ON public.emergency_requests(status, priority) WHERE status IN ('active', 'dispatched');
CREATE INDEX IF NOT EXISTS idx_users_role_city ON public.users(role, city) WHERE is_active = true;
