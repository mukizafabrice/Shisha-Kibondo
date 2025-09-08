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
        <Surface style={styles.headerCard}>
          <View style={styles.headerContent}>
            <Avatar.Image
              size={80}
              source={require("../../assets/logo.png")}
              style={styles.avatar}
            />
            <View style={styles.headerText}>
              <Text style={styles.userName}>{user?.name || "Manager"}</Text>
              <Text style={styles.userRole}>{user?.role || "Manager"}</Text>
            </View>
          </View>
        </Surface>

        {/* App Settings */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>App Settings</Text>

            <List.Item
              title="Notifications"
              description="Receive push notifications"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={settings.notifications}
                  onValueChange={() => toggleSetting("notifications")}
                />
              )}
            />
            <List.Item
              title="Dark Mode"
              description="Use dark theme"
              left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <Switch
                  value={settings.darkMode}
                  onValueChange={() => toggleSetting("darkMode")}
                />
              )}
            />
            <List.Item
              title="Auto Sync"
              description="Automatically sync data"
              left={(props) => <List.Icon {...props} icon="sync" />}
              right={() => (
                <Switch
                  value={settings.autoSync}
                  onValueChange={() => toggleSetting("autoSync")}
                />
              )}
            />
            <List.Item
              title="Biometric Authentication"
              description="Use fingerprint or face ID"
              left={(props) => <List.Icon {...props} icon="fingerprint" />}
              right={() => (
                <Switch
                  value={settings.biometricAuth}
                  onValueChange={() => toggleSetting("biometricAuth")}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* User Links */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Manage Data</Text>
            <List.Item
              title="profile"
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate("Profile")} // stack screen name
            />

            <List.Item
              title="Products"
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate("health-ProductsScreen")}
            />

            <List.Item
              title="Beneficiaries"
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate("health-Beneficiaries")} // stack screen name
            />
          </Card.Content>
        </Card>

        {/* Account Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Account</Text>

            <Button
              mode="outlined"
              onPress={() =>
                Alert.alert("Help", "Contact support at support@shishaapp.com")
              }
              style={styles.actionButton}
              icon="help-circle"
            >
              Help & Support
            </Button>

            <Button
              mode="outlined"
              onPress={() =>
                Alert.alert(
                  "Privacy",
                  "Privacy policy information would be displayed here."
                )
              }
              style={styles.actionButton}
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
    backgroundColor: "#f8f9fa",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  avatar: {
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: "#2c3e50",
  },
  userRole: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#7f8c8d",
    textTransform: "capitalize",
  },
  settingsCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  infoCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  actionsCard: {
    marginBottom: 32,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: "#2c3e50",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#7f8c8d",
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#2c3e50",
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
