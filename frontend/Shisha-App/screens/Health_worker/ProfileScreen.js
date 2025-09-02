import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useAuth } from "../../context/AuthContext";

const ProfileScreen = () => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Health Worker Profile</Text>
      {user && (
        <>
          <Text style={styles.label}>Name: {user.name}</Text>
          <Text style={styles.label}>Email: {user.email}</Text>
          <Text style={styles.label}>Phone: {user.phone}</Text>
          <Text style={styles.label}>Role: {user.role}</Text>
        </>
      )}
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

export default ProfileScreen;