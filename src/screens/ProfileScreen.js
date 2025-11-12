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
} from 'react-native';
import { useAuth } from '../context';

const ProfileScreen = ({ navigation }) => {
    const { user, logout, isLoading } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

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
            // Navigation will be handled by AuthContext
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout. Please try again.');
        } finally {
            setIsLoggingOut(false);
        }
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
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* User Info Card */}
                <View style={styles.userCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.userName}>{user.full_name || 'Unknown User'}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    {user.role && (
                        <View style={styles.roleContainer}>
                            <Text style={styles.roleText}>{user.role.replace('_', ' ').toUpperCase()}</Text>
                        </View>
                    )}
                </View>

                {/* User Details */}
                <View style={styles.detailsCard}>
                    <Text style={styles.sectionTitle}>Account Information</Text>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>User ID:</Text>
                        <Text style={styles.detailValue}>{`${user.id || 'N/A'}`}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Email:</Text>
                        <Text style={styles.detailValue}>{user.email}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Full Name:</Text>
                        <Text style={styles.detailValue}>{user.full_name || 'Not provided'}</Text>
                    </View>

                    {user.phone && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Phone:</Text>
                            <Text style={styles.detailValue}>{user.phone}</Text>
                        </View>
                    )}

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Account Type:</Text>
                        <Text style={styles.detailValue}>{user.role || 'Standard User'}</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.editButton}>
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.changePasswordButton}>
                        <Text style={styles.changePasswordText}>Change Password</Text>
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
                    onPress={handleLogout}
                    disabled={isLoggingOut}
                >
                    {isLoggingOut ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    )}
                </TouchableOpacity>

                {/* App Info */}
                <View style={styles.appInfoContainer}>
                    <Text style={styles.appInfoText}>MEDI CONNECT</Text>
                    <Text style={styles.versionText}>Version 1.0.0</Text>
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
        marginTop: 16,
        fontSize: 16,
        color: '#666666',
        fontFamily: 'System',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        textAlign: 'center',
        fontFamily: 'System',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    userCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        marginVertical: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E53E3E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: 'System',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 4,
        fontFamily: 'System',
    },
    userEmail: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 12,
        fontFamily: 'System',
    },
    roleContainer: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333333',
        fontFamily: 'System',
    },
    detailsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 16,
        fontFamily: 'System',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    detailLabel: {
        fontSize: 16,
        color: '#666666',
        fontFamily: 'System',
        flex: 1,
    },
    detailValue: {
        fontSize: 16,
        color: '#333333',
        fontWeight: '500',
        fontFamily: 'System',
        flex: 2,
        textAlign: 'right',
    },
    actionsContainer: {
        marginBottom: 20,
    },
    editButton: {
        backgroundColor: '#F5F5F5',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    editButtonText: {
        fontSize: 16,
        color: '#333333',
        fontWeight: '600',
        fontFamily: 'System',
    },
    changePasswordButton: {
        backgroundColor: '#F5F5F5',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    changePasswordText: {
        fontSize: 16,
        color: '#333333',
        fontWeight: '600',
        fontFamily: 'System',
    },
    logoutButton: {
        backgroundColor: '#E53E3E',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 30,
    },
    logoutButtonDisabled: {
        backgroundColor: '#CCCCCC',
    },
    logoutButtonText: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: '600',
        fontFamily: 'System',
    },
    appInfoContainer: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    appInfoText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#999999',
        fontFamily: 'System',
        letterSpacing: 1,
    },
    versionText: {
        fontSize: 14,
        color: '#CCCCCC',
        marginTop: 4,
        fontFamily: 'System',
    },
});

export default ProfileScreen;
