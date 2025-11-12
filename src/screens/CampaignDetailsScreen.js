import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { campaignService } from '../api';
import { useAuth } from '../context';

const CampaignDetailsScreen = ({ route, navigation }) => {
    const { campaign: initialCampaign } = route.params;
    const [campaign, setCampaign] = useState(initialCampaign);
    const [registrationStatus, setRegistrationStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (user && campaign) {
            checkRegistrationStatus();
        }
    }, [user, campaign]);

    const checkRegistrationStatus = async () => {
        try {
            const response = await campaignService.getRegistrationStatus(campaign.id);
            if (response.success) {
                setRegistrationStatus(response.data);
            }
        } catch (error) {
            console.error('Error checking registration status:', error);
        }
    };

    const handleRegister = async () => {
        if (!user) {
            Alert.alert('Login Required', 'Please login to register for campaigns.');
            return;
        }

        if (registrationStatus?.is_registered) {
            Alert.alert('Already Registered', 'You are already registered for this campaign.');
            return;
        }

        Alert.alert(
            'Confirm Registration',
            `Do you want to register for "${campaign.title}"?\n\nPlease make sure you meet all the requirements before registering.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Register',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const response = await campaignService.registerForCampaign(campaign.id);
                            if (response.success) {
                                Alert.alert(
                                    'Registration Successful!',
                                    'You have been successfully registered for this campaign. You will receive a confirmation and reminder.',
                                    [{ text: 'OK', onPress: () => checkRegistrationStatus() }]
                                );
                            }
                        } catch (error) {
                            console.error('Registration error:', error);
                            Alert.alert('Registration Failed', error.message || 'Failed to register for campaign. Please check the console for details.');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleCancelRegistration = async () => {
        Alert.alert(
            'Cancel Registration',
            `Are you sure you want to cancel your registration for "${campaign.title}"?`,
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const response = await campaignService.cancelRegistration(campaign.id);
                            if (response.success) {
                                Alert.alert(
                                    'Registration Cancelled',
                                    'Your registration has been cancelled successfully.',
                                    [{ text: 'OK', onPress: () => checkRegistrationStatus() }]
                                );
                            }
                        } catch (error) {
                            console.error('Cancel registration error:', error);
                            Alert.alert('Error', error.message || 'Failed to cancel registration. Please check the console for details.');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleCallOrganizer = () => {
        const phoneNumber = campaign.organizer_contact.replace(/[^+\d]/g, '');
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const handleEmailOrganizer = () => {
        Linking.openURL(`mailto:${campaign.organizer_email}`);
    };

    const handleGetDirections = () => {
        const { latitude, longitude } = campaign.location.coordinates;
        const url = `https://maps.google.com/?q=${latitude},${longitude}`;
        Linking.openURL(url);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'upcoming': return '#007AFF';
            case 'active': return '#34C759';
            case 'completed': return '#8E8E93';
            case 'cancelled': return '#FF3B30';
            default: return '#8E8E93';
        }
    };

    const canRegister = () => {
        return campaign.status === 'upcoming' &&
            campaign.registered_donors < campaign.max_donors &&
            (!registrationStatus?.is_registered);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Campaign Details</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Campaign Header */}
                <View style={styles.campaignHeader}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.campaignTitle}>{campaign.title}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(campaign.status) }]}>
                            <Text style={styles.statusText}>{campaign.status.toUpperCase()}</Text>
                        </View>
                    </View>
                    <Text style={styles.organizer}>Organized by {campaign.organizer}</Text>
                </View>

                {/* Registration Status */}
                {user && registrationStatus?.is_registered && (
                    <View style={styles.registrationStatusCard}>
                        <Text style={styles.registrationStatusText}>
                            ✅ You are registered for this campaign
                        </Text>
                        <Text style={styles.registrationDateText}>
                            Registered on: {new Date(registrationStatus.registration.registration_date).toLocaleDateString()}
                        </Text>
                    </View>
                )}

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About This Campaign</Text>
                    <Text style={styles.description}>{campaign.description}</Text>
                </View>

                {/* Date & Time */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Date & Time</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>📅</Text>
                        <Text style={styles.infoText}>{formatDate(campaign.date)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>🕒</Text>
                        <Text style={styles.infoText}>
                            {formatTime(campaign.start_time)} - {formatTime(campaign.end_time)}
                        </Text>
                    </View>
                </View>

                {/* Location */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Location</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>📍</Text>
                        <View style={styles.locationInfo}>
                            <Text style={styles.infoText}>{campaign.location.address}</Text>
                            <Text style={styles.cityText}>{campaign.location.city}, {campaign.location.state}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.directionsButton} onPress={handleGetDirections}>
                        <Text style={styles.directionsButtonText}>Get Directions</Text>
                    </TouchableOpacity>
                </View>

                {/* Registration Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Registration Status</Text>
                    <View style={styles.registrationInfo}>
                        <View style={styles.registrationStats}>
                            <Text style={styles.registrationNumber}>{(campaign.registered_donors || 0).toString()}</Text>
                            <Text style={styles.registrationLabel}>Registered</Text>
                        </View>
                        <View style={styles.registrationStats}>
                            <Text style={styles.registrationNumber}>{(campaign.max_donors || 0).toString()}</Text>
                            <Text style={styles.registrationLabel}>Max Capacity</Text>
                        </View>
                        <View style={styles.registrationStats}>
                            <Text style={styles.registrationNumber}>
                                {((campaign.max_donors || 0) - (campaign.registered_donors || 0)).toString()}
                            </Text>
                            <Text style={styles.registrationLabel}>Spots Left</Text>
                        </View>
                    </View>
                </View>

                {/* Blood Types Needed */}
                {campaign.blood_types_needed && campaign.blood_types_needed.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Blood Types Needed</Text>
                        <View style={styles.bloodTypes}>
                            {campaign.blood_types_needed.map((type, index) => (
                                <View key={index} style={styles.bloodTypeBadge}>
                                    <Text style={styles.bloodTypeText}>{type}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Requirements */}
                {campaign.requirements && campaign.requirements.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Requirements</Text>
                        {campaign.requirements.map((requirement, index) => (
                            <View key={index} style={styles.requirementItem}>
                                <Text style={styles.bulletPoint}>•</Text>
                                <Text style={styles.requirementText}>{requirement}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Benefits */}
                {campaign.benefits && campaign.benefits.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>What You'll Get</Text>
                        {campaign.benefits.map((benefit, index) => (
                            <View key={index} style={styles.benefitItem}>
                                <Text style={styles.checkMark}>✓</Text>
                                <Text style={styles.benefitText}>{benefit}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Blood Bank Info */}
                {campaign.blood_bank && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Blood Bank</Text>
                        <View style={styles.bloodBankInfo}>
                            <Text style={styles.bloodBankName}>{campaign.blood_bank.name}</Text>
                            <Text style={styles.bloodBankAddress}>{campaign.blood_bank.address}</Text>
                        </View>
                    </View>
                )}

                {/* Contact Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Organizer</Text>
                    <View style={styles.contactContainer}>
                        <TouchableOpacity style={styles.contactButton} onPress={handleCallOrganizer}>
                            <Text style={styles.contactIcon}>📞</Text>
                            <Text style={styles.contactText}>{campaign.organizer_contact}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.contactButton} onPress={handleEmailOrganizer}>
                            <Text style={styles.contactIcon}>✉️</Text>
                            <Text style={styles.contactText}>{campaign.organizer_email}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bottom spacing for button */}
                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Registration Button */}
            {user && (
                <View style={styles.buttonContainer}>
                    {registrationStatus?.is_registered ? (
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancelRegistration}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.cancelButtonText}>Cancel Registration</Text>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[
                                styles.registerButton,
                                !canRegister() && styles.disabledButton
                            ]}
                            onPress={handleRegister}
                            disabled={!canRegister() || loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={[
                                    styles.registerButtonText,
                                    !canRegister() && styles.disabledButtonText
                                ]}>
                                    {canRegister() ? 'Register for Campaign' : 'Registration Unavailable'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    backButton: {
        marginRight: 15,
    },
    backButtonText: {
        fontSize: 16,
        color: '#007AFF',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    campaignHeader: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    campaignTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
        flex: 1,
        marginRight: 10,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    organizer: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    registrationStatusCard: {
        backgroundColor: '#D1F2EB',
        borderRadius: 12,
        padding: 15,
        marginTop: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#34C759',
    },
    registrationStatusText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#27AE60',
        marginBottom: 5,
    },
    registrationDateText: {
        fontSize: 14,
        color: '#666',
    },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginTop: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
    },
    description: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    infoIcon: {
        fontSize: 18,
        marginRight: 12,
        width: 25,
    },
    infoText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    locationInfo: {
        flex: 1,
    },
    cityText: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    directionsButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginTop: 10,
    },
    directionsButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    registrationInfo: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    registrationStats: {
        alignItems: 'center',
    },
    registrationNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    registrationLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
    },
    bloodTypes: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    bloodTypeBadge: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 16,
    },
    bloodTypeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    bulletPoint: {
        fontSize: 16,
        color: '#FF3B30',
        marginRight: 10,
        fontWeight: 'bold',
    },
    requirementText: {
        fontSize: 15,
        color: '#333',
        flex: 1,
        lineHeight: 22,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    checkMark: {
        fontSize: 16,
        color: '#34C759',
        marginRight: 10,
        fontWeight: 'bold',
    },
    benefitText: {
        fontSize: 15,
        color: '#333',
        flex: 1,
        lineHeight: 22,
    },
    bloodBankInfo: {
        backgroundColor: '#F8F9FA',
        padding: 15,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
    },
    bloodBankName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 5,
    },
    bloodBankAddress: {
        fontSize: 14,
        color: '#666',
    },
    contactContainer: {
        gap: 10,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    contactIcon: {
        fontSize: 18,
        marginRight: 12,
    },
    contactText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '500',
    },
    bottomSpacing: {
        height: 100,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    registerButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    registerButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    cancelButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    disabledButton: {
        backgroundColor: '#E5E5EA',
    },
    disabledButtonText: {
        color: '#8E8E93',
    },
});

export default CampaignDetailsScreen;
