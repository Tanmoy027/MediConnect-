import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';

const FilterBar = ({
    filters = [],
    selectedFilters = [],
    onFilterPress,
    multiSelect = false,
    style = {}
}) => {
    const isSelected = (filterId) => {
        if (multiSelect) {
            return selectedFilters.includes(filterId);
        }
        return selectedFilters === filterId || selectedFilters[0] === filterId;
    };

    const handleFilterPress = (filterId) => {
        if (multiSelect) {
            const newSelection = isSelected(filterId)
                ? selectedFilters.filter(id => id !== filterId)
                : [...selectedFilters, filterId];
            onFilterPress(newSelection);
        } else {
            onFilterPress(filterId);
        }
    };

    return (
        <View style={[styles.container, style]}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {filters.map((filter) => (
                    <TouchableOpacity
                        key={filter.id}
                        style={[
                            styles.filterButton,
                            isSelected(filter.id) && styles.filterButtonActive
                        ]}
                        onPress={() => handleFilterPress(filter.id)}
                    >
                        {filter.icon && (
                            <Text style={styles.filterIcon}>{filter.icon}</Text>
                        )}
                        <Text style={[
                            styles.filterText,
                            isSelected(filter.id) && styles.filterTextActive
                        ]}>
                            {filter.label}
                        </Text>
                        {filter.count !== undefined && (
                            <View style={styles.countBadge}>
                                <Text style={styles.countText}>{filter.count}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 15,
        paddingHorizontal: 5,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    scrollContent: {
        paddingHorizontal: 15,
        gap: 12,
    },
    filterButton: {
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1.5,
        borderColor: '#E1E5E9',
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 80,
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
    filterIcon: {
        fontSize: 14,
        marginRight: 6,
    },
    filterText: {
        fontSize: 13,
        color: '#495057',
        fontWeight: '600',
        textAlign: 'center',
    },
    filterTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    countBadge: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: 6,
        minWidth: 20,
        alignItems: 'center',
    },
    countText: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: '600',
    },
});

export default FilterBar;