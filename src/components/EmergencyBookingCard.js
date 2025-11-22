import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { EMERGENCY_BOOKING_CONFIG } from '../api';

const EmergencyBookingCard = ({
    booking,
    onPress,
    onCancel,
    onUpdate,
    showActions = true
}) => {
    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return '#FF9500';
            case 'confirmed':
                return '#34C759';
            case 'rejected':
                return '#FF3B30';
            case 'completed':
                return '#007AFF';
            case 'cancelled':
                return '#8E8E93';
            default:
                return '#8E8E93';
        }
    };

    // Get priority color
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low':
                return '#34C759';
            case 'medium':
                return '#FF9500';
            case 'high':
                return '#FF6B35';
            case 'critical':
                return '#FF3B30';
            default:
                return '#8E8E93';
        }
    };

    // Format date
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    // Get display text for enum values
    const getDisplayText = (value) => {
        return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Handle cancel booking
    const handleCancel = () => {
        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this emergency booking?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: () => {
                        Alert.prompt(
                            'Cancellation Reason',
                            'Please provide a reason for cancellation (optional):',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Confirm',
                                    onPress: (reason) => onCancel && onCancel(booking.id, reason)
                                }
                            ],
                            'plain-text',
                            '',
                            'default'
                        );
                    }
                }
            ]
        );
    };

    // Check if booking can be cancelled
    const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

    // Check if booking can be updated
    const canUpdate = booking.status === 'pending';

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress && onPress(booking)}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Text style={styles.patientName}>{booking.patient_name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                        <Text style={styles.statusText}>{getDisplayText(booking.status)}</Text>
                    </View>
                </View>

                <View style={styles.metaRow}>
                    <Text style={styles.serviceType}>{getDisplayText(booking.service_type)}</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(booking.priority) }]}>
                        <Text style={styles.priorityText}>{getDisplayText(booking.priority)}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Hospital:</Text>
                    <Text style={styles.value}>{booking.hospitals?.name || 'N/A'}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Emergency Type:</Text>
                    <Text style={styles.value}>{getDisplayText(booking.emergency_type)}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Contact:</Text>
                    <Text style={styles.value}>{booking.contact_phone}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Created:</Text>
                    <Text style={styles.value}>{formatDate(booking.created_at)}</Text>
                </View>

                {booking.confirmed_at && (
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Confirmed:</Text>
                        <Text style={styles.value}>{formatDate(booking.confirmed_at)}</Text>
                    </View>
                )}

                {booking.preferred_date && (
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Preferred:</Text>
                        <Text style={styles.value}>
                            {booking.preferred_date} {booking.preferred_time}
                        </Text>
                    </View>
                )}

                {booking.booking_reference && (
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Reference:</Text>
                        <Text style={[styles.value, styles.reference]}>{booking.booking_reference}</Text>
                    </View>
                )}

                {booking.estimated_wait_time > 0 && (
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Est. Wait:</Text>
                        <Text style={styles.value}>{booking.estimated_wait_time} minutes</Text>
                    </View>
                )}
            </View>

            {booking.description && (
                <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionLabel}>Description:</Text>
                    <Text style={styles.description} numberOfLines={2}>
                        {booking.description}
                    </Text>
                </View>
            )}

            {booking.admin_notes && (
                <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Hospital Notes:</Text>
                    <Text style={styles.notes} numberOfLines={2}>
                        {booking.admin_notes}
                    </Text>
                </View>
            )}

            {showActions && (
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.detailsButton}
                        onPress={() => onPress && onPress(booking)}
                    >
                        <Text style={styles.detailsButtonText}>View Details</Text>
                    </TouchableOpacity>

                    {canUpdate && onUpdate && (
                        <TouchableOpacity
                            style={styles.updateButton}
                            onPress={() => onUpdate(booking)}
                        >
                            <Text style={styles.updateButtonText}>Update</Text>
                        </TouchableOpacity>
                    )}

                    {canCancel && onCancel && (
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancel}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        marginBottom: 12,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    patientName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    serviceType: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    priorityBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        marginLeft: 8,
    },
    priorityText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    content: {
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    label: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
        width: 80,
    },
    value: {
        fontSize: 13,
        color: '#333',
        flex: 1,
        textAlign: 'right',
    },
    reference: {
        fontFamily: 'monospace',
        fontWeight: 'bold',
    },
    descriptionContainer: {
        backgroundColor: '#f8f8f8',
        padding: 8,
        borderRadius: 6,
        marginBottom: 8,
    },
    descriptionLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
        marginBottom: 2,
    },
    description: {
        fontSize: 13,
        color: '#333',
        lineHeight: 18,
    },
    notesContainer: {
        backgroundColor: '#e6f3ff',
        padding: 8,
        borderRadius: 6,
        marginBottom: 8,
    },
    notesLabel: {
        fontSize: 12,
        color: '#0066cc',
        fontWeight: '600',
        marginBottom: 2,
    },
    notes: {
        fontSize: 13,
        color: '#0066cc',
        lineHeight: 18,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    detailsButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
        marginRight: 8,
        alignItems: 'center',
    },
    detailsButtonText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
    },
    updateButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#007AFF',
        borderRadius: 6,
        marginRight: 8,
        alignItems: 'center',
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#FF3B30',
        borderRadius: 6,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default EmergencyBookingCard;