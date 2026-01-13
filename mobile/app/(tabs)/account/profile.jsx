import { useState, useEffect } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import api from "../../../services/api";
import { API_ROUTES } from "../../../constants/routes";
import { login } from "../../../store/slices/authSlice";
import { showToast } from "../../../utils/toast";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

export default function Profile() {
    const auth = useSelector((store) => store.authStore.auth);
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const [refreshing, setRefreshing] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        street: "",
        street2: "",
        city: "",
        state: "",
        postalCode: "",
    });

    // Pre-fill form with user data from Redux
    useEffect(() => {
        // console.log("Profile data for form:", auth); // Removed for security
        if (auth) {
            setFormData({
                name: auth.name || "",
                email: auth.email || "",
                phone: auth.phone || "",
                street: "",
                street2: "",
                city: "",
                state: "",
                postalCode: "",
            });

            // Parse address if it exists
            if (auth.address) {
                // console.log("Address data:", auth.address); // Removed for security
                try {
                    const addressData = JSON.parse(auth.address);
                    // console.log("Parsed address:", addressData); // Removed for security
                    setFormData((prev) => ({
                        ...prev,
                        street: addressData.street || "",
                        street2: addressData.street2 || "",
                        city: addressData.city || "",
                        state: addressData.state || "",
                        postalCode: addressData.postalCode || "",
                    }));
                } catch (e) {
                    // console.log("Address parse error, using as street:", e); // Removed for security
                    // If address is not JSON, treat it as street address
                    setFormData((prev) => ({
                        ...prev,
                        street: auth.address || "",
                    }));
                }
            }
        }
    }, [auth]);

    // Pull-to-refresh handler
    const onRefresh = async () => {
        setRefreshing(true);
        try {
            // Refresh is handled by the parent layout's session check
            await new Promise(resolve => setTimeout(resolve, 500));
        } finally {
            setRefreshing(false);
        }
    };

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: async (data) => {
            const addressData = {
                street: data.street,
                street2: data.street2,
                city: data.city,
                state: data.state,
                postalCode: data.postalCode,
            };

            const response = await api.put(API_ROUTES.UPDATE_PROFILE, {
                name: data.name,
                phone: data.phone,
                address: JSON.stringify(addressData),
            });

            return response.data;
        },
        onSuccess: async (data) => {
            if (data.success) {
                // Update Redux with new user data
                dispatch(login(data.data));

                // Save new access token to SecureStore (backend returns new token)
                if (data.data.accessToken) {
                    await SecureStore.setItemAsync("access_token", data.data.accessToken);
                }

                // Invalidate profile cache to fetch fresh data
                queryClient.invalidateQueries(["user-profile", auth?.id]);
                showToast("success", "Success", "Profile updated successfully!");
            } else {
                showToast("error", "Error", data.message || "Failed to update profile");
            }
        },
        onError: (error) => {
            console.error("Profile update error:", error);
            showToast(
                "error",
                "Error",
                error.response?.data?.message || "Failed to update profile"
            );
        },
    });

    // Handle profile update
    const handleUpdateProfile = () => {
        // Validation
        if (!formData.name || formData.name.length < 2) {
            showToast("error", "Validation", "Name must be at least 2 characters");
            return;
        }

        if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone)) {
            showToast("error", "Validation", "Please enter a valid 10-digit phone number");
            return;
        }

        if (!formData.street || formData.street.length < 3) {
            showToast("error", "Validation", "Street address must be at least 3 characters");
            return;
        }

        if (!formData.city) {
            showToast("error", "Validation", "City is required");
            return;
        }

        if (!formData.state) {
            showToast("error", "Validation", "State/Province is required");
            return;
        }

        if (!formData.postalCode || !/^[0-9]{6}$/.test(formData.postalCode)) {
            showToast("error", "Validation", "Please enter a valid 6-digit postal code");
            return;
        }

        updateProfileMutation.mutate(formData);
    };

    return (
        <ScrollView
            className="flex-1 bg-gray-50 px-6 py-4"
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={["#3b82f6"]} // Android
                    tintColor="#3b82f6" // iOS
                />
            }
        >
            {/* Profile Form */}
            <View className="bg-white rounded-lg p-4 mb-4">
                <Text className="text-xl font-bold text-gray-900 mb-4">Profile Information</Text>

                <Input
                    label="Full Name *"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                />

                <Input
                    label="Email Address"
                    placeholder="Email"
                    value={formData.email}
                    editable={false}
                    className="bg-gray-100"
                />
                <Text className="text-xs text-gray-500 -mt-2 mb-4">Email cannot be changed</Text>

                <Input
                    label="Phone Number *"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    keyboardType="phone-pad"
                    maxLength={10}
                />

                <Text className="text-base font-semibold text-gray-900 mb-3 mt-4">
                    Delivery Address
                </Text>

                <Input
                    label="Street Address *"
                    placeholder="House number and street name"
                    value={formData.street}
                    onChangeText={(text) => setFormData({ ...formData, street: text })}
                />

                <Input
                    label="Street Address Line 2"
                    placeholder="Apartment, suite, unit, etc. (optional)"
                    value={formData.street2}
                    onChangeText={(text) => setFormData({ ...formData, street2: text })}
                />

                <View className="flex-row gap-3">
                    <View className="flex-1">
                        <Input
                            label="City *"
                            placeholder="City"
                            value={formData.city}
                            onChangeText={(text) => setFormData({ ...formData, city: text })}
                        />
                    </View>
                    <View className="flex-1">
                        <Input
                            label="State *"
                            placeholder="State"
                            value={formData.state}
                            onChangeText={(text) => setFormData({ ...formData, state: text })}
                        />
                    </View>
                </View>

                <Input
                    label="Postal Code *"
                    placeholder="Postal or Zip Code"
                    value={formData.postalCode}
                    onChangeText={(text) => setFormData({ ...formData, postalCode: text })}
                    keyboardType="number-pad"
                    maxLength={6}
                />

                <View className="mt-4">
                    <Button
                        text="Update Profile"
                        onPress={handleUpdateProfile}
                        loading={updateProfileMutation.isPending}
                    />
                </View>
            </View>
        </ScrollView>
    );
}
