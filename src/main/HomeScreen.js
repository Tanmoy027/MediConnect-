import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { useAuth } from '../context';
import BottomNavigation from '../components/BottomNavigation';

const HomeScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('home');
    const { user, logout } = useAuth(); const handleTabPress = (tabId) => {
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
        },
        {
            id: 3,
            title: 'Find Vaccine',
            icon: '💉',
            onPress: () => console.log('Find Vaccine pressed'),
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

    const bloodDonationCamps = [
        {
            id: 1,
            title: 'Blood Donation Camp',
            location: 'Community Center',
            address: '123 Main Street, Anytown',
            image: require('../../assets/splash2.png'), // Using existing image as placeholder
        },
        {
            id: 2,
            title: 'Blood Donation Camp',
            location: 'City Hall',
            address: '456 Oak Avenue, Anytown',
            image: require('../../assets/splash2.png'), // Using existing image as placeholder
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
                </View>

                {/* Upcoming Blood Donation Camps */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Upcoming Blood Donation Camps</Text>

                    {bloodDonationCamps.map((camp) => (
                        <TouchableOpacity key={camp.id} style={styles.campCard}>
                            <View style={styles.campInfo}>
                                <Text style={styles.campTitle}>{camp.title}</Text>
                                <Text style={styles.campLocation}>{camp.location}</Text>
                                <Text style={styles.campAddress}>{camp.address}</Text>
                            </View>
                            <View style={styles.campImageContainer}>
                                <Image source={camp.image} style={styles.campImage} resizeMode="cover" />
                            </View>
                        </TouchableOpacity>
                    ))}
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
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 20,
        fontFamily: 'System',
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
    },
    campImage: {
        width: '100%',
        height: '100%',
    },
});

export default HomeScreen;