import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL
const API_BASE_URL = 'https://test-mediconnect.vercel.app/api';

// Demo mode for testing
const DEMO_MODE = false; // Set to false when API is ready

// Mock hospital data for demo
const MOCK_HOSPITALS = [
    {
        id: 'hospital-1',
        name: 'City General Hospital',
        type: 'public',
        address: '123 Main St, New York, NY 10001',
        phone: '+1-555-0123',
        email: 'info@citygeneral.com',
        specialties: ['cardiology', 'neurology', 'emergency'],
        coordinates: { latitude: 40.7128, longitude: -74.0060 },
        rating: 4.5,
        distance: 2.3,
        is_emergency: true,
        beds_available: 45,
        created_at: '2025-01-15T10:00:00Z'
    },
    {
        id: 'hospital-2',
        name: 'Metro Health Center',
        type: 'private',
        address: '456 Health Ave, New York, NY 10002',
        phone: '+1-555-0456',
        email: 'contact@metrohealth.com',
        specialties: ['oncology', 'pediatrics', 'surgery'],
        coordinates: { latitude: 40.7589, longitude: -73.9851 },
        rating: 4.7,
        distance: 1.8,
        is_emergency: false,
        beds_available: 23,
        created_at: '2025-01-15T10:00:00Z'
    },
    {
        id: 'hospital-3',
        name: 'Community Wellness Clinic',
        type: 'public',
        address: '789 Wellness Blvd, New York, NY 10003',
        phone: '+1-555-0789',
        email: 'info@communitywellness.com',
        specialties: ['family medicine', 'emergency', 'internal medicine'],
        coordinates: { latitude: 40.7282, longitude: -73.7949 },
        rating: 4.2,
        distance: 3.1,
        is_emergency: true,
        beds_available: 67,
        created_at: '2025-01-15T10:00:00Z'
    },
    {
        id: 'hospital-4',
        name: 'Regional Medical Institute',
        type: 'private',
        address: '321 Medical Dr, New York, NY 10004',
        phone: '+1-555-0321',
        email: 'contact@regionalmedical.com',
        specialties: ['cardiology', 'orthopedics', 'radiology'],
        coordinates: { latitude: 40.6892, longitude: -74.0445 },
        rating: 4.8,
        distance: 4.2,
        is_emergency: false,
        beds_available: 12,
        created_at: '2025-01-15T10:00:00Z'
    },
    {
        id: 'hospital-5',
        name: 'Central Care Hospital',
        type: 'public',
        address: '654 Central Ave, New York, NY 10005',
        phone: '+1-555-0654',
        email: 'info@centralcare.com',
        specialties: ['emergency', 'trauma', 'surgery'],
        coordinates: { latitude: 40.7505, longitude: -73.9934 },
        rating: 4.4,
        distance: 1.5,
        is_emergency: true,
        beds_available: 89,
        created_at: '2025-01-15T10:00:00Z'
    }
];

// Emergency booking configuration
const EMERGENCY_BOOKING_CONFIG = {
    SERVICE_TYPES: ['emergency_bed', 'ambulance', 'normal_appointment'],
    EMERGENCY_TYPES: ['accident', 'heart_attack', 'appointment_general_consultation'],
    PRIORITY_LEVELS: ['low', 'medium', 'high', 'critical'],
    BOOKING_STATUS: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'],
    GENDER_OPTIONS: ['male', 'female', 'other']
};

class HospitalService {
    constructor() {
        this.authToken = null;
        this.initializeAuth();
    }

    async initializeAuth() {
        try {
            this.authToken = await AsyncStorage.getItem('@mediconnect_user_token');
        } catch (error) {
            console.error('Error getting auth token:', error);
        }
    }

    // Get authentication headers
    getAuthHeaders() {
        return {
            'Authorization': this.authToken ? `Bearer ${this.authToken}` : '',
            'Content-Type': 'application/json',
        };
    }    // Get all hospitals with filtering and pagination
    async getAllHospitals(params = {}) {
        try {
            await this.initializeAuth(); // Ensure auth token is loaded

            const {
                page = 1,
                limit = 10,
                search = '',
                location = '',
                specialty = '',
                type = ''
            } = params;

            if (DEMO_MODE) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 800));

                // Filter mock data based on search parameters
                let filteredHospitals = [...MOCK_HOSPITALS];

                if (search) {
                    filteredHospitals = filteredHospitals.filter(hospital =>
                        hospital.name.toLowerCase().includes(search.toLowerCase()) ||
                        hospital.specialties.some(spec =>
                            spec.toLowerCase().includes(search.toLowerCase())
                        )
                    );
                }

                if (specialty) {
                    filteredHospitals = filteredHospitals.filter(hospital =>
                        hospital.specialties.some(spec =>
                            spec.toLowerCase().includes(specialty.toLowerCase())
                        )
                    );
                }

                if (type) {
                    filteredHospitals = filteredHospitals.filter(hospital =>
                        hospital.type.toLowerCase() === type.toLowerCase()
                    );
                }

                // Pagination
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedHospitals = filteredHospitals.slice(startIndex, endIndex);

                return {
                    success: true,
                    data: {
                        hospitals: paginatedHospitals,
                        total: filteredHospitals.length,
                        page: page,
                        limit: limit,
                        total_pages: Math.ceil(filteredHospitals.length / limit)
                    },
                    message: 'Hospitals retrieved successfully'
                };
            }

            // Real API call
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && { search }),
                ...(location && { location }),
                ...(specialty && { specialty }),
                ...(type && { type })
            });

            console.log('Fetching hospitals with params:', queryParams.toString());
            console.log('Using auth token:', this.authToken ? 'Token present' : 'No token');

            const response = await fetch(`${API_BASE_URL}/hospitals?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok); const data = await response.json();
            console.log('Hospitals API Response:', JSON.stringify(data, null, 2));

            if (!response.ok) {
                const errorMessage = data.error || data.message || `HTTP ${response.status}: Failed to fetch hospitals`;
                console.error('API Error:', errorMessage);
                throw new Error(errorMessage);
            }            // Handle your API response format
            let hospitals = [];

            if (Array.isArray(data)) {
                // If data is directly an array of hospitals
                hospitals = data;
            } else if (data.hospitals && Array.isArray(data.hospitals)) {
                // If data has a hospitals property
                hospitals = data.hospitals;
            } else if (data.data && Array.isArray(data.data)) {
                // If data has a data property
                hospitals = data.data;
            }

            if (hospitals.length > 0) {
                // Map your API response to the expected format
                const mappedHospitals = hospitals.map(hospital => ({
                    id: hospital.id,
                    name: hospital.name || 'Unknown Hospital',
                    type: hospital.is_verified ? 'verified' : 'general',
                    address: [hospital.address, hospital.city, hospital.state, hospital.pincode]
                        .filter(Boolean)
                        .join(', ') || 'Address not available',
                    phone: hospital.phone || 'N/A',
                    email: hospital.email || '',
                    specialties: hospital.specialties ?
                        (typeof hospital.specialties === 'string' ?
                            hospital.specialties.split(',').map(s => s.trim()).filter(Boolean) :
                            hospital.specialties) :
                        ['General Medicine'],
                    coordinates: {
                        latitude: hospital.latitude || 0,
                        longitude: hospital.longitude || 0
                    },
                    rating: 4.2, // Default rating since not provided by API
                    distance: Math.round((Math.random() * 10 + 1) * 10) / 10, // Mock distance since not calculated
                    is_emergency: hospital.emergency_available || false,
                    beds_available: hospital.available_beds || 0,
                    beds_total: hospital.bed_capacity || 0,
                    is_verified: hospital.is_verified || false,
                    created_at: hospital.created_at,
                    // Additional fields from your API
                    ambulance_available: hospital.ambulance_available || false,
                    is_active: hospital.is_active || true,
                    license_number: hospital.license_number || null,
                    city: hospital.city || '',
                    state: hospital.state || '',
                    pincode: hospital.pincode || ''
                }));

                return {
                    success: true,
                    data: {
                        hospitals: mappedHospitals,
                        total: data.count || mappedHospitals.length,
                        page: page,
                        limit: limit,
                        total_pages: Math.ceil((data.count || mappedHospitals.length) / limit)
                    },
                    message: 'Hospitals retrieved successfully'
                };
            } else {
                // Fallback if no hospitals in response
                return {
                    success: true,
                    data: {
                        hospitals: [],
                        total: 0,
                        page: 1,
                        limit: limit,
                        total_pages: 1
                    },
                    message: 'No hospitals found'
                };
            }
        } catch (error) {
            console.error('Get hospitals error:', error);

            // Handle different types of errors
            if (error.message.includes('fetch') || error.message.includes('Network')) {
                return {
                    success: false,
                    message: 'Network error. Please check your internet connection and try again.',
                };
            }

            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                return {
                    success: false,
                    message: 'Authentication required. Please login again.',
                };
            }

            return {
                success: false,
                message: error.message || 'Failed to fetch hospitals. Please try again.',
            };
        }
    }

    // Search hospitals by location (nearby)
    async getNearbyHospitals(params = {}) {
        try {
            const {
                lat,
                lng,
                radius = 10,
                specialty = '',
                type = ''
            } = params;

            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 600));

                // Filter and sort by distance (mock calculation)
                let nearbyHospitals = [...MOCK_HOSPITALS];

                if (specialty) {
                    nearbyHospitals = nearbyHospitals.filter(hospital =>
                        hospital.specialties.some(spec =>
                            spec.toLowerCase().includes(specialty.toLowerCase())
                        )
                    );
                }

                if (type) {
                    nearbyHospitals = nearbyHospitals.filter(hospital =>
                        hospital.type.toLowerCase() === type.toLowerCase()
                    );
                }

                // Sort by distance
                nearbyHospitals.sort((a, b) => a.distance - b.distance);

                return {
                    success: true,
                    data: {
                        hospitals: nearbyHospitals,
                        total: nearbyHospitals.length
                    },
                    message: 'Nearby hospitals retrieved successfully'
                };
            }

            // Real API call
            const queryParams = new URLSearchParams({
                lat: lat.toString(),
                lng: lng.toString(),
                radius: radius.toString(),
                ...(specialty && { specialty }),
                ...(type && { type })
            });

            const response = await fetch(`${API_BASE_URL}/hospitals/nearby?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to fetch nearby hospitals');
            }

            return data;
        } catch (error) {
            console.error('Get nearby hospitals error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch nearby hospitals',
            };
        }
    }

    // Get hospital by ID - Returns the same data structure as the list
    async getHospitalById(hospitalId) {
        try {
            // For now, we don't have a separate hospital details API
            // So we return success but no additional data
            // The details screen will use the hospital data passed from the list
            return {
                success: true,
                data: {
                    hospital: null // No additional data from API
                },
                message: 'Using hospital data from list'
            };
        } catch (error) {
            console.error('Get hospital by ID error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch hospital details',
            };
        }
    }

    // Search hospitals by specialty
    async getHospitalsBySpecialty(specialtyName, params = {}) {
        try {
            const { location = '' } = params;

            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 700));

                const specialtyHospitals = MOCK_HOSPITALS.filter(hospital =>
                    hospital.specialties.some(spec =>
                        spec.toLowerCase().includes(specialtyName.toLowerCase())
                    )
                );

                return {
                    success: true,
                    data: {
                        hospitals: specialtyHospitals,
                        total: specialtyHospitals.length,
                        specialty: specialtyName
                    },
                    message: `Hospitals with ${specialtyName} specialty retrieved successfully`
                };
            }

            // Real API call
            const queryParams = new URLSearchParams({
                ...(location && { location })
            });

            const response = await fetch(`${API_BASE_URL}/hospitals/specialty/${specialtyName}?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to fetch hospitals by specialty');
            }

            return data;
        } catch (error) {
            console.error('Get hospitals by specialty error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch hospitals by specialty',
            };
        }
    }

    // Get available specialties
    async getSpecialties() {
        try {
            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 300));

                const specialties = [
                    'cardiology', 'neurology', 'emergency', 'oncology',
                    'pediatrics', 'surgery', 'family medicine', 'internal medicine',
                    'orthopedics', 'radiology', 'trauma', 'pharmacy'
                ];

                return {
                    success: true,
                    data: { specialties },
                    message: 'Specialties retrieved successfully'
                };
            }

            // Real API call would be implemented here
            return {
                success: true,
                data: { specialties: [] },
                message: 'Specialties retrieved successfully'
            };
        } catch (error) {
            console.error('Get specialties error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch specialties',
            };
        }
    }

    // Check emergency availability at a specific hospital
    async checkEmergencyAvailability(hospitalId) {
        try {
            await this.initializeAuth();

            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 500));

                const hospital = MOCK_HOSPITALS.find(h => h.id === hospitalId);
                if (!hospital) {
                    throw new Error('Hospital not found');
                }

                const availability = {
                    hospital_id: hospitalId,
                    hospital_name: hospital.name,
                    is_available: hospital.is_emergency,
                    current_wait_time: hospital.is_emergency ? Math.floor(Math.random() * 60) + 15 : 0,
                    available_beds: hospital.beds_available,
                    total_beds: hospital.beds_available + Math.floor(Math.random() * 50) + 20,
                    emergency_types: hospital.is_emergency ?
                        ['general', 'trauma', 'cardiac', 'pediatric', 'psychiatric'] : [],
                    severity_levels: hospital.is_emergency ?
                        ['critical', 'urgent', 'semi_urgent', 'non_urgent'] : [],
                    queue_position: hospital.is_emergency ? Math.floor(Math.random() * 10) + 1 : 0,
                    estimated_treatment_time: hospital.is_emergency ? Math.floor(Math.random() * 45) + 15 : 0,
                    last_updated: new Date().toISOString()
                };

                return {
                    success: true,
                    data: { availability },
                    message: 'Emergency availability retrieved successfully'
                };
            }

            // Real API call
            const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}/emergency-availability`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to check emergency availability');
            }

            return data;
        } catch (error) {
            console.error('Check emergency availability error:', error);
            return {
                success: false,
                message: error.message || 'Failed to check emergency availability',
            };
        }
    }

    // Get hospital services and departments
    async getHospitalServices(hospitalId) {
        try {
            await this.initializeAuth();

            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 600));

                const hospital = MOCK_HOSPITALS.find(h => h.id === hospitalId);
                if (!hospital) {
                    throw new Error('Hospital not found');
                }

                const services = [
                    {
                        id: 'consultation',
                        name: 'Medical Consultation',
                        department: 'General Medicine',
                        duration: 30,
                        cost: 150.00,
                        available: true,
                        booking_enabled: true,
                        requires_appointment: true,
                        doctors: ['Dr. Smith', 'Dr. Johnson', 'Dr. Brown']
                    },
                    {
                        id: 'diagnostic',
                        name: 'Diagnostic Tests',
                        department: 'Radiology',
                        duration: 60,
                        cost: 200.00,
                        available: true,
                        booking_enabled: true,
                        requires_appointment: true,
                        sub_services: ['X-Ray', 'MRI', 'CT Scan', 'Ultrasound']
                    },
                    {
                        id: 'surgery',
                        name: 'Surgical Procedures',
                        department: 'Surgery',
                        duration: 120,
                        cost: 2500.00,
                        available: hospital.specialties.includes('surgery'),
                        booking_enabled: hospital.specialties.includes('surgery'),
                        requires_appointment: true,
                        advance_booking_days: 7
                    },
                    {
                        id: 'emergency',
                        name: 'Emergency Care',
                        department: 'Emergency',
                        duration: 0,
                        cost: 500.00,
                        available: hospital.is_emergency,
                        booking_enabled: hospital.is_emergency,
                        requires_appointment: false,
                        walk_in_available: true
                    },
                    {
                        id: 'pharmacy',
                        name: 'Pharmacy Services',
                        department: 'Pharmacy',
                        duration: 15,
                        cost: 0.00,
                        available: true,
                        booking_enabled: false,
                        requires_appointment: false,
                        operating_hours: '24/7'
                    },
                    {
                        id: 'lab_tests',
                        name: 'Laboratory Tests',
                        department: 'Laboratory',
                        duration: 45,
                        cost: 100.00,
                        available: true,
                        booking_enabled: true,
                        requires_appointment: false,
                        walk_in_available: true
                    }
                ];

                return {
                    success: true,
                    data: {
                        hospital_id: hospitalId,
                        hospital_name: hospital.name,
                        services: services.filter(s => s.available),
                        departments: [...new Set(services.filter(s => s.available).map(s => s.department))]
                    },
                    message: 'Hospital services retrieved successfully'
                };
            }

            // Real API call
            const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}/services`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to fetch hospital services');
            }

            return data;
        } catch (error) {
            console.error('Get hospital services error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch hospital services',
            };
        }
    }

    // Get available time slots for appointments
    async getAvailableTimeSlots(hospitalId, serviceType, date, doctorId = null) {
        try {
            await this.initializeAuth();

            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 700));

                const hospital = MOCK_HOSPITALS.find(h => h.id === hospitalId);
                if (!hospital) {
                    throw new Error('Hospital not found');
                }

                // Generate mock time slots based on service type
                const timeSlots = [];
                let startHour = 9;
                let endHour = 17;
                let slotDuration = 30; // minutes

                // Adjust schedule based on service type
                if (serviceType === 'emergency') {
                    startHour = 0;
                    endHour = 24;
                    slotDuration = 60;
                } else if (serviceType === 'surgery') {
                    startHour = 8;
                    endHour = 16;
                    slotDuration = 120;
                } else if (serviceType === 'diagnostic') {
                    startHour = 7;
                    endHour = 19;
                    slotDuration = 60;
                }

                const doctors = ['Dr. Smith', 'Dr. Johnson', 'Dr. Brown', 'Dr. Davis', 'Dr. Wilson'];

                for (let hour = startHour; hour < endHour; hour++) {
                    for (let minute = 0; minute < 60; minute += slotDuration) {
                        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                        const isAvailable = Math.random() > 0.3; // 70% availability
                        const doctorName = doctors[Math.floor(Math.random() * doctors.length)];

                        timeSlots.push({
                            time,
                            available: isAvailable,
                            doctor_id: isAvailable ? `doc-${Math.floor(Math.random() * 5) + 1}` : null,
                            doctor_name: isAvailable ? doctorName : null,
                            duration: slotDuration,
                            cost: serviceType === 'emergency' ? 500 : serviceType === 'surgery' ? 2500 : 150,
                            booking_deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
                        });
                    }
                }

                // Filter by doctor if specified
                const filteredSlots = doctorId ?
                    timeSlots.filter(slot => slot.doctor_id === doctorId) :
                    timeSlots;

                return {
                    success: true,
                    data: {
                        hospital_id: hospitalId,
                        hospital_name: hospital.name,
                        service_type: serviceType,
                        date,
                        doctor_id: doctorId,
                        time_slots: filteredSlots,
                        total_slots: filteredSlots.length,
                        available_slots: filteredSlots.filter(slot => slot.available).length
                    },
                    message: 'Available time slots retrieved successfully'
                };
            }

            // Real API call
            const queryParams = new URLSearchParams({
                service_type: serviceType,
                date
            });

            if (doctorId) {
                queryParams.append('doctor_id', doctorId);
            }

            const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}/time-slots?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to fetch available time slots');
            }

            return data;
        } catch (error) {
            console.error('Get available time slots error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch available time slots',
            };
        }
    }
    // Get doctors available for a specific service at a hospital
    async getAvailableDoctors(hospitalId, serviceType = null, date = null) {
        try {
            await this.initializeAuth();

            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 500));

                const hospital = MOCK_HOSPITALS.find(h => h.id === hospitalId);
                if (!hospital) {
                    throw new Error('Hospital not found');
                }

                const doctors = [
                    {
                        id: 'doc-1',
                        name: 'Dr. Sarah Smith',
                        specialization: 'General Medicine',
                        experience_years: 12,
                        rating: 4.8,
                        available_services: ['consultation', 'diagnostic'],
                        available_dates: ['2025-01-20', '2025-01-21', '2025-01-22'],
                        consultation_fee: 150.00,
                        languages: ['English', 'Spanish']
                    },
                    {
                        id: 'doc-2',
                        name: 'Dr. Michael Johnson',
                        specialization: 'Cardiology',
                        experience_years: 15,
                        rating: 4.9,
                        available_services: ['consultation', 'surgery'],
                        available_dates: ['2025-01-21', '2025-01-23', '2025-01-24'],
                        consultation_fee: 200.00,
                        languages: ['English']
                    },
                    {
                        id: 'doc-3',
                        name: 'Dr. Emily Brown',
                        specialization: 'Emergency Medicine',
                        experience_years: 8,
                        rating: 4.7,
                        available_services: ['emergency', 'consultation'],
                        available_dates: ['2025-01-20', '2025-01-21', '2025-01-22', '2025-01-23'],
                        consultation_fee: 175.00,
                        languages: ['English', 'French']
                    }
                ];

                // Filter by service type if specified
                const filteredDoctors = serviceType ?
                    doctors.filter(doc => doc.available_services.includes(serviceType)) :
                    doctors;

                // Filter by date availability if specified
                const availableDoctors = date ?
                    filteredDoctors.filter(doc => doc.available_dates.includes(date)) :
                    filteredDoctors;

                return {
                    success: true,
                    data: {
                        hospital_id: hospitalId,
                        hospital_name: hospital.name,
                        service_type: serviceType,
                        date: date,
                        doctors: availableDoctors,
                        total: availableDoctors.length
                    },
                    message: 'Available doctors retrieved successfully'
                };
            }

            // Real API call
            const queryParams = new URLSearchParams();
            if (serviceType) {
                queryParams.append('service_type', serviceType);
            }
            if (date) {
                queryParams.append('date', date);
            }

            const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}/doctors?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to fetch available doctors');
            }

            return data;
        } catch (error) {
            console.error('Get available doctors error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch available doctors',
            };
        }
    }

    // Get hospital booking policies and requirements
    async getHospitalBookingPolicies(hospitalId) {
        try {
            await this.initializeAuth();

            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 400));

                const hospital = MOCK_HOSPITALS.find(h => h.id === hospitalId);
                if (!hospital) {
                    throw new Error('Hospital not found');
                }

                const policies = {
                    hospital_id: hospitalId,
                    hospital_name: hospital.name,
                    booking_policies: {
                        advance_booking_days: {
                            consultation: 30,
                            surgery: 60,
                            diagnostic: 14,
                            emergency: 0
                        },
                        cancellation_policy: {
                            free_cancellation_hours: 24,
                            cancellation_fee_percentage: 25,
                            no_show_fee: 50.00
                        },
                        payment_policies: {
                            payment_methods: ['Cash', 'Credit Card', 'Insurance', 'Bank Transfer'],
                            advance_payment_required: false,
                            insurance_verification_required: true,
                            payment_due: 'at_service'
                        },
                        required_documents: [
                            'Valid government-issued ID',
                            'Insurance card (if applicable)',
                            'Previous medical records (if applicable)',
                            'Referral letter (for specialists)'
                        ],
                        age_restrictions: {
                            pediatric_services: 'under_18',
                            geriatric_services: 'over_65',
                            general_services: 'all_ages'
                        },
                        special_requirements: {
                            emergency: 'No appointment required',
                            surgery: 'Pre-operative consultation required',
                            diagnostic: 'Fasting may be required for certain tests'
                        }
                    },
                    contact_information: {
                        booking_phone: hospital.phone,
                        booking_email: hospital.email,
                        emergency_phone: hospital.is_emergency ? '+1-911' : null,
                        online_booking_available: true
                    }
                };

                return {
                    success: true,
                    data: { policies },
                    message: 'Hospital booking policies retrieved successfully'
                };
            }

            // Real API call
            const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}/booking-policies`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to fetch hospital booking policies');
            }

            return data;
        } catch (error) {
            console.error('Get hospital booking policies error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch hospital booking policies',
            };
        }
    }

    // Check service availability and capacity
    async checkServiceAvailability(hospitalId, serviceType, date = null) {
        try {
            await this.initializeAuth();

            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 500));

                const hospital = MOCK_HOSPITALS.find(h => h.id === hospitalId);
                if (!hospital) {
                    throw new Error('Hospital not found');
                }

                const availability = {
                    hospital_id: hospitalId,
                    hospital_name: hospital.name,
                    service_type: serviceType,
                    date: date || new Date().toISOString().split('T')[0],
                    is_available: true,
                    capacity_info: {
                        total_capacity: Math.floor(Math.random() * 50) + 20,
                        available_slots: Math.floor(Math.random() * 30) + 5,
                        booked_slots: Math.floor(Math.random() * 20) + 10,
                        waiting_list: Math.floor(Math.random() * 5)
                    },
                    next_available_slot: '2025-01-20T10:00:00Z',
                    estimated_wait_time: serviceType === 'emergency' ?
                        Math.floor(Math.random() * 60) + 15 : 0,
                    service_details: {
                        duration: serviceType === 'surgery' ? 120 :
                            serviceType === 'diagnostic' ? 60 : 30,
                        cost_range: {
                            min: serviceType === 'surgery' ? 2000 :
                                serviceType === 'emergency' ? 400 : 100,
                            max: serviceType === 'surgery' ? 5000 :
                                serviceType === 'emergency' ? 800 : 300
                        },
                        preparation_required: serviceType === 'surgery' || serviceType === 'diagnostic'
                    }
                };

                return {
                    success: true,
                    data: { availability },
                    message: 'Service availability checked successfully'
                };
            }

            // Real API call
            const queryParams = new URLSearchParams({
                service_type: serviceType
            });
            if (date) {
                queryParams.append('date', date);
            }

            const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}/service-availability?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to check service availability');
            }

            return data;
        } catch (error) {
            console.error('Check service availability error:', error);
            return {
                success: false,
                message: error.message || 'Failed to check service availability',
            };
        }
    }

    // ==================== EMERGENCY BOOKING API ====================

    // Create Emergency Booking
    async createEmergencyBooking(bookingData) {
        try {
            await this.initializeAuth();

            const {
                hospital_id,
                service_type,
                patient_name,
                patient_age,
                patient_gender,
                contact_phone,
                contact_name,
                emergency_type,
                priority,
                description,
                preferred_date,
                preferred_time
            } = bookingData;

            // Validate required fields
            if (!hospital_id || !service_type || !patient_name || !contact_phone || !emergency_type) {
                throw new Error('Missing required booking information');
            }

            // Validate service_type
            if (!EMERGENCY_BOOKING_CONFIG.SERVICE_TYPES.includes(service_type)) {
                throw new Error('Invalid service type. Must be one of: ' + EMERGENCY_BOOKING_CONFIG.SERVICE_TYPES.join(', '));
            }

            // Validate emergency_type
            if (!EMERGENCY_BOOKING_CONFIG.EMERGENCY_TYPES.includes(emergency_type)) {
                throw new Error('Invalid emergency type. Must be one of: ' + EMERGENCY_BOOKING_CONFIG.EMERGENCY_TYPES.join(', '));
            }

            // Validate priority
            if (priority && !EMERGENCY_BOOKING_CONFIG.PRIORITY_LEVELS.includes(priority)) {
                throw new Error('Invalid priority level. Must be one of: ' + EMERGENCY_BOOKING_CONFIG.PRIORITY_LEVELS.join(', '));
            }

            // Validate gender
            if (patient_gender && !EMERGENCY_BOOKING_CONFIG.GENDER_OPTIONS.includes(patient_gender)) {
                throw new Error('Invalid gender value. Must be one of: ' + EMERGENCY_BOOKING_CONFIG.GENDER_OPTIONS.join(', '));
            }

            if (DEMO_MODE) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Check if hospital exists
                const hospital = MOCK_HOSPITALS.find(h => h.id === hospital_id);
                if (!hospital) {
                    throw new Error('Hospital not found');
                }

                // Check if hospital provides emergency services
                if (service_type === 'emergency_bed' && !hospital.is_emergency) {
                    throw new Error('This hospital does not provide emergency services');
                }

                // Generate mock booking response
                const booking = {
                    id: `booking_${Date.now()}`,
                    hospital_id,
                    service_type,
                    patient_name,
                    patient_age,
                    patient_gender,
                    contact_phone,
                    contact_name,
                    emergency_type,
                    priority: priority || 'medium',
                    description,
                    preferred_date,
                    preferred_time,
                    status: 'pending',
                    admin_notes: '',
                    created_at: new Date().toISOString(),
                    confirmed_at: null,
                    hospital_name: hospital.name,
                    estimated_wait_time: service_type === 'emergency_bed' ?
                        Math.floor(Math.random() * 30) + 15 : 0,
                    booking_reference: `REF${Math.random().toString(36).substr(2, 9).toUpperCase()}`
                };

                return {
                    success: true,
                    data: { booking },
                    message: 'Emergency booking created successfully'
                };
            }

            // Real API call
            const requestData = {
                hospital_id,
                service_type,
                patient_name,
                patient_age,
                patient_gender,
                contact_phone,
                contact_name,
                emergency_type,
                priority: priority || 'medium',
                description,
                preferred_date,
                preferred_time
            };

            console.log('Creating emergency booking with data:', requestData);

            const response = await fetch(`${API_BASE_URL}/hospitals/emergency/bookings`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(requestData),
            });

            console.log('Emergency booking response status:', response.status);

            const data = await response.json();
            console.log('Emergency booking API response:', JSON.stringify(data, null, 2));

            if (!response.ok) {
                const errorMessage = data.error || data.message || `HTTP ${response.status}: Failed to create emergency booking`;
                console.error('Emergency booking API Error:', errorMessage);
                throw new Error(errorMessage);
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message || 'Emergency booking created successfully'
            };

        } catch (error) {
            console.error('Create emergency booking error:', error);

            // Handle different types of errors
            if (error.message.includes('fetch') || error.message.includes('Network')) {
                return {
                    success: false,
                    message: 'Network error. Please check your internet connection and try again.',
                };
            }

            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                return {
                    success: false,
                    message: 'Authentication required. Please login again.',
                };
            }

            if (error.message.includes('Missing required')) {
                return {
                    success: false,
                    message: error.message,
                };
            }

            return {
                success: false,
                message: error.message || 'Failed to create emergency booking. Please try again.',
            };
        }
    }

    // Get User's Emergency Bookings
    async getEmergencyBookings(params = {}) {
        try {
            await this.initializeAuth();

            const {
                status,
                service_type,
                page = 1,
                limit = 10,
                sort_by = 'created_at',
                sort_order = 'desc'
            } = params;

            if (DEMO_MODE) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 800));

                // Generate mock bookings data
                const mockBookings = [
                    {
                        id: 'booking_001',
                        service_type: 'emergency_bed',
                        patient_name: 'John Doe',
                        patient_age: 30,
                        patient_gender: 'male',
                        contact_phone: '+1234567890',
                        contact_name: 'Jane Doe',
                        emergency_type: 'accident',
                        priority: 'high',
                        description: 'Car accident with minor injuries',
                        status: 'confirmed',
                        admin_notes: 'Patient stable, assigned to room 301',
                        created_at: '2025-01-20T10:00:00Z',
                        confirmed_at: '2025-01-20T10:05:00Z',
                        preferred_date: '2025-01-20',
                        preferred_time: '10:00',
                        booking_reference: 'REF123ABC456',
                        estimated_wait_time: 25,
                        users: {
                            full_name: 'Jane Smith',
                            phone: '+1234567890',
                            email: 'jane@example.com'
                        },
                        hospitals: {
                            name: 'City General Hospital',
                            phone: '+1-555-0123',
                            address: '123 Main St, New York, NY 10001'
                        }
                    },
                    {
                        id: 'booking_002',
                        service_type: 'normal_appointment',
                        patient_name: 'Alice Johnson',
                        patient_age: 45,
                        patient_gender: 'female',
                        contact_phone: '+1987654321',
                        contact_name: 'Bob Johnson',
                        emergency_type: 'appointment_general_consultation',
                        priority: 'low',
                        description: 'Regular checkup appointment',
                        status: 'pending',
                        admin_notes: '',
                        created_at: '2025-01-19T14:30:00Z',
                        confirmed_at: null,
                        preferred_date: '2025-01-22',
                        preferred_time: '14:00',
                        booking_reference: 'REF456DEF789',
                        estimated_wait_time: 0,
                        users: {
                            full_name: 'Jane Smith',
                            phone: '+1234567890',
                            email: 'jane@example.com'
                        },
                        hospitals: {
                            name: 'Metro Health Center',
                            phone: '+1-555-0456',
                            address: '456 Health Ave, New York, NY 10002'
                        }
                    },
                    {
                        id: 'booking_003',
                        service_type: 'ambulance',
                        patient_name: 'Robert Wilson',
                        patient_age: 65,
                        patient_gender: 'male',
                        contact_phone: '+1122334455',
                        contact_name: 'Mary Wilson',
                        emergency_type: 'heart_attack',
                        priority: 'critical',
                        description: 'Chest pain and breathing difficulty',
                        status: 'completed',
                        admin_notes: 'Patient transported to ER successfully, treatment completed',
                        created_at: '2025-01-18T08:15:00Z',
                        confirmed_at: '2025-01-18T08:17:00Z',
                        preferred_date: '2025-01-18',
                        preferred_time: '08:15',
                        booking_reference: 'REF789GHI012',
                        estimated_wait_time: 0,
                        users: {
                            full_name: 'Jane Smith',
                            phone: '+1234567890',
                            email: 'jane@example.com'
                        },
                        hospitals: {
                            name: 'Central Care Hospital',
                            phone: '+1-555-0654',
                            address: '654 Central Ave, New York, NY 10005'
                        }
                    }
                ];

                // Filter by status if provided
                let filteredBookings = status ?
                    mockBookings.filter(booking => booking.status === status) :
                    mockBookings;

                // Filter by service_type if provided
                if (service_type) {
                    filteredBookings = filteredBookings.filter(booking =>
                        booking.service_type === service_type
                    );
                }

                // Sort bookings
                filteredBookings.sort((a, b) => {
                    const aValue = a[sort_by];
                    const bValue = b[sort_by];

                    if (sort_order === 'asc') {
                        return aValue > bValue ? 1 : -1;
                    } else {
                        return aValue < bValue ? 1 : -1;
                    }
                });

                // Pagination
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

                return {
                    success: true,
                    data: paginatedBookings,
                    pagination: {
                        current_page: page,
                        total_pages: Math.ceil(filteredBookings.length / limit),
                        total_count: filteredBookings.length,
                        limit: limit
                    },
                    message: 'Emergency bookings retrieved successfully'
                };
            }

            // Real API call
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sort_by,
                sort_order,
                ...(status && { status }),
                ...(service_type && { service_type })
            });

            console.log('Fetching emergency bookings with params:', queryParams.toString());

            const response = await fetch(`${API_BASE_URL}/hospitals/emergency/bookings?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            console.log('Emergency bookings response status:', response.status);

            const data = await response.json();
            console.log('Emergency bookings API response:', JSON.stringify(data, null, 2));

            if (!response.ok) {
                const errorMessage = data.error || data.message || `HTTP ${response.status}: Failed to fetch emergency bookings`;
                console.error('Emergency bookings API Error:', errorMessage);
                throw new Error(errorMessage);
            }

            // Handle different response formats from API
            let bookings = [];
            let pagination = {};

            if (Array.isArray(data)) {
                // Direct array response
                bookings = data;
                pagination = {
                    current_page: page,
                    total_pages: 1,
                    total_count: data.length,
                    limit: limit
                };
            } else if (data.data && Array.isArray(data.data)) {
                // Response with data wrapper
                bookings = data.data;
                pagination = data.pagination || {
                    current_page: page,
                    total_pages: Math.ceil((data.total || bookings.length) / limit),
                    total_count: data.total || bookings.length,
                    limit: limit
                };
            } else if (data.success && data.data) {
                // Success wrapper with data
                bookings = Array.isArray(data.data) ? data.data : [data.data];
                pagination = data.pagination || {
                    current_page: page,
                    total_pages: 1,
                    total_count: bookings.length,
                    limit: limit
                };
            }

            return {
                success: true,
                data: bookings,
                pagination: pagination,
                message: data.message || 'Emergency bookings retrieved successfully'
            };

        } catch (error) {
            console.error('Get emergency bookings error:', error);

            // Handle different types of errors
            if (error.message.includes('fetch') || error.message.includes('Network')) {
                return {
                    success: false,
                    message: 'Network error. Please check your internet connection and try again.',
                };
            }

            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                return {
                    success: false,
                    message: 'Authentication required. Please login again.',
                };
            }

            return {
                success: false,
                message: error.message || 'Failed to fetch emergency bookings. Please try again.',
            };
        }
    }

    // Get Emergency Booking by ID
    async getEmergencyBookingById(bookingId) {
        try {
            await this.initializeAuth();

            if (!bookingId) {
                throw new Error('Booking ID is required');
            }

            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 500));

                // Return mock booking details
                const booking = {
                    id: bookingId,
                    service_type: 'emergency_bed',
                    patient_name: 'John Doe',
                    patient_age: 30,
                    patient_gender: 'male',
                    contact_phone: '+1234567890',
                    contact_name: 'Jane Doe',
                    emergency_type: 'accident',
                    priority: 'high',
                    description: 'Car accident with minor injuries',
                    status: 'confirmed',
                    admin_notes: 'Patient stable, assigned to room 301',
                    created_at: '2025-01-20T10:00:00Z',
                    confirmed_at: '2025-01-20T10:05:00Z',
                    preferred_date: '2025-01-20',
                    preferred_time: '10:00',
                    booking_reference: 'REF123ABC456',
                    estimated_wait_time: 25,
                    users: {
                        full_name: 'Jane Smith',
                        phone: '+1234567890',
                        email: 'jane@example.com'
                    },
                    hospitals: {
                        name: 'City General Hospital',
                        phone: '+1-555-0123',
                        address: '123 Main St, New York, NY 10001'
                    }
                };

                return {
                    success: true,
                    data: booking,
                    message: 'Emergency booking details retrieved successfully'
                };
            }

            // Real API call
            const response = await fetch(`${API_BASE_URL}/hospitals/emergency/bookings/${bookingId}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to fetch emergency booking details');
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message || 'Emergency booking details retrieved successfully'
            };

        } catch (error) {
            console.error('Get emergency booking by ID error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch emergency booking details',
            };
        }
    }

    // Cancel Emergency Booking
    async cancelEmergencyBooking(bookingId, reason = '') {
        try {
            await this.initializeAuth();

            if (!bookingId) {
                throw new Error('Booking ID is required');
            }

            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 600));

                return {
                    success: true,
                    data: {
                        booking_id: bookingId,
                        status: 'cancelled',
                        cancelled_at: new Date().toISOString(),
                        cancellation_reason: reason || 'User requested cancellation'
                    },
                    message: 'Emergency booking cancelled successfully'
                };
            }

            // Real API call
            const response = await fetch(`${API_BASE_URL}/hospitals/emergency/bookings/${bookingId}/cancel`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ reason }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to cancel emergency booking');
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message || 'Emergency booking cancelled successfully'
            };

        } catch (error) {
            console.error('Cancel emergency booking error:', error);
            return {
                success: false,
                message: error.message || 'Failed to cancel emergency booking',
            };
        }
    }

    // Update Emergency Booking
    async updateEmergencyBooking(bookingId, updateData) {
        try {
            await this.initializeAuth();

            if (!bookingId) {
                throw new Error('Booking ID is required');
            }

            if (!updateData || Object.keys(updateData).length === 0) {
                throw new Error('Update data is required');
            }

            // Validate allowed update fields
            const allowedFields = [
                'patient_name', 'patient_age', 'patient_gender', 'contact_phone',
                'contact_name', 'description', 'preferred_date', 'preferred_time'
            ];

            const updateFields = Object.keys(updateData);
            const invalidFields = updateFields.filter(field => !allowedFields.includes(field));

            if (invalidFields.length > 0) {
                throw new Error(`Invalid update fields: ${invalidFields.join(', ')}`);
            }

            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 700));

                return {
                    success: true,
                    data: {
                        booking_id: bookingId,
                        updated_fields: updateFields,
                        updated_at: new Date().toISOString()
                    },
                    message: 'Emergency booking updated successfully'
                };
            }

            // Real API call
            const response = await fetch(`${API_BASE_URL}/hospitals/emergency/bookings/${bookingId}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(updateData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to update emergency booking');
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message || 'Emergency booking updated successfully'
            };

        } catch (error) {
            console.error('Update emergency booking error:', error);
            return {
                success: false,
                message: error.message || 'Failed to update emergency booking',
            };
        }
    }
}

// Create and export a singleton instance
const hospitalService = new HospitalService();

// Export the service and configuration constants
export default hospitalService;
export { EMERGENCY_BOOKING_CONFIG };