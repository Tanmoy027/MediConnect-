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
import { campaignService } from '../api';

const HomeScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('home');
    const [campaigns, setCampaigns] = useState([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);
    const { user, logout } = useAuth();

    useEffect(() => {
        loadLatestCampaigns();
    }, []);

    const loadLatestCampaigns = async () => {
        try {
            setLoadingCampaigns(true);
            const response = await campaignService.getAllCampaigns({ status: 'upcoming' });
            if (response.success && Array.isArray(response.data)) {
                // Get latest 3 campaigns
                setCampaigns(response.data.slice(0, 3));
            }
        } catch (error) {
            console.error('Error loading campaigns:', error);
        } finally {
            setLoadingCampaigns(false);
        }
    }; const handleTabPress = (tabId) => {
        setActiveTab(tabId);
        // Handle navigation to different screens based on tabId
        if (tabId === 'profile') {
            navigation.navigate('Profile');
        } else if (tabId === 'search') {
            navigation.navigate('FindHospital');
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
            title: 'Find Animal Hospital',
            icon: '🐾',
            onPress: () => console.log('Find Animal Hospital pressed'),
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
                </View>                {/* Upcoming Blood Donation Camps */}
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

                    {loadingCampaigns ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#007AFF" />
                        </View>
                    ) : campaigns.length > 0 ? (
                        campaigns.map((campaign) => (
                            <TouchableOpacity
                                key={campaign.id}
                                style={styles.campaignCard}
                                onPress={() => navigation.navigate('CampaignDetails', { campaign })}
                            >
                                <View style={styles.campaignCardHeader}>
                                    <Text style={styles.campaignCardTitle}>{campaign.title}</Text>
                                    <View style={[styles.campaignStatusBadge, { backgroundColor: '#007AFF' }]}>
                                        <Text style={styles.campaignStatusText}>UPCOMING</Text>
                                    </View>
                                </View>
                                <Text style={styles.campaignCardLocation}>
                                    📍 {campaign.location?.city || campaign.city}, {campaign.location?.state || campaign.state}
                                </Text>
                                <Text style={styles.campaignCardDate}>
                                    📅 {campaign.date ? new Date(campaign.date).toLocaleDateString() : 'Date TBD'}
                                </Text>
                                <Text style={styles.campaignCardOrganizer}>
                                    🏛️ {campaign.organizer || 'Unknown Organizer'}
                                </Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <TouchableOpacity
                            style={styles.campaignButton}
                            onPress={() => navigation.navigate('CampaignDashboard')}
                        >
                            <View style={styles.campaignButtonContent}>
                                <Text style={styles.campaignButtonIcon}>🩸</Text>
                                <View style={styles.campaignButtonText}>
                                    <Text style={styles.campaignButtonTitle}>View All Campaigns</Text>
                                    <Text style={styles.campaignButtonSubtitle}>Find blood donation drives near you</Text>
                                </View>
                                <Text style={styles.campaignButtonArrow}>→</Text>
                            </View>
                        </TouchableOpacity>
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
        padding: 20,
        alignItems: 'center',
    },
    campaignCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
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
    campaignCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    campaignCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
        flex: 1,
        marginRight: 8,
    },
    campaignStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    campaignStatusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    campaignCardLocation: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 4,
    },
    campaignCardDate: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 4,
    },
    campaignCardOrganizer: {
        fontSize: 14,
        color: '#666666',
    },
});

export default HomeScreen;