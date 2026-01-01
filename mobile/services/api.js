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

// Request interceptor - Add token to headers
api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor - Handle token expiration
api.interceptors.response.use(
    (response) => response, // Pass through successful responses
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized (token expired or invalid)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Clear token and logout
            await SecureStore.deleteItemAsync("access_token");
            store.dispatch(logout());

            // Show toast notification
            showToast("error", "Session Expired", "Please login again");

            // Don't redirect here - let the RootLayout handle it
            // The logout action will trigger the auth state change
        }

        return Promise.reject(error);
    }
);

export default api;
