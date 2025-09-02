import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import AuthService from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

const LoginScreen = ({ navigation }) => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Placeholder for the Google logo image. In a real app, you would import a local image.
  const googleLogo = "https://img.icons8.com/color/48/000000/google-logo.png";

  // ...existing code...
  const { login } = useAuth();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await login(emailOrPhone, password); // This sets user in context
      // No need for navigation.navigate("Home")
      // The navigator will automatically show HomeScreen when user is set
    } catch (error) {
      Alert.alert("Error", error.message || "An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  // ...existing code...
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await AuthService.googleSignIn();
      if (result.success) {
        Alert.alert("Success", "Google Sign-In successful!");
        // TODO: Navigate to the main part of your app.
      } else {
        Alert.alert("Error", "Google Sign-In failed.");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "An error occurred during Google Sign-In."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Navigate to a "Forgot Password" screen.
    // navigation.navigate('ForgotPassword');
    Alert.alert("Forgot Password", "Navigating to Forgot Password screen...");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Image
              source={{
                uri: "https://placehold.co/100x100/A78BFA/ffffff?text=Logo",
              }}
              style={styles.logo}
            />
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Glad to see you again 👋
              {"\n"}
              Login to your account below
            </Text>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
            >
              <Image source={{ uri: googleLogo }} style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="enter email or phone..."
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="enter password..."
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  content: {
    width: "85%",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    width: "100%",
    justifyContent: "center",
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#6A5ACD", // A nice purple color
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  forgotPasswordText: {
    color: "#6A5ACD",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 10,
  },
});

export default LoginScreen;
