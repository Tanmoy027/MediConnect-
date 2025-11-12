import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL
const API_BASE_URL = 'https://test-mediconnect.vercel.app/api';

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

            if (!response.ok) {
                console.error('❌ Backend error response:', data);
                throw new Error(data.message || data.error || `Failed to fetch campaigns (Status: ${response.status})`);
            }

            // Transform backend data to match app expectations
            if (data.success && Array.isArray(data.data)) {
                data.data = data.data.map(campaign => {
                    // Parse dates from backend format
                    const startDate = campaign.start_date ? new Date(campaign.start_date) : null;
                    const endDate = campaign.end_date ? new Date(campaign.end_date) : null;

                    const transformed = {
                        ...campaign,
                        // Convert start_date to date and start_time
                        date: startDate ? startDate.toISOString().split('T')[0] : null,
                        start_time: startDate ? startDate.toTimeString().slice(0, 5) : null,
                        end_time: endDate ? endDate.toTimeString().slice(0, 5) : null,
                        // Ensure location is properly structured
                        location: {
                            address: campaign.address || campaign.venue || 'Location not specified',
                            city: campaign.city || '',
                            state: campaign.state || '',
                            coordinates: {
                                latitude: campaign.latitude || 0,
                                longitude: campaign.longitude || 0
                            }
                        },
                        // Map organizer from joined data
                        organizer: campaign.users?.full_name || 'Unknown Organizer',
                        organizer_email: campaign.users?.email || '',
                        organizer_contact: campaign.contact_number || '0000000000',
                        // Map blood bank from joined data
                        blood_bank: campaign.blood_banks ? {
                            name: campaign.blood_banks.name || '',
                            address: campaign.blood_banks.address || '',
                            city: campaign.blood_banks.city || '',
                            state: campaign.blood_banks.state || '',
                            phone: campaign.blood_banks.phone || '',
                            email: campaign.blood_banks.email || ''
                        } : null,
                        // Ensure arrays exist
                        blood_types_needed: campaign.blood_types_needed || [],
                        requirements: campaign.requirements || [],
                        benefits: campaign.benefits || [],
                        // Map target_donors to max_donors
                        max_donors: campaign.target_donors || campaign.max_donors || 0,
                        registered_donors: campaign.registered_donors || 0
                    };
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
            console.log('🔑 Registration - User ID:', user.id);
            console.log('🔑 Registration - Token exists:', !!token);

            const isTemporaryToken = token && (token.startsWith('user-token-') || token.startsWith('temp-token-'));
            console.log('🔑 Registration - Token type:', token ? (isTemporaryToken ? '⚠️ Temporary token (backend needs to return session)' : '✅ Real Supabase token') : 'NO TOKEN');

            if (!token) {
                throw new Error('No authentication token found. Please login again.');
            }

            const url = `${this.baseURL}/campaigns/${campaignId}/register`;
            console.log('📤 Registering at:', url);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(additionalData)
            });

            console.log('📥 Registration response status:', response.status);

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
    }// Get user's campaign registrations
    async getUserRegistrations() {
        try {
            const user = await this.getCurrentUser();
            if (!user) {
                return {
                    success: true,
                    data: {
                        registrations: [],
                        total: 0
                    }
                };
            }

            const token = await this.getAuthToken();
            console.log('📋 Fetching from:', `${this.baseURL}/campaigns/registrations`);

            const response = await fetch(`${this.baseURL}/campaigns/registrations`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                // If endpoint doesn't exist, return empty
                return {
                    success: true,
                    data: {
                        registrations: [],
                        total: 0
                    }
                };
            }

            const data = await response.json();

            // Transform registrations to include campaign data
            if (data.success && Array.isArray(data.data)) {
                data.data = data.data.map(reg => ({
                    ...reg,
                    campaign: reg.campaigns ? this.transformCampaign(reg.campaigns) : null
                }));
            }

            return data;
        } catch (error) {
            console.error('Error fetching user registrations:', error);
            return {
                success: true,
                data: {
                    registrations: [],
                    total: 0
                }
            };
        }
    }

    // Helper method to transform campaign data
    transformCampaign(campaign) {
        const startDate = campaign.start_date ? new Date(campaign.start_date) : null;
        const endDate = campaign.end_date ? new Date(campaign.end_date) : null;

        return {
            ...campaign,
            date: startDate ? startDate.toISOString().split('T')[0] : null,
            start_time: startDate ? startDate.toTimeString().slice(0, 5) : null,
            end_time: endDate ? endDate.toTimeString().slice(0, 5) : null,
            location: {
                address: campaign.address || campaign.venue || 'Location not specified',
                city: campaign.city || '',
                state: campaign.state || '',
                coordinates: {
                    latitude: campaign.latitude || 0,
                    longitude: campaign.longitude || 0
                }
            },
            organizer: campaign.users?.full_name || 'Unknown Organizer',
            organizer_email: campaign.users?.email || '',
            organizer_contact: campaign.contact_number || '0000000000',
            blood_bank: campaign.blood_banks ? {
                name: campaign.blood_banks.name || '',
                address: campaign.blood_banks.address || '',
                city: campaign.blood_banks.city || '',
                state: campaign.blood_banks.state || '',
                phone: campaign.blood_banks.phone || '',
                email: campaign.blood_banks.email || ''
            } : null,
            blood_types_needed: campaign.blood_types_needed || [],
            requirements: campaign.requirements || [],
            benefits: campaign.benefits || [],
            max_donors: campaign.target_donors || campaign.max_donors || 0,
            registered_donors: campaign.registered_donors || 0
        };
    }// Check registration status for a specific campaign
    async getRegistrationStatus(campaignId) {
        try {
            const user = await this.getCurrentUser();
            if (!user) {
                return {
                    success: true,
                    data: {
                        is_registered: false,
                        registration: null
                    }
                };
            }

            const token = await this.getAuthToken();
            const response = await fetch(`${this.baseURL}/campaigns/${campaignId}/registration-status`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                // If endpoint doesn't exist, return not registered
                return {
                    success: true,
                    data: {
                        is_registered: false,
                        registration: null
                    }
                };
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error checking registration status:', error);
            // Return not registered on error
            return {
                success: true,
                data: {
                    is_registered: false,
                    registration: null
                }
            };
        }
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
