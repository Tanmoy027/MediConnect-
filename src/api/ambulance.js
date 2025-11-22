import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL
const API_BASE_URL = 'https://test-mediconnect.vercel.app/api';

// Demo mode for testing - Enable until ambulance API endpoints are ready
const DEMO_MODE = true; // Set to false when API is ready

// Mock ambulance data for demo
const MOCK_AMBULANCES = [
    {
        id: 'ambulance-1',
        hospital_id: 'hospital-1',
        hospital_name: 'City General Hospital',
        ambulance_type: 'advanced',
        driver_name: 'John Smith',
        driver_phone: '+1-555-0123',
        vehicle_number: 'AMB-001',
        current_location: { latitude: 40.7128, longitude: -74.0060 },
        is_available: true,
        estimated_arrival: 8,
        cost_per_km: 5.50,
        equipment: ['defibrillator', 'oxygen', 'stretcher', 'first_aid'],
        created_at: '2025-01-15T10:00:00Z'
    },
    {
        id: 'ambulance-2',
        hospital_id: 'hospital-2',
        hospital_name: 'Metro Health Center',
        ambulance_type: 'basic',
        driver_name: 'Sarah Johnson',
        driver_phone: '+1-555-0456',
        vehicle_number: 'AMB-002',
        current_location: { latitude: 40.7589, longitude: -73.9851 },
        is_available: true,
        estimated_arrival: 12,
        cost_per_km: 3.75,
        equipment: ['stretcher', 'first_aid', 'oxygen'],
        created_at: '2025-01-15T10:00:00Z'
    },
    {
        id: 'ambulance-3',
        hospital_id: 'hospital-3',
        hospital_name: 'Community Wellness Clinic',
        ambulance_type: 'icu',
        driver_name: 'Michael Brown',
        driver_phone: '+1-555-0789',
        vehicle_number: 'AMB-003',
        current_location: { latitude: 40.7282, longitude: -73.7949 },
        is_available: false,
        estimated_arrival: 0,
        cost_per_km: 8.25,
        equipment: ['ventilator', 'defibrillator', 'cardiac_monitor', 'oxygen', 'stretcher'],
        created_at: '2025-01-15T10:00:00Z'
    },
    {
        id: 'ambulance-4',
        hospital_id: 'hospital-4',
        hospital_name: 'Regional Medical Institute',
        ambulance_type: 'advanced',
        driver_name: 'Emily Davis',
        driver_phone: '+1-555-0321',
        vehicle_number: 'AMB-004',
        current_location: { latitude: 40.6892, longitude: -74.0445 },
        is_available: true,
        estimated_arrival: 15,
        cost_per_km: 6.00,
        equipment: ['defibrillator', 'oxygen', 'stretcher', 'cardiac_monitor'],
        created_at: '2025-01-15T10:00:00Z'
    }
];

class AmbulanceService {
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
    }

    // Search ambulances with location and type filtering
    async searchAmbulances(params = {}) {
        try {
            await this.initializeAuth();

            const {
                lat,
                lng,
                radius = 10,
                ambulance_type = '',
                available_only = true
            } = params;

            if (DEMO_MODE || params._forceDemo) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 800));

                let filteredAmbulances = [...MOCK_AMBULANCES];

                // Filter by availability
                if (available_only) {
                    filteredAmbulances = filteredAmbulances.filter(ambulance =>
                        ambulance.is_available
                    );
                }

                // Filter by ambulance type
                if (ambulance_type) {
                    filteredAmbulances = filteredAmbulances.filter(ambulance =>
                        ambulance.ambulance_type.toLowerCase() === ambulance_type.toLowerCase()
                    );
                }

                // Sort by estimated arrival time
                filteredAmbulances.sort((a, b) => a.estimated_arrival - b.estimated_arrival);

                return {
                    success: true,
                    data: {
                        ambulances: filteredAmbulances,
                        total: filteredAmbulances.length
                    },
                    message: 'Ambulances retrieved successfully'
                };
            }

            // Real API call
            const queryParams = new URLSearchParams({
                lat: lat.toString(),
                lng: lng.toString(),
                radius: radius.toString(),
                ...(ambulance_type && { ambulance_type }),
                available_only: available_only.toString()
            });

            console.log('Fetching ambulances with params:', queryParams.toString());

            const response = await fetch(`${API_BASE_URL}/ambulances/search?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            // Check if response is HTML (error page) instead of JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.log('API endpoint not available, falling back to demo mode');
                // Fallback to demo mode if API endpoint doesn't exist
                return await this.searchAmbulances({ ...params, _forceDemo: true });
            }

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.error || data.message || `HTTP ${response.status}: Failed to search ambulances`;
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error('Search ambulances error:', error);

            // Handle JSON parse errors (usually means API endpoint doesn't exist)
            if (error.message.includes('JSON Parse error') || error.message.includes('Unexpected character')) {
                console.log('API endpoint not available, using demo data');
                // Use demo data when API endpoint doesn't exist
                return await this.searchAmbulances({ ...params, _forceDemo: true });
            }

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
                message: error.message || 'Failed to search ambulances. Please try again.',
            };
        }
    }

    // Book an ambulance
    async bookAmbulance(bookingData) {
        try {
            await this.initializeAuth();

            const {
                ambulance_id,
                pickup_location,
                destination_location,
                patient_info,
                emergency_type,
                special_requirements = []
            } = bookingData;

            if (DEMO_MODE) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1200));

                const ambulance = MOCK_AMBULANCES.find(a => a.id === ambulance_id);
                if (!ambulance) {
                    throw new Error('Ambulance not found');
                }

                if (!ambulance.is_available) {
                    throw new Error('Ambulance is not available');
                }

                // Generate mock booking
                const booking = {
                    id: `booking-${Date.now()}`,
                    ambulance_id,
                    ambulance: ambulance,
                    pickup_location,
                    destination_location,
                    patient_info,
                    emergency_type,
                    special_requirements,
                    status: 'confirmed',
                    estimated_arrival: ambulance.estimated_arrival,
                    estimated_cost: Math.round(ambulance.cost_per_km * 10 * 100) / 100, // Mock 10km distance
                    confirmation_number: `AMB-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
                    created_at: new Date().toISOString()
                };

                return {
                    success: true,
                    data: { booking },
                    message: 'Ambulance booked successfully'
                };
            }

            // Real API call
            console.log('Booking ambulance with data:', bookingData);

            const response = await fetch(`${API_BASE_URL}/ambulances/book`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(bookingData)
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.error || data.message || 'Failed to book ambulance';
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error('Book ambulance error:', error);
            return {
                success: false,
                message: error.message || 'Failed to book ambulance. Please try again.',
            };
        }
    }

    // Track ambulance location and status
    async trackAmbulance(bookingId) {
        try {
            await this.initializeAuth();

            if (DEMO_MODE) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500));

                // Mock tracking data
                const trackingData = {
                    booking_id: bookingId,
                    ambulance_location: {
                        latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
                        longitude: -74.0060 + (Math.random() - 0.5) * 0.01
                    },
                    status: 'en_route',
                    estimated_arrival: Math.max(1, Math.floor(Math.random() * 15)),
                    driver_contact: '+1-555-0123',
                    last_updated: new Date().toISOString()
                };

                return {
                    success: true,
                    data: { tracking: trackingData },
                    message: 'Ambulance tracking data retrieved successfully'
                };
            }

            // Real API call
            const response = await fetch(`${API_BASE_URL}/ambulances/track/${bookingId}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.error || data.message || 'Failed to track ambulance';
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error('Track ambulance error:', error);
            return {
                success: false,
                message: error.message || 'Failed to track ambulance. Please try again.',
            };
        }
    }

    // Get available ambulance types
    async getAmbulanceTypes() {
        try {
            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 300));

                const types = [
                    {
                        id: 'basic',
                        name: 'Basic Life Support (BLS)',
                        description: 'Standard ambulance with basic medical equipment',
                        equipment: ['stretcher', 'first_aid', 'oxygen'],
                        cost_range: '$3.00 - $4.00 per km'
                    },
                    {
                        id: 'advanced',
                        name: 'Advanced Life Support (ALS)',
                        description: 'Equipped with advanced medical equipment and trained paramedics',
                        equipment: ['defibrillator', 'oxygen', 'stretcher', 'cardiac_monitor'],
                        cost_range: '$5.00 - $7.00 per km'
                    },
                    {
                        id: 'icu',
                        name: 'Mobile ICU',
                        description: 'Intensive care unit on wheels with life support systems',
                        equipment: ['ventilator', 'defibrillator', 'cardiac_monitor', 'oxygen', 'stretcher'],
                        cost_range: '$8.00 - $10.00 per km'
                    }
                ];

                return {
                    success: true,
                    data: { types },
                    message: 'Ambulance types retrieved successfully'
                };
            }

            // Real API call
            const response = await fetch(`${API_BASE_URL}/ambulances/types`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            // Check if response is HTML (error page) instead of JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.log('Ambulance types API endpoint not available, using demo data');
                // Fallback to demo data
                const types = [
                    {
                        id: 'basic',
                        name: 'Basic Life Support (BLS)',
                        description: 'Standard ambulance with basic medical equipment',
                        equipment: ['stretcher', 'first_aid', 'oxygen'],
                        cost_range: '$3.00 - $4.00 per km'
                    },
                    {
                        id: 'advanced',
                        name: 'Advanced Life Support (ALS)',
                        description: 'Equipped with advanced medical equipment and trained paramedics',
                        equipment: ['defibrillator', 'oxygen', 'stretcher', 'cardiac_monitor'],
                        cost_range: '$5.00 - $7.00 per km'
                    },
                    {
                        id: 'icu',
                        name: 'Mobile ICU',
                        description: 'Intensive care unit on wheels with life support systems',
                        equipment: ['ventilator', 'defibrillator', 'cardiac_monitor', 'oxygen', 'stretcher'],
                        cost_range: '$8.00 - $10.00 per km'
                    }
                ];

                return {
                    success: true,
                    data: { types },
                    message: 'Ambulance types retrieved successfully'
                };
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to fetch ambulance types');
            }

            return data;
        } catch (error) {
            console.error('Get ambulance types error:', error);

            // Handle JSON parse errors (usually means API endpoint doesn't exist)
            if (error.message.includes('JSON Parse error') || error.message.includes('Unexpected character')) {
                console.log('Ambulance types API endpoint not available, using demo data');
                // Return demo data when API endpoint doesn't exist
                const types = [
                    {
                        id: 'basic',
                        name: 'Basic Life Support (BLS)',
                        description: 'Standard ambulance with basic medical equipment',
                        equipment: ['stretcher', 'first_aid', 'oxygen'],
                        cost_range: '$3.00 - $4.00 per km'
                    },
                    {
                        id: 'advanced',
                        name: 'Advanced Life Support (ALS)',
                        description: 'Equipped with advanced medical equipment and trained paramedics',
                        equipment: ['defibrillator', 'oxygen', 'stretcher', 'cardiac_monitor'],
                        cost_range: '$5.00 - $7.00 per km'
                    },
                    {
                        id: 'icu',
                        name: 'Mobile ICU',
                        description: 'Intensive care unit on wheels with life support systems',
                        equipment: ['ventilator', 'defibrillator', 'cardiac_monitor', 'oxygen', 'stretcher'],
                        cost_range: '$8.00 - $10.00 per km'
                    }
                ];

                return {
                    success: true,
                    data: { types },
                    message: 'Ambulance types retrieved successfully'
                };
            }

            return {
                success: false,
                message: error.message || 'Failed to fetch ambulance types',
            };
        }
    }

    // Cancel ambulance booking
    async cancelBooking(bookingId, reason = '') {
        try {
            await this.initializeAuth();

            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 600));

                return {
                    success: true,
                    data: {
                        booking_id: bookingId,
                        status: 'cancelled',
                        cancelled_at: new Date().toISOString(),
                        reason
                    },
                    message: 'Ambulance booking cancelled successfully'
                };
            }

            // Real API call
            const response = await fetch(`${API_BASE_URL}/ambulances/bookings/${bookingId}/cancel`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ reason })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to cancel booking');
            }

            return data;
        } catch (error) {
            console.error('Cancel ambulance booking error:', error);
            return {
                success: false,
                message: error.message || 'Failed to cancel booking. Please try again.',
            };
        }
    }
}

// Create and export a singleton instance
const ambulanceService = new AmbulanceService();
export default ambulanceService;