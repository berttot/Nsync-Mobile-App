import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase";
import { Workspace, WorkspaceMember } from "@/types/workspace";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";

interface WorkspaceContextType {
  memberships: WorkspaceMember[];
  currentWorkspace: Workspace | null;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  loading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState<WorkspaceMember[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    null,
  );
  const [workspaceMap, setWorkspaceMap] = useState<Record<string, Workspace>>(
    {},
  );
  const selectedWorkspaceIdRef = React.useRef<string | null>(null);
  const STORAGE_KEY = "nsync_current_workspace";

  useEffect(() => {
    if (!user) {
      setMemberships([]);
      setCurrentWorkspace(null);
      setWorkspaceMap({});
      setSelectedWorkspaceId(null);
      selectedWorkspaceIdRef.current = null;
      setLoading(false);
      return;
    }

    setLoading(true);

    let memberUnsub: (() => void) | null = null;
    const workspaceUnsubs = new Map<string, () => void>();
    let active = true;

    const syncSelectedWorkspace = async (
      nextMemberships: WorkspaceMember[],
    ) => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const validStored =
        stored && nextMemberships.some((m) => m.workspaceId === stored)
          ? stored
          : null;
      const nextSelected =
        validStored ?? nextMemberships[0]?.workspaceId ?? null;
      if (active) {
        selectedWorkspaceIdRef.current = nextSelected;
        setSelectedWorkspaceId(nextSelected);
        if (!nextSelected) {
          setCurrentWorkspace(null);
        }
      }
      if (nextSelected) {
        await AsyncStorage.setItem(STORAGE_KEY, nextSelected);
      }
    };

    const membersQuery = query(
      collection(db, "workspace_members"),
      where("userId", "==", user.id),
    );

    memberUnsub = onSnapshot(
      membersQuery,
      (snap) => {
        const nextMemberships: WorkspaceMember[] = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) }))
          .sort((a, b) => {
            const aTs =
              (a as any).joinedAt?.toMillis?.() ?? (a as any).joinedAt ?? 0;
            const bTs =
              (b as any).joinedAt?.toMillis?.() ?? (b as any).joinedAt ?? 0;
            return bTs - aTs;
          });

        setMemberships(nextMemberships);

        const nextIds = new Set(nextMemberships.map((m) => m.workspaceId));
        for (const [workspaceId, unsub] of workspaceUnsubs.entries()) {
          if (!nextIds.has(workspaceId)) {
            unsub();
            workspaceUnsubs.delete(workspaceId);
          }
        }

        nextMemberships.forEach((membership) => {
          if (workspaceUnsubs.has(membership.workspaceId)) return;
          const workspaceRef = doc(db, "workspaces", membership.workspaceId);
          const unsub = onSnapshot(workspaceRef, (workspaceSnap) => {
            if (!workspaceSnap.exists()) {
              setWorkspaceMap((prev) => {
                const next = { ...prev };
                delete next[membership.workspaceId];
                return next;
              });
              setMemberships((prev) =>
                prev.map((item) =>
                  item.workspaceId === membership.workspaceId
                    ? { ...item, workspaceName: "Missing workspace" }
                    : item,
                ),
              );
              if (selectedWorkspaceIdRef.current === membership.workspaceId) {
                setCurrentWorkspace(null);
              }
              setLoading(false);
              return;
            }
            const workspace = {
              id: workspaceSnap.id,
              ...(workspaceSnap.data() as any),
            } as Workspace;
            setWorkspaceMap((prev) => ({ ...prev, [workspace.id]: workspace }));
            setMemberships((prev) =>
              prev.map((item) =>
                item.workspaceId === workspace.id
                  ? { ...item, workspaceName: workspace.name }
                  : item,
              ),
            );
            if (
              selectedWorkspaceIdRef.current === workspace.id ||
              !selectedWorkspaceIdRef.current
            ) {
              setCurrentWorkspace(workspace);
            }
            setLoading(false);
          });
          workspaceUnsubs.set(membership.workspaceId, unsub);
        });

        // Do not block UI actions while waiting for optional workspace document snapshots.
        setLoading(false);

        void syncSelectedWorkspace(nextMemberships);
        if (nextMemberships.length === 0) {
          setCurrentWorkspace(null);
          setLoading(false);
          return;
        }
        if (nextMemberships.length > 0) {
          const selectedId =
            selectedWorkspaceId && nextIds.has(selectedWorkspaceId)
              ? selectedWorkspaceId
              : nextMemberships[0].workspaceId;
          const selectedWorkspace = workspaceMap[selectedId];
          if (selectedWorkspace) {
            setCurrentWorkspace(selectedWorkspace);
          }
        }
      },
      (error) => {
        console.error("Error loading workspace memberships", error);
        setLoading(false);
      },
    );

    return () => {
      active = false;
      memberUnsub?.();
      workspaceUnsubs.forEach((unsub) => unsub());
    };
  }, [user]);

  const switchWorkspace = async (workspaceId: string) => {
    try {
      selectedWorkspaceIdRef.current = workspaceId;
      setSelectedWorkspaceId(workspaceId);
      const w = workspaceMap[workspaceId] ?? null;
      setCurrentWorkspace(w);
      await AsyncStorage.setItem(STORAGE_KEY, workspaceId);
    } catch (e) {
      console.error("Error switching workspace", e);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{ memberships, currentWorkspace, switchWorkspace, loading }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx)
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
