import { Stack, useSegments, Redirect, useRootNavigationState } from "expo-router";
import { useSelector, Provider, useDispatch } from "react-redux";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistGate } from "redux-persist/integration/react";
import { ActivityIndicator, View } from "react-native";
import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";
import { store, persistor } from "../store";
import { logout } from "../store/slices/authSlice";
import { showToast } from "../utils/toast";
import "../global.css";

const queryClient = new QueryClient();

const InitialLayout = () => {
  const auth = useSelector((state) => state.authStore.auth);
  const lastLogin = useSelector((state) => state.authStore.lastLogin);
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const dispatch = useDispatch();

  // 🔒 Check session expiration on mount
  useEffect(() => {
    const checkSessionExpiration = async () => {
      if (auth && lastLogin) {
        const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
        const sessionAge = Date.now() - lastLogin;

        if (sessionAge > SESSION_DURATION) {
          // Session expired - logout user
          console.log("Session expired, logging out...");

          // Clear persisted state
          await persistor.purge();

          // Clear token from SecureStore
          await SecureStore.deleteItemAsync("access_token");

          // Dispatch logout
          dispatch(logout());

          // Show toast notification
          showToast("error", "Session Expired", "Please login again for security");
        }
      }
    };

    checkSessionExpiration();
  }, [auth, lastLogin]);

  // ⏳ Wait until navigation is ready
  if (!navigationState?.key) return null;

  const inAuthGroup = segments[0] === "(auth)";
  const isAuthCallback = segments[0] === "auth-callback";

  // 🚫 Not logged in → force auth pages
  if (!auth && !inAuthGroup && !isAuthCallback) {
    return <Redirect href="/(auth)/login" />;
  }

  // ✅ Logged in → block auth pages
  if (auth && (inAuthGroup || isAuthCallback)) {
    if (auth.role === "admin") {
      return <Redirect href="/(admin)/dashboard" />;
    }
    return <Redirect href="/(tabs)/home" />;
  }

  // ✅ Normal render
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
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        }
        persistor={persistor}
      >
        <QueryClientProvider client={queryClient}>
          <InitialLayout />
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
