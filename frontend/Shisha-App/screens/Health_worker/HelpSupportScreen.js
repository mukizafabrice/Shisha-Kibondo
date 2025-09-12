// HelpSupportScreen.js
import React from "react";
import { View, StyleSheet, Linking, ScrollView } from "react-native";
import {
  Surface,
  Text,
  Card,
  Title,
  Paragraph,
  Button,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

const HelpSupportScreen = () => {
  return (
    <Surface style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Title style={styles.header}>Help & Support</Title>
        <Paragraph style={styles.subText}>
          We're here to help you! Browse FAQs or contact our support team.
        </Paragraph>

        {/* FAQ Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Ionicons name="help-circle-outline" size={28} color="#007AFF" />
            <Title style={styles.cardTitle}>Frequently Asked Questions</Title>
            <Paragraph>
              • How do I reset my password?{"\n"}• How can I update my profile?
              {"\n"}• Where can I view my distribution history?
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Contact Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Ionicons name="mail-outline" size={28} color="#0F9D58" />
            <Title style={styles.cardTitle}>Contact Support</Title>
            <Paragraph>
              If you need more assistance, reach out to our support team.
            </Paragraph>
            <Button
              mode="contained"
              style={styles.button}
              onPress={() => Linking.openURL("mailto:mukizafabrice@gmail.com")}
            >
              Email Us
            </Button>
          </Card.Content>
        </Card>

        {/* Phone Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Ionicons name="call-outline" size={28} color="#DB4437" />
            <Title style={styles.cardTitle}>Call Us</Title>
            <Paragraph>
              You can also reach our support team via phone for urgent matters.
            </Paragraph>
            <Button
              mode="outlined"
              style={styles.button}
              onPress={() => Linking.openURL("tel:+250783818521")}
            >
              Call Support
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F0F2F5",
  },
  header: {
    fontSize: 24,
    marginBottom: 10,
    color: "#34495E",
    fontWeight: "600",
  },
  subText: {
    marginBottom: 20,
    fontSize: 14,
    color: "#7F8C8D",
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    marginTop: 8,
    marginBottom: 8,
    color: "#34495E",
    fontWeight: "600",
  },
  button: {
    marginTop: 10,
  },
});

export default HelpSupportScreen;
