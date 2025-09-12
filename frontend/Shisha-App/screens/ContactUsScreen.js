// ContactUsScreen.js
import React from "react";
import { StyleSheet, ScrollView, Linking } from "react-native";
import { Surface, Title, Paragraph, Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

const ContactUsScreen = () => {
  return (
    <Surface style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Title style={styles.header}>Contact Us</Title>
        <Paragraph style={styles.paragraph}>
          Have questions or need support? Reach out to us via email or phone.
        </Paragraph>

        <Ionicons name="mail-outline" size={28} color="#007AFF" />
        <Paragraph style={styles.paragraph}>support@ShishaApp.com</Paragraph>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => Linking.openURL("mailto:support@yourapp.com")}
        >
          Email Us
        </Button>

        <Ionicons
          name="call-outline"
          size={28}
          color="#0F9D58"
          style={{ marginTop: 20 }}
        />
        <Paragraph style={styles.paragraph}>+250 783818521</Paragraph>
        <Button
          mode="outlined"
          style={styles.button}
          onPress={() => Linking.openURL("tel:+250783818521")}
        >
          Call Us
        </Button>
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
  paragraph: { fontSize: 14, color: "#7F8C8D", marginBottom: 10 },
  button: { marginTop: 10 },
});

export default ContactUsScreen;
