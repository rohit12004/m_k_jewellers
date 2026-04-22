import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Link, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import AuthLayout from "../../components/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { useAuthContext } from "../../context/AuthContext";
import { API_ROUTES, ROUTES } from "../../constants/routes";
import { showToast } from "../../utils/toast";

export default function Signup() {
    const { signup } = useAuthContext();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    // Clear stale token on mount to prevent "Already logged in" errors
    useEffect(() => {
        SecureStore.deleteItemAsync("access_token");
    }, []);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleSignup = async () => {
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

        setIsSubmitting(true);
        try {
            const data = await signup({ name, email, password });
            if (data.success) {
                showToast("success", "Account Created", "Please check your email to verify your account");
                router.replace(ROUTES.LOGIN);
            } else {
                showToast("error", "Signup Failed", data.message || "Could not create account");
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message || "Signup failed";
            showToast("error", "Error", msg);
        } finally {
            setIsSubmitting(false);
        }
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
                    loading={isSubmitting}
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
