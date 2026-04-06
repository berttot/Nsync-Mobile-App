import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import {
    getAuth,
    getReactNativePersistence,
    GoogleAuthProvider,
    initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Replace the placeholders below with your Firebase project config
export const firebaseConfig = {
  //   apiKey: "YOUR_API_KEY",
  //   authDomain: "YOUR_AUTH_DOMAIN",
  //   projectId: "YOUR_PROJECT_ID",
  //   storageBucket: "YOUR_STORAGE_BUCKET",
  //   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  //   appId: "YOUR_APP_ID",
  apiKey: "AIzaSyCFFBWgWn6IEOnvx3lwixLnZxO0dvvt5wU",
  authDomain: "nysnc-43ac6.firebaseapp.com",
  projectId: "nysnc-43ac6",
  storageBucket: "nysnc-43ac6.firebasestorage.app",
  messagingSenderId: "56953312807",
  appId: "1:56953312807:web:7ee8154cfa20bc1d84a002",
};

const app = initializeApp(firebaseConfig);

// On React Native, initializeAuth with AsyncStorage persistence so auth state
// survives reloads. Fall back to getAuth for web or if initialization fails.
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
  console.debug("firebase: initializeAuth succeeded (React Native persistence enabled)");
} catch (e) {
  console.warn("firebase: initializeAuth failed, falling back to getAuth", e);
  // If initializeAuth isn't available in this environment, use getAuth
  // (web or fallback).
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  auth = getAuth(app);
}
export { auth };
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Note: For Google sign-in from Expo, obtain an ID token via `expo-auth-session`
// and pass it to `signInWithCredential(auth, GoogleAuthProvider.credential(idToken))`.
