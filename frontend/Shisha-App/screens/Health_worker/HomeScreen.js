import React from "react";
import { View, Text, Button, Image, StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext"; // Adjust path if needed

const HealthWorkerHomeScreen = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
      <Text>Welcome Community Health Worker!</Text>
      {user && (
        <>
          <Text>Name: {user.name}</Text>
          <Text>Email: {user.email}</Text>
          <Text>Phone: {user.phone}</Text>
          <Text>Role: {user.role}</Text>
        </>
      )}
      <Button title="Logout" onPress={logout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 50,
  },
});

export default HealthWorkerHomeScreen;
