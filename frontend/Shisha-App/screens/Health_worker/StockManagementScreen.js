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
  updateStock,
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

  const [modalVisible, setModalVisible] = useState(false);
  const [newStock, setNewStock] = useState({
    productId: "",
    totalStock: "",
  });
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

  // Filtering
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
  tableScroll: { flex: 1 },
  tableWrapper: { minWidth: 400, backgroundColor: "#fff", borderRadius: 8 },
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
    textAlign: "left",
  },
  productColumn: { width: 150 },
  totalColumn: { width: 120 },
  userColumn: { width: 150 },
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
  dropdownContainer: { borderColor: "#ccc", backgroundColor: "#fff" },
  dropdownText: { fontSize: 14, color: "#2c3e50" },
  placeholder: { color: "#888", fontSize: 14 },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: { flex: 1, marginHorizontal: 8 },
});

export default StockScreen;
