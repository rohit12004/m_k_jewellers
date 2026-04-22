import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");
const cardWidth = (screenWidth - 48) / 3; // 3 columns with 16px padding on sides

const SubcategoryCard = ({ category }) => {
    const router = useRouter();

    // Safely extract secure_url and ensure it has a protocol
    let imageUrl = category.media && category.media.length > 0 && category.media[0].secure_url
        ? category.media[0].secure_url
        : null;

    if (imageUrl && imageUrl.startsWith('//')) {
        imageUrl = `https:${imageUrl}`;
    }

    const handlePress = () => {
        router.push({
            pathname: "/(tabs)/shop",
            params: { subcategory: category.slug }
        });
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            className="items-center"
            activeOpacity={0.7}
            style={{ flex: 1, maxWidth: cardWidth }}
        >
            <View
                className="bg-white rounded-2xl shadow-sm mb-2 overflow-hidden border border-gray-100"
                style={{
                    width: cardWidth - 8,
                    height: cardWidth - 8,
                }}
            >
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                        transition={200}
                    />
                ) : (
                    <View className="w-full h-full bg-gray-100 items-center justify-center">
                        <View className="bg-gray-200 p-2 rounded-full">
                            <Text className="text-gray-400 text-[10px] font-bold">MK</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Category name */}
            <Text
                className="text-xs font-semibold text-gray-800 text-center px-1"
                numberOfLines={2}
                style={{ width: cardWidth - 8 }}
            >
                {category.name}
            </Text>
        </TouchableOpacity>
    );
};

export default SubcategoryCard;
