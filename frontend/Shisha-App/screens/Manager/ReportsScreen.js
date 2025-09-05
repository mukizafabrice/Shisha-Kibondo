import React from "react";
import { View, Text, StyleSheet, FlatList, Image, Alert } from "react-native";
import { Button } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";

const ReportsScreen = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };
  const reports = [
    { id: "1", title: "Monthly Health Report", date: "2023-09-01" },
    { id: "2", title: "Community Outreach Summary", date: "2023-08-15" },
    { id: "3", title: "Worker Performance Metrics", date: "2023-08-01" },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.reportItem}>
      <Text style={styles.reportTitle}>{item.title}</Text>
      <Text style={styles.reportDate}>{item.date}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor="#e74c3c"
        icon="logout"
      >
        Logout
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  list: {
    flex: 1,
  },
  reportItem: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  reportDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 50,
  },
  logoutButton: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: "#e74c3c",
  },
});

export default ReportsScreen;
