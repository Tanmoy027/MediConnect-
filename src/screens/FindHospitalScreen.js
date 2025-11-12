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
    const [selectedFilter, setSelectedFilter] = useState('all'); // all, public, private, emergency
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        loadHospitals();
    }, []);

    const loadHospitals = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
                setPage(1);
            } else {
                setLoading(true);
            }

            const params = {
                page: isRefresh ? 1 : page,
                limit: 10,
                search: searchQuery,
                ...(selectedFilter !== 'all' && selectedFilter !== 'emergency' && { type: selectedFilter }),
            }; const result = await hospitalService.getAllHospitals(params);
            console.log('Hospital service result:', result); if (result.success) {
                const newHospitals = result.data?.hospitals || [];

                // Filter for emergency if selected (now using the correct field)
                const filteredHospitals = selectedFilter === 'emergency'
                    ? newHospitals.filter(h => h.is_emergency === true)
                    : selectedFilter === 'verified'
                        ? newHospitals.filter(h => h.is_verified === true)
                        : selectedFilter === 'general'
                            ? newHospitals.filter(h => h.type === 'general' || !h.is_verified)
                            : newHospitals; // 'all' case

                if (isRefresh) {
                    setHospitals(filteredHospitals);
                } else {
                    setHospitals(prev => page === 1 ? filteredHospitals : [...prev, ...filteredHospitals]);
                }

                setHasMore(result.data?.total_pages ? result.data.page < result.data.total_pages : false);
            } else {
                console.error('Hospital API error:', result.message);
                // Only show alert if it's not a network error (those are handled differently)
                if (!result.message.includes('Network error')) {
                    Alert.alert('Error', result.message || 'Failed to load hospitals');
                }
            }
        } catch (error) {
            console.error('Load hospitals error:', error);

            // Handle network errors more gracefully
            const errorMessage = error.message || 'Failed to load hospitals';

            if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
                Alert.alert(
                    'Connection Error',
                    'Please check your internet connection and try again.',
                    [
                        { text: 'Retry', onPress: () => loadHospitals(isRefresh) },
                        { text: 'Cancel', style: 'cancel' }
                    ]
                );
            } else {
                Alert.alert('Error', errorMessage);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSearch = () => {
        setPage(1);
        loadHospitals();
    };

    const handleFilterChange = (filter) => {
        setSelectedFilter(filter);
        setPage(1);
        setTimeout(() => loadHospitals(), 100);
    };

    const handleHospitalPress = (hospital) => {
        // Navigate to hospital details screen
        navigation.navigate('HospitalDetails', { hospital });
    };

    const onRefresh = () => {
        loadHospitals(true);
    };

    const renderFilterButton = (filter, label) => (
        <TouchableOpacity
            key={filter}
            style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive
            ]}
            onPress={() => handleFilterChange(filter)}
        >
            <Text style={[
                styles.filterButtonText,
                selectedFilter === filter && styles.filterButtonTextActive
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    ); const renderHospitalCard = (hospital) => (
        <TouchableOpacity
            key={hospital.id}
            style={styles.hospitalCard}
            onPress={() => handleHospitalPress(hospital)}
        >
            <View style={styles.hospitalHeader}>
                <View style={styles.hospitalInfo}>
                    <Text style={styles.hospitalName}>{hospital.name || 'Unknown Hospital'}</Text>
                    <Text style={styles.hospitalType}>
                        {hospital.is_verified ? 'Verified Hospital' : 'General Hospital'}
                    </Text>
                </View>
                {hospital.is_emergency && (
                    <View style={styles.emergencyBadge}>
                        <Text style={styles.emergencyText}>Emergency</Text>
                    </View>
                )}
            </View>

            <Text style={styles.hospitalAddress}>{hospital.address || 'Address not available'}</Text>

            <View style={styles.hospitalDetails}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Rating:</Text>
                    <Text style={styles.detailValue}>⭐ {hospital.rating || '4.0'}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Capacity:</Text>
                    <Text style={styles.detailValue}>{hospital.beds_total || 'N/A'}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Available:</Text>
                    <Text style={styles.detailValue}>{`${hospital.beds_available || 0} beds`}</Text>
                </View>
            </View>            <View style={styles.specialtiesContainer}>
                {(Array.isArray(hospital.specialties) ? hospital.specialties : ['General Medicine'])
                    .filter(specialty => specialty && typeof specialty === 'string' && specialty.trim() !== '')
                    .slice(0, 3)
                    .map((specialty, index) => (
                        <View key={`specialty-${index}`} style={styles.specialtyTag}>
                            <Text style={styles.specialtyText}>
                                {specialty.trim()}
                            </Text>
                        </View>
                    ))}
                {(Array.isArray(hospital.specialties) ? hospital.specialties : []).length > 3 && (
                    <Text style={styles.moreSpecialties}>
                        +{(Array.isArray(hospital.specialties) ? hospital.specialties : []).length - 3} more
                    </Text>
                )}
            </View>            <View style={styles.contactInfo}>
                <Text style={styles.contactText}>
                    📞 {hospital.phone && hospital.phone.trim() !== '' ? hospital.phone : 'Phone not available'}
                </Text>
                {hospital.email && hospital.email.trim() !== '' && (
                    <Text style={styles.contactText}>✉️ {hospital.email}</Text>
                )}
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

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search hospitals, specialties..."
                    placeholderTextColor="#999999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.searchIcon}>🔍</Text>
                </TouchableOpacity>
            </View>            {/* Filter Buttons - Improved Design */}
            <View style={styles.filterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContent}
                >                    {renderFilterButton('all', 'All Hospitals')}
                    {renderFilterButton('verified', 'Verified')}
                    {renderFilterButton('public', 'General')}
                    {renderFilterButton('emergency', 'Emergency')}
                </ScrollView>
            </View>

            {/* Hospitals List */}
            <ScrollView
                style={styles.hospitalsList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {loading && hospitals.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#E53E3E" />
                        <Text style={styles.loadingText}>Loading hospitals...</Text>
                    </View>) : hospitals.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>🏥 No hospitals found</Text>
                            <Text style={styles.emptySubtext}>
                                Try adjusting your search terms or filters to find hospitals in your area
                            </Text>
                        </View>
                    ) : (
                    <>
                        {hospitals.map(renderHospitalCard)}

                        {loading && (
                            <View style={styles.loadMoreContainer}>
                                <ActivityIndicator size="small" color="#E53E3E" />
                            </View>
                        )}
                    </>
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
        marginRight: 40, // Compensate for back button
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
    },    /* Filter Buttons - Professional Design */
    filterContainer: {
        paddingVertical: 15,
        paddingHorizontal: 5,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    filterContent: {
        paddingHorizontal: 15,
        gap: 12,
    },
    filterButton: {
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1.5,
        borderColor: '#E1E5E9',
        minWidth: 85,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    filterButtonActive: {
        backgroundColor: '#E53E3E',
        borderColor: '#E53E3E',
        shadowColor: '#E53E3E',
        shadowOpacity: 0.25,
        elevation: 4,
        transform: [{ scale: 1.02 }],
    },
    filterButtonText: {
        fontSize: 13,
        color: '#495057',
        fontWeight: '600',
        textAlign: 'center',
    },
    filterButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    hospitalsList: {
        flex: 1,
        paddingHorizontal: 20,
    },
    hospitalCard: {
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
    hospitalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    hospitalInfo: {
        flex: 1,
    },
    hospitalName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 4,
    },
    hospitalType: {
        fontSize: 14,
        color: '#E53E3E',
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    emergencyBadge: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    emergencyText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    hospitalAddress: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 12,
        lineHeight: 20,
    },
    hospitalDetails: {
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
    specialtiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    specialtyTag: {
        backgroundColor: '#F0F8FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 6,
        marginBottom: 4,
    },
    specialtyText: {
        fontSize: 12,
        color: '#4A90E2',
        fontWeight: '500',
    },
    moreSpecialties: {
        fontSize: 12,
        color: '#999999',
        alignSelf: 'center',
        marginLeft: 4,
    }, contactInfo: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 8,
    },
    contactText: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 4,
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
    loadMoreContainer: {
        paddingVertical: 20,
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        marginTop: 10,
        borderRadius: 8,
        marginHorizontal: 10,
    },
});

export default FindHospitalScreen;