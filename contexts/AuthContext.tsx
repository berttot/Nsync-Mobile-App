import AsyncStorage from "@react-native-async-storage/async-storage";
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
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";

const STORAGE_KEY = "nsync_user";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  joinDate: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string; user?: User | null }>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: (tokens: {
    idToken?: string;
    accessToken?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          try {
            const userDocRef = doc(db, "users", fbUser.uid);
            const userDoc = await getDoc(userDocRef);
            const data = userDoc.exists() ? (userDoc.data() as any) : null;
            const profile: User = {
              id: fbUser.uid,
              email: fbUser.email || "",
              name: data?.name ?? fbUser.displayName ?? "",
              role: data?.role ?? "user",
              joinDate: data?.joinDate ?? new Date().toISOString(),
              avatar: data?.avatar ?? fbUser.photoURL ?? "",
            };
            setUser(profile);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
          } catch (error) {
            console.error("Error reading user profile from Firestore", error);
          }
        } else {
          setUser(null);
          AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
        }
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = cred.user;
      const userDoc = await getDoc(doc(db, "users", fbUser.uid));
      const data = userDoc.exists() ? (userDoc.data() as any) : {};
      const profile: User = {
        id: fbUser.uid,
        email: fbUser.email || email,
        name: data?.name ?? fbUser.displayName ?? "",
        role: data?.role ?? "user",
        joinDate: data?.joinDate ?? new Date().toISOString(),
        avatar: data?.avatar ?? fbUser.photoURL ?? "",
      };
      setUser(profile);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      setIsLoading(false);
      return { success: true, user: profile };
    } catch (error: any) {
      console.error("Login error", error);
      setIsLoading(false);
      return { success: false, error: error?.message ?? "Login failed" };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = cred.user;
      const profile: User = {
        id: fbUser.uid,
        email: fbUser.email || email,
        name,
        role: "user",
        joinDate: new Date().toISOString(),
        avatar: fbUser.photoURL ?? "",
      };
      await setDoc(doc(db, "users", fbUser.uid), profile);
      setUser(profile);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      console.error("Register error", error);
      setIsLoading(false);
      return { success: false, error: error?.message ?? "Registration failed" };
    }
  };

  const signInWithGoogle = async (tokens: {
    idToken?: string;
    accessToken?: string;
  }) => {
    setIsLoading(true);
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
          email: fbUser.email || "",
          name: fbUser.displayName || "",
          role: "user",
          joinDate: new Date().toISOString(),
          avatar: fbUser.photoURL || "",
        };
        await setDoc(userRef, profile);
        setUser(profile);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      }
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      console.error("Google sign-in error", error);
      setIsLoading(false);
      return {
        success: false,
        error: error?.message ?? "Google sign-in failed",
      };
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Sign out error", error);
    }
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, signInWithGoogle, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
