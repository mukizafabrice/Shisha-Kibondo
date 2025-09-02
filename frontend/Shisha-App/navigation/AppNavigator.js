import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";

// Import home screens from their folders
import ManagerHomeScreen from "../screens/Manager/HomeScreen";
import HealthWorkerHomeScreen from "../screens/Health_worker/HomeScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {!user ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : user.role === "manager" ? (
        <Stack.Screen
          name="ManagerHome"
          component={ManagerHomeScreen}
          options={{ headerShown: false }}
        />
      ) : user.role === "community_health_worker" ? (
        <Stack.Screen
          name="HealthWorkerHome"
          component={HealthWorkerHomeScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
