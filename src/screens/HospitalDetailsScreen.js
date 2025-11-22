import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Linking,
    StatusBar,
} from 'react-native';
import hospitalService from '../api/hospitals';

const HospitalDetailsScreen = ({ route, navigation }) => {
    const { hospital } = route.params;
    const [loading, setLoading] = useState(false);

    const handleCall = () => {
        if (hospital.phone && hospital.phone !== 'Not available') {
            const phoneNumber = hospital.phone.replace(/[^0-9+]/g, '');
            Linking.openURL(`tel:${phoneNumber}`);
        } else {
            Alert.alert('Phone Not Available', 'Phone number is not available for this hospital.');
        }
    };

    const handleEmail = () => {
        if (hospital.email && hospital.email.trim() !== '') {
            Linking.openURL(`mailto:${hospital.email}`);
        } else {
            Alert.alert('Email Not Available', 'Email address is not available for this hospital.');
        }
    };

    const handleDirections = () => {
        if (hospital.coordinates && hospital.coordinates.latitude && hospital.coordinates.longitude) {
            const { latitude, longitude } = hospital.coordinates;
            const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
            Linking.openURL(url);
        } else {
            // Use city and state for directions if coordinates not available
            const location = `${hospital.city}, ${hospital.state}`.replace(/,\s*$/, '');
            const url = `https://www.google.com/maps/search/${encodeURIComponent(location)}`;
            Linking.openURL(url);
        }
    };

    const renderServices = () => {
        const services = [];

        if (hospital.emergency_available) {
            services.push('Emergency Care');
        }
        if (hospital.ambulance_available) {
            services.push('Ambulance Service');
        }

        // Add default services
        services.push('General Consultation', 'Medical Checkup');

        if (hospital.specialties && hospital.specialties.length > 0) {
            services.push(...hospital.specialties);
        }

        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Available Services</Text>
                <View style={styles.servicesContainer}>
                    {services.map((service, index) => (
                        <View key={index} style={styles.serviceTag}>
                            <Text style={styles.serviceText}>{service}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hospital Details</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Hospital Info */}
                <View style={styles.hospitalInfo}>
                    <View style={styles.hospitalHeader}>
                        <Text style={styles.hospitalName}>{hospital.name}</Text>
                        <View style={styles.badgeContainer}>
                            {hospital.emergency_available && (
                                <View style={styles.emergencyBadge}>
                                    <Text style={styles.emergencyText}>Emergency</Text>
                                </View>
                            )}
                            {hospital.ambulance_available && (
                                <View style={styles.ambulanceBadge}>
                                    <Text style={styles.ambulanceText}>Ambulance</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <Text style={styles.hospitalLocation}>
                        📍 {hospital.city}, {hospital.state}
                    </Text>

                    <Text style={styles.hospitalType}>
                        {hospital.is_verified ? '✅ Verified Hospital' : '⚠️ Unverified Hospital'}
                    </Text>

                    <View style={styles.ratingContainer}>
                        <Text style={styles.rating}>⭐ {hospital.rating || '4.2'}</Text>
                        <Text style={styles.reviewCount}>(Based on patient feedback)</Text>
                    </View>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{hospital.beds_available || 0}</Text>
                        <Text style={styles.statLabel}>Beds Available</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{hospital.beds_total || 100}</Text>
                        <Text style={styles.statLabel}>Total Beds</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{hospital.is_active ? 'Active' : 'Inactive'}</Text>
                        <Text style={styles.statLabel}>Status</Text>
                    </View>
                </View>

                {/* Contact Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>
                    <Text style={styles.address}>{hospital.address}</Text>

                    <View style={styles.contactInfo}>
                        <Text style={styles.contactText}>📞 Phone: {hospital.phone || 'Not available'}</Text>
                        {hospital.email && (
                            <Text style={styles.contactText}>✉️ Email: {hospital.email}</Text>
                        )}
                        {hospital.license_number && (
                            <Text style={styles.contactText}>🏥 License: {hospital.license_number}</Text>
                        )}
                        {hospital.pincode && (
                            <Text style={styles.contactText}>📮 Pincode: {hospital.pincode}</Text>
                        )}
                    </View>

                    <View style={styles.contactButtons}>
                        <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
                            <Text style={styles.contactButtonText}>📞 Call Hospital</Text>
                        </TouchableOpacity>

                        {hospital.email && (
                            <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
                                <Text style={styles.contactButtonText}>✉️ Send Email</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={styles.contactButton} onPress={handleDirections}>
                            <Text style={styles.contactButtonText}>🗺️ Get Directions</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Specialties */}
                {hospital.specialties && hospital.specialties.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Medical Specialties</Text>
                        <View style={styles.specialtiesContainer}>
                            {hospital.specialties.map((specialty, index) => (
                                <View key={index} style={styles.specialtyTag}>
                                    <Text style={styles.specialtyText}>{specialty}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Services */}
                {renderServices()}

                {/* Hospital Features */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hospital Features</Text>
                    <View style={styles.featuresContainer}>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureLabel}>Emergency Care:</Text>
                            <Text style={styles.featureValue}>
                                {hospital.emergency_available ? '✅ Available 24/7' : '❌ Not Available'}
                            </Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureLabel}>Ambulance Service:</Text>
                            <Text style={styles.featureValue}>
                                {hospital.ambulance_available ? '✅ Available' : '❌ Not Available'}
                            </Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureLabel}>Hospital Status:</Text>
                            <Text style={styles.featureValue}>
                                {hospital.is_active ? '✅ Currently Active' : '❌ Inactive'}
                            </Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureLabel}>Verification:</Text>
                            <Text style={styles.featureValue}>
                                {hospital.is_verified ? '✅ Verified by Authorities' : '⚠️ Pending Verification'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Book Appointment */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.bookButton}
                        onPress={() => navigation.navigate('HospitalBooking', { hospital })}
                    >
                        <Text style={styles.bookButtonText}>📅 Book Appointment</Text>
                    </TouchableOpacity>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 5,
        marginRight: 15,
    },
    backArrow: {
        fontSize: 24,
        color: '#333333',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
        flex: 1,
        textAlign: 'center',
        marginRight: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    hospitalInfo: {
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    hospitalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    hospitalName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        flex: 1,
        marginRight: 10,
    },
    badgeContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    emergencyBadge: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 15,
    },
    emergencyText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    ambulanceBadge: {
        backgroundColor: '#3498DB',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 15,
    },
    ambulanceText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    hospitalLocation: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 8,
    },
    hospitalType: {
        fontSize: 16,
        color: '#E53E3E',
        fontWeight: '600',
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
        marginBottom: 12,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginRight: 8,
    },
    reviewCount: {
        fontSize: 14,
        color: '#666666',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#E53E3E',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666666',
        textAlign: 'center',
    },
    section: {
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 12,
    },
    address: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
        marginBottom: 15,
    },
    contactInfo: {
        marginBottom: 15,
    },
    contactText: {
        fontSize: 14,
        color: '#333333',
        marginBottom: 8,
        lineHeight: 20,
    },
    contactButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    contactButton: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 10,
    },
    contactButtonText: {
        fontSize: 14,
        color: '#333333',
        fontWeight: '500',
    },
    specialtiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    specialtyTag: {
        backgroundColor: '#F0F8FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        marginRight: 8,
        marginBottom: 8,
    },
    specialtyText: {
        fontSize: 14,
        color: '#4A90E2',
        fontWeight: '500',
    },
    servicesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    serviceTag: {
        backgroundColor: '#E8F5E8',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        marginRight: 8,
        marginBottom: 8,
    },
    serviceText: {
        fontSize: 14,
        color: '#2E7D32',
        fontWeight: '500',
    },
    hourRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    dayText: {
        fontSize: 14,
        color: '#333333',
        fontWeight: '500',
    },
    timeText: {
        fontSize: 14,
        color: '#666666',
    },
    emergencyHours: {
        marginTop: 8,
        padding: 8,
        backgroundColor: '#FFF3E0',
        borderRadius: 8,
    },
    emergencyHoursText: {
        fontSize: 14,
        color: '#F57C00',
        fontWeight: '600',
        textAlign: 'center',
    },
    insuranceContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    insuranceTag: {
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        marginRight: 8,
        marginBottom: 8,
    },
    insuranceText: {
        fontSize: 14,
        color: '#F57C00',
        fontWeight: '500',
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        fontSize: 14,
        color: '#666666',
        marginTop: 8,
    },
    featuresContainer: {
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    featureLabel: {
        fontSize: 14,
        color: '#333333',
        fontWeight: '500',
        flex: 1,
    },
    featureValue: {
        fontSize: 14,
        color: '#666666',
        flex: 1,
        textAlign: 'right',
    },
    bookButton: {
        backgroundColor: '#E53E3E',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    bookButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default HospitalDetailsScreen;