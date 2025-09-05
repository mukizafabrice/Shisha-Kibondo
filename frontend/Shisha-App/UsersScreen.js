import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Modal,
} from "react-native";
import {
  TextInput,
  Button,
  Chip,
  Card,
  Surface,
  IconButton,
  Appbar,
  Checkbox,
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
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
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
  const [addingUser, setAddingUser] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter and search users
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Filter by role
    if (selectedRole !== "All") {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    // Search by name or email
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [users, selectedRole, searchQuery]);

  // Paginate users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Reset to first page when filters change
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
      // Fallback to mock data for demonstration
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

  const handleSelectUser = (userId) => {
    setSelectedUser(prev => prev === userId ? null : userId);
  };

  const handleSelectAll = () => {
    if (selectedUser) {
      setSelectedUser(null);
    } else if (paginatedUsers.length > 0) {
      setSelectedUser(paginatedUsers[0]._id);
    }
  };

  const handleAddUsers = () => {
    setIsEditMode(false);
    setEditingUserId(null);
    setModalVisible(true);
  };

  const handleAssignBeneficiaries = () => {
    if (selectedUser) {
      navigation.navigate('Beneficiaries', { userId: selectedUser });
    }
  };

  const handleDistribute = () => {
    if (selectedUser) {
      const selectedUserData = users.find(user => user._id === selectedUser);
      navigation.navigate('UserDistributions', {
        userId: selectedUser,
        userName: selectedUserData?.name || 'Unknown User'
      });
    }
  };

  const handleAddUserSubmit = async () => {
    if (!newUser.name || !newUser.email || !newUser.phone || !newUser.nationalId) {
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
      fetchUsers(); // Refresh the users list
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


  const roles = ["All", "manager", "umunyabuzima"];

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <Button
        mode="contained"
        onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
        style={styles.pageButton}
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
      >
        Next
      </Button>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <View style={[styles.checkboxColumn]}>
        <Checkbox
          status={selectedUser ? 'checked' : 'unchecked'}
          onPress={handleSelectAll}
          color="#007AFF"
        />
      </View>
      <Text style={[styles.headerText, styles.nameColumn]}>Name</Text>
      <Text style={[styles.headerText, styles.emailColumn]}>Email</Text>
      <Text style={[styles.headerText, styles.phoneColumn]}>Phone</Text>
      <Text style={[styles.headerText, styles.idColumn]}>National ID</Text>
      <Text style={[styles.headerText, styles.roleColumn]}>Role</Text>
      <View style={[styles.actionsColumn]}>
        <Text style={styles.headerText}>Actions</Text>
      </View>
    </View>
  );

  const renderUser = ({ item, index }) => {
    console.log("renderUser called for:", item.name, "at index:", index);
    return (
      <View
        style={[
          styles.userRow,
          index % 2 === 0 ? styles.evenRow : styles.oddRow,
        ]}
      >
        <Text
          style={[styles.cellText, styles.nameColumn]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
        <Text
          style={[styles.cellText, styles.emailColumn]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.email}
        </Text>
        <Text
          style={[styles.cellText, styles.phoneColumn]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.phone}
        </Text>
        <Text
          style={[styles.cellText, styles.idColumn]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.nationalId}
        </Text>
        <Text
          style={[styles.cellText, styles.roleColumn]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.role}
        </Text>
        <View style={[styles.actions, styles.actionsColumn]}>
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            style={styles.iconButton}
          >
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item._id)}
            style={styles.iconButton}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading || !fontsLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior="padding">
      <Surface style={styles.container}>
        {/* Action Buttons */}
        <Card style={styles.buttonsCard}>
          <Card.Content>
            <View style={styles.buttonsContainer}>
              <Button icon="account-plus" mode="contained" onPress={handleAddUsers} style={styles.button} buttonColor="#007AFF">
                Add Users
              </Button>
              <Button icon="account-multiple-plus" mode="contained" onPress={handleAssignBeneficiaries} style={styles.button} buttonColor="#28a745" disabled={!selectedUser}>
                Assign Beneficiaries
              </Button>
              <Button icon="share-variant" mode="contained" onPress={handleDistribute} style={styles.button} buttonColor="#ff9800" disabled={!selectedUser}>
                Distribute
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Search and Filter Controls */}
        <Card style={styles.controlsCard}>
          <Card.Content>
            <View style={styles.searchContainer}>
              <View style={styles.searchRow}>
                <TextInput
                  label=""
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  mode="outlined"
                  left={<TextInput.Icon icon="magnify" />}
                  right={
                    searchQuery ? (
                      <TextInput.Icon
                        icon="close"
                        onPress={() => setSearchQuery("")}
                      />
                    ) : null
                  }
                  style={[styles.searchInput, searchFocused && styles.searchInputFocused]}
                  placeholder="Search users..."
                  dense={true}
                  theme={{ colors: { primary: '#007AFF' } }}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </View>
            </View>

            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Filter by Role:</Text>
              <View style={styles.roleButtons}>
                {roles.map((role) => (
                  <Chip
                    key={role}
                    mode={selectedRole === role ? "flat" : "outlined"}
                    selected={selectedRole === role}
                    onPress={() => setSelectedRole(role)}
                    style={
                      selectedRole === role ? styles.selectedChip : styles.chip
                    }
                    compact={true}
                    height={32}
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

        {/* Users Table */}
        <View style={styles.tableCard}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            <View style={styles.tableWrapper}>
              {renderHeader()}
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((item, index) => (
                  <View
                    key={item._id}
                    style={[
                      styles.userRow,
                      index % 2 === 0 ? styles.evenRow : styles.oddRow,
                    ]}
                  >
                    <View style={[styles.checkboxColumn]}>
                      <Checkbox
                        status={selectedUser === item._id ? 'checked' : 'unchecked'}
                        onPress={() => handleSelectUser(item._id)}
                        color="#007AFF"
                      />
                    </View>
                    <Text
                      style={[styles.cellText, styles.nameColumn]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[styles.cellText, styles.emailColumn]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.email}
                    </Text>
                    <Text
                      style={[styles.cellText, styles.phoneColumn]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.phone}
                    </Text>
                    <Text
                      style={[styles.cellText, styles.idColumn]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.nationalId}
                    </Text>
                    <Text
                      style={[styles.cellText, styles.roleColumn]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.role}
                    </Text>
                    <View style={[styles.actions, styles.actionsColumn]}>
                      <IconButton
                        icon="pencil"
                        size={16}
                        iconColor="#3498db"
                        onPress={() => handleEdit(item)}
                        style={styles.iconButton}
                      />
                      <IconButton
                        icon="delete"
                        size={16}
                        iconColor="#e74c3c"
                        onPress={() => handleDelete(item._id)}
                        style={styles.iconButton}
                      />
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.empty}>No users found</Text>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card style={styles.paginationCard}>
            <Card.Content>{renderPagination()}</Card.Content>
          </Card>
        )}

        {/* Add User Modal */}
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
                  theme={{ colors: { primary: '#007AFF' } }}
                />

                <TextInput
                  label="Email *"
                  value={newUser.email}
                  onChangeText={(text) => setNewUser({ ...newUser, email: text })}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  theme={{ colors: { primary: '#007AFF' } }}
                />

                <TextInput
                  label="Phone *"
                  value={newUser.phone}
                  onChangeText={(text) => setNewUser({ ...newUser, phone: text })}
                  mode="outlined"
                  keyboardType="phone-pad"
                  style={styles.input}
                  theme={{ colors: { primary: '#007AFF' } }}
                />

                <TextInput
                  label="National ID *"
                  value={newUser.nationalId}
                  onChangeText={(text) => setNewUser({ ...newUser, nationalId: text })}
                  mode="outlined"
                  style={styles.input}
                  theme={{ colors: { primary: '#007AFF' } }}
                />

                <TextInput
                  label="Role"
                  value={newUser.role}
                  onChangeText={(text) => setNewUser({ ...newUser, role: text })}
                  mode="outlined"
                  style={styles.input}
                  theme={{ colors: { primary: '#007AFF' } }}
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
                    ? (isEditMode ? "Updating..." : "Adding...")
                    : (isEditMode ? "Update User" : "Add User")
                  }
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </Surface>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#2c3e50",
  },
  buttonsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 6,
  },
  controlsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    height: 40,
  },
  searchInputFocused: {
    backgroundColor: "#e6f3ff",
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
  },
  chip: {
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: "#ecf0f1",
    height: 32,
  },
  selectedChip: {
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: "#007AFF",
    height: 32,
  },
  summaryCard: {
    marginBottom: 16,
    elevation: 1,
    backgroundColor: "#e8f4fd",
  },
  resultsText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#5dade2",
    textAlign: "center",
  },
  tableCard: {
    flex: 1,
    elevation: 2,
    marginBottom: 16,
  },
  tableContainer: {
    flex: 1,
    minHeight: 300,
  },
  horizontalScroll: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  tableWrapper: {
    minWidth: 750,
    backgroundColor: "#fff",
  },
  flatList: {
    flex: 1,
    minHeight: 200,
  },
  flatListContent: {
    flexGrow: 1,
  },
  paginationCard: {
    marginTop: 0,
    elevation: 2,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
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
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#34495e",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerText: {
    color: "#ecf0f1",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    textAlign: "center",
  },
  userRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  evenRow: {
    backgroundColor: "#f8f9fa",
  },
  oddRow: {
    backgroundColor: "#fff",
  },
  cellText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    color: "#2c3e50",
  },
  checkboxColumn: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  nameColumn: {
    width: 120,
    textAlign: "left",
  },
  emailColumn: {
    width: 150,
  },
  phoneColumn: {
    width: 100,
  },
  idColumn: {
    width: 100,
  },
  roleColumn: {
    width: 80,
  },
  actionsColumn: {
    width: 80,
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
  },
  iconButton: {
    marginHorizontal: 2,
    marginVertical: 0,
  },
  empty: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#7f8c8d",
    padding: 40,
    fontStyle: "italic",
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
});

export default UsersScreen;
