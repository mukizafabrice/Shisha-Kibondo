import React from "react";
import {
  View,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { MaterialCommunityIcons } from "@expo/vector-icons";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { IconButton } from "react-native-paper";
import { useAuth } from "../context/AuthContext";

// Import screens
import LoginScreen from "../screens/LoginScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import AboutUs from "../screens/AboutUsScreen";
import ContactUsScreen from "../screens/ContactUsScreen";
import TermsOfServiceScreen from "../screens/TermsOfServiceScreen";

// Manager Screens
import ManagerHomeScreen from "../screens/Manager/HomeScreen";
import ManagerSettingsScreen from "../screens/Manager/SettingsScreen";
import ManagerReportsScreen from "../screens/Manager/ReportsScreen";
import ManagerUsersScreen from "../screens/Manager/UsersScreen";
import BeneficiariesScreen from "../screens/Manager/BeneficiariesScreen";
import BeneficiaryDetailsScreen from "../screens/Manager/BeneficiaryDetailsScreen";

import AddDistributionScreen from "../screens/Manager/AddDistributionScreen";
import UserDistributionsScreen from "../screens/Manager/UserDistributionsScreen";
import StockManagementScreen from "../screens/Manager/StockManagementScreen";
import ProductsScreen from "../screens/Manager/ProductsScreen";
import ProfileScreen from "../screens/Manager/ProfileScreen";
import AddProductScreen from "../screens/Manager/AddProductScreen";
import StockTransactionsScreen from "../screens/Manager/StockTransactionsScreen";
import HelpSupportScreen from "../screens/Manager/HelpSupportScreen";
import PrivacyPolicyScreen from "../screens/Manager/PrivacyPolicyScreen";
import AddBeneficiaryScreen from "../screens/Manager/AddBeneficiaryScreen";
// Health Worker Screens
import HealthWorkerHomeScreen from "../screens/Health_worker/HomeScreen";
import HealthWorkerSettingsScreen from "../screens/Health_worker/SettingsScreen";
import HealthWorkerReportsScreen from "../screens/Health_worker/ReportsScreen";
import DistributionScreen from "../screens/Health_worker/DistributionScreen";
import StockScreen from "../screens/Health_worker/StockManagementScreen";
import AddBeneficiaryHealthScreen from "../screens/Health_worker/AddBeneficiaryScreen";
import HealthBeneficiariesScreen from "../screens/Health_worker/BeneficiariesScreen";
import HealthProductsScreen from "../screens/Health_worker/ProductsScreen";
import HealthProfileScreen from "../screens/Health_worker/ProfileScreen";
import HelpSupportHealthScreen from "../screens/Manager/HelpSupportScreen";
import PrivacyPolicyHealthScreen from "../screens/Manager/PrivacyPolicyScreen";
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
          height: 65,
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerStyle: { backgroundColor: "#007AFF" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      {/* Home Tab */}
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

      {/* Custom + Button */}
      <Tab.Screen
        name="Add"
        component={AddBeneficiaryHealthScreen}
        options={{
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              style={styles.plusButtonContainer}
              // onPress={() => Alert.alert("Add", "You pressed the + button!")}
            >
              <View style={styles.plusButton}>
                <MaterialCommunityIcons name="plus" color="#fff" size={28} />
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      {/* Settings Tab */}
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

const styles = StyleSheet.create({
  plusButtonContainer: {
    top: -15, // Lift button above tab bar
    justifyContent: "center",
    alignItems: "center",
  },
  plusButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

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
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ResetPassword"
            component={ResetPasswordScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AboutUs"
            component={AboutUs}
            options={{
              title: "About Us",
              headerStyle: { backgroundColor: "#007AFF" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "bold" },
            }}
          />
          <Stack.Screen
            name="ContactUsScreen"
            component={ContactUsScreen}
            options={{
              title: "Contact us",
              headerStyle: { backgroundColor: "#007AFF" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "bold" },
            }}
          />
          <Stack.Screen
            name="TermsOfServiceScreen"
            component={TermsOfServiceScreen}
            options={{
              title: "Terms Of Service",
              headerStyle: { backgroundColor: "#007AFF" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "bold" },
            }}
          />
        </>
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
          <Stack.Screen
            name="HelpSupport"
            component={HelpSupportScreen}
            options={{
              title: "Help & Support",
              headerStyle: { backgroundColor: "#007AFF" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "bold" },
            }}
          />
          <Stack.Screen
            name="PrivacyPolicy"
            component={PrivacyPolicyScreen}
            options={{
              title: "Privacy Policy",
              headerStyle: { backgroundColor: "#007AFF" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "bold" },
            }}
          />
          <Stack.Screen
            name="ManagerReports"
            component={ManagerReportsScreen}
            options={{
              title: "Reports",
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
          <Stack.Screen
            name="HelpHealthSupport"
            component={HelpSupportHealthScreen}
            options={{
              title: "Help & Support",
              headerStyle: { backgroundColor: "#007AFF" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "bold" },
            }}
          />
          <Stack.Screen
            name="PrivacyHealthPolicy"
            component={PrivacyPolicyHealthScreen}
            options={{
              title: "Privacy Policy",
              headerStyle: { backgroundColor: "#007AFF" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "bold" },
            }}
          />
          <Stack.Screen
            name="HealthWorkerReports"
            component={HealthWorkerReportsScreen}
            options={{
              title: "Reports",
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
