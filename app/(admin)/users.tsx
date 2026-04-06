import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { subscribeAllUsers, updateUserRole } from "@/services/users";
import {
  createWorkspaceInvite,
  revokeWorkspaceInvite,
  subscribeWorkspaceInvites,
} from "@/services/workspaces";
import * as Clipboard from "expo-clipboard";
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

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [users, setUsers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [inviteFilter, setInviteFilter] = useState<
    "all" | "pending" | "accepted" | "revoked"
  >("all");
  const [inviteSearchQuery, setInviteSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [invitesLoading, setInvitesLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [latestInviteCode, setLatestInviteCode] = useState("");
  const [latestInviteEmail, setLatestInviteEmail] = useState("");

  const handleShareInvite = async () => {
    if (!latestInviteCode || !currentWorkspace?.name) return;

    try {
      await Share.share({
        title: `Invite to ${currentWorkspace.name}`,
        message: `Join ${currentWorkspace.name} using this invite code: ${latestInviteCode}`,
      });
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not share the invite code");
    }
  };

  const handleCopyInvite = async () => {
    if (!latestInviteCode) return;

    try {
      await Clipboard.setStringAsync(latestInviteCode);
      Alert.alert("Copied", "Invite code copied to clipboard");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not copy the invite code");
    }
  };

  const handleDeleteUser = (userId: string) => {
    Alert.alert("Delete User", "Are you sure you want to delete this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setUsers(users.filter((u) => u.id !== userId));
          Alert.alert("Success", "User deleted successfully");
        },
      },
    ]);
  };

  const handleToggleRole = (userId: string) => {
    const u = users.find((x) => x.id === userId);
    if (!u) return;
    const newRole = u.role === "admin" ? "user" : "admin";
    Alert.alert(
      "Confirm Role Change",
      `Change role of ${u.name} to ${newRole}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await updateUserRole(userId, newRole);
              Alert.alert("Success", "User role updated successfully");
            } catch (e) {
              console.error(e);
              Alert.alert("Error", "Could not update user role");
            }
          },
        },
      ],
    );
  };

  const UserCard = ({ user }: any) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View
          style={[
            styles.avatar,
            {
              backgroundColor:
                user.role === "admin"
                  ? Colors.primary.main
                  : Colors.text.secondary,
            },
          ]}
        >
          <Text style={styles.avatarText}>{user.avatar}</Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userRole}>Role: {user.role}</Text>
          <Text style={styles.joinDate}>Joined: {user.joinDate}</Text>
        </View>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            {
              backgroundColor:
                user.role === "admin" ? Colors.warning : Colors.primary.main,
            },
          ]}
          onPress={() => handleToggleRole(user.id)}
        >
          <Text style={styles.roleButtonText}>
            {user.role === "admin" ? "Make User" : "Make Admin"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteUser(user.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeAllUsers((all) => {
      setUsers(all);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentWorkspace?.id) {
      setInvites([]);
      setInvitesLoading(false);
      return;
    }

    setInvitesLoading(true);
    const unsub = subscribeWorkspaceInvites(currentWorkspace.id, (all) => {
      setInvites(all);
      setInvitesLoading(false);
    });

    return () => unsub();
  }, [currentWorkspace?.id]);

  const handleInvite = async () => {
    if (!inviteEmail) {
      Alert.alert("Error", "Please enter an email to invite");
      return;
    }
    if (!currentWorkspace?.id) {
      Alert.alert("Error", "Select a workspace before sending invites");
      return;
    }
    try {
      const invite = await createWorkspaceInvite(
        currentWorkspace.id,
        inviteEmail.trim(),
        "user",
        currentUser?.email ?? "system",
      );
      setLatestInviteCode(invite.code);
      setLatestInviteEmail(inviteEmail.trim());
      Alert.alert(
        "Invite created",
        `Invite created for ${inviteEmail}\n\nShare this code with the user: ${invite.code}`,
      );
      setInviteEmail("");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to create invite");
    }
  };

  const handleRevokeInvite = (inviteId: string, code: string) => {
    if (!currentUser?.id) return;

    Alert.alert("Revoke invite", `Revoke invite code ${code}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Revoke",
        style: "destructive",
        onPress: async () => {
          try {
            await revokeWorkspaceInvite(inviteId, currentUser.id);
            Alert.alert("Invite revoked", "The invite code is no longer valid");
          } catch (e) {
            console.error(e);
            Alert.alert("Error", "Could not revoke invite");
          }
        },
      },
    ]);
  };

  const renderInviteStatus = (status: string) => {
    if (status === "accepted") return styles.inviteStatusAccepted;
    if (status === "revoked") return styles.inviteStatusRevoked;
    return styles.inviteStatusPending;
  };

  const filteredByStatusInvites =
    inviteFilter === "all"
      ? invites
      : invites.filter((invite) => invite.status === inviteFilter);

  const normalizedInviteQuery = inviteSearchQuery.trim().toLowerCase();
  const filteredInvites = normalizedInviteQuery
    ? filteredByStatusInvites.filter((invite) => {
        const email = (invite.email ?? "").toLowerCase();
        const code = (invite.code ?? "").toLowerCase();
        return (
          email.includes(normalizedInviteQuery) ||
          code.includes(normalizedInviteQuery)
        );
      })
    : filteredByStatusInvites;

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>User Management</Text>
          <Text style={styles.subtitle}>Manage all users and their roles</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{users.length}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {users.filter((u) => u.role === "admin").length}
            </Text>
            <Text style={styles.statLabel}>Admins</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {users.filter((u) => u.role === "user").length}
            </Text>
            <Text style={styles.statLabel}>Regular Users</Text>
          </View>
        </View>

        <View style={styles.inviteContainer}>
          <Text style={styles.sectionTitle}>Invite a user</Text>
          <Text style={styles.workspaceLabel}>
            Workspace: {currentWorkspace?.name ?? "No workspace selected"}
          </Text>
          <Text style={styles.workspaceHint}>
            This generates a workspace invite code. The user joins from the
            no-workspace screen.
          </Text>
          <View style={styles.inviteRow}>
            <TextInput
              style={styles.inviteInput}
              placeholder="user@example.com"
              placeholderTextColor="#9CA3AF"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.inviteButton}
              onPress={handleInvite}
            >
              <Text style={styles.inviteButtonText}>Invite</Text>
            </TouchableOpacity>
          </View>
          {latestInviteCode ? (
            <View style={styles.latestInviteCard}>
              <Text style={styles.latestInviteTitle}>Latest invite</Text>
              <Text style={styles.latestInviteEmail}>{latestInviteEmail}</Text>
              <Text style={styles.latestInviteCodeLabel}>Invite code</Text>
              <Text style={styles.latestInviteCode}>{latestInviteCode}</Text>
              <TouchableOpacity
                style={styles.shareInviteButton}
                onPress={handleShareInvite}
              >
                <Text style={styles.shareInviteButtonText}>
                  Share invite code
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.copyInviteButton}
                onPress={handleCopyInvite}
              >
                <Text style={styles.copyInviteButtonText}>Copy code</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.inviteHistoryHeader}>
            <Text style={styles.sectionTitle}>Invite history</Text>
          </View>
          <View style={styles.filterRow}>
            {(["all", "pending", "accepted", "revoked"] as const).map(
              (item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.filterChip,
                    inviteFilter === item && styles.filterChipActive,
                  ]}
                  onPress={() => setInviteFilter(item)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      inviteFilter === item && styles.filterChipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by email or invite code"
            placeholderTextColor="#9CA3AF"
            value={inviteSearchQuery}
            onChangeText={setInviteSearchQuery}
            autoCapitalize="none"
          />
          {invitesLoading ? (
            <Text style={styles.loadingText}>Loading invites...</Text>
          ) : filteredInvites.length === 0 ? (
            <Text style={styles.emptyStateText}>
              {inviteFilter === "all"
                ? "No invites have been created for this workspace yet."
                : `No ${inviteFilter} invites found.`}
            </Text>
          ) : (
            filteredInvites.map((invite) => (
              <View key={invite.id} style={styles.inviteHistoryCard}>
                <View style={styles.inviteHistoryRow}>
                  <View style={styles.inviteHistoryMeta}>
                    <Text style={styles.inviteHistoryEmail}>
                      {invite.email}
                    </Text>
                    <Text style={styles.inviteHistoryCode}>{invite.code}</Text>
                  </View>
                  <View
                    style={[
                      styles.inviteStatusBadge,
                      renderInviteStatus(invite.status),
                    ]}
                  >
                    <Text style={styles.inviteStatusText}>{invite.status}</Text>
                  </View>
                </View>
                <Text style={styles.inviteHistoryDetails}>
                  Role: {invite.role}{" "}
                  {invite.acceptedBy
                    ? `• Accepted by ${invite.acceptedBy}`
                    : ""}
                </Text>
                {invite.status === "pending" ? (
                  <TouchableOpacity
                    style={styles.revokeInviteButton}
                    onPress={() => handleRevokeInvite(invite.id, invite.code)}
                  >
                    <Text style={styles.revokeInviteButtonText}>Revoke</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ))
          )}
        </View>

        <View style={styles.usersList}>
          {loading ? (
            <Text style={styles.loadingText}>Loading users...</Text>
          ) : (
            users.map((user) => <UserCard key={user.id} user={user} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  safeArea: { flex: 1, backgroundColor: Colors.background.primary },
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  statCard: {
    alignItems: "center",
    padding: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  inviteContainer: {
    padding: 20,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  workspaceLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  workspaceHint: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  inviteRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inviteInput: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: Colors.text.primary,
  },
  inviteButton: {
    marginLeft: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
  },
  inviteButtonText: {
    color: Colors.text.inverse,
    fontWeight: "700",
  },
  latestInviteCard: {
    marginTop: 16,
    padding: 14,
    borderRadius: 10,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  latestInviteTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text.secondary,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  latestInviteEmail: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 10,
    fontWeight: "600",
  },
  latestInviteCodeLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  latestInviteCode: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 2,
    color: Colors.primary.main,
  },
  shareInviteButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.primary.main,
  },
  shareInviteButtonText: {
    color: Colors.primary.main,
    fontWeight: "700",
  },
  copyInviteButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.primary.main,
  },
  copyInviteButtonText: {
    color: Colors.text.inverse,
    fontWeight: "700",
  },
  inviteHistoryHeader: {
    marginTop: 20,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  filterChipActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text.secondary,
    textTransform: "capitalize",
  },
  filterChipTextActive: {
    color: Colors.text.inverse,
  },
  searchInput: {
    marginTop: 10,
    height: 44,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: Colors.text.primary,
  },
  emptyStateText: {
    color: Colors.text.secondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  inviteHistoryCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 10,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  inviteHistoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  inviteHistoryMeta: {
    flex: 1,
    paddingRight: 12,
  },
  inviteHistoryEmail: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  inviteHistoryCode: {
    fontSize: 12,
    letterSpacing: 1.5,
    color: Colors.text.secondary,
  },
  inviteStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  inviteStatusPending: {
    backgroundColor: "rgba(34,197,94,0.12)",
  },
  inviteStatusAccepted: {
    backgroundColor: "rgba(59,130,246,0.12)",
  },
  inviteStatusRevoked: {
    backgroundColor: "rgba(239,68,68,0.12)",
  },
  inviteStatusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    color: Colors.text.primary,
  },
  inviteHistoryDetails: {
    marginTop: 10,
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  revokeInviteButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.error,
  },
  revokeInviteButtonText: {
    color: Colors.text.inverse,
    fontWeight: "700",
  },
  loadingText: {
    textAlign: "center",
    color: Colors.text.secondary,
    padding: 20,
  },
  usersList: {
    padding: 20,
  },
  userCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.inverse,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  userActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.inverse,
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.error,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.inverse,
  },
});
