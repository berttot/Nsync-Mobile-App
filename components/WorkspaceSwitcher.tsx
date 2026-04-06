import { Colors } from "@/constants/colors";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
  StyleSheet,
    Modal,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function WorkspaceSwitcher() {
  const { memberships, currentWorkspace, switchWorkspace, loading } =
    useWorkspace();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const currentMembership = memberships.find(
    (item) => item.workspaceId === currentWorkspace?.id,
  );

  const handleSelect = async (workspaceId: string) => {
    setOpen(false);
    await switchWorkspace(workspaceId);
  };

  const handleOpen = () => {
    if (memberships.length === 0) {
      router.push("/(user)/no-workspace");
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <TouchableOpacity style={styles.button} onPress={handleOpen}>
        <Text style={styles.buttonLabel}>Workspace</Text>
        <Text style={styles.buttonText} numberOfLines={1}>
          {currentWorkspace?.name ?? "No workspace"}
        </Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>Switch Workspace</Text>
            <Text style={styles.subtitle}>
              Choose where you want to work right now.
            </Text>
            <FlatList
              data={memberships}
              keyExtractor={(i) => i.id || i.workspaceId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.item,
                    item.workspaceId === currentWorkspace?.id &&
                      styles.itemActive,
                  ]}
                  onPress={() => handleSelect(item.workspaceId)}
                >
                  <View style={styles.itemTextWrap}>
                    <Text style={styles.itemText} numberOfLines={1}>
                      {item.workspaceName ??
                        currentWorkspace?.name ??
                        "Workspace"}
                    </Text>
                    <Text style={styles.itemSubtext} numberOfLines={1}>
                      {item.workspaceId}
                    </Text>
                  </View>
                  <View style={styles.itemMeta}>
                    {item.workspaceId === currentWorkspace?.id ? (
                      <View style={styles.activePill}>
                        <Text style={styles.activePillText}>Active</Text>
                      </View>
                    ) : null}
                    <Text style={styles.itemRole}>{item.role}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>No workspaces found</Text>
                </View>
              )}
            />

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setOpen(false);
                  router.push("/(user)/no-workspace");
                }}
              >
                <Text style={styles.actionText}>Create / Join</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.closeButton]}
                onPress={() => setOpen(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  buttonLabel: {
    color: Colors.text.secondary,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  buttonText: {
    color: Colors.text.primary,
    fontWeight: "800",
    fontSize: 15,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: Colors.background.primary,
    borderRadius: 18,
    maxHeight: "80%",
    padding: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 14,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 6,
  },
  itemActive: {
    backgroundColor: "rgba(34,197,94,0.08)",
    borderBottomColor: "rgba(34,197,94,0.18)",
  },
  itemTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  itemText: {
    color: Colors.text.primary,
    fontWeight: "700",
    fontSize: 16,
  },
  itemSubtext: {
    color: Colors.text.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  itemMeta: {
    alignItems: "flex-end",
    gap: 4,
  },
  itemRole: {
    color: Colors.text.secondary,
    textTransform: "capitalize",
    fontWeight: "600",
    fontSize: 12,
  },
  activePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: Colors.primary.main,
  },
  activePillText: {
    color: Colors.text.inverse,
    fontSize: 11,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
    marginLeft: 8,
  },
  closeButton: {
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  actionText: {
    color: Colors.text.inverse,
    fontWeight: "700",
  },
  closeButtonText: {
    color: Colors.text.secondary,
    fontWeight: "700",
  },
  empty: { padding: 12 },
  emptyText: { color: Colors.text.secondary },
});
