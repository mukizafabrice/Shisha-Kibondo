import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Card,
  Text,
  TextInput,
  Button,
  Avatar,
  Surface,
  IconButton,
  Divider,
} from "react-native-paper";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { useAuth } from "../../context/AuthContext";
import UserService from "../../services/userService";

const ProfileScreen = () => {
  const { user, updateUser } = useAuth();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  // Debug log to check user data
  useEffect(() => {
    console.log("User data in Health_worker ProfileScreen:", user);
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors in the form.");
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        password: formData.password,
      };

      const response = await UserService.updateUser(user.id, updateData);

      // Update the auth context
      updateUser(response.user);

      Alert.alert("Success", "Password updated successfully!", [
        {
          text: "OK",
          onPress: () => {
            setIsEditing(false);
            setFormData({ password: "", confirmPassword: "" });
          },
        },
      ]);
    } catch (error) {
      console.error("Update password error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to update password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ password: "", confirmPassword: "" });
    setErrors({});
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
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <Surface style={styles.headerCard}>
          <View style={styles.headerContent}>
            {/* <Avatar.Image
              size={80}
              source={require("../../assets/logo.png")}
              style={styles.avatar}
            /> */}
            <View style={styles.headerText}>
              <Text style={styles.userName}>
                {user?.name || "Health Worker"}
              </Text>
              <Text style={styles.userRole}>
                {user?.role || "Health Worker"}
              </Text>
            </View>
            <IconButton
              icon={isEditing ? "close" : "pencil"}
              size={24}
              onPress={isEditing ? handleCancel : () => setIsEditing(true)}
              style={styles.editButton}
            />
          </View>
        </Surface>

        {/* Personal Information (Read-only) */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.readOnlyField}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <Text style={styles.fieldValue}>
                {user?.name || "Not provided"}
              </Text>
            </View>

            <View style={styles.readOnlyField}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <Text style={styles.fieldValue}>
                {user?.email || "Not provided"}
              </Text>
            </View>

            <View style={styles.readOnlyField}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <Text style={styles.fieldValue}>
                {user?.phone || "Not provided"}
              </Text>
            </View>

            <View style={styles.readOnlyField}>
              <Text style={styles.fieldLabel}>National ID</Text>
              <Text style={styles.fieldValue}>
                {user?.nationalId || "Not provided"}
              </Text>
            </View>

            <Text style={styles.noteText}>
              Note: Personal information cannot be edited. Contact your
              administrator for changes.
            </Text>
          </Card.Content>
        </Card>

        {/* Password Change Section */}
        {isEditing && (
          <Card style={styles.securityCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Change Password</Text>

              <TextInput
                label="New Password"
                value={formData.password}
                onChangeText={(value) => handleInputChange("password", value)}
                mode="outlined"
                secureTextEntry
                style={styles.input}
                error={!!errors.password}
                theme={{ colors: { primary: "#007AFF" } }}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              <TextInput
                label="Confirm New Password"
                value={formData.confirmPassword}
                onChangeText={(value) =>
                  handleInputChange("confirmPassword", value)
                }
                mode="outlined"
                secureTextEntry
                style={styles.input}
                error={!!errors.confirmPassword}
                theme={{ colors: { primary: "#007AFF" } }}
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Recent Activity Section */}
        {/* <Card style={styles.activityCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityItem}>
              <Text style={styles.activityText}>Last login: Today</Text>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityText}>Account created: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}</Text>
            </View>
          </Card.Content>
        </Card> */}

        {/* Action Buttons */}
        {isEditing && (
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
              onPress={handleSave}
              style={styles.saveButton}
              loading={loading}
              disabled={loading}
              buttonColor="#007AFF"
            >
              {loading ? "Saving..." : "Update Password"}
            </Button>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
  headerCard: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  avatar: {
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: "#2c3e50",
  },
  userRole: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#7f8c8d",
    textTransform: "capitalize",
  },
  editButton: {
    margin: 0,
  },
  infoCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  securityCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  activityCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: "#2c3e50",
    marginBottom: 16,
  },
  readOnlyField: {
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: "#7f8c8d",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#2c3e50",
  },
  noteText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#7f8c8d",
    fontStyle: "italic",
    marginTop: 8,
  },
  input: {
    marginBottom: 8,
    backgroundColor: "#ffffff",
  },
  errorText: {
    fontSize: 12,
    color: "#e74c3c",
    fontFamily: "Poppins_400Regular",
    marginBottom: 8,
    marginLeft: 4,
  },
  activityItem: {
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  activityText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#34495e",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderColor: "#e74c3c",
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#007AFF",
  },
});

export default ProfileScreen;
