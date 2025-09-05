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
import UserService from "../../services/userService";

const StockManagementScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [mainStock, setMainStock] = useState([]);
  const [summary, setSummary] = useState({});
  const [healthWorkers, setHealthWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [addStockModalVisible, setAddStockModalVisible] = useState(false);
  const [distributeModalVisible, setDistributeModalVisible] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  // Form states
  const [stockForm, setStockForm] = useState({
    productName: "Flour",
    quantity: "",
    unit: "kg",
    batchNumber: "",
    expiryDate: "",
    supplier: "",
    costPerUnit: "",
    minimumThreshold: "100",
    notes: "",
  });

  const [distributionForm, setDistributionForm] = useState({
    userId: "",
    quantity: "",
    notes: "",
  });

  const itemsPerPage = 10;
  const statuses = ["All", "available", "low_stock", "out_of_stock", "expired"];

  useEffect(() => {
    fetchData();
    fetchHealthWorkers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stockResponse, summaryResponse] = await Promise.all([
        StockService.getMainStock(),
        StockService.getStockSummary(),
      ]);

      setMainStock(stockResponse.data || []);
      setSummary(summaryResponse.data || {});
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to fetch stock data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthWorkers = async () => {
    try {
      const response = await UserService.getUsers({ role: "health_worker" });
      setHealthWorkers(response.data || []);
    } catch (error) {
      console.error("Error fetching health workers:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Filter and search stock
  const filteredStock = useMemo(() => {
    let filtered = mainStock;

    if (selectedStatus !== "All") {
      filtered = filtered.filter((stock) => stock.status === selectedStatus);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (stock) =>
          stock.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stock.batchNumber
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          stock.supplier?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [mainStock, selectedStatus, searchQuery]);

  // Paginate stock
  const paginatedStock = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStock.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStock, currentPage]);

  const totalPages = Math.ceil(filteredStock.length / itemsPerPage);

  const handleAddStock = async () => {
    try {
      if (!stockForm.productName || !stockForm.quantity) {
        Alert.alert(
          "Validation Error",
          "Product name and quantity are required."
        );
        return;
      }

      const stockData = {
        ...stockForm,
        quantity: parseFloat(stockForm.quantity),
        costPerUnit: stockForm.costPerUnit
          ? parseFloat(stockForm.costPerUnit)
          : undefined,
        minimumThreshold: parseFloat(stockForm.minimumThreshold),
        expiryDate: stockForm.expiryDate
          ? new Date(stockForm.expiryDate)
          : undefined,
      };

      await StockService.createMainStock(stockData);

      Alert.alert("Success", "Stock item added successfully!");
      setAddStockModalVisible(false);
      resetStockForm();
      fetchData();
    } catch (error) {
      console.error("Error adding stock:", error);
      Alert.alert("Error", error.message || "Failed to add stock item.");
    }
  };

  const handleDistribute = async () => {
    try {
      if (
        !distributionForm.userId ||
        !distributionForm.quantity ||
        !selectedStock
      ) {
        Alert.alert(
          "Validation Error",
          "Please select a health worker and enter quantity."
        );
        return;
      }

      const distributionData = {
        mainStockId: selectedStock._id,
        userId: distributionForm.userId,
        quantity: parseFloat(distributionForm.quantity),
        notes: distributionForm.notes,
      };

      await StockService.distributeToUmunyabuzima(distributionData);

      Alert.alert("Success", "Stock distributed successfully!");
      setDistributeModalVisible(false);
      resetDistributionForm();
      fetchData();
    } catch (error) {
      console.error("Error distributing stock:", error);
      Alert.alert("Error", error.message || "Failed to distribute stock.");
    }
  };

  const resetStockForm = () => {
    setStockForm({
      productName: "Flour",
      quantity: "",
      unit: "kg",
      batchNumber: "",
      expiryDate: "",
      supplier: "",
      costPerUnit: "",
      minimumThreshold: "100",
      notes: "",
    });
  };

  const resetDistributionForm = () => {
    setDistributionForm({
      userId: "",
      quantity: "",
      notes: "",
    });
    setSelectedStock(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "#27ae60";
      case "low_stock":
        return "#f39c12";
      case "out_of_stock":
        return "#e74c3c";
      case "expired":
        return "#8e44ad";
      default:
        return "#95a5a6";
    }
  };

  const renderSummaryCards = () => (
    <View style={styles.summaryContainer}>
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.summaryTitle}>Total Items</Text>
          <Text style={styles.summaryValue}>
            {summary.mainStock?.totalItems || 0}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.summaryTitle}>Total Quantity</Text>
          <Text style={styles.summaryValue}>
            {summary.mainStock?.totalQuantity || 0} kg
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.summaryTitle}>Low Stock</Text>
          <Text style={[styles.summaryValue, { color: "#f39c12" }]}>
            {summary.mainStock?.lowStockItems || 0}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.summaryTitle}>Out of Stock</Text>
          <Text style={[styles.summaryValue, { color: "#e74c3c" }]}>
            {summary.mainStock?.outOfStockItems || 0}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );

  const renderStockItem = (item, index) => (
    <Card key={item._id} style={styles.stockCard}>
      <Card.Content>
        <View style={styles.stockHeader}>
          <Text style={styles.stockTitle}>{item.productName}</Text>
          <Chip
            style={[
              styles.statusChip,
              { backgroundColor: getStatusColor(item.status) },
            ]}
            textStyle={styles.statusChipText}
          >
            {item.status.replace("_", " ").toUpperCase()}
          </Chip>
        </View>

        <View style={styles.stockDetails}>
          <Text style={styles.stockDetail}>
            Quantity: {item.quantity} {item.unit}
          </Text>
          {item.batchNumber && (
            <Text style={styles.stockDetail}>Batch: {item.batchNumber}</Text>
          )}
          {item.supplier && (
            <Text style={styles.stockDetail}>Supplier: {item.supplier}</Text>
          )}
          {item.expiryDate && (
            <Text style={styles.stockDetail}>
              Expires: {new Date(item.expiryDate).toLocaleDateString()}
            </Text>
          )}
        </View>

        <View style={styles.stockActions}>
          <Button
            mode="outlined"
            onPress={() => {
              setSelectedStock(item);
              setDistributeModalVisible(true);
            }}
            style={styles.actionButton}
            disabled={item.quantity === 0}
          >
            Distribute
          </Button>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => {
              // Handle edit - you can implement this
              Alert.alert("Edit", "Edit functionality can be implemented here");
            }}
          />
        </View>
      </Card.Content>
    </Card>
  );

  if (loading || !fontsLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading stock data...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Surface style={styles.headerCard}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Stock Management</Text>
            <Text style={styles.subtitle}>
              Manage main stock and distributions
            </Text>
          </View>
        </Surface>

        {/* Summary Cards */}
        {renderSummaryCards()}

        {/* Controls */}
        <Card style={styles.controlsCard}>
          <Card.Content>
            <View style={styles.controlsHeader}>
              <Text style={styles.sectionTitle}>Stock Inventory</Text>
              <Button
                mode="contained"
                onPress={() => setAddStockModalVisible(true)}
                style={styles.addButton}
                icon="plus"
              >
                Add Stock
              </Button>
            </View>

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
                    style={
                      selectedStatus === status
                        ? styles.selectedChip
                        : styles.chip
                    }
                  >
                    {status === "All" ? "All" : status.replace("_", " ")}
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
                <Text style={styles.emptyText}>No stock items found</Text>
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
                  onPress={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
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
      </ScrollView>

      {/* Add Stock Modal */}
      <Portal>
        <Modal
          visible={addStockModalVisible}
          onDismiss={() => setAddStockModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Add New Stock</Text>
          <ScrollView style={styles.modalContent}>
            <TextInput
              label="Product Name"
              value={stockForm.productName}
              onChangeText={(value) =>
                setStockForm((prev) => ({ ...prev, productName: value }))
              }
              mode="outlined"
              style={styles.modalInput}
            />
            <TextInput
              label="Quantity"
              value={stockForm.quantity}
              onChangeText={(value) =>
                setStockForm((prev) => ({ ...prev, quantity: value }))
              }
              mode="outlined"
              keyboardType="numeric"
              style={styles.modalInput}
            />
            <TextInput
              label="Unit"
              value={stockForm.unit}
              onChangeText={(value) =>
                setStockForm((prev) => ({ ...prev, unit: value }))
              }
              mode="outlined"
              style={styles.modalInput}
            />
            <TextInput
              label="Batch Number (Optional)"
              value={stockForm.batchNumber}
              onChangeText={(value) =>
                setStockForm((prev) => ({ ...prev, batchNumber: value }))
              }
              mode="outlined"
              style={styles.modalInput}
            />
            <TextInput
              label="Supplier (Optional)"
              value={stockForm.supplier}
              onChangeText={(value) =>
                setStockForm((prev) => ({ ...prev, supplier: value }))
              }
              mode="outlined"
              style={styles.modalInput}
            />
            <TextInput
              label="Cost Per Unit (Optional)"
              value={stockForm.costPerUnit}
              onChangeText={(value) =>
                setStockForm((prev) => ({ ...prev, costPerUnit: value }))
              }
              mode="outlined"
              keyboardType="numeric"
              style={styles.modalInput}
            />
            <TextInput
              label="Minimum Threshold"
              value={stockForm.minimumThreshold}
              onChangeText={(value) =>
                setStockForm((prev) => ({ ...prev, minimumThreshold: value }))
              }
              mode="outlined"
              keyboardType="numeric"
              style={styles.modalInput}
            />
            <TextInput
              label="Notes (Optional)"
              value={stockForm.notes}
              onChangeText={(value) =>
                setStockForm((prev) => ({ ...prev, notes: value }))
              }
              mode="outlined"
              multiline
              style={styles.modalInput}
            />
          </ScrollView>
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setAddStockModalVisible(false);
                resetStockForm();
              }}
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

      {/* Distribution Modal */}
      <Portal>
        <Modal
          visible={distributeModalVisible}
          onDismiss={() => setDistributeModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>
            Distribute {selectedStock?.productName}
          </Text>
          <View style={styles.modalContent}>
            <Text style={styles.availableStock}>
              Available: {selectedStock?.quantity} {selectedStock?.unit}
            </Text>

            <Text style={styles.inputLabel}>Select Health Worker:</Text>
            <ScrollView style={styles.healthWorkersList} nestedScrollEnabled>
              {healthWorkers.map((worker) => (
                <Chip
                  key={worker._id}
                  mode={
                    distributionForm.userId === worker._id ? "flat" : "outlined"
                  }
                  selected={distributionForm.userId === worker._id}
                  onPress={() =>
                    setDistributionForm((prev) => ({
                      ...prev,
                      userId: worker._id,
                    }))
                  }
                  style={styles.workerChip}
                >
                  {worker.name}
                </Chip>
              ))}
            </ScrollView>

            <TextInput
              label="Quantity to Distribute"
              value={distributionForm.quantity}
              onChangeText={(value) =>
                setDistributionForm((prev) => ({ ...prev, quantity: value }))
              }
              mode="outlined"
              keyboardType="numeric"
              style={styles.modalInput}
            />
            <TextInput
              label="Notes (Optional)"
              value={distributionForm.notes}
              onChangeText={(value) =>
                setDistributionForm((prev) => ({ ...prev, notes: value }))
              }
              mode="outlined"
              multiline
              style={styles.modalInput}
            />
          </View>
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setDistributeModalVisible(false);
                resetDistributionForm();
              }}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleDistribute}
              style={styles.modalButton}
            >
              Distribute
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
  controlsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: "#2c3e50",
  },
  addButton: {
    backgroundColor: "#007AFF",
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
    marginBottom: 12,
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
  stockDetails: {
    marginBottom: 12,
  },
  stockDetail: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#7f8c8d",
    marginBottom: 4,
  },
  stockActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionButton: {
    flex: 1,
    marginRight: 8,
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
    maxHeight: "80%",
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
    maxHeight: 400,
  },
  modalInput: {
    marginBottom: 12,
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
  availableStock: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#27ae60",
    textAlign: "center",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#e8f5e8",
    borderRadius: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#34495e",
    marginBottom: 8,
  },
  healthWorkersList: {
    maxHeight: 120,
    marginBottom: 16,
  },
  workerChip: {
    marginRight: 6,
    marginBottom: 6,
  },
});

export default StockManagementScreen;
