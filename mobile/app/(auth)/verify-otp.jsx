import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useState, useRef, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import * as SecureStore from "expo-secure-store";
import api from "../../services/api";
import { API_ROUTES, ROUTES } from "../../constants/routes";
import { login } from "../../store/slices/authSlice";
import AuthLayout from "../../components/AuthLayout";
import { showToast } from "../../utils/toast";

export default function VerifyOtp() {
    const { email } = useLocalSearchParams();
    const router = useRouter();
    const dispatch = useDispatch();

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [countdown, setCountdown] = useState(0);
    const inputRefs = useRef([]);

    useEffect(() => {
        // Focus first input on mount
        setTimeout(() => {
            inputRefs.current[0]?.focus();
        }, 100);
    }, []);

    // Countdown timer for resend OTP
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleChange = (text, index) => {
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

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                const newOtp = [...otp];
                newOtp[index - 1] = "";
                setOtp(newOtp);
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    // Verify OTP Mutation
    const verifyOtpMutation = useMutation({
        mutationFn: async (otpString) => {
            const response = await api.post(API_ROUTES.VERIFY_OTP, { email, otp: otpString });
            return response.data;
        },
        onSuccess: async (response) => {
            if (response.success && response.data?.accessToken) {
                // Store both access token and refresh token
                await SecureStore.setItemAsync("access_token", response.data.accessToken);
                await SecureStore.setItemAsync("refresh_token", response.data.refreshToken);
                dispatch(login(response.data));

                // Auto-redirect handled by RootLayout based on auth state
            } else {
                showToast("error", "Error", response.message || "Invalid OTP");
            }
        },
        onError: (error) => {
            const msg = error.response?.data?.message || error.message || "Verification failed";
            showToast("error", "Error", msg);
        },
    });

    // Resend OTP Mutation
    const resendOtpMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post(API_ROUTES.RESEND_OTP, { email });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                showToast("success", "OTP Sent", "A new OTP has been sent to your email");
                setCountdown(30); // 30 second cooldown
                setOtp(["", "", "", "", "", ""]); // Clear OTP inputs
                inputRefs.current[0]?.focus();
            } else {
                showToast("error", "Error", data.message || "Failed to resend OTP");
            }
        },
        onError: (error) => {
            const msg = error.response?.data?.message || error.message || "Failed to resend OTP";
            showToast("error", "Error", msg);
        },
    });

    const handleVerify = () => {
        const otpString = otp.join("");
        if (otpString.length === 6) {
            verifyOtpMutation.mutate(otpString);
        } else {
            showToast("error", "Error", "Please enter a valid 6-digit OTP");
        }
    };

    const handleResendOtp = () => {
        if (countdown > 0) return; // Prevent spam
        resendOtpMutation.mutate();
    };

    return (
        <AuthLayout
            title="Verify OTP"
            subtitle={`Enter the 6-digit code sent to ${email}`}
        >
            <View className="flex-1 justify-between">
                <View>
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
                                onChangeText={(text) => handleChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={handleVerify}
                        disabled={verifyOtpMutation.isPending}
                        className={`w-full bg-blue-600 py-4 rounded-xl items-center flex-row justify-center shadow-lg shadow-blue-200 ${verifyOtpMutation.isPending ? 'opacity-70' : ''}`}
                    >
                        {verifyOtpMutation.isPending ? <ActivityIndicator color="#fff" className="mr-2" /> : null}
                        <Text className="text-white font-bold text-base">
                            Verify
                        </Text>
                    </TouchableOpacity>

                    <View className="items-center mt-6 space-y-3">
                        <TouchableOpacity
                            onPress={handleResendOtp}
                            disabled={countdown > 0 || resendOtpMutation.isPending}
                            className={countdown > 0 || resendOtpMutation.isPending ? 'opacity-50' : ''}
                        >
                            <Text className="text-blue-600 underline font-medium">
                                {countdown > 0
                                    ? `Resend OTP in ${countdown}s`
                                    : resendOtpMutation.isPending
                                        ? "Sending..."
                                        : "Resend OTP"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.back()}
                        >
                            <Text className="text-gray-500 font-medium">Back to Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </AuthLayout>
    );
}
