import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { createBoard, subscribeBoardsForWorkspace } from "@/services/boards";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserBoards() {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [boards, setBoards] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const router = useRouter();

  const formatCreatedAt = (value: any) => {
    if (!value) return "Just now";
    const date = value?.toDate?.() ?? (value instanceof Date ? value : null);
    if (!date) return "Just now";
    try {
      return date.toLocaleDateString();
    } catch {
      return "Just now";
    }
  };

  useEffect(() => {
    if (!currentWorkspace?.id) return;
    const unsub = subscribeBoardsForWorkspace(currentWorkspace.id, setBoards);
    return () => unsub();
  }, [currentWorkspace?.id, user?.id]);

  const handleCreateBoard = async () => {
    if (!newTitle.trim()) {
      Alert.alert("Error", "Please enter a board title");
      return;
    }
    if (!currentWorkspace?.id) {
      Alert.alert("Error", "No workspace selected");
      return;
    }

    try {
      const res = await createBoard({
        title: newTitle.trim(),
        description: newDescription.trim(),
        workspaceId: currentWorkspace.id,
        members: user?.id ? [user.id] : [],
      });
      setShowCreate(false);
      setNewTitle("");
      setNewDescription("");
      router.push(`/board/${res.id}`);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Could not create board");
    }
  };

  const BoardCard = ({ board }: any) => (
    <TouchableOpacity
      style={styles.boardCard}
      onPress={() => router.push(`/board/${String(board.id)}`)}
      activeOpacity={0.8}
    >
      <View style={styles.boardHeader}>
        <View style={[styles.boardDot, { backgroundColor: board.color }]} />
        <View style={styles.boardInfo}>
          <Text style={styles.boardTitle}>{board.title}</Text>
          <Text style={styles.boardDescription}>
            {board.description || "No description"}
          </Text>
        </View>
      </View>
      <View style={styles.boardStats}>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={16} color={Colors.text.secondary} />
          <Text style={styles.statValue}>
            {Array.isArray(board.members) ? board.members.length : 0}
          </Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="checkbox-outline" size={16} color={Colors.text.secondary} />
          <Text style={styles.statValue}>--</Text>
          <Text style={styles.statLabel}>Tasks</Text>
        </View>
      </View>
      <View style={styles.boardFooter}>
        <View style={styles.boardDateWrap}>
          <Ionicons name="calendar-outline" size={14} color={Colors.text.tertiary} />
          <Text style={styles.boardDate}>
            {formatCreatedAt(board.createdAt)}
          </Text>
        </View>
        <View style={styles.boardRoleWrap}>
          <Text style={styles.boardRole}>Member</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>My Boards</Text>
          <Text style={styles.subtitle}>Boards you have access to</Text>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => setShowCreate(true)}
          >
            <Ionicons name="add-outline" size={16} color={Colors.text.inverse} />
            <Text style={styles.createBtnText}>Create Board</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{boards.length}</Text>
            <Text style={styles.statLabel}>My Boards</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {boards.reduce(
                (sum, b) =>
                  sum + (Array.isArray(b.members) ? b.members.length : 0),
                0,
              )}
            </Text>
            <Text style={styles.statLabel}>Total Members</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>
        </View>

        <View style={styles.boardsList}>
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </View>

        {boards.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="grid-outline" size={28} color={Colors.primary.main} />
            </View>
            <Text style={styles.emptyTitle}>No Boards Available</Text>
            <Text style={styles.emptyDescription}>
              You can create your first board now and start adding tasks.
            </Text>
            <TouchableOpacity
              style={styles.emptyCreateBtn}
              onPress={() => setShowCreate(true)}
            >
              <Text style={styles.emptyCreateBtnText}>Create First Board</Text>
            </TouchableOpacity>
          </View>
        )}

        <Modal visible={showCreate} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Create Board</Text>
              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="Board title"
                placeholderTextColor={Colors.text.tertiary}
                style={styles.input}
              />
              <TextInput
                value={newDescription}
                onChangeText={setNewDescription}
                placeholder="Description (optional)"
                placeholderTextColor={Colors.text.tertiary}
                style={[styles.input, styles.inputMultiline]}
                multiline
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalBtn}
                  onPress={() => setShowCreate(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalPrimary]}
                  onPress={handleCreateBoard}
                >
                  <Text style={styles.modalPrimaryText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  safeArea: { flex: 1, backgroundColor: Colors.background.secondary },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  createBtn: {
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: Colors.primary.main,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  createBtnText: {
    color: Colors.text.inverse,
    fontWeight: "700",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    color: Colors.text.primary,
    marginBottom: 6,
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
    gap: 10,
  },
  statCard: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
    fontWeight: "600",
  },
  boardsList: {
    padding: 20,
  },
  boardCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  boardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  boardDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  boardInfo: {
    flex: 1,
  },
  boardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  boardDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  boardStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
    paddingVertical: 12,
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  boardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  boardDateWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  boardDate: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  boardRoleWrap: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  boardRole: {
    fontSize: 12,
    color: Colors.primary.main,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: Colors.background.primary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background.secondary,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyCreateBtn: {
    marginTop: 14,
    backgroundColor: Colors.primary.main,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  emptyCreateBtnText: {
    color: Colors.text.inverse,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text.primary,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.text.primary,
    marginBottom: 10,
    backgroundColor: Colors.background.secondary,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  modalBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginLeft: 8,
  },
  modalCancelText: {
    color: Colors.text.secondary,
    fontWeight: "600",
  },
  modalPrimary: {
    backgroundColor: Colors.primary.main,
    borderRadius: 12,
  },
  modalPrimaryText: {
    color: Colors.text.inverse,
    fontWeight: "700",
  },
});
