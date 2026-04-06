import {
    DEMO_ADMIN_EMAIL,
    DEMO_ADMIN_PASSWORD,
    ENABLE_MOCK_AUTH,
} from "@/config/authConfig";
import {
    getUserProfileFromFirebase,
    registerWithEmail,
    signOut as serviceSignOut,
    signInWithEmail,
    signInWithGoogleTokens,
    subscribeAuthStateChange,
} from "@/services/auth";
import { User } from "@/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "nsync_user";

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
    role?: "admin" | "user",
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: (tokens?: {
    idToken?: string;
    accessToken?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsub = () => {};

    (async () => {
      // Try to hydrate user from AsyncStorage immediately so UI can show
      // while the Firebase auth state initializes on device.
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as User;
            setUser(parsed);
            console.debug("auth: hydrated user from AsyncStorage", parsed.id);
          } catch (e) {
            console.warn("auth: failed to parse stored user", e);
          }
        }
      } catch (e) {
        console.warn("auth: error reading AsyncStorage for user", e);
      }

      unsub = subscribeAuthStateChange(async (fbUser) => {
        console.debug("auth: state change", fbUser?.uid ?? null);
        if (fbUser) {
          try {
            const profile = await getUserProfileFromFirebase(
              fbUser.uid,
              fbUser,
            );
            console.debug("auth: loaded profile from firestore", profile);
            setUser(profile);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
          } catch (error) {
            console.error("Error reading user profile from Firestore", error);
          }
        } else {
          setUser(null);
          console.debug("auth: user signed out / no firebase user");
          AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
        }
        setIsLoading(false);
      });
    })();

    return () => unsub();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const res = await signInWithEmail(email, password);
    if (res.success && res.user) {
      setUser(res.user);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(res.user));
    }
    setIsLoading(false);
    return res;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: "admin" | "user" = "user",
  ) => {
    setIsLoading(true);
    const res = await registerWithEmail(name, email, password, role);
    if (res.success && res.user) {
      setUser(res.user);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(res.user));
    }
    setIsLoading(false);
    return res;
  };

  const signInWithGoogle = async (tokens?: {
    idToken?: string;
    accessToken?: string;
  }) => {
    setIsLoading(true);
    let res: any = { success: false };

    // Try real Google tokens first when provided
    if (tokens && (tokens.idToken || tokens.accessToken)) {
      try {
        res = await signInWithGoogleTokens(tokens);
        if (res.success && res.user) {
          setUser(res.user);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(res.user));
          setIsLoading(false);
          return res;
        }
      } catch (e) {
        console.warn("Google token signin failed, falling back if enabled", e);
      }
    }

    // If running in Expo Go or tokens were not available or token-signin failed,
    // optionally perform a mock/dev sign-in with a demo account to allow device testing.
    if (ENABLE_MOCK_AUTH) {
      try {
        const mockRes = await signInWithEmail(
          DEMO_ADMIN_EMAIL,
          DEMO_ADMIN_PASSWORD,
        );
        if (mockRes.success && mockRes.user) {
          setUser(mockRes.user);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockRes.user));
          setIsLoading(false);
          return mockRes;
        }
        res = mockRes;
      } catch (e) {
        console.warn("Mock sign-in failed", e);
      }
    }

    setIsLoading(false);
    return res;
  };

  const logout = async () => {
    const res = await serviceSignOut();
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    return res;
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
