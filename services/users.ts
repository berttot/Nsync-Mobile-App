import { db } from "@/firebase";
import { User } from "@/types/user";
import {
    addDoc,
    collection,
    doc,
    documentId,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";

export const subscribeAllUsers = (onChange: (users: User[]) => void) => {
  const q = query(collection(db, "users"), orderBy("joinDate", "desc"));
  const unsub = onSnapshot(q, (snapshot) => {
    const users: User[] = snapshot.docs.map((d) => d.data() as User);
    onChange(users);
  });
  return unsub;
};

export const updateUserRole = async (uid: string, role: "admin" | "user") => {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { role });
};

export const createInvite = async (email: string, invitedBy: string) => {
  const ref = collection(db, "invites");
  const invite = {
    email,
    invitedBy,
    status: "pending",
    createdAt: serverTimestamp(),
  } as any;
  const docRef = await addDoc(ref, invite);
  return { id: docRef.id, ...invite };
};

export const getUsersByIds = async (userIds: string[]) => {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  if (uniqueIds.length === 0) return {} as Record<string, User>;

  const result: Record<string, User> = {};
  const chunkSize = 10;

  for (let index = 0; index < uniqueIds.length; index += chunkSize) {
    const chunk = uniqueIds.slice(index, index + chunkSize);
    const q = query(collection(db, "users"), where(documentId(), "in", chunk));
    const snap = await getDocs(q);

    snap.docs.forEach((snapshotDoc) => {
      const user = snapshotDoc.data() as User;
      result[snapshotDoc.id] = {
        ...user,
        id: snapshotDoc.id,
      };
    });
  }

  return result;
};
