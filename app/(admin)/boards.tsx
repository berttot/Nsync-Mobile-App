import { Colors } from "@/constants/colors";
import { mockBoards } from "@/constants/mockData";
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

export default function AdminBoards() {
  const { user } = useAuth();
  const [boards, setBoards] = useState(mockBoards);

  const handleDeleteBoard = (boardId: string) => {
    Alert.alert("Delete Board", "Are you sure you want to delete this board?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setBoards(boards.filter((b) => b.id !== boardId));
          Alert.alert("Success", "Board deleted successfully");
        },
      },
    ]);
  };

  const BoardCard = ({ board }: any) => (
    <View style={styles.boardCard}>
      <View style={styles.boardHeader}>
        <View style={[styles.boardDot, { backgroundColor: board.color }]} />
        <View style={styles.boardInfo}>
          <Text style={styles.boardTitle}>{board.title}</Text>
          <Text style={styles.boardDescription}>{board.description}</Text>
        </View>
      </View>
      <View style={styles.boardStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{board.members.length}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>--</Text>
          <Text style={styles.statLabel}>Tasks</Text>
        </View>
      </View>
      <View style={styles.boardActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteBoard(board.id)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Board Management</Text>
          <Text style={styles.subtitle}>Manage all project boards</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{boards.length}</Text>
            <Text style={styles.statLabel}>Total Boards</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {boards.reduce((sum, b) => sum + b.members.length, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Members</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>
        </View>

        <View style={styles.createSection}>
          <TouchableOpacity style={styles.createButton}>
            <Text style={styles.createButtonText}>+ Create New Board</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.boardsList}>
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
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
  boardsList: {
    padding: 20,
  },
  boardCard: {
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
    fontWeight: "bold",
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
    borderRadius: 8,
  },
  statItem: {
    alignItems: "center",
  },
  boardActions: {
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
