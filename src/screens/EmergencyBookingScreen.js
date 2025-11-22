import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Modal,
    Picker
} from 'react-native';
import { hospitalService, EMERGENCY_BOOKING_CONFIG } from '../api';

const EmergencyBookingScreen = ({ navigation, route }) => {
    const { hospital } = route.params || {};

    // Form state
    const [formData, setFormData] = useState({
        hospital_id: hospital?.id || '',
        service_type: 'emergency_bed',
        patient_name: '',
        patient_age: '',
        patient_gender: 'male',
        contact_phone: '',
        contact_name: '',
        emergency_type: 'accident',
        priority: 'medium',
        description: '',
        preferred_date: '',
        preferred_time: ''
    });

    // UI state
    const [loading, setLoading] = useState(false);
    const [showServicePicker, setShowServicePicker] = useState(false);
    const [showEmergencyTypePicker, setShowEmergencyTypePicker] = useState(false);
    const [showPriorityPicker, setShowPriorityPicker] = useState(false);
    const [showGenderPicker, setShowGenderPicker] = useState(false);

    // Form validation
    const validateForm = () => {
        const errors = [];

        if (!formData.hospital_id) errors.push('Please select a hospital');
        if (!formData.patient_name.trim()) errors.push('Patient name is required');
        if (!formData.patient_age || isNaN(formData.patient_age) || formData.patient_age < 1) {
            errors.push('Valid patient age is required');
        }
        if (!formData.contact_phone.trim()) errors.push('Contact phone is required');
        if (!formData.description.trim()) errors.push('Description is required');

        // Phone number basic validation
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
        if (formData.contact_phone && !phoneRegex.test(formData.contact_phone)) {
            errors.push('Please enter a valid phone number');
        }

        return errors;
    };

    // Handle form submission
    const handleSubmit = async () => {
        const errors = validateForm();
        if (errors.length > 0) {
            Alert.alert('Validation Error', errors.join('\n'));
            return;
        }

        setLoading(true);
        try {
            const bookingData = {
                ...formData,
                patient_age: parseInt(formData.patient_age)
            };

            const result = await hospitalService.createEmergencyBooking(bookingData);

            if (result.success) {
                Alert.alert(
                    'Booking Created Successfully',
                    `Your emergency booking has been submitted.\n\nBooking Reference: ${result.data.booking?.booking_reference}\n\nYou will be notified when the hospital confirms your booking.`,
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
            console.error('Emergency booking error:', error);
            Alert.alert('Error', 'Failed to create booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Update form field
    const updateFormData = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Get display text for enum values
    const getDisplayText = (value) => {
        return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Picker Modal Component
    const PickerModal = ({ visible, options, selectedValue, onSelect, onClose, title }) => (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <ScrollView>
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.optionItem,
                                    selectedValue === option && styles.selectedOption
                                ]}
                                onPress={() => {
                                    onSelect(option);
                                    onClose();
                                }}
                            >
                                <Text style={[
                                    styles.optionText,
                                    selectedValue === option && styles.selectedOptionText
                                ]}>
                                    {getDisplayText(option)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
                        <Text style={styles.modalCloseText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Emergency Booking</Text>
                    {hospital && (
                        <Text style={styles.hospitalName}>{hospital.name}</Text>
                    )}
                </View>

                <View style={styles.form}>
                    {/* Service Type */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Service Type *</Text>
                        <TouchableOpacity
                            style={styles.pickerButton}
                            onPress={() => setShowServicePicker(true)}
                        >
                            <Text style={styles.pickerText}>
                                {getDisplayText(formData.service_type)}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Patient Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Patient Name *</Text>
                        <TextInput
                            style={styles.textInput}
                            value={formData.patient_name}
                            onChangeText={(value) => updateFormData('patient_name', value)}
                            placeholder="Enter patient's full name"
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Patient Age and Gender */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Age *</Text>
                            <TextInput
                                style={styles.textInput}
                                value={formData.patient_age}
                                onChangeText={(value) => updateFormData('patient_age', value)}
                                placeholder="Age"
                                keyboardType="numeric"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Gender</Text>
                            <TouchableOpacity
                                style={styles.pickerButton}
                                onPress={() => setShowGenderPicker(true)}
                            >
                                <Text style={styles.pickerText}>
                                    {getDisplayText(formData.patient_gender)}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Contact Information */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Contact Phone *</Text>
                        <TextInput
                            style={styles.textInput}
                            value={formData.contact_phone}
                            onChangeText={(value) => updateFormData('contact_phone', value)}
                            placeholder="e.g., +1234567890"
                            keyboardType="phone-pad"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Contact Person Name</Text>
                        <TextInput
                            style={styles.textInput}
                            value={formData.contact_name}
                            onChangeText={(value) => updateFormData('contact_name', value)}
                            placeholder="Name of person to contact"
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Emergency Type */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Emergency Type *</Text>
                        <TouchableOpacity
                            style={styles.pickerButton}
                            onPress={() => setShowEmergencyTypePicker(true)}
                        >
                            <Text style={styles.pickerText}>
                                {getDisplayText(formData.emergency_type)}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Priority */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Priority Level</Text>
                        <TouchableOpacity
                            style={styles.pickerButton}
                            onPress={() => setShowPriorityPicker(true)}
                        >
                            <Text style={styles.pickerText}>
                                {getDisplayText(formData.priority)}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description *</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            value={formData.description}
                            onChangeText={(value) => updateFormData('description', value)}
                            placeholder="Describe the emergency or medical condition"
                            multiline
                            numberOfLines={4}
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Preferred Date and Time */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Preferred Date</Text>
                            <TextInput
                                style={styles.textInput}
                                value={formData.preferred_date}
                                onChangeText={(value) => updateFormData('preferred_date', value)}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Preferred Time</Text>
                            <TextInput
                                style={styles.textInput}
                                value={formData.preferred_time}
                                onChangeText={(value) => updateFormData('preferred_time', value)}
                                placeholder="HH:MM"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit Emergency Booking</Text>
                    )}
                </TouchableOpacity>

                {/* Picker Modals */}
                <PickerModal
                    visible={showServicePicker}
                    options={EMERGENCY_BOOKING_CONFIG.SERVICE_TYPES}
                    selectedValue={formData.service_type}
                    onSelect={(value) => updateFormData('service_type', value)}
                    onClose={() => setShowServicePicker(false)}
                    title="Select Service Type"
                />

                <PickerModal
                    visible={showEmergencyTypePicker}
                    options={EMERGENCY_BOOKING_CONFIG.EMERGENCY_TYPES}
                    selectedValue={formData.emergency_type}
                    onSelect={(value) => updateFormData('emergency_type', value)}
                    onClose={() => setShowEmergencyTypePicker(false)}
                    title="Select Emergency Type"
                />

                <PickerModal
                    visible={showPriorityPicker}
                    options={EMERGENCY_BOOKING_CONFIG.PRIORITY_LEVELS}
                    selectedValue={formData.priority}
                    onSelect={(value) => updateFormData('priority', value)}
                    onClose={() => setShowPriorityPicker(false)}
                    title="Select Priority Level"
                />

                <PickerModal
                    visible={showGenderPicker}
                    options={EMERGENCY_BOOKING_CONFIG.GENDER_OPTIONS}
                    selectedValue={formData.patient_gender}
                    onSelect={(value) => updateFormData('patient_gender', value)}
                    onClose={() => setShowGenderPicker(false)}
                    title="Select Gender"
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        flex: 1,
        padding: 16,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    hospitalName: {
        fontSize: 16,
        color: '#666',
    },
    form: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#333',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    pickerButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#fff',
    },
    pickerText: {
        fontSize: 16,
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidth: {
        width: '48%',
    },
    submitButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 32,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '80%',
        maxHeight: '70%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        color: '#333',
    },
    optionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selectedOption: {
        backgroundColor: '#007AFF',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedOptionText: {
        color: '#fff',
    },
    modalCloseButton: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        alignItems: 'center',
    },
    modalCloseText: {
        fontSize: 16,
        color: '#333',
    },
});

export default EmergencyBookingScreen;