import React from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { IconButton } from "react-native-paper";
import { useAuth } from "../context/AuthContext";

// Import screens
import LoginScreen from "../screens/LoginScreen";

// Manager Screens
import ManagerHomeScreen from "../screens/Manager/HomeScreen";
import ManagerSettingsScreen from "../screens/Manager/SettingsScreen";
import ManagerReportsScreen from "../screens/Manager/ReportsScreen";
import ManagerUsersScreen from "../screens/Manager/UsersScreen";
import BeneficiariesScreen from "../screens/Manager/BeneficiariesScreen";
import BeneficiaryDetailsScreen from "../screens/Manager/BeneficiaryDetailsScreen";
import AddBeneficiaryScreen from "../screens/Manager/AddBeneficiaryScreen";
import AddDistributionScreen from "../screens/Manager/AddDistributionScreen";
import UserDistributionsScreen from "../screens/Manager/UserDistributionsScreen";
import StockManagementScreen from "../screens/Manager/StockManagementScreen";
import ProductsScreen from "../screens/Manager/ProductsScreen";
import ProfileScreen from "../screens/Manager/ProfileScreen";
import AddProductScreen from "../screens/Manager/AddProductScreen";
import StockTransactionsScreen from "../screens/Manager/StockTransactionsScreen";
// Health Worker Screens
import HealthWorkerHomeScreen from "../screens/Health_worker/HomeScreen";
import HealthWorkerSettingsScreen from "../screens/Health_worker/SettingsScreen";
import HealthWorkerReportsScreen from "../screens/Health_worker/ReportsScreen";
import DistributionScreen from "../screens/Health_worker/DistributionScreen";
import StockScreen from "../screens/Health_worker/StockManagementScreen";
import HealthBeneficiariesScreen from "../screens/Health_worker/BeneficiariesScreen";
import HealthProductsScreen from "../screens/Health_worker/ProductsScreen";
import HealthProfileScreen from "../screens/Health_worker/ProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Manager Tab Navigator ---
const ManagerTabNavigator = () => {
  const { logout } = useAuth();

  // const handleLogout = () => {
  //   Alert.alert("Logout", "Are you sure you want to logout?", [
  //     { text: "Cancel", style: "cancel" },
  //     {
  //       text: "Logout",
  //       style: "destructive",
  //       onPress: async () => {
  //         try {
  //           await logout();
  //           Alert.alert("Success", "Logged out successfully");
  //         } catch (error) {
  //           Alert.alert("Error", "Failed to logout");
  //         }
  //       },
  //     },
  //   ]);
  // };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#003d82",
        tabBarInactiveTintColor: "#007AFF",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E5EA",
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 65,
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerStyle: {
          backgroundColor: "#007AFF",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={ManagerHomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Stock"
        component={StockManagementScreen}
        options={{
          tabBarLabel: "Stock",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="warehouse"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Distribution"
        component={UserDistributionsScreen}
        options={{
          tabBarLabel: "Distribution",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="share-variant"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={ManagerSettingsScreen}
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// --- Health Worker Tab Navigator ---
const HealthWorkerTabNavigator = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            Alert.alert("Success", "Logged out successfully");
          } catch (error) {
            Alert.alert("Error", "Failed to logout");
          }
        },
      },
    ]);
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#003d82",
        tabBarInactiveTintColor: "#007AFF",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E5EA",
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 65,
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerStyle: {
          backgroundColor: "#007AFF",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HealthWorkerHomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Stock"
        component={StockScreen}
        options={{
          tabBarLabel: "Stock",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="warehouse"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={DistributionScreen}
        options={{
          tabBarLabel: "Distribution",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="share-variant"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={HealthWorkerSettingsScreen}
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// --- App Navigator ---
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
        <>
          {/* Main Tabs */}
          <Stack.Screen
            name="ManagerTabs"
            component={ManagerTabNavigator}
            options={{ headerShown: false }}
          />

          {/* Stack Screens not in tab */}
          <Stack.Screen
            name="Users"
            component={ManagerUsersScreen}
            options={{
              title: "Users",
              headerStyle: { backgroundColor: "#007AFF" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "bold" },
            }}
          />
          <Stack.Screen
            name="Beneficiaries"
            component={BeneficiariesScreen}
            options={{
              title: "Beneficiaries",
              headerStyle: { backgroundColor: "#007AFF" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "bold" },
            }}
          />
          <Stack.Screen
            name="BeneficiaryDetails"
            component={BeneficiaryDetailsScreen}
            options={{ title: "Beneficiary Details" }}
          />
          <Stack.Screen
            name="AddBeneficiary"
            component={AddBeneficiaryScreen}
            options={{ title: "Beneficiary", presentation: "modal" }}
          />
          <Stack.Screen
            name="AddDistribution"
            component={AddDistributionScreen}
            options={{ title: "Create Distribution", presentation: "modal" }}
          />
          <Stack.Screen
            name="UserDistributions"
            component={UserDistributionsScreen}
            options={{ title: "User Distributions" }}
          />
          <Stack.Screen
            name="ProductsScreen"
            component={ProductsScreen}
            options={{
              title: "Products",
              headerStyle: { backgroundColor: "#007AFF" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "bold" },
            }}
          />
          <Stack.Screen
            name="ProfileScreen"
            component={ProfileScreen}
            options={{
              title: "Edit Profile",
              headerStyle: { backgroundColor: "#007AFF" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "bold" },
            }}
          />
          <Stack.Screen
            name="AddProduct" // match the navigate call
            component={AddProductScreen}
            options={{
              title: "Add Product",
              headerStyle: { backgroundColor: "#007AFF" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "bold" },
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="StockTransactions"
            component={StockTransactionsScreen}
            options={{
              title: "Stock Transactions",
              headerStyle: { backgroundColor: "#007AFF" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "bold" },
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="HealthWorkerTabs"
            component={HealthWorkerTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="health-Beneficiaries"
            component={HealthBeneficiariesScreen}
            options={{
              title: "Beneficiaries",
              headerStyle: { backgroundColor: "#007AFF" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "bold" },
            }}
          />
          <Stack.Screen
            name="health-ProductsScreen"
            component={HealthProductsScreen}
            options={{
              title: "Products",
              headerStyle: { backgroundColor: "#007AFF" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "bold" },
            }}
          />
          <Stack.Screen
            name="health-ProfileScreen"
            component={HealthProfileScreen}
            options={{
              title: "Edit Profile",
              headerStyle: { backgroundColor: "#007AFF" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "bold" },
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
