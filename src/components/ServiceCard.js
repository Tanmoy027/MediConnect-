import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

const ServiceCard = ({
    title,
    subtitle,
    details = [],
    badges = [],
    actionText = 'View Details',
    onPress,
    disabled = false,
    style = {}
}) => {
    return (
        <TouchableOpacity
            style={[styles.card, disabled && styles.cardDisabled, style]}
            onPress={onPress}
            disabled={disabled}
        >
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
                <View style={styles.badgesContainer}>
                    {badges.map((badge, index) => (
                        <View
                            key={index}
                            style={[
                                styles.badge,
                                { backgroundColor: badge.color || '#4CAF50' }
                            ]}
                        >
                            <Text style={styles.badgeText}>{badge.text}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {details.length > 0 && (
                <View style={styles.detailsContainer}>
                    {details.map((detail, index) => (
                        <View key={index} style={styles.detailItem}>
                            <Text style={styles.detailLabel}>{detail.label}:</Text>
                            <Text style={styles.detailValue}>{detail.value}</Text>
                        </View>
                    ))}
                </View>
            )}

            <TouchableOpacity
                style={[
                    styles.actionButton,
                    disabled && styles.actionButtonDisabled
                ]}
                onPress={onPress}
                disabled={disabled}
            >
                <Text style={[
                    styles.actionButtonText,
                    disabled && styles.actionButtonTextDisabled
                ]}>
                    {actionText}
                </Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
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
    cardDisabled: {
        opacity: 0.6,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    titleContainer: {
        flex: 1,
        paddingRight: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#E53E3E',
        fontWeight: '500',
    },
    badgesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    detailsContainer: {
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666666',
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        color: '#333333',
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
    },
    actionButton: {
        backgroundColor: '#E53E3E',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    actionButtonDisabled: {
        backgroundColor: '#CCCCCC',
    },
    actionButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    actionButtonTextDisabled: {
        color: '#999999',
    },
});

export default ServiceCard;