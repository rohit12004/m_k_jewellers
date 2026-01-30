import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../constants/routes";
import { store } from "../store";
import { logout } from "../store/slices/authSlice";
import { showToast } from "../utils/toast";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor - Add access token
api.interceptors.request.use(
    async (config) => {
        const accessToken = await SecureStore.getItemAsync("access_token");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
            // Only log for non-public routes
            if (!config.url?.includes('/get-all') && !config.url?.includes('/get-featured')) {
                console.log(`🔐 [API] ${config.method?.toUpperCase()} ${config.url} - Using access token`);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 error and haven't retried yet, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                console.log('🔄 [API] Access token expired, attempting refresh...');

                // Get refresh token
                const refreshToken = await SecureStore.getItemAsync("refresh_token");

                if (!refreshToken) {
                    console.log('❌ [API] No refresh token found');
                    throw new Error("No refresh token");
                }

                console.log('✅ [API] Refresh token found, calling refresh endpoint...');

                // Call refresh endpoint
                const response = await axios.post(
                    `${API_BASE_URL}/api/auth/refresh`,
                    { refreshToken }
                );

                if (response.data.success) {
                    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                    console.log('✅ [API] Token refresh successful');

                    // Store new tokens
                    await SecureStore.setItemAsync("access_token", accessToken);
                    if (newRefreshToken) {
                        await SecureStore.setItemAsync("refresh_token", newRefreshToken);
                    }

                    // Update original request with new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                    // Retry original request
                    return api(originalRequest);
                } else {
                    console.log('❌ [API] Refresh endpoint returned failure');
                    throw new Error("Refresh failed");
                }
            } catch (refreshError) {
                // Refresh failed - logout user
                console.error('❌ [API] Token refresh failed:', refreshError.message);

                // Clear tokens
                await SecureStore.deleteItemAsync("access_token");
                await SecureStore.deleteItemAsync("refresh_token");

                // Dispatch logout
                store.dispatch(logout());

                // Show user-friendly error message
                const errorMsg = refreshError.response?.data?.message || "Session expired";
                showToast("error", "Session Expired", errorMsg);

                return Promise.reject(refreshError);
            }
        }

        // Log other API errors for debugging
        if (error.response) {
            console.log(`❌ [API] ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response.status}`);
        } else if (error.request) {
            console.log(`❌ [API] Network error - ${error.config?.url}`);
        }

        return Promise.reject(error);
    }
);

export default api;
