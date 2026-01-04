import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const colorClasses = {
    blue: {
        bg: "bg-blue-50",
        iconColor: "#2563eb",
        textColor: "#1e3a8a",
    },
    green: {
        bg: "bg-green-50",
        iconColor: "#16a34a",
        textColor: "#14532d",
    },
    purple: {
        bg: "bg-purple-50",
        iconColor: "#9333ea",
        textColor: "#581c87",
    },
    orange: {
        bg: "bg-orange-50",
        iconColor: "#ea580c",
        textColor: "#7c2d12",
    },
};

export default function StatCard({ title, value, iconName, color = "blue" }) {
    const colors = colorClasses[color] || colorClasses.blue;

    return (
        <View className={`${colors.bg} p-4 rounded-lg border border-gray-200`}>
            <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-600 text-sm font-medium">{title}</Text>
                <Ionicons name={iconName} size={20} color={colors.iconColor} />
            </View>
            <Text className="text-2xl font-bold" style={{ color: colors.textColor }}>
                {value}
            </Text>
        </View>
    );
}
