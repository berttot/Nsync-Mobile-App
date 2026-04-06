import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const router = useRouter();
  const { register, signInWithGoogle, isLoading } = useAuth();

  const isExpoGo = Constants?.appOwnership === "expo";

  useEffect(() => {
    try {
      const proxyUri = makeRedirectUri({ useProxy: true });
      const directUri = makeRedirectUri({ useProxy: false });
      console.log("Expo redirect URIs:");
      console.log(" - proxy:", proxyUri);
      console.log(" - direct:", directUri);
      console.log(
        "NOTE: Add the 'direct' URI to your OAuth client's authorized redirect URIs in Google Cloud/Firebase.",
      );
    } catch (e) {
      console.warn("Could not build redirect URI", e);
    }
  }, []);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId:
      "777513680853-vc9j00ohf2jcvnc5pdnc7n2ft6eplrf8.apps.googleusercontent.com",
    iosClientId:
      "777513680853-vc9j00ohf2jcvnc5pdnc7n2ft6eplrf8.apps.googleusercontent.com",
    androidClientId:
      "777513680853-min2lfdfapr58obgci2njbsnegrjie79.apps.googleusercontent.com",
    webClientId:
      "777513680853-9jfr8n91ocuoudl012licook1te4eee4.apps.googleusercontent.com",
    // Use the Expo proxy redirect (HTTPS) so Google accepts the redirect URI.
    // After rebuilding, copy the "proxy" URI from app logs and add it to
    // your Web OAuth client's Authorized redirect URIs in Google Cloud.
    redirectUri: makeRedirectUri({ useProxy: true }),
    scopes: ["profile", "email"],
    responseType: "id_token",
  });

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    const role =
      adminCode && adminCode.trim() === "INITADMIN" ? "admin" : "user";
    const res = await register(
      fullName.trim(),
      email.trim(),
      password,
      role as any,
    );
    if (res.success) {
      Alert.alert("Success", "Account created successfully!");
      router.replace("/(auth)/login");
    } else {
      Alert.alert("Error", res.error ?? "Registration failed");
    }
  };

  const handleGoogleSignUp = async () => {
    // isLoading is managed by AuthContext
    try {
      // Trigger Google auth prompt using the Expo proxy (HTTPS redirect)
      const result = await promptAsync({ useProxy: true });
      if (result.type === "success") {
        const idToken = result.authentication?.idToken;
        const accessToken = result.authentication?.accessToken;
        const r = await signInWithGoogle({ idToken, accessToken });
        if (r.success) {
          Alert.alert("Success", "Signed in with Google");
          router.replace("/");
        } else {
          Alert.alert("Error", r.error ?? "Google sign-in failed");
        }
      } else {
        Alert.alert(
          "Google sign-in",
          "Google sign-in did not complete. Use demo account for testing?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Use demo",
              onPress: async () => {
                const r = await signInWithGoogle();
                if (r.success) {
                  Alert.alert("Success", "Signed in with demo account");
                  router.replace("/");
                } else {
                  Alert.alert("Error", r.error ?? "Demo sign-in failed");
                }
              },
            },
          ],
        );
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message ?? "Google sign-in failed");
    }
  };

  const handleSignIn = () => {
    router.push("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {isExpoGo && (
          <View style={styles.expoWarning}>
            <Text style={styles.expoWarningTitle}>Expo Go limitation</Text>
            <Text style={styles.expoWarningText}>
              Google Sign-In is blocked in Expo Go. Build a development client
              or run on an emulator/device to test Google OAuth.
            </Text>
            <Text style={styles.expoWarningCode}>npx expo run:android</Text>
          </View>
        )}
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>
              <Text style={styles.logoTextN}>N</Text>
              <Text style={styles.logoTextSYN}>SYN</Text>
              <Text style={styles.logoTextC}>C</Text>
            </Text>
            <View style={styles.logoUnderline} />
            <Text style={styles.logoSubtitle}>TEAM WORKSPACE</Text>
          </View>
          <Text style={styles.welcomeText}>Create Account</Text>
          <Text style={styles.subtitleText}>
            Sign up to get started with NSync
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Full Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          {/* Admin Code (optional) */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>ADMIN CODE (OPTIONAL)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter admin code to create admin account"
              placeholderTextColor="#9CA3AF"
              value={adminCode}
              onChangeText={setAdminCode}
              autoCapitalize="characters"
            />
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[
              styles.signUpButton,
              isLoading && styles.signUpButtonDisabled,
            ]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.signUpButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* OR Separator */}
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OR</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Google Sign Up */}
          <TouchableOpacity
            style={[
              styles.googleSignUpButton,
              isLoading && styles.signUpButtonDisabled,
            ]}
            onPress={handleGoogleSignUp}
            disabled={isLoading}
          >
            <View style={styles.googleButtonContent}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>Sign up with Google</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Sign In Link */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity onPress={handleSignIn}>
            <Text style={styles.signInLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Hook response handled inline when `promptAsync()` returns

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary, // White background like image
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoText: {
    fontSize: 42,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  logoTextN: {
    color: Colors.text.primary, // Dark text like image
  },
  logoTextSYN: {
    color: Colors.primary.main, // Green accent like image
  },
  logoTextC: {
    color: Colors.text.primary, // Dark text like image
  },
  logoUnderline: {
    width: 60,
    height: 3,
    backgroundColor: Colors.primary.main, // Green underline like image
    marginTop: 4,
    marginBottom: 8,
  },
  logoSubtitle: {
    fontSize: 12,
    color: Colors.text.primary, // Dark text like image
    fontWeight: "600",
    letterSpacing: 1,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text.primary, // Dark text like image
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: Colors.text.secondary, // Medium gray text
    textAlign: "center",
  },
  formSection: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.secondary, // Medium gray labels
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    height: 56,
    backgroundColor: Colors.background.secondary, // Very light gray inputs like image
    borderWidth: 1,
    borderColor: Colors.border.primary, // Light gray borders
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text.primary, // Dark text in inputs
  },
  signUpButton: {
    height: 56,
    backgroundColor: Colors.primary.main, // Green button like image
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.inverse, // White text on green button
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border.primary, // Light gray separators
  },
  separatorText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: Colors.text.secondary, // Medium gray text
  },
  googleSignUpButton: {
    height: 56,
    backgroundColor: Colors.background.primary, // White background
    borderWidth: 1,
    borderColor: Colors.border.primary, // Light gray border
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  googleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  googleIcon: {
    width: 24,
    height: 24,
    fontSize: 18,
    fontWeight: "bold",
    color: "#4285F4",
    marginRight: 12,
    textAlign: "center",
    lineHeight: 24,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary, // Dark text like image
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: {
    fontSize: 14,
    color: Colors.text.secondary, // Medium gray text
  },
  signInLink: {
    fontSize: 14,
    color: Colors.primary.main, // Green link like image
    fontWeight: "600",
  },
  expoWarning: {
    backgroundColor: "#FFF4E5",
    borderColor: "#FFDD99",
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  expoWarningTitle: {
    fontWeight: "700",
    color: "#663C00",
    marginBottom: 4,
  },
  expoWarningText: {
    color: "#663C00",
    marginBottom: 6,
  },
  expoWarningCode: {
    fontFamily: "monospace",
    backgroundColor: "#FFF8F0",
    padding: 6,
    borderRadius: 6,
    color: "#333",
  },
});
