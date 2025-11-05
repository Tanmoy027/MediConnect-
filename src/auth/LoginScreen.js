import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context';

const LoginScreen = ({ navigation, onNavigateToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, error, clearError } = useAuth();

    const handleLogin = async () => {
        // Basic validation
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!isValidEmail(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        try {
            setIsLoading(true);
            clearError();

            const result = await login(email.trim(), password);

            if (!result.success) {
                Alert.alert('Login Failed', result.message || 'Invalid credentials');
            }
            // If successful, the AuthContext will handle navigation
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Error', 'Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleFacebookLogin = () => {
        // Handle Facebook login
        console.log('Facebook login pressed');
    };

    const handleGoogleLogin = () => {
        // Handle Google login
        console.log('Google login pressed');
    };

    const navigateToRegister = () => {
        // Navigate to registration screen
        onNavigateToRegister && onNavigateToRegister();
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.appName}>MEDI CONNECT</Text>
                    <Text style={styles.welcomeText}>Welcome Back</Text>
                </View>

                {/* Form */}
                <View style={styles.formContainer}>
                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#999999"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#999999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <Text style={styles.loginButtonText}>Login</Text>
                        )}
                    </TouchableOpacity>

                    {/* Or login with */}
                    <Text style={styles.orText}>Or login with</Text>

                    {/* Social Login Buttons */}
                    <View style={styles.socialContainer}>
                        <TouchableOpacity style={styles.socialButton} onPress={handleFacebookLogin}>
                            <Text style={styles.socialButtonText}>Facebook</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
                            <Text style={styles.socialButtonText}>Google</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Register Link */}
                <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={navigateToRegister}>
                        <Text style={styles.registerLink}>Register</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 30,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 50,
    },
    appName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 20,
        fontFamily: 'System',
        letterSpacing: 1,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333333',
        fontFamily: 'System',
    },
    formContainer: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 12,
        fontSize: 16,
        color: '#333333',
        fontFamily: 'System',
    },
    loginButton: {
        backgroundColor: '#E53E3E',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    loginButtonDisabled: {
        backgroundColor: '#CCCCCC',
    },
    loginButtonText: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: '600',
        fontFamily: 'System',
    },
    orText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666666',
        marginBottom: 20,
        fontFamily: 'System',
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    socialButton: {
        backgroundColor: '#F5F5F5',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 12,
        flex: 0.48,
        alignItems: 'center',
    },
    socialButtonText: {
        fontSize: 16,
        color: '#333333',
        fontWeight: '500',
        fontFamily: 'System',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 'auto',
    },
    registerText: {
        fontSize: 16,
        color: '#666666',
        fontFamily: 'System',
    },
    registerLink: {
        fontSize: 16,
        color: '#E53E3E',
        fontWeight: '600',
        fontFamily: 'System',
    },
});

export default LoginScreen;