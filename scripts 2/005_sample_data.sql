-- Sample Data for MediConnect Database
-- Run this after creating tables, indexes, and functions

-- Insert sample vaccines (using only basic columns that definitely exist)
INSERT INTO public.vaccines (name, manufacturer, description, age_group, doses_required) VALUES
('COVID-19 mRNA Vaccine', 'Pfizer-BioNTech', 'mRNA vaccine for SARS-CoV-2', '12+ years', 2),
('COVID-19 Viral Vector Vaccine', 'AstraZeneca', 'Viral vector vaccine for SARS-CoV-2', '18+ years', 2),
('Influenza Vaccine', 'Sanofi Pasteur', 'Seasonal flu vaccine', '6 months+', 1),
('Hepatitis B Vaccine', 'GSK', 'Hepatitis B prevention vaccine', 'All ages', 3),
('MMR Vaccine', 'Merck', 'Measles, Mumps, Rubella vaccine', '12 months+', 2),
('Tetanus Vaccine', 'Serum Institute', 'Tetanus toxoid vaccine', 'All ages', 1),
('Polio Vaccine (IPV)', 'Sanofi Pasteur', 'Inactivated polio vaccine', '2 months+', 4),
('Typhoid Vaccine', 'Bharat Biotech', 'Typhoid fever prevention', '2+ years', 1),
('Japanese Encephalitis Vaccine', 'Valneva', 'Japanese encephalitis vaccine', '2 months+', 2),
('Rabies Vaccine', 'Sanofi Pasteur', 'Pre/post-exposure rabies vaccine', 'All ages', 3);

-- Insert sample emergency services (using only basic required columns)
INSERT INTO public.emergency_services (name, service_type, phone, emergency_phone, address, city, state, pincode) VALUES
('City Emergency Medical Services', 'ambulance', '+91-11-23456789', '108', '123 Emergency Services Complex, Central Delhi', 'New Delhi', 'Delhi', '110001'),
('Metro Fire Department', 'fire', '+91-11-23456790', '101', '456 Fire Station Road, South Delhi', 'New Delhi', 'Delhi', '110024'),
('Police Emergency Response', 'police', '+91-11-23456791', '100', '789 Police Station Complex, East Delhi', 'New Delhi', 'Delhi', '110032'),
('Disaster Response Team', 'disaster_response', '+91-11-23456792', '108', '101 Disaster Management Center, North Delhi', 'New Delhi', 'Delhi', '110007'),
('Mumbai Emergency Medical', 'ambulance', '+91-22-12345678', '108', '234 Hospital Road, Bandra', 'Mumbai', 'Maharashtra', '400050'),
('Bangalore Fire Services', 'fire', '+91-80-12345679', '101', '567 Fire Brigade Road, Koramangala', 'Bangalore', 'Karnataka', '560034'),
('Chennai Police Emergency', 'police', '+91-44-12345680', '100', '890 Police Headquarters, T Nagar', 'Chennai', 'Tamil Nadu', '600017'),
('Hyderabad Emergency Response', 'ambulance', '+91-40-12345681', '108', '345 Emergency Complex, Secunderabad', 'Hyderabad', 'Telangana', '500003');

-- Insert sample medicines (using only basic required columns)
INSERT INTO public.medicines (name, generic_name, manufacturer, category, form, strength, description, prescription_required) VALUES
('Paracetamol', 'Acetaminophen', 'GSK', 'Analgesic', 'Tablet', '500mg', 'Pain reliever and fever reducer', false),
('Amoxicillin', 'Amoxicillin', 'Cipla', 'Antibiotic', 'Capsule', '250mg', 'Penicillin antibiotic', true),
('Omeprazole', 'Omeprazole', 'Dr. Reddys', 'Proton Pump Inhibitor', 'Capsule', '20mg', 'Reduces stomach acid', true),
('Aspirin', 'Acetylsalicylic Acid', 'Bayer', 'Analgesic', 'Tablet', '75mg', 'Blood thinner and pain reliever', false),
('Metformin', 'Metformin HCl', 'Sun Pharma', 'Antidiabetic', 'Tablet', '500mg', 'Type 2 diabetes medication', true),
('Atorvastatin', 'Atorvastatin', 'Pfizer', 'Statin', 'Tablet', '10mg', 'Cholesterol lowering medication', true),
('Cetirizine', 'Cetirizine HCl', 'UCB', 'Antihistamine', 'Tablet', '10mg', 'Allergy medication', false),
('Insulin Glargine', 'Insulin Glargine', 'Sanofi', 'Insulin', 'Injection', '100 units/ml', 'Long-acting insulin', true),
('Salbutamol', 'Salbutamol', 'GSK', 'Bronchodilator', 'Inhaler', '100mcg', 'Asthma and COPD treatment', true),
('Lorazepam', 'Lorazepam', 'Pfizer', 'Benzodiazepine', 'Tablet', '1mg', 'Anxiety and seizure medication', true);

-- Note: To complete the sample data insertion, you would need to:
-- 1. First create sample users with appropriate roles
-- 2. Create sample hospitals, blood banks, pharmacies
-- 3. Then create vaccine availability, pharmacy inventory, appointments, etc.

-- Example of creating sample users (you'll need to do this through Supabase Auth first)
-- Then update their profiles in the users table

-- Sample SQL to update user roles after they're created through auth:
/*
UPDATE public.users SET 
  role = 'hospital_admin',
  full_name = 'Dr. John Smith',
  phone = '+91-9876543210',
  city = 'New Delhi',
  state = 'Delhi'
WHERE email = 'hospital.admin@example.com';

UPDATE public.users SET 
  role = 'blood_bank_admin',
  full_name = 'Dr. Sarah Johnson',
  phone = '+91-9876543211',
  city = 'Mumbai',
  state = 'Maharashtra'
WHERE email = 'bloodbank.admin@example.com';

UPDATE public.users SET 
  role = 'emergency_admin',
  full_name = 'Chief Officer Mike Wilson',
  phone = '+91-9876543212',
  city = 'Bangalore',
  state = 'Karnataka'
WHERE email = 'emergency.admin@example.com';
*/
