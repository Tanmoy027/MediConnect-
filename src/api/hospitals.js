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
            console.log('Response ok:', response.ok);            const data = await response.json();
            console.log('Hospitals API Response:', JSON.stringify(data, null, 2));

            if (!response.ok) {
                const errorMessage = data.error || data.message || `HTTP ${response.status}: Failed to fetch hospitals`;
                console.error('API Error:', errorMessage);
                throw new Error(errorMessage);
            }

            // Your API returns hospitals directly, not in a success/data wrapper
            if (data.hospitals) {
                // Map your API response to the expected format
                const mappedHospitals = data.hospitals.map(hospital => ({
                    id: hospital.id,
                    name: hospital.name,
                    type: hospital.is_verified ? 'verified' : 'public', // You can adjust this logic
                    address: `${hospital.address}, ${hospital.city}, ${hospital.state} ${hospital.pincode}`,
                    phone: hospital.phone,
                    email: hospital.email,
                    specialties: hospital.specialties ? hospital.specialties.split(',') : ['General Medicine'],
                    coordinates: {
                        latitude: hospital.latitude || 0,
                        longitude: hospital.longitude || 0
                    },
                    rating: 4.0, // Default rating since not in API
                    distance: 0, // You'd calculate this based on user location
                    is_emergency: hospital.emergency_available,
                    beds_available: hospital.available_beds,
                    beds_total: hospital.bed_capacity,
                    created_at: hospital.created_at,
                    // Additional fields from your API
                    ambulance_available: hospital.ambulance_available,
                    is_verified: hospital.is_verified,
                    is_active: hospital.is_active,
                    license_number: hospital.license_number,
                    city: hospital.city,
                    state: hospital.state,
                    pincode: hospital.pincode
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

    // Get hospital by ID
    async getHospitalById(hospitalId) {
        try {
            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 500));

                const hospital = MOCK_HOSPITALS.find(h => h.id === hospitalId);

                if (!hospital) {
                    throw new Error('Hospital not found');
                }

                // Extended hospital details for single hospital view
                const extendedHospital = {
                    ...hospital,
                    description: 'Leading healthcare provider with state-of-the-art facilities and experienced medical professionals.',
                    website: `https://${hospital.name.toLowerCase().replace(/\s+/g, '')}.com`,
                    services: ['emergency', 'surgery', 'diagnostic', 'pharmacy'],
                    review_count: Math.floor(Math.random() * 2000) + 100,
                    beds_total: hospital.beds_available + Math.floor(Math.random() * 100) + 50,
                    operating_hours: {
                        monday: '06:00-22:00',
                        tuesday: '06:00-22:00',
                        wednesday: '06:00-22:00',
                        thursday: '06:00-22:00',
                        friday: '06:00-22:00',
                        saturday: '08:00-20:00',
                        sunday: '08:00-20:00',
                        emergency: hospital.is_emergency ? '24/7' : 'N/A'
                    },
                    insurance_accepted: ['Blue Cross', 'Aetna', 'Medicare', 'Medicaid']
                };

                return {
                    success: true,
                    data: {
                        hospital: extendedHospital
                    },
                    message: 'Hospital details retrieved successfully'
                };
            }

            // Real API call
            const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to fetch hospital details');
            }

            return data;
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
}

// Create and export a singleton instance
const hospitalService = new HospitalService();
export default hospitalService;