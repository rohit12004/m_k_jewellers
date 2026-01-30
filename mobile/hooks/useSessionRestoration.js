import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import { login, logout } from '../store/slices/authSlice';
import { showToast } from '../utils/toast';

/**
 * Session Restoration Hook
 * Restores user session on app startup by validating stored tokens
 * Similar to web's GlobalProvider session restoration
 */
export const useSessionRestoration = () => {
    const dispatch = useDispatch();
    const [isRestoring, setIsRestoring] = useState(true);
    const [sessionRestored, setSessionRestored] = useState(false);

    useEffect(() => {
        const restoreSession = async () => {
            try {
                console.log('🔄 [SESSION] Starting session restoration...');

                // Check if we have tokens in SecureStore
                const accessToken = await SecureStore.getItemAsync('access_token');
                const refreshToken = await SecureStore.getItemAsync('refresh_token');

                if (!accessToken && !refreshToken) {
                    console.log('❌ [SESSION] No tokens found, user needs to login');
                    setIsRestoring(false);
                    return;
                }

                // Validate session with backend (similar to web's /api/auth/session)
                // This endpoint will:
                // 1. Return session if access token is valid
                // 2. Auto-refresh if access token expired but refresh token is valid
                // 3. Return 401 if both tokens are invalid
                const response = await api.get('/api/auth/session');

                if (response.data?.success && response.data?.data) {
                    console.log('✅ [SESSION] Session restored successfully');

                    // Dispatch login with restored session data
                    dispatch(login(response.data.data));
                    setSessionRestored(true);
                } else {
                    console.log('❌ [SESSION] Session validation failed');
                    await clearInvalidSession();
                }
            } catch (error) {
                console.error('❌ [SESSION] Restoration error:', error.message);

                // If it's a 401 error, clear the session
                if (error.response?.status === 401) {
                    console.log('🔒 [SESSION] Session expired, clearing tokens');
                    await clearInvalidSession();
                }
                // For other errors (network, server), keep tokens and try again later
            } finally {
                setIsRestoring(false);
            }
        };

        restoreSession();
    }, [dispatch]);

    const clearInvalidSession = async () => {
        try {
            // Clear tokens from SecureStore
            await SecureStore.deleteItemAsync('access_token');
            await SecureStore.deleteItemAsync('refresh_token');

            // Clear Redux state
            dispatch(logout());
        } catch (error) {
            console.error('❌ [SESSION] Error clearing session:', error);
        }
    };

    return { isRestoring, sessionRestored };
};
