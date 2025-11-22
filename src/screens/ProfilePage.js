import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context';
import authService from '../api/authentication';

/*
 * Profile Page Component
 * ======================
 * 
 * Implements session-based authentication for profile data fetching.
 * 
 * Data Flow:
 * 1. Component mounts → useEffect → fetchProfile()
 * 2. fetchProfile() → GET /api/user/profile (no auth headers)
 * 3. Server validates session cookies → supabase.auth.getUser()
 * 4. Server queries users & blood_donors tables
 * 5. Returns combined profile data → setState → UI updates
 * 
 * Expected API Response Structure:
 * {
 *   "success": true,
 *   "message": "Profile retrieved successfully", 
 *   "data": {
 *     "user": {
 *       "id": "uuid",
 *       "email": "user@example.com",
 *       "full_name": "John Doe",
 *       "avatar_url": "https://supabase-url/storage/.../profile.jpg",
 *       "blood_type": "O+",
 *       // ... other user fields
 *     },
 *     "donor": {
 *       "id": "uuid", 
 *       "blood_type": "O+",
 *       "total_donations": 5,
 *       "is_available": true,
 *       // ... other donor fields (null if not a donor)
 *     }
 *   }
 * }
 * 
 * Authentication Features:
 * - Automatic session handling via cookies
 * - No manual token management required
 * - NO FALLBACK: Shows error if real data cannot be fetched
 * - 401 handling for expired sessions
 */

const ProfilePage = ({ navigation }) => {
    const { logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);

    // Profile Page Load - Initialize profile data fetching
    // This triggers the session-based authentication flow
    useEffect(() => {
        console.log('Profile Page Load - useEffect triggered');
        fetchProfile(); // Start the authentication and data fetching process
    }, []);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);

            console.log('Profile Page Load - Starting fetchProfile()');

            // Use authentication service to handle Bearer token authentication
            const result = await authService.getUserProfile();

            if (!result.success) {
                if (result.requiresAuth) {
                    console.log('Authentication Flow: 401 Unauthorized - Session expired or invalid');
                    Alert.alert(
                        'Authentication Required',
                        'Your session has expired. Please login again to access your profile.',
                        [
                            {
                                text: 'Go to Login',
                                onPress: () => {
                                    // Clear authentication state and navigate to login
                                    logout();
                                },
                            }
                        ]
                    );
                    return;
                }
                throw new Error(result.message || 'Failed to retrieve profile data');
            }

            // Validate API response structure
            if (!result.data || !result.data.user) {
                throw new Error('Invalid profile data structure received from server');
            }

            // Update profile state with server data
            setProfileData(result.data);
            console.log('Profile Page: State updated with server data');
            console.log('Profile Data Structure:', {
                hasUserData: !!result.data.user,
                hasDonorData: !!result.data.donor,
                userId: result.data.user?.id || 'N/A',
                userEmail: result.data.user?.email || 'N/A',
                bloodType: result.data.user?.blood_type || 'N/A',
                hasAvatar: !!result.data.user?.avatar_url
            });

        } catch (error) {
            console.error('Profile Fetch Error:', error.message);

            // Show error and require retry
            Alert.alert(
                'Profile Load Failed',
                `Unable to load your profile data: ${error.message}`,
                [
                    {
                        text: 'Retry',
                        onPress: fetchProfile,
                    },
                    {
                        text: 'Go Back',
                        style: 'cancel',
                        onPress: () => navigation.goBack(),
                    }
                ]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: performLogout,
                },
            ]
        );
    };

    const performLogout = async () => {
        try {
            setIsLoggingOut(true);
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout. Please try again.');
        } finally {
            setIsLoggingOut(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not provided';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E53E3E" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    if (!profileData) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Failed to load profile</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const { user, donor } = profileData;

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={fetchProfile}
                >
                    <Text style={styles.refreshIcon}>↻</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Avatar */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {(user?.full_name || 'U').charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.userName}>
                        {user?.full_name || 'User'}
                    </Text>
                    <Text style={styles.userRole}>
                        {user?.role === 'normal_user' ? 'Patient' : user?.role || 'User'}
                    </Text>
                    {user?.is_active && (
                        <View style={styles.activeStatus}>
                            <Text style={styles.activeStatusText}>● Active</Text>
                        </View>
                    )}
                </View>

                {/* Personal Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    {!donor && (
                        <View style={styles.infoNote}>
                            <Text style={styles.infoNoteText}>
                                ℹ️ Showing basic profile information. Full profile data requires server connection.
                            </Text>
                        </View>
                    )}

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Full Name</Text>
                        <Text style={styles.infoValue}>{user?.full_name || 'Not provided'}</Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{user?.email || 'Not provided'}</Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Phone</Text>
                        <Text style={styles.infoValue}>{user?.phone || 'Not provided'}</Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Date of Birth</Text>
                        <Text style={styles.infoValue}>{formatDate(user?.date_of_birth)}</Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Gender</Text>
                        <Text style={styles.infoValue}>{user?.gender || 'Not provided'}</Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Blood Type</Text>
                        <Text style={styles.infoValue}>{user?.blood_type || 'Not provided'}</Text>
                    </View>
                </View>

                {/* Address Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Address</Text>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Street Address</Text>
                        <Text style={styles.infoValue}>{user?.address || 'Not provided'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoItemHalf}>
                            <Text style={styles.infoLabel}>City</Text>
                            <Text style={styles.infoValue}>{user?.city || 'N/A'}</Text>
                        </View>
                        <View style={styles.infoItemHalf}>
                            <Text style={styles.infoLabel}>State</Text>
                            <Text style={styles.infoValue}>{user?.state || 'N/A'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Pincode</Text>
                        <Text style={styles.infoValue}>{user?.pincode || 'Not provided'}</Text>
                    </View>
                </View>

                {/* Medical Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Medical Information</Text>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Allergies</Text>
                        <Text style={styles.infoValue}>{user?.allergies || 'None'}</Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Medical Conditions</Text>
                        <Text style={styles.infoValue}>{user?.medical_conditions || 'None'}</Text>
                    </View>
                </View>

                {/* Emergency Contact */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Emergency Contact</Text>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Contact Name</Text>
                        <Text style={styles.infoValue}>{user?.emergency_contact_name || 'Not provided'}</Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Contact Phone</Text>
                        <Text style={styles.infoValue}>{user?.emergency_contact_phone || 'Not provided'}</Text>
                    </View>
                </View>

                {/* Donor Information */}
                {donor && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Donor Information</Text>

                        <View style={styles.donorStatusCard}>
                            <View style={styles.donorStatusRow}>
                                <Text style={styles.donorStatusLabel}>Status</Text>
                                <View style={[styles.statusBadge, donor.is_available ? styles.statusAvailable : styles.statusUnavailable]}>
                                    <Text style={styles.statusBadgeText}>
                                        {donor.is_available ? 'Available' : 'Unavailable'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoItemHalf}>
                                <Text style={styles.infoLabel}>Blood Type</Text>
                                <Text style={styles.infoValue}>{donor.blood_type || 'N/A'}</Text>
                            </View>
                            <View style={styles.infoItemHalf}>
                                <Text style={styles.infoLabel}>Weight</Text>
                                <Text style={styles.infoValue}>{donor.weight ? `${donor.weight} kg` : 'N/A'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Total Donations</Text>
                            <Text style={styles.infoValue}>{donor.total_donations || 0}</Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Last Donation Date</Text>
                            <Text style={styles.infoValue}>{formatDate(donor.last_donation_date)}</Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Next Eligible Date</Text>
                            <Text style={styles.infoValue}>{formatDate(donor.next_eligible_date)}</Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Medications</Text>
                            <Text style={styles.infoValue}>{donor.medications || 'None'}</Text>
                        </View>
                    </View>
                )}

                {/* Logout Button */}
                <View style={styles.logoutSection}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.logoutButtonText}>Logout</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* App Version */}
                <View style={styles.versionSection}>
                    <Text style={styles.versionText}>BloodConnect v1.0.0</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666666',
    },
    errorText: {
        fontSize: 16,
        color: '#E53E3E',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#E53E3E',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#F8F8F8',
    },
    backIcon: {
        fontSize: 20,
        color: '#333333',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
    },
    refreshButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#F8F8F8',
    },
    refreshIcon: {
        fontSize: 20,
        color: '#333333',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E53E3E',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 5,
    },
    userRole: {
        fontSize: 16,
        color: '#666666',
        textTransform: 'capitalize',
    },
    activeStatus: {
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: '#D4EDDA',
        borderRadius: 12,
    },
    activeStatusText: {
        fontSize: 14,
        color: '#155724',
        fontWeight: '500',
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 15,
    },
    infoItem: {
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    infoItemHalf: {
        flex: 1,
        marginHorizontal: 5,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 5,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 16,
        color: '#333333',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
        textTransform: 'capitalize',
    },
    donorStatusCard: {
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
        padding: 16,
        marginBottom: 15,
    },
    donorStatusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    donorStatusLabel: {
        fontSize: 16,
        color: '#333333',
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusAvailable: {
        backgroundColor: '#D4EDDA',
    },
    statusUnavailable: {
        backgroundColor: '#F8D7DA',
    },
    statusBadgeText: {
        fontSize: 14,
        fontWeight: '600',
    },
    logoutSection: {
        marginBottom: 30,
    },
    logoutButton: {
        backgroundColor: '#E53E3E',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    versionSection: {
        alignItems: 'center',
        paddingBottom: 30,
    },
    versionText: {
        fontSize: 14,
        color: '#999999',
    },
    infoNote: {
        backgroundColor: '#E3F2FD',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
    },
    infoNoteText: {
        fontSize: 14,
        color: '#1976D2',
        textAlign: 'center',
    },
});

export default ProfilePage;
