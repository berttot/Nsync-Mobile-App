import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';
import { mockBoards } from '@/constants/mockData';

export default function UserBoards() {
  const { user } = useAuth();
  const [boards, setBoards] = useState(mockBoards.filter(board => board.members.includes(user?.id || '')));

  const BoardCard = ({ board }: any) => (
    <TouchableOpacity style={styles.boardCard}>
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
      <View style={styles.boardFooter}>
        <Text style={styles.boardDate}>Created: {board.createdAt}</Text>
        <Text style={styles.boardRole}>Member</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>My Boards</Text>
        <Text style={styles.subtitle}>Boards you have access to</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{boards.length}</Text>
          <Text style={styles.statLabel}>My Boards</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{boards.reduce((sum, b) => sum + b.members.length, 0)}</Text>
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
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Boards Available</Text>
          <Text style={styles.emptyDescription}>
            You haven't been added to any boards yet. Contact your administrator to get access.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  statCard: {
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
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
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  boardDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  boardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 12,
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  boardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boardDate: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  boardRole: {
    fontSize: 12,
    color: Colors.primary.main,
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
