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
                // Get refresh token
                const refreshToken = await SecureStore.getItemAsync("refresh_token");

                if (!refreshToken) {
                    throw new Error("No refresh token");
                }

                // Call refresh endpoint
                const response = await axios.post(
                    `${API_BASE_URL}/api/auth/refresh`,
                    { refreshToken }
                );

                if (response.data.success) {
                    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                    // Store new tokens
                    await SecureStore.setItemAsync("access_token", accessToken);
                    if (newRefreshToken) {
                        await SecureStore.setItemAsync("refresh_token", newRefreshToken);
                    }

                    // Update original request with new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                    // Retry original request
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed - logout user

                // Refresh failed - logout user
                await SecureStore.deleteItemAsync("access_token");
                await SecureStore.deleteItemAsync("refresh_token");
                store.dispatch(logout());
                showToast("error", "Session Expired", "Please login again");
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
