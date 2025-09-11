import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from "react-native";
import {
  Card,
  TextInput,
  Button,
  IconButton,
  ActivityIndicator,
  Chip,
  Surface,
} from "react-native-paper";
import { getTransactions } from "../../services/transactionService";
import { getAllProducts } from "../../services/ProductService";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const isDesktop = width > 768;

const PRIMARY_COLOR = "#3498db";
const ACCENT_COLOR = "#2ecc71";
const DANGER_COLOR = "#e74c3c";
const BACKGROUND_COLOR = "#f0f4f7";
const CARD_BG = "#ffffff";
const TEXT_COLOR = "#34495e";

const StockTransactionsScreen = () => {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortDirection, setSortDirection] = useState("DESC");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      setLoading(true);
      const txns = await getTransactions();
      const prods = await getAllProducts();
      setTransactions(txns);
      setProducts(prods);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getProductName = (id) => {
    const prod = products.find((p) => p._id === id);
    return prod?.name || "Unknown";
  };

  const filteredTransactions = useMemo(() => {
    let data = [...transactions];

    if (searchQuery.trim()) {
      data = data.filter((t) =>
        getProductName(t.productId)
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    if (typeFilter !== "ALL") {
      data = data.filter((t) => t.type === typeFilter);
    }

    data.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortDirection === "ASC" ? dateA - dateB : dateB - dateA;
    });

    return data;
  }, [transactions, searchQuery, typeFilter, sortDirection, products]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerText, { flex: 3 }]}>Product</Text>
      <Text style={[styles.headerText, { flex: 1, textAlign: "center" }]}>
        Type
      </Text>
      <Text style={[styles.headerText, { flex: 1, textAlign: "center" }]}>
        Quantity
      </Text>
      <Text style={[styles.headerText, { flex: 2, textAlign: "right" }]}>
        Date
      </Text>
    </View>
  );

  const renderTableRow = (t, i) => (
    <View
      key={t._id}
      style={[styles.tableRow, i % 2 === 0 ? styles.evenRow : styles.oddRow]}
    >
      <Text style={[styles.cell, { flex: 3 }]}>
        {getProductName(t.productId)}
      </Text>
      <Text
        style={[
          styles.cell,
          {
            flex: 1,
            textAlign: "center",
            color: t.type === "IN" ? ACCENT_COLOR : DANGER_COLOR,
            fontFamily: "Poppins_600SemiBold",
          },
        ]}
      >
        {t.type}
      </Text>
      <Text style={[styles.cell, { flex: 1, textAlign: "center" }]}>
        {t.totalStock}
      </Text>
      <Text style={[styles.cell, { flex: 2, textAlign: "right" }]}>
        {new Date(t.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );

  const renderMobileTransactionCard = (t) => (
    <Card key={t._id} style={styles.mobileCard}>
      <Card.Content style={styles.mobileCardContent}>
        <View style={styles.mobileCardRow}>
          <Text style={styles.mobileCardTitle}>
            {getProductName(t.productId)}
          </Text>
          <Text
            style={[
              styles.mobileCardSubtitle,
              {
                color: t.type === "IN" ? ACCENT_COLOR : DANGER_COLOR,
                fontFamily: "Poppins_600SemiBold",
              },
            ]}
          >
            {t.type}
          </Text>
        </View>
        <View style={styles.mobileCardRow}>
          <Text style={styles.mobileCardSubtitle}>
            Quantity: {t.totalStock}
          </Text>
          <Text style={styles.mobileCardSubtitle}>
            Date: {new Date(t.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading || !fontsLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <Surface style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section with Icon */}
        <View style={styles.header}>
          <Ionicons
            name="receipt-outline"
            size={32}
            color={CARD_BG}
            style={styles.headerIcon}
          />
          <Text style={styles.headerTitle}>Stock Transactions</Text>
          <Text style={styles.headerSubtitle}>
            A comprehensive history of inventory changes
          </Text>
        </View>

        {/* Controls Section: Search and Filters */}
        <Card style={styles.controlsCard}>
          <Card.Content>
            <TextInput
              placeholder="Search by product name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              mode="outlined"
              left={<TextInput.Icon icon="magnify" />}
              style={styles.input}
              outlineStyle={styles.inputOutline}
            />

            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Type:</Text>
              <View style={styles.chipContainer}>
                {["ALL", "IN", "OUT"].map((type) => (
                  <Chip
                    key={type}
                    onPress={() => setTypeFilter(type)}
                    style={[
                      styles.chip,
                      typeFilter === type && styles.selectedChip,
                    ]}
                    textStyle={[
                      styles.chipText,
                      typeFilter === type && styles.selectedChipText,
                    ]}
                    selected={typeFilter === type}
                    showSelectedCheck={false}
                  >
                    {type}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Sort by Date:</Text>
              <View style={styles.chipContainer}>
                {["DESC", "ASC"].map((direction) => (
                  <Chip
                    key={direction}
                    onPress={() => setSortDirection(direction)}
                    style={[
                      styles.chip,
                      sortDirection === direction && styles.selectedChip,
                    ]}
                    textStyle={[
                      styles.chipText,
                      sortDirection === direction && styles.selectedChipText,
                    ]}
                    selected={sortDirection === direction}
                    showSelectedCheck={false}
                  >
                    {direction === "DESC" ? "Newest" : "Oldest"}
                  </Chip>
                ))}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Transaction List/Table */}
        <Card style={styles.listCard}>
          {paginatedTransactions.length > 0 ? (
            isDesktop ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.table}>
                  {renderTableHeader()}
                  {paginatedTransactions.map(renderTableRow)}
                </View>
              </ScrollView>
            ) : (
              <View style={styles.mobileList}>
                {paginatedTransactions.map(renderMobileTransactionCard)}
              </View>
            )
          ) : (
            <Text style={styles.noData}>No transactions found.</Text>
          )}
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={styles.pagination}>
            <Button
              icon="arrow-left"
              mode="contained"
              onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              buttonColor={PRIMARY_COLOR}
              labelStyle={styles.paginationButtonLabel}
            >
              Previous
            </Button>
            <Text style={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </Text>
            <Button
              icon="arrow-right"
              mode="contained"
              onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              buttonColor={PRIMARY_COLOR}
              labelStyle={styles.paginationButtonLabel}
            >
              Next
            </Button>
          </View>
        )}
      </ScrollView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: BACKGROUND_COLOR,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BACKGROUND_COLOR,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#7f8c8d",
  },
  header: {
    padding: 30,
    marginBottom: 20,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 20,
    alignItems: "center",
  },
  headerIcon: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    color: CARD_BG,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: CARD_BG,
    opacity: 0.8,
  },
  controlsCard: {
    marginBottom: 20,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: CARD_BG,
    padding: 10,
  },
  input: {
    marginBottom: 12,
    backgroundColor: BACKGROUND_COLOR,
  },
  inputOutline: {
    borderRadius: 10,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  filterLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: TEXT_COLOR,
    marginRight: 10,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: BACKGROUND_COLOR,
    borderColor: BACKGROUND_COLOR,
    borderRadius: 8,
  },
  chipText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: TEXT_COLOR,
  },
  selectedChip: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  selectedChipText: {
    color: CARD_BG,
  },
  listCard: {
    flex: 1,
    elevation: 4,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: CARD_BG,
  },
  table: {
    flex: 1,
    padding: 16,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 8,
    marginBottom: 8,
  },
  headerText: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    textAlign: "left",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BACKGROUND_COLOR,
  },
  evenRow: { backgroundColor: CARD_BG },
  oddRow: { backgroundColor: BACKGROUND_COLOR },
  cell: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: TEXT_COLOR,
  },
  noData: {
    textAlign: "center",
    padding: 30,
    color: "#7f8c8d",
    fontFamily: "Poppins_400Regular",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 16,
  },
  paginationButtonLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
  },
  pageInfo: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: TEXT_COLOR,
  },
  mobileList: {
    padding: 10,
  },
  mobileCard: {
    marginBottom: 10,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: CARD_BG,
  },
  mobileCardContent: {
    paddingVertical: 12,
  },
  mobileCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  mobileCardTitle: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: TEXT_COLOR,
  },
  mobileCardSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#7f8c8d",
  },
});

export default StockTransactionsScreen;
