import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL
const API_BASE_URL = 'https://test2medicoonect.vercel.app/api';

// Demo mode for testing - DISABLED to use real API only
const DEMO_MODE = false; // Always use real API

class CampaignService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Get authentication token
    async getAuthToken() {
        try {
            return await AsyncStorage.getItem('@mediconnect_user_token');
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
    }

    // Get current user data
    async getCurrentUser() {
        try {
            const userData = await AsyncStorage.getItem('@mediconnect_user_data');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }    // Get all campaigns with optional filters
    async getAllCampaigns(filters = {}) {
        try {
            // Build query string
            const queryParams = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key]) {
                    queryParams.append(key, filters[key]);
                }
            });

            const url = `${this.baseURL}/campaigns?${queryParams}`;
            console.log('Fetching campaigns from:', url);

            const token = await this.getAuthToken();
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            });

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const textResponse = await response.text();
                console.error('Backend response (non-JSON):', textResponse);
                throw new Error(`Campaign API error: Backend returned non-JSON response. Status: ${response.status}. Response: ${textResponse.substring(0, 200)}`);
            }

            const data = await response.json();
            console.log('✅ API Response Status:', response.status);
            console.log('✅ API Response Data:', JSON.stringify(data, null, 2));

            if (!response.ok) {
                console.error('❌ Backend error response:', data);
                throw new Error(data.message || data.error || `Failed to fetch campaigns (Status: ${response.status})`);
            }

            // Log the structure to help debug
            console.log('✅ Response structure check:');
            console.log('  - Has success field:', 'success' in data);
            console.log('  - Has data field:', 'data' in data);
            console.log('  - Has campaigns field:', data.data && 'campaigns' in data.data);
            console.log('  - Data type:', typeof data);

            if (data.data) {
                console.log('  - data.data type:', typeof data.data);
                console.log('  - data.data is array:', Array.isArray(data.data));
                if (Array.isArray(data.data) && data.data.length > 0) {
                    console.log('  - Array length:', data.data.length);
                    console.log('  - First item keys:', Object.keys(data.data[0]));
                }
            }

            // Transform backend data to match app expectations
            if (data.success && Array.isArray(data.data)) {
                console.log('🔄 Transforming', data.data.length, 'campaigns...');
                data.data = data.data.map(campaign => {
                    const transformed = {
                        ...campaign,
                        // Ensure location is properly structured
                        location: campaign.location || {
                            address: campaign.address || 'Location not specified',
                            city: campaign.city || '',
                            state: campaign.state || '',
                            coordinates: campaign.coordinates || { latitude: 0, longitude: 0 }
                        },
                        // Map organizer from joined data if needed
                        organizer: campaign.organizer || campaign.users?.full_name || 'Unknown Organizer',
                        organizer_email: campaign.organizer_email || campaign.users?.email || '',
                        organizer_contact: campaign.organizer_contact || campaign.contact_phone || '0000000000',
                        // Map blood bank from joined data if needed
                        blood_bank: campaign.blood_bank || (campaign.blood_banks ? {
                            name: campaign.blood_banks.name,
                            address: campaign.blood_banks.address,
                            city: campaign.blood_banks.city,
                            state: campaign.blood_banks.state,
                            phone: campaign.blood_banks.phone,
                            email: campaign.blood_banks.email
                        } : null),
                        // Ensure arrays exist
                        blood_types_needed: campaign.blood_types_needed || [],
                        requirements: campaign.requirements || [],
                        benefits: campaign.benefits || [],
                        // Ensure numbers
                        registered_donors: campaign.registered_donors || 0,
                        max_donors: campaign.max_donors || 0
                    };
                    console.log('  ✅ Transformed campaign:', transformed.id, transformed.title);
                    return transformed;
                });
            }

            return data;

        } catch (error) {
            console.error('Error fetching campaigns:', error);
            if (error.message.includes('JSON Parse error')) {
                throw new Error('Campaign API endpoints not implemented on backend. Please implement /api/campaigns endpoint.');
            }
            throw error;
        }
    }// Get campaign details by ID
    async getCampaignById(campaignId) {
        try {
            const token = await this.getAuthToken();
            const response = await fetch(`${this.baseURL}/campaigns/${campaignId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const textResponse = await response.text();
                console.error('Backend response (non-JSON):', textResponse);
                throw new Error(`Campaign API error: Backend returned non-JSON response. Status: ${response.status}`);
            }

            const data = await response.json();

            if (!response.ok) {
                console.error('Backend error response:', data);
                throw new Error(data.message || data.error || `Campaign not found (Status: ${response.status})`);
            }

            return data;

        } catch (error) {
            console.error('Error fetching campaign details:', error);
            throw error;
        }
    }    // Register for a campaign
    async registerForCampaign(campaignId, additionalData = {}) {
        try {
            const user = await this.getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const token = await this.getAuthToken();
            const response = await fetch(`${this.baseURL}/campaigns/${campaignId}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(additionalData)
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const textResponse = await response.text();
                console.error('Backend response (non-JSON):', textResponse);
                throw new Error(`Registration API error: Backend returned non-JSON response. Status: ${response.status}. Response: ${textResponse.substring(0, 200)}`);
            }

            const data = await response.json();

            if (!response.ok) {
                console.error('Backend error response:', data);
                throw new Error(data.message || data.error || `Failed to register for campaign (Status: ${response.status})`);
            }

            return data;

        } catch (error) {
            console.error('Error registering for campaign:', error);
            throw error;
        }
    }    // Cancel campaign registration - NOT IMPLEMENTED
    async cancelRegistration(campaignId) {
        // This endpoint is not available on your backend
        throw new Error('Registration cancellation is not available. Contact campaign organizer directly.');
    }// Get user's campaign registrations - NOT IMPLEMENTED
    async getUserRegistrations() {
        // This endpoint is not available on your backend
        return {
            success: true,
            message: 'User registrations not available',
            data: {
                registrations: [],
                total: 0
            }
        };
    }// Check registration status for a specific campaign - NOT IMPLEMENTED
    async getRegistrationStatus(campaignId) {
        // This endpoint is not available on your backend
        return {
            success: true,
            message: 'Registration status check not available',
            data: {
                is_registered: false,
                registration: null
            }
        };
    }// Get user campaign statistics - NOT IMPLEMENTED
    async getUserCampaignStats() {
        // This endpoint is not available on your backend
        return {
            success: true,
            message: 'User campaign statistics not available',
            data: {
                stats: {
                    total_registrations: 0,
                    completed_donations: 0,
                    upcoming_campaigns: 0,
                    cancelled_registrations: 0,
                    no_shows: 0
                }
            }
        };
    }
}

export default new CampaignService();
