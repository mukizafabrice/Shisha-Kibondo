import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
} from "react-native";
import {
  TextInput,
  Button,
  Chip,
  Card,
  IconButton,
  Surface,
} from "react-native-paper";
import DropDownPicker from "react-native-dropdown-picker";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

import {
  getAllDistributions,
  addDistribution,
  deleteDistribution,
} from "../../services/distributionService";
import { getAllProducts } from "../../services/ProductService";
import BeneficiaryService from "../../services/beneficiaryService";
import { useAuth } from "../../context/AuthContext";

const DistributionScreen = ({ navigation }) => {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  // Expanded card state for mobile view
  const [expandedCardId, setExpandedCardId] = useState(null);

  const { user } = useAuth();

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [products, setProducts] = useState([]);

  // Modal states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [messageModal, setMessageModal] = useState({
    visible: false,
    title: "",
    body: "",
  });

  const [newDistribution, setNewDistribution] = useState({
    beneficiaryId: "",
    productId: "",
    quantityKg: "",
  });
  const [addingDistribution, setAddingDistribution] = useState(false);

  // Dropdown state
  const [beneficiaryOpen, setBeneficiaryOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Helper function for showing messages in a modal
  const showMessage = (title, body) => {
    setMessageModal({ visible: true, title, body });
  };

  // Fetch data
  useEffect(() => {
    fetchDistributions();
    fetchBeneficiaries();
    fetchProducts();
  }, []);

  const fetchDistributions = async () => {
    try {
      const data = await getAllDistributions();
      setDistributions(data);
    } catch (error) {
      showMessage("Error", "Failed to fetch distributions.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBeneficiaries = async () => {
    try {
      const userId = user?.id;
      console.log("Fetching beneficiaries for userId:", userId);
      const data = await BeneficiaryService.getBeneficiary(userId);
      setBeneficiaries(data);
    } catch (error) {
      showMessage("Error", "Failed to load beneficiaries.");
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      showMessage("Error", "Failed to load products.");
    }
  };

  // Filtering
  const filteredDistributions = useMemo(() => {
    let filtered = distributions;
    if (selectedType !== "All") {
      filtered = filtered.filter((d) => d.beneficiaryId?.type === selectedType);
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter((d) =>
        d.beneficiaryId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [distributions, selectedType, searchQuery]);

  // Function to toggle card expansion
  const toggleExpand = (id) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  // Delete
  const handleDelete = (id) => {
    setItemToDelete(id);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDistribution(itemToDelete);
      fetchDistributions();
      setDeleteModalVisible(false);
      setItemToDelete(null);
      showMessage("Success", "Distribution deleted successfully.");
    } catch (error) {
      showMessage("Error", "Failed to delete distribution.");
    }
  };

  // Add new
  const handleAddDistribution = async () => {
    if (
      !newDistribution.beneficiaryId ||
      !newDistribution.productId ||
      !newDistribution.quantityKg
    ) {
      return showMessage("Error", "Please fill all fields");
    }
    setAddingDistribution(true);

    try {
      await addDistribution({
        ...newDistribution,
        userId: user.id, // from AuthContext
      });
      showMessage("Success", "Distribution added successfully");
      setAddModalVisible(false);
      setNewDistribution({ beneficiaryId: "", productId: "", quantityKg: "" });
      fetchDistributions();
    } catch (error) {
      showMessage("Error", error.message || "Failed to add distribution");
    } finally {
      setAddingDistribution(false);
    }
  };

  const distributionTypes = [
    "All",
    "Child",
    "Pregnant",
    "Breastfeeding",
    "Adult",
  ];

  if (loading || !fontsLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior="padding"
    >
      <Surface style={styles.container}>
        {/* Add Button */}
        <Card style={styles.buttonsCard}>
          <Card.Content>
            <Button
              icon="plus"
              mode="contained"
              buttonColor="#007AFF"
              onPress={() => setAddModalVisible(true)}
              style={styles.button}
            >
              Add Distribution
            </Button>
          </Card.Content>
        </Card>

        {/* Search + Filter */}
        <Card style={styles.controlsCard}>
          <Card.Content>
            <TextInput
              placeholder="Search by beneficiary..."
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
              theme={{ colors: { primary: "#007AFF" } }}
            />
            <View style={styles.filterContainer}>
              {distributionTypes.map((type) => (
                <Chip
                  key={type}
                  mode={selectedType === type ? "flat" : "outlined"}
                  selected={selectedType === type}
                  onPress={() => setSelectedType(type)}
                  style={
                    selectedType === type ? styles.selectedChip : styles.chip
                  }
                  compact
                >
                  {type}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Distribution List (Cards) */}
        {filteredDistributions.length > 0 ? (
          <ScrollView style={styles.stockList}>
            {filteredDistributions.map((d) => (
              <Card
                key={d._id}
                style={styles.distributionCard}
                onPress={() => toggleExpand(d._id)}
              >
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <View style={styles.titleAndValue}>
                      <Text style={styles.cardTitle}>
                        {d.productId?.name || "Product N/A"}
                      </Text>
                      <Text style={styles.cardValue}>
                        {d.quantityKg !== undefined
                          ? `${d.quantityKg} kg`
                          : "N/A"}
                      </Text>
                    </View>
                    <IconButton
                      icon={
                        expandedCardId === d._id ? "chevron-up" : "chevron-down"
                      }
                      size={20}
                      iconColor="#7f8c8d"
                      onPress={() => toggleExpand(d._id)}
                    />
                  </View>
                  {expandedCardId === d._id && (
                    <View style={styles.expandedContent}>
                      <View style={styles.cardDetails}>
                        <Text style={styles.cardLabel}>Beneficiary:</Text>
                        <Text style={styles.cardDetailValue}>
                          {`${d.beneficiaryId?.firstName} ${d.beneficiaryId?.lastName}`.trim() ||
                            "N/A"}
                        </Text>
                      </View>
                      <View style={styles.cardDetails}>
                        <Text style={styles.cardLabel}>Type:</Text>
                        <Text style={styles.cardDetailValue}>
                          {d.beneficiaryId?.type || "N/A"}
                        </Text>
                      </View>
                      <View style={styles.cardDetails}>
                        <Text style={styles.cardLabel}>Date:</Text>
                        <Text style={styles.cardDetailValue}>
                          {new Date(d.distributionDate).toLocaleDateString() ||
                            "N/A"}
                        </Text>
                      </View>
                      <View style={styles.cardDetails}>
                        <Button
                          mode="text"
                          onPress={() =>
                            navigation.navigate("EditDistribution", {
                              distribution: d,
                            })
                          }
                          labelStyle={styles.editButton}
                        >
                          Edit
                        </Button>
                        <Button
                          mode="text"
                          onPress={() => handleDelete(d._id)}
                          labelStyle={styles.deleteButton}
                        >
                          Delete
                        </Button>
                      </View>
                    </View>
                  )}
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.empty}>No distributions found.</Text>
        )}

        {/* Add Modal */}
        <Modal animationType="slide" transparent visible={addModalVisible}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Distribution</Text>
              <ScrollView>
                <Text style={styles.label}>Beneficiary</Text>
                <DropDownPicker
                  open={beneficiaryOpen}
                  value={newDistribution.beneficiaryId}
                  items={beneficiaries.map((b) => ({
                    label: `${b.firstName} ${b.lastName}`.trim(),
                    value: b._id,
                  }))}
                  setOpen={setBeneficiaryOpen}
                  setValue={(callback) =>
                    setNewDistribution((prev) => ({
                      ...prev,
                      beneficiaryId: callback(prev.beneficiaryId),
                    }))
                  }
                  placeholder="Select Beneficiary"
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  textStyle={styles.dropdownText}
                  placeholderStyle={styles.placeholder}
                  listMode="SCROLLVIEW"
                  zIndex={2000}
                  zIndexInverse={1000}
                />

                <Text style={styles.label}>Product</Text>
                <DropDownPicker
                  open={productOpen}
                  value={newDistribution.productId}
                  items={products.map((p) => ({
                    label: p.name || "Unnamed",
                    value: p._id,
                  }))}
                  setOpen={setProductOpen}
                  setValue={(callback) =>
                    setNewDistribution((prev) => ({
                      ...prev,
                      productId: callback(prev.productId),
                    }))
                  }
                  placeholder="Select Product"
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  textStyle={styles.dropdownText}
                  placeholderStyle={styles.placeholder}
                  listMode="SCROLLVIEW"
                  zIndex={1000}
                  zIndexInverse={2000}
                />

                <TextInput
                  label="Quantity (Kg)"
                  value={newDistribution.quantityKg}
                  onChangeText={(text) =>
                    setNewDistribution({ ...newDistribution, quantityKg: text })
                  }
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </ScrollView>

              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setAddModalVisible(false)}
                  style={styles.modalButton}
                  disabled={addingDistribution}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleAddDistribution}
                  style={styles.modalButton}
                  loading={addingDistribution}
                  disabled={addingDistribution}
                  buttonColor="#007AFF"
                >
                  {addingDistribution ? "Adding..." : "Add"}
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal animationType="fade" transparent visible={deleteModalVisible}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirm Deletion</Text>
              <Text style={{ textAlign: "center", marginBottom: 20 }}>
                Are you sure you want to delete this distribution?
              </Text>
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setDeleteModalVisible(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={confirmDelete}
                  style={styles.modalButton}
                  buttonColor="#e74c3c"
                >
                  Delete
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        {/* Generic Message Modal */}
        <Modal
          animationType="fade"
          transparent
          visible={messageModal.visible}
          onRequestClose={() =>
            setMessageModal({ visible: false, title: "", body: "" })
          }
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{messageModal.title}</Text>
              <Text style={{ textAlign: "center", marginBottom: 20 }}>
                {messageModal.body}
              </Text>
              <Button
                mode="contained"
                onPress={() =>
                  setMessageModal({ visible: false, title: "", body: "" })
                }
              >
                OK
              </Button>
            </View>
          </View>
        </Modal>
      </Surface>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: { flex: 1 },
  container: { flex: 1, padding: 16, backgroundColor: "#f4f6f8" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  buttonsCard: { marginBottom: 16, elevation: 2, borderRadius: 12 },
  button: { borderRadius: 6 },
  controlsCard: { marginBottom: 16, elevation: 2, borderRadius: 12 },
  searchInput: { marginBottom: 12, backgroundColor: "#fff", borderRadius: 8 },
  filterContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  chip: {
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: "#ecf0f1",
    borderRadius: 12,
  },
  selectedChip: {
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: "#007AFF",
    borderRadius: 12,
  },

  // New Styles for Cards
  distributionCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "#fff",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
  },
  titleAndValue: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 10,
  },
  cardTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#2c3e50",
  },
  cardValue: {
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    color: "#007AFF",
  },
  expandedContent: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#ecf0f1",
    paddingTop: 8,
  },
  cardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: "#7f8c8d",
  },
  cardDetailValue: {
    fontFamily: "Poppins_400Regular",
    color: "#2c3e50",
    textAlign: "right",
  },
  editButton: { color: "#3498db" },
  deleteButton: { color: "#e74c3c" },

  // Old styles that are not needed anymore
  tableScroll: { flex: 1 },
  tableWrapper: { minWidth: 700, backgroundColor: "#fff", borderRadius: 8 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#34495e",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  headerText: {
    color: "#ecf0f1",
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  userRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  evenRow: { backgroundColor: "#f8f9fa" },
  oddRow: { backgroundColor: "#fff" },
  cellText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
  },
  nameColumn: { width: 150, textAlign: "left" },
  typeColumn: { width: 100 },
  productColumn: { width: 120 },
  quantityColumn: { width: 100 },
  dateColumn: { width: 100 },
  actionsColumn: { width: 100, flexDirection: "row", justifyContent: "center" },
  actions: { flexDirection: "row" },

  // Modal Styles
  empty: {
    textAlign: "center",
    padding: 40,
    color: "#7f8c8d",
    fontFamily: "Poppins_400Regular",
  },
  paginationCard: { elevation: 2 },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageInfo: { fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  label: { fontWeight: "600", marginTop: 12, marginBottom: 4 },
  input: { marginTop: 8, backgroundColor: "#fff", borderRadius: 8 },
  dropdown: { marginBottom: 16, borderColor: "#ccc", borderRadius: 8 },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: { flex: 1, marginHorizontal: 8, borderRadius: 6 },
  dropdownContainer: {
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 14,
    color: "#2c3e50",
  },
  placeholder: {
    color: "#888",
    fontSize: 14,
  },
});

export default DistributionScreen;
