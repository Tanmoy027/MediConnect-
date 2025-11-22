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
    Modal,
} from 'react-native';
import ambulanceService from '../api/ambulance';
import { FilterBar, BookingStatusBadge, LocationPicker } from '../components';

const AmbulanceFinderScreen = ({ navigation }) => {
    const [ambulances, setAmbulances] = useState([]);
    const [ambulanceTypes, setAmbulanceTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedAmbulance, setSelectedAmbulance] = useState(null);
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(null);
    const [trackingData, setTrackingData] = useState(null);

    // Booking form state
    const [bookingForm, setBookingForm] = useState({
        pickup_location: '',
        destination_location: '',
        patient_name: '',
        patient_age: '',
        patient_gender: 'male',
        patient_phone: '',
        emergency_type: '',
        special_requirements: [],
        medical_notes: ''
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        await Promise.all([
            loadAmbulances(),
            loadAmbulanceTypes()
        ]);
    };

    const loadAmbulances = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            // Mock location for demo - in real app, get from GPS
            const params = {
                lat: 40.7128,
                lng: -74.0060,
                radius: 20,
                ambulance_type: selectedType,
                available_only: true
            };

            const result = await ambulanceService.searchAmbulances(params);

            if (result.success) {
                const ambulanceData = result.data?.ambulances || [];
                setAmbulances(ambulanceData);
            } else {
                Alert.alert('Error', result.message || 'Failed to load ambulances');
            }
        } catch (error) {
            console.error('Load ambulances error:', error);
            Alert.alert('Error', 'Failed to load ambulances. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadAmbulanceTypes = async () => {
        try {
            const result = await ambulanceService.getAmbulanceTypes();
            if (result.success) {
                setAmbulanceTypes(result.data?.types || []);
            }
        } catch (error) {
            console.error('Load ambulance types error:', error);
        }
    };

    const handleSearch = () => {
        loadAmbulances();
    };

    const handleTypeFilter = (type) => {
        setSelectedType(type === selectedType ? '' : type);
        setTimeout(() => loadAmbulances(), 100);
    };

    const handleBookAmbulance = (ambulance) => {
        setSelectedAmbulance(ambulance);
        setShowBookingModal(true);
    };

    const submitBooking = async () => {
        try {
            // Validate required fields
            if (!bookingForm.pickup_location || !bookingForm.destination_location ||
                !bookingForm.patient_name || !bookingForm.patient_phone) {
                Alert.alert('Error', 'Please fill in all required fields');
                return;
            }

            setLoading(true);

            const bookingData = {
                ambulance_id: selectedAmbulance.id,
                pickup_location: bookingForm.pickup_location,
                destination_location: bookingForm.destination_location,
                patient_info: {
                    name: bookingForm.patient_name,
                    age: parseInt(bookingForm.patient_age) || 0,
                    gender: bookingForm.patient_gender,
                    contact_phone: bookingForm.patient_phone,
                    medical_notes: bookingForm.medical_notes
                },
                emergency_type: bookingForm.emergency_type,
                special_requirements: bookingForm.special_requirements
            };

            const result = await ambulanceService.bookAmbulance(bookingData);

            if (result.success) {
                setCurrentBooking(result.data.booking);
                setShowBookingModal(false);
                setShowTrackingModal(true);
                Alert.alert(
                    'Booking Confirmed!',
                    `Your ambulance has been booked. Confirmation: ${result.data.booking.confirmation_number}`,
                    [{ text: 'Track Ambulance', onPress: () => startTracking(result.data.booking.id) }]
                );
            } else {
                Alert.alert('Booking Failed', result.message || 'Failed to book ambulance');
            }
        } catch (error) {
            console.error('Submit booking error:', error);
            Alert.alert('Error', 'Failed to submit booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const startTracking = async (bookingId) => {
        try {
            const result = await ambulanceService.trackAmbulance(bookingId);
            if (result.success) {
                setTrackingData(result.data.tracking);
                setShowTrackingModal(true);
            }
        } catch (error) {
            console.error('Tracking error:', error);
        }
    };

    const onRefresh = () => {
        loadAmbulances(true);
    };

    const getFilterOptions = () => {
        const baseFilters = [
            { id: '', label: 'All Types', icon: '🚑' }
        ];

        const typeFilters = ambulanceTypes.map(type => ({
            id: type.id,
            label: type.name.split(' ')[0], // Shortened for better display
            icon: type.id === 'basic' ? '🚐' : type.id === 'advanced' ? '🚑' : '🏥'
        }));

        return [...baseFilters, ...typeFilters];
    };

    const renderAmbulanceCard = (ambulance) => (
        <View key={ambulance.id} style={styles.ambulanceCard}>
            <View style={styles.ambulanceHeader}>
                <View style={styles.ambulanceInfo}>
                    <Text style={styles.ambulanceName}>{ambulance.hospital_name}</Text>
                    <Text style={styles.ambulanceType}>
                        {ambulanceTypes.find(t => t.id === ambulance.ambulance_type)?.name || ambulance.ambulance_type}
                    </Text>
                </View>
                <BookingStatusBadge
                    status={ambulance.is_available ? 'available' : 'busy'}
                    size="medium"
                />
            </View>

            <View style={styles.ambulanceDetails}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>ETA:</Text>
                    <Text style={styles.detailValue}>{ambulance.estimated_arrival} min</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Cost:</Text>
                    <Text style={styles.detailValue}>${ambulance.cost_per_km}/km</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Vehicle:</Text>
                    <Text style={styles.detailValue}>{ambulance.vehicle_number}</Text>
                </View>
            </View>

            <View style={styles.equipmentContainer}>
                <Text style={styles.equipmentLabel}>Equipment:</Text>
                <View style={styles.equipmentList}>
                    {ambulance.equipment.slice(0, 3).map((item, index) => (
                        <View key={index} style={styles.equipmentTag}>
                            <Text style={styles.equipmentText}>{item}</Text>
                        </View>
                    ))}
                    {ambulance.equipment.length > 3 && (
                        <Text style={styles.moreEquipment}>+{ambulance.equipment.length - 3} more</Text>
                    )}
                </View>
            </View>

            <View style={styles.driverInfo}>
                <Text style={styles.driverText}>Driver: {ambulance.driver_name}</Text>
                <Text style={styles.driverText}>📞 {ambulance.driver_phone}</Text>
            </View>

            <TouchableOpacity
                style={[
                    styles.bookButton,
                    !ambulance.is_available && styles.bookButtonDisabled
                ]}
                onPress={() => handleBookAmbulance(ambulance)}
                disabled={!ambulance.is_available}
            >
                <Text style={styles.bookButtonText}>
                    {ambulance.is_available ? 'Book Ambulance' : 'Not Available'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderBookingModal = () => (
        <Modal
            visible={showBookingModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowBookingModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Book Ambulance</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowBookingModal(false)}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.formContainer}>
                        <Text style={styles.sectionTitle}>Location Details</Text>
                        <LocationPicker
                            value={bookingForm.pickup_location}
                            onLocationSelect={(location) => setBookingForm({ ...bookingForm, pickup_location: location.address })}
                            placeholder="Select pickup location *"
                        />
                        <LocationPicker
                            value={bookingForm.destination_location}
                            onLocationSelect={(location) => setBookingForm({ ...bookingForm, destination_location: location.address })}
                            placeholder="Select destination location *"
                        />

                        <Text style={styles.sectionTitle}>Patient Information</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Patient Name *"
                            value={bookingForm.patient_name}
                            onChangeText={(text) => setBookingForm({ ...bookingForm, patient_name: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Patient Age"
                            value={bookingForm.patient_age}
                            onChangeText={(text) => setBookingForm({ ...bookingForm, patient_age: text })}
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Patient Phone *"
                            value={bookingForm.patient_phone}
                            onChangeText={(text) => setBookingForm({ ...bookingForm, patient_phone: text })}
                            keyboardType="phone-pad"
                        />

                        <Text style={styles.sectionTitle}>Emergency Details</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Emergency Type (e.g., Heart Attack, Accident)"
                            value={bookingForm.emergency_type}
                            onChangeText={(text) => setBookingForm({ ...bookingForm, emergency_type: text })}
                        />
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Medical Notes (Optional)"
                            value={bookingForm.medical_notes}
                            onChangeText={(text) => setBookingForm({ ...bookingForm, medical_notes: text })}
                            multiline
                            numberOfLines={3}
                        />

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={submitBooking}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>Confirm Booking</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    const renderTrackingModal = () => (
        <Modal
            visible={showTrackingModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowTrackingModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Track Ambulance</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowTrackingModal(false)}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.trackingContainer}>
                        {currentBooking && (
                            <>
                                <View style={styles.bookingInfo}>
                                    <Text style={styles.confirmationNumber}>
                                        Confirmation: {currentBooking.confirmation_number}
                                    </Text>
                                    <BookingStatusBadge
                                        status={currentBooking.status}
                                        size="large"
                                    />
                                </View>

                                <View style={styles.trackingDetails}>
                                    <Text style={styles.trackingLabel}>Estimated Arrival:</Text>
                                    <Text style={styles.trackingValue}>
                                        {currentBooking.estimated_arrival} minutes
                                    </Text>
                                </View>

                                <View style={styles.trackingDetails}>
                                    <Text style={styles.trackingLabel}>Driver Contact:</Text>
                                    <Text style={styles.trackingValue}>
                                        {currentBooking.ambulance?.driver_phone}
                                    </Text>
                                </View>

                                <View style={styles.trackingDetails}>
                                    <Text style={styles.trackingLabel}>Vehicle Number:</Text>
                                    <Text style={styles.trackingValue}>
                                        {currentBooking.ambulance?.vehicle_number}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.refreshTrackingButton}
                                    onPress={() => startTracking(currentBooking.id)}
                                >
                                    <Text style={styles.refreshTrackingText}>Refresh Location</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
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
                <Text style={styles.headerTitle}>Find Ambulance</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by location, hospital..."
                    placeholderTextColor="#999999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.searchIcon}>🔍</Text>
                </TouchableOpacity>
            </View>

            {/* Type Filters */}
            <FilterBar
                filters={getFilterOptions()}
                selectedFilters={selectedType}
                onFilterPress={handleTypeFilter}
                multiSelect={false}
            />

            {/* Ambulances List */}
            <ScrollView
                style={styles.ambulancesList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {loading && ambulances.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#E53E3E" />
                        <Text style={styles.loadingText}>Finding ambulances...</Text>
                    </View>
                ) : ambulances.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>🚑 No ambulances found</Text>
                        <Text style={styles.emptySubtext}>
                            Try adjusting your search or check back later
                        </Text>
                    </View>
                ) : (
                    ambulances.map(renderAmbulanceCard)
                )}
            </ScrollView>

            {renderBookingModal()}
            {renderTrackingModal()}
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
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 25,
        fontSize: 16,
        color: '#333333',
        marginRight: 10,
    },
    searchButton: {
        backgroundColor: '#E53E3E',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchIcon: {
        fontSize: 16,
        color: '#FFFFFF',
    },

    ambulancesList: {
        flex: 1,
        paddingHorizontal: 20,
    },
    ambulanceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    ambulanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    ambulanceInfo: {
        flex: 1,
    },
    ambulanceName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 4,
    },
    ambulanceType: {
        fontSize: 14,
        color: '#E53E3E',
        fontWeight: '500',
    },

    ambulanceDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: '#999999',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 14,
        color: '#333333',
        fontWeight: '600',
    },
    equipmentContainer: {
        marginBottom: 12,
    },
    equipmentLabel: {
        fontSize: 14,
        color: '#333333',
        fontWeight: '600',
        marginBottom: 6,
    },
    equipmentList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    equipmentTag: {
        backgroundColor: '#E8F5E8',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 6,
        marginBottom: 4,
    },
    equipmentText: {
        fontSize: 12,
        color: '#2E7D32',
        fontWeight: '500',
    },
    moreEquipment: {
        fontSize: 12,
        color: '#999999',
        alignSelf: 'center',
        marginLeft: 4,
    },
    driverInfo: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 8,
        marginBottom: 12,
    },
    driverText: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 4,
    },
    bookButton: {
        backgroundColor: '#E53E3E',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    bookButtonDisabled: {
        backgroundColor: '#CCCCCC',
    },
    bookButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        backgroundColor: '#FAFAFA',
        marginTop: 20,
        borderRadius: 12,
        marginHorizontal: 10,
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
        backgroundColor: '#FAFAFA',
        marginTop: 20,
        borderRadius: 12,
        marginHorizontal: 10,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 20,
        color: '#999999',
    },
    formContainer: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 10,
        marginTop: 10,
    },
    input: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
        fontSize: 16,
        color: '#333333',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#E53E3E',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    trackingContainer: {
        padding: 10,
    },
    bookingInfo: {
        backgroundColor: '#F0F8FF',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    confirmationNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 5,
    },

    trackingDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    trackingLabel: {
        fontSize: 14,
        color: '#666666',
    },
    trackingValue: {
        fontSize: 14,
        color: '#333333',
        fontWeight: '600',
    },
    refreshTrackingButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    refreshTrackingText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
});

export default AmbulanceFinderScreen;