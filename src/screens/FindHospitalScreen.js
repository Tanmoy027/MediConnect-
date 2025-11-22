import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    RefreshControl,
    StatusBar,
} from 'react-native';
import hospitalService from '../api/hospitals';

const FindHospitalScreen = ({ navigation }) => {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadHospitals();
    }, []);

    const loadHospitals = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const params = {
                search: searchQuery.trim() || undefined,
            };

            const result = await hospitalService.getAllHospitals(params);
            console.log('Hospital service result:', result);

            if (result.success) {
                const newHospitals = result.data?.hospitals || result.data || [];
                setHospitals(newHospitals);
            } else {
                console.error('Hospital API error:', result.message);
                Alert.alert('Error', result.message || 'Failed to load hospitals');
            }
        } catch (error) {
            console.error('Load hospitals error:', error);
            Alert.alert('Error', 'Failed to load hospitals. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSearch = () => {
        loadHospitals();
    };

    const handleHospitalPress = (hospital) => {
        // Navigate to hospital details screen
        navigation.navigate('HospitalDetails', { hospital });
    };

    const onRefresh = () => {
        loadHospitals(true);
    };

    const renderHospitalCard = (hospital) => (
        <TouchableOpacity
            key={hospital.id}
            style={styles.hospitalCard}
            onPress={() => handleHospitalPress(hospital)}
        >
            <View style={styles.hospitalHeader}>
                <View style={styles.hospitalInfo}>
                    <Text style={styles.hospitalName}>{hospital.name}</Text>
                    <Text style={styles.hospitalLocation}>📍 {hospital.city}, {hospital.state}</Text>
                </View>
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

            <View style={styles.hospitalDetails}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📞 Phone:</Text>
                    <Text style={styles.detailValue}>{hospital.phone || 'Not available'}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🏥 Total: {hospital.beds_total || 100} beds</Text>
                    <Text style={styles.detailValue}>Available: {hospital.beds_available || 50}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🚨 Emergency: {hospital.emergency_available ? 'Available' : 'Not Available'}</Text>
                    <Text style={styles.detailValue}>🚑 Ambulance: {hospital.ambulance_available ? 'Available' : 'Not Available'}</Text>
                </View>
            </View>

            <View style={styles.servicesContainer}>
                <View style={styles.serviceTag}>
                    <Text style={styles.serviceText}>Emergency Bed</Text>
                </View>
                <View style={styles.serviceTag}>
                    <Text style={styles.serviceText}>Ambulance</Text>
                </View>
                <View style={styles.serviceTag}>
                    <Text style={styles.serviceText}>General Consultation</Text>
                </View>
                <View style={styles.serviceTag}>
                    <Text style={styles.serviceText}>Specialist Care</Text>
                </View>
            </View>

            <View style={styles.hospitalFooter}>
                <Text style={styles.verificationStatus}>
                    {hospital.is_verified ? '✅ Verified' : '⚠️ Unverified'}
                </Text>
                <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => navigation.navigate('HospitalBooking', { hospital })}
                >
                    <Text style={styles.bookButtonText}>📅 Book Appointment</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

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
                <Text style={styles.headerTitle}>Hospitals</Text>
            </View>

            {/* Search Section */}
            <View style={styles.searchSection}>
                <Text style={styles.searchTitle}>Search Hospitals</Text>
                <Text style={styles.searchSubtitle}>Find hospitals by location and book appointments</Text>

                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Enter city"
                        placeholderTextColor="#999999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                    />
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                        <Text style={styles.searchButtonText}>Search</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Hospitals List */}
            <ScrollView
                style={styles.hospitalsList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#E53E3E" />
                        <Text style={styles.loadingText}>Loading hospitals...</Text>
                    </View>
                ) : hospitals.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>🏥 No hospitals found</Text>
                        <Text style={styles.emptySubtext}>
                            Try searching for hospitals in different cities
                        </Text>
                    </View>
                ) : (
                    hospitals.map(renderHospitalCard)
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#2C3E50',
    },
    backButton: {
        padding: 5,
        marginRight: 15,
    },
    backArrow: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        flex: 1,
        textAlign: 'center',
        marginRight: 40,
    },
    searchSection: {
        backgroundColor: '#2C3E50',
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    searchTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    searchSubtitle: {
        fontSize: 16,
        color: '#BDC3C7',
        marginBottom: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
        fontSize: 16,
        color: '#333333',
        marginRight: 10,
    },
    searchButton: {
        backgroundColor: '#E74C3C',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    searchButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    hospitalsList: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    hospitalCard: {
        backgroundColor: '#2C3E50',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    hospitalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    hospitalInfo: {
        flex: 1,
    },
    hospitalName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 5,
    },
    hospitalLocation: {
        fontSize: 14,
        color: '#BDC3C7',
    },
    emergencyBadge: {
        backgroundColor: '#E74C3C',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 10,
    },
    emergencyText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    ambulanceBadge: {
        backgroundColor: '#3498DB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 5,
    },
    ambulanceText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    hospitalDetails: {
        marginBottom: 15,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#BDC3C7',
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    servicesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    serviceTag: {
        backgroundColor: '#34495E',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        marginRight: 8,
        marginBottom: 5,
    },
    serviceText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    hospitalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#34495E',
        paddingTop: 15,
    },
    verificationStatus: {
        fontSize: 14,
        color: '#27AE60',
        fontWeight: '600',
    },
    bookButton: {
        backgroundColor: '#3498DB',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
    },
    bookButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: 16,
        color: '#666666',
        marginTop: 15,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        color: '#333333',
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 20,
        marginTop: 4,
    },
});

export default FindHospitalScreen;