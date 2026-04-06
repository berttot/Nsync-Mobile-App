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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const { login, isLoading, signInWithGoogle } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      setErrorMessage("Please fill in all fields");
      return;
    }
    setErrorMessage("");
    const result = await login(email, password);

    if (result.success) {
      const role = result.user?.role;
      if (role === "admin") {
        router.replace("/(admin)/dashboard" as any);
      } else {
        router.replace("/(user)/dashboard" as any);
      }
    } else {
      setErrorMessage(result.error || "Login failed");
    }
  };

  const handleGoogleSignIn = async () => {
    const res = await signInWithGoogle();
    if (res.success) {
      const role = res.user?.role;
      if (role === "admin") {
        router.replace("/(admin)/dashboard" as any);
      } else {
        router.replace("/(user)/dashboard" as any);
      }
    } else {
      Alert.alert("Error", res.error ?? "Google Sign-in failed");
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Forgot Password",
      "Password reset functionality will be implemented",
    );
  };

  const handleCreateAccount = () => {
    router.push("/(auth)/register");
  };

  // Add helper text for test credentials
  const showTestCredentials = () => {
    Alert.alert(
      "Test Credentials",
      "Admin: admin@nsync.com / admin123\n\nUser: john@nsync.com / user123",
      [{ text: "OK" }],
    );
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
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitleText}>
            Sign in to continue to your account
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
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

          {/* Remember Me & Forgot Password */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View
                style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
              >
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[
              styles.signInButton,
              isLoading && styles.signInButtonDisabled,
            ]}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.signInButtonText}>Sign in</Text>
            )}
          </TouchableOpacity>

          {/* OR Separator */}
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OR</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Google Sign In */}
          <TouchableOpacity
            style={[
              styles.googleSignInButton,
              isLoading && styles.signInButtonDisabled,
            ]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <View style={styles.googleButtonContent}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Create Account Link */}
        <View style={styles.createAccountContainer}>
          <Text style={styles.createAccountText}>New to NSync? </Text>
          <TouchableOpacity onPress={handleCreateAccount}>
            <Text style={styles.createAccountLink}>Create account</Text>
          </TouchableOpacity>
        </View>

        {/* Test Credentials Helper */}
        <TouchableOpacity
          style={styles.testCredentialsButton}
          onPress={showTestCredentials}
        >
          <Text style={styles.testCredentialsText}>
            🔑 Show Test Credentials
          </Text>
        </TouchableOpacity>
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
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: Colors.border.primary, // Light gray border
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary.main, // Green when checked like image
    borderColor: Colors.primary.main,
  },
  checkmark: {
    color: Colors.text.inverse, // White checkmark
    fontSize: 12,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 14,
    color: Colors.text.secondary, // Medium gray text
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.primary.main, // Green link like image
    fontWeight: "600",
  },
  signInButton: {
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
  signInButtonDisabled: {
    opacity: 0.7,
  },
  signInButtonText: {
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
  googleSignInButton: {
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
  createAccountContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  createAccountText: {
    fontSize: 14,
    color: Colors.text.secondary, // Medium gray text
  },
  createAccountLink: {
    fontSize: 14,
    color: Colors.primary.main, // Green link like image
    fontWeight: "600",
  },
  testCredentialsButton: {
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 12,
  },
  testCredentialsText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontStyle: "italic",
  },
  errorText: {
    color: "#DC2626",
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "600",
  },
});
