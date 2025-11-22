import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL
const API_BASE_URL = 'https://test2medicoonect.vercel.app/api';

// Demo mode for testing
const DEMO_MODE = false; // Set to false when API is ready

// Mock emergency availability data
const MOCK_EMERGENCY_AVAILABILITY = [
    {
        hospital_id: 'hospital-1',
        hospital_name: 'City General Hospital',
        is_available: true,
        current_wait_time: 25,
        capacity_status: 'moderate',
        available_beds: 8,
        total_beds: 15,
        emergency_types: ['cardiac', 'trauma', 'respiratory', 'neurological'],
        contact_number: '+1-555-0123',
        last_updated: '2025-01-15T10:00:00Z'
    },
    {
        hospital_id: 'hospital-2',
        hospital_name: 'Metro Health Center',
        is_available: false,
        current_wait_time: 0,
        capacity_status: 'full',
        available_beds: 0,
        total_beds: 10,
        emergency_types: ['general', 'pediatric'],
        contact_number: '+1-555-0456',
        last_updated: '2025-01-15T10:00:00Z'
    },
    {
        hospital_id: 'hospital-3',
        hospital_name: 'Community Wellness Clinic',
        is_available: true,
        current_wait_time: 15,
        capacity_status: 'low',
        available_beds: 12,
        total_beds: 20,
        emergency_types: ['general', 'trauma', 'cardiac'],
        contact_number: '+1-555-0789',
        last_updated: '2025-01-15T10:00:00Z'
    },
    {
        hospital_id: 'hospital-5',
        hospital_name: 'Central Care Hospital',
        is_available: true,
        current_wait_time: 35,
        capacity_status: 'high',
        available_beds: 3,
        total_beds: 25,
        emergency_types: ['trauma', 'cardiac', 'neurological', 'pediatric'],
        contact_number: '+1-555-0654',
        last_updated: '2025-01-15T10:00:00Z'
    }
];

class EmergencyService {
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

    // Check emergency availability at hospitals
    async checkAvailability(hospitalId = null) {
        try {
            await this.initializeAuth();

            if (DEMO_MODE) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 600));

                if (hospitalId) {
                    const availability = MOCK_EMERGENCY_AVAILABILITY.find(
                        avail => avail.hospital_id === hospitalId
                    );

                    if (!availability) {
                        throw new Error('Hospital not found');
                    }

                    return {
                        success: true,
                        data: { availability },
                        message: 'Emergency availability retrieved successfully'
                    };
                } else {
                    // Return all available emergency services
                    const availableServices = MOCK_EMERGENCY_AVAILABILITY.filter(
                        avail => avail.is_available
                    );

                    return {
                        success: true,
                        data: {
                            availability: availableServices,
                            total: availableServices.length
                        },
                        message: 'Emergency availability retrieved successfully'
                    };
                }
            }

            // Real API call
            const endpoint = hospitalId
                ? `${API_BASE_URL}/emergency/availability/${hospitalId}`
                : `${API_BASE_URL}/emergency/availability`;

            console.log('Checking emergency availability:', endpoint);

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.error || data.message || 'Failed to check emergency availability';
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error('Check emergency availability error:', error);

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
                message: error.message || 'Failed to check emergency availability. Please try again.',
            };
        }
    }

    // Book emergency service
    async bookEmergency(bookingData) {
        try {
            await this.initializeAuth();

            const {
                hospital_id,
                patient_info,
                emergency_type,
                severity_level,
                symptoms,
                medical_history = '',
                insurance_info = null
            } = bookingData;

            if (DEMO_MODE) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                const availability = MOCK_EMERGENCY_AVAILABILITY.find(
                    avail => avail.hospital_id === hospital_id
                );

                if (!availability) {
                    throw new Error('Hospital not found');
                }

                if (!availability.is_available) {
                    throw new Error('Emergency services not available at this hospital');
                }

                // Generate mock booking
                const booking = {
                    id: `emergency-${Date.now()}`,
                    hospital_id,
                    hospital_name: availability.hospital_name,
                    patient_info,
                    emergency_type,
                    severity_level,
                    symptoms,
                    medical_history,
                    insurance_info,
                    status: 'confirmed',
                    queue_position: Math.floor(Math.random() * 5) + 1,
                    estimated_wait_time: availability.current_wait_time + Math.floor(Math.random() * 10),
                    confirmation_number: `EMG-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
                    contact_number: availability.contact_number,
                    created_at: new Date().toISOString()
                };

                return {
                    success: true,
                    data: { booking },
                    message: 'Emergency service booked successfully'
                };
            }

            // Real API call
            console.log('Booking emergency service with data:', bookingData);

            const response = await fetch(`${API_BASE_URL}/emergency/book`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(bookingData)
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.error || data.message || 'Failed to book emergency service';
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error('Book emergency service error:', error);
            return {
                success: false,
                message: error.message || 'Failed to book emergency service. Please try again.',
            };
        }
    }

    // Get booking status and queue position
    async getBookingStatus(bookingId) {
        try {
            await this.initializeAuth();

            if (DEMO_MODE) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500));

                // Mock status data with random updates
                const statuses = ['confirmed', 'in_queue', 'being_treated', 'completed'];
                const currentStatus = statuses[Math.floor(Math.random() * statuses.length)];

                const statusData = {
                    booking_id: bookingId,
                    status: currentStatus,
                    queue_position: currentStatus === 'in_queue' ? Math.floor(Math.random() * 8) + 1 : 0,
                    estimated_wait_time: currentStatus === 'in_queue' ? Math.floor(Math.random() * 45) + 15 : 0,
                    current_step: this.getStatusStep(currentStatus),
                    last_updated: new Date().toISOString(),
                    notes: currentStatus === 'being_treated' ? 'Patient is currently being examined' : ''
                };

                return {
                    success: true,
                    data: { status: statusData },
                    message: 'Booking status retrieved successfully'
                };
            }

            // Real API call
            const response = await fetch(`${API_BASE_URL}/emergency/status/${bookingId}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.error || data.message || 'Failed to get booking status';
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error('Get booking status error:', error);
            return {
                success: false,
                message: error.message || 'Failed to get booking status. Please try again.',
            };
        }
    }

    // Update booking status (for hospital staff)
    async updateBookingStatus(bookingId, status, notes = '') {
        try {
            await this.initializeAuth();

            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 400));

                return {
                    success: true,
                    data: {
                        booking_id: bookingId,
                        status,
                        notes,
                        updated_at: new Date().toISOString()
                    },
                    message: 'Booking status updated successfully'
                };
            }

            // Real API call
            const response = await fetch(`${API_BASE_URL}/emergency/status/${bookingId}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ status, notes })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to update booking status');
            }

            return data;
        } catch (error) {
            console.error('Update booking status error:', error);
            return {
                success: false,
                message: error.message || 'Failed to update booking status. Please try again.',
            };
        }
    }

    // Get emergency types and severity levels
    async getEmergencyTypes() {
        try {
            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 300));

                const emergencyTypes = [
                    {
                        id: 'cardiac',
                        name: 'Cardiac Emergency',
                        description: 'Heart-related emergencies',
                        severity_levels: ['moderate', 'high', 'critical']
                    },
                    {
                        id: 'trauma',
                        name: 'Trauma',
                        description: 'Physical injuries and accidents',
                        severity_levels: ['low', 'moderate', 'high', 'critical']
                    },
                    {
                        id: 'respiratory',
                        name: 'Respiratory Emergency',
                        description: 'Breathing difficulties',
                        severity_levels: ['moderate', 'high', 'critical']
                    },
                    {
                        id: 'neurological',
                        name: 'Neurological Emergency',
                        description: 'Brain and nervous system emergencies',
                        severity_levels: ['moderate', 'high', 'critical']
                    },
                    {
                        id: 'pediatric',
                        name: 'Pediatric Emergency',
                        description: 'Child-specific emergencies',
                        severity_levels: ['low', 'moderate', 'high', 'critical']
                    },
                    {
                        id: 'general',
                        name: 'General Emergency',
                        description: 'Other medical emergencies',
                        severity_levels: ['low', 'moderate', 'high']
                    }
                ];

                return {
                    success: true,
                    data: { emergency_types: emergencyTypes },
                    message: 'Emergency types retrieved successfully'
                };
            }

            // Real API call
            const response = await fetch(`${API_BASE_URL}/emergency/types`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to fetch emergency types');
            }

            return data;
        } catch (error) {
            console.error('Get emergency types error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch emergency types',
            };
        }
    }

    // Helper method to get status step description
    getStatusStep(status) {
        const steps = {
            'confirmed': 'Booking confirmed - Please proceed to hospital',
            'in_queue': 'In queue - Waiting for available medical staff',
            'being_treated': 'Being treated - Patient is with medical staff',
            'completed': 'Treatment completed',
            'cancelled': 'Booking cancelled'
        };

        return steps[status] || 'Status unknown';
    }

    // Cancel emergency booking
    async cancelBooking(bookingId, reason = '') {
        try {
            await this.initializeAuth();

            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 500));

                return {
                    success: true,
                    data: {
                        booking_id: bookingId,
                        status: 'cancelled',
                        cancelled_at: new Date().toISOString(),
                        reason
                    },
                    message: 'Emergency booking cancelled successfully'
                };
            }

            // Real API call
            const response = await fetch(`${API_BASE_URL}/emergency/bookings/${bookingId}/cancel`, {
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
            console.error('Cancel emergency booking error:', error);
            return {
                success: false,
                message: error.message || 'Failed to cancel booking. Please try again.',
            };
        }
    }
}

// Create and export a singleton instance
const emergencyService = new EmergencyService();
export default emergencyService;