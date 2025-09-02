import React from "react";
import { View, Text, StyleSheet, Button, Image } from "react-native";
import { useAuth } from "../../context/AuthContext";

const SettingsScreen = () => {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Manager Settings</Text>
      <Text style={styles.label}>App Version: 1.0.0</Text>
      <Text style={styles.label}>Notifications: Enabled</Text>
      <Text style={styles.label}>Theme: Light</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: "#666",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 50,
  },
});

export default SettingsScreen;