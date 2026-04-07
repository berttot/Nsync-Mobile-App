import { db } from "@/firebase";
import { Workspace, WorkspaceInvite, WorkspaceMember } from "@/types/workspace";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

const makeInviteCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

export const createWorkspace = async (name: string, ownerId: string) => {
  const wRef = await addDoc(collection(db, "workspaces"), {
    name,
    ownerId,
    createdAt: serverTimestamp(),
  } as any);

  // add membership for owner
  await addDoc(collection(db, "workspace_members"), {
    workspaceId: wRef.id,
    workspaceName: name,
    userId: ownerId,
    role: "admin",
    joinedAt: serverTimestamp(),
  } as any);

  return { success: true, id: wRef.id } as const;
};

export const getUserWorkspaceMemberships = async (userId: string) => {
  const q = query(
    collection(db, "workspace_members"),
    where("userId", "==", userId),
  );
  const snap = await getDocs(q);
  const members: WorkspaceMember[] = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
  }));
  return members;
};

export const createWorkspaceInvite = async (
  workspaceId: string,
  email: string,
  role: "admin" | "user" = "user",
  invitedBy: string = "",
) => {
  const code = makeInviteCode();
  const ref = await addDoc(collection(db, "workspace_invites"), {
    workspaceId,
    email: email.trim(),
    role,
    invitedBy,
    code,
    status: "pending",
    createdAt: serverTimestamp(),
  } as any);
  return { success: true, id: ref.id, code } as const;
};

export const subscribeWorkspaceInvites = (
  workspaceId: string,
  onChange: (invites: WorkspaceInvite[]) => void,
) => {
  const q = query(
    collection(db, "workspace_invites"),
    where("workspaceId", "==", workspaceId),
  );

  return onSnapshot(q, (snap) => {
    const invites: WorkspaceInvite[] = snap.docs
      .map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }))
      .sort((a, b) => {
        const aTs = (a.createdAt as any)?.toMillis?.() ?? a.createdAt ?? 0;
        const bTs = (b.createdAt as any)?.toMillis?.() ?? b.createdAt ?? 0;
        return bTs - aTs;
      });
    onChange(invites);
  });
};

export const revokeWorkspaceInvite = async (
  inviteId: string,
  revokedBy: string,
) => {
  await updateDoc(doc(db, "workspace_invites", inviteId), {
    status: "revoked",
    revokedAt: serverTimestamp(),
    revokedBy,
  } as any);
};

export const joinWorkspaceWithCode = async (
  userId: string,
  code: string,
  userEmail?: string,
) => {
  const normalizedCode = code.trim().toUpperCase();
  const q = query(
    collection(db, "workspace_invites"),
    where("code", "==", normalizedCode),
  );
  const snap = await getDocs(q);
  // Filter by status client-side to avoid requiring a composite index for (code,status)
  const pendingDocs = snap.docs.filter(
    (d) => (d.data() as any).status === "pending",
  );
  if (pendingDocs.length === 0)
    return { success: false, error: "Invalid or expired code" } as const;
  const docSnap = pendingDocs[0];
  const invite = docSnap.data() as any;

  if (invite.email) {
    if (!userEmail) {
      return {
        success: false,
        error: "This invite is tied to an email address",
      } as const;
    }

    if (invite.email.toLowerCase() !== userEmail.toLowerCase()) {
      return {
        success: false,
        error: "Invite not valid for this email",
      } as const;
    }
  }

  const existingMembershipQuery = query(
    collection(db, "workspace_members"),
    where("userId", "==", userId),
  );
  const existingMembershipSnap = await getDocs(existingMembershipQuery);
  const alreadyMember = existingMembershipSnap.docs.some(
    (membershipDoc) =>
      (membershipDoc.data() as any).workspaceId === invite.workspaceId,
  );

  if (alreadyMember) {
    return {
      success: false,
      error: "You are already a member of this workspace",
    } as const;
  }

  const workspace = await getWorkspaceById(invite.workspaceId);

  // create membership
  await addDoc(collection(db, "workspace_members"), {
    workspaceId: invite.workspaceId,
    workspaceName: workspace?.name ?? "Workspace",
    userId,
    role: invite.role ?? "user",
    joinedAt: serverTimestamp(),
  } as any);

  // mark invite accepted
  await updateDoc(doc(db, "workspace_invites", docSnap.id), {
    status: "accepted",
    acceptedAt: serverTimestamp(),
    acceptedBy: userId,
  } as any);

  return { success: true, workspaceId: invite.workspaceId } as const;
};

export const getWorkspaceById = async (id: string) => {
  const ref = doc(db, "workspaces", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as any) } as Workspace;
};

export const getWorkspaceMembers = async (
  workspaceId: string,
): Promise<WorkspaceMember[]> => {
  const q = query(
    collection(db, "workspace_members"),
    where("workspaceId", "==", workspaceId),
  );
  const snap = await getDocs(q);
  const members: WorkspaceMember[] = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
  }));
  return members;
};

export const subscribeWorkspaceMembers = (
  workspaceId: string,
  onChange: (members: WorkspaceMember[]) => void,
) => {
  const q = query(
    collection(db, "workspace_members"),
    where("workspaceId", "==", workspaceId),
  );

  return onSnapshot(q, (snap) => {
    const members: WorkspaceMember[] = snap.docs
      .map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }))
      .sort((a, b) => {
        const aTs = (a.joinedAt as any)?.toMillis?.() ?? a.joinedAt ?? 0;
        const bTs = (b.joinedAt as any)?.toMillis?.() ?? b.joinedAt ?? 0;
        return aTs - bTs;
      });
    onChange(members);
  });
};

export const updateMemberRole = async (
  memberId: string,
  newRole: "admin" | "user",
) => {
  try {
    await updateDoc(doc(db, "workspace_members", memberId), {
      role: newRole,
    });
    return { success: true } as const;
  } catch (error) {
    return { success: false, error: String(error) } as const;
  }
};

export const removeMember = async (memberId: string) => {
  try {
    const memberRef = doc(db, "workspace_members", memberId);
    const snap = await getDoc(memberRef);
    if (!snap.exists()) {
      return { success: false, error: "Member not found" } as const;
    }
    await deleteDoc(memberRef);
    return { success: true } as const;
  } catch (error) {
    return { success: false, error: String(error) } as const;
  }
};
