import { auth, db } from "@/firebase";
import { User } from "@/types/user";
import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    User as FirebaseUser,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithCredential,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const subscribeAuthStateChange = (
  callback: (fbUser: FirebaseUser | null) => void,
) => {
  return onAuthStateChanged(auth, callback);
};

export const getUserProfileFromFirebase = async (
  uid: string,
  fbUser?: FirebaseUser | null,
): Promise<User> => {
  const userDoc = await getDoc(doc(db, "users", uid));
  const data = userDoc.exists() ? (userDoc.data() as any) : {};
  const profile: User = {
    id: uid,
    email: fbUser?.email ?? data?.email ?? "",
    name: data?.name ?? fbUser?.displayName ?? "",
    role: (data?.role as "admin" | "user") ?? "user",
    joinDate: data?.joinDate ?? new Date().toISOString(),
    avatar: data?.avatar ?? fbUser?.photoURL ?? "",
  };
  return profile;
};

export const registerWithEmail = async (
  name: string,
  email: string,
  password: string,
  role: "admin" | "user" = "user",
) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = cred.user;
    const profile: User = {
      id: fbUser.uid,
      email: fbUser.email ?? email,
      name,
      role,
      joinDate: new Date().toISOString(),
      avatar: fbUser.photoURL ?? "",
    };
    await setDoc(doc(db, "users", fbUser.uid), profile);
    return { success: true, user: profile } as const;
  } catch (error: any) {
    console.error("registerWithEmail error", error);
    return {
      success: false,
      error: error?.message ?? "Registration failed",
    } as const;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = cred.user;
    const profile = await getUserProfileFromFirebase(fbUser.uid, fbUser);
    return { success: true, user: profile } as const;
  } catch (error: any) {
    console.error("signInWithEmail error", error);
    return { success: false, error: error?.message ?? "Login failed" } as const;
  }
};

export const signInWithGoogleTokens = async (tokens: {
  idToken?: string;
  accessToken?: string;
}) => {
  try {
    const credential = GoogleAuthProvider.credential(
      tokens.idToken ?? null,
      tokens.accessToken ?? null,
    );
    const cred = await signInWithCredential(auth, credential);
    const fbUser = cred.user;
    const userRef = doc(db, "users", fbUser.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      const profile: User = {
        id: fbUser.uid,
        email: fbUser.email ?? "",
        name: fbUser.displayName ?? "",
        role: "user",
        joinDate: new Date().toISOString(),
        avatar: fbUser.photoURL ?? "",
      };
      await setDoc(userRef, profile);
      return { success: true, user: profile } as const;
    } else {
      const profile = userDoc.data() as User;
      return { success: true, user: profile } as const;
    }
  } catch (error: any) {
    console.error("signInWithGoogleTokens error", error);
    return {
      success: false,
      error: error?.message ?? "Google sign-in failed",
    } as const;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true } as const;
  } catch (error: any) {
    console.error("signOut error", error);
    return {
      success: false,
      error: error?.message ?? "Sign out failed",
    } as const;
  }
};
