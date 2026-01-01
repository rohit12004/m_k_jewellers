import { Text, View, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-4xl font-bold text-blue-600 mb-8">
        M. K. Jewellers
      </Text>
      <Link href="/login" asChild>
        <TouchableOpacity className="bg-blue-600 px-6 py-3 rounded-lg">
          <Text className="text-white font-bold text-lg">
            Go to Login
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
