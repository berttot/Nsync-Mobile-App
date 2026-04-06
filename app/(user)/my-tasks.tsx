import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { subscribeTasksForUserInWorkspace } from "@/services/tasks";
import { Task } from "@/types/task";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TaskStatus = "todo" | "in_progress" | "done";
type IconName = React.ComponentProps<typeof Ionicons>["name"];

export default function UserTasks() {
  const { user } = useAuth();
  const { currentWorkspace, loading: workspaceLoading } = useWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(
    null,
  );
  const router = useRouter();

  useEffect(() => {
    if (!user || !currentWorkspace?.id) {
      setTasks([]);
      setLoadingTasks(false);
      setSubscriptionError(null);
      return;
    }

    setLoadingTasks(true);
    setSubscriptionError(null);
    const unsub = subscribeTasksForUserInWorkspace(
      currentWorkspace.id,
      user.id,
      (nextTasks) => {
        setTasks(nextTasks);
        setLoadingTasks(false);
        setSubscriptionError(null);
      },
      (error) => {
        const message =
          (error as { message?: string })?.message ||
          "Could not load tasks. Please try again.";
        setSubscriptionError(message);
        setLoadingTasks(false);
      },
    );

    return () => {
      unsub();
    };
  }, [currentWorkspace?.id, user?.id]);

  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((task) => (task.status ?? "todo") === filter);
  }, [tasks, filter]);

  const TaskCard = ({ task }: { task: Task }) => {
    const rawBoardId = String(task.boardId ?? "");
    const hasValidBoardId = !!rawBoardId && !/^\[.*\]$/.test(rawBoardId);

    const getStatusColor = (status: TaskStatus) => {
      switch (status) {
        case "done":
          return Colors.success;
        case "in_progress":
          return Colors.warning;
        case "todo":
          return Colors.text.tertiary;
        default:
          return Colors.text.secondary;
      }
    };

    const getStatusText = (status: TaskStatus) => {
      switch (status) {
        case "done":
          return "Completed";
        case "in_progress":
          return "In Progress";
        case "todo":
          return "To Do";
        default:
          return status;
      }
    };

    return (
      <View style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>{task.title || "Untitled Task"}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: getStatusColor(
                  (task.status as TaskStatus | undefined) ?? "todo",
                ),
              },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText((task.status as TaskStatus | undefined) ?? "todo")}
            </Text>
          </View>
        </View>
        <Text style={styles.taskDescription}>
          {task.description || "No description provided."}
        </Text>
        <View style={styles.taskFooter}>
          <View style={styles.taskMetaRow}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={Colors.text.tertiary}
            />
            <Text style={styles.taskDueDate}>
              Due: {task.dueDate || "Not set"}
            </Text>
          </View>
          {hasValidBoardId ? (
            <TouchableOpacity
              onPress={() => router.push(`/board/${rawBoardId}`)}
            >
              <View style={styles.boardLinkWrap}>
                <Text style={styles.openBoardLink}>Open board</Text>
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color={Colors.primary.main}
                />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Board unavailable",
                  "This task is not linked to a valid board yet.",
                )
              }
            >
              <Text style={styles.taskPriority}>No board</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>My Tasks</Text>
          <Text style={styles.subtitle}>
            Your assigned tasks in this workspace
          </Text>
        </View>

        {workspaceLoading || loadingTasks ? (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>Loading tasks...</Text>
          </View>
        ) : null}

        {!workspaceLoading && !currentWorkspace ? (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>No workspace selected.</Text>
          </View>
        ) : null}

        {!workspaceLoading && !user ? (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>You are not signed in.</Text>
          </View>
        ) : null}

        {subscriptionError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Could not load tasks</Text>
            <Text style={styles.errorText}>{subscriptionError}</Text>
          </View>
        ) : null}

        <View style={styles.filterContainer}>
          {["all", "todo", "in_progress", "done"].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                filter === status && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(status as "all" | TaskStatus)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === status && styles.filterButtonTextActive,
                ]}
              >
                {status === "all"
                  ? "All"
                  : status === "todo"
                    ? "To Do"
                    : status === "in_progress"
                      ? "In Progress"
                      : "Done"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="list-outline" size={18} color={Colors.primary.main} />
            <Text style={styles.statValue}>{tasks.length}</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={18} color={Colors.success} />
            <Text style={styles.statValue}>
              {tasks.filter((t) => t.status === "done").length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={18} color={Colors.warning} />
            <Text style={styles.statValue}>
              {tasks.filter((t) => t.status === "in_progress").length}
            </Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
        </View>

        <View style={styles.tasksList}>
          {filteredTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="clipboard-outline" size={28} color={Colors.primary.main} />
              </View>
              <Text style={styles.emptyTitle}>No tasks assigned</Text>
              <Text style={styles.emptyDesc}>
                You don't have tasks yet. Open a board to create tasks.
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push("/boards")}
              >
                <Text style={styles.emptyButtonText}>Browse Boards</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredTasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
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
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
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
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
    flexWrap: "wrap",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "700",
  },
  filterButtonTextActive: {
    color: Colors.text.inverse,
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
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  statValue: {
    fontSize: 22,
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
  tasksList: {
    padding: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 56,
    paddingHorizontal: 24,
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
  emptyDesc: {
    color: Colors.text.secondary,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  emptyButtonText: {
    color: Colors.text.inverse,
    fontWeight: "700",
  },
  taskCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: Colors.text.inverse,
    fontWeight: "600",
  },
  taskDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  taskMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  taskDueDate: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  taskPriority: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  openBoardLink: {
    fontSize: 12,
    color: Colors.primary.main,
    fontWeight: "700",
  },
  boardLinkWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  loadingBox: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  loadingText: {
    color: Colors.text.secondary,
    textAlign: "center",
  },
  errorBox: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "rgba(239,68,68,0.08)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.32)",
  },
  errorTitle: {
    color: Colors.text.primary,
    fontWeight: "700",
    marginBottom: 4,
  },
  errorText: {
    color: Colors.text.secondary,
  },
});
