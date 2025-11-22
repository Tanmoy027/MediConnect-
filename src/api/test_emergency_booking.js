// Test file for Emergency Booking API
import hospitalService, { EMERGENCY_BOOKING_CONFIG } from './hospitals.js';

// Test data for creating emergency booking
const testBookingData = {
    hospital_id: 'hospital-1',
    service_type: 'emergency_bed',
    patient_name: 'John Doe',
    patient_age: 30,
    patient_gender: 'male',
    contact_phone: '+1234567890',
    contact_name: 'Jane Doe',
    emergency_type: 'accident',
    priority: 'high',
    description: 'Car accident with minor injuries',
    preferred_date: '2025-01-20',
    preferred_time: '10:00'
};

// Test functions
export const testEmergencyBookingAPI = {
    // Test creating an emergency booking
    async testCreateBooking() {
        try {
            console.log('Testing Create Emergency Booking...');
            const result = await hospitalService.createEmergencyBooking(testBookingData);
            console.log('Create Booking Result:', result);
            return result;
        } catch (error) {
            console.error('Create Booking Error:', error);
            return { success: false, error: error.message };
        }
    },

    // Test getting all emergency bookings
    async testGetBookings() {
        try {
            console.log('Testing Get Emergency Bookings...');
            const result = await hospitalService.getEmergencyBookings({
                page: 1,
                limit: 10,
                status: 'pending'
            });
            console.log('Get Bookings Result:', result);
            return result;
        } catch (error) {
            console.error('Get Bookings Error:', error);
            return { success: false, error: error.message };
        }
    },

    // Test getting a specific booking by ID
    async testGetBookingById(bookingId = 'booking_001') {
        try {
            console.log(`Testing Get Emergency Booking by ID: ${bookingId}...`);
            const result = await hospitalService.getEmergencyBookingById(bookingId);
            console.log('Get Booking by ID Result:', result);
            return result;
        } catch (error) {
            console.error('Get Booking by ID Error:', error);
            return { success: false, error: error.message };
        }
    },

    // Test updating an emergency booking
    async testUpdateBooking(bookingId = 'booking_001') {
        try {
            console.log(`Testing Update Emergency Booking: ${bookingId}...`);
            const updateData = {
                patient_name: 'John Updated Doe',
                description: 'Updated description for car accident',
                contact_phone: '+1234567899'
            };
            const result = await hospitalService.updateEmergencyBooking(bookingId, updateData);
            console.log('Update Booking Result:', result);
            return result;
        } catch (error) {
            console.error('Update Booking Error:', error);
            return { success: false, error: error.message };
        }
    },

    // Test cancelling an emergency booking
    async testCancelBooking(bookingId = 'booking_001') {
        try {
            console.log(`Testing Cancel Emergency Booking: ${bookingId}...`);
            const result = await hospitalService.cancelEmergencyBooking(
                bookingId,
                'Patient condition improved, no longer needed'
            );
            console.log('Cancel Booking Result:', result);
            return result;
        } catch (error) {
            console.error('Cancel Booking Error:', error);
            return { success: false, error: error.message };
        }
    },

    // Test configuration constants
    testConfiguration() {
        console.log('Testing Emergency Booking Configuration...');
        console.log('Service Types:', EMERGENCY_BOOKING_CONFIG.SERVICE_TYPES);
        console.log('Emergency Types:', EMERGENCY_BOOKING_CONFIG.EMERGENCY_TYPES);
        console.log('Priority Levels:', EMERGENCY_BOOKING_CONFIG.PRIORITY_LEVELS);
        console.log('Booking Status Options:', EMERGENCY_BOOKING_CONFIG.BOOKING_STATUS);
        console.log('Gender Options:', EMERGENCY_BOOKING_CONFIG.GENDER_OPTIONS);

        return {
            success: true,
            data: EMERGENCY_BOOKING_CONFIG,
            message: 'Configuration constants retrieved successfully'
        };
    },

    // Run all tests
    async runAllTests() {
        console.log('=== Running All Emergency Booking API Tests ===\n');

        const results = {};

        // Test configuration
        results.config = this.testConfiguration();
        console.log('\n' + '='.repeat(50) + '\n');

        // Test create booking
        results.create = await this.testCreateBooking();
        console.log('\n' + '='.repeat(50) + '\n');

        // Test get bookings
        results.getAll = await this.testGetBookings();
        console.log('\n' + '='.repeat(50) + '\n');

        // Test get booking by ID
        results.getById = await this.testGetBookingById();
        console.log('\n' + '='.repeat(50) + '\n');

        // Test update booking
        results.update = await this.testUpdateBooking();
        console.log('\n' + '='.repeat(50) + '\n');

        // Test cancel booking
        results.cancel = await this.testCancelBooking();
        console.log('\n' + '='.repeat(50) + '\n');

        console.log('=== All Tests Completed ===');
        console.log('Results Summary:');
        Object.keys(results).forEach(test => {
            console.log(`${test}: ${results[test].success ? '✅ PASSED' : '❌ FAILED'}`);
        });

        return results;
    }
};

// Export test data and configurations for external use
export { testBookingData, EMERGENCY_BOOKING_CONFIG };