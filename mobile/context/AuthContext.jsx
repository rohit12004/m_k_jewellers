import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useDispatch, useSelector } from 'react-redux';
import { login as loginAction, logout as logoutAction } from '../store/slices/authSlice';
import api from '../services/api';
import { API_ROUTES } from '../constants/routes';
import { showToast } from '../utils/toast';

const AuthContext = createContext({});

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.authStore.auth);
    const [isLoading, setIsLoading] = useState(true);
    const [isVerifyingSession, setIsVerifyingSession] = useState(false);
    const initializationAttempted = React.useRef(false);

    const initializeAuth = useCallback(async () => {
        if (initializationAttempted.current) return;
        initializationAttempted.current = true;

        try {
            console.log('🔄 [AUTH] Identifying session...');
            const refreshToken = await SecureStore.getItemAsync('refresh_token');

            if (!refreshToken) {
                console.log('ℹ️ [AUTH] No session found (Guest mode)');
                setIsLoading(false);
                return;
            }

            // Validate with backend
            const response = await api.get('/api/auth/session', {
                headers: { 'x-refresh-token': refreshToken }
            });

            if (response.data?.success && response.data?.data) {
                console.log('✅ [AUTH] Session restored:', response.data.data.email);
                dispatch(loginAction(response.data.data));
            } else {
                console.log('⚠️ [AUTH] Session invalid, clearing tokens');
                await clearTokens();
            }
        } catch (error) {
            console.log('❌ [AUTH] Initialization error:', error.message);
            // On 401, clear tokens. On network error, we might want to keep them, 
            // but for a clean "Industry Standard" start, we only trust a valid API response.
            if (error.response?.status === 401) {
                await clearTokens();
            }
        } finally {
            setIsLoading(false);
        }
    }, [dispatch]);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    const clearTokens = async () => {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        dispatch(logoutAction());
    };

    const login = useCallback(async (credentials) => {
        try {
            const response = await api.post(API_ROUTES.LOGIN, credentials);
            return response.data;
        } catch (error) {
            throw error;
        }
    }, []);

    const verifyOtp = useCallback(async (data) => {
        try {
            const response = await api.post(API_ROUTES.VERIFY_OTP, data);
            if (response.data.success && response.data.data) {
                const { accessToken, refreshToken, ...userData } = response.data.data;
                
                await SecureStore.setItemAsync('access_token', accessToken);
                await SecureStore.setItemAsync('refresh_token', refreshToken);
                
                dispatch(loginAction(response.data.data));
                return response.data;
            }
            throw new Error(response.data.message || 'OTP Verification failed');
        } catch (error) {
            throw error;
        }
    }, [dispatch]);

    const signup = useCallback(async (data) => {
        try {
            const response = await api.post(API_ROUTES.REGISTER, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }, []);

    const resendOtp = useCallback(async (email) => {
        try {
            const response = await api.post(API_ROUTES.RESEND_OTP, { email });
            return response.data;
        } catch (error) {
            throw error;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            // Optional: call backend logout here
            await clearTokens();
            showToast('success', 'Logged Out', 'Successfully logged out');
        } catch (error) {
            console.error('Logout failed:', error);
            await clearTokens();
        }
    }, [dispatch]);

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        isVerifyingSession,
        login,
        logout,
        verifyOtp,
        signup,
        resendOtp,
        refreshSession: initializeAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
