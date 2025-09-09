import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  Button,
  Card,
  Surface,
  IconButton,
  Chip,
  TextInput,
  Portal,
  Modal as PaperModal,
  Menu,
} from "react-native-paper";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import DistributeToUmunyabuzimaService from "../../services/distributeToUmunyabuzimaService";
// Correct Import for UserService (default export)
import UserService from "../../services/userService";
// Correct Import for ProductService (named export)
import { getAllProducts } from "../../services/ProductService.js";

const { width } = Dimensions.get("window");
const isDesktop = width > 768;

const COLUMNS = [
  { id: "user", label: "User", flex: 2 },
  { id: "product", label: "Product", flex: 2 },
  { id: "quantity", label: "Quantity", flex: 1 },
  { id: "date", label: "Date", flex: 1.5 },
  { id: "actions", label: "Actions", flex: 1.5 },
];

const UserDistributionsScreen = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDateFilter, setSelectedDateFilter] = useState("All");
  const itemsPerPage = 10;
  const dateFilters = ["All", "Today", "This Week", "This Month"];

  // Modal & form state
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [formValues, setFormValues] = useState({
    userId: "",
    productId: "",
    quantity: "",
  });
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  // State for dropdown menus
  const [isUserMenuVisible, setUserMenuVisible] = useState(false);
  const [isProductMenuVisible, setProductMenuVisible] = useState(false);

  useEffect(() => {
    fetchDistributions();
    fetchUsersProducts();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchDistributions);
    return unsubscribe;
  }, [navigation]);

  const fetchDistributions = async () => {
    setLoading(true);
    try {
      const data = await DistributeToUmunyabuzimaService.getDistributions();
      setDistributions(data.data || []);
    } catch (error) {
      console.error("Error fetching distributions:", error);
      Alert.alert("Error", "Failed to fetch distributions. Please try again.");
      setDistributions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersProducts = async () => {
    try {
      const usersData = await UserService.getUsers();
      const productsData = await getAllProducts();

      // Filter users to include only those with the role "umunyabuzima"
      const filteredUsers = usersData.filter(
        (user) => user.role === "umunyabuzima"
      );

      setUsers(filteredUsers || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error("Error fetching users/products:", error);
      Alert.alert("Error", "Failed to load user and product data.");
    }
  };

  const filteredDistributions = useMemo(() => {
    let result = distributions;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (dist) =>
          dist.userId?.name?.toLowerCase().includes(q) ||
          dist.productId?.name?.toLowerCase().includes(q)
      );
    }
    const now = new Date();
    switch (selectedDateFilter) {
      case "Today":
        result = result.filter((dist) => {
          const d = new Date(dist.createdAt);
          return (
            d.getDate() === now.getDate() &&
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );
        });
        break;
      case "This Week":
        const startOfWeek = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - now.getDay()
        );
        result = result.filter(
          (dist) => new Date(dist.createdAt) >= startOfWeek
        );
        break;
      case "This Month":
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        result = result.filter(
          (dist) => new Date(dist.createdAt) >= startOfMonth
        );
        break;
      default:
        break;
    }
    return result;
  }, [distributions, searchQuery, selectedDateFilter]);

  const paginatedDistributions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDistributions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDistributions, currentPage]);

  const totalPages = Math.ceil(filteredDistributions.length / itemsPerPage);

  useEffect(() => setCurrentPage(1), [filteredDistributions]);

  const handleDelete = async (distributionId) => {
    Alert.alert("Delete Distribution", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await DistributeToUmunyabuzimaService.deleteDistribution(
              distributionId
            );
            setDistributions(
              distributions.filter((dist) => dist._id !== distributionId)
            );
            Alert.alert("Success", "Distribution deleted successfully");
          } catch (error) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  // Open modals
  const openCreateModal = () => {
    setFormValues({ userId: "", productId: "", quantity: "" });
    setCreateModalVisible(true);
  };
  const openEditModal = (dist) => {
    setSelectedDistribution(dist);
    setFormValues({
      userId: dist.userId?._id,
      productId: dist.productId?._id,
      quantity: String(dist.quantity),
    });
    setEditModalVisible(true);
  };

  // Submit handlers
  // Inside your UserDistributionsScreen.js file

  const submitCreate = async () => {
    if (!formValues.userId || !formValues.productId || !formValues.quantity) {
      return Alert.alert("Validation Error", "All fields are required");
    }

    try {
      await DistributeToUmunyabuzimaService.createDistribution(formValues);
      setCreateModalVisible(false);
      fetchDistributions();
      setFormValues({ userId: "", productId: "", quantity: "" });
      Alert.alert("Success", "Distribution created successfully!");
    } catch (error) {
      // Access the specific backend error message and display it
      const errorMessage =
        error.response?.data?.message ||
        "An unexpected error occurred. Please try again.";
      Alert.alert("Error", errorMessage);
    }
  };

  const submitEdit = async () => {
    if (!formValues.userId || !formValues.productId || !formValues.quantity) {
      return Alert.alert("Validation Error", "All fields are required");
    }
    try {
      await DistributeToUmunyabuzimaService.updateDistribution(
        selectedDistribution._id,
        formValues
      );
      setEditModalVisible(false);
      fetchDistributions();
      setFormValues({ userId: "", productId: "", quantity: "" });
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <Button
        mode="contained"
        onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        style={styles.pageButton}
        buttonColor="#007bff"
      >
        Previous
      </Button>
      <Text style={styles.pageInfo}>
        Page {currentPage} of {totalPages || 1}
      </Text>
      <Button
        mode="contained"
        onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        style={styles.pageButton}
        buttonColor="#007bff"
      >
        Next
      </Button>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      {COLUMNS.map((col) => (
        <Text key={col.id} style={[styles.headerText, { flex: col.flex }]}>
          {col.label}
        </Text>
      ))}
    </View>
  );

  const renderRow = (item, index) => (
    <View
      key={item._id}
      style={[
        styles.distributionRow,
        index % 2 === 0 ? styles.evenRow : styles.oddRow,
      ]}
    >
      <Text style={[styles.cellText, { flex: 2 }]} numberOfLines={1}>
        {item.userId?.name}
      </Text>
      <Text style={[styles.cellText, { flex: 2 }]} numberOfLines={1}>
        {item.productId?.name}
      </Text>
      <Text style={[styles.cellText, { flex: 1, textAlign: "center" }]}>
        {item.quantity}
      </Text>
      <Text style={[styles.cellText, { flex: 1.5 }]}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
      <View style={[styles.actions, { flex: 1.5 }]}>
        <IconButton
          icon="pencil"
          size={16}
          iconColor="#3498db"
          onPress={() => openEditModal(item)}
        />
        <IconButton
          icon="delete"
          size={16}
          iconColor="#e74c3c"
          onPress={() => handleDelete(item._id)}
        />
      </View>
    </View>
  );

  if (loading || !fontsLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      {/* Buttons */}
      <Card style={styles.buttonsCard}>
        <Card.Content>
          <Button
            icon="plus"
            mode="contained"
            onPress={openCreateModal}
            style={styles.createButton}
            buttonColor="#007bff"
          >
            Add Distribution
          </Button>
        </Card.Content>
      </Card>

      {/* Search & Filters */}
      <Card style={styles.controlsCard}>
        <Card.Content>
          <TextInput
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
            style={styles.searchInput}
            placeholder="Search by user or product..."
            dense={true}
            theme={{ colors: { primary: "#007bff" } }}
          />
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Filter by Date:</Text>
            <View style={styles.filterChips}>
              {dateFilters.map((filter) => (
                <Chip
                  key={filter}
                  mode={selectedDateFilter === filter ? "flat" : "outlined"}
                  onPress={() => setSelectedDateFilter(filter)}
                  style={
                    selectedDateFilter === filter
                      ? styles.selectedChip
                      : styles.chip
                  }
                  textStyle={
                    selectedDateFilter === filter
                      ? styles.selectedChipText
                      : styles.chipText
                  }
                  compact
                  height={32}
                >
                  {filter}
                </Chip>
              ))}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Summary */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.resultsText}>
            Showing {paginatedDistributions.length} of{" "}
            {filteredDistributions.length} distributions
          </Text>
        </Card.Content>
      </Card>

      {/* Table */}
      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tableWrapper}>
            {renderHeader()}
            {paginatedDistributions.length > 0 ? (
              paginatedDistributions.map(renderRow)
            ) : (
              <Text style={styles.empty}>No distributions found</Text>
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

      {/* CREATE MODAL */}
      <Portal>
        <PaperModal
          visible={isCreateModalVisible}
          onDismiss={() => setCreateModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Create Distribution</Text>

          <Menu
            visible={isUserMenuVisible}
            onDismiss={() => setUserMenuVisible(false)}
            anchor={
              <TextInput
                label="Select User"
                value={
                  users.find((u) => u._id === formValues.userId)?.name || ""
                }
                mode="outlined"
                right={<TextInput.Icon icon="menu-down" />}
                style={{ marginBottom: 12 }}
                onPress={() => setUserMenuVisible(true)}
              />
            }
          >
            {users.map((user) => (
              <Menu.Item
                key={user._id}
                onPress={() => {
                  setFormValues({ ...formValues, userId: user._id });
                  setUserMenuVisible(false);
                }}
                title={user.name}
              />
            ))}
          </Menu>

          <Menu
            visible={isProductMenuVisible}
            onDismiss={() => setProductMenuVisible(false)}
            anchor={
              <TextInput
                label="Select Product"
                value={
                  products.find((p) => p._id === formValues.productId)?.name ||
                  ""
                }
                mode="outlined"
                right={<TextInput.Icon icon="menu-down" />}
                style={{ marginBottom: 12 }}
                onPress={() => setProductMenuVisible(true)}
              />
            }
          >
            {products.map((product) => (
              <Menu.Item
                key={product._id}
                onPress={() => {
                  setFormValues({ ...formValues, productId: product._id });
                  setProductMenuVisible(false);
                }}
                title={product.name}
              />
            ))}
          </Menu>

          <TextInput
            label="Quantity"
            value={formValues.quantity}
            onChangeText={(text) =>
              setFormValues({ ...formValues, quantity: text })
            }
            keyboardType="numeric"
            mode="outlined"
            style={{ marginBottom: 16 }}
          />

          <Button
            mode="contained"
            onPress={submitCreate}
            style={{ marginBottom: 8 }}
          >
            Save
          </Button>
          <Button mode="text" onPress={() => setCreateModalVisible(false)}>
            Cancel
          </Button>
        </PaperModal>
      </Portal>

      {/* EDIT MODAL */}
      <Portal>
        <PaperModal
          visible={isEditModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Edit Distribution</Text>

          <Menu
            visible={isUserMenuVisible}
            onDismiss={() => setUserMenuVisible(false)}
            anchor={
              <TextInput
                label="Select User"
                value={
                  users.find((u) => u._id === formValues.userId)?.name || ""
                }
                mode="outlined"
                right={<TextInput.Icon icon="menu-down" />}
                style={{ marginBottom: 12 }}
                onPress={() => setUserMenuVisible(true)}
              />
            }
          >
            {users.map((user) => (
              <Menu.Item
                key={user._id}
                onPress={() => {
                  setFormValues({ ...formValues, userId: user._id });
                  setUserMenuVisible(false);
                }}
                title={user.name}
              />
            ))}
          </Menu>

          <Menu
            visible={isProductMenuVisible}
            onDismiss={() => setProductMenuVisible(false)}
            anchor={
              <TextInput
                label="Select Product"
                value={
                  products.find((p) => p._id === formValues.productId)?.name ||
                  ""
                }
                mode="outlined"
                right={<TextInput.Icon icon="menu-down" />}
                style={{ marginBottom: 12 }}
                onPress={() => setProductMenuVisible(true)}
              />
            }
          >
            {products.map((product) => (
              <Menu.Item
                key={product._id}
                onPress={() => {
                  setFormValues({ ...formValues, productId: product._id });
                  setProductMenuVisible(false);
                }}
                title={product.name}
              />
            ))}
          </Menu>

          <TextInput
            label="Quantity"
            value={formValues.quantity}
            onChangeText={(text) =>
              setFormValues({ ...formValues, quantity: text })
            }
            keyboardType="numeric"
            mode="outlined"
            style={{ marginBottom: 16 }}
          />

          <Button
            mode="contained"
            onPress={submitEdit}
            style={{ marginBottom: 8 }}
          >
            Update
          </Button>
          <Button mode="text" onPress={() => setEditModalVisible(false)}>
            Cancel
          </Button>
        </PaperModal>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f7fa",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 16,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 14,
    color: "#34495e",
    paddingHorizontal: 16,
    paddingTop: 8,
    fontFamily: "Poppins_500Medium",
  },
  dropdownItem: {
    fontFamily: "Poppins_400Regular",
  },
  buttonsCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 8,
  },
  createButton: {
    minWidth: 150,
    borderRadius: 6,
    alignSelf: isDesktop ? "flex-start" : "stretch",
  },
  controlsCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 8,
  },
  searchInput: {
    backgroundColor: "#fff",
    height: 40,
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
  filterChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#ecf0f1",
    height: 32,
    borderColor: "#e0e0e0",
  },
  chipText: {
    color: "#34495e",
    fontFamily: "Poppins_500Medium",
  },
  selectedChip: {
    backgroundColor: "#007bff",
    height: 32,
  },
  selectedChipText: {
    color: "#fff",
    fontFamily: "Poppins_500Medium",
  },
  summaryCard: {
    marginBottom: 16,
    elevation: 1,
    backgroundColor: "#e6f3ff",
    borderRadius: 8,
  },
  resultsText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#007bff",
    textAlign: "center",
  },
  tableCard: {
    flex: 1,
    elevation: 2,
    marginBottom: 16,
    borderRadius: 8,
  },
  tableWrapper: {
    minWidth: 700,
    backgroundColor: "#fff",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#2c3e50",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerText: {
    color: "#ecf0f1",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    textAlign: "left",
  },
  distributionRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e4e8",
    alignItems: "center",
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
    color: "#2c3e50",
    flexShrink: 1,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  paginationCard: {
    marginTop: 0,
    elevation: 2,
    borderRadius: 8,
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
  empty: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#7f8c8d",
    padding: 40,
    fontStyle: "italic",
  },
});

export default UserDistributionsScreen;
