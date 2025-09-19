import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Card, Button, TextInput, Chip, HelperText } from "react-native-paper";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { useAuth } from "../../context/AuthContext";
import BeneficiaryService from "../../services/beneficiaryService";

const BLUE = "#007AFF";
const beneficiaryTypes = ["pregnant", "breastfeeding", "child"];

const AddBeneficiaryScreen = ({ navigation }) => {
  const { user } = useAuth();
  console.log("User ID sent to backend:", user?.id);
  const userIdToSend = String(user.id).trim();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [formData, setFormData] = useState({
    userId: userIdToSend,
    nationalId: "",
    firstName: "",
    lastName: "",
    village: "",
    type: "",
    totalProgramDays: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nationalId.trim())
      newErrors.nationalId = "National ID is required";
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.village.trim()) newErrors.village = "Village is required";
    if (!formData.type) newErrors.type = "Beneficiary type is required";
    if (!formData.totalProgramDays || isNaN(formData.totalProgramDays))
      newErrors.totalProgramDays = "Valid total program days is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors in the form.");
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userId: String(user.id).trim(), // ✅ ensure valid ObjectId string
        nationalId: formData.nationalId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        village: formData.village,
        type: formData.type,
        totalProgramDays: Number(formData.totalProgramDays),
      };

      console.log("Payload being sent:", payload);

      await BeneficiaryService.createBeneficiary(payload);

      Alert.alert("Success", "Beneficiary added successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Create beneficiary error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || error.message || "Operation failed."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded)
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView showsVerticalScrollIndicator={false} style={styles.surface}>
        <Card style={styles.formCard}>
          <Card.Content>
            <Text style={styles.title}>Add New Beneficiary</Text>
            <TextInput
              label="National ID *"
              value={formData.nationalId}
              onChangeText={(v) => handleInputChange("nationalId", v)}
              mode="outlined"
              style={styles.input}
              error={!!errors.nationalId}
            />
            <HelperText type="error" visible={!!errors.nationalId}>
              {errors.nationalId}
            </HelperText>

            <TextInput
              label="First Name *"
              value={formData.firstName}
              onChangeText={(v) => handleInputChange("firstName", v)}
              mode="outlined"
              style={styles.input}
              error={!!errors.firstName}
            />
            <HelperText type="error" visible={!!errors.firstName}>
              {errors.firstName}
            </HelperText>

            <TextInput
              label="Last Name *"
              value={formData.lastName}
              onChangeText={(v) => handleInputChange("lastName", v)}
              mode="outlined"
              style={styles.input}
              error={!!errors.lastName}
            />
            <HelperText type="error" visible={!!errors.lastName}>
              {errors.lastName}
            </HelperText>

            <TextInput
              label="Village *"
              value={formData.village}
              onChangeText={(v) => handleInputChange("village", v)}
              mode="outlined"
              style={styles.input}
              error={!!errors.village}
            />
            <HelperText type="error" visible={!!errors.village}>
              {errors.village}
            </HelperText>

            <Text style={styles.sectionTitle}>Beneficiary Type *</Text>
            <View style={styles.typeChips}>
              {beneficiaryTypes.map((type) => (
                <Chip
                  key={type}
                  selected={formData.type === type}
                  onPress={() => handleInputChange("type", type)}
                  style={[
                    styles.typeChip,
                    formData.type === type && styles.selectedTypeChip,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Chip>
              ))}
            </View>
            <HelperText type="error" visible={!!errors.type}>
              {errors.type}
            </HelperText>

            <TextInput
              label="Total Program Days *"
              value={String(formData.totalProgramDays)}
              onChangeText={(v) =>
                handleInputChange("totalProgramDays", v.replace(/[^0-9]/g, ""))
              }
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              error={!!errors.totalProgramDays}
            />
            <HelperText type="error" visible={!!errors.totalProgramDays}>
              {errors.totalProgramDays}
            </HelperText>

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              loading={loading}
              disabled={loading}
            >
              Add Beneficiary
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  surface: { flex: 1, backgroundColor: "#e6f3ff", padding: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  formCard: { elevation: 2, marginBottom: 20, backgroundColor: "#ffffff" },
  title: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 8,
  },
  input: { marginBottom: 8, backgroundColor: "#fff" },
  typeChips: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  typeChip: { marginRight: 8, marginBottom: 8, backgroundColor: "#ecf0f1" },
  selectedTypeChip: { backgroundColor: BLUE },
  submitButton: { backgroundColor: BLUE, marginTop: 16 },
});

export default AddBeneficiaryScreen;
