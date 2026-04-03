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
import { mockUsers, mockBoards, mockTasks } from '@/constants/mockData';

const { width } = Dimensions.get('window');

export default function AdminDashboard() {
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

  // Use a modern header component
  const Header = require('@/components/AppHeader').default;

  // Calculate admin statistics
  const stats = {
    totalUsers: mockUsers.length,
    totalBoards: mockBoards.length,
    totalTasks: mockTasks.length,
    completedTasks: mockTasks.filter(t => t.status === 'done').length,
    activeUsers: mockUsers.filter(u => u.role === 'user').length,
  };

  const recentActivities = [
    { id: 1, action: 'New user "Sarah Smith" registered', time: '2 hours ago', type: 'user' },
    { id: 2, action: 'Task "Design Login Screen" completed', time: '4 hours ago', type: 'task' },
    { id: 3, action: 'Board "Marketing" created', time: '6 hours ago', type: 'board' },
    { id: 4, action: 'Task assigned to "John Doe"', time: '8 hours ago', type: 'task' },
  ];

  const quickActions = [
    { id: 1, title: 'Manage Users', icon: '👥', color: Colors.primary.main, onPress: () => router.push('/(admin)/users') },
    { id: 2, title: 'Create Board', icon: '📋', color: Colors.text.secondary, onPress: () => router.push('/(admin)/boards') },
    { id: 3, title: 'View Tasks', icon: '✓', color: Colors.text.tertiary, onPress: () => router.push('/(admin)/tasks') },
    { id: 4, title: 'User Reports', icon: '📊', color: Colors.warning, onPress: () => Alert.alert('Reports', 'Analytics coming soon') },
  ];

  const StatCard = ({ title, value, subtitle, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );

  const ActivityItem = ({ action, time, type }: any) => {
    const getIcon = () => {
      switch (type) {
        case 'user': return '👤';
        case 'task': return '✓';
        case 'board': return '📋';
        default: return '📄';
      }
    };

    return (
      <View style={styles.activityItem}>
        <Text style={styles.activityIcon}>{getIcon()}</Text>
        <View style={styles.activityContent}>
          <Text style={styles.activityAction}>{action}</Text>
          <Text style={styles.activityTime}>{time}</Text>
        </View>
      </View>
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
      <Header title="Admin Dashboard" subtitle="" />

      {/* Admin Stats */}
      <View style={styles.statsContainer}>
        <StatCard title="Total Users" value={stats.totalUsers} subtitle="All users" color={Colors.primary.main} />
        <StatCard title="Total Boards" value={stats.totalBoards} subtitle="All boards" color={Colors.text.secondary} />
        <StatCard title="Total Tasks" value={stats.totalTasks} subtitle="All tasks" color={Colors.text.tertiary} />
        <StatCard title="Completed" value={stats.completedTasks} subtitle="Done" color={Colors.success} />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Admin Actions</Text>
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action) => (
            <QuickAction key={action.id} {...action} />
          ))}
        </View>
      </View>

      {/* Recent Activities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Activity</Text>
        <View style={styles.activitiesContainer}>
          {recentActivities.map((activity) => (
            <ActivityItem key={activity.id} {...activity} />
          ))}
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Overview</Text>
        <View style={styles.userOverview}>
          <View style={styles.userStat}>
            <Text style={styles.userStatValue}>{stats.activeUsers}</Text>
            <Text style={styles.userStatLabel}>Active Users</Text>
          </View>
          <View style={styles.userStat}>
            <Text style={styles.userStatValue}>{mockUsers.filter(u => u.role === 'admin').length}</Text>
            <Text style={styles.userStatLabel}>Admins</Text>
          </View>
          <View style={styles.userStat}>
            <Text style={styles.userStatValue}>{Math.round((stats.completedTasks / stats.totalTasks) * 100)}%</Text>
            <Text style={styles.userStatLabel}>Task Completion</Text>
          </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
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
  activitiesContainer: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  userOverview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  userStat: {
    alignItems: 'center',
  },
  userStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  userStatLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
});
