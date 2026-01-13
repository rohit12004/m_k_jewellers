import React, { useState, useRef } from "react";
import { View, ScrollView, Dimensions, Image } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

const HeroCarousel = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollViewRef = useRef(null);

    const carouselData = [
        require("../../assets/slider1.jpg"),
        require("../../assets/slider2.jpg"),
        require("../../assets/slider3.jpg"),
        require("../../assets/slider4.jpg"),
    ];

    const handleScroll = (event) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / screenWidth);
        setActiveIndex(index);
    };

    return (
        <View className="w-full h-40 bg-gray-200 mt-2">
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {carouselData.map((image, index) => (
                    <View key={index} style={{ width: screenWidth, height: 256, backgroundColor: '#e5e7eb' }}>
                        <Image
                            source={image}
                            style={{ width: screenWidth, height: 150 }}
                            resizeMode="contain"
                        />
                    </View>
                ))}
            </ScrollView>

            {/* Pagination Dots */}
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center items-center">
                {carouselData.map((_, index) => (
                    <View
                        key={index}
                        className={`h-2 rounded-full mx-1 ${index === activeIndex
                            ? "w-6 bg-purple-600"
                            : "w-2 bg-white opacity-60"
                            }`}
                    />
                ))}
            </View>
        </View>
    );
};

export default HeroCarousel;
