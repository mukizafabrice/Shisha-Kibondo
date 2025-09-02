import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Button, Card, Title, Paragraph } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";

const ManagerHomeScreen = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Image source={require('../../assets/logo.png')} style={styles.logo} />
          <Title>Welcome Manager!</Title>
          {user && (
            <>
              <Paragraph>Name: {user.name}</Paragraph>
              <Paragraph>Email: {user.email}</Paragraph>
              <Paragraph>Phone: {user.phone}</Paragraph>
              <Paragraph>Role: {user.role}</Paragraph>
            </>
          )}
          <Button mode="contained" onPress={logout} style={styles.button}>
            Logout
          </Button>
        </Card.Content>
      </Card>
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
  card: {
    width: "100%",
    maxWidth: 400,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 50,
    alignSelf: "center",
  },
  button: {
    marginTop: 20,
  },
});

export default ManagerHomeScreen;
