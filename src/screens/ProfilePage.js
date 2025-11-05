import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    StatusBar,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { useAuth } from '../context';

const ProfilePage = ({ navigation }) => {
    const { user, logout, updateProfile, isLoading } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({
        full_name: user?.full_name || user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: performLogout,
                },
            ]
        );
    };

    const performLogout = async () => {
        try {
            setIsLoggingOut(true);
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout. Please try again.');
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            const result = await updateProfile(editedUser);
            if (result.success) {
                setIsEditing(false);
                Alert.alert('Success', 'Profile updated successfully!');
            } else {
                Alert.alert('Error', result.message || 'Failed to update profile');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        }
    };

    const handleCancelEdit = () => {
        setEditedUser({
            full_name: user?.full_name || user?.fullName || '',
            email: user?.email || '',
            phone: user?.phone || '',
        });
        setIsEditing(false);
    };

    if (isLoading || !user) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E53E3E" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditing(!isEditing)}
                >
                    <Text style={styles.editIcon}>{isEditing ? '✕' : '✎'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Avatar */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {(user.full_name || user.fullName || 'U').charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.userName}>
                        {user.full_name || user.fullName || 'User'}
                    </Text>
                    <Text style={styles.userRole}>
                        {user.role === 'normal_user' ? 'Patient' : user.role}
                    </Text>
                </View>

                {/* Profile Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Full Name</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.editInput}
                                value={editedUser.full_name}
                                onChangeText={(text) => setEditedUser(prev => ({ ...prev, full_name: text }))}
                                placeholder="Enter your full name"
                            />
                        ) : (
                            <Text style={styles.infoValue}>
                                {user.full_name || user.fullName || 'Not provided'}
                            </Text>
                        )}
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Email</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.editInput}
                                value={editedUser.email}
                                onChangeText={(text) => setEditedUser(prev => ({ ...prev, email: text }))}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        ) : (
                            <Text style={styles.infoValue}>
                                {user.email || 'Not provided'}
                            </Text>
                        )}
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Phone</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.editInput}
                                value={editedUser.phone}
                                onChangeText={(text) => setEditedUser(prev => ({ ...prev, phone: text }))}
                                placeholder="Enter your phone number"
                                keyboardType="phone-pad"
                            />
                        ) : (
                            <Text style={styles.infoValue}>
                                {user.phone || 'Not provided'}
                            </Text>
                        )}
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>User ID</Text>
                        <Text style={styles.infoValue}>{user.id || 'N/A'}</Text>
                    </View>
                </View>

                {/* Edit Actions */}
                {isEditing && (
                    <View style={styles.editActions}>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Account Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>

                    <TouchableOpacity style={styles.actionItem}>
                        <Text style={styles.actionText}>Change Password</Text>
                        <Text style={styles.actionArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem}>
                        <Text style={styles.actionText}>Privacy Settings</Text>
                        <Text style={styles.actionArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem}>
                        <Text style={styles.actionText}>Help & Support</Text>
                        <Text style={styles.actionArrow}>→</Text>
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <View style={styles.logoutSection}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.logoutButtonText}>Logout</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* App Version */}
                <View style={styles.versionSection}>
                    <Text style={styles.versionText}>BloodConnect v1.0.0</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666666',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#F8F8F8',
    },
    backIcon: {
        fontSize: 20,
        color: '#333333',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
    },
    editButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#F8F8F8',
    },
    editIcon: {
        fontSize: 16,
        color: '#333333',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E53E3E',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 5,
    },
    userRole: {
        fontSize: 16,
        color: '#666666',
        textTransform: 'capitalize',
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 15,
    },
    infoItem: {
        marginBottom: 20,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 5,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 16,
        color: '#333333',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
    },
    editInput: {
        fontSize: 16,
        color: '#333333',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    editActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    cancelButton: {
        flex: 1,
        padding: 15,
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
        marginRight: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#666666',
        fontWeight: '500',
    },
    saveButton: {
        flex: 1,
        padding: 15,
        backgroundColor: '#E53E3E',
        borderRadius: 8,
        marginLeft: 10,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    actionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 16,
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
        marginBottom: 10,
    },
    actionText: {
        fontSize: 16,
        color: '#333333',
    },
    actionArrow: {
        fontSize: 16,
        color: '#666666',
    },
    logoutSection: {
        marginBottom: 30,
    },
    logoutButton: {
        backgroundColor: '#E53E3E',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    versionSection: {
        alignItems: 'center',
        paddingBottom: 30,
    },
    versionText: {
        fontSize: 14,
        color: '#999999',
    },
});

export default ProfilePage;
