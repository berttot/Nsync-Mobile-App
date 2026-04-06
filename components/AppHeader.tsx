import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function AppHeader({ title, subtitle }: AppHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/login" as any);
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          {subtitle ? (
            <Text
              style={styles.subtitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {subtitle}
            </Text>
          ) : null}
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {title ||
              `Welcome${user?.name ? `, ${user.name.split(" ")[0]}` : ""}`}
          </Text>
        </View>

        <View style={styles.controlsRow}>
          <WorkspaceSwitcher />
          <View style={styles.actions}>
            {user?.avatar ? (
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{user.avatar}</Text>
              </View>
            ) : (
              <Image
                source={require("@/assets/images/react-logo.png")}
                style={styles.avatarPlaceholder}
              />
            )}

            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
              accessibilityLabel="Sign out"
            >
              <MaterialIcons
                name="logout"
                size={20}
                color={Colors.text.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  safeArea: {
    backgroundColor: Colors.background.primary,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  titleContainer: {
    width: "100%",
  },
  subtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: "600",
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.text.primary,
    lineHeight: 36,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.background.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border.primary,
    flexShrink: 0,
  },
});
