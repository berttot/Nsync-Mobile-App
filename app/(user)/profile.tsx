import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
    createWorkspaceInvite,
    subscribeWorkspaceInvites,
} from "@/services/workspaces";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ProfileItemProps = {
  title: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

type SettingItemProps = {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

export default function UserProfile() {
  const { user, logout, isLoading } = useAuth();
  const { currentWorkspace, memberships } = useWorkspace();
  const router = useRouter();
  const [inviteEmail, setInviteEmail] = useState("");
  const [latestInviteCode, setLatestInviteCode] = useState("");
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [pendingInviteCount, setPendingInviteCount] = useState(0);

  const currentMembership = memberships.find(
    (membership) => membership.workspaceId === currentWorkspace?.id,
  );
  const canManageInvites = currentMembership?.role === "admin";

  const formatJoinDate = (dateValue?: string) => {
    if (!dateValue) return "Not available";

    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return dateValue;

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsed);
  };

  const getInitials = () => {
    if (user?.avatar?.trim()) return user.avatar;
    if (user?.name?.trim()) {
      return user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
    }
    return "U";
  };

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

  useEffect(() => {
    if (!currentWorkspace?.id || !canManageInvites) {
      setPendingInviteCount(0);
      return;
    }

    const unsub = subscribeWorkspaceInvites(currentWorkspace.id, (all) => {
      const pendingCount = all.filter(
        (invite) => invite.status === "pending",
      ).length;
      setPendingInviteCount(pendingCount);
    });

    return () => unsub();
  }, [currentWorkspace?.id, canManageInvites]);

  const handleCreateInvite = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert("Error", "Please enter an email to invite");
      return;
    }

    if (!currentWorkspace?.id) {
      Alert.alert("Error", "Select a workspace first");
      return;
    }

    if (!canManageInvites) {
      Alert.alert(
        "Permission denied",
        "Only workspace admins can create invites",
      );
      return;
    }

    setCreatingInvite(true);
    try {
      const invite = await createWorkspaceInvite(
        currentWorkspace.id,
        inviteEmail.trim(),
        "user",
        user?.email ?? "system",
      );
      setLatestInviteCode(invite.code);
      setInviteEmail("");
      Alert.alert(
        "Invite created",
        `Share this code with the member: ${invite.code}`,
      );
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to create invite");
    } finally {
      setCreatingInvite(false);
    }
  };

  const handleCopyInviteCode = async () => {
    if (!latestInviteCode) return;

    try {
      await Clipboard.setStringAsync(latestInviteCode);
      Alert.alert("Copied", "Invite code copied");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not copy invite code");
    }
  };

  const handleShareInviteCode = async () => {
    if (!latestInviteCode || !currentWorkspace?.name) return;

    try {
      await Share.share({
        title: `Invite to ${currentWorkspace.name}`,
        message: `Join ${currentWorkspace.name} with invite code: ${latestInviteCode}`,
      });
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not share invite code");
    }
  };

  const ProfileItem = ({ title, value, icon }: ProfileItemProps) => (
    <View style={styles.infoRow}>
      <View style={styles.rowIconWrap}>
        <Ionicons name={icon} size={18} color={Colors.text.secondary} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{title}</Text>
        <Text numberOfLines={2} style={styles.rowValue}>
          {value || "-"}
        </Text>
      </View>
    </View>
  );

  const SettingItem = ({ title, icon }: SettingItemProps) => (
    <TouchableOpacity activeOpacity={0.75} style={styles.settingItem}>
      <View style={styles.rowIconWrap}>
        <Ionicons name={icon} size={18} color={Colors.text.primary} />
      </View>
      <Text style={styles.settingText}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
    </TouchableOpacity>
  );

  if (isLoading && !user) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {!user && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No user data</Text>
              <Text style={styles.emptyDesc}>
                Please sign in to view your profile.
              </Text>
            </View>
          )}

          <View style={styles.header}>
            <Text style={styles.title}>My Profile</Text>
            <Text style={styles.subtitle}>Manage your account settings</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials()}</Text>
              </View>
              <Text style={styles.userName}>
                {user?.name || "Unknown user"}
              </Text>
              <View style={styles.rolePill}>
                <Text style={styles.userRole}>User</Text>
              </View>
            </View>

            <ProfileItem
              title="Email"
              value={user?.email || "Not available"}
              icon="mail-outline"
            />
            <ProfileItem title="Role" value="User" icon="person-outline" />
            <ProfileItem
              title="Join Date"
              value={formatJoinDate(user?.joinDate)}
              icon="calendar-outline"
            />
            <ProfileItem
              title="User ID"
              value={user?.id || "Not available"}
              icon="id-card-outline"
            />
          </View>

          <View style={styles.settingsCard}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            <SettingItem title="Edit Profile" icon="create-outline" />
            <SettingItem title="Notifications" icon="notifications-outline" />
            <SettingItem title="Privacy" icon="shield-checkmark-outline" />
            <SettingItem title="My Statistics" icon="stats-chart-outline" />
          </View>

          <View style={styles.inviteCard}>
            <Text style={styles.sectionTitle}>Workspace Invite</Text>
            <Text style={styles.workspaceInfoText}>
              Workspace: {currentWorkspace?.name ?? "No workspace selected"}
            </Text>

            {canManageInvites ? (
              <>
                <Text style={styles.inviteMetaText}>
                  Pending invites: {pendingInviteCount}
                </Text>
                <TextInput
                  style={styles.inviteInput}
                  placeholder="member@email.com"
                  placeholderTextColor="#9CA3AF"
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={[
                    styles.inviteCreateButton,
                    creatingInvite && styles.inviteCreateButtonDisabled,
                  ]}
                  onPress={handleCreateInvite}
                  disabled={creatingInvite}
                >
                  <Text style={styles.inviteCreateButtonText}>
                    {creatingInvite ? "Creating..." : "Generate Invite Code"}
                  </Text>
                </TouchableOpacity>

                {latestInviteCode ? (
                  <View style={styles.latestInviteWrap}>
                    <Text style={styles.latestInviteLabel}>Latest code</Text>
                    <Text style={styles.latestInviteCode}>
                      {latestInviteCode}
                    </Text>
                    <View style={styles.latestInviteActionsRow}>
                      <TouchableOpacity
                        style={styles.inviteGhostButton}
                        onPress={handleCopyInviteCode}
                      >
                        <Text style={styles.inviteGhostButtonText}>Copy</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.inviteGhostButton}
                        onPress={handleShareInviteCode}
                      >
                        <Text style={styles.inviteGhostButtonText}>Share</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
              </>
            ) : (
              <Text style={styles.inviteMetaText}>
                Only workspace admins can generate invite codes.
              </Text>
            )}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color={Colors.error} />
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  header: {
    marginBottom: 14,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.6,
    color: Colors.text.primary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.text.secondary,
  },
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    padding: 20,
    marginBottom: 14,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 16,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.text.inverse,
  },
  userName: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.4,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  rolePill: {
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  userRole: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.secondary,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  rowIconWrap: {
    width: 30,
    alignItems: "center",
    marginRight: 14,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.secondary,
    marginBottom: 3,
  },
  rowValue: {
    fontSize: 18,
    color: Colors.text.primary,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyDesc: {
    color: Colors.text.secondary,
    textAlign: "center",
  },
  settingsCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    padding: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  inviteCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    padding: 20,
    marginBottom: 14,
  },
  workspaceInfoText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: "600",
    marginBottom: 8,
  },
  inviteMetaText: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 10,
    lineHeight: 18,
  },
  inviteInput: {
    height: 46,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: Colors.text.primary,
    marginBottom: 10,
  },
  inviteCreateButton: {
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary.main,
  },
  inviteCreateButtonDisabled: {
    opacity: 0.7,
  },
  inviteCreateButtonText: {
    color: Colors.text.inverse,
    fontSize: 14,
    fontWeight: "700",
  },
  latestInviteWrap: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
    padding: 12,
  },
  latestInviteLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  latestInviteCode: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 2,
    color: Colors.primary.main,
    marginBottom: 10,
  },
  latestInviteActionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  inviteGhostButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary.main,
    backgroundColor: Colors.background.primary,
  },
  inviteGhostButtonText: {
    color: Colors.primary.main,
    fontWeight: "700",
    fontSize: 13,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.25)",
    backgroundColor: "rgba(239,68,68,0.06)",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.error,
  },
});
