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

const RegisterScreen = ({ navigation, onNavigateToLogin, onGoBack }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register, error, clearError } = useAuth();

    const handleRegister = async () => {
        // Basic validation
        if (!fullName.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (!isValidEmail(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return;
        }

        try {
            setIsLoading(true);
            clearError();

            const result = await register(email.trim(), password, fullName.trim(), phone.trim());

            if (result.success) {
                Alert.alert(
                    'Registration Successful',
                    result.message,
                    [
                        {
                            text: 'OK',
                            onPress: () => onNavigateToLogin && onNavigateToLogin()
                        }
                    ]
                );
            } else {
                Alert.alert('Registration Failed', result.message);
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleFacebookSignup = () => {
        // Handle Facebook signup
        console.log('Facebook signup pressed');
    };

    const handleGoogleSignup = () => {
        // Handle Google signup
        console.log('Google signup pressed');
    };

    const navigateToLogin = () => {
        // Navigate to login screen
        onNavigateToLogin && onNavigateToLogin();
    };

    const goBack = () => {
        // Navigate back
        onGoBack && onGoBack();
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
                    <TouchableOpacity style={styles.backButton} onPress={goBack}>
                        <Text style={styles.backArrow}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Sign Up</Text>
                </View>

                {/* Form */}
                <View style={styles.formContainer}>
                    {/* Full Name Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            placeholderTextColor="#999999"
                            value={fullName}
                            onChangeText={setFullName}
                            autoCapitalize="words"
                        />
                    </View>

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

                    {/* Phone Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number (Optional)"
                            placeholderTextColor="#999999"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
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

                    {/* Sign Up Button */}
                    <TouchableOpacity
                        style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <Text style={styles.signupButtonText}>Sign Up</Text>
                        )}
                    </TouchableOpacity>

                    {/* Or sign up with */}
                    <Text style={styles.orText}>Or sign up with</Text>

                    {/* Social Login Buttons */}
                    <View style={styles.socialContainer}>
                        <TouchableOpacity style={styles.socialButton} onPress={handleFacebookSignup}>
                            <Text style={styles.socialButtonText}>Facebook</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignup}>
                            <Text style={styles.socialButtonText}>Google</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Login Link */}
                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Already have an account? </Text>
                    <TouchableOpacity onPress={navigateToLogin}>
                        <Text style={styles.loginLink}>Log In</Text>
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
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 50,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 0,
        padding: 5,
    },
    backArrow: {
        fontSize: 24,
        color: '#333333',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        textAlign: 'center',
        flex: 1,
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
    signupButton: {
        backgroundColor: '#E53E3E',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    signupButtonDisabled: {
        backgroundColor: '#CCCCCC',
    },
    signupButtonText: {
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
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 'auto',
    },
    loginText: {
        fontSize: 16,
        color: '#666666',
        fontFamily: 'System',
    },
    loginLink: {
        fontSize: 16,
        color: '#E53E3E',
        fontWeight: '600',
        fontFamily: 'System',
    },
});

export default RegisterScreen;