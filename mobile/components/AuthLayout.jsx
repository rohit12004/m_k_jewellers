import { View, Image, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthLayout({ children, title, subtitle }) {
    return (
        <View className="flex-1 bg-white">
            {/* Faded Background Logo */}
            <View className="absolute inset-0 items-center justify-center pointer-events-none">
                <Image
                    source={require("../assets/images/mk_logo.jpg")}
                    style={{ width: "80%", height: "80%", opacity: 0.05 }}
                    resizeMode="contain"
                />
            </View>

            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1"
                >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                        className="px-8 pt-10"
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View className="items-center mb-10">
                            <Image
                                source={require("../assets/images/mk_logo.jpg")}
                                style={{ width: 120, height: 120, borderRadius: 60 }}
                                className="mb-6 shadow-sm"
                            />
                            <Text className="text-3xl font-bold text-gray-900 tracking-tight">
                                M.K. JEWELLER'S
                            </Text>
                        </View>

                        <View className="mb-8">
                            <Text className="text-2xl font-bold text-gray-900 mb-2">
                                {title}
                            </Text>
                            {subtitle && (
                                <Text className="text-gray-500 text-base leading-5">
                                    {subtitle}
                                </Text>
                            )}
                        </View>

                        <View className="flex-1">{children}</View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}
