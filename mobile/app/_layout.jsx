import { Stack, useSegments, useRouter, Redirect, useRootNavigationState } from "expo-router";
import { Provider, useSelector } from "react-redux";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistGate } from "redux-persist/integration/react";
import { ActivityIndicator, View } from "react-native";
import { useEffect } from "react";
import Toast from "react-native-toast-message";
import { store, persistor } from "../store";
import { AuthProvider, useAuthContext } from "../context/AuthContext";
import "../global.css";

const queryClient = new QueryClient();

const InitialLayout = () => {
    const { user: auth, isLoading } = useAuthContext();
    const segments = useSegments();
    const router = useRouter();
    const navigationState = useRootNavigationState();

    // 🔄 Handle Centralized Redirects
    useEffect(() => {
        if (isLoading || !navigationState?.key) return;

        const inAuthGroup = segments[0] === "(auth)";
        const isAuthCallback = segments[0] === "auth-callback";
        const inTabsGroup = segments[0] === "(tabs)";

        console.log(`🔍 [LAYOUT] isLoading: ${isLoading}, hasAuth: ${!!auth}, navReady: ${!!navigationState.key}, segment: ${segments[0]}`);

        // ✅ Logged in → block auth pages, redirect to home
        if (auth && (inAuthGroup || isAuthCallback)) {
            router.replace("/(tabs)/home");
        } 
        // 🏠 Guest at root → redirect to home
        else if (!inAuthGroup && !isAuthCallback && !inTabsGroup) {
            router.replace("/(tabs)/home");
        }
    }, [auth, isLoading, navigationState?.key, segments]);

    // ⏳ Only show absolute spinner during initial auth check
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#7c3aed" />
            </View>
        );
    }

    return (
        <>
            <Stack screenOptions={{ headerShown: false }} />
            <StatusBar style="dark" />
            <Toast />
        </>
    );
};

export default function RootLayout() {
    return (
        <Provider store={store}>
            <PersistGate
                loading={
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                        <ActivityIndicator size="large" color="#7c3aed" />
                    </View>
                }
                persistor={persistor}
            >
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <InitialLayout />
                    </AuthProvider>
                </QueryClientProvider>
            </PersistGate>
        </Provider>
    );
}
