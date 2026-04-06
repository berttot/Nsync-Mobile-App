import { db } from "@/firebase";
import { User } from "@/types/user";
import {
    addDoc,
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
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
