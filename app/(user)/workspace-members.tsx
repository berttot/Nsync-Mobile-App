import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getUsersByIds } from "@/services/users";
import {
  removeMember,
  subscribeWorkspaceMembers,
  updateMemberRole,
} from "@/services/workspaces";
import { User } from "@/types/user";
import { WorkspaceMember } from "@/types/workspace";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WorkspaceMembersScreen() {
  const { user } = useAuth();
  const { currentWorkspace, memberships } = useWorkspace();
  const router = useRouter();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<Record<string, User>>(
    {},
  );
  const [actioningMemberId, setActioningMemberId] = useState<string | null>(
    null,
  );

  const currentMembership = memberships.find(
    (m) => m.workspaceId === currentWorkspace?.id,
  );
  const isAdmin = currentMembership?.role === "admin";

  useEffect(() => {
    if (!currentWorkspace?.id) {
      router.back();
      return;
    }

    const unsub = subscribeWorkspaceMembers(
      currentWorkspace.id,
      (updatedMembers) => {
        setMembers(updatedMembers);
      },
    );

    return () => unsub();
  }, [currentWorkspace?.id, router]);

  useEffect(() => {
    let isActive = true;

    const loadProfiles = async () => {
      try {
        const ids = members.map((member) => member.userId);
        const usersById = await getUsersByIds(ids);
        if (isActive) {
          setMemberProfiles(usersById);
        }
      } catch (error) {
        console.error("Failed to load member profiles", error);
      }
    };

    loadProfiles();

    return () => {
      isActive = false;
    };
  }, [members]);

  const handlePromoteToAdmin = (member: WorkspaceMember) => {
    if (!isAdmin) {
      Alert.alert("Permission Denied", "Only admins can manage members");
      return;
    }

    if (!member.id) {
      Alert.alert("Error", "Member ID not found");
      return;
    }

    if (member.role === "admin") {
      Alert.alert("Info", "This member is already an admin");
      return;
    }

    Alert.alert(
      "Promote to Admin",
      `Promote ${member.workspaceName ? "member" : "user"} to admin?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Promote",
          style: "default",
          onPress: async () => {
            setActioningMemberId(member.id || null);
            try {
              const result = await updateMemberRole(member.id!, "admin");
              if (result.success) {
                Alert.alert("Success", "Member promoted to admin");
              } else {
                Alert.alert(
                  "Error",
                  result.error || "Failed to promote member",
                );
              }
            } catch (error) {
              Alert.alert("Error", "An unexpected error occurred");
              console.error(error);
            } finally {
              setActioningMemberId(null);
            }
          },
        },
      ],
    );
  };

  const handleDemoteToUser = (member: WorkspaceMember) => {
    if (!isAdmin) {
      Alert.alert("Permission Denied", "Only admins can manage members");
      return;
    }

    if (!member.id) {
      Alert.alert("Error", "Member ID not found");
      return;
    }

    if (member.role === "user") {
      Alert.alert("Info", "This member is already a regular user");
      return;
    }

    Alert.alert("Demote to User", `Demote this member from admin to user?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Demote",
        style: "default",
        onPress: async () => {
          setActioningMemberId(member.id || null);
          try {
            const result = await updateMemberRole(member.id!, "user");
            if (result.success) {
              Alert.alert("Success", "Member demoted to user");
            } else {
              Alert.alert("Error", result.error || "Failed to demote member");
            }
          } catch (error) {
            Alert.alert("Error", "An unexpected error occurred");
            console.error(error);
          } finally {
            setActioningMemberId(null);
          }
        },
      },
    ]);
  };

  const handleRemoveMember = (member: WorkspaceMember) => {
    if (!isAdmin) {
      Alert.alert("Permission Denied", "Only admins can manage members");
      return;
    }

    if (!member.id) {
      Alert.alert("Error", "Member ID not found");
      return;
    }

    // Prevent removing yourself
    if (member.userId === user?.id) {
      Alert.alert(
        "Cannot Remove",
        "You cannot remove yourself from the workspace",
      );
      return;
    }

    Alert.alert("Remove Member", `Remove this member from the workspace?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          setActioningMemberId(member.id || null);
          try {
            const result = await removeMember(member.id!);
            if (result.success) {
              Alert.alert("Success", "Member removed from workspace");
            } else {
              Alert.alert("Error", result.error || "Failed to remove member");
            }
          } catch (error) {
            Alert.alert("Error", "An unexpected error occurred");
            console.error(error);
          } finally {
            setActioningMemberId(null);
          }
        },
      },
    ]);
  };

  const getInitials = (fullName?: string, userId?: string) => {
    const trimmedName = fullName?.trim();
    if (trimmedName) {
      return trimmedName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
    }

    if (!userId) return "?";
    return userId.substring(0, 2).toUpperCase();
  };

  const MemberCard = ({ member }: { member: WorkspaceMember }) => {
    const isCurrentUser = member.userId === user?.id;
    const isActioning = actioningMemberId === member.id;
    const profile = memberProfiles[member.userId];
    const displayName = isCurrentUser
      ? "You"
      : profile?.name?.trim() || `User ${member.userId?.substring(0, 6)}`;

    return (
      <View key={member.id} style={styles.memberCard}>
        <View style={styles.memberHeader}>
          <View style={styles.memberAvatarSection}>
            <View style={styles.memberAvatar}>
              <Text style={styles.memberAvatarText}>
                {getInitials(profile?.name, member.userId)}
              </Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{displayName}</Text>
              <View style={styles.roleTag}>
                <Text
                  style={[
                    styles.roleTagText,
                    member.role === "admin" && styles.roleTagTextAdmin,
                  ]}
                >
                  {member.role === "admin" ? "Admin" : "Member"}
                </Text>
              </View>
            </View>
          </View>

          {!isCurrentUser && isAdmin && (
            <View style={styles.memberActions}>
              {isActioning ? (
                <ActivityIndicator
                  size="small"
                  color={Colors.primary.main}
                  style={styles.loader}
                />
              ) : (
                <>
                  {member.role === "user" ? (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handlePromoteToAdmin(member)}
                      disabled={isActioning}
                    >
                      <Ionicons
                        name="arrow-up-outline"
                        size={18}
                        color={Colors.primary.main}
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDemoteToUser(member)}
                      disabled={isActioning}
                    >
                      <Ionicons
                        name="arrow-down-outline"
                        size={18}
                        color={Colors.warning}
                      />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.actionButton, styles.removeButton]}
                    onPress={() => handleRemoveMember(member)}
                    disabled={isActioning}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={Colors.error}
                    />
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>

        <View style={styles.memberMeta}>
          <Text style={styles.memberMetaText}>
            Joined {formatDate(member.joinedAt)}
          </Text>
        </View>
      </View>
    );
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue) return "recently";
    try {
      const parsed = dateValue.toDate?.() || new Date(dateValue);
      const now = new Date();
      const diffTime = now.getTime() - parsed.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "today";
      if (diffDays === 1) return "yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return `${Math.floor(diffDays / 30)} months ago`;
    } catch {
      return "recently";
    }
  };

  const adminMembers = members.filter((member) => member.role === "admin");
  const regularMembers = members.filter((member) => member.role === "user");

  if (!isAdmin) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={Colors.text.primary}
            />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.emptyStateContainer}>
            <Ionicons
              name="shield-outline"
              size={64}
              color={Colors.text.tertiary}
            />
            <Text style={styles.emptyStateTitle}>Admin Only</Text>
            <Text style={styles.emptyStateText}>
              Only workspace admins can manage members.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Workspace Members</Text>
          <Text style={styles.subtitle}>
            {currentWorkspace?.name || "Workspace"}
          </Text>
          <Text style={styles.memberCount}>
            {members.length} {members.length === 1 ? "member" : "members"}
          </Text>
        </View>

        {members.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons
              name="people-outline"
              size={64}
              color={Colors.text.tertiary}
            />
            <Text style={styles.emptyStateTitle}>No members yet</Text>
            <Text style={styles.emptyStateText}>
              Invite members to this workspace
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.membersList}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Admins</Text>
              <Text style={styles.sectionCount}>{adminMembers.length}</Text>
            </View>
            {adminMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}

            <View style={styles.sectionHeaderWithSpacing}>
              <Text style={styles.sectionTitle}>Members</Text>
              <Text style={styles.sectionCount}>{regularMembers.length}</Text>
            </View>
            {regularMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    paddingHorizontal: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 4,
    fontWeight: "500",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  memberCount: {
    fontSize: 14,
    color: Colors.text.tertiary,
  },
  membersList: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionHeaderWithSpacing: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.secondary,
    backgroundColor: Colors.background.secondary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  memberCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
  },
  memberHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  memberAvatarSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary.main,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  roleTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#DCFCE7",
    borderRadius: 8,
  },
  roleTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary.main,
  },
  roleTagTextAdmin: {
    color: Colors.warning,
    backgroundColor: "#FEF3C7",
  },
  memberActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  removeButton: {
    borderColor: "#FCA5A5",
  },
  loader: {
    width: 40,
  },
  memberMeta: {
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
    paddingTop: 12,
  },
  memberMetaText: {
    fontSize: 12,
    color: Colors.text.tertiary,
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
