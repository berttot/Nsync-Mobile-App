import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TasksScreen() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  // Mock data - will be replaced with Firebase data
  const tasks = [
    {
      id: "1",
      title: "Design UI mockups",
      description: "Create mockups for the new feature",
      status: "todo",
      priority: "high",
      board: "Design",
      dueDate: "2024-01-15",
    },
    {
      id: "2",
      title: "Implement authentication",
      description: "Add Firebase authentication",
      status: "in_progress",
      priority: "high",
      board: "Development",
      dueDate: "2024-01-12",
    },
    {
      id: "3",
      title: "Write documentation",
      description: "Document API endpoints",
      status: "done",
      priority: "medium",
      board: "Development",
      dueDate: "2024-01-10",
    },
    {
      id: "4",
      title: "Create marketing content",
      description: "Write blog posts for launch",
      status: "todo",
      priority: "low",
      board: "Marketing",
      dueDate: "2024-01-20",
    },
  ];

  const filters = [
    { id: "all", label: "All Tasks", count: tasks.length },
    {
      id: "todo",
      label: "To Do",
      count: tasks.filter((t) => t.status === "todo").length,
    },
    {
      id: "in_progress",
      label: "In Progress",
      count: tasks.filter((t) => t.status === "in_progress").length,
    },
    {
      id: "done",
      label: "Done",
      count: tasks.filter((t) => t.status === "done").length,
    },
  ];

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      selectedFilter === "all" || task.status === selectedFilter;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) {
      Alert.alert("Error", "Please enter a task title");
      return;
    }

    // TODO: Implement Firebase task creation
    Alert.alert("Success", "Task created successfully!");
    setNewTaskTitle("");
    setNewTaskDescription("");
    setShowCreateModal(false);
  };

  const handleTaskPress = (taskId: string) => {
    // TODO: Navigate to task details
    Alert.alert("Task", `Opening task ${taskId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "#EF4444";
      case "in_progress":
        return "#F59E0B";
      case "done":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const TaskCard = ({ task }: any) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => handleTaskPress(task.id)}
    >
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: getStatusColor(task.status) },
          ]}
        />
      </View>
      <Text style={styles.taskDescription}>{task.description}</Text>
      <View style={styles.taskFooter}>
        <View style={styles.taskMeta}>
          <Text style={styles.boardLabel}>{task.board}</Text>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(task.priority) },
            ]}
          >
            <Text style={styles.priorityText}>{task.priority}</Text>
          </View>
        </View>
        <Text style={styles.dueDate}>{task.dueDate}</Text>
      </View>
    </TouchableOpacity>
  );

  const FilterButton = ({ filter }: any) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter.id && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(filter.id)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter.id && styles.filterButtonTextActive,
        ]}
      >
        {filter.label} ({filter.count})
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tasks</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.createButtonText}>+ Create Task</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <ScrollView
          style={styles.filtersContainer}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {filters.map((filter) => (
            <FilterButton key={filter.id} filter={filter} />
          ))}
        </ScrollView>

        {/* Tasks List */}
        <FlatList
          data={filteredTasks}
          renderItem={({ item }) => <TaskCard task={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.tasksList}
          showsVerticalScrollIndicator={false}
        />

        {/* Create Task Modal */}
        <Modal
          visible={showCreateModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Create Task</Text>
              <TouchableOpacity onPress={handleCreateTask}>
                <Text style={styles.createModalButton}>Create</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Task Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter task title"
                  value={newTaskTitle}
                  onChangeText={setNewTaskTitle}
                  autoFocus
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter task description"
                  value={newTaskDescription}
                  onChangeText={setNewTaskDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  createButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchInput: {
    height: 44,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#4F46E5",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  tasksList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  taskCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  boardLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  dueDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  cancelButton: {
    fontSize: 16,
    color: "#6B7280",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  createModalButton: {
    fontSize: 16,
    color: "#4F46E5",
    fontWeight: "600",
  },
  modalContent: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
});
