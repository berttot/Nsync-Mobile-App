import { Colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - will be replaced with Firebase data
  const stats = {
    totalTasks: 24,
    completedTasks: 18,
    inProgressTasks: 4,
    todoTasks: 2,
    totalBoards: 3,
  };

  const recentActivities = [
    { id: 1, action: 'Task "Design UI" completed', time: "2 hours ago" },
    {
      id: 2,
      action: 'New task "API Integration" assigned',
      time: "4 hours ago",
    },
    { id: 3, action: 'Comment on "Database Setup"', time: "6 hours ago" },
  ];

  const quickActions = [
    {
      id: 1,
      title: "Create Task",
      icon: "+",
      color: Colors.primary.main,
      onPress: () => router.push("/(tabs)/tasks"),
    },
    {
      id: 2,
      title: "View Boards",
      icon: "⊞",
      color: Colors.secondary.main,
      onPress: () => router.push("/(tabs)/boards"),
    },
    {
      id: 3,
      title: "My Tasks",
      icon: "✓",
      color: Colors.text.secondary,
      onPress: () => router.push("/(tabs)/tasks"),
    },
    {
      id: 4,
      title: "Profile",
      icon: "👤",
      color: Colors.text.tertiary,
      onPress: () => router.push("/(tabs)/profile"),
    },
  ];

  const StatCard = ({ title, value, subtitle, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );

  const ActivityItem = ({ action, time }: any) => (
    <View style={styles.activityItem}>
      <View style={styles.activityDot} />
      <View style={styles.activityContent}>
        <Text style={styles.activityAction}>{action}</Text>
        <Text style={styles.activityTime}>{time}</Text>
      </View>
    </View>
  );

  const QuickAction = ({ title, icon, color, onPress }: any) => (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={styles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.userName}>John Doe</Text>
          </View>
          <View style={styles.brandingHeader}>
            <Text style={styles.brandingText}>
              <Text style={styles.brandingTextN}>N</Text>
              <Text style={styles.brandingTextSYN}>SYN</Text>
              <Text style={styles.brandingTextC}>C</Text>
            </Text>
            <View style={styles.brandingUnderline} />
            <Text style={styles.brandingSubtitle}>TEAM WORKSPACE</Text>
          </View>
        </View>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks}
            subtitle="All tasks"
            color={Colors.primary.main}
          />
          <StatCard
            title="Completed"
            value={stats.completedTasks}
            subtitle="Done"
            color={Colors.secondary.main}
          />
          <StatCard
            title="In Progress"
            value={stats.inProgressTasks}
            subtitle="Working"
            color={Colors.text.secondary}
          />
          <StatCard
            title="To Do"
            value={stats.todoTasks}
            subtitle="Pending"
            color={Colors.text.tertiary}
          />
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

        {/* Recent Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <View style={styles.activitiesContainer}>
            {recentActivities.map((activity) => (
              <ActivityItem key={activity.id} {...activity} />
            ))}
          </View>
        </View>

        {/* Board Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Boards</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/boards")}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.boardsContainer}>
            <TouchableOpacity style={styles.boardCard}>
              <Text style={styles.boardTitle}>Development</Text>
              <Text style={styles.boardStats}>12 tasks • 3 active</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.boardCard}>
              <Text style={styles.boardTitle}>Design</Text>
              <Text style={styles.boardStats}>8 tasks • 2 active</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    fontWeight: "500",
  },
  userName: {
    fontSize: 24,
    color: Colors.text.primary,
    fontWeight: "bold",
    marginTop: 4,
  },
  brandingHeader: {
    alignItems: "center",
  },
  brandingText: {
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  brandingTextN: {
    color: Colors.text.primary,
  },
  brandingTextSYN: {
    color: Colors.secondary.main,
  },
  brandingTextC: {
    color: Colors.text.primary,
  },
  brandingUnderline: {
    width: 40,
    height: 2,
    backgroundColor: Colors.secondary.main,
    marginTop: 2,
    marginBottom: 4,
  },
  brandingSubtitle: {
    fontSize: 8,
    color: Colors.text.primary,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
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
    fontWeight: "bold",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.secondary.main,
    fontWeight: "600",
  },
  quickActionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickAction: {
    width: (width - 50) / 2,
    height: 80,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "600",
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary.main,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: "500",
  },
  activityTime: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  boardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  boardCard: {
    width: (width - 50) / 2,
    backgroundColor: Colors.background.primary,
    padding: 16,
    borderRadius: 12,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  boardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  boardStats: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
});
