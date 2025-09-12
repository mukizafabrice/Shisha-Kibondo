import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import AuthService from "../services/AuthService";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

const LoginScreen = ({ navigation }) => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  return (
    <ImageBackground
      source={require("../assets/background.jpg")}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.surface}>
              <View style={styles.content}>
                <Image
                  source={require("../assets/logo.png")}
                  style={styles.logo}
                />
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>
                  Glad to see you again 👋
                  {"\n"}
                  Login to your account below
                </Text>

                <TextInput
                  label="Email or Phone"
                  value={emailOrPhone}
                  onChangeText={setEmailOrPhone}
                  autoCapitalize="none"
                  mode="outlined"
                  style={styles.input}
                  theme={{ colors: { primary: "#007AFF" } }}
                />
                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  mode="outlined"
                  style={styles.input}
                  theme={{ colors: { primary: "#007AFF" } }}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.button}
                  buttonColor="#007AFF"
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>

                <Button
                  mode="text"
                  onPress={handleForgotPassword}
                  style={styles.forgotButton}
                  textColor="#007AFF"
                >
                  Forgot Password?
                </Button>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Text
              style={styles.footerLink}
              onPress={() => navigation.navigate("AboutUs")}
            >
              About Us
            </Text>
            <Text style={styles.footerSeparator}> | </Text>
            <Text style={styles.footerSeparator}> | </Text>
            <Text
              style={styles.footerLink}
              onPress={() => navigation.navigate("TermsOfServiceScreen")}
            >
              Terms of Service
            </Text>
            <Text style={styles.footerSeparator}> | </Text>
            <Text
              style={styles.footerLink}
              onPress={() => navigation.navigate("ContactUsScreen")}
            >
              Contact Us
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  surface: {
    width: "100%",
    maxWidth: 400,
    padding: 30,
    borderRadius: 15,
    elevation: 0,
  },
  content: {
    width: "100%",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 50,
  },
  title: {
    fontSize: 32,
    fontFamily: "Poppins_700Bold",
    marginBottom: 8,
    color: "#ffffff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 35,
    lineHeight: 24,
  },
  input: {
    width: "100%",
    marginBottom: 18,
    backgroundColor: "#fff",
  },
  button: {
    width: "100%",
    marginTop: 15,
    marginBottom: 20,
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
  },
  forgotButton: {
    marginTop: 15,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    paddingBottom: 20,
    flexWrap: "wrap",
  },
  footerLink: {
    fontSize: 14,
    color: "#ffffff",
    fontFamily: "Poppins_400Regular",
    textDecorationLine: "underline",
  },
  footerSeparator: {
    fontSize: 14,
    color: "#ffffff",
    fontFamily: "Poppins_400Regular",
  },
});

export default LoginScreen;
