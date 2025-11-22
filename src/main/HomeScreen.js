import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context';
import BottomNavigation from '../components/BottomNavigation';
import authService from '../api/authentication';

const HomeScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('home');
    const { user, logout } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
    const [userRegistrations, setUserRegistrations] = useState([]);

    useEffect(() => {
        fetchCampaigns();
        fetchUserRegistrations();
    }, []);

    const fetchCampaigns = async () => {
        try {
            setIsLoadingCampaigns(true);
            const result = await authService.getCampaigns({
                status: 'upcoming',
                limit: 3
            });

            if (result.success) {
                setCampaigns(result.data || []);
            } else {
                console.error('Failed to fetch campaigns:', result.message);
            }
        } catch (error) {
            console.error('Campaign fetch error:', error);
        } finally {
            setIsLoadingCampaigns(false);
        }
    };

    const fetchUserRegistrations = async () => {
        try {
            const result = await authService.getUserCampaignRegistrations();
            if (result.success) {
                setUserRegistrations(result.data || []);
            }
        } catch (error) {
            console.error('User registrations fetch error:', error);
        }
    };

    const handleCampaignRegister = async (campaignId, campaignTitle) => {
        Alert.alert(
            'Register for Campaign',
            `Do you want to register for "${campaignTitle}"?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Register',
                    onPress: async () => {
                        try {
                            const result = await authService.registerForCampaign(campaignId);
                            if (result.success) {
                                Alert.alert('Success', result.message || 'Successfully registered for campaign!');
                                fetchUserRegistrations(); // Refresh registrations
                            } else {
                                Alert.alert('Error', result.message || 'Failed to register for campaign');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to register for campaign. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const isUserRegistered = (campaignId) => {
        return userRegistrations.some(reg => reg.campaign_id === campaignId);
    }; const handleTabPress = (tabId) => {
        setActiveTab(tabId);
        // Handle navigation to different screens based on tabId
        if (tabId === 'profile') {
            navigation.navigate('Profile');
        } else if (tabId === 'search') {
            navigation.navigate('FindHospital');
        } else if (tabId === 'bookings') {
            navigation.navigate('MyBookings');
        }
        console.log('Tab pressed:', tabId);
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
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const findOptions = [
        {
            id: 1,
            title: 'Find Donor',
            icon: '🔍',
            onPress: () => console.log('Find Donor pressed'),
        },
        {
            id: 2,
            title: 'Find Blood Bank',
            icon: '🏛️',
            onPress: () => console.log('Find Blood Bank pressed'),
        }, {
            id: 3,
            title: 'Find Vaccine',
            icon: '💉',
            onPress: () => navigation.navigate('FindVaccine'),
        },
        {
            id: 4,
            title: 'Find Hospital',
            icon: '🏥',
            onPress: () => navigation.navigate('FindHospital'),
        },
        {
            id: 5,
            title: 'Find Ambulance',
            icon: '🚑',
            onPress: () => navigation.navigate('FindAmbulance'),
        },
        {
            id: 6,
            title: 'My Bookings',
            icon: '�',
            onPress: () => navigation.navigate('MyBookings'),
        },
    ];

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.appName}>BloodConnect</Text>
                    {user && (
                        <Text style={styles.welcomeText}>Welcome, {user.full_name || user.fullName || 'User'}!</Text>
                    )}
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Text style={styles.notificationIcon}>🔔</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutIcon}>🚪</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Find Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Find</Text>

                    <View style={styles.findGrid}>
                        {findOptions.map((option, index) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.findCard,
                                    index === 4 && styles.findCardFull // Make last item full width
                                ]}
                                onPress={option.onPress}
                            >
                                <Text style={styles.findIcon}>{option.icon}</Text>
                                <Text style={styles.findTitle}>{option.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>                {/* Blood Donation Campaigns */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Blood Donation Campaigns</Text>
                        <TouchableOpacity
                            style={styles.viewAllButton}
                            onPress={() => navigation.navigate('CampaignDashboard')}
                        >
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {isLoadingCampaigns ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#E53E3E" />
                            <Text style={styles.loadingText}>Loading campaigns...</Text>
                        </View>
                    ) : campaigns.length > 0 ? (
                        campaigns.map((campaign) => (
                            <View key={campaign.id} style={styles.campaignCard}>
                                <View style={styles.campaignHeader}>
                                    <View style={styles.campaignInfo}>
                                        <Text style={styles.campaignTitle}>{campaign.title || 'Untitled Campaign'}</Text>
                                        <Text style={styles.campaignLocation}>
                                            📍 {campaign.venue || campaign.location || 'Location TBD'}
                                        </Text>
                                        <Text style={styles.campaignCity}>
                                            {campaign.city || 'City'}{campaign.state ? `, ${campaign.state}` : ''}
                                        </Text>
                                        <Text style={styles.campaignDate}>
                                            📅 {formatDate(campaign.start_date)}{campaign.start_time && campaign.end_time ? ` • ${formatTime(campaign.start_time)} - ${formatTime(campaign.end_time)}` : ''}
                                        </Text>
                                        {campaign.blood_types_needed && Array.isArray(campaign.blood_types_needed) && campaign.blood_types_needed.length > 0 && (
                                            <Text style={styles.bloodTypesNeeded}>
                                                🩸 Need: {campaign.blood_types_needed.join(', ')}
                                            </Text>
                                        )}
                                        <Text style={styles.campaignProgress}>
                                            👥 {campaign.registered_donors || 0}/{campaign.target_donors || 0} registered
                                        </Text>
                                    </View>
                                    <View style={styles.campaignActions}>
                                        {isUserRegistered(campaign.id) ? (
                                            <View style={styles.registeredBadge}>
                                                <Text style={styles.registeredText}>✓ Registered</Text>
                                            </View>
                                        ) : (
                                            <TouchableOpacity
                                                style={styles.registerButton}
                                                onPress={() => handleCampaignRegister(campaign.id, campaign.title)}
                                            >
                                                <Text style={styles.registerButtonText}>Register</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                                {campaign.description && (
                                    <Text style={styles.campaignDescription}>{campaign.description}</Text>
                                )}
                            </View>
                        ))
                    ) : (
                        <View style={styles.noCampaignsContainer}>
                            <Text style={styles.noCampaignsIcon}>🩸</Text>
                            <Text style={styles.noCampaignsTitle}>No Upcoming Campaigns</Text>
                            <Text style={styles.noCampaignsText}>Check back later for new blood donation drives</Text>
                            <TouchableOpacity
                                style={styles.viewAllCampaignsButton}
                                onPress={() => navigation.navigate('CampaignDashboard')}
                            >
                                <Text style={styles.viewAllCampaignsText}>View All Campaigns</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <BottomNavigation activeTab={activeTab} onTabPress={handleTabPress} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        fontFamily: 'System',
    },
    welcomeText: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'System',
        marginTop: 4,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationButton: {
        padding: 8,
        marginRight: 8,
    },
    notificationIcon: {
        fontSize: 24,
    },
    logoutButton: {
        padding: 8,
    },
    logoutIcon: {
        fontSize: 24,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333333',
        fontFamily: 'System',
    },
    viewAllButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#007AFF',
        borderRadius: 6,
    }, viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    findGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    findCard: {
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        padding: 20,
        width: '48%',
        marginBottom: 12,
        alignItems: 'flex-start',
        minHeight: 80,
    },
    findCardFull: {
        width: '48%', // Keep same width as others for consistent layout
    },
    findIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    findTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        fontFamily: 'System',
        lineHeight: 20,
    },
    campCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    campInfo: {
        flex: 1,
        paddingRight: 16,
    },
    campTitle: {
        fontSize: 16,
        color: '#E53E3E',
        marginBottom: 4,
        fontFamily: 'System',
    },
    campLocation: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 4,
        fontFamily: 'System',
    },
    campAddress: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'System',
    },
    campImageContainer: {
        width: 80,
        height: 60,
        borderRadius: 8,
        overflow: 'hidden',
    }, campImage: {
        width: '100%',
        height: '100%',
    },
    campaignButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    campaignButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    campaignButtonIcon: {
        fontSize: 32,
        marginRight: 15,
    },
    campaignButtonText: {
        flex: 1,
    },
    campaignButtonTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 4,
    },
    campaignButtonSubtitle: {
        fontSize: 14,
        color: '#666666',
    },
    campaignButtonArrow: {
        fontSize: 24,
        color: '#007AFF',
        fontWeight: 'bold',
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666666',
    },
    campaignCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    campaignHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    campaignInfo: {
        flex: 1,
        paddingRight: 12,
    },
    campaignTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#E53E3E',
        marginBottom: 8,
    },
    campaignLocation: {
        fontSize: 16,
        color: '#333333',
        marginBottom: 4,
    },
    campaignCity: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 6,
    },
    campaignDate: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 4,
    },
    bloodTypesNeeded: {
        fontSize: 14,
        color: '#E53E3E',
        fontWeight: '600',
        marginBottom: 4,
    },
    campaignProgress: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '500',
    },
    campaignActions: {
        alignItems: 'flex-end',
    },
    registerButton: {
        backgroundColor: '#E53E3E',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    registeredBadge: {
        backgroundColor: '#D4EDDA',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    registeredText: {
        color: '#155724',
        fontSize: 14,
        fontWeight: '600',
    },
    campaignDescription: {
        fontSize: 14,
        color: '#666666',
        marginTop: 12,
        lineHeight: 20,
    },
    noCampaignsContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    noCampaignsIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    noCampaignsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 8,
    },
    noCampaignsText: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 20,
    },
    viewAllCampaignsButton: {
        backgroundColor: '#E53E3E',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    viewAllCampaignsText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default HomeScreen;