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

import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';

export default function Signup() {
    const router = useRouter();

    // Clear stale token on mount to prevent "Already logged in" errors
    useEffect(() => {
        SecureStore.deleteItemAsync("access_token");
    }, []);

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const registerMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.post(API_ROUTES.REGISTER, data);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                showToast("success", "Account Created", "Please check your email to verify your account");
                setTimeout(() => {
                    router.replace(ROUTES.LOGIN);
                }, 2000);
            } else {
                showToast("error", "Error", data.message || "Registration failed");
            }
        },
        onError: (error) => {
            console.log("Signup Error:", error);
            const msg = error.response?.data?.message || error.message || "Registration failed";
            showToast("error", "Error", msg);
        }
    });

    const handleSignup = () => {
        const { name, email, password, confirmPassword } = formData;

        if (!name || !email || !password || !confirmPassword) {
            showToast("error", "Validation", "Please fill in all fields");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast("error", "Validation", "Please enter a valid email address");
            return;
        }

        if (password !== confirmPassword) {
            showToast("error", "Validation", "Passwords do not match");
            return;
        }

        if (password.length < 6) {
            showToast("error", "Validation", "Password must be at least 6 characters");
            return;
        }

        registerMutation.mutate({ name, email, password });
    };

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Create a new account by filling out the form below."
        >
            <Input
                label="Full Name"
                placeholder="Enter Your Name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
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
            <Input
                label="Confirm Password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChangeText={(text) =>
                    setFormData({ ...formData, confirmPassword: text })
                }
                secureTextEntry={!showConfirmPassword}
                rightIcon={
                    <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        <Ionicons
                            name={showConfirmPassword ? "eye-off" : "eye"}
                            size={24}
                            color="gray"
                        />
                    </TouchableOpacity>
                }
            />

            <View className="mt-4">
                <Button
                    text="Create Account"
                    onPress={handleSignup}
                    loading={registerMutation.isPending}
                />
            </View>

            <View className="items-center mt-6">
                <View className="flex-row gap-1">
                    <Text className="text-gray-600">Already Have Account?</Text>
                    <Link href="/login" replace asChild>
                        <TouchableOpacity>
                            <Text className="text-blue-600 font-bold underline">Login!</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </AuthLayout>
    );
}
