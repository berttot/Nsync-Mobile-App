import { Colors } from "@/constants/colors";
import { mockTasks, mockUsers } from "@/constants/mockData";
import { useAuth } from "@/contexts/AuthContext";
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

export default function AdminTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState(mockTasks);
  const [filter, setFilter] = useState("all");

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const handleDeleteTask = (taskId: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setTasks(tasks.filter((t) => t.id !== taskId));
          Alert.alert("Success", "Task deleted successfully");
        },
      },
    ]);
  };

  const TaskCard = ({ task }: any) => {
    const assignedUser = mockUsers.find((u) => u.id === task.assignedTo);

    return (
      <View style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  task.status === "done"
                    ? Colors.success
                    : task.status === "in_progress"
                      ? Colors.warning
                      : Colors.text.tertiary,
              },
            ]}
          >
            <Text style={styles.statusText}>
              {task.status === "done"
                ? "Completed"
                : task.status === "in_progress"
                  ? "In Progress"
                  : "To Do"}
            </Text>
          </View>
        </View>
        <Text style={styles.taskDescription}>{task.description}</Text>
        <View style={styles.taskMeta}>
          <Text style={styles.taskAssignee}>
            Assigned to: {assignedUser?.name || "Unassigned"}
          </Text>
          <Text style={styles.taskPriority}>Priority: {task.priority}</Text>
          <Text style={styles.taskDueDate}>Due: {task.dueDate}</Text>
        </View>
        <View style={styles.taskActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteTask(task.id)}
          >
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Task Management</Text>
          <Text style={styles.subtitle}>Manage all project tasks</Text>
        </View>

        <View style={styles.filterContainer}>
          {["all", "todo", "in_progress", "done"].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                filter === status && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(status)}
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
            <Text style={styles.statValue}>{tasks.length}</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {tasks.filter((t) => t.status === "done").length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {tasks.filter((t) => t.status === "in_progress").length}
            </Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
        </View>

        <View style={styles.createSection}>
          <TouchableOpacity style={styles.createButton}>
            <Text style={styles.createButtonText}>+ Create New Task</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tasksList}>
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
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
  filterContainer: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
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
    fontWeight: "500",
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
  },
  statCard: {
    alignItems: "center",
    padding: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  createSection: {
    padding: 20,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  createButton: {
    backgroundColor: Colors.primary.main,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text.inverse,
  },
  tasksList: {
    padding: 20,
  },
  taskCard: {
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
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
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
  },
  taskMeta: {
    marginBottom: 12,
  },
  taskAssignee: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginBottom: 4,
  },
  taskPriority: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginBottom: 4,
  },
  taskDueDate: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  taskActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    minWidth: 80,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.primary,
  },
});
