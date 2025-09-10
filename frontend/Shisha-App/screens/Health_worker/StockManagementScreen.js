import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
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

// Assuming these services exist and are functional
import { getAllStocks } from "../../services/stockService";

const StockScreen = ({ navigation }) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter state
  const [userOpen, setUserOpen] = useState(false);
  const [filterUser, setFilterUser] = useState(null);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const data = await getAllStocks();
      setStocks(data);
    } catch (error) {
      console.error("Failed to fetch stocks:", error);
      // In a real app, you might use a custom toast or alert here
    } finally {
      setLoading(false);
    }
  };

  const users = useMemo(() => {
    const uniqueUsers = new Set();
    const userList = [];
    stocks.forEach((stock) => {
      const user = stock.userId;
      if (user && user.name && !uniqueUsers.has(user._id)) {
        uniqueUsers.add(user._id);
        userList.push({ label: user.name, value: user._id });
      }
    });
    return userList;
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    let filtered = stocks;
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((s) =>
        s.productId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // Filter by user
    if (filterUser) {
      filtered = filtered.filter((s) => s.userId?._id === filterUser);
    }
    return filtered;
  }, [stocks, searchQuery, filterUser]);

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

        {/* Controls Card */}
        <Card style={styles.controlsCard}>
          <Card.Content>
            {/* Search Input */}
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

            {/* User Filter */}
            <Text style={styles.filterLabel}>Filter by User</Text>
            <DropDownPicker
              open={userOpen}
              value={filterUser}
              items={users}
              setOpen={setUserOpen}
              setValue={setFilterUser}
              placeholder="Select a user"
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              dropDownContainerStyle={styles.dropdownInnerContainer}
              theme="LIGHT"
              listMode="SCROLLVIEW"
            />
          </Card.Content>
        </Card>

        {/* Stock List (Cards) */}
        {filteredStocks.length > 0 ? (
          <ScrollView style={styles.stockList}>
            {filteredStocks.map((s) => (
              <Card key={s._id} style={styles.stockCard}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>
                      {s.productId?.name || "Product N/A"}
                    </Text>
                    <Text style={styles.cardStockValue}>
                      {s.totalStock !== undefined ? s.totalStock : "N/A"}
                    </Text>
                  </View>
                  <View style={styles.cardDetails}>
                    <Text style={styles.cardLabel}>User:</Text>
                    <Text style={styles.cardValue}>
                      {s.userId?.name || "N/A"}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.empty}>No stocks found.</Text>
        )}
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
  searchInput: { marginBottom: 12, backgroundColor: "#fff", borderRadius: 8 },
  filterLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: "#7f8c8d",
    marginBottom: 8,
  },
  dropdown: { borderColor: "#ccc" },
  dropdownContainer: { marginBottom: 12 },
  dropdownInnerContainer: { borderColor: "#ccc" },

  stockList: {
    flex: 1,
  },
  stockCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "#fff",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
    paddingBottom: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#2c3e50",
  },
  cardStockValue: {
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    color: "#007AFF",
  },
  cardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: "#7f8c8d",
  },
  cardValue: {
    fontFamily: "Poppins_400Regular",
    color: "#2c3e50",
    textAlign: "right",
  },
  empty: {
    textAlign: "center",
    padding: 40,
    color: "#7f8c8d",
    fontFamily: "Poppins_400Regular",
  },
});

export default StockScreen;
