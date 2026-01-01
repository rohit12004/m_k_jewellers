import { View, Text, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { logout } from "../../store/slices/authSlice";
import { persistor } from "../../store";
import { ROUTES } from "../../constants/routes";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Dashboard() {
    const dispatch = useDispatch();
    const router = useRouter();
    const user = useSelector((state) => state.authStore.auth);

    const handleLogout = async () => {
        // Clear persisted Redux state
        await persistor.purge();

        // Clear token from SecureStore
        await SecureStore.deleteItemAsync("access_token");

        // Dispatch logout action
        dispatch(logout());

        // Redirect to login
        router.replace(ROUTES.LOGIN);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center p-6">
            <Text className="text-2xl font-bold mb-4 text-white">Admin Dashboard</Text>

            <View className="bg-gray-800 p-6 rounded-xl w-full mb-8">
                <Text className="text-gray-400 mb-2">Logged in as:</Text>
                <Text className="text-xl font-bold text-white mb-1">{user?.name || "Admin"}</Text>
                <Text className="text-blue-400">{user?.email}</Text>
                <View className="mt-4 bg-blue-500/20 self-start px-3 py-1 rounded-full">
                    <Text className="text-blue-400 text-xs font-bold uppercase tracking-wider">Administrator</Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={handleLogout}
                className="bg-red-600 py-3 px-8 rounded-xl w-full items-center"
            >
                <Text className="text-white font-bold">Logout</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
