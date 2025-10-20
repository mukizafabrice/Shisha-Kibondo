import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  FlatList,
  ScrollView,
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
  updateDistribution,
  deleteDistribution,
} from "../../services/distributionService";
import { getAllProducts } from "../../services/ProductService";
import BeneficiaryService from "../../services/beneficiaryService";
import { useAuth } from "../../context/AuthContext";
import UserService from "../../services/userService";
import { Alert } from "react-native";

const DistributionScreen = () => {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [expandedCardId, setExpandedCardId] = useState(null);
  const { user } = useAuth();

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  const [form, setForm] = useState({
    beneficiaryId: "",
    productId: "",
    quantityKg: "",
  });
  const [processing, setProcessing] = useState(false);

  const [beneficiaryOpen, setBeneficiaryOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    fetchUsers();
    fetchDistributions();
    fetchProducts();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await UserService.getUsers();
      const mapped = Array.isArray(data)
        ? data.map((u) => ({ label: u.name, value: u._id }))
        : [];
      setUsers(mapped);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistributions = async () => {
    try {
      const data = await getAllDistributions();
      setDistributions(data);
    } catch (error) {
      alert("Failed to fetch distributions");
    } finally {
      setLoading(false);
    }
  };

  const fetchBeneficiaries = async (userId) => {
    if (!userId) {
      setBeneficiaries([]);
      return;
    }

    try {
      const response = await BeneficiaryService.getBeneficiary(userId);

      const beneficiariesArray = Array.isArray(response)
        ? response
        : Array.isArray(response.data)
        ? response.data
        : [];

      // Filter only admitted beneficiaries
      const admittedBeneficiaries = beneficiariesArray.filter(
        (b) => b.admissionStatus === "admitted"
      );

      const mapped = admittedBeneficiaries.map((b) => ({
        label: `${b.firstName} ${b.lastName}`.trim(),
        value: b._id,
        type: b.type,
      }));

      setBeneficiaries(mapped);
    } catch (err) {
      console.log("Error fetching beneficiaries:", err);
      setBeneficiaries([]);
      Alert.alert("Error", "Failed to fetch beneficiaries for this user");
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      const mapped = Array.isArray(data)
        ? data.map((p) => ({ label: p.name, value: p._id }))
        : [];
      setProducts(mapped);
    } catch {
      setProducts([]);
      alert("Failed to fetch products");
    }
  };

  const filteredDistributions = useMemo(() => {
    let filtered = distributions;
    if (selectedType !== "All") {
      filtered = filtered.filter(
        (d) => d.beneficiaryId?.type === selectedType.toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter((d) =>
        `${d.beneficiaryId?.firstName} ${d.beneficiaryId?.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [distributions, selectedType, searchQuery]);

  const toggleExpand = (id) =>
    setExpandedCardId(expandedCardId === id ? null : id);

  const openAddModal = () => {
    setForm({ userId: "", beneficiaryId: "", productId: "", quantityKg: "" });
    setAddModalVisible(true);
  };

  const openEditModal = (item) => {
    setItemToEdit(item);
    setForm({
      beneficiaryId: item.beneficiaryId?._id || "",
      productId: item.productId?._id || "",
      quantityKg: String(item.quantityKg),
    });
    setEditModalVisible(true);
  };

  const submitAdd = async () => {
    if (!form.beneficiaryId || !form.productId || !form.quantityKg) {
      Alert.alert("Validation", "Please fill all fields");
      return;
    }

    setProcessing(true);
    try {
      await addDistribution({ ...form });
      setAddModalVisible(false);
      fetchDistributions();
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to add distribution");
    } finally {
      setProcessing(false);
    }
  };

  const submitEdit = async () => {
    if (!form.beneficiaryId || !form.productId || !form.quantityKg) {
      Alert.alert("Validation", "Please fill all fields");
      return;
    }

    setProcessing(true);
    try {
      await updateDistribution(itemToEdit._id, form);
      setEditModalVisible(false);
      fetchDistributions();
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to update distribution");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this distribution?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDistribution(id);
              fetchDistributions();
            } catch {
              alert("Failed to delete distribution");
            }
          },
        },
      ]
    );
  };

  if (loading || !fontsLoaded)
    return (
      <ActivityIndicator style={{ flex: 1 }} size="large" color="#007AFF" />
    );

  const ListHeader = () => (
    <View>
      <Card style={styles.buttonsCard}>
        <Card.Content>
          <Button
            icon="plus"
            mode="contained"
            buttonColor="#007AFF"
            onPress={openAddModal}
          >
            Add Distribution
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.controlsCard}>
        <Card.Content>
          <TextInput
            placeholder="Search by beneficiary..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            mode="outlined"
            left={<TextInput.Icon icon="magnify" />}
          />
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}
          >
            {["All", "Child", "Pregnant", "Breastfeeding"].map((type) => (
              <Chip
                key={type}
                mode={selectedType === type ? "flat" : "outlined"}
                selected={selectedType === type}
                onPress={() => setSelectedType(type)}
                style={
                  selectedType === type ? styles.selectedChip : styles.chip
                }
              >
                {type}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <Surface style={styles.container}>
        <FlatList
          data={filteredDistributions}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={ListHeader}
          renderItem={({ item }) => (
            <Card style={styles.distributionCard}>
              <Card.Content style={styles.cardContent}>
                {/* Main Card Content (smaller header) */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.productId?.name || "N/A"}
                    </Text>
                    <Text style={styles.cardSubtitle} numberOfLines={1}>
                      {item.beneficiaryId?.firstName || "N/A"}{" "}
                      {item.beneficiaryId?.lastName || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.cardRightContent}>
                    <Text style={styles.cardValue} numberOfLines={1}>
                      {item.quantityKg} Kg
                    </Text>
                    <IconButton
                      icon={
                        expandedCardId === item._id
                          ? "chevron-up"
                          : "chevron-down"
                      }
                      size={20}
                      color="#007AFF"
                      onPress={() => toggleExpand(item._id)}
                      style={styles.expandIcon}
                    />
                  </View>
                </View>

                {/* Expanded Content with a divider */}
                {expandedCardId === item._id && (
                  <View style={styles.expandedContent}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Beneficiary Type:</Text>
                      <Text style={styles.detailValue}>
                        {item.beneficiaryId?.type || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Date:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(item.distributionDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.actions}>
                      <IconButton
                        icon="pencil"
                        color="#f39c12"
                        size={24}
                        onPress={() => openEditModal(item)}
                      />
                      <IconButton
                        icon="delete"
                        color="#e74c3c"
                        size={24}
                        onPress={() => handleDelete(item._id)}
                      />
                    </View>
                  </View>
                )}
              </Card.Content>
            </Card>
          )}
        />
        <Modal transparent visible={addModalVisible}>
          <ScrollView contentContainerStyle={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Distribution</Text>
              <Text style={styles.inputLabel}>Health Worker</Text>
              <DropDownPicker
                open={userOpen}
                value={form.userId}
                items={users || []}
                setOpen={setUserOpen}
                setValue={(callback) => {
                  setForm((prev) => {
                    const newUserId = callback(prev.userId);
                    fetchBeneficiaries(newUserId);
                    return { ...prev, userId: newUserId, beneficiaryId: "" };
                  });
                }}
                placeholder="Select Health worker"
                zIndex={3000}
                style={styles.dropdown}
              />
              <Text style={styles.inputLabel}>Beneficiary</Text>
              <DropDownPicker
                open={beneficiaryOpen}
                value={form.beneficiaryId}
                items={beneficiaries || []}
                setOpen={setBeneficiaryOpen}
                setValue={(callback) =>
                  setForm((prev) => ({
                    ...prev,
                    beneficiaryId: callback(prev.beneficiaryId),
                  }))
                }
                placeholder={
                  form.userId
                    ? "Select Beneficiary"
                    : "Please select a Health Worker first"
                }
                disabled={!form.userId}
                zIndex={2000}
                style={styles.dropdown}
              />
              <Text style={styles.inputLabel}>Product</Text>
              <DropDownPicker
                open={productOpen}
                value={form.productId}
                items={products || []}
                setOpen={setProductOpen}
                setValue={(callback) =>
                  setForm((prev) => ({
                    ...prev,
                    productId: callback(prev.productId),
                  }))
                }
                placeholder="Select Product"
                zIndex={1000}
                style={styles.dropdown}
              />
              <TextInput
                label="Quantity (Kg)"
                value={form.quantityKg}
                onChangeText={(text) => setForm({ ...form, quantityKg: text })}
                keyboardType="numeric"
                style={styles.textInput}
                mode="outlined"
              />
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setAddModalVisible(false)}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={submitAdd}
                  loading={processing}
                >
                  Add
                </Button>
              </View>
            </View>
          </ScrollView>
        </Modal>

        <Modal transparent visible={editModalVisible}>
          <ScrollView contentContainerStyle={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Distribution</Text>
              <Text style={styles.inputLabel}>Beneficiary</Text>
              <DropDownPicker
                open={beneficiaryOpen}
                value={form.beneficiaryId}
                items={beneficiaries || []}
                setOpen={setBeneficiaryOpen}
                setValue={(callback) =>
                  setForm((prev) => ({
                    ...prev,
                    beneficiaryId: callback(prev.beneficiaryId),
                  }))
                }
                placeholder="Select Beneficiary"
                zIndex={2000}
                style={styles.dropdown}
              />
              <Text style={styles.inputLabel}>Product</Text>
              <DropDownPicker
                open={productOpen}
                value={form.productId}
                items={products || []}
                setOpen={setProductOpen}
                setValue={(callback) =>
                  setForm((prev) => ({
                    ...prev,
                    productId: callback(prev.productId),
                  }))
                }
                placeholder="Select Product"
                zIndex={1000}
                style={styles.dropdown}
              />
              <TextInput
                label="Quantity (Kg)"
                value={form.quantityKg}
                onChangeText={(text) => setForm({ ...form, quantityKg: text })}
                keyboardType="numeric"
                style={styles.textInput}
                mode="outlined"
              />
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setEditModalVisible(false)}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={submitEdit}
                  loading={processing}
                >
                  Update
                </Button>
              </View>
            </View>
          </ScrollView>
        </Modal>
      </Surface>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f4f6f8" },
  buttonsCard: { marginBottom: 16, borderRadius: 12 },
  controlsCard: { marginBottom: 16, borderRadius: 12 },
  chip: { marginRight: 6, marginBottom: 6, backgroundColor: "#ecf0f1" },
  selectedChip: { marginRight: 6, marginBottom: 6, backgroundColor: "#007AFF" },
  distributionCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  cardContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitleContainer: {
    flex: 1,
    paddingRight: 10,
  },
  cardTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#34495e",
  },
  cardSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: 2,
  },
  cardRightContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  cardValue: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    color: "#007AFF",
    marginRight: 4,
  },
  expandIcon: {
    marginLeft: 0,
    marginRight: -8,
  },
  expandedContent: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  detailLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: "#555",
  },
  detailValue: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#2c3e50",
    textAlign: "right",
    flexShrink: 1,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
  },
  modalTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: "#34495e",
    marginTop: 10,
    marginBottom: 4,
  },
  dropdown: {
    marginBottom: 15,
  },
  textInput: {
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    gap: 10,
  },
});

export default DistributionScreen;
