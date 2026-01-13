import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

export default function Button({ text, onPress, loading, className }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading}
            className={`bg-blue-600 rounded-xl py-4 w-full items-center justify-center shadow-lg shadow-blue-200 ${loading ? "opacity-70" : ""
                } ${className}`}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text className="text-white font-bold text-center">{text}</Text>
            )}
        </TouchableOpacity>
    );
}
