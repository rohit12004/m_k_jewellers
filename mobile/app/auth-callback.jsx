import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import "../global.css";

export default function AuthCallback() {
    const { token } = useLocalSearchParams();
    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        if (token) {
            const processToken = async () => {
                try {
                    // 1. Save token
                    await SecureStore.setItemAsync("access_token", token);

                    // 2. Decode user data from token
                    const decoded = jwtDecode(token);

                    // 3. Dispatch login
                    // Ensure the decoded token structure matches what authSlice expects
                    // Usually payload has { id, role, name, email ... }
                    // Our authSlice expects the whole object as payload

                    // We need to construct the user object. 
                    // The token payload IS the user object (mostly).
                    const userData = {
                        ...decoded,
                        // jwtDecode might add 'iat', 'exp'. We can keep them or filter.
                    };

                    dispatch(login(userData));

                    // Auto-redirect handled by RootLayout

                } catch (error) {
                    console.error("Auth Callback Error:", error);
                    // Use push instead of replace to avoid "Action not handled" if stack is empty/transitioning
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.navigate("/login");
                    }
                }
            };
            processToken();
        } else {
            // No token? Go to login
            router.navigate("/login");
        }
    }, [token]);

    return (
        <View className="flex-1 items-center justify-center bg-white">
            <ActivityIndicator size="large" color="#2563EB" />
            <Text className="mt-4 text-gray-600">Logging you in...</Text>
        </View>
    );
}
