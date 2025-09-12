// AboutUsScreen.js
import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { Surface, Title, Paragraph } from "react-native-paper";

const AboutUsScreen = () => {
  return (
    <Surface style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Title style={styles.header}>About Us</Title>
        <Paragraph style={styles.paragraph}>
          Welcome to our app! We are dedicated to improving community health and
          resource distribution through technology. Our mission is to provide
          tools that empower health workers and ensure better service delivery.
        </Paragraph>

        <Paragraph style={styles.paragraph}>
          Our team is made up of passionate developers, health experts, and
          volunteers who believe in making a difference.
        </Paragraph>
      </ScrollView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F0F2F5" },
  header: {
    fontSize: 24,
    marginBottom: 12,
    color: "#34495E",
    fontWeight: "600",
  },
  paragraph: {
    fontSize: 14,
    color: "#7F8C8D",
    lineHeight: 20,
    marginBottom: 10,
  },
});

export default AboutUsScreen;
