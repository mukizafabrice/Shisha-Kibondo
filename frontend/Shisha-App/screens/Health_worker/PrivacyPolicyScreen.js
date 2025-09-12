// PrivacyPolicyScreen.js
import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { Surface, Title, Paragraph } from "react-native-paper";

const PrivacyPolicyScreen = () => {
  return (
    <Surface style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Title style={styles.header}>Privacy Policy</Title>
        <Paragraph style={styles.paragraph}>
          Your privacy is important to us. This Privacy Policy explains how we
          collect, use, and protect your personal information when you use our
          app.
        </Paragraph>

        <Title style={styles.sectionTitle}>1. Information We Collect</Title>
        <Paragraph style={styles.paragraph}>
          • Personal details such as your name, email, and phone number.{"\n"}•
          Usage data such as how you interact with the app.{"\n"}• Device
          information like model and operating system.
        </Paragraph>

        <Title style={styles.sectionTitle}>2. How We Use Information</Title>
        <Paragraph style={styles.paragraph}>
          We use your data to provide services, improve user experience, send
          notifications, and ensure security.
        </Paragraph>

        <Title style={styles.sectionTitle}>3. Data Sharing</Title>
        <Paragraph style={styles.paragraph}>
          We do not sell your personal data. We may share limited information
          with service providers who help us operate the app.
        </Paragraph>

        <Title style={styles.sectionTitle}>4. Security</Title>
        <Paragraph style={styles.paragraph}>
          We implement strong security measures to protect your data, but no
          system is completely secure.
        </Paragraph>

        <Title style={styles.sectionTitle}>5. Your Rights</Title>
        <Paragraph style={styles.paragraph}>
          You can request access, correction, or deletion of your personal data
          at any time by contacting our support team.
        </Paragraph>

        <Title style={styles.sectionTitle}>6. Changes to Policy</Title>
        <Paragraph style={styles.paragraph}>
          We may update this Privacy Policy occasionally. Changes will be posted
          in the app with an updated revision date.
        </Paragraph>

        <Title style={styles.sectionTitle}>7. Contact Us</Title>
        <Paragraph style={styles.paragraph}>
          If you have any questions or concerns about this Privacy Policy,
          please contact us at support@yourapp.com.
        </Paragraph>
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
    marginBottom: 12,
    color: "#34495E",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 6,
    color: "#007AFF",
    fontWeight: "600",
  },
  paragraph: {
    fontSize: 14,
    color: "#7F8C8D",
    lineHeight: 20,
    marginBottom: 10,
  },
});

export default PrivacyPolicyScreen;
