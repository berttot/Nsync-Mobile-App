import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminProfile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          logout();
          router.push("/(auth)/login" as any);
        },
      },
    ]);
  };

  const ProfileItem = ({ title, value, icon }: any) => (
    <View style={styles.profileItem}>
      <Text style={styles.profileIcon}>{icon}</Text>
      <View style={styles.profileContent}>
        <Text style={styles.profileTitle}>{title}</Text>
        <Text style={styles.profileValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Admin Profile</Text>
          <Text style={styles.subtitle}>Manage your admin account</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.avatar}</Text>
            </View>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userRole}>Administrator</Text>
          </View>

          <View style={styles.profileInfo}>
            <ProfileItem title="Email" value={user?.email || ""} icon="📧" />
            <ProfileItem title="Role" value="Administrator" icon="👑" />
            <ProfileItem
              title="Join Date"
              value={user?.joinDate || ""}
              icon="📅"
            />
            <ProfileItem title="User ID" value={user?.id || ""} icon="🆔" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Settings</Text>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>⚙️</Text>
            <Text style={styles.settingText}>Account Settings</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🔔</Text>
            <Text style={styles.settingText}>Notifications</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🔐</Text>
            <Text style={styles.settingText}>Security</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>📊</Text>
            <Text style={styles.settingText}>System Logs</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  profileSection: {
    backgroundColor: Colors.background.primary,
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary.main,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text.inverse,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: Colors.text.secondary,
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  profileInfo: {
    marginBottom: 24,
  },
  profileItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  profileIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  profileContent: {
    flex: 1,
  },
  profileTitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: "500",
  },
  section: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  settingArrow: {
    fontSize: 20,
    color: Colors.text.tertiary,
  },
  logoutButton: {
    backgroundColor: Colors.error,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text.inverse,
  },
});
