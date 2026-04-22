import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Link, useRouter } from "expo-router";
import AuthLayout from "../../components/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { useAuthContext } from "../../context/AuthContext";
import { ROUTES } from "../../constants/routes";
import { showToast } from "../../utils/toast";

export default function Login() {
    const router = useRouter();
    const { login } = useAuthContext();
    const [isLoading, setIsLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });

    const handleLogin = async () => {
        if (!formData.email || !formData.password) {
            showToast("error", "Validation", "Please fill in all fields");
            return;
        }

        setIsLoading(true);
        try {
            const data = await login({ 
                email: formData.email, 
                password: formData.password 
            });

            if (data.success) {
                // Redirect to OTP verification
                router.push({
                    pathname: ROUTES.VERIFY_OTP,
                    params: { email: formData.email }
                });
            } else {
                showToast("error", "Login Failed", data.message || "Invalid credentials");
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message || "An error occurred during login";
            showToast("error", "Error", msg);
        } finally {
            setIsLoading(false);
        }
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
                    loading={isLoading}
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
