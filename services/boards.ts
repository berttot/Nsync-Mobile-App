import { db } from "@/firebase";
import { Board } from "@/types/board";
import {
    addDoc,
    collection,
    onSnapshot,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore";

export const subscribeBoardsForWorkspace = (
  workspaceId: string,
  onChange: (boards: Board[]) => void,
) => {
  // Use a single-field query and sort client-side to avoid composite index requirements.
  const q = query(
    collection(db, "boards"),
    where("workspaceId", "==", workspaceId),
  );
  const unsub = onSnapshot(q, (snap) => {
    let boards: Board[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));
    boards = boards.sort((a, b) => {
      const aTs =
        (a as any).createdAt?.toMillis?.() ?? (a as any).createdAt ?? 0;
      const bTs =
        (b as any).createdAt?.toMillis?.() ?? (b as any).createdAt ?? 0;
      return bTs - aTs;
    });
    onChange(boards);
  });
  return unsub;
};

export const subscribeBoardsForUserInWorkspace = (
  workspaceId: string,
  userId: string,
  onChange: (boards: Board[]) => void,
) => {
  // Avoid compound queries that require composite indexes by querying
  // workspace boards and filtering members client-side.
  const q = query(
    collection(db, "boards"),
    where("workspaceId", "==", workspaceId),
  );
  const unsub = onSnapshot(q, (snap) => {
    let boards: Board[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));
    boards = boards
      .filter(
        (b) =>
          Array.isArray((b as any).members) &&
          (b as any).members.includes(userId),
      )
      .sort((a, b) => {
        const aTs =
          (a as any).createdAt?.toMillis?.() ?? (a as any).createdAt ?? 0;
        const bTs =
          (b as any).createdAt?.toMillis?.() ?? (b as any).createdAt ?? 0;
        return bTs - aTs;
      });
    onChange(boards);
  });
  return unsub;
};

export const createBoard = async (board: Partial<Board>) => {
  if (!board.title?.trim()) {
    throw new Error("Board title is required");
  }
  if (!board.workspaceId) {
    throw new Error("Workspace is required");
  }

  const ref = await addDoc(collection(db, "boards"), {
    title: board.title.trim(),
    description: board.description ?? "",
    color: board.color ?? "#22C55E",
    workspaceId: board.workspaceId,
    members: Array.isArray(board.members) ? board.members : [],
    createdAt: serverTimestamp(),
  } as any);

  return { id: ref.id };
};
