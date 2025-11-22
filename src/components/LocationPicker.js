import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
} from 'react-native';

const LocationPicker = ({
    visible,
    onClose,
    onLocationSelect,
    title = "Select Location",
    placeholder = "Enter location"
}) => {
    const [locationText, setLocationText] = useState('');

    const handleConfirm = () => {
        if (locationText.trim()) {
            onLocationSelect(locationText.trim());
            setLocationText('');
            onClose();
        }
    };

    const handleCancel = () => {
        setLocationText('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{title}</Text>

                    <TextInput
                        style={styles.locationInput}
                        value={locationText}
                        onChangeText={setLocationText}
                        placeholder={placeholder}
                        multiline
                        numberOfLines={3}
                    />

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleCancel}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton]}
                            onPress={handleConfirm}
                        >
                            <Text style={styles.confirmButtonText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        textAlign: 'center',
        marginBottom: 20,
    },
    locationInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333333',
        backgroundColor: '#FFFFFF',
        textAlignVertical: 'top',
        marginBottom: 20,
        minHeight: 80,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    confirmButton: {
        backgroundColor: '#E53E3E',
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#666666',
        fontWeight: '500',
    },
    confirmButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
});

export default LocationPicker;