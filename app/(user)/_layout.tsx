import { Redirect, Tabs } from "expo-router";
import React, { useEffect } from "react";
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    Platform,
    Text,
    View,
} from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialIcons } from "@expo/vector-icons";
import { useSegments } from "expo-router";

export default function UserTabLayout() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const { currentWorkspace, memberships } = useWorkspace();
  const segments = useSegments();

  const isTopLevelUserScreen =
    segments[0] === "(user)" &&
    (segments.length === 1 ||
      [
        "dashboard",
        "my-tasks",
        "boards",
        "profile",
        "workspace-settings",
        "no-workspace",
      ].includes(String(segments[1])));

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (!isTopLevelUserScreen) {
          return false;
        }

        Alert.alert("Exit NSYNC", "Do you want to close the app?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Exit",
            style: "destructive",
            onPress: () => BackHandler.exitApp(),
          },
        ]);
        return true;
      },
    );

    return () => subscription.remove();
  }, [isTopLevelUserScreen]);

  const currentMembership = memberships.find(
    (m) => m.workspaceId === currentWorkspace?.id,
  );
  const isWorkspaceAdmin = currentMembership?.role === "admin";

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#22C55E" />
        <Text style={{ marginTop: 12 }}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role !== "user") {
    return <Redirect href="/(admin)/dashboard" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginBottom: 2,
        },
        tabBarStyle: {
          height: 62,
          paddingTop: 6,
          paddingBottom: 6,
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={24} name="dashboard" color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-tasks"
        options={{
          title: "My Tasks",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={24} name="checklist" color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="boards"
        options={{
          title: "Boards",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={24} name="view-module" color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={24} name="person" color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="workspace-settings"
        options={{
          title: "Workspace",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={24} name="settings" color={String(color)} />
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
      <Tabs.Screen
        name="workspace-members"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
