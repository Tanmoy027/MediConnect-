// Base API URL - Your actual API endpoint
const API_BASE_URL = 'https://test-mediconnect.vercel.app/api';

// Demo mode for testing when API is having issues
const DEMO_MODE = false; // Set to true for demo mode

import AsyncStorage from '@react-native-async-storage/async-storage';

/*
 * Profile Data Fetching Process
 * ============================
 * 
 * This service implements session-based authentication for profile data fetching:
 * 
 * 1. Client-Side Request (Profile Page):
 *    - useEffect calls fetchProfile() when page loads
 *    - Makes simple fetch("/api/user/profile") request
 *    - No authentication headers needed (uses cookies/sessions)
 * 
 * 2. Server-Side Authentication (API Route):
 *    - /api/user/profile route handles authentication internally
 *    - Uses createClient() from server-side Supabase
 *    - Calls supabase.auth.getUser() which reads session from cookies
 * 
 * 3. Authentication Flow:
 *    - If no authenticated user: returns 401 Unauthorized
 *    - If user exists: fetches profile data from database
 *    - Queries both users & blood_donors tables
 *    - Returns combined user + donor data
 * 
 * 4. Data Flow Summary:
 *    Profile Page Load → fetchProfile() → GET /api/user/profile → 
 *    Server reads session from cookies → supabase.auth.getUser() → 
 *    Query users & blood_donors tables → Return user + donor data → 
 *    Profile page updates state
 * 
 * Key Features:
 * - No manual token management (Supabase handles session cookies automatically)
 * - Server-side authentication (API route validates user session)
 * - Database queries (fetches from both users and blood_donors tables)
 * - Automatic fallbacks (creates user record if doesn't exist)
 * - Session-based (uses cookies rather than access tokens)
 */

// Use AsyncStorage for persistent storage
const storage = AsyncStorage;

// Storage keys
const STORAGE_KEYS = {
    USER_TOKEN: '@mediconnect_user_token',
    USER_DATA: '@mediconnect_user_data',
    REFRESH_TOKEN: '@mediconnect_refresh_token',
};

class AuthenticationService {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.authToken = null;
    }

    // Initialize authentication state on app start
    async initializeAuth() {
        try {
            const token = await storage.getItem(STORAGE_KEYS.USER_TOKEN);
            const userData = await storage.getItem(STORAGE_KEYS.USER_DATA);

            if (token && userData) {
                this.authToken = token;
                this.currentUser = JSON.parse(userData);
                this.isAuthenticated = true;

                // Since your API doesn't use traditional JWT tokens,
                // we'll assume the stored user data is valid
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error initializing auth:', error);
            return false;
        }
    }

    // Login API call
    async login(email, password) {
        try {
            // Demo mode fallback
            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                const mockUser = {
                    id: 'demo-user-123',
                    email: email.toLowerCase().trim(),
                    full_name: 'Demo User',
                    role: 'normal_user',
                    phone: '+1234567890'
                };
                const mockToken = 'demo-token-' + Date.now();
                await this.storeAuthData(mockToken, mockUser);
                return {
                    success: true,
                    user: mockUser,
                    message: 'Demo login successful',
                };
            }

            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies for session-based auth
                body: JSON.stringify({
                    email: email.toLowerCase().trim(),
                    password: password,
                }),
            });

            const data = await response.json();
            console.log('Login API Response:', JSON.stringify(data, null, 2));

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Login failed');
            }

            if (data.success) {
                // Check if we have user data and session token
                console.log('Login response data:', JSON.stringify(data, null, 2));

                // Your backend should return: { success: true, data: { user, session } }
                const userData = data.data?.user || data.user;
                const session = data.data?.session || data.session;

                if (userData && userData.id) {
                    // Use the Supabase access token if available, otherwise create a temporary token
                    const accessToken = session?.access_token || `temp-token-${userData.id}-${Date.now()}`;
                    const refreshToken = session?.refresh_token;

                    if (!session?.access_token) {
                        console.warn('⚠️ No access_token in response! Using temporary token.');
                        console.warn('⚠️ Campaign registration will not work until backend returns session.access_token');
                    } else {
                        console.log('✅ Storing Supabase access token');
                    }

                    // Store authentication data
                    await this.storeAuthData(
                        accessToken,
                        userData,
                        refreshToken
                    );

                    return {
                        success: true,
                        user: userData,
                        message: data.message || 'Login successful',
                    };
                } else {
                    console.log('User data structure not found:', JSON.stringify(data, null, 2));
                    throw new Error('Invalid response format from server');
                }
            } else {
                throw new Error(data.error || data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);

            // If it's a network error and not demo mode, suggest checking connection
            if (error.message.includes('fetch') || error.message.includes('Network')) {
                return {
                    success: false,
                    message: 'Network error. Please check your internet connection and try again.',
                };
            }

            return {
                success: false,
                message: error.message || 'Login failed. Please try again.',
            };
        }
    }

    // Registration API call
    async register(email, password, fullName, phone = '') {
        try {
            // Demo mode fallback
            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                const mockUser = {
                    id: 'demo-user-' + Date.now(),
                    email: email.toLowerCase().trim(),
                    full_name: fullName.trim(),
                    role: 'normal_user',
                    phone: phone.trim()
                };
                return {
                    success: true,
                    user: mockUser,
                    message: 'Demo registration successful!',
                };
            }

            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies for session-based auth
                body: JSON.stringify({
                    email: email.toLowerCase().trim(),
                    password: password,
                    fullName: fullName.trim(),
                    phone: phone.trim(),
                    role: 'normal_user', // Default role
                }),
            });

            const data = await response.json();
            console.log('Registration API Response:', JSON.stringify(data, null, 2));

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Registration failed');
            }

            if (data.success) {
                // Check if we have user data
                if (data.data && data.data.user) {
                    // For APIs that don't return session tokens, create a simple token
                    const simpleToken = `user-token-${data.data.user.id}-${Date.now()}`;

                    // Store authentication data
                    await this.storeAuthData(
                        simpleToken,
                        data.data.user,
                        null // No refresh token
                    );
                }

                return {
                    success: true,
                    user: data.data?.user || data.user,
                    session: null, // No session object from your API
                    message: data.message || 'Registration successful!',
                };
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: error.message || 'Registration failed. Please try again.',
            };
        }
    }

    // Logout API call and clear local data
    async logout() {
        try {
            // Call logout API if we have a token
            if (this.authToken) {
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // Include cookies for session-based auth
                });
            }
        } catch (error) {
            console.error('Logout API error:', error);
            // Continue with local logout even if API call fails
        } finally {
            // Clear local storage and state
            await this.clearAuthData();
        }
    }

    // Get current user data
    async getCurrentUser() {
        try {
            if (!this.authToken) {
                throw new Error('No authentication token');
            }

            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get user data');
            }

            if (data.success) {
                // Update current user data
                this.currentUser = data.data?.user || data.user;
                await storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(this.currentUser));

                return {
                    success: true,
                    user: this.currentUser,
                };
            } else {
                throw new Error(data.message || 'Failed to get user data');
            }
        } catch (error) {
            console.error('Get current user error:', error);
            return {
                success: false,
                message: error.message || 'Failed to get user data',
            };
        }
    }

    // Get user profile with Bearer token authentication
    // This method uses the stored access token to authenticate with the API
    async getUserProfile() {
        try {
            console.log('Client-Side Request: Calling getUserProfile() with Bearer token');
            
            // Get the stored access token
            const token = await storage.getItem(STORAGE_KEYS.USER_TOKEN);
            if (!token) {
                console.log('Authentication Flow: No stored token found');
                return {
                    success: false,
                    message: 'Authentication required. Please login again.',
                    requiresAuth: true
                };
            }

            console.log('Making GET /api/user/profile request with Bearer token...');
            const response = await fetch(`${API_BASE_URL}/user/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Use Bearer token authentication
                },
                credentials: 'include', // Also include cookies for compatibility
            });

            console.log('GET /api/user/profile - Response status:', response.status);

            if (response.status === 401) {
                console.log('Authentication Flow: 401 Unauthorized - Session expired or invalid');
                // Clear stored auth data if session is invalid
                await this.clearAuthData();
                return {
                    success: false,
                    message: 'Authentication required. Please login again.',
                    requiresAuth: true
                };
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('Data Flow Summary: Received profile data from server');

            // Validate response structure matches expected API format
            if (!data.success) {
                throw new Error(data.error || data.message || 'API returned unsuccessful response');
            }

            if (!data.data || !data.data.user) {
                throw new Error('Invalid API response structure - missing user data');
            }

            console.log('Profile data structure validation:', {
                hasUser: !!data.data.user,
                hasDonor: !!data.data.donor,
                userId: data.data.user?.id || 'N/A',
                userEmail: data.data.user?.email || 'N/A',
                hasAvatarUrl: !!data.data.user?.avatar_url,
                donorTotalDonations: data.data.donor?.total_donations || 0
            });

            return {
                success: true,
                data: data.data, // Contains user and donor information
            };
        } catch (error) {
            console.error('Authentication Flow Error:', error.message);
            return {
                success: false,
                message: error.message || 'Failed to get profile data',
            };
        }
    }

    // Verify if current token is still valid
    async verifyToken() {
        try {
            if (!this.authToken) return false;

            const response = await fetch(`${API_BASE_URL}/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            return response.ok;
        } catch (error) {
            console.error('Token verification error:', error);
            return false;
        }
    }

    // Store authentication data securely
    async storeAuthData(token, user, refreshToken = null) {
        try {
            const dataToStore = [
                [STORAGE_KEYS.USER_TOKEN, token],
                [STORAGE_KEYS.USER_DATA, JSON.stringify(user)],
            ];

            if (refreshToken) {
                dataToStore.push([STORAGE_KEYS.REFRESH_TOKEN, refreshToken]);
            }

            await storage.multiSet(dataToStore);

            this.authToken = token;
            this.currentUser = user;
            this.isAuthenticated = true;
        } catch (error) {
            console.error('Error storing auth data:', error);
            throw new Error('Failed to store authentication data');
        }
    }

    // Clear all authentication data
    async clearAuthData() {
        try {
            await storage.multiRemove([
                STORAGE_KEYS.USER_TOKEN,
                STORAGE_KEYS.USER_DATA,
                STORAGE_KEYS.REFRESH_TOKEN,
            ]);

            this.authToken = null;
            this.currentUser = null;
            this.isAuthenticated = false;
        } catch (error) {
            console.error('Error clearing auth data:', error);
        }
    }

    // Get authentication headers for API calls
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json',
        };
    }

    // Check if user is authenticated
    isUserAuthenticated() {
        return this.isAuthenticated && this.authToken && this.currentUser;
    }

    // Get current user info
    getCurrentUserData() {
        return this.currentUser;
    }

    // Session validation helper
    // Checks if the current session is valid by attempting to fetch profile
    async validateSession() {
        try {
            console.log('Session Validation: Checking if session is still valid');

            const response = await fetch(`${API_BASE_URL}/user/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (response.status === 401) {
                console.log('Session Validation: Session expired or invalid');
                // Clear stored auth data if session is invalid
                await this.clearAuthData();
                return false;
            }

            if (response.ok) {
                console.log('Session Validation: Session is valid');
                return true;
            }

            return false;
        } catch (error) {
            console.error('Session Validation Error:', error.message);
            return false;
        }
    }

    // Clear authentication data (for session expiry)
    async clearAuthData() {
        try {
            await storage.multiRemove([
                STORAGE_KEYS.USER_TOKEN,
                STORAGE_KEYS.USER_DATA,
                STORAGE_KEYS.REFRESH_TOKEN
            ]);

            this.currentUser = null;
            this.isAuthenticated = false;
            this.authToken = null;

            console.log('Authentication data cleared');
        } catch (error) {
            console.error('Error clearing auth data:', error);
        }
    }

    // Update user profile
    async updateProfile(profileData) {
        try {
            if (!this.authToken) {
                throw new Error('No authentication token');
            }

            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Profile update failed');
            }

            // Update local user data
            this.currentUser = { ...this.currentUser, ...data.user };
            await storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(this.currentUser));

            return {
                success: true,
                user: this.currentUser,
                message: 'Profile updated successfully',
            };
        } catch (error) {
            console.error('Profile update error:', error);
            return {
                success: false,
                message: error.message || 'Profile update failed',
            };
        }
    }

    // Get campaigns with Bearer token authentication
    async getCampaigns(filters = {}) {
        try {
            const token = await storage.getItem(STORAGE_KEYS.USER_TOKEN);
            if (!token) {
                return {
                    success: false,
                    message: 'Authentication required. Please login again.',
                    requiresAuth: true
                };
            }

            // Build query string
            const queryParams = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key]) {
                    queryParams.append(key, filters[key]);
                }
            });

            const url = `${API_BASE_URL}/campaigns?${queryParams}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });

            if (response.status === 401) {
                await this.clearAuthData();
                return {
                    success: false,
                    message: 'Authentication required. Please login again.',
                    requiresAuth: true
                };
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('Get campaigns error:', error);
            return {
                success: false,
                message: error.message || 'Failed to get campaigns',
            };
        }
    }

    // Get user campaign registrations with Bearer token authentication
    async getUserCampaignRegistrations() {
        try {
            const token = await storage.getItem(STORAGE_KEYS.USER_TOKEN);
            if (!token) {
                return {
                    success: false,
                    message: 'Authentication required. Please login again.',
                    requiresAuth: true
                };
            }

            const response = await fetch(`${API_BASE_URL}/campaigns/registrations`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });

            if (response.status === 401) {
                await this.clearAuthData();
                return {
                    success: false,
                    message: 'Authentication required. Please login again.',
                    requiresAuth: true
                };
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('Get user campaign registrations error:', error);
            return {
                success: false,
                message: error.message || 'Failed to get user registrations',
            };
        }
    }

    // Get user campaign statistics with Bearer token authentication
    async getUserCampaignStats() {
        try {
            const token = await storage.getItem(STORAGE_KEYS.USER_TOKEN);
            if (!token) {
                return {
                    success: false,
                    message: 'Authentication required. Please login again.',
                    requiresAuth: true
                };
            }

            const response = await fetch(`${API_BASE_URL}/campaigns/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });

            if (response.status === 401) {
                await this.clearAuthData();
                return {
                    success: false,
                    message: 'Authentication required. Please login again.',
                    requiresAuth: true
                };
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('Get user campaign stats error:', error);
            return {
                success: false,
                message: error.message || 'Failed to get user stats',
            };
        }
    }

    // Register for campaign with Bearer token authentication
    async registerForCampaign(campaignId, additionalData = {}) {
        try {
            const token = await storage.getItem(STORAGE_KEYS.USER_TOKEN);
            if (!token) {
                return {
                    success: false,
                    message: 'Authentication required. Please login again.',
                    requiresAuth: true
                };
            }

            const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
                body: JSON.stringify(additionalData),
            });

            if (response.status === 401) {
                await this.clearAuthData();
                return {
                    success: false,
                    message: 'Authentication required. Please login again.',
                    requiresAuth: true
                };
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('Register for campaign error:', error);
            return {
                success: false,
                message: error.message || 'Failed to register for campaign',
            };
        }
    }

    // Change password
    async changePassword(currentPassword, newPassword) {
        try {
            if (!this.authToken) {
                throw new Error('No authentication token');
            }

            const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Password change failed');
            }

            return {
                success: true,
                message: 'Password changed successfully',
            };
        } catch (error) {
            console.error('Password change error:', error);
            return {
                success: false,
                message: error.message || 'Password change failed',
            };
        }
    }
}

// Create and export a singleton instance
const authService = new AuthenticationService();
export default authService;
