-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'normal_user')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to call the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update blood donor eligibility based on last donation
CREATE OR REPLACE FUNCTION update_blood_donor_eligibility()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate next eligible date (56 days for men, 84 days for women)
    IF NEW.last_donation_date IS NOT NULL THEN
        NEW.next_eligible_date = NEW.last_donation_date + INTERVAL '56 days';
        
        -- Check if donor is currently eligible
        IF NEW.next_eligible_date <= CURRENT_DATE THEN
            NEW.is_available = true;
        ELSE
            NEW.is_available = false;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update hospital bed availability
CREATE OR REPLACE FUNCTION update_hospital_bed_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update available beds count in hospitals table
    UPDATE public.hospitals 
    SET available_beds = (
        SELECT COUNT(*) 
        FROM public.hospital_beds 
        WHERE hospital_id = COALESCE(NEW.hospital_id, OLD.hospital_id) 
        AND status = 'available'
    )
    WHERE id = COALESCE(NEW.hospital_id, OLD.hospital_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Function to log system activities
CREATE OR REPLACE FUNCTION log_system_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.system_logs (
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        created_at
    ) VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        CASE 
            WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD)
            WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
            ELSE NULL
        END,
        CASE 
            WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW)
            WHEN TG_OP = 'UPDATE' THEN to_jsonb(NEW)
            ELSE NULL
        END,
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Function to create notification for appointment status changes
CREATE OR REPLACE FUNCTION notify_appointment_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create notification if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.notifications (
            user_id,
            title,
            message,
            type,
            related_id,
            priority
        ) VALUES (
            NEW.user_id,
            'Appointment Status Update',
            CASE NEW.status
                WHEN 'approved' THEN 'Your appointment has been approved'
                WHEN 'rejected' THEN 'Your appointment has been rejected'
                WHEN 'completed' THEN 'Your appointment has been completed'
                WHEN 'cancelled' THEN 'Your appointment has been cancelled'
                ELSE 'Your appointment status has been updated to: ' || NEW.status
            END,
            'appointment',
            NEW.id,
            CASE NEW.status
                WHEN 'approved' THEN 'high'
                WHEN 'rejected' THEN 'high'
                ELSE 'normal'
            END
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update campaign registration counts
CREATE OR REPLACE FUNCTION update_campaign_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment registered_donors
        UPDATE public.campaigns 
        SET registered_donors = registered_donors + 1
        WHERE id = NEW.campaign_id;
        
        -- If they attended, increment actual_donors
        IF NEW.attended THEN
            UPDATE public.campaigns 
            SET actual_donors = actual_donors + 1
            WHERE id = NEW.campaign_id;
        END IF;
        
        RETURN NEW;
    
    ELSIF TG_OP = 'UPDATE' THEN
        -- If attendance status changed from false to true
        IF OLD.attended = false AND NEW.attended = true THEN
            UPDATE public.campaigns 
            SET actual_donors = actual_donors + 1
            WHERE id = NEW.campaign_id;
        -- If attendance status changed from true to false
        ELSIF OLD.attended = true AND NEW.attended = false THEN
            UPDATE public.campaigns 
            SET actual_donors = actual_donors - 1
            WHERE id = NEW.campaign_id;
        END IF;
        
        RETURN NEW;
    
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement registered_donors
        UPDATE public.campaigns 
        SET registered_donors = registered_donors - 1
        WHERE id = OLD.campaign_id;
        
        -- If they attended, decrement actual_donors
        IF OLD.attended THEN
            UPDATE public.campaigns 
            SET actual_donors = actual_donors - 1
            WHERE id = OLD.campaign_id;
        END IF;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Function to validate emergency request priority
CREATE OR REPLACE FUNCTION validate_emergency_priority()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-assign priority based on request type if not specified
    IF NEW.priority IS NULL THEN
        NEW.priority = CASE NEW.request_type
            WHEN 'medical' THEN 'high'
            WHEN 'fire' THEN 'critical'
            WHEN 'accident' THEN 'high'
            WHEN 'disaster' THEN 'critical'
            ELSE 'medium'
        END;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to auto-expire old notifications
CREATE OR REPLACE FUNCTION expire_old_notifications()
RETURNS void AS $$
BEGIN
    UPDATE public.notifications 
    SET expires_at = NOW() 
    WHERE sent_at < NOW() - INTERVAL '30 days' 
    AND expires_at IS NULL;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blood_banks_updated_at BEFORE UPDATE ON public.blood_banks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON public.hospitals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hospital_beds_updated_at BEFORE UPDATE ON public.hospital_beds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pet_hospitals_updated_at BEFORE UPDATE ON public.pet_hospitals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_services_updated_at BEFORE UPDATE ON public.emergency_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_requests_updated_at BEFORE UPDATE ON public.emergency_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blood_donors_updated_at BEFORE UPDATE ON public.blood_donors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blood_requests_updated_at BEFORE UPDATE ON public.blood_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pharmacies_updated_at BEFORE UPDATE ON public.pharmacies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medicines_updated_at BEFORE UPDATE ON public.medicines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vaccines_updated_at BEFORE UPDATE ON public.vaccines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON public.medical_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Blood donor eligibility triggers
CREATE TRIGGER update_blood_donor_eligibility_trigger 
    BEFORE INSERT OR UPDATE ON public.blood_donors
    FOR EACH ROW EXECUTE FUNCTION update_blood_donor_eligibility();

-- Hospital bed count triggers
CREATE TRIGGER update_hospital_bed_count_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON public.hospital_beds
    FOR EACH ROW EXECUTE FUNCTION update_hospital_bed_count();

-- Appointment status notification triggers
CREATE TRIGGER notify_appointment_status_change_trigger 
    AFTER UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION notify_appointment_status_change();

-- Campaign registration count triggers
CREATE TRIGGER update_campaign_counts_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON public.campaign_registrations
    FOR EACH ROW EXECUTE FUNCTION update_campaign_counts();

-- Emergency request priority validation trigger
CREATE TRIGGER validate_emergency_priority_trigger 
    BEFORE INSERT OR UPDATE ON public.emergency_requests
    FOR EACH ROW EXECUTE FUNCTION validate_emergency_priority();
