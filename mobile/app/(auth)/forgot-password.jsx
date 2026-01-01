import { useState, useRef } from "react";
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import AuthLayout from "../../components/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import api from "../../services/api";
import { API_ROUTES, ROUTES } from "../../constants/routes";
import { showToast } from "../../utils/toast";

export default function ForgotPassword() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const inputRefs = useRef([]);

    // Step 1: Send OTP Mutation
    const sendOtpMutation = useMutation({
        mutationFn: async (emailData) => {
            const response = await api.post(API_ROUTES.FORGOT_PASSWORD_SEND_OTP, { email: emailData });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                showToast("success", "OTP Sent", "Please check your email for the OTP code");
                setStep(2);
                // Focus first OTP input after a short delay
                setTimeout(() => {
                    inputRefs.current[0]?.focus();
                }, 300);
            } else {
                showToast("error", "Error", data.message || "Failed to send OTP");
            }
        },
        onError: (error) => {
            const msg = error.response?.data?.message || error.message || "Failed to send OTP";
            showToast("error", "Error", msg);
        },
    });

    // Step 2: Verify OTP Mutation
    const verifyOtpMutation = useMutation({
        mutationFn: async (otpData) => {
            const response = await api.post(API_ROUTES.FORGOT_PASSWORD_VERIFY_OTP, otpData);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                showToast("success", "OTP Verified", "Please enter your new password");
                setStep(3);
            } else {
                showToast("error", "Error", data.message || "Invalid OTP");
            }
        },
        onError: (error) => {
            const msg = error.response?.data?.message || error.message || "OTP verification failed";
            showToast("error", "Error", msg);
        },
    });

    // Step 3: Update Password Mutation
    const updatePasswordMutation = useMutation({
        mutationFn: async (passwordData) => {
            const response = await api.put(API_ROUTES.FORGOT_PASSWORD_UPDATE, passwordData);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                showToast("success", "Password Updated", "You can now login with your new password");
                setTimeout(() => {
                    router.replace(ROUTES.LOGIN);
                }, 1500);
            } else {
                showToast("error", "Error", data.message || "Failed to update password");
            }
        },
        onError: (error) => {
            const msg = error.response?.data?.message || error.message || "Failed to update password";
            showToast("error", "Error", msg);
        },
    });

    // Handlers
    const handleSendOtp = () => {
        if (!email) {
            showToast("error", "Validation", "Please enter your email");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast("error", "Validation", "Please enter a valid email address");
            return;
        }
        sendOtpMutation.mutate(email);
    };

    const handleOtpChange = (text, index) => {
        // Handle paste
        if (text.length > 1) {
            const pastedCode = text.slice(0, 6).split("");
            const newOtp = [...otp];
            pastedCode.forEach((char, i) => {
                if (index + i < 6) newOtp[index + i] = char;
            });
            setOtp(newOtp);
            const nextIndex = Math.min(index + text.length, 5);
            inputRefs.current[nextIndex]?.focus();
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                const newOtp = [...otp];
                newOtp[index - 1] = "";
                setOtp(newOtp);
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handleVerifyOtp = () => {
        const otpString = otp.join("");
        if (otpString.length !== 6) {
            showToast("error", "Validation", "Please enter a valid 6-digit OTP");
            return;
        }
        verifyOtpMutation.mutate({ email, otp: otpString });
    };

    const handleResendOtp = () => {
        setOtp(["", "", "", "", "", ""]);
        sendOtpMutation.mutate(email);
    };

    const handleUpdatePassword = () => {
        if (!password || !confirmPassword) {
            showToast("error", "Validation", "Please fill in all fields");
            return;
        }
        if (password.length < 6) {
            showToast("error", "Validation", "Password must be at least 6 characters");
            return;
        }
        if (password !== confirmPassword) {
            showToast("error", "Validation", "Passwords do not match");
            return;
        }
        updatePasswordMutation.mutate({ email, password });
    };

    return (
        <AuthLayout
            title={
                step === 1 ? "Forgot Password" :
                    step === 2 ? "Verify OTP" :
                        "Set New Password"
            }
            subtitle={
                step === 1 ? "Enter your email to receive a password reset code" :
                    step === 2 ? `Enter the 6-digit code sent to ${email}` :
                        "Create a new password for your account"
            }
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Step 1: Email Input */}
                {step === 1 && (
                    <>
                        <Input
                            label="Email"
                            placeholder="example@email.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        <View className="mt-4">
                            <Button
                                text="Send OTP"
                                onPress={handleSendOtp}
                                loading={sendOtpMutation.isPending}
                            />
                        </View>

                        <View className="items-center mt-6">
                            <Link href={ROUTES.LOGIN} asChild>
                                <TouchableOpacity>
                                    <Text className="text-blue-600 underline">Back to Login</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </>
                )}

                {/* Step 2: OTP Verification */}
                {step === 2 && (
                    <>
                        <View className="flex-row justify-between mb-8 mt-4">
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => (inputRefs.current[index] = ref)}
                                    className={`w-11 h-14 border-2 rounded-xl text-center text-xl font-bold ${digit ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 bg-gray-50 text-gray-900'
                                        }`}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    value={digit}
                                    onChangeText={(text) => handleOtpChange(text, index)}
                                    onKeyPress={(e) => handleOtpKeyPress(e, index)}
                                    selectTextOnFocus
                                />
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={handleVerifyOtp}
                            disabled={verifyOtpMutation.isPending}
                            className={`w-full bg-blue-600 py-4 rounded-xl items-center flex-row justify-center shadow-lg shadow-blue-200 ${verifyOtpMutation.isPending ? 'opacity-70' : ''
                                }`}
                        >
                            {verifyOtpMutation.isPending ? <ActivityIndicator color="#fff" className="mr-2" /> : null}
                            <Text className="text-white font-bold text-base">Verify OTP</Text>
                        </TouchableOpacity>

                        <View className="items-center mt-6 space-y-3">
                            <TouchableOpacity
                                onPress={handleResendOtp}
                                disabled={sendOtpMutation.isPending}
                            >
                                <Text className="text-blue-600 underline">
                                    {sendOtpMutation.isPending ? "Sending..." : "Resend OTP"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                    <>
                        <Input
                            label="New Password"
                            placeholder="Enter new password"
                            value={password}
                            onChangeText={setPassword}
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
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            rightIcon={
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
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
                                text="Update Password"
                                onPress={handleUpdatePassword}
                                loading={updatePasswordMutation.isPending}
                            />
                        </View>
                    </>
                )}
            </ScrollView>
        </AuthLayout>
    );
}
