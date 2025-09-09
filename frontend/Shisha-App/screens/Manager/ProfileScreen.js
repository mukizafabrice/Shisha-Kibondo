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
  const { user, updateUser, logout } = useAuth();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    nationalId: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        nationalId: user.nationalId || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  // Debug log to check user data
  useEffect(() => {
    console.log("User data in ProfileScreen:", user);
    console.log("NationalId in user data:", user?.nationalId);
  }, [user]);

  // Force refresh user data if nationalId is missing
  useEffect(() => {
    const refreshUserData = async () => {
      if (user && !user.nationalId) {
        console.log("User data missing nationalId, attempting to refresh...");
        try {
          // You could add a method to refresh user data from server here
          // For now, we'll just log the issue
          console.log(
            "Consider logging out and logging back in to refresh user data"
          );
        } catch (error) {
          console.error("Error refreshing user data:", error);
        }
      }
    };

    refreshUserData();
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }

    // nationalId is required only if it's being changed or is empty for new validations
    // For existing users without nationalId, make it optional
    if (!formData.nationalId.trim() && !user?.nationalId) {
      newErrors.nationalId = "National ID is required";
    }

    if (isEditing && formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
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
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };

      // Only include nationalId if it's provided
      if (formData.nationalId.trim()) {
        updateData.nationalId = formData.nationalId;
      }

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await UserService.updateUser(user.id, updateData);

      // Update the auth context
      updateUser(response.user);

      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "OK",
          onPress: () => {
            setIsEditing(false);
            setFormData((prev) => ({
              ...prev,
              password: "",
              confirmPassword: "",
            }));
          },
        },
      ]);
    } catch (error) {
      console.error("Update profile error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      nationalId: user?.nationalId || "",
      password: "",
      confirmPassword: "",
    });
    setErrors({});
  };

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: logout,
      },
    ]);
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
            <Avatar.Image
              size={80}
              source={require("../../assets/logo.png")}
              style={styles.avatar}
            />
            <View style={styles.headerText}>
              <Text style={styles.userName}>{user?.name || "Manager"}</Text>
              <Text style={styles.userRole}>{user?.role || "Manager"}</Text>
            </View>
            <IconButton
              icon={isEditing ? "close" : "pencil"}
              size={24}
              onPress={isEditing ? handleCancel : () => setIsEditing(true)}
              style={styles.editButton}
            />
          </View>
        </Surface>

        {/* Personal Information */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <TextInput
              label="Full Name"
              value={formData.name}
              onChangeText={(value) => handleInputChange("name", value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.name}
              disabled={!isEditing}
              theme={{ colors: { primary: "#007AFF" } }}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <TextInput
              label="Email Address"
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              error={!!errors.email}
              disabled={!isEditing}
              theme={{ colors: { primary: "#007AFF" } }}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <TextInput
              label="Phone Number"
              value={formData.phone}
              onChangeText={(value) => handleInputChange("phone", value)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              error={!!errors.phone}
              disabled={!isEditing}
              theme={{ colors: { primary: "#007AFF" } }}
            />
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}

            <TextInput
              label="National ID"
              value={formData.nationalId}
              onChangeText={(value) => handleInputChange("nationalId", value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.nationalId}
              disabled={!isEditing}
              theme={{ colors: { primary: "#007AFF" } }}
              placeholder={
                !user?.nationalId
                  ? "Log out and log back in to load your National ID"
                  : ""
              }
            />
            {errors.nationalId && (
              <Text style={styles.errorText}>{errors.nationalId}</Text>
            )}
            {!user?.nationalId && (
              <Text style={styles.infoText}>
                Note: Your National ID is not loaded. Please log out and log
                back in to refresh your profile data.
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Security Section */}
        {isEditing && (
          <Card style={styles.securityCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>
                Change Password (Optional)
              </Text>

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
              <Text style={styles.activityText}>
                Profile last updated: Today
              </Text>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityText}>Last login: Today</Text>
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </View>
        )}

        {/* Logout Section */}
        {/* <Card style={styles.logoutCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Account Actions</Text>
            <Button
              mode="contained"
              onPress={handleLogout}
              style={styles.logoutButton}
              buttonColor="#e74c3c"
              icon="logout"
            >
              Logout
            </Button>
          </Card.Content>
        </Card> */}
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
  infoText: {
    fontSize: 12,
    color: "#007AFF",
    fontFamily: "Poppins_400Regular",
    marginBottom: 8,
    marginLeft: 4,
    fontStyle: "italic",
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
  logoutCard: {
    marginBottom: 32,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
  },
});

export default ProfileScreen;
