import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export function RoleBasedRouter() {
  const { user, isLoading } = useAuth();
  const { memberships, loading: workspaceLoading } = useWorkspace();
  const router = useRouter();

  useEffect(() => {
    // Redirect based on authentication, role, and workspace membership
    if (isLoading) return;

    if (!user) {
      setTimeout(() => router.replace("/(auth)/login"), 0);
      return;
    }

    if (workspaceLoading) return;

    if (!memberships || memberships.length === 0) {
      setTimeout(() => router.replace("/(user)/no-workspace"), 0);
      return;
    }

    if (user.role === "admin") {
      setTimeout(() => router.replace("/(admin)/dashboard"), 0);
    } else {
      setTimeout(() => router.replace("/(user)/dashboard"), 0);
    }
  }, [router, user, isLoading, memberships, workspaceLoading]);

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
