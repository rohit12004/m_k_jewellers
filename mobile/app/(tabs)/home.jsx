import { View, Text, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { logout } from "../../store/slices/authSlice";
import { persistor } from "../../store";
import { ROUTES } from "../../constants/routes";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
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
        <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
            <Text className="text-2xl font-bold mb-4">Welcome Home!</Text>

            {user && (
                <View className="mb-8 items-center">
                    <Text className="text-lg">Hello, {user.name || "User"}</Text>
                    <Text className="text-gray-500">{user.email}</Text>
                </View>
            )}

            <TouchableOpacity
                onPress={handleLogout}
                className="bg-red-500 py-3 px-8 rounded-xl"
            >
                <Text className="text-white font-bold">Logout</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
