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
  Menu,
} from "react-native-paper";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import BeneficiaryService from "../../services/beneficiaryService";

const AddBeneficiaryScreen = ({ navigation, route }) => {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const [menuVisible, setMenuVisible] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    nationalId: "",
    firstName: "",
    lastName: "",
    village: "",
    type: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const beneficiaryTypes = ["pregnant", "breastfeeding", "child"];

  const { userId, beneficiary } = route.params || {};
  const isEditMode = !!beneficiary;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (userId) {
      setFormData((prev) => ({ ...prev, userId }));
    }
  }, [userId]);

  useEffect(() => {
    if (isEditMode && beneficiary) {
      setFormData({
        userId: beneficiary.userId || "",
        nationalId: beneficiary.nationalId || "",
        firstName: beneficiary.firstName || "",
        lastName: beneficiary.lastName || "",
        village: beneficiary.village || "",
        type: beneficiary.type || "",
      });
    }
  }, [isEditMode, beneficiary]);

  const fetchUsers = async () => {
    try {
      const UserService = require("../../services/userService").default;
      const data = await UserService.getUsers();
      // Filter to only show health workers (umunyabuzima)
      const healthWorkers = data.filter((user) => user.role === "umunyabuzima");
      setUsers(healthWorkers);
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Error", "Failed to fetch health workers. Please try again.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userId) {
      newErrors.userId = "Please assign a health worker";
    }

    if (!formData.nationalId.trim()) {
      newErrors.nationalId = "National ID is required";
    } else if (formData.nationalId.length < 10) {
      newErrors.nationalId = "National ID must be at least 10 characters";
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.village.trim()) {
      newErrors.village = "Village is required";
    }

    if (!formData.type) {
      newErrors.type = "Beneficiary type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors in the form.");
      return;
    }

    setLoading(true);
    try {
      const beneficiaryData = {
        ...formData,
      };

      let response;
      if (isEditMode) {
        response = await BeneficiaryService.updateBeneficiary(
          beneficiary._id,
          beneficiaryData
        );
        Alert.alert("Success", "Beneficiary updated successfully!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        response = await BeneficiaryService.createBeneficiary(beneficiaryData);
        Alert.alert("Success", "Beneficiary added successfully!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "adding"} beneficiary:`,
        error
      );
      Alert.alert(
        "Error",
        error.message ||
          `Failed to ${
            isEditMode ? "update" : "add"
          } beneficiary. Please try again.`
      );
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
      <ScrollView showsVerticalScrollIndicator={false} style={styles.surface}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.formCard}>
            <Card.Content>
              <Text style={styles.title}>
                {isEditMode ? "Edit Beneficiary" : "Add New Beneficiary"}
              </Text>

              {/* Assignment Section */}
              <Text style={styles.sectionTitle}>Assignment</Text>

              <View style={styles.userContainer}>
                <Text style={styles.userLabel}>Assign Health Worker *</Text>
                {loadingUsers ? (
                  <Text style={styles.loadingText}>
                    Loading health workers...
                  </Text>
                ) : (
                  <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                      <TextInput
                        mode="outlined"
                        label="Select Health Worker"
                        value={
                          users.find((u) => u._id === formData.userId)?.name ||
                          ""
                        }
                        onFocus={() => setMenuVisible(true)}
                        right={<TextInput.Icon icon="menu-down" />}
                      />
                    }
                  >
                    {users.map((user) => (
                      <Menu.Item
                        key={user._id}
                        title={user.name}
                        onPress={() => {
                          handleInputChange("userId", user._id);
                          setMenuVisible(false);
                        }}
                      />
                    ))}
                  </Menu>
                )}
                <HelperText type="error" visible={!!errors.userId}>
                  {errors.userId}
                </HelperText>
              </View>

              {/* Personal Information Section */}
              <Text style={styles.sectionTitle}>Personal Information</Text>

              <TextInput
                label="National ID *"
                value={formData.nationalId}
                onChangeText={(value) => handleInputChange("nationalId", value)}
                mode="outlined"
                style={styles.input}
                error={!!errors.nationalId}
                placeholder="Enter national ID"
              />
              <HelperText type="error" visible={!!errors.nationalId}>
                {errors.nationalId}
              </HelperText>

              <View style={styles.nameRow}>
                <View style={styles.nameInput}>
                  <TextInput
                    label="First Name *"
                    value={formData.firstName}
                    onChangeText={(value) =>
                      handleInputChange("firstName", value)
                    }
                    mode="outlined"
                    style={styles.input}
                    error={!!errors.firstName}
                    placeholder="Enter first name"
                  />
                  <HelperText type="error" visible={!!errors.firstName}>
                    {errors.firstName}
                  </HelperText>
                </View>

                <View style={styles.nameInput}>
                  <TextInput
                    label="Last Name *"
                    value={formData.lastName}
                    onChangeText={(value) =>
                      handleInputChange("lastName", value)
                    }
                    mode="outlined"
                    style={styles.input}
                    error={!!errors.lastName}
                    placeholder="Enter last name"
                  />
                  <HelperText type="error" visible={!!errors.lastName}>
                    {errors.lastName}
                  </HelperText>
                </View>
              </View>

              <TextInput
                label="Village *"
                value={formData.village}
                onChangeText={(value) => handleInputChange("village", value)}
                mode="outlined"
                style={styles.input}
                error={!!errors.village}
                placeholder="Enter village name"
              />
              <HelperText type="error" visible={!!errors.village}>
                {errors.village}
              </HelperText>

              {/* Program Information Section */}
              <Text style={styles.sectionTitle}>Program Information</Text>

              <View style={styles.typeContainer}>
                <Text style={styles.typeLabel}>Beneficiary Type *</Text>
                <View style={styles.typeChips}>
                  {beneficiaryTypes.map((type) => (
                    <Chip
                      key={type}
                      mode={formData.type === type ? "flat" : "outlined"}
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
              </View>

              {/* Helper Information */}
              <Card style={styles.helperCard}>
                <Card.Content>
                  <Text style={styles.helperTitle}>Information</Text>
                  <Text style={styles.helperText}>
                    • The beneficiary status will be set to "active" upon
                    creation.
                  </Text>
                  <Text style={styles.helperText}>
                    • Program days can be added after creating the beneficiary.
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
                  {isEditMode ? "Update Beneficiary" : "Add Beneficiary"}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </ScrollView>
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
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nameInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  typeContainer: {
    marginBottom: 16,
  },
  typeLabel: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#34495e",
    marginBottom: 8,
  },
  typeChips: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  typeChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#ecf0f1",
  },
  selectedTypeChip: {
    backgroundColor: "#007AFF",
  },
  userChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#ecf0f1",
  },
  selectedUserChip: {
    backgroundColor: "#007AFF",
  },
  userContainer: {
    marginBottom: 16,
  },
  userLabel: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#34495e",
    marginBottom: 8,
  },
  userChips: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#7f8c8d",
    fontStyle: "italic",
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

export default AddBeneficiaryScreen;
