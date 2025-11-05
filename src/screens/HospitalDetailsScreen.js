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
    const { hospital: initialHospital } = route.params;
    const [hospital, setHospital] = useState(initialHospital);
    const [loading, setLoading] = useState(false);
    const [extendedDetails, setExtendedDetails] = useState(null);

    useEffect(() => {
        loadHospitalDetails();
    }, []);

    const loadHospitalDetails = async () => {
        try {
            setLoading(true);
            const result = await hospitalService.getHospitalById(hospital.id);

            if (result.success) {
                setExtendedDetails(result.data.hospital);
            }
        } catch (error) {
            console.error('Error loading hospital details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCall = () => {
        const phoneNumber = hospital.phone.replace(/[^0-9+]/g, '');
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const handleEmail = () => {
        Linking.openURL(`mailto:${hospital.email}`);
    };

    const handleDirections = () => {
        const { latitude, longitude } = hospital.coordinates;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        Linking.openURL(url);
    };

    const handleWebsite = () => {
        if (extendedDetails?.website) {
            Linking.openURL(extendedDetails.website);
        }
    };

    const renderOperatingHours = () => {
        if (!extendedDetails?.operating_hours) return null;

        const hours = extendedDetails.operating_hours;
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Operating Hours</Text>
                {days.map(day => (
                    <View key={day} style={styles.hourRow}>
                        <Text style={styles.dayText}>
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                        </Text>
                        <Text style={styles.timeText}>
                            {hours[day] || 'Closed'}
                        </Text>
                    </View>
                ))}
                {hours.emergency && (
                    <View style={styles.emergencyHours}>
                        <Text style={styles.emergencyHoursText}>
                            Emergency: {hours.emergency}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    const renderServices = () => {
        if (!extendedDetails?.services) return null;

        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Services</Text>
                <View style={styles.servicesContainer}>
                    {extendedDetails.services.map((service, index) => (
                        <View key={index} style={styles.serviceTag}>
                            <Text style={styles.serviceText}>{service}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const renderInsurance = () => {
        if (!extendedDetails?.insurance_accepted) return null;

        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Insurance Accepted</Text>
                <View style={styles.insuranceContainer}>
                    {extendedDetails.insurance_accepted.map((insurance, index) => (
                        <View key={index} style={styles.insuranceTag}>
                            <Text style={styles.insuranceText}>{insurance}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const displayHospital = extendedDetails || hospital;

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
                        <Text style={styles.hospitalName}>{displayHospital.name}</Text>
                        {displayHospital.is_emergency && (
                            <View style={styles.emergencyBadge}>
                                <Text style={styles.emergencyText}>Emergency</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.hospitalType}>
                        {displayHospital.type.charAt(0).toUpperCase() + displayHospital.type.slice(1)} Hospital
                    </Text>

                    {extendedDetails?.description && (
                        <Text style={styles.description}>{extendedDetails.description}</Text>
                    )}

                    <View style={styles.ratingContainer}>
                        <Text style={styles.rating}>⭐ {displayHospital.rating}</Text>
                        {extendedDetails?.review_count && (
                            <Text style={styles.reviewCount}>
                                ({extendedDetails.review_count} reviews)
                            </Text>
                        )}
                    </View>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{displayHospital.distance} km</Text>
                        <Text style={styles.statLabel}>Distance</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{displayHospital.beds_available}</Text>
                        <Text style={styles.statLabel}>Beds Available</Text>
                    </View>
                    {extendedDetails?.beds_total && (
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{extendedDetails.beds_total}</Text>
                            <Text style={styles.statLabel}>Total Beds</Text>
                        </View>
                    )}
                </View>

                {/* Contact Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>
                    <Text style={styles.address}>{displayHospital.address}</Text>

                    <View style={styles.contactButtons}>
                        <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
                            <Text style={styles.contactButtonText}>📞 Call</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
                            <Text style={styles.contactButtonText}>✉️ Email</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.contactButton} onPress={handleDirections}>
                            <Text style={styles.contactButtonText}>🗺️ Directions</Text>
                        </TouchableOpacity>

                        {extendedDetails?.website && (
                            <TouchableOpacity style={styles.contactButton} onPress={handleWebsite}>
                                <Text style={styles.contactButtonText}>🌐 Website</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Specialties */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Specialties</Text>
                    <View style={styles.specialtiesContainer}>
                        {displayHospital.specialties.map((specialty, index) => (
                            <View key={index} style={styles.specialtyTag}>
                                <Text style={styles.specialtyText}>{specialty}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Services */}
                {renderServices()}

                {/* Operating Hours */}
                {renderOperatingHours()}

                {/* Insurance */}
                {renderInsurance()}

                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#E53E3E" />
                        <Text style={styles.loadingText}>Loading additional details...</Text>
                    </View>
                )}
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
});

export default HospitalDetailsScreen;