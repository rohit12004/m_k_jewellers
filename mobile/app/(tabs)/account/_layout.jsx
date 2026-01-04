import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { withLayoutContext } from "expo-router";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import api from "../../../services/api";
import { login, logout } from "../../../store/slices/authSlice";
import { showToast } from "../../../utils/toast";
import { ROUTES } from "../../../constants/routes";

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

export default function AccountLayout() {
    const auth = useSelector((store) => store.authStore.auth);
    const dispatch = useDispatch();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isCheckingSession, setIsCheckingSession] = useState(true);

    // Session restoration
    useEffect(() => {
        const checkSession = async () => {
            if (!auth && !isLoggingOut) {
                try {
                    const token = await SecureStore.getItemAsync("access_token");
                    if (token) {
                        // Fetch user session from server
                        const { data } = await api.get("/api/auth/session");
                        if (data.success && data.data) {
                            dispatch(login(data.data));
                            setIsCheckingSession(false);
                            return;
                        }
                    }
                    router.replace(ROUTES.LOGIN);
                } catch (error) {
                    console.error("Session check error:", error);
                    router.replace(ROUTES.LOGIN);
                }
            } else {
                setIsCheckingSession(false);
            }
        };

        checkSession();
    }, [auth, isLoggingOut, dispatch, router]);

    // Logout handler
    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            const { data } = await api.post("/api/auth/logout");

            if (!data.success) {
                throw new Error(data.message);
            }

            // Clear both tokens and Redux state
            await SecureStore.deleteItemAsync("access_token");
            await SecureStore.deleteItemAsync("refresh_token");
            dispatch(logout());

            showToast("success", "Success", "Logged out successfully");
            router.replace(ROUTES.LOGIN);
        } catch (error) {
            console.error("Logout error:", error);
            showToast("error", "Error", error.message || "Failed to logout");
            setIsLoggingOut(false);
        }
    };

    if (!auth || isLoggingOut || isCheckingSession) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text className="text-gray-600 mt-4">Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            {/* Header with Gradient Background */}
            <View className="bg-white">
                <View className="px-6 py-5 border-b border-gray-100">
                    <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                            <Text className="text-2xl font-bold text-gray-900">My Account</Text>
                            <Text className="text-gray-500 text-sm mt-1">
                                Manage your profile and orders
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleLogout}
                            className="bg-red-50 px-4 py-2.5 rounded-xl flex-row items-center border border-red-100"
                            activeOpacity={0.7}
                        >
                            <Ionicons name="log-out-outline" size={18} color="#dc2626" />
                            <Text className="text-red-600 font-semibold ml-2 text-sm">Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Material Top Tabs */}
            <MaterialTopTabs
                screenOptions={{
                    tabBarActiveTintColor: "#7c3aed", // Purple to match website
                    tabBarInactiveTintColor: "#9ca3af",
                    tabBarLabelStyle: {
                        fontSize: 15,
                        fontWeight: "700",
                        textTransform: "none",
                        letterSpacing: 0.3,
                    },
                    tabBarItemStyle: {
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                    },
                    tabBarStyle: {
                        backgroundColor: "#ffffff",
                        elevation: 4,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 3,
                        borderBottomWidth: 0,
                        paddingTop: 4,
                    },
                    tabBarIndicatorStyle: {
                        backgroundColor: "#7c3aed",
                        height: 3,
                        borderRadius: 2,
                    },
                    tabBarPressColor: "#f3e8ff",
                    tabBarPressOpacity: 0.8,
                    swipeEnabled: true,
                    lazy: true,
                    lazyPreloadDistance: 0,
                }}
            >
                <MaterialTopTabs.Screen
                    name="dashboard"
                    options={{
                        tabBarLabel: "Dashboard",
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons
                                name={focused ? "grid" : "grid-outline"}
                                size={20}
                                color={color}
                            />
                        ),
                        tabBarShowIcon: true,
                    }}
                />
                <MaterialTopTabs.Screen
                    name="profile"
                    options={{
                        tabBarLabel: "Profile",
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons
                                name={focused ? "person" : "person-outline"}
                                size={20}
                                color={color}
                            />
                        ),
                        tabBarShowIcon: true,
                    }}
                />
            </MaterialTopTabs>
        </SafeAreaView>
    );
}

