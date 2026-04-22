import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL, API_ROUTES } from "../constants/routes";
import { store } from "../store";
import { login, logout } from "../store/slices/authSlice";
import { showToast } from "../utils/toast";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Advanced Interceptor State
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor - Add access token
api.interceptors.request.use(
    async (config) => {
        const accessToken = await SecureStore.getItemAsync("access_token");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh with queueing
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 error and not a retry and not a login request
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/login')) {
            
            if (isRefreshing) {
                // Queue this request and wait for the refresh to finish
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                console.log('🔄 [API] Refreshing access token...');
                const refreshToken = await SecureStore.getItemAsync("refresh_token");

                if (!refreshToken) throw new Error("No refresh token");

                const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
                    refreshToken
                });

                if (response.data.success) {
                    const { accessToken, refreshToken: newRefreshToken, user: userData } = response.data.data;
                    
                    await SecureStore.setItemAsync("access_token", accessToken);
                    if (newRefreshToken) {
                        await SecureStore.setItemAsync("refresh_token", newRefreshToken);
                    }

                    // Sync fresh user data to Redux if returned
                    if (userData) {
                        console.log('🔄 [API] Syncing fresh user data to Redux');
                        store.dispatch(login(userData));
                    }

                    console.log('✅ [API] Refresh successful');
                    processQueue(null, accessToken);
                    
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } else {
                    throw new Error("Refresh failed");
                }
            } catch (refreshError) {
                console.error('❌ [API] Session lost:', refreshError.message);
                processQueue(refreshError, null);
                
                // Essential: Clear tokens and logout
                await SecureStore.deleteItemAsync("access_token");
                await SecureStore.deleteItemAsync("refresh_token");
                store.dispatch(logout());

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export const sendChatMessage = async (message, conversationId) => {
    try {
        const response = await api.post(API_ROUTES.CHATBOT_MESSAGE, {
            message,
            conversationId,
        });
        return response.data;
    } catch (error) {
        console.error("Chatbot API Error:", error);
        throw error;
    }
};

export default api;
