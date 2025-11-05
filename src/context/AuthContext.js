import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../api/authentication';

// Initial state
const initialState = {
    isLoading: true,
    isAuthenticated: false,
    user: null,
    error: null,
};

// Action types
const AUTH_ACTIONS = {
    LOADING: 'LOADING',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGOUT: 'LOGOUT',
    ERROR: 'ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
    UPDATE_USER: 'UPDATE_USER',
};

// Reducer function
const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.LOADING:
            return {
                ...state,
                isLoading: action.payload,
                error: null,
            };
        case AUTH_ACTIONS.LOGIN_SUCCESS:
            return {
                ...state,
                isLoading: false,
                isAuthenticated: true,
                user: action.payload,
                error: null,
            };
        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                isLoading: false,
                isAuthenticated: false,
                user: null,
                error: null,
            };
        case AUTH_ACTIONS.ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            };
        case AUTH_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };
        case AUTH_ACTIONS.UPDATE_USER:
            return {
                ...state,
                user: { ...state.user, ...action.payload },
            };
        default:
            return state;
    }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Initialize authentication on app start
    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            dispatch({ type: AUTH_ACTIONS.LOADING, payload: true });

            const isAuthenticated = await authService.initializeAuth();

            if (isAuthenticated) {
                const userData = authService.getCurrentUserData();
                dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: userData });
            } else {
                dispatch({ type: AUTH_ACTIONS.LOGOUT });
            }
        } catch (error) {
            console.error('Auth initialization error:', error);
            dispatch({ type: AUTH_ACTIONS.ERROR, payload: 'Failed to initialize authentication' });
        } finally {
            dispatch({ type: AUTH_ACTIONS.LOADING, payload: false });
        }
    };

    // Login function
    const login = async (email, password) => {
        try {
            dispatch({ type: AUTH_ACTIONS.LOADING, payload: true });
            dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

            const result = await authService.login(email, password);

            if (result.success) {
                dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: result.user });
                return { success: true, message: result.message };
            } else {
                dispatch({ type: AUTH_ACTIONS.ERROR, payload: result.message });
                return { success: false, message: result.message };
            }
        } catch (error) {
            const errorMessage = 'Login failed. Please try again.';
            dispatch({ type: AUTH_ACTIONS.ERROR, payload: errorMessage });
            return { success: false, message: errorMessage };
        } finally {
            dispatch({ type: AUTH_ACTIONS.LOADING, payload: false });
        }
    };

    // Register function
    const register = async (email, password, fullName, phone = '') => {
        try {
            dispatch({ type: AUTH_ACTIONS.LOADING, payload: true });
            dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

            const result = await authService.register(email, password, fullName, phone);

            if (result.success) {
                // If registration returns session data, log the user in automatically
                if (result.session) {
                    dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: result.user });
                }
                return { success: true, message: result.message, user: result.user };
            } else {
                dispatch({ type: AUTH_ACTIONS.ERROR, payload: result.message });
                return { success: false, message: result.message };
            }
        } catch (error) {
            const errorMessage = 'Registration failed. Please try again.';
            dispatch({ type: AUTH_ACTIONS.ERROR, payload: errorMessage });
            return { success: false, message: errorMessage };
        } finally {
            dispatch({ type: AUTH_ACTIONS.LOADING, payload: false });
        }
    };

    // Logout function
    const logout = async () => {
        try {
            dispatch({ type: AUTH_ACTIONS.LOADING, payload: true });
            await authService.logout();
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
        } catch (error) {
            console.error('Logout error:', error);
            // Even if logout API fails, clear local state
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
        } finally {
            dispatch({ type: AUTH_ACTIONS.LOADING, payload: false });
        }
    };

    // Update user profile
    const updateProfile = async (profileData) => {
        try {
            dispatch({ type: AUTH_ACTIONS.LOADING, payload: true });

            const result = await authService.updateProfile(profileData);

            if (result.success) {
                dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: result.user });
                return { success: true, message: result.message };
            } else {
                dispatch({ type: AUTH_ACTIONS.ERROR, payload: result.message });
                return { success: false, message: result.message };
            }
        } catch (error) {
            const errorMessage = 'Profile update failed. Please try again.';
            dispatch({ type: AUTH_ACTIONS.ERROR, payload: errorMessage });
            return { success: false, message: errorMessage };
        } finally {
            dispatch({ type: AUTH_ACTIONS.LOADING, payload: false });
        }
    };

    // Change password
    const changePassword = async (currentPassword, newPassword) => {
        try {
            dispatch({ type: AUTH_ACTIONS.LOADING, payload: true });

            const result = await authService.changePassword(currentPassword, newPassword);

            if (result.success) {
                return { success: true, message: result.message };
            } else {
                dispatch({ type: AUTH_ACTIONS.ERROR, payload: result.message });
                return { success: false, message: result.message };
            }
        } catch (error) {
            const errorMessage = 'Password change failed. Please try again.';
            dispatch({ type: AUTH_ACTIONS.ERROR, payload: errorMessage });
            return { success: false, message: errorMessage };
        } finally {
            dispatch({ type: AUTH_ACTIONS.LOADING, payload: false });
        }
    };

    // Clear error
    const clearError = () => {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    };

    // Context value
    const value = {
        // State
        isLoading: state.isLoading,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        error: state.error,

        // Actions
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;