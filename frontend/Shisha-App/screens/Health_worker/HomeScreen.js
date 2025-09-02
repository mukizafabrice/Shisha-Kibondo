import React from "react";
import { View, Text, Button } from "react-native";
import { useAuth } from "../../context/AuthContext"; // Adjust path if needed

const HealthWorkerHomeScreen = () => {
  const { user, logout } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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

export default HealthWorkerHomeScreen;
