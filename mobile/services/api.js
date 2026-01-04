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
        // SECURITY: Never log tokens in production
        if (__DEV__) {
            console.log("API Request:", config.url);
        }
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
                console.log("🔄 Access token expired, attempting refresh...");

                // Get refresh token
                const refreshToken = await SecureStore.getItemAsync("refresh_token");

                if (!refreshToken) {
                    console.log("❌ No refresh token found");
                    throw new Error("No refresh token");
                }

                console.log("📡 Calling refresh endpoint...");

                // Call refresh endpoint
                const response = await axios.post(
                    `${API_BASE_URL}/api/auth/refresh`,
                    { refreshToken }
                );

                if (response.data.success) {
                    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                    console.log("✅ Token refresh successful");

                    // Store new tokens
                    await SecureStore.setItemAsync("access_token", accessToken);
                    await SecureStore.setItemAsync("refresh_token", newRefreshToken);

                    // Update original request with new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                    // Retry original request
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.log("❌ Token refresh failed:", refreshError.message);

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
