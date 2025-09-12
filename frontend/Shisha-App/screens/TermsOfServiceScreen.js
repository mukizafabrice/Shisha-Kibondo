// TermsOfServiceScreen.js
import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { Surface, Title, Paragraph } from "react-native-paper";

const TermsOfServiceScreen = () => {
  return (
    <Surface style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Title style={styles.header}>Terms of Service</Title>
        <Paragraph style={styles.paragraph}>
          By using this app, you agree to comply with the following terms and
          conditions.
        </Paragraph>

        <Title style={styles.sectionTitle}>1. Use of Service</Title>
        <Paragraph style={styles.paragraph}>
          You may use this app only for lawful purposes and in accordance with
          these Terms.
        </Paragraph>

        <Title style={styles.sectionTitle}>2. User Responsibilities</Title>
        <Paragraph style={styles.paragraph}>
          Users are responsible for the accuracy of information they provide and
          must not misuse the platform.
        </Paragraph>

        <Title style={styles.sectionTitle}>3. Limitation of Liability</Title>
        <Paragraph style={styles.paragraph}>
          We are not liable for indirect damages or issues caused by misuse of
          the app.
        </Paragraph>

        <Title style={styles.sectionTitle}>4. Updates</Title>
        <Paragraph style={styles.paragraph}>
          We reserve the right to update or modify these Terms at any time. The
          latest version will always be available in the app.
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

export default TermsOfServiceScreen;
