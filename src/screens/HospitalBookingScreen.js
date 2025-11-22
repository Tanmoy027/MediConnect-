import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { useAuth } from '../context';
import hospitalBookingService from '../api/hospitalBooking';

const HospitalBookingScreen = ({ route, navigation }) => {
    const { hospital } = route.params;
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selectedService, setSelectedService] = useState('normal_appointment');

    // Form data
    const [formData, setFormData] = useState({
        patient_name: user?.full_name || '',
        patient_age: '',
        patient_gender: '',
        contact_phone: user?.phone || '',
        contact_name: user?.full_name || '',
        emergency_type: 'appointment_general_consultation',
        priority: 'low',
        description: '',
        preferred_date: '',
        preferred_time: '',
    });

    const serviceTypes = [
        {
            id: 'normal_appointment',
            name: 'Normal Appointment',
            description: 'General consultation and checkup',
            available: true,
        },
        {
            id: 'emergency_bed',
            name: 'Emergency Bed',
            description: 'Emergency medical care',
            available: hospital.emergency_available,
        },
        {
            id: 'ambulance',
            name: 'Ambulance Service',
            description: 'Emergency ambulance service',
            available: hospital.ambulance_available,
        },
    ];

    const emergencyTypes = [
        { id: 'appointment_general_consultation', name: 'General Consultation' },
        { id: 'accident', name: 'Accident' },
        { id: 'heart_attack', name: 'Heart Attack' },
        { id: 'stroke', name: 'Stroke' },
        { id: 'breathing_difficulty', name: 'Breathing Difficulty' },
        { id: 'severe_pain', name: 'Severe Pain' },
        { id: 'other', name: 'Other Emergency' },
    ];

    const priorityLevels = [
        { id: 'low', name: 'Low Priority', color: '#28A745' },
        { id: 'medium', name: 'Medium Priority', color: '#FFC107' },
        { id: 'high', name: 'High Priority', color: '#FD7E14' },
        { id: 'critical', name: 'Critical', color: '#DC3545' },
    ];

    const genderOptions = [
        { id: 'male', name: 'Male' },
        { id: 'female', name: 'Female' },
        { id: 'other', name: 'Other' },
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        if (!formData.patient_name.trim()) {
            Alert.alert('Error', 'Patient name is required');
            return false;
        }
        if (!formData.patient_age || isNaN(formData.patient_age)) {
            Alert.alert('Error', 'Valid patient age is required');
            return false;
        }
        if (!formData.patient_gender) {
            Alert.alert('Error', 'Patient gender is required');
            return false;
        }
        if (!formData.contact_phone.trim()) {
            Alert.alert('Error', 'Contact phone is required');
            return false;
        }
        if (!formData.description.trim()) {
            Alert.alert('Error', 'Description/symptoms are required');
            return false;
        }
        if (selectedService === 'normal_appointment' && !formData.preferred_date) {
            Alert.alert('Error', 'Preferred date is required for appointments');
            return false;
        }
        return true;
    };

    const handleSubmitBooking = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);

            const bookingData = {
                hospital_id: hospital.id,
                service_type: selectedService,
                patient_name: formData.patient_name.trim(),
                patient_age: parseInt(formData.patient_age),
                patient_gender: formData.patient_gender,
                contact_phone: formData.contact_phone.trim(),
                contact_name: formData.contact_name.trim(),
                emergency_type: formData.emergency_type,
                priority: formData.priority,
                description: formData.description.trim(),
                ...(formData.preferred_date && { preferred_date: formData.preferred_date }),
                ...(formData.preferred_time && { preferred_time: formData.preferred_time }),
            };

            const result = await hospitalBookingService.createBooking(bookingData);

            if (result.success) {
                Alert.alert(
                    'Booking Successful',
                    `Your ${selectedService.replace('_', ' ')} booking has been submitted successfully. The hospital will contact you soon.`,
                    [
                        {
                            text: 'View Bookings',
                            onPress: () => navigation.navigate('MyBookings')
                        },
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack()
                        }
                    ]
                );
            } else {
                Alert.alert('Booking Failed', result.message);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to submit booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderServiceSelection = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Service</Text>
            {serviceTypes.map((service) => (
                <TouchableOpacity
                    key={service.id}
                    style={[
                        styles.serviceOption,
                        selectedService === service.id && styles.serviceOptionSelected,
                        !service.available && styles.serviceOptionDisabled
                    ]}
                    onPress={() => service.available && setSelectedService(service.id)}
                    disabled={!service.available}
                >
                    <View style={styles.serviceInfo}>
                        <Text style={[
                            styles.serviceName,
                            selectedService === service.id && styles.serviceNameSelected,
                            !service.available && styles.serviceNameDisabled
                        ]}>
                            {service.name}
                        </Text>
                        <Text style={[
                            styles.serviceDescription,
                            !service.available && styles.serviceDescriptionDisabled
                        ]}>
                            {service.description}
                        </Text>
                    </View>
                    {!service.available && (
                        <Text style={styles.unavailableText}>Not Available</Text>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderPatientInfo = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Patient Information</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Patient Name *</Text>
                <TextInput
                    style={styles.textInput}
                    value={formData.patient_name}
                    onChangeText={(value) => handleInputChange('patient_name', value)}
                    placeholder="Enter patient name"
                />
            </View>

            <View style={styles.inputRow}>
                <View style={styles.inputGroupHalf}>
                    <Text style={styles.inputLabel}>Age *</Text>
                    <TextInput
                        style={styles.textInput}
                        value={formData.patient_age}
                        onChangeText={(value) => handleInputChange('patient_age', value)}
                        placeholder="Age"
                        keyboardType="numeric"
                    />
                </View>
                <View style={styles.inputGroupHalf}>
                    <Text style={styles.inputLabel}>Gender *</Text>
                    <View style={styles.genderContainer}>
                        {genderOptions.map((gender) => (
                            <TouchableOpacity
                                key={gender.id}
                                style={[
                                    styles.genderOption,
                                    formData.patient_gender === gender.id && styles.genderOptionSelected
                                ]}
                                onPress={() => handleInputChange('patient_gender', gender.id)}
                            >
                                <Text style={[
                                    styles.genderText,
                                    formData.patient_gender === gender.id && styles.genderTextSelected
                                ]}>
                                    {gender.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Phone *</Text>
                <TextInput
                    style={styles.textInput}
                    value={formData.contact_phone}
                    onChangeText={(value) => handleInputChange('contact_phone', value)}
                    placeholder="Enter contact phone"
                    keyboardType="phone-pad"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Person Name</Text>
                <TextInput
                    style={styles.textInput}
                    value={formData.contact_name}
                    onChangeText={(value) => handleInputChange('contact_name', value)}
                    placeholder="Enter contact person name"
                />
            </View>
        </View>
    );

    const renderServiceDetails = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Details</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Type of Service</Text>
                <View style={styles.pickerContainer}>
                    {emergencyTypes.map((type) => (
                        <TouchableOpacity
                            key={type.id}
                            style={[
                                styles.pickerOption,
                                formData.emergency_type === type.id && styles.pickerOptionSelected
                            ]}
                            onPress={() => handleInputChange('emergency_type', type.id)}
                        >
                            <Text style={[
                                styles.pickerText,
                                formData.emergency_type === type.id && styles.pickerTextSelected
                            ]}>
                                {type.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {selectedService === 'emergency_bed' && (
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Priority Level</Text>
                    <View style={styles.priorityContainer}>
                        {priorityLevels.map((priority) => (
                            <TouchableOpacity
                                key={priority.id}
                                style={[
                                    styles.priorityOption,
                                    formData.priority === priority.id && styles.priorityOptionSelected,
                                    { borderColor: priority.color }
                                ]}
                                onPress={() => handleInputChange('priority', priority.id)}
                            >
                                <Text style={[
                                    styles.priorityText,
                                    formData.priority === priority.id && { color: priority.color }
                                ]}>
                                    {priority.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {selectedService === 'normal_appointment' && (
                <>
                    <View style={styles.inputRow}>
                        <View style={styles.inputGroupHalf}>
                            <Text style={styles.inputLabel}>Preferred Date *</Text>
                            <TextInput
                                style={styles.textInput}
                                value={formData.preferred_date}
                                onChangeText={(value) => handleInputChange('preferred_date', value)}
                                placeholder="YYYY-MM-DD"
                            />
                        </View>
                        <View style={styles.inputGroupHalf}>
                            <Text style={styles.inputLabel}>Preferred Time</Text>
                            <TextInput
                                style={styles.textInput}
                                value={formData.preferred_time}
                                onChangeText={(value) => handleInputChange('preferred_time', value)}
                                placeholder="HH:MM"
                            />
                        </View>
                    </View>
                </>
            )}

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description/Symptoms *</Text>
                <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={formData.description}
                    onChangeText={(value) => handleInputChange('description', value)}
                    placeholder="Describe your symptoms or reason for visit"
                    multiline
                    numberOfLines={4}
                />
            </View>
        </View>
    );

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
                <Text style={styles.headerTitle}>Book Appointment</Text>
            </View>

            {/* Hospital Info */}
            <View style={styles.hospitalInfo}>
                <Text style={styles.hospitalName}>{hospital.name}</Text>
                <Text style={styles.hospitalLocation}>📍 {hospital.city}, {hospital.state}</Text>
                <Text style={styles.hospitalPhone}>📞 {hospital.phone}</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {renderServiceSelection()}
                {renderPatientInfo()}
                {renderServiceDetails()}

                {/* Submit Button */}
                <View style={styles.submitSection}>
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmitBooking}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>Submit Booking</Text>
                        )}
                    </TouchableOpacity>
                </View>
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
    hospitalInfo: {
        backgroundColor: '#2C3E50',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    hospitalName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 5,
    },
    hospitalLocation: {
        fontSize: 14,
        color: '#BDC3C7',
        marginBottom: 3,
    },
    hospitalPhone: {
        fontSize: 14,
        color: '#BDC3C7',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 15,
    },
    serviceOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        marginBottom: 10,
    },
    serviceOptionSelected: {
        borderColor: '#E53E3E',
        backgroundColor: '#FFF5F5',
    },
    serviceOptionDisabled: {
        backgroundColor: '#F5F5F5',
        opacity: 0.6,
    },
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 4,
    },
    serviceNameSelected: {
        color: '#E53E3E',
    },
    serviceNameDisabled: {
        color: '#999999',
    },
    serviceDescription: {
        fontSize: 14,
        color: '#666666',
    },
    serviceDescriptionDisabled: {
        color: '#999999',
    },
    unavailableText: {
        fontSize: 12,
        color: '#E53E3E',
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    inputGroupHalf: {
        flex: 1,
        marginHorizontal: 5,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333333',
        backgroundColor: '#FFFFFF',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    genderContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    genderOption: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        alignItems: 'center',
    },
    genderOptionSelected: {
        borderColor: '#E53E3E',
        backgroundColor: '#FFF5F5',
    },
    genderText: {
        fontSize: 14,
        color: '#666666',
    },
    genderTextSelected: {
        color: '#E53E3E',
        fontWeight: '600',
    },
    pickerContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    pickerOption: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 8,
    },
    pickerOptionSelected: {
        borderColor: '#E53E3E',
        backgroundColor: '#FFF5F5',
    },
    pickerText: {
        fontSize: 14,
        color: '#666666',
    },
    pickerTextSelected: {
        color: '#E53E3E',
        fontWeight: '600',
    },
    priorityContainer: {
        gap: 10,
    },
    priorityOption: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#E0E0E0',
    },
    priorityOptionSelected: {
        backgroundColor: '#FFF5F5',
    },
    priorityText: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    },
    submitSection: {
        paddingVertical: 30,
    },
    submitButton: {
        backgroundColor: '#E53E3E',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default HospitalBookingScreen;