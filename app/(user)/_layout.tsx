import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";

export default function UserTabLayout() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setTimeout(() => router.replace("/(auth)/login"), 0);
      return;
    }
    if (user.role !== "user") {
      // Non-users should not access user layout
      setTimeout(() => router.replace("/(admin)/dashboard"), 0);
    }
  }, [user, isLoading, router]);

  // Don't mount the Tabs navigator until auth is verified and role is correct.
  if (isLoading || !user || user.role !== "user") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#22C55E" />
        <Text style={{ marginTop: 12 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-tasks"
        options={{
          title: "My Tasks",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="checklist" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="boards"
        options={{
          title: "Boards",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="square.grid.2x2" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="no-workspace"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="board/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
