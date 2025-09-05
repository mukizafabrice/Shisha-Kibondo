import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import {
  Card,
  Text,
  Button,
  Surface,
  IconButton,
  Divider,
  Chip,
  TextInput,
  Portal,
  Modal,
  ActivityIndicator,
  ProgressBar,
} from "react-native-paper";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { useAuth } from "../../context/AuthContext";
import StockService from "../../services/stockService";

const MyStockScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [myStock, setMyStock] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal states
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  
  // Form state
  const [updateForm, setUpdateForm] = useState({
    quantity: "",
    notes: "",
  });

  const itemsPerPage = 10;
  const statuses = ["All", "available", "low_stock", "out_of_stock", "expired"];

  useEffect(() => {
    fetchMyStock();
    fetchSummary();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, searchQuery]);

  const fetchMyStock = async () => {
    try {
      setLoading(true);
      const response = await StockService.getUmunyabuzimaStock();
      setMyStock(response.data || []);
    } catch (error) {
      console.error("Error fetching my stock:", error);
      Alert.alert("Error", "Failed to fetch your stock data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await StockService.getStockSummary();
      setSummary(response.data || {});
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchMyStock(), fetchSummary()]);
    setRefreshing(false);
  };

  // Filter and search stock
  const filteredStock = useMemo(() => {
    let filtered = myStock;

    if (selectedStatus !== "All") {
      filtered = filtered.filter((stock) => stock.status === selectedStatus);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (stock) =>
          stock.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stock.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stock.supplier?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [myStock, selectedStatus, searchQuery]);

  // Paginate stock
  const paginatedStock = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStock.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStock, currentPage]);

  const totalPages = Math.ceil(filteredStock.length / itemsPerPage);

  const handleUpdateStock = async () => {
    try {
      if (!updateForm.quantity || parseFloat(updateForm.quantity) < 0) {
        Alert.alert("Validation Error", "Please enter a valid quantity.");
        return;
      }

      const updateData = {
        quantity: parseFloat(updateForm.quantity),
        notes: updateForm.notes,
      };

      await StockService.updateUmunyabuzimaStock(selectedStock._id, updateData);
      
      Alert.alert("Success", "Stock updated successfully!");
      setUpdateModalVisible(false);
      resetUpdateForm();
      fetchMyStock();
    } catch (error) {
      console.error("Error updating stock:", error);
      Alert.alert("Error", error.message || "Failed to update stock.");
    }
  };

  const resetUpdateForm = () => {
    setUpdateForm({
      quantity: "",
      notes: "",
    });
    setSelectedStock(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available": return "#27ae60";
      case "low_stock": return "#f39c12";
      case "out_of_stock": return "#e74c3c";
      case "expired": return "#8e44ad";
      case "distributed": return "#3498db";
      default: return "#95a5a6";
    }
  };

  const calculateStockPercentage = (current, total) => {
    if (!total || total === 0) return 0;
    return Math.round((current / total) * 100);
  };

  const renderSummaryCards = () => {
    const userStock = summary.userStock || [];
    const totalQuantity = userStock.reduce((sum, item) => sum + (item.totalQuantity || 0), 0);
    const totalReceived = userStock.reduce((sum, item) => sum + (item.totalReceived || 0), 0);
    const totalDistributed = userStock.reduce((sum, item) => sum + (item.totalDistributed || 0), 0);
    const lowStockCount = userStock.reduce((sum, item) => sum + (item.lowStockCount || 0), 0);

    return (
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>Current Stock</Text>
            <Text style={styles.summaryValue}>{totalQuantity} kg</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>Total Received</Text>
            <Text style={styles.summaryValue}>{totalReceived} kg</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>Distributed</Text>
            <Text style={styles.summaryValue}>{totalDistributed} kg</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>Low Stock Items</Text>
            <Text style={[styles.summaryValue, { color: "#f39c12" }]}>
              {lowStockCount}
            </Text>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const renderStockItem = (item, index) => {
    const stockPercentage = calculateStockPercentage(item.quantity, item.totalReceived);
    
    return (
      <Card key={item._id} style={styles.stockCard}>
        <Card.Content>
          <View style={styles.stockHeader}>
            <Text style={styles.stockTitle}>{item.productName}</Text>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
              textStyle={styles.statusChipText}
            >
              {item.status.replace('_', ' ').toUpperCase()}
            </Chip>
          </View>
          
          <View style={styles.stockProgress}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Stock Level</Text>
              <Text style={styles.progressValue}>{stockPercentage}%</Text>
            </View>
            <ProgressBar
              progress={stockPercentage / 100}
              color={getStatusColor(item.status)}
              style={styles.progressBar}
            />
          </View>
          
          <View style={styles.stockDetails}>
            <View style={styles.stockRow}>
              <Text style={styles.stockLabel}>Current:</Text>
              <Text style={styles.stockValue}>{item.quantity} {item.unit}</Text>
            </View>
            <View style={styles.stockRow}>
              <Text style={styles.stockLabel}>Received:</Text>
              <Text style={styles.stockValue}>{item.totalReceived || 0} {item.unit}</Text>
            </View>
            <View style={styles.stockRow}>
              <Text style={styles.stockLabel}>Distributed:</Text>
              <Text style={styles.stockValue}>{item.totalDistributed || 0} {item.unit}</Text>
            </View>
            {item.batchNumber && (
              <View style={styles.stockRow}>
                <Text style={styles.stockLabel}>Batch:</Text>
                <Text style={styles.stockValue}>{item.batchNumber}</Text>
              </View>
            )}
            {item.expiryDate && (
              <View style={styles.stockRow}>
                <Text style={styles.stockLabel}>Expires:</Text>
                <Text style={[
                  styles.stockValue,
                  new Date(item.expiryDate) < new Date() ? { color: "#e74c3c" } : {}
                ]}>
                  {new Date(item.expiryDate).toLocaleDateString()}
                </Text>
              </View>
            )}
            {item.distributionDate && (
              <View style={styles.stockRow}>
                <Text style={styles.stockLabel}>Last Distribution:</Text>
                <Text style={styles.stockValue}>
                  {new Date(item.distributionDate).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.stockActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setSelectedStock(item);
                setUpdateForm({
                  quantity: item.quantity.toString(),
                  notes: item.notes || "",
                });
                setUpdateModalVisible(true);
              }}
              style={styles.actionButton}
              icon="pencil"
            >
              Update Stock
            </Button>
          </View>
          
          {item.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (loading || !fontsLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading your stock...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Surface style={styles.headerCard}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>My Stock</Text>
            <Text style={styles.subtitle}>Track your assigned flour stock</Text>
          </View>
        </Surface>

        {/* Summary Cards */}
        {renderSummaryCards()}

        {/* Controls */}
        <Card style={styles.controlsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Stock Inventory</Text>

            <TextInput
              label="Search stock..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              mode="outlined"
              left={<TextInput.Icon icon="magnify" />}
              style={styles.searchInput}
            />

            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Filter by Status:</Text>
              <View style={styles.filterButtons}>
                {statuses.map((status) => (
                  <Chip
                    key={status}
                    mode={selectedStatus === status ? "flat" : "outlined"}
                    selected={selectedStatus === status}
                    onPress={() => setSelectedStatus(status)}
                    style={selectedStatus === status ? styles.selectedChip : styles.chip}
                  >
                    {status === "All" ? "All" : status.replace('_', ' ')}
                  </Chip>
                ))}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Stock List */}
        <View style={styles.stockList}>
          {paginatedStock.length > 0 ? (
            paginatedStock.map(renderStockItem)
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>
                  {myStock.length === 0 
                    ? "No stock assigned to you yet" 
                    : "No stock items match your search"
                  }
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>

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
                  onPress={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Update Stock Modal */}
      <Portal>
        <Modal
          visible={updateModalVisible}
          onDismiss={() => setUpdateModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>
            Update {selectedStock?.productName} Stock
          </Text>
          <View style={styles.modalContent}>
            <View style={styles.currentStockInfo}>
              <Text style={styles.currentStockLabel}>Current Stock:</Text>
              <Text style={styles.currentStockValue}>
                {selectedStock?.quantity} {selectedStock?.unit}
              </Text>
            </View>
            
            <TextInput
              label="New Quantity"
              value={updateForm.quantity}
              onChangeText={(value) => setUpdateForm(prev => ({ ...prev, quantity: value }))}
              mode="outlined"
              keyboardType="numeric"
              style={styles.modalInput}
              helper="Enter the current quantity you have"
            />
            
            <TextInput
              label="Notes (Optional)"
              value={updateForm.notes}
              onChangeText={(value) => setUpdateForm(prev => ({ ...prev, notes: value }))}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.modalInput}
              helper="Add any notes about the stock update"
            />
          </View>
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setUpdateModalVisible(false);
                resetUpdateForm();
              }}
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#7f8c8d",
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
    padding: 20,
    alignItems: "center",
  },
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
  summaryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryCard: {
    width: "48%",
    marginBottom: 8,
    elevation: 2,
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: "#7f8c8d",
    textAlign: "center",
  },
  summaryValue: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: "#2c3e50",
    textAlign: "center",
    marginTop: 4,
  },
  controlsCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: "#2c3e50",
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 16,
    backgroundColor: "#ffffff",
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
  filterButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: "#ecf0f1",
  },
  selectedChip: {
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: "#007AFF",
  },
  stockList: {
    marginBottom: 16,
  },
  stockCard: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 12,
  },
  stockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  stockTitle: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#2c3e50",
    flex: 1,
  },
  statusChip: {
    marginLeft: 8,
  },
  statusChipText: {
    color: "#ffffff",
    fontSize: 10,
    fontFamily: "Poppins_500Medium",
  },
  stockProgress: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#7f8c8d",
  },
  progressValue: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#2c3e50",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  stockDetails: {
    marginBottom: 12,
  },
  stockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  stockLabel: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#7f8c8d",
    flex: 1,
  },
  stockValue: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#2c3e50",
    textAlign: "right",
    flex: 1,
  },
  divider: {
    marginVertical: 12,
  },
  stockActions: {
    marginBottom: 8,
  },
  actionButton: {
    borderColor: "#007AFF",
  },
  notesContainer: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: "#7f8c8d",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#2c3e50",
    lineHeight: 20,
  },
  emptyCard: {
    elevation: 2,
    borderRadius: 12,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#7f8c8d",
    padding: 20,
    fontStyle: "italic",
  },
  paginationCard: {
    elevation: 2,
    borderRadius: 12,
    marginBottom: 16,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: "#2c3e50",
    textAlign: "center",
    padding: 20,
    paddingBottom: 10,
  },
  modalContent: {
    paddingHorizontal: 20,
  },
  currentStockInfo: {
    backgroundColor: "#e8f4fd",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currentStockLabel: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#2c3e50",
  },
  currentStockValue: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: "#007AFF",
  },
  modalInput: {
    marginBottom: 16,
    backgroundColor: "#ffffff",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 10,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default MyStockScreen;