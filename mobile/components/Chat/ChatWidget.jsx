import { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Modal,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    SafeAreaView,
    FlatList
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { sendChatMessage } from "../../services/api";
import ChatMessage from "./ChatMessage";

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Welcome to M&K Jewellers! ✨ How may I assist you in finding the perfect piece today?' }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const flatListRef = useRef(null);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsTyping(true);

        try {
            const data = await sendChatMessage(userMessage, conversationId);

            if (data.success) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.data.reply,
                    products: data.data.products || [],
                }]);

                if (!conversationId) {
                    setConversationId(data.data.conversationId);
                }
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'My apologies, I encountered an issue. Please try again.'
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'I apologize for the inconvenience. Please try again.'
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <TouchableOpacity
                    onPress={() => setIsOpen(true)}
                    className="absolute bottom-6 right-6 z-50 shadow-xl"
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#fbbf24', '#f59e0b', '#d97706']}
                        className="w-14 h-14 rounded-full items-center justify-center p-3"
                    >
                        <Ionicons name="chatbubble-ellipses" size={28} color="white" />
                        <View className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    </LinearGradient>
                </TouchableOpacity>
            )}

            {/* Chat Modal */}
            <Modal
                visible={isOpen}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsOpen(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1"
                >
                    <View className="flex-1 bg-white pt-10">
                        {/* Header */}
                        <View className="px-4 py-3 border-b border-amber-100 bg-amber-50/50 flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <View className="bg-amber-100 p-2 rounded-full mr-3">
                                    <Ionicons name="sparkles" size={18} color="#d97706" />
                                </View>
                                <View>
                                    <Text className="font-bold text-gray-800 text-lg">M&K Jewellers</Text>
                                    <View className="flex-row items-center">
                                        <View className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                                        <Text className="text-xs text-gray-500">Online • Here to help</Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => setIsOpen(false)}
                                className="p-2 bg-gray-100 rounded-full"
                            >
                                <Ionicons name="close" size={20} color="#4b5563" />
                            </TouchableOpacity>
                        </View>

                        {/* Messages Area */}
                        <LinearGradient
                            colors={['#fffbeb', '#ffffff']}
                            className="flex-1"
                        >
                            <FlatList
                                ref={flatListRef}
                                data={messages}
                                keyExtractor={(_, index) => index.toString()}
                                renderItem={({ item }) => <ChatMessage message={item} />}
                                contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                                showsVerticalScrollIndicator={false}
                                onContentSizeChange={scrollToBottom}
                                ListFooterComponent={
                                    isTyping ? (
                                        <View className="flex-row items-center space-x-2 pl-4 pt-2">
                                            <View className="bg-white border border-amber-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex-row space-x-1">
                                                <ActivityIndicator size="small" color="#d97706" />
                                                <Text className="text-xs text-gray-500 ml-2">Thinking...</Text>
                                            </View>
                                        </View>
                                    ) : null
                                }
                            />
                        </LinearGradient>

                        {/* Input Area */}
                        <View className="p-4 border-t border-amber-100 bg-white shadow-lg">
                            <View className="flex-row items-center gap-2">
                                <TextInput
                                    value={input}
                                    onChangeText={setInput}
                                    placeholder="Ask about jewelry..."
                                    className="flex-1 bg-gray-50 border border-amber-200 rounded-xl px-4 py-3 text-base"
                                    placeholderTextColor="#9ca3af"
                                />
                                <TouchableOpacity
                                    onPress={handleSend}
                                    disabled={!input.trim() || isTyping}
                                    className={`p-3 rounded-xl ${!input.trim() || isTyping ? 'bg-gray-300' : 'bg-amber-500'
                                        }`}
                                >
                                    <Ionicons name="send" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                            <Text className="text-[10px] text-gray-400 text-center mt-2">
                                Powered by M.K. Jewellers AI
                            </Text>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
}
