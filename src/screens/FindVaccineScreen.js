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
import vaccineService from '../api/vaccines';

const FindVaccineScreen = ({ navigation }) => {
    const [vaccines, setVaccines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all'); // all, viral, bacterial, travel, seasonal, required
    const [selectedAgeGroup, setSelectedAgeGroup] = useState(''); // infant, child, adolescent, adult, elderly
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        loadVaccines();
    }, []);

    const loadVaccines = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
                setPage(1);
            } else {
                setLoading(true);
            }            const params = {
                page: isRefresh ? 1 : page,
                limit: 10,
                ...(searchQuery && searchQuery.trim() !== '' && { search: searchQuery.trim() }),
                // Only add category filter if it's not 'all' or 'required'
                ...(selectedFilter && selectedFilter !== 'all' && selectedFilter !== 'required' && { category: selectedFilter }),
                // Only add age group if selected
                ...(selectedAgeGroup && selectedAgeGroup !== '' && { age_group: selectedAgeGroup }),
                // Only add required filter if specifically selected
                ...(selectedFilter === 'required' && { required: 'true' })
            };

            // Log the actual parameters being sent
            console.log('Loading vaccines with params:', params);

            const result = await vaccineService.getAllVaccines(params);
            console.log('Vaccine service result:', result);

            if (result.success) {
                const newVaccines = result.data?.vaccines || [];

                // Additional client-side filtering if needed
                const filteredVaccines = selectedFilter === 'required'
                    ? newVaccines.filter(v => v.is_required === true)
                    : newVaccines;

                if (isRefresh) {
                    setVaccines(filteredVaccines);
                } else {
                    setVaccines(prev => page === 1 ? filteredVaccines : [...prev, ...filteredVaccines]);
                }

                setHasMore(result.data?.total_pages ? result.data.page < result.data.total_pages : false);
            } else {
                console.error('Vaccine API error:', result.message);
                if (!result.message.includes('Network error')) {
                    Alert.alert('Error', result.message || 'Failed to load vaccines');
                }
            }
        } catch (error) {
            console.error('Load vaccines error:', error);

            const errorMessage = error.message || 'Failed to load vaccines';
            
            if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
                Alert.alert(
                    'Connection Error', 
                    'Please check your internet connection and try again.',
                    [
                        { text: 'Retry', onPress: () => loadVaccines(isRefresh) },
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
        loadVaccines();
    };    const handleFilterChange = (filter) => {
        console.log('Filter changed to:', filter);
        setSelectedFilter(filter);
        setPage(1);
        // Reset search when changing filters to see all results
        if (filter === 'all') {
            setSearchQuery('');
        }
        setTimeout(() => loadVaccines(), 100);
    };

    const handleAgeGroupChange = (ageGroup) => {
        setSelectedAgeGroup(selectedAgeGroup === ageGroup ? '' : ageGroup);
        setPage(1);
        setTimeout(() => loadVaccines(), 100);
    };

    const handleVaccinePress = (vaccine) => {
        // Navigate to vaccine details screen (you can create this later)
        console.log('Vaccine pressed:', vaccine.name);
        Alert.alert(
            vaccine.name,
            `${vaccine.description}\n\nDoses Required: ${vaccine.doses_required}\nCategory: ${vaccine.category}\nCost: $${vaccine.cost || 'Free'}`,
            [{ text: 'OK' }]
        );
    };

    const onRefresh = () => {
        loadVaccines(true);
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
    );

    const renderAgeGroupButton = (ageGroup, label) => (
        <TouchableOpacity
            key={ageGroup}
            style={[
                styles.ageGroupButton,
                selectedAgeGroup === ageGroup && styles.ageGroupButtonActive
            ]}
            onPress={() => handleAgeGroupChange(ageGroup)}
        >
            <Text style={[
                styles.ageGroupButtonText,
                selectedAgeGroup === ageGroup && styles.ageGroupButtonTextActive
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const getAvailabilityColor = (availability) => {
        switch (availability) {
            case 'widely_available': return '#4CAF50';
            case 'seasonal': return '#FF9800';
            case 'travel_clinics': return '#2196F3';
            default: return '#757575';
        }
    };

    const getAvailabilityText = (availability) => {
        switch (availability) {
            case 'widely_available': return 'Widely Available';
            case 'seasonal': return 'Seasonal';
            case 'travel_clinics': return 'Travel Clinics';
            default: return 'Check Availability';
        }
    };

    const renderVaccineCard = (vaccine) => (
        <TouchableOpacity
            key={vaccine.id}
            style={styles.vaccineCard}
            onPress={() => handleVaccinePress(vaccine)}
        >
            <View style={styles.vaccineHeader}>
                <View style={styles.vaccineInfo}>
                    <Text style={styles.vaccineName}>{vaccine.name || 'Unknown Vaccine'}</Text>
                    <Text style={styles.vaccineBrand}>
                        {vaccine.brand || 'Various Brands'}
                    </Text>
                </View>
                <View style={styles.badgeContainer}>
                    {vaccine.is_required && (
                        <View style={styles.requiredBadge}>
                            <Text style={styles.requiredText}>Required</Text>
                        </View>
                    )}
                    <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(vaccine.category) }]}>
                        <Text style={styles.categoryText}>{vaccine.category}</Text>
                    </View>
                </View>
            </View>

            <Text style={styles.vaccineDescription}>{vaccine.description || 'No description available'}</Text>

            <View style={styles.vaccineDetails}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Doses:</Text>
                    <Text style={styles.detailValue}>{vaccine.doses_required || 1}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Efficacy:</Text>
                    <Text style={styles.detailValue}>{vaccine.efficacy_rate || 'N/A'}%</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Cost:</Text>
                    <Text style={styles.detailValue}>
                        {vaccine.cost === 0 ? 'Free' : `$${vaccine.cost || 'N/A'}`}
                    </Text>
                </View>
            </View>

            <View style={styles.ageGroupsContainer}>
                <Text style={styles.ageGroupsLabel}>Age Groups:</Text>
                <View style={styles.ageGroupsList}>
                    {(vaccine.age_groups || []).map((ageGroup, index) => (
                        <View key={index} style={styles.ageGroupTag}>
                            <Text style={styles.ageGroupTagText}>{ageGroup}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.availabilityContainer}>
                <View style={[
                    styles.availabilityBadge, 
                    { backgroundColor: getAvailabilityColor(vaccine.availability) }
                ]}>
                    <Text style={styles.availabilityText}>
                        {getAvailabilityText(vaccine.availability)}
                    </Text>
                </View>
                {vaccine.booster_required && (
                    <Text style={styles.boosterText}>
                        Booster: {vaccine.booster_interval || 'Required'}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );

    const getCategoryColor = (category) => {
        switch (category) {
            case 'viral': return '#FF6B6B';
            case 'bacterial': return '#4ECDC4';
            case 'travel': return '#45B7D1';
            case 'seasonal': return '#FFA726';
            case 'occupational': return '#AB47BC';
            default: return '#78909C';
        }
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
                <Text style={styles.headerTitle}>Find Vaccine</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search vaccines, brands..."
                    placeholderTextColor="#999999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.searchIcon}>🔍</Text>
                </TouchableOpacity>
            </View>

            {/* Category Filter Buttons */}
            <View style={styles.filterContainer}>
                <Text style={styles.filterTitle}>Category</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContent}
                >
                    {renderFilterButton('all', 'All')}
                    {renderFilterButton('viral', 'Viral')}
                    {renderFilterButton('bacterial', 'Bacterial')}
                    {renderFilterButton('travel', 'Travel')}
                    {renderFilterButton('seasonal', 'Seasonal')}
                    {renderFilterButton('required', 'Required')}
                </ScrollView>
            </View>

            {/* Age Group Filter Buttons */}
            <View style={styles.ageGroupContainer}>
                <Text style={styles.filterTitle}>Age Group</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContent}
                >
                    {renderAgeGroupButton('infant', 'Infant')}
                    {renderAgeGroupButton('child', 'Child')}
                    {renderAgeGroupButton('adolescent', 'Teen')}
                    {renderAgeGroupButton('adult', 'Adult')}
                    {renderAgeGroupButton('elderly', 'Elderly')}
                </ScrollView>
            </View>

            {/* Vaccines List */}
            <ScrollView
                style={styles.vaccinesList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {loading && vaccines.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#E53E3E" />
                        <Text style={styles.loadingText}>Loading vaccines...</Text>
                    </View>                ) : vaccines.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>💉 No vaccines found</Text>
                        <Text style={styles.emptySubtext}>
                            {selectedFilter !== 'all' || selectedAgeGroup || searchQuery ? 
                                'Try adjusting your search terms or filters to find vaccines' :
                                'No vaccines available in the database. Please contact your administrator.'}
                        </Text>
                    </View>
                ) : (
                    <>
                        {vaccines.map(renderVaccineCard)}

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
    filterContainer: {
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    ageGroupContainer: {
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    filterTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333333',
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    filterContent: {
        paddingHorizontal: 15,
        gap: 8,
    },
    filterButton: {
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 18,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E1E5E9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterButtonActive: {
        backgroundColor: '#E53E3E',
        borderColor: '#E53E3E',
    },
    filterButtonText: {
        fontSize: 12,
        color: '#495057',
        fontWeight: '600',
        textAlign: 'center',
    },
    filterButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    ageGroupButton: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        marginRight: 6,
        borderWidth: 1,
        borderColor: '#BBDEFB',
    },
    ageGroupButtonActive: {
        backgroundColor: '#2196F3',
        borderColor: '#2196F3',
    },
    ageGroupButtonText: {
        fontSize: 11,
        color: '#1976D2',
        fontWeight: '600',
    },
    ageGroupButtonTextActive: {
        color: '#FFFFFF',
    },
    vaccinesList: {
        flex: 1,
        paddingHorizontal: 20,
    },
    vaccineCard: {
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
    vaccineHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    vaccineInfo: {
        flex: 1,
    },
    vaccineName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 4,
    },
    vaccineBrand: {
        fontSize: 12,
        color: '#666666',
        fontStyle: 'italic',
    },
    badgeContainer: {
        alignItems: 'flex-end',
    },
    requiredBadge: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        marginBottom: 4,
    },
    requiredText: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    categoryBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    vaccineDescription: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 12,
        lineHeight: 18,
    },
    vaccineDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 11,
        color: '#999999',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 13,
        color: '#333333',
        fontWeight: '600',
    },
    ageGroupsContainer: {
        marginBottom: 12,
    },
    ageGroupsLabel: {
        fontSize: 12,
        color: '#666666',
        marginBottom: 6,
        fontWeight: '500',
    },
    ageGroupsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    ageGroupTag: {
        backgroundColor: '#E8F5E8',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        marginRight: 4,
        marginBottom: 2,
    },
    ageGroupTagText: {
        fontSize: 10,
        color: '#2E7D32',
        fontWeight: '500',
    },
    availabilityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 8,
    },
    availabilityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    availabilityText: {
        fontSize: 11,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    boosterText: {
        fontSize: 10,
        color: '#666666',
        fontStyle: 'italic',
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

export default FindVaccineScreen;
