import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  TextInput,
  Button,
  Chip,
  Card,
  Surface,
  IconButton,
  Appbar,
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

const UsersScreen = ({ navigation }) => {
  const { logout } = useAuth();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    nationalId: "",
    role: "umunyabuzima",
  });
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const itemsPerPage = 10;

  // Mock data for demonstration purposes
  const mockUsers = Array.from({ length: 50 }, (_, i) => ({
    _id: `id-${i}`,
    name: `User Name ${i + 1}`,
    email: `user${i + 1}@example.com`,
    phone: `+250788123${100 + i}`,
    nationalId: `1234567890${10 + i}`,
    role: i % 3 === 0 ? "manager" : "umunyabuzima",
  }));

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (selectedRole !== "All") {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [users, selectedRole, searchQuery]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRole, searchQuery]);

  const fetchUsers = async () => {
    try {
      const data = await UserService.getUsers();
      console.log("Fetched users:", data);
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers(mockUsers);
      Alert.alert(
        "Using Demo Data",
        "API not available, showing sample data for demonstration."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    Alert.alert("Delete User", "Are you sure you want to delete this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await UserService.deleteUser(userId);
            setUsers(users.filter((user) => user._id !== userId));
            Alert.alert("Success", "User deleted successfully");
          } catch (error) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  const handleEdit = (user) => {
    setIsEditMode(true);
    setEditingUserId(user._id);
    setNewUser({
      name: user.name,
      email: user.email,
      phone: user.phone,
      nationalId: user.nationalId,
      role: user.role,
    });
    setModalVisible(true);
  };

  const handleAddUsers = () => {
    setIsEditMode(false);
    setEditingUserId(null);
    setNewUser({
      name: "",
      email: "",
      phone: "",
      nationalId: "",
      role: "umunyabuzima",
    });
    setModalVisible(true);
  };

  const handleAddUserSubmit = async () => {
    if (
      !newUser.name ||
      !newUser.email ||
      !newUser.phone ||
      !newUser.nationalId
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setAddingUser(true);
    try {
      if (isEditMode) {
        await UserService.updateUser(editingUserId, newUser);
        Alert.alert("Success", "User updated successfully");
      } else {
        await UserService.addUser(newUser);
        Alert.alert("Success", "User added successfully");
      }
      setModalVisible(false);
      setIsEditMode(false);
      setEditingUserId(null);
      setNewUser({
        name: "",
        email: "",
        phone: "",
        nationalId: "",
        role: "umunyabuzima",
      });
      fetchUsers();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setAddingUser(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setIsEditMode(false);
    setEditingUserId(null);
    setNewUser({
      name: "",
      email: "",
      phone: "",
      nationalId: "",
      role: "umunyabuzima",
    });
  };

  const handleOpenDetailsModal = (user) => {
    setSelectedUserDetails(user);
    setDetailsModalVisible(true);
  };

  const roles = ["All", "manager", "umunyabuzima"];

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <Button
        mode="contained"
        onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
        style={styles.pageButton}
        buttonColor="#007AFF"
      >
        Previous
      </Button>
      <Text style={styles.pageInfo}>
        Page {currentPage} of {totalPages || 1}
      </Text>
      <Button
        mode="contained"
        onPress={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages}
        style={styles.pageButton}
        buttonColor="#007AFF"
      >
        Next
      </Button>
    </View>
  );

  const renderUserCard = ({ item }) => (
    <Card style={styles.userCard} elevation={2}>
      <Card.Content>
        <View style={styles.cardContent}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={styles.userRole}>{item.role}</Text>
          </View>
          <View style={styles.cardActions}>
            <IconButton
              icon="pencil"
              size={20}
              iconColor="#3498db"
              onPress={() => handleEdit(item)}
            />
            <IconButton
              icon="delete"
              size={20}
              iconColor="#e74c3c"
              onPress={() => handleDelete(item._id)}
            />
            <IconButton
              icon="dots-horizontal"
              size={20}
              iconColor="#2c3e50"
              onPress={() => handleOpenDetailsModal(item)}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const listHeader = () => (
    <View style={styles.headerContainer}>
      {/* Add User Button Card */}
      <Card style={styles.addUserCard}>
        <Card.Content>
          <Button
            icon="account-plus"
            mode="contained"
            onPress={handleAddUsers}
            style={styles.addUserButton}
            labelStyle={styles.addUserButtonLabel}
            buttonColor="#007AFF"
          >
            Add New User
          </Button>
        </Card.Content>
      </Card>

      {/* Search and Filter Controls */}
      <Card style={styles.controlsCard}>
        <Card.Content>
          <TextInput
            label="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            mode="outlined"
            left={<TextInput.Icon icon="magnify" />}
            right={
              searchQuery && (
                <TextInput.Icon
                  icon="close"
                  onPress={() => setSearchQuery("")}
                />
              )
            }
            style={styles.searchInput}
            theme={{ colors: { primary: "#007AFF" } }}
          />
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Filter by Role:</Text>
            <View style={styles.roleButtons}>
              {roles.map((role) => (
                <Chip
                  key={role}
                  mode={selectedRole === role ? "flat" : "outlined"}
                  onPress={() => setSelectedRole(role)}
                  style={
                    selectedRole === role ? styles.selectedChip : styles.chip
                  }
                  textStyle={
                    selectedRole === role
                      ? { color: "#fff" }
                      : { color: "#34495e" }
                  }
                >
                  {role === "All" ? "All" : role.replace("_", " ")}
                </Chip>
              ))}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Results Summary */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.resultsText}>
            Showing {paginatedUsers.length} of {filteredUsers.length} users
          </Text>
        </Card.Content>
      </Card>
    </View>
  );

  if (loading || !fontsLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Surface style={styles.container}>
      <FlatList
        data={paginatedUsers}
        renderItem={renderUserCard}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={listHeader}
        ListFooterComponent={totalPages > 1 && renderPagination()}
        ListEmptyComponent={<Text style={styles.empty}>No users found.</Text>}
        contentContainerStyle={styles.flatListContent}
      />

      {/* Add/Edit User Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditMode ? "Edit User" : "Add New User"}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                label="Name *"
                value={newUser.name}
                onChangeText={(text) => setNewUser({ ...newUser, name: text })}
                mode="outlined"
                style={styles.input}
                theme={{ colors: { primary: "#007AFF" } }}
              />
              <TextInput
                label="Email *"
                value={newUser.email}
                onChangeText={(text) => setNewUser({ ...newUser, email: text })}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                theme={{ colors: { primary: "#007AFF" } }}
              />
              <TextInput
                label="Phone *"
                value={newUser.phone}
                onChangeText={(text) => setNewUser({ ...newUser, phone: text })}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
                theme={{ colors: { primary: "#007AFF" } }}
              />
              <TextInput
                label="National ID *"
                value={newUser.nationalId}
                onChangeText={(text) =>
                  setNewUser({ ...newUser, nationalId: text })
                }
                mode="outlined"
                style={styles.input}
                theme={{ colors: { primary: "#007AFF" } }}
              />
              <TextInput
                label="Role"
                value={newUser.role}
                onChangeText={(text) => setNewUser({ ...newUser, role: text })}
                mode="outlined"
                style={styles.input}
                theme={{ colors: { primary: "#007AFF" } }}
              />
            </ScrollView>
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={handleModalClose}
                style={styles.modalButton}
                disabled={addingUser}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddUserSubmit}
                style={styles.modalButton}
                loading={addingUser}
                disabled={addingUser}
                buttonColor="#007AFF"
              >
                {addingUser
                  ? isEditMode
                    ? "Updating..."
                    : "Adding..."
                  : isEditMode
                  ? "Update User"
                  : "Add User"}
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* User Details Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={detailsModalVisible}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.detailsModalOverlay}>
          <View style={styles.detailsModalContent}>
            <IconButton
              icon="close"
              size={24}
              style={styles.closeButton}
              onPress={() => setDetailsModalVisible(false)}
            />
            {selectedUserDetails && (
              <ScrollView>
                <Text style={styles.detailsTitle}>User Details</Text>
                <View style={styles.detailsSection}>
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailText}>
                    {selectedUserDetails.name}
                  </Text>
                </View>
                <View style={styles.detailsSection}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailText}>
                    {selectedUserDetails.email}
                  </Text>
                </View>
                <View style={styles.detailsSection}>
                  <Text style={styles.detailLabel}>Phone:</Text>
                  <Text style={styles.detailText}>
                    {selectedUserDetails.phone}
                  </Text>
                </View>
                <View style={styles.detailsSection}>
                  <Text style={styles.detailLabel}>National ID:</Text>
                  <Text style={styles.detailText}>
                    {selectedUserDetails.nationalId}
                  </Text>
                </View>
                <View style={styles.detailsSection}>
                  <Text style={styles.detailLabel}>Role:</Text>
                  <Text style={styles.detailText}>
                    {selectedUserDetails.role}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  appBar: {
    backgroundColor: "#007AFF",
    elevation: 4,
  },
  appBarTitle: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
  },
  headerContainer: {
    padding: 16,
  },
  addUserCard: {
    marginBottom: 16,
    elevation: 2,
  },
  addUserButton: {
    paddingVertical: 4,
    borderRadius: 8,
  },
  addUserButtonLabel: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  controlsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  searchInput: {
    marginBottom: 12,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 8,
    color: "#34495e",
  },
  roleButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#ecf0f1",
  },
  selectedChip: {
    backgroundColor: "#007AFF",
  },
  summaryCard: {
    marginBottom: 16,
    elevation: 1,
    backgroundColor: "#e8f4fd",
  },
  summaryContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  resultsText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#5dade2",
    textAlign: "center",
    flex: 1,
  },
  flatList: {
    flexGrow: 1,
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  userCard: {
    marginBottom: 12,
    borderRadius: 8,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#2c3e50",
  },
  userEmail: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#555",
  },
  userRole: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: "#7f8c8d",
    marginTop: 4,
    textTransform: "capitalize",
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  empty: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#7f8c8d",
    padding: 40,
    fontStyle: "italic",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  pageButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  pageInfo: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#7f8c8d",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  detailsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  detailsModalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  detailsTitle: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: "#2c3e50",
    marginBottom: 20,
    textAlign: "center",
  },
  detailsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#555",
  },
  detailText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#2c3e50",
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },
});

export default UsersScreen;
