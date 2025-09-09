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
  Card,
  IconButton,
  Surface,
  FAB,
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
  getAllStocks,
  createStock,
  deleteStock,
} from "../../services/stockService";
import { getAllProducts } from "../../services/ProductService";
import { useAuth } from "../../context/AuthContext";

const StockScreen = ({ navigation }) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { user } = useAuth();

  const [products, setProducts] = useState([]);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [newStock, setNewStock] = useState({ productId: "", totalStock: "" });
  const [saving, setSaving] = useState(false);

  // Dropdown state
  const [productOpen, setProductOpen] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const itemsPerPage = 10;

  useEffect(() => {
    fetchStocks();
    fetchProducts();
  }, []);

  const fetchStocks = async () => {
    try {
      const data = await getAllStocks();
      setStocks(data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch stocks.");
    } finally {
      setLoading(false);
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

  // Filter
  const filteredStocks = useMemo(() => {
    let filtered = stocks;
    if (searchQuery.trim()) {
      filtered = filtered.filter((s) =>
        s.productId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [stocks, searchQuery]);

  // Pagination
  const paginatedStocks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStocks.slice(start, start + itemsPerPage);
  }, [filteredStocks, currentPage]);

  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Delete
  const handleDelete = (id) => {
    Alert.alert("Delete Stock", "Confirm delete?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteStock(id);
          fetchStocks();
        },
      },
    ]);
  };

  // Save new stock
  const handleSaveStock = async () => {
    if (!newStock.productId || !newStock.totalStock) {
      Alert.alert("Error", "Please select a product and enter stock.");
      return;
    }
    try {
      setSaving(true);
      await createStock(newStock);
      fetchStocks();
      setModalVisible(false);
      setNewStock({ productId: "", totalStock: "" });
    } catch (error) {
      Alert.alert("Error", "Failed to create stock.");
    } finally {
      setSaving(false);
    }
  };

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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Stocks</Text>
          <IconButton
            icon="refresh"
            size={24}
            iconColor="#007AFF"
            onPress={fetchStocks}
          />
        </View>

        {/* Search */}
        <Card style={styles.controlsCard}>
          <Card.Content>
            <TextInput
              placeholder="Search by product..."
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
              <Text style={[styles.headerText, styles.productColumn]}>
                Product
              </Text>
              <Text style={[styles.headerText, styles.totalColumn]}>
                Total Stock
              </Text>
              <Text style={[styles.headerText, styles.userColumn]}>User</Text>
            </View>

            {paginatedStocks.length > 0 ? (
              paginatedStocks.map((s, i) => (
                <View
                  key={s._id}
                  style={[
                    styles.userRow,
                    i % 2 === 0 ? styles.evenRow : styles.oddRow,
                  ]}
                >
                  <Text style={[styles.cellText, styles.productColumn]}>
                    {s.productId?.name}
                  </Text>
                  <Text style={[styles.cellText, styles.totalColumn]}>
                    {s.totalStock}
                  </Text>
                  <Text style={[styles.cellText, styles.userColumn]}>
                    {s.userId?.name}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.empty}>No stocks found</Text>
            )}
          </View>
        </ScrollView>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card style={styles.paginationCard}>
            <Card.Content style={styles.paginationContainer}>
              <Button
                mode="outlined"
                textColor="#007AFF"
                onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={styles.pageButton}
              >
                Previous
              </Button>
              <Text style={styles.pageInfo}>
                Page {currentPage} of {totalPages || 1}
              </Text>
              <Button
                mode="outlined"
                textColor="#007AFF"
                onPress={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                style={styles.pageButton}
              >
                Next
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Floating Add Button */}
        <FAB
          icon="plus"
          style={styles.fab}
          color="#fff"
          onPress={() => setModalVisible(true)}
        />

        {/* Modal for Add Stock */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Stock</Text>

              <Text style={styles.label}>Product</Text>
              <DropDownPicker
                open={productOpen}
                value={newStock.productId}
                items={products.map((p) => ({ label: p.name, value: p._id }))}
                setOpen={setProductOpen}
                setValue={(callback) =>
                  setNewStock((prev) => ({
                    ...prev,
                    productId: callback(prev.productId),
                  }))
                }
                placeholder="Select a product"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />

              <Text style={styles.label}>Total Stock</Text>
              <TextInput
                value={newStock.totalStock}
                onChangeText={(t) =>
                  setNewStock((prev) => ({ ...prev, totalStock: t }))
                }
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
                theme={{ colors: { primary: "#007AFF" } }}
              />

              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setModalVisible(false)}
                  style={styles.modalButton}
                  textColor="#7f8c8d"
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveStock}
                  style={styles.modalButton}
                  loading={saving}
                  buttonColor="#007AFF"
                >
                  Save
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
  container: { flex: 1, padding: 16, backgroundColor: "#f4f6f8" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: "#2c3e50",
  },

  controlsCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  searchInput: { marginBottom: 8, backgroundColor: "#fff", borderRadius: 8 },

  tableScroll: { flex: 1 },
  tableWrapper: {
    minWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  headerText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },
  userRow: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  evenRow: { backgroundColor: "#f8f9fa" },
  oddRow: { backgroundColor: "#fff" },
  cellText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    textAlign: "left",
    color: "#2c3e50",
  },
  productColumn: { width: 150 },
  totalColumn: { width: 120 },
  userColumn: { width: 150 },

  empty: { textAlign: "center", padding: 40, color: "#7f8c8d" },

  paginationCard: {
    elevation: 2,
    borderRadius: 12,
    marginTop: 16,
    backgroundColor: "#fff",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageButton: { borderColor: "#007AFF", borderRadius: 8 },
  pageInfo: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#2c3e50",
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#007AFF",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#2c3e50",
  },
  label: {
    fontFamily: "Poppins_600SemiBold",
    marginTop: 12,
    marginBottom: 6,
    color: "#2c3e50",
  },
  input: { marginBottom: 12, backgroundColor: "#fff" },
  dropdown: { marginBottom: 12, borderColor: "#ccc" },
  dropdownContainer: { borderColor: "#ccc", backgroundColor: "#fff" },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: { flex: 1, marginHorizontal: 6 },
});

export default StockScreen;
