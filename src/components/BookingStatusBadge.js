import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';

const BookingStatusBadge = ({
    status,
    size = 'medium',
    style = {}
}) => {
    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                color: '#FF9800',
                backgroundColor: '#FFF3E0',
                text: 'Pending',
                icon: '⏳'
            },
            confirmed: {
                color: '#4CAF50',
                backgroundColor: '#E8F5E8',
                text: 'Confirmed',
                icon: '✓'
            },
            in_progress: {
                color: '#2196F3',
                backgroundColor: '#E3F2FD',
                text: 'In Progress',
                icon: '🚀'
            },
            en_route: {
                color: '#9C27B0',
                backgroundColor: '#F3E5F5',
                text: 'En Route',
                icon: '🚑'
            },
            completed: {
                color: '#4CAF50',
                backgroundColor: '#E8F5E8',
                text: 'Completed',
                icon: '✅'
            },
            cancelled: {
                color: '#F44336',
                backgroundColor: '#FFEBEE',
                text: 'Cancelled',
                icon: '❌'
            },
            available: {
                color: '#4CAF50',
                backgroundColor: '#E8F5E8',
                text: 'Available',
                icon: '✓'
            },
            unavailable: {
                color: '#F44336',
                backgroundColor: '#FFEBEE',
                text: 'Unavailable',
                icon: '❌'
            },
            busy: {
                color: '#FF5722',
                backgroundColor: '#FFF3E0',
                text: 'Busy',
                icon: '⚠️'
            }
        };

        return configs[status] || configs.pending;
    };

    const getSizeStyles = (size) => {
        const sizes = {
            small: {
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 8,
                fontSize: 10,
                iconSize: 10
            },
            medium: {
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                fontSize: 12,
                iconSize: 12
            },
            large: {
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                fontSize: 14,
                iconSize: 14
            }
        };

        return sizes[size] || sizes.medium;
    };

    const statusConfig = getStatusConfig(status);
    const sizeStyles = getSizeStyles(size);

    return (
        <View style={[
            styles.badge,
            {
                backgroundColor: statusConfig.backgroundColor,
                paddingHorizontal: sizeStyles.paddingHorizontal,
                paddingVertical: sizeStyles.paddingVertical,
                borderRadius: sizeStyles.borderRadius,
            },
            style
        ]}>
            <Text style={[
                styles.badgeText,
                {
                    color: statusConfig.color,
                    fontSize: sizeStyles.fontSize,
                }
            ]}>
                {statusConfig.icon} {statusConfig.text}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    badgeText: {
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default BookingStatusBadge;