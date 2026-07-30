import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

type AppBackButtonProps = {
  fallbackRoute?: string;
};

export default function AppBackButton({
  fallbackRoute = "/tabs/HomeScreen",
}: AppBackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackRoute as never);
    }
  };

  return (
    <Pressable
      onPress={handleBack}
      hitSlop={12}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]}
    >
      <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  buttonPressed: {
    opacity: 0.65,
  },
});