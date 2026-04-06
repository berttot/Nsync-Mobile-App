import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { createWorkspace, joinWorkspaceWithCode } from "@/services/workspaces";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function NoWorkspace() {
  const { user } = useAuth();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const handleCreate = async () => {
    if (!workspaceName.trim()) {
      Alert.alert("Error", "Please enter a workspace name");
      return;
    }
    setCreating(true);
    try {
      const res = await createWorkspace(workspaceName.trim(), user!.id);
      if (res.success) {
        Alert.alert("Workspace created", "Workspace created successfully");
        router.replace("/(user)/dashboard");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not create workspace");
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) {
      Alert.alert("Error", "Please enter an invite code");
      return;
    }
    try {
      const res = await joinWorkspaceWithCode(
        user!.id,
        joinCode.trim(),
        user!.email,
      );
      if (res.success) {
        Alert.alert("Joined", "You have joined the workspace");
        router.replace("/(user)/dashboard");
      } else {
        Alert.alert("Error", res.error ?? "Could not join workspace");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not join workspace");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>You don’t have any workspace yet</Text>
      <Text style={styles.subtitle}>
        Create a new workspace to get started or join an existing one with an
        invite code.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create Workspace</Text>
        <TextInput
          style={styles.input}
          placeholder="Workspace name"
          placeholderTextColor="#9CA3AF"
          value={workspaceName}
          onChangeText={setWorkspaceName}
        />
        <TouchableOpacity
          style={[styles.button, creating && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={creating}
        >
          <Text style={styles.buttonText}>
            {creating ? "Creating..." : "Create Workspace"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Join Workspace</Text>
        <Text style={styles.cardHint}>
          Ask the workspace admin for the 6-character invite code.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Invite code"
          placeholderTextColor="#9CA3AF"
          value={joinCode}
          onChangeText={setJoinCode}
          autoCapitalize="characters"
        />
        <TouchableOpacity style={styles.button} onPress={handleJoin}>
          <Text style={styles.buttonText}>Join with code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background.secondary,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  card: {
    backgroundColor: Colors.background.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  cardHint: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 10,
    lineHeight: 18,
  },
  input: {
    height: 48,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  button: {
    backgroundColor: Colors.primary.main,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.text.inverse,
    fontWeight: "700",
  },
});
