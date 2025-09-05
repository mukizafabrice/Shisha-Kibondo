import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Button, Card, Surface, IconButton } from "react-native-paper";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import DistributeToUmunyabuzimaService from "../../services/distributeToUmunyabuzimaService";

const UserDistributionsScreen = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDistributions();
  }, []);

  // Refresh distributions when returning from edit screen
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchDistributions);
    return unsubscribe;
  }, [navigation]);

  const fetchDistributions = async () => {
    try {
      const data = await DistributeToUmunyabuzimaService.getAllDistributions(); // fetch all
      console.log("Fetched distributions:", data);
      setDistributions(data.data || []);
    } catch (error) {
      console.error("Error fetching distributions:", error);
      Alert.alert("Error", "Failed to fetch distributions. Please try again.");
      setDistributions([]);
    } finally {
      setLoading(false);
    }
  };

  const paginatedDistributions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return distributions.slice(startIndex, startIndex + itemsPerPage);
  }, [distributions, currentPage]);

  const totalPages = Math.ceil(distributions.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [distributions]);

  const handleCreateDistribution = () => {
    navigation.navigate("AddDistribution");
  };

  const handleEdit = (distribution) => {
    navigation.navigate("AddDistribution", { distribution, isEditMode: true });
  };

  const handleDelete = async (distributionId) => {
    Alert.alert(
      "Delete Distribution",
      "Are you sure you want to delete this distribution?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await DistributeToUmunyabuzimaService.deleteDistribution(
                distributionId
              );
              setDistributions(
                distributions.filter((dist) => dist._id !== distributionId)
              );
              Alert.alert("Success", "Distribution deleted successfully");
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <Button
        mode="contained"
        onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
        style={styles.pageButton}
      >
        Previous
      </Button>

      <Text style={styles.pageInfo}>
        Page {currentPage} of {totalPages || 1}
      </Text>

      <Button
        mode="contained"
        onPress={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages}
        style={styles.pageButton}
      >
        Next
      </Button>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerText, styles.dateColumn]}>Date</Text>
      <Text style={[styles.headerText, styles.quantityColumn]}>Quantity</Text>
      <Text style={[styles.headerText, styles.actionsColumn]}>Actions</Text>
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
    <Surface style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text style={styles.userNameText}>All Distributions</Text>
        </Card.Content>
      </Card>

      <Card style={styles.buttonCard}>
        <Card.Content>
          <View style={styles.buttonContainer}>
            <Button
              icon="plus"
              mode="contained"
              onPress={handleCreateDistribution}
              style={styles.createButton}
              buttonColor="#28a745"
            >
              Create Distribution
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.resultsText}>
            Showing {paginatedDistributions.length} of {distributions.length}{" "}
            distributions
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tableWrapper}>
            {renderHeader()}
            {paginatedDistributions.length > 0 ? (
              paginatedDistributions.map((item, index) => (
                <View
                  key={item._id}
                  style={[
                    styles.distributionRow,
                    index % 2 === 0 ? styles.evenRow : styles.oddRow,
                  ]}
                >
                  <Text style={[styles.cellText, styles.dateColumn]}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                  <Text style={[styles.cellText, styles.quantityColumn]}>
                    {item.quantity}
                  </Text>
                  <View style={[styles.actions, styles.actionsColumn]}>
                    <IconButton
                      icon="pencil"
                      size={16}
                      iconColor="#3498db"
                      onPress={() => handleEdit(item)}
                    />
                    <IconButton
                      icon="delete"
                      size={16}
                      iconColor="#e74c3c"
                      onPress={() => handleDelete(item._id)}
                    />
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.empty}>No distributions found</Text>
            )}
          </View>
        </ScrollView>
      </View>

      {totalPages > 1 && (
        <Card style={styles.paginationCard}>
          <Card.Content>{renderPagination()}</Card.Content>
        </Card>
      )}
    </Surface>
  );
};

// Keep your styles unchanged
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8f9fa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerCard: { marginBottom: 16, elevation: 2, backgroundColor: "#e6f3ff" },
  userNameText: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: "#007AFF",
    textAlign: "center",
  },
  buttonCard: { marginBottom: 16, elevation: 2 },
  buttonContainer: { alignItems: "center" },
  createButton: { minWidth: 200, borderRadius: 6 },
  summaryCard: { marginBottom: 16, elevation: 1, backgroundColor: "#e8f4fd" },
  resultsText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#5dade2",
    textAlign: "center",
  },
  tableCard: { flex: 1, elevation: 2, marginBottom: 16 },
  tableWrapper: { minWidth: 400, backgroundColor: "#fff" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#34495e",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerText: {
    color: "#ecf0f1",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    textAlign: "center",
  },
  distributionRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  evenRow: { backgroundColor: "#f8f9fa" },
  oddRow: { backgroundColor: "#fff" },
  cellText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    color: "#2c3e50",
  },
  dateColumn: { width: 120, textAlign: "left" },
  quantityColumn: { width: 100 },
  actionsColumn: { width: 120, alignItems: "center" },
  actions: { flexDirection: "row", justifyContent: "center" },
  paginationCard: { elevation: 2 },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  pageButton: { flex: 1, marginHorizontal: 5 },
  pageInfo: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#7f8c8d",
  },
  empty: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#7f8c8d",
    padding: 40,
    fontStyle: "italic",
  },
});

export default UserDistributionsScreen;
