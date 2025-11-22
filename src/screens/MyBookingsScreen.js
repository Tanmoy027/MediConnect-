import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    StatusBar,
    Linking,
} from 'react-native';
import hospitalBookingService from '../api/hospitalBooking';

const MyBookingsScreen = ({ navigation }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const result = await hospitalBookingService.getUserBookings();

            if (result.success) {
                setBookings(result.data);
            } else {
                Alert.alert('Error', result.message);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load bookings');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleCancelBooking = (bookingId, patientName) => {
        Alert.alert(
            'Cancel Booking',
            `Are you sure you want to cancel the booking for ${patientName}?`,
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: () => cancelBooking(bookingId)
                }
            ]
        );
    };

    const cancelBooking = async (bookingId) => {
        try {
            const result = await hospitalBookingService.cancelBooking(bookingId);

            if (result.success) {
                Alert.alert('Success', 'Booking cancelled successfully');
                loadBookings(); // Refresh the list
            } else {
                Alert.alert('Error', result.message);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to cancel booking');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#FFC107';
            case 'confirmed': return '#28A745';
            case 'rejected': return '#DC3545';
            case 'completed': return '#6C757D';
            case 'cancelled': return '#6C757D';
            default: return '#6C757D';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Pending Review';
            case 'confirmed': return 'Confirmed';
            case 'rejected': return 'Rejected';
            case 'completed': return 'Completed';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low': return '#28A745';
            case 'medium': return '#FFC107';
            case 'high': return '#FD7E14';
            case 'critical': return '#DC3545';
            default: return '#6C757D';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatServiceType = (serviceType) => {
        return serviceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatEmergencyType = (emergencyType) => {
        return emergencyType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const renderBookingCard = (booking) => (
        <View key={booking.id} style={styles.bookingCard}>
            {/* Header */}
            <View style={styles.bookingHeader}>
                <View style={styles.bookingInfo}>
                    <Text style={styles.patientName}>{booking.patient_name}</Text>
                    <Text style={styles.hospitalName}>{booking.hospitals?.name}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(booking.status)}</Text>
                </View>
            </View>

            {/* Service Details */}
            <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Service:</Text>
                    <Text style={styles.detailValue}>{formatServiceType(booking.service_type)}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Type:</Text>
                    <Text style={styles.detailValue}>{formatEmergencyType(booking.emergency_type)}</Text>
                </View>

                {booking.priority && booking.service_type === 'emergency_bed' && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Priority:</Text>
                        <Text style={[styles.priorityText, { color: getPriorityColor(booking.priority) }]}>
                            {booking.priority.toUpperCase()}
                        </Text>
                    </View>
                )}

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Contact:</Text>
                    <Text style={styles.detailValue}>{booking.contact_phone}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Booked:</Text>
                    <Text style={styles.detailValue}>{formatDate(booking.created_at)}</Text>
                </View>

                {booking.confirmed_at && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Confirmed:</Text>
                        <Text style={styles.detailValue}>{formatDate(booking.confirmed_at)}</Text>
                    </View>
                )}
            </View>

            {/* Description */}
            {booking.description && (
                <View style={styles.descriptionSection}>
                    <Text style={styles.descriptionLabel}>Description:</Text>
                    <Text style={styles.descriptionText}>{booking.description}</Text>
                </View>
            )}

            {/* Admin Notes */}
            {booking.admin_notes && (
                <View style={styles.notesSection}>
                    <Text style={styles.notesLabel}>Hospital Notes:</Text>
                    <Text style={styles.notesText}>{booking.admin_notes}</Text>
                </View>
            )}

            {/* Actions */}
            <View style={styles.actionsSection}>
                {booking.status === 'pending' && (
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => handleCancelBooking(booking.id, booking.patient_name)}
                    >
                        <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                    </TouchableOpacity>
                )}

                {booking.status === 'confirmed' && booking.hospitals?.phone && (
                    <TouchableOpacity
                        style={styles.contactButton}
                        onPress={() => {
                            const phone = booking.hospitals.phone.replace(/[^0-9+]/g, '');
                            Linking.openURL(`tel:${phone}`);
                        }}
                    >
                        <Text style={styles.contactButtonText}>📞 Call Hospital</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <StatusBar backgroundColor="#2C3E50" barStyle="light-content" />
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backArrow}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Bookings</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#E53E3E" />
                    <Text style={styles.loadingText}>Loading bookings...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#2C3E50" barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Bookings</Text>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => loadBookings(true)} />
                }
            >
                {bookings.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📅</Text>
                        <Text style={styles.emptyTitle}>No Bookings Yet</Text>
                        <Text style={styles.emptyText}>
                            You haven't made any hospital bookings yet. Start by finding a hospital and booking an appointment.
                        </Text>
                        <TouchableOpacity
                            style={styles.findHospitalButton}
                            onPress={() => navigation.navigate('FindHospital')}
                        >
                            <Text style={styles.findHospitalButtonText}>Find Hospitals</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    bookings.map(renderBookingCard)
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
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666666',
        marginTop: 15,
    },
    bookingCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    bookingInfo: {
        flex: 1,
    },
    patientName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 4,
    },
    hospitalName: {
        fontSize: 14,
        color: '#666666',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    statusText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    bookingDetails: {
        marginBottom: 15,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666666',
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        color: '#333333',
        fontWeight: '500',
        flex: 2,
        textAlign: 'right',
    },
    priorityText: {
        fontSize: 14,
        fontWeight: '600',
        flex: 2,
        textAlign: 'right',
    },
    descriptionSection: {
        marginBottom: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    descriptionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 5,
    },
    descriptionText: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
    },
    notesSection: {
        marginBottom: 15,
        padding: 12,
        backgroundColor: '#FFF3E0',
        borderRadius: 8,
    },
    notesLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#F57C00',
        marginBottom: 5,
    },
    notesText: {
        fontSize: 14,
        color: '#E65100',
        lineHeight: 20,
    },
    actionsSection: {
        flexDirection: 'row',
        gap: 10,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#DC3545',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    contactButton: {
        flex: 1,
        backgroundColor: '#28A745',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    contactButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 10,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    findHospitalButton: {
        backgroundColor: '#E53E3E',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 8,
    },
    findHospitalButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default MyBookingsScreen;