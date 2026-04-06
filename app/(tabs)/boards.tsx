import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function BoardsScreen() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");

  // Mock data - will be replaced with Firebase data
  const boards = [
    {
      id: "1",
      title: "Development",
      description: "All development tasks and features",
      taskCount: 12,
      activeTasks: 3,
      color: "#4F46E5",
    },
    {
      id: "2",
      title: "Design",
      description: "UI/UX design tasks and mockups",
      taskCount: 8,
      activeTasks: 2,
      color: "#10B981",
    },
    {
      id: "3",
      title: "Marketing",
      description: "Marketing campaigns and content",
      taskCount: 5,
      activeTasks: 1,
      color: "#F59E0B",
    },
  ];

  const handleCreateBoard = () => {
    if (!newBoardTitle.trim()) {
      Alert.alert("Error", "Please enter a board title");
      return;
    }

    // TODO: Implement Firebase board creation
    Alert.alert("Success", "Board created successfully!");
    setNewBoardTitle("");
    setNewBoardDescription("");
    setShowCreateModal(false);
  };

  const handleBoardPress = (boardId: string) => {
    // TODO: Navigate to board details
    Alert.alert("Board", `Opening board ${boardId}`);
  };

  const BoardCard = ({ board }: any) => (
    <TouchableOpacity
      style={[styles.boardCard, { borderLeftColor: board.color }]}
      onPress={() => handleBoardPress(board.id)}
    >
      <View style={styles.boardHeader}>
        <Text style={styles.boardTitle}>{board.title}</Text>
        <View style={[styles.boardDot, { backgroundColor: board.color }]} />
      </View>
      <Text style={styles.boardDescription}>{board.description}</Text>
      <View style={styles.boardStats}>
        <Text style={styles.boardTaskCount}>{board.taskCount} tasks</Text>
        <Text style={styles.boardActiveCount}>{board.activeTasks} active</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Boards</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.createButtonText}>+ Create Board</Text>
          </TouchableOpacity>
        </View>

        {/* Boards List */}
        <ScrollView
          style={styles.boardsContainer}
          showsVerticalScrollIndicator={false}
        >
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </ScrollView>

        {/* Create Board Modal */}
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
              <Text style={styles.modalTitle}>Create Board</Text>
              <TouchableOpacity onPress={handleCreateBoard}>
                <Text style={styles.createModalButton}>Create</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Board Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter board title"
                  value={newBoardTitle}
                  onChangeText={setNewBoardTitle}
                  autoFocus
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter board description"
                  value={newBoardDescription}
                  onChangeText={setNewBoardDescription}
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
  boardsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  boardCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  boardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  boardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    flex: 1,
  },
  boardDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  boardDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  boardStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  boardTaskCount: {
    fontSize: 12,
    color: "#6B7280",
  },
  boardActiveCount: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
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
