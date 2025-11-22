import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../context';
import { SplashScreen, OnboardingScreen, FindHospitalScreen, FindVaccineScreen, AmbulanceFinderScreen, HospitalDetailsScreen, ProfileScreen, CampaignDashboardScreen, CampaignDetailsScreen } from '../screens';
import ProfilePage from '../screens/ProfilePage';
import HospitalBookingScreen from '../screens/HospitalBookingScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import { LoginScreen, RegisterScreen } from '../auth';
import { HomeScreen } from '../main';

const AppNavigator = () => {
    const { isLoading, isAuthenticated } = useAuth(); const [showSplash, setShowSplash] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [currentAuthScreen, setCurrentAuthScreen] = useState('login');
    const [currentMainScreen, setCurrentMainScreen] = useState('home');
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [bookingHospital, setBookingHospital] = useState(null);

    useEffect(() => {
        // Show splash screen for 3 seconds
        const timer = setTimeout(() => {
            setShowSplash(false);
            // If not authenticated, show onboarding
            if (!isAuthenticated && !isLoading) {
                setShowOnboarding(true);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [isAuthenticated, isLoading]);    // Navigation object to pass to screens
    const navigation = {
        navigate: (screenName, params) => {
            if (screenName === 'FindHospital') {
                setCurrentMainScreen('findHospital');
            } else if (screenName === 'FindVaccine') {
                setCurrentMainScreen('findVaccine');
            } else if (screenName === 'FindAmbulance') {
                setCurrentMainScreen('findAmbulance');
            } else if (screenName === 'HospitalDetails') {
                setSelectedHospital(params?.hospital);
                setCurrentMainScreen('hospitalDetails');
            } else if (screenName === 'Home') {
                setCurrentMainScreen('home');
            } else if (screenName === 'Profile') {
                setCurrentMainScreen('profile');
            } else if (screenName === 'CampaignDashboard') {
                setCurrentMainScreen('campaignDashboard');
            } else if (screenName === 'CampaignDetails') {
                setSelectedCampaign(params?.campaign);
                setCurrentMainScreen('campaignDetails');
            } else if (screenName === 'HospitalBooking') {
                setBookingHospital(params?.hospital);
                setCurrentMainScreen('hospitalBooking');
            } else if (screenName === 'MyBookings') {
                setCurrentMainScreen('myBookings');
            } else if (screenName === 'Login') {
                // Handle logout navigation
                setCurrentAuthScreen('login');
                setCurrentMainScreen('home');
            }
        },
        goBack: () => {
            if (currentMainScreen === 'hospitalDetails') {
                setCurrentMainScreen('findHospital');
            } else if (currentMainScreen === 'findHospital') {
                setCurrentMainScreen('home');
            } else if (currentMainScreen === 'findVaccine') {
                setCurrentMainScreen('home');
            } else if (currentMainScreen === 'findAmbulance') {
                setCurrentMainScreen('home');
            } else if (currentMainScreen === 'profile') {
                setCurrentMainScreen('home');
            } else if (currentMainScreen === 'campaignDetails') {
                setCurrentMainScreen('campaignDashboard');
            } else if (currentMainScreen === 'campaignDashboard') {
                setCurrentMainScreen('home');
            } else if (currentMainScreen === 'hospitalBooking') {
                setCurrentMainScreen('hospitalDetails');
            } else if (currentMainScreen === 'myBookings') {
                setCurrentMainScreen('home');
            }
        },
        reset: (resetConfig) => {
            // Handle navigation reset for logout scenarios
            if (resetConfig?.routes?.[0]?.name === 'Login') {
                setCurrentAuthScreen('login');
                setCurrentMainScreen('home');
            }
        }
    };

    // Show splash screen
    if (showSplash) {
        return <SplashScreen />;
    }

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                {/* You can add a loading spinner here */}
            </View>
        );
    }    // If authenticated, show main app
    if (isAuthenticated) {
        if (currentMainScreen === 'findHospital') {
            return <FindHospitalScreen navigation={navigation} />;
        } else if (currentMainScreen === 'findVaccine') {
            return <FindVaccineScreen navigation={navigation} />;
        } else if (currentMainScreen === 'findAmbulance') {
            return <AmbulanceFinderScreen navigation={navigation} />;
        } else if (currentMainScreen === 'hospitalDetails') {
            return <HospitalDetailsScreen navigation={navigation} route={{ params: { hospital: selectedHospital } }} />;
        } else if (currentMainScreen === 'profile') {
            return <ProfilePage navigation={navigation} />;
        } else if (currentMainScreen === 'campaignDashboard') {
            return <CampaignDashboardScreen navigation={navigation} />;
        } else if (currentMainScreen === 'campaignDetails') {
            return <CampaignDetailsScreen navigation={navigation} route={{ params: { campaign: selectedCampaign } }} />;
        } else if (currentMainScreen === 'hospitalBooking') {
            return <HospitalBookingScreen navigation={navigation} route={{ params: { hospital: bookingHospital } }} />;
        } else if (currentMainScreen === 'myBookings') {
            return <MyBookingsScreen navigation={navigation} />;
        } else {
            return <HomeScreen navigation={navigation} />;
        }
    }

    // Show onboarding screen
    if (showOnboarding) {
        return (
            <OnboardingScreen
                onNext={() => setShowOnboarding(false)}
                onSkip={() => setShowOnboarding(false)}
            />
        );
    }

    // Show authentication screens
    if (currentAuthScreen === 'login') {
        return (
            <LoginScreen
                onNavigateToRegister={() => setCurrentAuthScreen('register')}
            />
        );
    }

    if (currentAuthScreen === 'register') {
        return (
            <RegisterScreen
                onNavigateToLogin={() => setCurrentAuthScreen('login')}
                onGoBack={() => setCurrentAuthScreen('login')}
            />
        );
    }

    // Default fallback
    return (
        <LoginScreen
            onNavigateToRegister={() => setCurrentAuthScreen('register')}
        />
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: '#E53E3E',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AppNavigator;