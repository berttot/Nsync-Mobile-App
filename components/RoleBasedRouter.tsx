import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export function RoleBasedRouter() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect based on authentication and role
    if (isLoading) return;

    if (!user) {
      setTimeout(() => router.replace("/(auth)/login"), 0);
      return;
    }

    if (user.role === "admin") {
      setTimeout(() => router.replace("/(admin)/dashboard"), 0);
    } else {
      setTimeout(() => router.replace("/(user)/dashboard"), 0);
    }
  }, [router, user, isLoading]);

  // Show loading screen while redirecting to login
  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>NSYNC</Text>
      <ActivityIndicator size="large" color="#22C55E" style={styles.spinner} />
      <Text style={styles.subtitle}>Redirecting to login...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 20,
  },
  spinner: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
});
