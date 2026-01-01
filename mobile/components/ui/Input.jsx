import { View, TextInput, Text } from "react-native";

export default function Input({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    rightIcon,
    error,
}) {
    return (
        <View className="mb-5">
            {label && <Text className="text-gray-700 font-semibold mb-2 ml-1">{label}</Text>}
            <View className="relative">
                <TextInput
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-base"
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    secureTextEntry={secureTextEntry}
                    placeholderTextColor="#9CA3AF"
                />
                {rightIcon && (
                    <View className="absolute right-4 top-4">{rightIcon}</View>
                )}
            </View>
            {error && <Text className="text-red-500 text-sm mt-1 ml-1">{error}</Text>}
        </View>
    );
}
