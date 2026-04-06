import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
    createTask,
    subscribeTasksForBoard,
    updateTask,
} from "@/services/tasks";
import { Task } from "@/types/task";
import { useLocalSearchParams, useRouter, useSegments } from "expo-router";
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

export default function BoardDetail() {
  const params = useLocalSearchParams();
  const segments = useSegments();
  const router = useRouter();
  const rawId = Array.isArray(params.id)
    ? params.id[0]
    : (params.id as string | undefined);
  const rawBoardId = Array.isArray((params as any).boardId)
    ? (params as any).boardId[0]
    : ((params as any).boardId as string | undefined);
  let boardId = Array.isArray(params.id)
    ? params.id[0]
    : (params.id as string | undefined);
  // Fallback: try to read the last path segment if params.id is missing
  // but skip route-parameter placeholders like [id].
  if (!boardId && segments && segments.length > 0) {
    const last = segments[segments.length - 1];
    const isPlaceholder = last && /^\[.*\]$/.test(last);
    if (last && last !== "board" && !last.startsWith("(") && !isPlaceholder) {
      boardId = last;
    }
  }
  const resolvedBoardId =
    (boardId || rawId || rawBoardId) &&
    !/^\[.*\]$/.test(boardId || rawId || rawBoardId || "")
      ? boardId || rawId || rawBoardId
      : undefined;
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    if (!resolvedBoardId) return;
    const unsub = subscribeTasksForBoard(resolvedBoardId, setTasks);
    return () => unsub();
  }, [resolvedBoardId]);

  const columns = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    done: tasks.filter((t) => t.status === "done"),
  } as const;

  const moveTask = async (task: Task, toStatus: string) => {
    try {
      await updateTask(task.id, { status: toStatus as any });
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not move task");
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }
    if (!resolvedBoardId) {
      Alert.alert("Error", "Board not found");
      return;
    }
    if (!currentWorkspace?.id) {
      Alert.alert("Error", "No workspace selected");
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "You must be signed in to create tasks.");
      return;
    }
    try {
      console.log("Creating task", {
        boardId: resolvedBoardId,
        workspaceId: currentWorkspace?.id,
        title: newTitle,
      });
      const res = await createTask({
        title: newTitle.trim(),
        boardId: resolvedBoardId,
        workspaceId: currentWorkspace?.id,
        assignedTo: user?.id,
      });

      // Optimistic UI update: insert the new task locally so it appears
      // immediately even if realtime listener is delayed or temporarily errored.
      const newTask: Task = {
        id: res.id,
        title: newTitle.trim(),
        boardId: resolvedBoardId,
        workspaceId: currentWorkspace?.id || "",
        status: "todo",
        assignedTo: user?.id,
        createdAt: new Date() as any,
      };
      setTasks((prev) => [newTask, ...prev.filter((t) => t.id !== res.id)]);

      setNewTitle("");
      setShowCreate(false);
    } catch (e) {
      console.error("create task error", e);
      const msg = e && (e as any).message ? (e as any).message : String(e);
      Alert.alert("Error", `Could not create task\n${msg}`);
    }
  };

  if (!resolvedBoardId) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.back}>‹ Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Board</Text>
            <View style={{ width: 70 }} />
          </View>

          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>Board not found</Text>
            <Text style={styles.emptyText}>
              This board screen was opened without a valid board ID.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.replace("/boards")}
            >
              <Text style={styles.emptyButtonText}>Go to Boards</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Board</Text>
          <TouchableOpacity
            onPress={() => setShowCreate(true)}
            style={styles.add}
          >
            <Text style={styles.addText}>+ New</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal contentContainerStyle={styles.columns}>
          {(Object.keys(columns) as Array<keyof typeof columns>).map((col) => (
            <View style={styles.col} key={col}>
              <Text style={styles.colTitle}>
                {col.replace("_", " ").toUpperCase()}
              </Text>
              {columns[col].map((task) => (
                <View style={styles.card} key={task.id}>
                  <Text style={styles.cardTitle}>{task.title}</Text>
                  <View style={styles.cardActions}>
                    {col !== "todo" && (
                      <TouchableOpacity onPress={() => moveTask(task, "todo")}>
                        <Text style={styles.action}>To Do</Text>
                      </TouchableOpacity>
                    )}
                    {col !== "in_progress" && (
                      <TouchableOpacity
                        onPress={() => moveTask(task, "in_progress")}
                      >
                        <Text style={styles.action}>In Progress</Text>
                      </TouchableOpacity>
                    )}
                    {col !== "done" && (
                      <TouchableOpacity onPress={() => moveTask(task, "done")}>
                        <Text style={styles.action}>Done</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>

        <Modal visible={showCreate} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Create Task</Text>
              <TextInput
                style={styles.input}
                placeholder="Title"
                placeholderTextColor="#9CA3AF"
                value={newTitle}
                onChangeText={setNewTitle}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowCreate(false)}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalPrimary]}
                  onPress={handleCreate}
                >
                  <Text style={{ color: "#fff" }}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  safeArea: { flex: 1, backgroundColor: Colors.background.primary },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  back: { color: Colors.primary.main },
  title: { fontSize: 18, fontWeight: "700", color: Colors.text.primary },
  add: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
  },
  addText: { color: Colors.text.inverse, fontWeight: "700" },
  columns: { padding: 16 },
  col: { width: 300, marginRight: 12 },
  colTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  card: {
    backgroundColor: Colors.background.primary,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  cardActions: { flexDirection: "row", justifyContent: "space-between" },
  action: { color: Colors.primary.main, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: Colors.background.primary,
    padding: 16,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    paddingHorizontal: 12,
    marginBottom: 12,
    color: Colors.text.primary,
    backgroundColor: Colors.background.secondary,
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end" },
  modalButton: { paddingHorizontal: 12, paddingVertical: 10, marginLeft: 8 },
  modalPrimary: { backgroundColor: Colors.primary.main, borderRadius: 8 },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: Colors.text.inverse,
    fontWeight: "700",
  },
});
