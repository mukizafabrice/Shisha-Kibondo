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
  Menu,
  ActivityIndicator,
} from "react-native-paper";
import { getTransactions } from "../../services/transactionService";
import { getAllProducts } from "../../services/ProductService";

const { width } = Dimensions.get("window");
const isDesktop = width > 768;

const StockTransactionsScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortDirection, setSortDirection] = useState("DESC");

  // Pagination
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

  // Filtered + Sorted
  const filteredTransactions = useMemo(() => {
    let data = [...transactions];

    // Search
    if (searchQuery.trim()) {
      data = data.filter((t) =>
        getProductName(t.productId)
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== "ALL") {
      data = data.filter((t) => t.type === typeFilter);
    }

    // Sort by date
    data.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortDirection === "ASC" ? dateA - dateB : dateB - dateA;
    });

    return data;
  }, [transactions, searchQuery, typeFilter, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.headerCard}>
        <Card.Title title="Stock Transactions" titleStyle={styles.title} />
      </Card>
      {/* Controls: Search, Filter, Sort */}
      <Card style={styles.controlsCard}>
        <Card.Content>
          <TextInput
            label="Search by product..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            mode="outlined"
            left={<TextInput.Icon icon="magnify" />}
            style={styles.input}
          />

          <View style={styles.row}>
            <MenuFilter
              title="Type"
              value={typeFilter}
              options={["ALL", "IN", "OUT"]}
              onSelect={setTypeFilter}
            />
            <MenuFilter
              title="Sort by Date"
              value={sortDirection}
              options={["ASC", "DESC"]}
              onSelect={setSortDirection}
            />
          </View>
        </Card.Content>
      </Card>
      {/* Table */}
      // Table
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.table, { minWidth: 400 }]}>
          <View style={[styles.tableHeader, { backgroundColor: "#2c3e50" }]}>
            <Text style={[styles.headerText, { flex: 3 }]}>Product</Text>
            <Text style={[styles.headerText, { flex: 1, textAlign: "center" }]}>
              Type
            </Text>
            <Text style={[styles.headerText, { flex: 1, textAlign: "center" }]}>
              Quantity
            </Text>
            <Text style={[styles.headerText, { flex: 2, textAlign: "center" }]}>
              Date
            </Text>
          </View>

          {paginatedTransactions.length > 0 ? (
            paginatedTransactions.map((t, i) => (
              <View
                key={t._id}
                style={[
                  styles.tableRow,
                  i % 2 === 0 ? styles.evenRow : styles.oddRow,
                ]}
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
                      color: t.type === "IN" ? "green" : "red",
                    },
                  ]}
                >
                  {t.type}
                </Text>
                <Text style={[styles.cell, { flex: 1, textAlign: "center" }]}>
                  {t.totalStock}
                </Text>
                <Text style={[styles.cell, { flex: 2, textAlign: "center" }]}>
                  {new Date(t.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>No transactions found.</Text>
          )}
        </View>
      </ScrollView>
      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <Button
            mode="outlined"
            onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Text style={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </Text>
          <Button
            mode="outlined"
            onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </View>
      )}
    </ScrollView>
  );
};

// Reusable Filter Menu
const MenuFilter = ({ title, value, options, onSelect }) => {
  const [visible, setVisible] = useState(false);
  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <Button
          mode="outlined"
          onPress={() => setVisible(true)}
          style={{ marginRight: 8 }}
        >
          {title}: {value}
        </Button>
      }
    >
      {options.map((opt) => (
        <Menu.Item
          key={opt}
          title={opt}
          onPress={() => {
            onSelect(opt);
            setVisible(false);
          }}
        />
      ))}
    </Menu>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f0f4f7" },
  headerCard: { marginBottom: 16, borderRadius: 12, elevation: 4 },
  title: { fontSize: 20, color: "#007AFF" },
  controlsCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    padding: 8,
  },
  input: { marginBottom: 12, backgroundColor: "#fff" },
  row: { flexDirection: "row", marginBottom: 8 },
  table: {
    minWidth: 400, // reduced width
    backgroundColor: "#fff",
    borderRadius: 8,
  },

  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerText: {
    color: "#fff", // white text for dark background
    fontWeight: "600",
    fontSize: 14,
    textAlign: "left",
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  evenRow: { backgroundColor: "#f8faff" },
  oddRow: { backgroundColor: "#fff" },
  cell: { fontSize: 14, fontWeight: "500", color: "#2c3e50" },
  noData: { textAlign: "center", padding: 20, color: "#7f8c8d" },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    alignItems: "center",
  },
  pageInfo: { fontSize: 14, fontWeight: "600", color: "#007AFF" },
});

export default StockTransactionsScreen;
