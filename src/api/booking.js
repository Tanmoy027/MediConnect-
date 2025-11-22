import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL
const API_BASE_URL = 'https://test2medicoonect.vercel.app/api';

// Demo mode for testing
const DEMO_MODE = false; // Set to false when API is ready

// Mock booking data for demo
const MOCK_BOOKINGS = [
    {
        id: 'booking-1',
        user_id: 'user-123',
        booking_type: 'appointment',
        service_id: 'service-1',
        hospital_id: 'hospital-1',
        hospital_name: 'City General Hospital',
        status: 'confirmed',
        patient_info: {
            name: 'John Doe',
            age: 35,
            gender: 'male',
            contact_phone: '+1-555-0123',
            medical_notes: 'Regular checkup'
        },
        booking_details: {
            service_type: 'consultation',
            department: 'cardiology',
            doctor_name: 'Dr. Smith',
            appointment_date: '2025-01-20',
            appointment_time: '10:00'
        },
        scheduled_time: '2025-01-20T10:00:00Z',
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z',
        confirmation_number: 'APT-ABC123'
    },
    {
        id: 'booking-2',
        user_id: 'user-123',
        booking_type: 'emergency',
        service_id: 'emergency-1',
        hospital_id: 'hospital-2',
        hospital_name: 'Metro Health Center',
        status: 'in_progress',
        patient_info: {
            name: 'Jane Smith',
            age: 28,
            gender: 'female',
            contact_phone: '+1-555-0456',
            medical_notes: 'Chest pain'
        },
        booking_details: {
            emergency_type: 'cardiac',
            severity_level: 'moderate',
            symptoms: 'chest pain, shortness of breath',
            queue_position: 3
        },
        created_at: '2025-01-15T12:00:00Z',
        updated_at: '2025-01-15T12:30:00Z',
        confirmation_number: 'EMG-XYZ789'
    },
    {
        id: 'booking-3',
        user_id: 'user-123',
        booking_type: 'vaccine',
        service_id: 'vaccine-1',
        hospital_id: 'hospital-3',
        hospital_name: 'Community Wellness Clinic',
        status: 'completed',
        patient_info: {
            name: 'Bob Johnson',
            age: 45,
            gender: 'male',
            contact_phone: '+1-555-0789'
        },
        booking_details: {
            vaccine_name: 'COVID-19 mRNA Vaccine',
            dose_number: 2,
            vaccination_date: '2025-01-10',
            vaccination_time: '14:00'
        },
        scheduled_time: '2025-01-10T14:00:00Z',
        created_at: '2025-01-08T10:00:00Z',
        updated_at: '2025-01-10T14:30:00Z',
        confirmation_number: 'VAC-DEF456'
    },
    {
        id: 'booking-4',
        user_id: 'user-123',
        booking_type: 'ambulance',
        service_id: 'ambulance-1',
        hospital_id: 'hospital-1',
        hospital_name: 'City General Hospital',
        status: 'cancelled',
        patient_info: {
            name: 'Alice Brown',
            age: 60,
            gender: 'female',
            contact_phone: '+1-555-0321'
        },
        booking_details: {
            ambulance_type: 'advanced',
            pickup_location: '123 Main St',
            destination_location: 'City General Hospital',
            cancellation_reason: 'Patient condition improved'
        },
        created_at: '2025-01-12T08:00:00Z',
        updated_at: '2025-01-12T09:00:00Z',
        confirmation_number: 'AMB-GHI789'
    }
];

class BookingService {
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

    // Create a new booking
    async createBooking(bookingData) {
        try {
            await this.initializeAuth();

            const {
                booking_type,
                service_id,
                hospital_id,
                patient_info,
                booking_details,
                scheduled_time = null
            } = bookingData;

            if (DEMO_MODE) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Generate mock booking
                const booking = {
                    id: `booking-${Date.now()}`,
                    user_id: 'user-123', // Mock user ID
                    booking_type,
                    service_id,
                    hospital_id,
                    hospital_name: this.getHospitalName(hospital_id),
                    status: 'confirmed',
                    patient_info,
                    booking_details,
                    scheduled_time,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    confirmation_number: this.generateConfirmationNumber(booking_type)
                };

                return {
                    success: true,
                    data: { booking },
                    message: 'Booking created successfully'
                };
            }

            // Real API call
            console.log('Creating booking with data:', bookingData);

            const response = await fetch(`${API_BASE_URL}/bookings`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(bookingData)
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.error || data.message || 'Failed to create booking';
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error('Create booking error:', error);

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
                message: error.message || 'Failed to create booking. Please try again.',
            };
        }
    }

    // Get user bookings with filtering
    async getUserBookings(userId, filters = {}) {
        try {
            await this.initializeAuth();

            const {
                booking_type = '',
                status = '',
                date_from = '',
                date_to = '',
                page = 1,
                limit = 10
            } = filters;

            if (DEMO_MODE) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 600));

                let filteredBookings = [...MOCK_BOOKINGS];

                // Apply filters
                if (booking_type) {
                    filteredBookings = filteredBookings.filter(booking =>
                        booking.booking_type === booking_type
                    );
                }

                if (status) {
                    filteredBookings = filteredBookings.filter(booking =>
                        booking.status === status
                    );
                }

                if (date_from) {
                    filteredBookings = filteredBookings.filter(booking =>
                        new Date(booking.created_at) >= new Date(date_from)
                    );
                }

                if (date_to) {
                    filteredBookings = filteredBookings.filter(booking =>
                        new Date(booking.created_at) <= new Date(date_to)
                    );
                }

                // Sort by creation date (newest first)
                filteredBookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                // Pagination
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

                return {
                    success: true,
                    data: {
                        bookings: paginatedBookings,
                        total: filteredBookings.length,
                        page: page,
                        limit: limit,
                        total_pages: Math.ceil(filteredBookings.length / limit)
                    },
                    message: 'Bookings retrieved successfully'
                };
            }

            // Real API call
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(booking_type && { booking_type }),
                ...(status && { status }),
                ...(date_from && { date_from }),
                ...(date_to && { date_to })
            });

            console.log('Fetching user bookings with params:', queryParams.toString());

            const response = await fetch(`${API_BASE_URL}/bookings/user/${userId}?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.error || data.message || 'Failed to fetch bookings';
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error('Get user bookings error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch bookings. Please try again.',
            };
        }
    }

    // Update booking
    async updateBooking(bookingId, updates) {
        try {
            await this.initializeAuth();

            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 500));

                const booking = MOCK_BOOKINGS.find(b => b.id === bookingId);
                if (!booking) {
                    throw new Error('Booking not found');
                }

                const updatedBooking = {
                    ...booking,
                    ...updates,
                    updated_at: new Date().toISOString()
                };

                return {
                    success: true,
                    data: { booking: updatedBooking },
                    message: 'Booking updated successfully'
                };
            }

            // Real API call
            console.log('Updating booking:', bookingId, 'with updates:', updates);

            const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(updates)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to update booking');
            }

            return data;
        } catch (error) {
            console.error('Update booking error:', error);
            return {
                success: false,
                message: error.message || 'Failed to update booking. Please try again.',
            };
        }
    }

    // Cancel booking
    async cancelBooking(bookingId, reason = '') {
        try {
            await this.initializeAuth();

            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 600));

                const booking = MOCK_BOOKINGS.find(b => b.id === bookingId);
                if (!booking) {
                    throw new Error('Booking not found');
                }

                const cancelledBooking = {
                    ...booking,
                    status: 'cancelled',
                    booking_details: {
                        ...booking.booking_details,
                        cancellation_reason: reason,
                        cancelled_at: new Date().toISOString()
                    },
                    updated_at: new Date().toISOString()
                };

                return {
                    success: true,
                    data: { booking: cancelledBooking },
                    message: 'Booking cancelled successfully'
                };
            }

            // Real API call
            const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
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
            console.error('Cancel booking error:', error);
            return {
                success: false,
                message: error.message || 'Failed to cancel booking. Please try again.',
            };
        }
    }

    // Get booking details
    async getBookingDetails(bookingId) {
        try {
            await this.initializeAuth();

            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 400));

                const booking = MOCK_BOOKINGS.find(b => b.id === bookingId);
                if (!booking) {
                    throw new Error('Booking not found');
                }

                // Add extended details for single booking view
                const extendedBooking = {
                    ...booking,
                    hospital_details: {
                        address: '123 Main St, New York, NY 10001',
                        phone: '+1-555-0123',
                        email: 'info@hospital.com'
                    },
                    payment_info: {
                        amount: this.calculateBookingAmount(booking.booking_type),
                        currency: 'USD',
                        payment_status: 'paid'
                    }
                };

                return {
                    success: true,
                    data: { booking: extendedBooking },
                    message: 'Booking details retrieved successfully'
                };
            }

            // Real API call
            const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to fetch booking details');
            }

            return data;
        } catch (error) {
            console.error('Get booking details error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch booking details. Please try again.',
            };
        }
    }

    // Get booking statistics
    async getBookingStats(userId, period = '30d') {
        try {
            await this.initializeAuth();

            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 500));

                const stats = {
                    total_bookings: MOCK_BOOKINGS.length,
                    by_type: {
                        appointment: MOCK_BOOKINGS.filter(b => b.booking_type === 'appointment').length,
                        emergency: MOCK_BOOKINGS.filter(b => b.booking_type === 'emergency').length,
                        vaccine: MOCK_BOOKINGS.filter(b => b.booking_type === 'vaccine').length,
                        ambulance: MOCK_BOOKINGS.filter(b => b.booking_type === 'ambulance').length
                    },
                    by_status: {
                        confirmed: MOCK_BOOKINGS.filter(b => b.status === 'confirmed').length,
                        in_progress: MOCK_BOOKINGS.filter(b => b.status === 'in_progress').length,
                        completed: MOCK_BOOKINGS.filter(b => b.status === 'completed').length,
                        cancelled: MOCK_BOOKINGS.filter(b => b.status === 'cancelled').length
                    },
                    period
                };

                return {
                    success: true,
                    data: { stats },
                    message: 'Booking statistics retrieved successfully'
                };
            }

            // Real API call
            const response = await fetch(`${API_BASE_URL}/bookings/user/${userId}/stats?period=${period}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to fetch booking statistics');
            }

            return data;
        } catch (error) {
            console.error('Get booking stats error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch booking statistics. Please try again.',
            };
        }
    }

    // Helper methods
    getHospitalName(hospitalId) {
        const hospitalNames = {
            'hospital-1': 'City General Hospital',
            'hospital-2': 'Metro Health Center',
            'hospital-3': 'Community Wellness Clinic',
            'hospital-4': 'Regional Medical Institute',
            'hospital-5': 'Central Care Hospital'
        };
        return hospitalNames[hospitalId] || 'Unknown Hospital';
    }

    generateConfirmationNumber(bookingType) {
        const prefixes = {
            appointment: 'APT',
            emergency: 'EMG',
            vaccine: 'VAC',
            ambulance: 'AMB'
        };
        const prefix = prefixes[bookingType] || 'BKG';
        const randomString = Math.random().toString(36).substr(2, 6).toUpperCase();
        return `${prefix}-${randomString}`;
    }

    calculateBookingAmount(bookingType) {
        const amounts = {
            appointment: 150.00,
            emergency: 500.00,
            vaccine: 25.00,
            ambulance: 300.00
        };
        return amounts[bookingType] || 100.00;
    }

    // Get booking types and their configurations
    async getBookingTypes() {
        try {
            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 300));

                const bookingTypes = [
                    {
                        id: 'appointment',
                        name: 'Hospital Appointment',
                        description: 'Regular medical consultations and services',
                        icon: 'calendar',
                        color: '#4CAF50'
                    },
                    {
                        id: 'emergency',
                        name: 'Emergency Service',
                        description: 'Urgent medical care and emergency services',
                        icon: 'alert',
                        color: '#F44336'
                    },
                    {
                        id: 'vaccine',
                        name: 'Vaccination',
                        description: 'Vaccine appointments and immunizations',
                        icon: 'shield',
                        color: '#2196F3'
                    },
                    {
                        id: 'ambulance',
                        name: 'Ambulance Service',
                        description: 'Emergency transportation services',
                        icon: 'truck',
                        color: '#FF9800'
                    }
                ];

                return {
                    success: true,
                    data: { booking_types: bookingTypes },
                    message: 'Booking types retrieved successfully'
                };
            }

            // Real API call would be implemented here
            return {
                success: true,
                data: { booking_types: [] },
                message: 'Booking types retrieved successfully'
            };
        } catch (error) {
            console.error('Get booking types error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch booking types',
            };
        }
    }
}

// Create and export a singleton instance
const bookingService = new BookingService();
export default bookingService;