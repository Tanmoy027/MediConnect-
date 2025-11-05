import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Image,
    TouchableOpacity,
    Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation, onNext, onSkip }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            id: 1,
            title: 'Donate Blood',
            description: 'sed quia non numquam eius modi tempora labore et dolore magnam aliquam.',
            image: require('../../assets/splash2.png'),
        },
        // Add more slides here if needed
    ];

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            // Navigate to login screen
            onNext && onNext();
        }
    };

    const handleSkip = () => {
        // Navigate to login screen
        onSkip && onSkip();
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

            {/* Skip Button */}
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            {/* Main Content */}
            <View style={styles.content}>
                {/* Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={slides[currentSlide].image}
                        style={styles.slideImage}
                        resizeMode="contain"
                    />
                </View>

                {/* Page Indicators */}
                <View style={styles.indicatorContainer}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                index === currentSlide ? styles.activeIndicator : styles.inactiveIndicator
                            ]}
                        />
                    ))}
                    {/* Static indicators for design */}
                    <View style={styles.inactiveIndicator} />
                    <View style={styles.inactiveIndicator} />
                </View>

                {/* Text Content */}
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{slides[currentSlide].title}</Text>
                    <Text style={styles.description}>{slides[currentSlide].description}</Text>
                </View>
            </View>

            {/* Next Button */}
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    skipButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    skipText: {
        fontSize: 16,
        color: '#666666',
        fontFamily: 'System',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    imageContainer: {
        flex: 0.6,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    slideImage: {
        width: width * 0.8,
        height: height * 0.4,
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
    indicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginHorizontal: 4,
    },
    activeIndicator: {
        backgroundColor: '#E53E3E',
    },
    inactiveIndicator: {
        backgroundColor: '#FFB3B3',
    },
    textContainer: {
        flex: 0.3,
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333333',
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: 'System',
    },
    description: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
        fontFamily: 'System',
    },
    nextButton: {
        backgroundColor: '#E53E3E',
        marginHorizontal: 20,
        marginBottom: 40,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    nextButtonText: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: '600',
        fontFamily: 'System',
    },
});

export default OnboardingScreen;