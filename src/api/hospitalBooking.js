import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL
const API_BASE_URL = 'https://test-mediconnect.vercel.app/api';

class HospitalBookingService {
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

    // Create a new hospital booking
    async createBooking(bookingData) {
        try {
            await this.initializeAuth();

            if (!this.authToken) {
                throw new Error('Authentication required');
            }

            console.log('Creating hospital booking:', bookingData);

            const response = await fetch(`${API_BASE_URL}/hospitals/emergency/bookings`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(bookingData),
            });

            const data = await response.json();
            console.log('Booking API response:', data);

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Failed to create booking');
            }

            return {
                success: true,
                data: data.data,
                message: data.message || 'Booking created successfully',
            };
        } catch (error) {
            console.error('Create booking error:', error);
            return {
                success: false,
                message: error.message || 'Failed to create booking',
            };
        }
    }

    // Get user's bookings
    async getUserBookings() {
        try {
            await this.initializeAuth();

            if (!this.authToken) {
                throw new Error('Authentication required');
            }

            console.log('Fetching user bookings...');

            const response = await fetch(`${API_BASE_URL}/hospitals/emergency/bookings`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();
            console.log('User bookings response:', data);

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Failed to fetch bookings');
            }

            return {
                success: true,
                data: data.data || [],
                message: data.message || 'Bookings retrieved successfully',
            };
        } catch (error) {
            console.error('Get user bookings error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch bookings',
                data: [],
            };
        }
    }

    // Cancel a booking
    async cancelBooking(bookingId) {
        try {
            await this.initializeAuth();

            if (!this.authToken) {
                throw new Error('Authentication required');
            }

            console.log('Cancelling booking:', bookingId);

            const response = await fetch(`${API_BASE_URL}/hospitals/emergency/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Failed to cancel booking');
            }

            return {
                success: true,
                message: data.message || 'Booking cancelled successfully',
            };
        } catch (error) {
            console.error('Cancel booking error:', error);
            return {
                success: false,
                message: error.message || 'Failed to cancel booking',
            };
        }
    }

    // Get booking by ID
    async getBookingById(bookingId) {
        try {
            await this.initializeAuth();

            if (!this.authToken) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`${API_BASE_URL}/hospitals/emergency/bookings/${bookingId}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Failed to fetch booking details');
            }

            return {
                success: true,
                data: data.data,
                message: data.message || 'Booking details retrieved successfully',
            };
        } catch (error) {
            console.error('Get booking by ID error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch booking details',
            };
        }
    }
}

// Create and export a singleton instance
const hospitalBookingService = new HospitalBookingService();
export default hospitalBookingService;