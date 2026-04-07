import { useAuth } from "@/contexts/AuthContext";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

export default function AuthLayout() {
  const { user, isLoading } = useAuth();

  if (user) {
    const target =
      user.role === "admin" ? "/(admin)/dashboard" : "/(user)/dashboard";
    return <Redirect href={target as any} />;
  }

  // Keep auth screens inaccessible when already signed in.
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#22C55E" />
        <Text style={{ marginTop: 12 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
    </Stack>
  );
}
