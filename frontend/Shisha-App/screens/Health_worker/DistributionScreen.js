import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
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
  const [currentPage, setCurrentPage] = useState(1);

  const { user } = useAuth();

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [products, setProducts] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
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

  const itemsPerPage = 10;

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
      Alert.alert("Error", "Failed to fetch distributions.");
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
      Alert.alert("Error", "Failed to load beneficiaries.");
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load products.");
    }
  };

  // Filtering
  const filteredDistributions = useMemo(() => {
    let filtered = distributions;
    if (selectedType !== "All") {
      filtered = filtered.filter((d) => d.beneficiaryId.type === selectedType);
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter((d) =>
        d.beneficiaryId.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [distributions, selectedType, searchQuery]);

  // Pagination
  const paginatedDistributions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDistributions.slice(start, start + itemsPerPage);
  }, [filteredDistributions, currentPage]);

  const totalPages = Math.ceil(filteredDistributions.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, searchQuery]);

  // Delete
  const handleDelete = (id) => {
    Alert.alert("Delete Distribution", "Confirm delete?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDistribution(id);
          fetchDistributions();
        },
      },
    ]);
  };

  // Add new
  const handleAddDistribution = async () => {
    if (
      !newDistribution.beneficiaryId ||
      !newDistribution.productId ||
      !newDistribution.quantityKg
    ) {
      return Alert.alert("Error", "Please fill all fields");
    }
    setAddingDistribution(true);

    try {
      await addDistribution({
        ...newDistribution,
        userId: user.id, // from AuthContext
      });
      Alert.alert("Success", "Distribution added successfully");
      setModalVisible(false);
      setNewDistribution({ beneficiaryId: "", productId: "", quantityKg: "" });
      fetchDistributions();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to add distribution");
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
              onPress={() => setModalVisible(true)}
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

        {/* Table */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tableScroll}
        >
          <View style={styles.tableWrapper}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerText, styles.nameColumn]}>
                Beneficiary
              </Text>
              <Text style={[styles.headerText, styles.typeColumn]}>Type</Text>
              <Text style={[styles.headerText, styles.productColumn]}>
                Product
              </Text>
              <Text style={[styles.headerText, styles.quantityColumn]}>
                Quantity (kg)
              </Text>
              <Text style={[styles.headerText, styles.dateColumn]}>Date</Text>
              <Text style={[styles.headerText, styles.actionsColumn]}>
                Actions
              </Text>
            </View>

            {paginatedDistributions.length > 0 ? (
              paginatedDistributions.map((d, i) => (
                <View
                  key={d._id}
                  style={[
                    styles.userRow,
                    i % 2 === 0 ? styles.evenRow : styles.oddRow,
                  ]}
                >
                  <Text style={[styles.cellText, styles.nameColumn]}>
                    {`${d.beneficiaryId.firstName} ${d.beneficiaryId.lastName}`}
                  </Text>
                  <Text style={[styles.cellText, styles.typeColumn]}>
                    {d.beneficiaryId.type}
                  </Text>
                  <Text style={[styles.cellText, styles.productColumn]}>
                    {d.productId.name}
                  </Text>
                  <Text style={[styles.cellText, styles.quantityColumn]}>
                    {d.quantityKg}
                  </Text>
                  <Text style={[styles.cellText, styles.dateColumn]}>
                    {new Date(d.distributionDate).toLocaleDateString()}
                  </Text>
                  <View style={[styles.actions, styles.actionsColumn]}>
                    <IconButton
                      icon="pencil"
                      size={18}
                      iconColor="#3498db"
                      onPress={() =>
                        navigation.navigate("EditDistribution", {
                          distribution: d,
                        })
                      }
                    />
                    <IconButton
                      icon="delete"
                      size={18}
                      iconColor="#e74c3c"
                      onPress={() => handleDelete(d._id)}
                    />
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.empty}>No distributions found</Text>
            )}
          </View>
        </ScrollView>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card style={styles.paginationCard}>
            <Card.Content style={styles.paginationContainer}>
              <Button
                mode="contained"
                onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Text style={styles.pageInfo}>
                Page {currentPage} of {totalPages || 1}
              </Text>
              <Button
                mode="contained"
                onPress={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Add Modal */}
        <Modal animationType="slide" transparent visible={modalVisible}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Distribution</Text>
              <ScrollView>
                {/* Beneficiary Dropdown */}

                {/* Beneficiary Dropdown */}
                <Text style={styles.label}>Beneficiary</Text>
                <DropDownPicker
                  open={beneficiaryOpen}
                  value={newDistribution.beneficiaryId}
                  items={beneficiaries.map((b) => ({
                    label: `${b.firstName} ${b.lastName}`.trim(), // 👈 fallback if no name
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

                {/* Product Dropdown */}
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

                {/* Quantity */}
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
                  onPress={() => setModalVisible(false)}
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
      </Surface>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: { flex: 1 },
  container: { flex: 1, padding: 16, backgroundColor: "#f8f9fa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  buttonsCard: { marginBottom: 16, elevation: 2 },
  button: { borderRadius: 6 },
  controlsCard: { marginBottom: 16, elevation: 2 },
  searchInput: { marginBottom: 12, backgroundColor: "#fff" },
  filterContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  chip: { marginRight: 6, marginBottom: 6, backgroundColor: "#ecf0f1" },
  selectedChip: { marginRight: 6, marginBottom: 6, backgroundColor: "#007AFF" },
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
  empty: { textAlign: "center", padding: 40, color: "#7f8c8d" },
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
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    marginHorizontal: 0,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  label: { fontWeight: "600", marginTop: 12, marginBottom: 4 },
  input: { marginTop: 8, backgroundColor: "#fff" },
  dropdown: { marginBottom: 16, borderColor: "#ccc" },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: { flex: 1, marginHorizontal: 8 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#2c3e50",
  },
  dropdown: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#f9f9f9", // light gray so white text shows
    marginBottom: 15,
  },
  dropdownContainer: {
    borderColor: "#ccc",
    backgroundColor: "#fff", // dropdown list background
  },
  dropdownText: {
    fontSize: 14,
    color: "#2c3e50", // dark text
  },
  placeholder: {
    color: "#888", // gray placeholder
    fontSize: 14,
  },
});

export default DistributionScreen;
