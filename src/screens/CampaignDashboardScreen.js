import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
    ActivityIndicator,
    Image,
} from 'react-native';
import { campaignService } from '../api';
import { useAuth } from '../context';

const CampaignDashboardScreen = ({ navigation }) => {
    const [campaigns, setCampaigns] = useState([]);
    const [userRegistrations, setUserRegistrations] = useState([]);
    const [registeredCampaignIds, setRegisteredCampaignIds] = useState(new Set());
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('upcoming'); // my-registrations, upcoming
    const { user } = useAuth();

    useEffect(() => {
        loadDashboardData();
    }, []); const loadDashboardData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                loadCampaigns().catch(error => {
                    console.log('Campaigns API not available:', error.message);
                }),
                loadUserRegistrations().catch(error => {
                    console.log('User registrations API not available:', error.message);
                }),
                loadUserStats().catch(error => {
                    console.log('User stats API not available:', error.message);
                })
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCampaigns = async (filters = {}) => {
        try {
            console.log('📱 Loading campaigns with filters:', filters);
            const response = await campaignService.getAllCampaigns(filters);
            console.log('📱 Response received:', response);
            console.log('📱 Response.success:', response.success);
            console.log('📱 Response.data:', response.data);

            if (response.success) {
                // Backend returns: { success: true, data: [...campaigns], message: "..." }
                // So response.data is the campaigns array directly
                let campaignsArray = [];

                if (Array.isArray(response.data)) {
                    console.log('📱 ✅ Data is array directly (correct format)');
                    campaignsArray = response.data;
                } else if (response.data && Array.isArray(response.data.campaigns)) {
                    console.log('📱 Data has campaigns array nested');
                    campaignsArray = response.data.campaigns;
                } else if (response.data && typeof response.data === 'object') {
                    console.log('📱 Data is single object, wrapping in array');
                    campaignsArray = [response.data];
                } else {
                    console.log('📱 ⚠️ Unknown data structure');
                    campaignsArray = [];
                }

                console.log('📱 Setting campaigns array with', campaignsArray.length, 'items');
                if (campaignsArray.length > 0) {
                    console.log('📱 First campaign sample:', JSON.stringify(campaignsArray[0], null, 2));
                }
                setCampaigns(campaignsArray);
            } else {
                console.log('📱 ❌ Response.success is false');
                Alert.alert('API Error', 'Backend returned success: false');
            }
        } catch (error) {
            console.error('❌ Error loading campaigns:', error);
            console.error('❌ Error stack:', error.stack);
            Alert.alert('API Error', error.message || 'Failed to load campaigns');
        }
    };

    const loadUserRegistrations = async () => {
        try {
            if (!user) {
                setUserRegistrations([]);
                setRegisteredCampaignIds(new Set());
                return;
            }

            console.log('📋 Loading user registrations...');
            const response = await campaignService.getUserRegistrations();
            console.log('📋 Registrations response:', response);

            if (response.success) {
                // Handle both response.data (array) and response.data.registrations (object with array)
                const registrations = Array.isArray(response.data)
                    ? response.data
                    : (response.data?.registrations || []);

                console.log('📋 Found', registrations.length, 'registrations');
                setUserRegistrations(registrations);

                // Create a Set of registered campaign IDs for quick lookup
                const ids = new Set(registrations.map(reg => reg.campaign_id));
                console.log('📋 Registered campaign IDs:', Array.from(ids));
                setRegisteredCampaignIds(ids);
            }
        } catch (error) {
            console.error('Error loading user registrations:', error);
        }
    };

    const loadUserStats = async () => {
        try {
            if (!user) return;
            const response = await campaignService.getUserCampaignStats();
            if (response.success) {
                setUserStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    };

    const handleTabChange = async (tab) => {
        setActiveTab(tab);
        if (tab === 'upcoming') {
            await loadCampaigns({ status: 'upcoming' });
        } else if (tab === 'my-registrations') {
            await loadUserRegistrations();
        }
    };

    const handleCampaignPress = (campaign) => {
        navigation.navigate('CampaignDetails', { campaign });
    };

    const handleRegisterPress = async (campaign) => {
        if (!user) {
            Alert.alert('Login Required', 'Please login to register for campaigns.');
            return;
        }

        Alert.alert(
            'Confirm Registration',
            `Do you want to register for "${campaign.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Register',
                    onPress: async () => {
                        try {
                            const response = await campaignService.registerForCampaign(campaign.id);
                            if (response.success) {
                                Alert.alert('Success', 'Successfully registered for the campaign!');
                                // Add to registered IDs immediately
                                setRegisteredCampaignIds(prev => new Set([...prev, campaign.id]));
                                // Refresh user registrations
                                await loadUserRegistrations();
                            }
                        } catch (error) {
                            console.error('Registration error:', error);

                            // Show helpful message for authentication errors
                            if (error.message.includes('Unauthorized')) {
                                Alert.alert(
                                    'Backend Configuration Needed',
                                    'Campaign registration requires the backend to return the Supabase session token during login.\n\nPlease check BACKEND_FIX_AUTH.md for the 2-minute fix.',
                                    [{ text: 'OK' }]
                                );
                            } else {
                                Alert.alert('Error', error.message || 'Failed to register for campaign');
                            }
                        }
                    }
                }
            ]
        );
    };    // Cancel registration not available - API endpoint not implemented

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'upcoming': return '#007AFF';
            case 'active': return '#34C759';
            case 'completed': return '#8E8E93';
            case 'cancelled': return '#FF3B30';
            default: return '#8E8E93';
        }
    };

    const renderStatsCard = () => {
        if (!user || !userStats) return null;

        const totalReg = userStats.total_registrations ?? 0;
        const upcomingCamp = userStats.upcoming_campaigns ?? 0;

        return (
            <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>Your Campaign Activity</Text>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{totalReg.toString()}</Text>
                        <Text style={styles.statLabel}>Registered Campaigns</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{upcomingCamp.toString()}</Text>
                        <Text style={styles.statLabel}>Upcoming Campaigns</Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderCampaignCard = (campaign, showRegistrationButton = true) => {
        if (!campaign) return null;

        return (
            <TouchableOpacity
                key={campaign.id}
                style={styles.campaignCard}
                onPress={() => handleCampaignPress(campaign)}
            >
                <View style={styles.campaignHeader}>
                    <View style={styles.campaignInfo}>
                        <Text style={styles.campaignTitle}>{campaign.title || 'No Title'}</Text>
                        <Text style={styles.campaignOrganizer}>{campaign.organizer || 'Unknown Organizer'}</Text>
                        <Text style={styles.campaignLocation}>
                            {campaign.location?.address || 'Location not specified'}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(campaign.status) }]}>
                        <Text style={styles.statusText}>{(campaign.status || 'unknown').toUpperCase()}</Text>
                    </View>
                </View>

                <View style={styles.campaignDetails}>
                    <Text style={styles.detailText}>📅 {campaign.date ? formatDate(campaign.date) : 'Date TBD'}</Text>
                    <Text style={styles.detailText}>
                        🕒 {campaign.start_time && campaign.end_time ?
                            `${formatTime(campaign.start_time)} - ${formatTime(campaign.end_time)}` :
                            'Time TBD'
                        }
                    </Text>
                    <Text style={styles.detailText}>
                        📍 {campaign.location?.city || campaign.city}, {campaign.location?.state || campaign.state}
                    </Text>
                </View>

                {campaign.blood_types_needed && campaign.blood_types_needed.length > 0 && (
                    <View style={styles.bloodTypesContainer}>
                        <Text style={styles.bloodTypesLabel}>Blood types needed:</Text>
                        <View style={styles.bloodTypes}>
                            {campaign.blood_types_needed.map((type, index) => (
                                <View key={index} style={styles.bloodTypeBadge}>
                                    <Text style={styles.bloodTypeText}>{type}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {showRegistrationButton && (
                    <View style={styles.actionContainer}>
                        {registeredCampaignIds.has(campaign.id) ? (
                            <View style={styles.registeredButton}>
                                <Text style={styles.registeredButtonText}>✓ Registered</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[
                                    styles.registerButton,
                                    campaign.status !== 'upcoming' && styles.disabledButton
                                ]}
                                onPress={() => handleRegisterPress(campaign)}
                                disabled={campaign.status !== 'upcoming'}
                            >
                                <Text style={[
                                    styles.registerButtonText,
                                    campaign.status !== 'upcoming' && styles.disabledButtonText
                                ]}>
                                    {campaign.status === 'upcoming' ? 'Register Now' : 'Registration Closed'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    }; const renderRegistrationCard = (registration) => {
        if (!registration || !registration.campaign) return null;

        return (
            <View key={registration.id} style={styles.registrationCard}>
                <View style={styles.registrationHeader}>
                    <Text style={styles.registrationTitle}>{registration.campaign.title || 'No Title'}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(registration.status) }]}>
                        <Text style={styles.statusText}>{(registration.status || 'unknown').toUpperCase()}</Text>
                    </View>
                </View>

                <Text style={styles.registrationOrganizer}>{registration.campaign.organizer || 'Unknown Organizer'}</Text>
                <Text style={styles.registrationLocation}>
                    {registration.campaign.location?.address || 'Location not specified'}
                </Text>

                <View style={styles.registrationDetails}>
                    <Text style={styles.detailText}>
                        📅 {registration.campaign.date ? formatDate(registration.campaign.date) : 'Date TBD'}
                    </Text>
                    <Text style={styles.detailText}>
                        🕒 {registration.campaign.start_time && registration.campaign.end_time ?
                            `${formatTime(registration.campaign.start_time)} - ${formatTime(registration.campaign.end_time)}` :
                            'Time TBD'
                        }
                    </Text>
                    <Text style={styles.detailText}>
                        📝 Registered: {registration.registration_date ? formatDate(registration.registration_date) : 'Date unknown'}
                    </Text>
                </View>

                {registration.status === 'confirmed' && (
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => handleCancelRegistration(registration.campaign_id, registration.campaign.title)}
                    >
                        <Text style={styles.cancelButtonText}>Cancel Registration</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading campaigns...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Blood Donation Campaigns</Text>
            </View>

            {/* Stats Card */}
            {user && renderStatsCard()}            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'my-registrations' && styles.activeTab]}
                    onPress={() => handleTabChange('my-registrations')}
                >
                    <Text style={[styles.tabText, activeTab === 'my-registrations' && styles.activeTabText]}>
                        My Registrations
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
                    onPress={() => handleTabChange('upcoming')}
                >
                    <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
                        Upcoming
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                {activeTab === 'my-registrations' ? (
                    !userRegistrations || userRegistrations.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No registrations yet</Text>
                            <Text style={styles.emptyStateSubtext}>Register for upcoming campaigns to see them here</Text>
                        </View>
                    ) : (
                        userRegistrations.map(registration => renderRegistrationCard(registration))
                    )
                ) : (
                    campaigns.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No upcoming campaigns</Text>
                            <Text style={styles.emptyStateSubtext}>Check back later for new campaigns</Text>
                        </View>
                    ) : (
                        campaigns.map(campaign => renderCampaignCard(campaign))
                    )
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    backButton: {
        marginRight: 15,
    },
    backButtonText: {
        fontSize: 16,
        color: '#007AFF',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        flex: 1,
    },
    statsCard: {
        backgroundColor: '#FFFFFF',
        margin: 20,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#007AFF',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
    },
    activeTabText: {
        color: '#007AFF',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    campaignCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    campaignHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    campaignInfo: {
        flex: 1,
        marginRight: 10,
    },
    campaignTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 5,
    },
    campaignOrganizer: {
        fontSize: 14,
        color: '#007AFF',
        marginBottom: 3,
    },
    campaignLocation: {
        fontSize: 14,
        color: '#666',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    campaignDetails: {
        marginBottom: 15,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    bloodTypesContainer: {
        marginBottom: 15,
    },
    bloodTypesLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    bloodTypes: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    bloodTypeBadge: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    bloodTypeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    actionContainer: {
        marginTop: 10,
    },
    registerButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    registerButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    disabledButton: {
        backgroundColor: '#E5E5EA',
    },
    disabledButtonText: {
        color: '#8E8E93',
    },
    registeredButton: {
        backgroundColor: '#34C759',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    registeredButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    registeredContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    registeredText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#34C759',
    },
    cancelButton: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 6,
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    registrationCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    registrationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    registrationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        flex: 1,
        marginRight: 10,
    },
    registrationOrganizer: {
        fontSize: 14,
        color: '#007AFF',
        marginBottom: 3,
    },
    registrationLocation: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    registrationDetails: {
        marginBottom: 15,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    }, emptyStateSubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    apiStatusText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 15,
        paddingHorizontal: 20,
        lineHeight: 18,
    },
});

export default CampaignDashboardScreen;
