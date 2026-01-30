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
import { useSessionRestoration } from "../hooks/useSessionRestoration";
import "../global.css";

const queryClient = new QueryClient();

const InitialLayout = () => {
  const auth = useSelector((state) => state.authStore.auth);
  const lastLogin = useSelector((state) => state.authStore.lastLogin);
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const dispatch = useDispatch();

  // 🔄 Restore session on app startup (similar to web's GlobalProvider)
  const { isRestoring, sessionRestored } = useSessionRestoration();

  // 🔒 Check session expiration on mount
  useEffect(() => {
    const checkSessionExpiration = async () => {
      if (auth && lastLogin) {
        const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
        const sessionAge = Date.now() - lastLogin;

        if (sessionAge > SESSION_DURATION) {
          // Session expired - logout user
          console.log('🔒 [SESSION] Session expired after 30 days');

          // Clear persisted state
          await persistor.purge();

          // Clear BOTH tokens from SecureStore
          await SecureStore.deleteItemAsync("access_token");
          await SecureStore.deleteItemAsync("refresh_token");

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

  // ⏳ Show loading while restoring session
  if (isRestoring) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const inAuthGroup = segments[0] === "(auth)";
  const isAuthCallback = segments[0] === "auth-callback";
  const inTabsGroup = segments[0] === "(tabs)";
  const inRootGroup = segments[0] === "(root)";

  // ✅ Logged in → block auth pages, redirect to home
  if (auth && (inAuthGroup || isAuthCallback)) {
    return <Redirect href="/(tabs)/home" />;
  }



  // 🏠 Default route - redirect to home tabs (works for both logged in and logged out)
  if (!inAuthGroup && !isAuthCallback && !inTabsGroup && !inRootGroup) {
    return <Redirect href="/(tabs)/home" />;
  }

  // ✅ Normal render - allow access to tabs (auth check happens in Account tab)
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
