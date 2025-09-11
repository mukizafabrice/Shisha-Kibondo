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

const ResetPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async () => {
    if (!email || !otp || !newPassword) {
      setError("All fields are required");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await UserService.resetPassword(email, otp, newPassword);
      Alert.alert(
        "Success",
        response.message || "Password reset successfully!",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
      setEmail("");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.card}>
        {/* Optional illustration */}
        {/* <Image
          source={require("../../assets/reset-password.png")}
          style={styles.image}
          resizeMode="contain"
        /> */}

        <Title style={styles.title}>Reset Password</Title>
        <Text style={styles.subtitle}>
          Enter your email, OTP, and new password below to reset your account
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

        <TextInput
          label="OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
          outlineColor="#007AFF"
          activeOutlineColor="#004aad"
          left={<TextInput.Icon icon="key-outline" />}
        />

        <TextInput
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
          outlineColor="#007AFF"
          activeOutlineColor="#004aad"
          left={<TextInput.Icon icon="lock-outline" />}
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
            onPress={handleReset}
            style={styles.button}
            contentStyle={{ paddingVertical: 8 }}
          >
            Reset Password
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
    backgroundColor: "#E8F0FE",
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

export default ResetPasswordScreen;
