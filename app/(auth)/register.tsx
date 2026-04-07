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

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const router = useRouter();
  const { register, isLoading } = useAuth();

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

  const handleSignIn = () => {
    router.push("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
});
