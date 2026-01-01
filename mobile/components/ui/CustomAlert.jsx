import { View, Text, Modal, TouchableOpacity, Animated } from "react-native";
import { useState, useEffect, useRef } from "react";

export default function CustomAlert({ visible, title, message, buttons, onClose }) {
    const scaleValue = useRef(new Animated.Value(1.2)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleValue, {
                    toValue: 1,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 200,
                }),
                Animated.timing(opacityValue, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            scaleValue.setValue(1.2);
            opacityValue.setValue(0);
        }
    }, [visible]);

    if (!visible) return null;

    const handleButtonPress = (btn) => {
        if (btn.onPress) btn.onPress();
        onClose();
    };

    const renderButtons = () => {
        if (!buttons || buttons.length === 0) {
            return (
                <TouchableOpacity
                    onPress={onClose}
                    className="w-full h-[44px] justify-center items-center active:bg-gray-100"
                >
                    <Text className="text-[#007AFF] font-bold text-[17px]">OK</Text>
                </TouchableOpacity>
            );
        }

        if (buttons.length === 2) {
            return (
                <View className="flex-row w-full h-[44px]">
                    <TouchableOpacity
                        onPress={() => handleButtonPress(buttons[0])}
                        className="flex-1 justify-center items-center active:bg-gray-100"
                    >
                        <Text className={`text-[17px] ${buttons[0].style === 'cancel' ? 'font-normal' : 'font-bold'} text-[#007AFF]`}>
                            {buttons[0].text}
                        </Text>
                    </TouchableOpacity>

                    <View className="w-[1px] h-full bg-gray-200" />

                    <TouchableOpacity
                        onPress={() => handleButtonPress(buttons[1])}
                        className="flex-1 justify-center items-center active:bg-gray-100"
                    >
                        <Text className={`text-[17px] ${buttons[1].style === 'cancel' ? 'font-normal' : 'font-bold'} text-[#007AFF]`}>
                            {buttons[1].text}
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        // Fallback for list of buttons
        return (
            <View>
                {buttons.map((btn, index) => (
                    <View key={index} className="w-full">
                        {index > 0 && <View className="w-full h-[1px] bg-gray-200" />}
                        <TouchableOpacity
                            onPress={() => handleButtonPress(btn)}
                            className="w-full h-[44px] justify-center items-center active:bg-gray-100"
                        >
                            <Text className={`text-[17px] ${btn.style === 'cancel' ? 'font-normal' : 'font-bold'} text-[#007AFF]`}>
                                {btn.text}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <View className="flex-1 justify-center items-center bg-black/40 px-10">
                <Animated.View
                    style={{ transform: [{ scale: scaleValue }], opacity: opacityValue, backgroundColor: 'rgba(255,255,255,0.95)' }}
                    className="w-[270px] rounded-2xl items-center pt-5 overflow-hidden"
                >
                    {/* Title */}
                    <Text className="text-[17px] font-bold text-black text-center px-4 mb-1">
                        {title}
                    </Text>

                    {/* Message */}
                    <Text className="text-[13px] text-black text-center px-4 mb-4 leading-4">
                        {message}
                    </Text>

                    {/* Divider */}
                    <View className="w-full h-[1px] bg-gray-200" />

                    {/* Button Area */}
                    <View className="w-full">
                        {renderButtons()}
                    </View>

                </Animated.View>
            </View>
        </Modal>
    );
}
