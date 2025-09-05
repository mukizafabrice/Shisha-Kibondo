import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Card,
  Surface,
  Button,
  TextInput,
  Chip,
  HelperText,
} from "react-native-paper";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import DistributeToUmunyabuzimaService from "../../services/distributeToUmunyabuzimaService";
import UserService from "../../services/userService";

const AddDistributionScreen = ({ navigation, route }) => {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const { userId, userName, distribution, isEditMode } = route.params || {};

  const [formData, setFormData] = useState({
    quantity: "",
  });

  useEffect(() => {
    if (isEditMode && distribution) {
      setFormData({
        quantity: distribution.quantity?.toString() || "",
      });
    }
  }, [isEditMode, distribution]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      Alert.alert("Error", "No user selected for distribution");
      navigation.goBack();
    }
  }, [userId]);


  const validateForm = () => {
    const newErrors = {};

    if (!formData.quantity.trim()) {
      newErrors.quantity = "Quantity is required";
    } else {
      const quantity = parseInt(formData.quantity);
      if (isNaN(quantity) || quantity < 1) {
        newErrors.quantity = "Quantity must be a number greater than 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors in the form.");
      return;
    }

    setLoading(true);
    try {
      const distributionData = {
        userId: userId,
        quantity: parseInt(formData.quantity),
      };

      if (isEditMode) {
        await DistributeToUmunyabuzimaService.updateDistribution(distribution._id, distributionData);
        Alert.alert(
          "Success",
          "Distribution record updated successfully!",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        await DistributeToUmunyabuzimaService.createDistribution(distributionData);
        Alert.alert(
          "Success",
          "Distribution record created successfully!",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} distribution:`, error);
      Alert.alert("Error", error.message || `Failed to ${isEditMode ? 'update' : 'create'} distribution. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel",
      "Are you sure you want to cancel? All entered data will be lost.",
      [
        { text: "Continue Editing", style: "cancel" },
        {
          text: "Cancel",
          style: "destructive",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Surface style={styles.surface}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Card style={styles.formCard}>
            <Card.Content>
              <Text style={styles.title}>
                {isEditMode ? "Edit Distribution" : "Create Distribution"}
              </Text>

              {/* Selected User Info */}
              <Text style={styles.sectionTitle}>Health Worker</Text>
              <View style={styles.selectedUserContainer}>
                <Text style={styles.selectedUserText}>
                  {userName || "Selected Health Worker"}
                </Text>
              </View>

              {/* Distribution Information Section */}
              <Text style={styles.sectionTitle}>Distribution Information</Text>

              <TextInput
                label="Quantity *"
                value={formData.quantity}
                onChangeText={(value) => handleInputChange("quantity", value)}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                error={!!errors.quantity}
                placeholder="Enter quantity"
              />
              <HelperText type="error" visible={!!errors.quantity}>
                {errors.quantity}
              </HelperText>

              {/* Helper Information */}
              <Card style={styles.helperCard}>
                <Card.Content>
                  <Text style={styles.helperTitle}>Information</Text>
                  <Text style={styles.helperText}>
                    • The distribution record will be created with the current date and time.
                  </Text>
                  <Text style={styles.helperText}>
                    • Make sure the quantity is accurate before submitting.
                  </Text>
                </Card.Content>
              </Card>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={handleCancel}
                  style={styles.cancelButton}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.submitButton}
                  loading={loading}
                  disabled={loading}
                >
                  {isEditMode ? "Update Distribution" : "Create Distribution"}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </Surface>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  surface: {
    flex: 1,
    backgroundColor: "#e6f3ff",
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
  formCard: {
    elevation: 2,
    marginBottom: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: "#34495e",
    marginTop: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
    paddingBottom: 8,
  },
  input: {
    marginBottom: 4,
    backgroundColor: "#fff",
  },
  selectedUserContainer: {
    backgroundColor: "#e6f3ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedUserText: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: "#007AFF",
    textAlign: "center",
  },
  helperCard: {
    backgroundColor: "#e8f4fd",
    marginTop: 16,
    marginBottom: 24,
  },
  helperTitle: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#2980b9",
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#34495e",
    marginBottom: 4,
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderColor: "#e74c3c",
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#007AFF",
  },
});

export default AddDistributionScreen;