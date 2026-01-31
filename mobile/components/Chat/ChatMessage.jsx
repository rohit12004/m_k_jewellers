import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ChatProductCard from "./ChatProductCard";

export default function ChatMessage({ message }) {
    const isUser = message.role === "user";

    return (
        <View className={`mb-4 w-full flex-row ${isUser ? "justify-end" : "justify-start"}`}>
            <View
                className={`max-w-[85%] rounded-2xl p-4 ${isUser
                        ? "bg-amber-500 rounded-br-none"
                        : "bg-white border border-amber-100 rounded-bl-none shadow-sm"
                    }`}
            >
                {/* Assistant Header */}
                {!isUser && (
                    <View className="flex-row items-center mb-2 pb-2 border-b border-amber-50">
                        <Ionicons name="sparkles" size={12} color="#d97706" />
                        <Text className="text-[10px] font-bold text-amber-700 ml-1">
                            M&K Assistant
                        </Text>
                    </View>
                )}

                {/* Message Content */}
                <Text
                    className={`text-sm leading-5 ${isUser ? "text-white" : "text-gray-800"}`}
                >
                    {message.content}
                </Text>

                {/* Products Carousel */}
                {message.products && message.products.length > 0 && (
                    <View className="mt-3 -mx-2">
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 8 }}
                        >
                            {message.products.map((product, index) => (
                                <ChatProductCard key={product.id || index} product={product} />
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>
        </View>
    );
}
