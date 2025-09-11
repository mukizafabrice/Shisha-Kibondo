import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Alert,
  Image,
} from "react-native";
import {
  TextInput,
  Button,
  ActivityIndicator,
  Title,
  HelperText,
  Text,
} from "react-native-paper";
import UserService from "../services/userService";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await UserService.forgotPassword(email);
      Alert.alert("Success", response.message || "OTP sent to your email!", [
        { text: "OK", onPress: () => navigation.navigate("ResetPassword") },
      ]);
      setEmail("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.card}>
        {/* Optional logo or illustration */}
        {/* <Image
          source={require("../../assets/forgot-password.png")}
          style={styles.image}
          resizeMode="contain"
        /> */}

        <Title style={styles.title}>Forgot Password</Title>
        <Text style={styles.subtitle}>
          Enter your email address below and we'll send you an OTP to reset your
          password.
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          mode="outlined"
          outlineColor="#007AFF"
          activeOutlineColor="#004aad"
          left={<TextInput.Icon icon="email-outline" />}
        />

        {error ? <HelperText type="error">{error}</HelperText> : null}

        {loading ? (
          <ActivityIndicator
            animating={true}
            color="#007AFF"
            style={{ marginVertical: 20 }}
          />
        ) : (
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            contentStyle={{ paddingVertical: 8 }}
          >
            Send OTP
          </Button>
        )}

        {/* Back to Login */}
        <Button
          mode="text"
          onPress={() => navigation.navigate("Login")}
          style={styles.backButton}
          textColor="#007AFF"
        >
          Back to Login
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#E8F0FE", // soft blue background
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  image: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#004aad",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: "#007AFF",
  },
  backButton: {
    marginTop: 15,
    alignSelf: "center",
  },
});

export default ForgotPasswordScreen;
