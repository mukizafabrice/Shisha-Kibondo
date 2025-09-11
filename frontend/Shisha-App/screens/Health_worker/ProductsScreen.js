import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Dimensions,
  Alert,
  Platform,
} from "react-native";
import {
  TextInput,
  Card,
  Button,
  IconButton,
  Surface,
  Modal,
  Portal,
  Provider,
  Menu,
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

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const ProductScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [menuVisible, setMenuVisible] = useState(false);
  const [sortOption, setSortOption] = useState("Newest");

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data || []);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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

  const handleUpdate = async () => {
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
    let filtered = [...products]; // Create a copy to avoid mutating state directly

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description &&
            p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    switch (sortOption) {
      case "Name A-Z":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Name Z-A":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "Oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      default: // Newest
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filtered;
  }, [products, searchQuery, sortOption]);

  if (loading || !fontsLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Provider>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Surface style={styles.container}>
          {/* Header with Title and Add Button */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Products</Text>
          </View>

          {/* Search and Sort Filter Section */}
          <View style={styles.filtersRow}>
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
              outlineColor="#dcdcdc"
              theme={{ roundness: 10 }}
            />
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setMenuVisible(true)}
                  style={styles.sortButton}
                  labelStyle={styles.sortButtonLabel}
                  contentStyle={{ paddingHorizontal: 0 }}
                  icon="filter-variant"
                >
                  {sortOption}
                </Button>
              }
            >
              {["Newest", "Oldest", "Name A-Z", "Name Z-A"].map((option) => (
                <Menu.Item
                  key={option}
                  onPress={() => {
                    setSortOption(option);
                    setMenuVisible(false);
                  }}
                  title={option}
                />
              ))}
            </Menu>
          </View>

          {/* Product List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={[styles.productList, { maxHeight: SCREEN_HEIGHT * 0.7 }]}
          >
            {filteredProducts.length === 0 && (
              <Text style={styles.emptyText}>No products found.</Text>
            )}
            {filteredProducts.map((product) => (
              <Card key={product._id} style={styles.productCard}>
                <View style={styles.cardContent}>
                  <View style={styles.textContainer}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {product.name}
                    </Text>
                    {product.description ? (
                      <Text style={styles.productDescription} numberOfLines={2}>
                        {product.description}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </Card>
            ))}
          </ScrollView>

          {/* Edit Modal */}
        </Surface>
      </KeyboardAvoidingView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F0F2F5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: Platform.OS === "android" ? 20 : 0, // Add a bit of top margin for Android
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: "Poppins_700Bold",
    color: "#2c3e50",
  },
  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    marginRight: 10,
    height: 50,
    backgroundColor: "#fff",
  },
  sortButton: {
    height: 50,
    justifyContent: "center",
    borderRadius: 10,
    borderColor: "#dcdcdc",
  },
  sortButtonLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: "#555",
  },
  productList: {
    paddingHorizontal: 0,
  },
  productCard: {
    marginBottom: 12,
    borderRadius: 15,
    elevation: 4,
    backgroundColor: "#fff",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: "#34495e",
  },
  productDescription: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#7f8c8d",
    marginTop: 5,
  },
  actionsContainer: {
    flexDirection: "row",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#7f8c8d",
    marginTop: 40,
    fontStyle: "italic",
    fontFamily: "Poppins_400Regular",
  },
  modal: {
    backgroundColor: "white",
    padding: 30,
    margin: 20,
    borderRadius: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 20,
    textAlign: "center",
    color: "#34495e",
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  descriptionInput: {
    height: 100,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 10,
  },
});

export default ProductScreen;
