import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function AppHeader({ title, subtitle }: AppHeaderProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

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
        <View style={styles.topRow}>
          <View style={styles.brandHero}>
            <View style={styles.heroWordmark}>
              <Text style={styles.heroLogoDark}>N</Text>
              <Text style={styles.heroLogoGreen}>S</Text>
              <Text style={styles.heroLogoDark}>YNC</Text>
            </View>
            <View style={styles.heroUnderline} />
            <Text style={styles.heroTagline}>TEAM WORKSPACE</Text>
          </View>

          <View style={styles.designChip}>
            <View style={styles.designDot} />
            <MaterialIcons
              name="auto-awesome"
              size={14}
              color={Colors.text.secondary}
            />
            <Text style={styles.designChipText}>{todayLabel}</Text>
          </View>
        </View>

        <View style={styles.controlsRow}>
          <WorkspaceSwitcher />
          <View style={styles.actions}>
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
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  safeArea: {
    backgroundColor: Colors.background.primary,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  brandHero: {
    alignItems: "flex-start",
    flexShrink: 1,
  },
  heroWordmark: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroLogoDark: {
    color: Colors.text.primary,
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 52,
  },
  heroLogoGreen: {
    color: Colors.primary.main,
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 52,
  },
  heroUnderline: {
    width: 16,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary.main,
    marginTop: 2,
    marginBottom: 8,
    marginLeft: 31,
  },
  heroTagline: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontWeight: "700",
    letterSpacing: 2.2,
  },
  designChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    marginTop: 10,
  },
  designDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary.main,
  },
  designChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text.secondary,
    letterSpacing: 0.2,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
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
