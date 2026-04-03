import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';
import { mockTasks, mockBoards } from '@/constants/mockData';

const { width } = Dimensions.get('window');

export default function UserDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Filter tasks assigned to current user
  const myTasks = mockTasks.filter(task => task.assignedTo === user?.id);
  const completedTasks = myTasks.filter(task => task.status === 'done').length;
  const inProgressTasks = myTasks.filter(task => task.status === 'in_progress').length;
  const todoTasks = myTasks.filter(task => task.status === 'todo').length;

  // Filter boards where user is a member
  const myBoards = mockBoards.filter(board => board.members.includes(user?.id || ''));

  const recentTasks = myTasks.slice(0, 3);

  const quickActions = [
    { id: 1, title: 'My Tasks', icon: '📝', color: Colors.primary.main, onPress: () => router.push('/(user)/my-tasks') },
    { id: 2, title: 'View Boards', icon: '📋', color: Colors.text.secondary, onPress: () => router.push('/(user)/boards') },
    { id: 3, title: 'My Progress', icon: '📊', color: Colors.text.tertiary, onPress: () => Alert.alert('Progress', 'Your progress: ' + Math.round((completedTasks / myTasks.length) * 100) + '%') },
    { id: 4, title: 'Profile', icon: '👤', color: Colors.warning, onPress: () => router.push('/(user)/profile') },
  ];

  const StatCard = ({ title, value, subtitle, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );

  const TaskItem = ({ task }: any) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'done': return Colors.success;
        case 'in_progress': return Colors.warning;
        case 'todo': return Colors.text.tertiary;
        default: return Colors.text.secondary;
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'done': return 'Completed';
        case 'in_progress': return 'In Progress';
        case 'todo': return 'To Do';
        default: return status;
      }
    };

    return (
      <TouchableOpacity style={styles.taskItem}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
            <Text style={styles.statusText}>{getStatusText(task.status)}</Text>
          </View>
        </View>
        <Text style={styles.taskDescription}>{task.description}</Text>
        <Text style={styles.taskDueDate}>Due: {task.dueDate}</Text>
      </TouchableOpacity>
    );
  };

  const QuickAction = ({ title, icon, color, onPress }: any) => (
    <TouchableOpacity style={[styles.quickAction, { backgroundColor: color }]} onPress={onPress}>
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={styles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
            // Use router.push instead of router.replace for logout
            router.push('/(auth)/login' as any);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      {/** Use the reusable AppHeader component for a modern minimal header */}
      {(() => {
        const Header = require('@/components/AppHeader').default;
        return <Header title="Welcome back!" subtitle="" />;
      })()}

      {/* My Stats */}
      <View style={styles.statsContainer}>
        <StatCard title="My Tasks" value={myTasks.length} subtitle="Assigned to me" color={Colors.primary.main} />
        <StatCard title="Completed" value={completedTasks} subtitle="Done" color={Colors.success} />
        <StatCard title="In Progress" value={inProgressTasks} subtitle="Working" color={Colors.warning} />
        <StatCard title="To Do" value={todoTasks} subtitle="Pending" color={Colors.text.tertiary} />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action) => (
            <QuickAction key={action.id} {...action} />
          ))}
        </View>
      </View>

      {/* Recent Tasks */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Recent Tasks</Text>
          <TouchableOpacity onPress={() => router.push('/(user)/my-tasks')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tasksContainer}>
          {recentTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </View>
      </View>

      {/* My Boards */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Boards</Text>
          <TouchableOpacity onPress={() => router.push('/(user)/boards')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.boardsContainer}>
          {myBoards.map((board) => (
            <TouchableOpacity key={board.id} style={styles.boardCard}>
              <View style={[styles.boardDot, { backgroundColor: board.color }]} />
              <View style={styles.boardContent}>
                <Text style={styles.boardTitle}>{board.title}</Text>
                <Text style={styles.boardDescription}>{board.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Progress Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Progress</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Task Completion</Text>
            <Text style={styles.progressValue}>
              {myTasks.length > 0 ? Math.round((completedTasks / myTasks.length) * 100) : 0}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${myTasks.length > 0 ? (completedTasks / myTasks.length) * 100 : 0}%`,
                  backgroundColor: Colors.success 
                }
              ]} 
            />
          </View>
          <Text style={styles.progressSubtitle}>
            {completedTasks} of {myTasks.length} tasks completed
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    color: Colors.text.primary,
    fontWeight: 'bold',
    marginTop: 4,
  },
  logoutButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.background.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  logoutText: {
    fontSize: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 50) / 2,
    backgroundColor: Colors.background.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    marginHorizontal: 2.5,
    borderLeftWidth: 4,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  statTitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  statSubtitle: {
    fontSize: 10,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: (width - 50) / 2,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 24,
    color: Colors.text.inverse,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  tasksContainer: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  taskItem: {
    backgroundColor: Colors.background.secondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  taskDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  taskDueDate: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  boardsContainer: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  boardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  boardDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  boardContent: {
    flex: 1,
  },
  boardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  boardDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  progressContainer: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.main,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border.primary,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
