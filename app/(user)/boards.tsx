import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { createBoard, subscribeBoardsForWorkspace } from "@/services/boards";
import { subscribeTasksForWorkspace } from "@/services/tasks";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  const [totalTasks, setTotalTasks] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const router = useRouter();
  const params = useLocalSearchParams();
  const rawReturnTo = Array.isArray((params as any).from)
    ? (params as any).from[0]
    : ((params as any).from as string | undefined);

  const handleBackPress = () => {
    if (rawReturnTo) {
      router.replace(rawReturnTo);
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(user)/dashboard");
  };

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

  useEffect(() => {
    if (!currentWorkspace?.id) {
      setTotalTasks(0);
      return;
    }

    const unsub = subscribeTasksForWorkspace(currentWorkspace.id, (tasks) => {
      setTotalTasks(tasks.length);
    });

    return () => unsub();
  }, [currentWorkspace?.id]);

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
      router.push({
        pathname: `/board/${res.id}`,
        params: { from: "/(user)/boards" },
      });
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Could not create board");
    }
  };

  const BoardCard = ({ board }: any) => (
    <TouchableOpacity
      style={styles.boardCard}
      onPress={() =>
        router.push({
          pathname: `/board/${String(board.id)}`,
          params: { from: "/(user)/boards" },
        })
      }
      activeOpacity={0.8}
    >
      <View style={styles.boardHeader}>
        <View style={styles.boardLeftHeader}>
          <View style={[styles.boardDot, { backgroundColor: board.color }]} />
          <Text style={styles.boardBadge}>Board</Text>
        </View>
        <Ionicons
          name="chevron-forward-outline"
          size={18}
          color={Colors.text.tertiary}
        />
      </View>
      <View style={styles.boardInfo}>
        <Text style={styles.boardTitle}>{board.title}</Text>
        <Text style={styles.boardDescription} numberOfLines={2}>
          {board.description || "No description yet"}
        </Text>
      </View>
      <View style={styles.boardMetaRow}>
        <View style={styles.boardInfo}>
          <View style={styles.boardDateWrap}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={Colors.text.tertiary}
            />
            <Text style={styles.boardDate}>
              Created {formatCreatedAt(board.createdAt)}
            </Text>
          </View>
        </View>
        <Text style={styles.boardOpenText}>Open board</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backButtonWrap}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>My Boards</Text>
          <Text style={styles.subtitle}>Boards you have access to</Text>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => setShowCreate(true)}
          >
            <Ionicons
              name="add-outline"
              size={16}
              color={Colors.text.inverse}
            />
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
            <Text style={styles.statValue}>{totalTasks}</Text>
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
              <Ionicons
                name="grid-outline"
                size={28}
                color={Colors.primary.main}
              />
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
  backButtonWrap: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primary.main,
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  boardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  boardLeftHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  boardDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  boardBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
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
    lineHeight: 20,
  },
  boardMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
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
  boardOpenText: {
    fontSize: 12,
    color: Colors.primary.main,
    fontWeight: "700",
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
