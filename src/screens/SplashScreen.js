import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Image,
} from 'react-native';

const SplashScreen = ({ navigation }) => {
    useEffect(() => {
        // Navigate to onboarding screen after 3 seconds
        const timer = setTimeout(() => {
            // navigation.replace('Onboarding'); // Uncomment when navigation is set up
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const BloodDropIcon = () => (
        <Image
            source={require('../../assets/water 1.png')}
            style={styles.bloodDropImage}
            resizeMode="contain"
        />
    );

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#E53E3E" barStyle="light-content" />

            {/* Red Section */}
            <View style={styles.redSection}>
                <View style={styles.iconContainer}>
                    <BloodDropIcon />
                </View>

                <Text style={styles.appName}>MEDI CONNECT</Text>
            </View>

            {/* White Section */}
            <View style={styles.whiteSection}>
                <View style={styles.textContainer}>
                    <Text style={styles.taglineTop}>EXCUSES NEVER SAVE A LIFE,</Text>
                    <Text style={styles.taglineBottom}>BLOOD DONATION DOES</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E53E3E',
    },
    redSection: {
        flex: 0.7,
        backgroundColor: '#E53E3E',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    iconContainer: {
        marginBottom: 40,
    },
    bloodDropImage: {
        width: 120,
        height: 140,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        letterSpacing: 2,
        fontFamily: 'System',
    },
    whiteSection: {
        flex: 0.3,
        backgroundColor: '#F7F7F7',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    textContainer: {
        alignItems: 'center',
    },
    taglineTop: {
        fontSize: 16,
        color: '#888888',
        textAlign: 'center',
        fontWeight: '400',
        marginBottom: 5,
        letterSpacing: 1,
        fontFamily: 'System',
    },
    taglineBottom: {
        fontSize: 18,
        color: '#333333',
        textAlign: 'center',
        fontWeight: 'bold',
        letterSpacing: 1,
        fontFamily: 'System',
    },
});

export default SplashScreen;