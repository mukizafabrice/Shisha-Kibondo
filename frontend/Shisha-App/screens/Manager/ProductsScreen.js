import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import {
  TextInput,
  Button,
  Card,
  IconButton,
  Chip,
  Surface,
  Modal,
  Portal,
  Provider,
} from "react-native-paper";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import {
  getAllProducts,
  deleteProduct,
  updateProduct,
} from "../../services/ProductService.js";

const ProductScreen = ({navigation}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const categories = ["All"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data || []);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProduct(id);
              setProducts(products.filter((p) => p._id !== id));
              Alert.alert("Deleted", "Product deleted successfully.");
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditDescription(product.description || "");
    setEditModalVisible(true);
  };

  const handleUpdate = async ({}) => {
    if (!editName.trim()) {
      Alert.alert("Validation Error", "Product name is required");
      return;
    }
    try {
      const updated = await updateProduct(editingProduct._id, {
        name: editName,
        description: editDescription,
      });
      setProducts(products.map((p) => (p._id === updated._id ? updated : p)));
      setEditModalVisible(false);
      setEditingProduct(null);
      Alert.alert("Success", "Product updated successfully");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };
  const handleAddProduct = () => {
    navigation.navigate("AddProduct");
  };

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory !== "All")
      filtered = filtered.filter((p) => p.category === selectedCategory);
    if (searchQuery.trim())
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description &&
            p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    return filtered;
  }, [products, searchQuery, selectedCategory]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerText, styles.nameColumn]}>Name</Text>
      <Text style={[styles.headerText, styles.descriptionColumn]}>
        Description
      </Text>
      <Text style={[styles.headerText, styles.actionsColumn]}>Actions</Text>
    </View>
  );

  const renderRow = (product, index) => (
    <View
      key={product._id}
      style={[styles.row, index % 2 === 0 ? styles.evenRow : styles.oddRow]}
    >
      <Text style={[styles.cellText, styles.nameColumn]}>{product.name}</Text>
      <Text style={[styles.cellText, styles.descriptionColumn]}>
        {product.description || "N/A"}
      </Text>
      <View style={styles.actionsColumn}>
        <IconButton
          icon="pencil"
          size={18}
          iconColor="#f39c12"
          onPress={() => openEditModal(product)}
        />
        <IconButton
          icon="delete"
          size={18}
          iconColor="#e74c3c"
          onPress={() => handleDelete(product._id)}
        />
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <Button
        mode="contained"
        disabled={currentPage === 1}
        onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
      >
        Previous
      </Button>
      <Text style={styles.pageInfo}>
        Page {currentPage} of {totalPages || 1}
      </Text>
      <Button
        mode="contained"
        disabled={currentPage === totalPages}
        onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
      >
        Next
      </Button>
    </View>
  );

  if (loading || !fontsLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Provider>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <Surface style={styles.container}>
          {/* Add Product Button */}
          <Card style={styles.card}>
            <Card.Content>
              <Button
                icon="plus"
                mode="contained"
                onPress={handleAddProduct}
                style={styles.button}
                buttonColor="#007AFF"
              >
                Add Product
              </Button>
            </Card.Content>
          </Card>

          {/* Search */}
          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                placeholder="Search products..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                left={<TextInput.Icon icon="magnify" />}
                right={
                  searchQuery ? (
                    <TextInput.Icon
                      icon="close"
                      onPress={() => setSearchQuery("")}
                    />
                  ) : null
                }
                mode="outlined"
                style={styles.searchInput}
              />
            </Card.Content>
          </Card>

          {/* Table */}
          <View style={styles.tableCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.tableWrapper}>
                {renderHeader()}
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((p, idx) => renderRow(p, idx))
                ) : (
                  <Text style={styles.empty}>No products found</Text>
                )}
              </View>
            </ScrollView>
          </View>

          {/* Pagination */}
          {totalPages > 1 && renderPagination()}

          {/* Edit Modal */}
          <Portal>
            <Modal
              visible={editModalVisible}
              onDismiss={() => setEditModalVisible(false)}
              contentContainerStyle={styles.modal}
            >
              <TextInput
                label="Product Name"
                value={editName}
                onChangeText={setEditName}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Description"
                value={editDescription}
                onChangeText={setEditDescription}
                mode="outlined"
                multiline
                style={styles.input}
              />
              <Button
                mode="contained"
                onPress={handleUpdate}
                buttonColor="#007AFF"
                style={{ marginBottom: 8 }}
              >
                Update
              </Button>
              <Button
                mode="outlined"
                onPress={() => setEditModalVisible(false)}
              >
                Cancel
              </Button>
            </Modal>
          </Portal>
        </Surface>
      </KeyboardAvoidingView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8f9fa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { marginBottom: 16, elevation: 2 },
  searchInput: { backgroundColor: "#fff", height: 40 },
  tableCard: { flex: 1, elevation: 2 },
  tableWrapper: { minWidth: 400, backgroundColor: "#fff" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#34495e",
    padding: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  headerText: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  evenRow: { backgroundColor: "#f8f9fa" },
  oddRow: { backgroundColor: "#fff" },
  cellText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    color: "#2c3e50",
  },
  nameColumn: { width: 150, textAlign: "left" },
  descriptionColumn: { width: 250, textAlign: "left" },
  actionsColumn: { width: 100, flexDirection: "row", justifyContent: "center" },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: 10,
  },
  pageInfo: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#7f8c8d",
    alignSelf: "center",
  },
  empty: {
    textAlign: "center",
    fontSize: 16,
    color: "#7f8c8d",
    padding: 40,
    fontStyle: "italic",
  },
  modal: { backgroundColor: "white", padding: 20, margin: 20, borderRadius: 8 },
  input: { marginBottom: 16, backgroundColor: "#fff" },
});

export default ProductScreen;
