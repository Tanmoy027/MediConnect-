import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

const BottomNavigation = ({ activeTab, onTabPress }) => {
    const tabs = [
        { id: 'home', label: 'Home', icon: '🏠' },
        { id: 'search', label: 'Search', icon: '🔍' },
        { id: 'donate', label: 'Donate', icon: '❤️' },
        { id: 'profile', label: 'Profile', icon: '👤' },
    ];

    return (
        <View style={styles.container}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab.id}
                    style={styles.tab}
                    onPress={() => onTabPress(tab.id)}
                >
                    <Text style={styles.icon}>{tab.icon}</Text>
                    <Text style={[
                        styles.label,
                        activeTab === tab.id && styles.activeLabel
                    ]}>
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    icon: {
        fontSize: 20,
        marginBottom: 4,
    },
    label: {
        fontSize: 12,
        color: '#666666',
        fontFamily: 'System',
        fontWeight: '500',
    },
    activeLabel: {
        color: '#E53E3E',
        fontWeight: '600',
    },
});

export default BottomNavigation;