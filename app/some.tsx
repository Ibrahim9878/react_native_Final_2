import { router } from "expo-router";
import { View, Text, Pressable } from "react-native";

export default function Some() {
    return (
        <View>
            <Pressable onPress={() => router.back()}>
                <Text>Back</Text>
            </Pressable>
            <Text>Some</Text>
        </View>
    );
}