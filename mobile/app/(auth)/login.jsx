import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Link, useRouter } from "expo-router";
import AuthLayout from "../../components/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import api from "../../services/api";
import { API_ROUTES, ROUTES } from "../../constants/routes";
import { showToast } from "../../utils/toast";

export default function Login() {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });

    // Login Mutation
    const loginMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.post(API_ROUTES.LOGIN, data);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                // Navigate to Verify OTP Page
                router.push({
                    pathname: ROUTES.VERIFY_OTP,
                    params: { email: formData.email }
                });
            } else {
                showToast("error", "Error", data.message || "Login failed");
            }
        },
        onError: (error) => {
            console.log("Login Error:", error);
            const msg = error.response?.data?.message || error.message || "Login failed. Please try again.";
            showToast("error", "Error", msg);
        },
    });

    const handleLogin = () => {
        if (!formData.email || !formData.password) {
            showToast("error", "Validation", "Please fill in all fields");
            return;
        }
        loginMutation.mutate(formData);
    };

    return (
        <AuthLayout
            title="Login Into Account"
            subtitle="Login into your account by filling out the form below."
        >
            <Input
                label="Email"
                placeholder="example@email.com"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <Input
                label="Password"
                placeholder="Enter password"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry={!showPassword}
                rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                            name={showPassword ? "eye-off" : "eye"}
                            size={24}
                            color="gray"
                        />
                    </TouchableOpacity>
                }
            />

            <View className="mt-4">
                <Button
                    text="Login"
                    onPress={handleLogin}
                    loading={loginMutation.isPending}
                />
            </View>

            <View className="items-center mt-6 space-y-2">
                <View className="flex-row gap-1">
                    <Text className="text-gray-600">Don't Have Account?</Text>
                    <Link href={ROUTES.SIGNUP} asChild>
                        <TouchableOpacity>
                            <Text className="text-blue-600 font-bold underline">
                                Create Account!
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </View>
                <Link href={ROUTES.FORGOT_PASSWORD} asChild>
                    <TouchableOpacity>
                        <Text className="text-blue-600 underline">Forget Password?</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </AuthLayout>
    );
}
