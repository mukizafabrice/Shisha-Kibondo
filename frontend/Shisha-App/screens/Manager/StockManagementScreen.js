import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  RefreshControl,
} from "react-native";
import {
  Card,
  Button,
  Surface,
  TextInput,
  Portal,
  Modal,
  ActivityIndicator,
  IconButton,
} from "react-native-paper";
import DropDownPicker from "react-native-dropdown-picker";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { useAuth } from "../../context/AuthContext";
import {
  getAllMainStock,
  createMainStock,
  updateMainStock,
  deleteMainStock,
} from "../../services/mainStockService";
import { getAllProducts } from "../../services/ProductService";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const isDesktop = width > 768;

const COLUMNS = [
  { id: "product", label: "Product", flex: 3 },
  { id: "totalStock", label: "Total Stock", flex: 2 },
  { id: "actions", label: "Actions", flex: 2 },
];

const StockManagementScreen = () => {
  const { user } = useAuth();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [mainStock, setMainStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals & form states
  const [addStockModalVisible, setAddStockModalVisible] = useState(false);
  const [editStockModalVisible, setEditStockModalVisible] = useState(false);

  const [stockForm, setStockForm] = useState({ productId: "", totalStock: "" });
  const [editingStockId, setEditingStockId] = useState(null);

  // DropDown state
  const [productOpen, setProductOpen] = useState(false);
  const [productItems, setProductItems] = useState([]);

  const navigation = useNavigation();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const stockResponse = await getAllMainStock();
      const allProducts = await getAllProducts();
      setMainStock(stockResponse);
      setProducts(allProducts);

      // map for DropDownPicker
      setProductItems(
        allProducts.map((p) => ({ label: p.name, value: p._id }))
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  const resetStockForm = () => {
    setStockForm({ productId: "", totalStock: "" });
    setEditingStockId(null);
  };

  // --- Add Stock ---
  const handleAddStock = async () => {
    if (!stockForm.productId || !stockForm.totalStock) {
      Alert.alert("Validation Error", "Product and total stock are required.");
      return;
    }
    try {
      const stockData = {
        productId: stockForm.productId,
        totalStock: parseFloat(stockForm.totalStock),
      };
      await createMainStock(stockData);
      Alert.alert("Success", "Stock added!");
      setAddStockModalVisible(false);
      resetStockForm();
      fetchAll();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to add stock.";
      Alert.alert("Error", msg);
    }
  };

  // --- Edit Stock ---
  const openEditModal = (item) => {
    setStockForm({
      productId: item.productId,
      totalStock: String(item.totalStock),
    });
    setEditingStockId(item._id);
    setEditStockModalVisible(true);
  };

  const handleUpdateStock = async () => {
    if (!stockForm.productId || !stockForm.totalStock) {
      Alert.alert("Validation Error", "Product and total stock are required.");
      return;
    }
    try {
      const stockData = {
        productId: stockForm.productId,
        totalStock: parseFloat(stockForm.totalStock),
      };
      await updateMainStock(editingStockId, stockData);
      Alert.alert("Success", "Stock updated!");
      setEditStockModalVisible(false);
      resetStockForm();
      fetchAll();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to update stock.";
      Alert.alert("Error", msg);
    }
  };

  // --- Delete Stock ---
  const handleDeleteStock = async (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this stock?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMainStock(id);
              Alert.alert("Deleted", "Stock has been deleted.");
              fetchAll();
            } catch (error) {
              console.error(error);
              Alert.alert("Error", error.message || "Failed to delete stock.");
            }
          },
        },
      ]
    );
  };

  // --- Filter & Pagination ---
  const filteredStock = useMemo(() => {
    if (!searchQuery.trim()) return mainStock;
    return mainStock.filter((stock) => {
      const product = products.find((p) => p._id === stock.productId);
      return product?.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [mainStock, searchQuery, products]);

  const paginatedStock = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStock.slice(start, start + itemsPerPage);
  }, [filteredStock, currentPage]);

  const totalPages = Math.ceil(filteredStock.length / itemsPerPage);

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      {COLUMNS.map((col) => (
        <Text key={col.id} style={[styles.headerText, { flex: col.flex }]}>
          {col.label}
        </Text>
      ))}
    </View>
  );

  const renderTableRow = (item, index) => {
    const product = products.find((p) => p._id === item.productId);
    return (
      <View
        key={item._id}
        style={[
          styles.tableRow,
          index % 2 === 0 ? styles.evenRow : styles.oddRow,
        ]}
      >
        <View style={[styles.cell, { flex: 3 }]}>
          <Text style={styles.cellText}>
            {item.productId?.name || "Unknown Product"}
          </Text>
        </View>
        <Text style={[styles.cellText, { flex: 2, textAlign: "center" }]}>
          {item.totalStock}
        </Text>
        <View style={[styles.cell, { flex: 2, justifyContent: "center" }]}>
          <IconButton
            icon="pencil"
            size={20}
            iconColor="#007AFF"
            onPress={() => openEditModal(item)}
          />
          <IconButton
            icon="delete"
            size={20}
            iconColor="#E63946"
            onPress={() => handleDeleteStock(item._id)}
          />
        </View>
      </View>
    );
  };

  if (loading || !fontsLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading stock data...</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Main Stock</Text>
          <Text style={styles.subtitle}>Inventory Management</Text>
        </View>
      </Card>

      {/* Controls */}
      <Card style={styles.controlsCard}>
        <Card.Content>
          <View style={styles.controlsHeader}>
            <Button
              mode="contained"
              onPress={() => setAddStockModalVisible(true)}
              style={styles.addButton}
              icon="plus"
            >
              Add Stock
            </Button>
            <Button
              mode="contained"
              onPress={() => navigation.navigate("StockTransactions")}
              style={styles.transactionButton}
              icon="eye"
            >
              Transactions
            </Button>
          </View>
          <TextInput
            label="Search by product..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            mode="outlined"
            left={<TextInput.Icon icon="magnify" />}
            style={styles.searchInput}
          />
        </Card.Content>
      </Card>

      {/* Stock Table */}
      <Card style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tableWrapper}>
            {renderTableHeader()}
            <ScrollView
              style={{ maxHeight: isDesktop ? 600 : 400 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {paginatedStock.length > 0 ? (
                paginatedStock.map(renderTableRow)
              ) : (
                <Text style={styles.emptyText}>No stock items found.</Text>
              )}
            </ScrollView>
          </View>
        </ScrollView>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card style={styles.paginationCard}>
          <Card.Content>
            <View style={styles.paginationContainer}>
              <Button
                mode="outlined"
                onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Text style={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </Text>
              <Button
                mode="outlined"
                onPress={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Add Stock Modal */}
      <Portal>
        <Modal
          visible={addStockModalVisible}
          onDismiss={() => setAddStockModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Add New Stock</Text>
          <ScrollView>
            <DropDownPicker
              open={productOpen}
              value={stockForm.productId}
              items={productItems}
              setOpen={setProductOpen}
              setValue={(callback) =>
                setStockForm((prev) => ({
                  ...prev,
                  productId: callback(prev.productId),
                }))
              }
              setItems={setProductItems}
              placeholder="Select Product"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
            />

            <TextInput
              label="Total Stock"
              value={stockForm.totalStock}
              onChangeText={(val) =>
                setStockForm((prev) => ({ ...prev, totalStock: val }))
              }
              mode="outlined"
              keyboardType="numeric"
              style={styles.modalInput}
            />
          </ScrollView>
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setAddStockModalVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddStock}
              style={styles.modalButton}
            >
              Add Stock
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Edit Stock Modal */}
      <Portal>
        <Modal
          visible={editStockModalVisible}
          onDismiss={() => setEditStockModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Edit Stock</Text>
          <ScrollView>
            <DropDownPicker
              open={productOpen}
              value={stockForm.productId}
              items={productItems}
              setOpen={setProductOpen}
              setValue={(callback) =>
                setStockForm((prev) => ({
                  ...prev,
                  productId: callback(prev.productId),
                }))
              }
              setItems={setProductItems}
              placeholder="Select Product"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
            />

            <TextInput
              label="Total Stock"
              value={stockForm.totalStock}
              onChangeText={(val) =>
                setStockForm((prev) => ({ ...prev, totalStock: val }))
              }
              mode="outlined"
              keyboardType="numeric"
              style={styles.modalInput}
            />
          </ScrollView>
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setEditStockModalVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleUpdateStock}
              style={styles.modalButton}
            >
              Update Stock
            </Button>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f7fa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#7f8c8d",
  },
  headerCard: { marginBottom: 16, elevation: 4, borderRadius: 12 },
  headerContent: { padding: 20, alignItems: "center" },
  title: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: "#2c3e50",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#7f8c8d",
    textAlign: "center",
    marginTop: 4,
  },
  controlsCard: { marginBottom: 16, elevation: 2, borderRadius: 12 },
  controlsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addButton: { backgroundColor: "#007AFF" },
  transactionButton: { backgroundColor: "#008000" },
  searchInput: { marginBottom: 8, backgroundColor: "#fff" },
  tableCard: { flex: 1, elevation: 2, marginBottom: 16, borderRadius: 8 },
  tableWrapper: { minWidth: 380, backgroundColor: "#fff" },
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
  tableRow: {
    flexDirection: "row",
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e4e8",
    alignItems: "center",
  },
  evenRow: { backgroundColor: "#f8f9fa" },
  oddRow: { backgroundColor: "#fff" },
  cell: { flexDirection: "row", alignItems: "center" },
  cellText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#2c3e50",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#7f8c8d",
    padding: 40,
    fontStyle: "italic",
  },
  paginationCard: { marginTop: 0, elevation: 2, borderRadius: 8 },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  pageInfo: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#7f8c8d",
  },
  modalContainer: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 12,
    maxHeight: "80%",
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 20,
  },
  modalInput: { marginBottom: 12, backgroundColor: "#fff" },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: { flex: 1, marginHorizontal: 5 },
  dropdown: { marginBottom: 16, borderColor: "#ccc" },
  dropdownContainer: { borderColor: "#ccc", backgroundColor: "#fff" },
});

export default StockManagementScreen;
