import { db } from "@/firebase";
import { Task } from "@/types/task";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    onSnapshot,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";

export const subscribeTasksForUserInWorkspace = (
  workspaceId: string,
  userId: string,
  onChange: (tasks: Task[]) => void,
  onError?: (error: unknown) => void,
) => {
  // Keep this subscription index-safe: query by assigned user only,
  // then filter/sort for workspace in memory.
  const q = query(collection(db, "tasks"), where("assignedTo", "==", userId));
  const unsub = onSnapshot(
    q,
    (snap) => {
      let tasks: Task[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      tasks = tasks
        .filter((t) => (t as any).workspaceId === workspaceId)
        .sort((a, b) => {
          const aTs =
            (a as any).createdAt?.toMillis?.() ?? (a as any).createdAt ?? 0;
          const bTs =
            (b as any).createdAt?.toMillis?.() ?? (b as any).createdAt ?? 0;
          return bTs - aTs;
        });
      onChange(tasks);
    },
    (err) => {
      console.warn("subscribeTasksForUserInWorkspace onSnapshot warning", err);
      onError?.(err);
    },
  );

  return unsub;
};

export const subscribeTasksForWorkspace = (
  workspaceId: string,
  onChange: (tasks: Task[]) => void,
) => {
  // Keep subscription simple to avoid requiring composite indexes.
  const q = query(
    collection(db, "tasks"),
    where("workspaceId", "==", workspaceId),
  );
  const unsub = onSnapshot(
    q,
    (snap) => {
      console.debug(
        "subscribeTasksForWorkspace snapshot",
        snap.size,
        snap.docs.map((d) => d.id),
      );
      let tasks: Task[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      tasks = tasks.sort((a, b) => {
        const aTs =
          (a as any).createdAt?.toMillis?.() ?? (a as any).createdAt ?? 0;
        const bTs =
          (b as any).createdAt?.toMillis?.() ?? (b as any).createdAt ?? 0;
        return bTs - aTs;
      });
      onChange(tasks);
    },
    (err) => {
      console.error("subscribeTasksForWorkspace onSnapshot error", err);
      // Keep last known tasks on error.
    },
  );
  return unsub;
};

export const subscribeTasksForBoard = (
  boardId: string,
  onChange: (tasks: Task[]) => void,
) => {
  // Query by boardId only and sort client-side to avoid composite index requirement.
  const q = query(collection(db, "tasks"), where("boardId", "==", boardId));
  const unsub = onSnapshot(
    q,
    (snap) => {
      console.debug(
        "subscribeTasksForBoard snapshot",
        snap.size,
        snap.docs.map((d) => d.id),
      );
      let tasks: Task[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      tasks = tasks.sort((a, b) => {
        const aTs =
          (a as any).createdAt?.toMillis?.() ?? (a as any).createdAt ?? 0;
        const bTs =
          (b as any).createdAt?.toMillis?.() ?? (b as any).createdAt ?? 0;
        return bTs - aTs;
      });
      onChange(tasks);
    },
    (err) => {
      console.error("subscribeTasksForBoard onSnapshot error", err);
      // Keep last known tasks on error.
    },
  );
  return unsub;
};

export const createTask = async (task: Partial<Task>) => {
  try {
    const ref = await addDoc(collection(db, "tasks"), {
      ...task,
      status: task.status ?? "todo",
      createdAt: serverTimestamp(),
    } as any);
    console.debug("createTask added", ref.id);

    try {
      // Read back the created document to confirm fields (assignedTo, etc.)
      const created = await getDoc(doc(db, "tasks", ref.id));
      console.debug(
        "createTask createdDoc",
        created.exists() ? created.data() : null,
      );
    } catch (e) {
      console.warn("createTask: failed to read created doc", e);
    }

    return { id: ref.id };
  } catch (e: any) {
    console.error("createTask failed", e);
    // Rethrow so callers can show a user-friendly message
    throw new Error(e?.message || "Failed to create task");
  }
};

export const updateTask = async (taskId: string, patch: Partial<Task>) => {
  const ref = doc(db, "tasks", taskId);
  await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() } as any);
};

export const deleteTask = async (taskId: string) => {
  const ref = doc(db, "tasks", taskId);
  await deleteDoc(ref);
};
