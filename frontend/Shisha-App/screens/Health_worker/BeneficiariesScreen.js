import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import {
  TextInput,
  Button,
  Chip,
  Card,
  Surface,
  IconButton,
} from "react-native-paper";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { useAuth } from "../../context/AuthContext";
import BeneficiaryService from "../../services/beneficiaryService";
import DistributeToUmunyabuzimaService from "../../services/distributeToUmunyabuzimaService";
import UserService from "../../services/userService";

const BeneficiariesScreen = ({ navigation, route }) => {
  const { logout } = useAuth();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFocused, setSearchFocused] = useState(false);
  const itemsPerPage = 10;

  const { userId } = route.params || {};

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  // Filter and search beneficiaries
  const filteredBeneficiaries = useMemo(() => {
    let filtered = beneficiaries;

    // Filter by status
    if (selectedStatus !== "All") {
      filtered = filtered.filter(
        (beneficiary) => beneficiary.status === selectedStatus
      );
    }

    // Filter by type
    if (selectedType !== "All") {
      filtered = filtered.filter(
        (beneficiary) => beneficiary.type === selectedType
      );
    }

    // Search by name, national ID, or village
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (beneficiary) =>
          `${beneficiary.firstName} ${beneficiary.lastName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          beneficiary.nationalId
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          beneficiary.village.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [beneficiaries, selectedStatus, selectedType, searchQuery]);

  // Paginate beneficiaries
  const paginatedBeneficiaries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBeneficiaries.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBeneficiaries, currentPage]);

  const totalPages = Math.ceil(filteredBeneficiaries.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, selectedType, searchQuery]);

  const fetchBeneficiaries = async () => {
    try {
     
      const data = await BeneficiaryService.getBeneficiariesByUser();
      console.log("Fetched beneficiaries:", data);
      setBeneficiaries(data.data || []);
    } catch (error) {
      console.error("Error fetching beneficiaries:", error);
      Alert.alert("Error", "Failed to fetch beneficiaries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (beneficiaryId) => {
    Alert.alert(
      "Delete Beneficiary",
      "Are you sure you want to delete this beneficiary?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await BeneficiaryService.deleteBeneficiary(beneficiaryId);
              setBeneficiaries(
                beneficiaries.filter(
                  (beneficiary) => beneficiary._id !== beneficiaryId
                )
              );
              Alert.alert("Success", "Beneficiary deleted successfully");
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  const handleEdit = (beneficiary) => {
    navigation.navigate("AddBeneficiary", { beneficiary });
  };

  // Refresh beneficiaries when returning from edit screen
  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchBeneficiaries();
    });
    return unsubscribe;
  }, [navigation]);

  const handleViewDetails = (beneficiary) => {
    navigation.navigate("BeneficiaryDetails", {
      beneficiaryId: beneficiary._id,
    });
  };

  const handleAddBeneficiary = () => {
    navigation.navigate("AddBeneficiary", { userId });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#28a745";
      case "inactive":
        return "#6c757d";
      default:
        return "#6c757d";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "pregnant":
        return "#e91e63";
      case "breastfeeding":
        return "#ff9800";
      case "child":
        return "#4caf50";
      default:
        return "#6c757d";
    }
  };

  const statuses = ["All", "active", "inactive"];
  const types = ["All", "pregnant", "breastfeeding", "child"];

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
      <Text style={[styles.headerText, styles.nameColumn]}>Name</Text>
      <Text style={[styles.headerText, styles.idColumn]}>National ID</Text>
      <Text style={[styles.headerText, styles.villageColumn]}>Village</Text>
      <Text style={[styles.headerText, styles.typeColumn]}>Type</Text>
      <Text style={[styles.headerText, styles.statusColumn]}>Status</Text>
      <View style={[styles.actionsColumn]}>
        <Text style={styles.headerText}>Actions</Text>
      </View>
    </View>
  );

  const renderBeneficiary = ({ item, index }) => (
    <View
      style={[
        styles.beneficiaryRow,
        index % 2 === 0 ? styles.evenRow : styles.oddRow,
      ]}
    >
      <Text
        style={[styles.cellText, styles.nameColumn]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {item.firstName} {item.lastName}
      </Text>
      <Text
        style={[styles.cellText, styles.idColumn]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {item.nationalId}
      </Text>
      <Text
        style={[styles.cellText, styles.villageColumn]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {item.village}
      </Text>
      <Text
        style={[styles.cellText, styles.typeColumn]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {item.type}
      </Text>
      <Text
        style={[styles.cellText, styles.statusColumn]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {item.status}
      </Text>
      <View style={[styles.actions, styles.actionsColumn]}>
        <IconButton
          icon="eye"
          size={16}
          iconColor="#3498db"
          onPress={() => handleViewDetails(item)}
          style={styles.iconButton}
        />
        <IconButton
          icon="pencil"
          size={16}
          iconColor="#f39c12"
          onPress={() => handleEdit(item)}
          style={styles.iconButton}
        />
        <IconButton
          icon="delete"
          size={16}
          iconColor="#e74c3c"
          onPress={() => handleDelete(item._id)}
          style={styles.iconButton}
        />
      </View>
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
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior="padding"
    >
      <Surface style={styles.container}>
        {/* Action Buttons */}
     

        {/* Search and Filter Controls */}
        <Card style={styles.controlsCard}>
          <Card.Content>
            <View style={styles.searchContainer}>
              <TextInput
                label=""
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
                style={[
                  styles.searchInput,
                  searchFocused && styles.searchInputFocused,
                ]}
                placeholder="Search beneficiaries..."
                dense={true}
                theme={{ colors: { primary: "#007AFF" } }}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </View>

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
                    compact={true}
                  >
                    {status === "All" ? "All" : status}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Filter by Type:</Text>
              <View style={styles.filterButtons}>
                {types.map((type) => (
                  <Chip
                    key={type}
                    mode={selectedType === type ? "flat" : "outlined"}
                    selected={selectedType === type}
                    onPress={() => setSelectedType(type)}
                    style={
                      selectedType === type ? styles.selectedChip : styles.chip
                    }
                    compact={true}
                  >
                    {type === "All" ? "All" : type}
                  </Chip>
                ))}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Results Summary */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.resultsText}>
              Showing {paginatedBeneficiaries.length} of{" "}
              {filteredBeneficiaries.length} beneficiaries
            </Text>
          </Card.Content>
        </Card>

        {/* Beneficiaries Table */}
        <View style={styles.tableCard}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            <View style={styles.tableWrapper}>
              {renderHeader()}
              {paginatedBeneficiaries.length > 0 ? (
                paginatedBeneficiaries.map((item, index) => (
                  <View
                    key={item._id}
                    style={[
                      styles.beneficiaryRow,
                      index % 2 === 0 ? styles.evenRow : styles.oddRow,
                    ]}
                  >
                    <Text
                      style={[styles.cellText, styles.nameColumn]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.firstName} {item.lastName}
                    </Text>
                    <Text
                      style={[styles.cellText, styles.idColumn]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.nationalId}
                    </Text>
                    <Text
                      style={[styles.cellText, styles.villageColumn]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.village}
                    </Text>
                    <Text
                      style={[styles.cellText, styles.typeColumn]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.type}
                    </Text>
                    <Text
                      style={[styles.cellText, styles.statusColumn]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.status}
                    </Text>
                    <View style={[styles.actions, styles.actionsColumn]}>
                      <IconButton
                        icon="eye"
                        size={16}
                        iconColor="#3498db"
                        onPress={() => handleViewDetails(item)}
                        style={styles.iconButton}
                      />
                      <IconButton
                        icon="pencil"
                        size={16}
                        iconColor="#f39c12"
                        onPress={() => handleEdit(item)}
                        style={styles.iconButton}
                      />
                      <IconButton
                        icon="delete"
                        size={16}
                        iconColor="#e74c3c"
                        onPress={() => handleDelete(item._id)}
                        style={styles.iconButton}
                      />
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.empty}>No beneficiaries found</Text>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card style={styles.paginationCard}>
            <Card.Content>{renderPagination()}</Card.Content>
          </Card>
        )}
      </Surface>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  buttonsContainer: {
    alignItems: "center",
  },
  button: {
    minWidth: 200,
    borderRadius: 6,
  },
  controlsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: "#fff",
    height: 40,
  },
  searchInputFocused: {
    backgroundColor: "#e6f3ff",
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
  summaryCard: {
    marginBottom: 16,
    elevation: 1,
    backgroundColor: "#e8f4fd",
  },
  resultsText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#5dade2",
    textAlign: "center",
  },
  tableCard: {
    flex: 1,
    elevation: 2,
    marginBottom: 16,
  },
  horizontalScroll: {
    flex: 1,
  },
  tableWrapper: {
    minWidth: 700,
    backgroundColor: "#fff",
  },
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
  beneficiaryRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  evenRow: {
    backgroundColor: "#f8f9fa",
  },
  oddRow: {
    backgroundColor: "#fff",
  },
  cellText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    color: "#2c3e50",
  },
  nameColumn: {
    width: 140,
    textAlign: "left",
  },
  idColumn: {
    width: 100,
  },
  villageColumn: {
    width: 100,
  },
  typeColumn: {
    width: 80,
  },
  statusColumn: {
    width: 70,
  },
  actionsColumn: {
    width: 100,
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
  },
  iconButton: {
    marginHorizontal: 2,
    marginVertical: 0,
  },
  paginationCard: {
    elevation: 2,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  pageButton: {
    flex: 1,
    marginHorizontal: 5,
  },
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

export default BeneficiariesScreen;
