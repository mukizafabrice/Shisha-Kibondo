import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Card,
  Text,
  Switch,
  List,
  Avatar,
  Surface,
  Button,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoSync: true,
    biometricAuth: false,
  });

  const toggleSetting = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <LinearGradient
          colors={["#007AFF", "#0056b3"]}
          style={styles.profileCard}
        >
          <Avatar.Image
            size={100}
            source={require("../../assets/logo.png")}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user?.name || "Manager"}</Text>
          <Text style={styles.userRole}>{user?.role || "Manager"}</Text>
          <Button
            mode="outlined"
            textColor="#fff"
            style={styles.editButton}
            icon="account-edit"
            onPress={() => navigation.navigate("health-ProfileScreen")}
          >
            Edit Profile
          </Button>
        </LinearGradient>

        {/* App Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>App Settings</Text>
            <List.Item
              title="Notifications"
              description="Receive push notifications"
              left={(props) => (
                <List.Icon {...props} color="#007AFF" icon="bell" />
              )}
              right={() => (
                <Switch
                  color="#007AFF"
                  value={settings.notifications}
                  onValueChange={() => toggleSetting("notifications")}
                />
              )}
            />
            <List.Item
              title="Dark Mode"
              description="Use dark theme"
              left={(props) => (
                <List.Icon {...props} color="#007AFF" icon="theme-light-dark" />
              )}
              right={() => (
                <Switch
                  color="#007AFF"
                  value={settings.darkMode}
                  onValueChange={() => toggleSetting("darkMode")}
                />
              )}
            />
            <List.Item
              title="Auto Sync"
              description="Automatically sync data"
              left={(props) => (
                <List.Icon {...props} color="#007AFF" icon="sync" />
              )}
              right={() => (
                <Switch
                  color="#007AFF"
                  value={settings.autoSync}
                  onValueChange={() => toggleSetting("autoSync")}
                />
              )}
            />
            <List.Item
              title="Biometric Authentication"
              description="Use fingerprint or face ID"
              left={(props) => (
                <List.Icon {...props} color="#007AFF" icon="fingerprint" />
              )}
              right={() => (
                <Switch
                  color="#007AFF"
                  value={settings.biometricAuth}
                  onValueChange={() => toggleSetting("biometricAuth")}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Manage Data */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Manage Data</Text>
            {/* <List.Item
              title="Users"
              left={(props) => (
                <List.Icon {...props} color="#007AFF" icon="account-multiple" />
              )}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate("Users")}
            /> */}
            <List.Item
              title="Products"
              left={(props) => (
                <List.Icon {...props} color="#007AFF" icon="cube-outline" />
              )}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate("health-ProductsScreen")}
            />
            <List.Item
              title="Beneficiaries"
              left={(props) => (
                <List.Icon {...props} color="#007AFF" icon="account-heart" />
              )}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate("health-Beneficiaries")}
            />
          </Card.Content>
        </Card>

        {/* Account Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Account</Text>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate("HelpHealthSupport")}
              style={styles.actionButton}
              textColor="#007AFF"
              icon="help-circle"
            >
              Help & Support
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate("PrivacyHealthPolicy")}
              style={styles.actionButton}
              textColor="#007AFF"
              icon="shield-account"
            >
              Privacy Policy
            </Button>
            <Button
              mode="contained"
              onPress={handleLogout}
              style={styles.logoutButton}
              buttonColor="#e74c3c"
              icon="logout"
            >
              Logout
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
  },
  avatar: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
  userRole: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: "#dce6f9",
    marginBottom: 10,
    textTransform: "capitalize",
  },
  editButton: {
    borderColor: "#fff",
    marginTop: 8,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: "#2c3e50",
    marginBottom: 12,
  },
  actionButton: {
    marginBottom: 12,
    borderColor: "#007AFF",
  },
  logoutButton: {
    marginTop: 8,
    backgroundColor: "#e74c3c",
  },
});

export default SettingsScreen;
