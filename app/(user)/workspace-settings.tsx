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
    ActivityIndicator,
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

export default function WorkspaceSettingsScreen() {
  const { user } = useAuth();
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

  if (!canManageInvites) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.emptyStateContainer}>
            <Ionicons
              name="shield-outline"
              size={64}
              color={Colors.text.tertiary}
            />
            <Text style={styles.emptyStateTitle}>Admin Only</Text>
            <Text style={styles.emptyStateText}>
              Only workspace admins can access workspace settings.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Workspace Settings</Text>
            <Text style={styles.subtitle}>
              {currentWorkspace?.name || "Workspace"}
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Invite Members</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingInviteCount}</Text>
              </View>
            </View>

            <Text style={styles.descriptionText}>
              Send invite codes to people you want to add to your workspace
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
              {creatingInvite ? (
                <ActivityIndicator color={Colors.text.inverse} size="small" />
              ) : (
                <Text style={styles.inviteCreateButtonText}>
                  Generate Invite Code
                </Text>
              )}
            </TouchableOpacity>

            {latestInviteCode ? (
              <View style={styles.latestInviteWrap}>
                <Text style={styles.latestInviteLabel}>Latest code</Text>
                <Text style={styles.latestInviteCode}>{latestInviteCode}</Text>
                <View style={styles.latestInviteActionsRow}>
                  <TouchableOpacity
                    style={styles.inviteGhostButton}
                    onPress={handleCopyInviteCode}
                  >
                    <Ionicons
                      name="copy-outline"
                      size={16}
                      color={Colors.primary.main}
                    />
                    <Text style={styles.inviteGhostButtonText}>Copy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.inviteGhostButton}
                    onPress={handleShareInviteCode}
                  >
                    <Ionicons
                      name="share-social-outline"
                      size={16}
                      color={Colors.primary.main}
                    />
                    <Text style={styles.inviteGhostButtonText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Manage Members</Text>
            <Text style={styles.descriptionText}>
              View, promote, demote, and remove workspace members
            </Text>

            <TouchableOpacity
              style={styles.manageButton}
              onPress={() => router.push("/(user)/workspace-members")}
            >
              <Ionicons name="people" size={20} color={Colors.primary.main} />
              <Text style={styles.manageButtonText}>Go to Members</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.text.tertiary}
              />
            </TouchableOpacity>
          </View>
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
    marginBottom: 24,
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  badge: {
    backgroundColor: Colors.primary.main,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text.inverse,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 14,
    lineHeight: 20,
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
    marginBottom: 12,
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
    borderWidth: 1,
    borderColor: Colors.border.primary,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
    padding: 12,
  },
  latestInviteLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 6,
  },
  latestInviteCode: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 2,
    color: Colors.primary.main,
    marginBottom: 12,
    fontFamily: "monospace",
  },
  latestInviteActionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  inviteGhostButton: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary.main,
    backgroundColor: Colors.background.primary,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  inviteGhostButtonText: {
    color: Colors.primary.main,
    fontWeight: "700",
    fontSize: 13,
  },
  manageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  manageButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginLeft: 12,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
  },
});
