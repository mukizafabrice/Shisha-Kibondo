import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import {
  TextInput,
  Button,
  Chip,
  Card,
  Surface,
  IconButton,
  Portal,
  Modal,
  Divider,
  ProgressBar,
} from "react-native-paper";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import { useAuth } from "../../context/AuthContext";
import BeneficiaryService from "../../services/beneficiaryService";

const BLUE = "#007AFF";
const ITEMS_PER_PAGE = 8;
const PROGRAM_DAYS = 180; // 6 months

const BeneficiariesScreen = ({ navigation, route }) => {
  const { logout } = useAuth();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useAuth();
  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    setLoading(true);
    try {
      const userId = user?.id;
      console.log("Fetching beneficiaries for userId:", userId);
      const data = await BeneficiaryService.getBeneficiary(userId);
      setBeneficiaries(data.data || []);
    } catch (err) {
      console.error("fetchBeneficiaries:", err);
      Alert.alert("Error", "Failed to fetch beneficiaries.");
    } finally {
      setLoading(false);
    }
  };

  const filteredBeneficiaries = useMemo(() => {
    let list = beneficiaries;
    if (selectedStatus !== "All")
      list = list.filter((b) => b.status === selectedStatus);
    if (selectedType !== "All")
      list = list.filter((b) => b.type === selectedType);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          `${b.firstName} ${b.lastName}`.toLowerCase().includes(q) ||
          (b.nationalId || "").toLowerCase().includes(q) ||
          (b.village || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [beneficiaries, selectedStatus, selectedType, searchQuery]);

  const paginatedBeneficiaries = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBeneficiaries.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBeneficiaries, currentPage]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBeneficiaries.length / ITEMS_PER_PAGE)
  );

  const calculateProgramMeta = (b) => {
    const created = b?.createdAt ? new Date(b.createdAt) : new Date();
    const endDate = new Date(created);
    endDate.setDate(created.getDate() + PROGRAM_DAYS);

    const totalDays = Number(b?.totalProgramDays) || PROGRAM_DAYS;
    const completed = Number(b?.completedDays) || 0;
    const remainingDays = Math.max(totalDays - completed, 0);
    const attendance =
      totalDays > 0 ? Math.round((completed / totalDays) * 100) : 0;
    return {
      createdAt: created,
      endDate,
      totalDays,
      completed,
      remainingDays,
      attendance,
      completionPercent: Math.min(1, completed / totalDays),
    };
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "N/A");

  const openModalWith = (b) => {
    setSelectedBeneficiary(b);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    Alert.alert("Delete Beneficiary", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await BeneficiaryService.deleteBeneficiary(id);
            setBeneficiaries((prev) => prev.filter((p) => p._id !== id));
            Alert.alert("Deleted", "Beneficiary removed.");
          } catch (err) {
            console.error("delete beneficiary:", err);
            Alert.alert("Error", err?.message || "Delete failed.");
          }
        },
      },
    ]);
  };

  if (loading || !fontsLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Surface style={styles.container}>
        {/* Header */}
        <View style={styles.topRow}>
          <Button
            icon="account-plus"
            mode="contained"
            onPress={() => navigation.navigate("AddBeneficiary", { userId })}
            style={styles.addButton}
            buttonColor={BLUE}
            labelStyle={styles.buttonLabel}
          >
            Add Beneficiary
          </Button>
          <Button
            icon="refresh"
            mode="outlined"
            onPress={fetchBeneficiaries}
            style={styles.refreshButton}
            textColor={BLUE}
            labelStyle={styles.buttonLabel}
          >
            Refresh
          </Button>
        </View>

        {/* Search */}
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          mode="outlined"
          placeholder="Search beneficiaries..."
          left={<TextInput.Icon icon="magnify" />}
          style={styles.searchInput}
          outlineStyle={styles.textInputOutline}
          theme={{ colors: { primary: BLUE } }}
        />

        {/* Filters */}
        <View style={styles.filterSection}>
          <View style={styles.filterBlock}>
            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.chipsRow}>
              {["All", "active", "inactive"].map((s) => (
                <Chip
                  key={s}
                  selected={selectedStatus === s}
                  onPress={() => setSelectedStatus(s)}
                  style={[
                    styles.chip,
                    selectedStatus === s && styles.selectedChip,
                  ]}
                  textStyle={styles.chipText}
                  selectedColor={BLUE}
                  showSelectedCheck={false}
                >
                  {s}
                </Chip>
              ))}
            </View>
          </View>

          <View style={styles.filterBlock}>
            <Text style={styles.filterLabel}>Type</Text>
            <View style={styles.chipsRow}>
              {["All", "pregnant", "breastfeeding", "child"].map((t) => (
                <Chip
                  key={t}
                  selected={selectedType === t}
                  onPress={() => setSelectedType(t)}
                  style={[
                    styles.chip,
                    selectedType === t && styles.selectedChip,
                  ]}
                  textStyle={styles.chipText}
                  selectedColor={BLUE}
                  showSelectedCheck={false}
                >
                  {t}
                </Chip>
              ))}
            </View>
          </View>
        </View>

        {/* Beneficiary List */}
        <ScrollView style={styles.listContainer}>
          {paginatedBeneficiaries.length > 0 ? (
            paginatedBeneficiaries.map((b) => (
              <Card key={b._id} style={styles.card}>
                <Card.Content>
                  <View style={styles.rowBetween}>
                    <View>
                      <Text style={styles.name}>
                        {b.firstName} {b.lastName}
                      </Text>
                      <Chip
                        style={styles.typeTag}
                        textStyle={styles.typeTagText}
                      >
                        {b.type}
                      </Chip>
                    </View>
                    <View style={{ flexDirection: "row" }}>
                      <IconButton
                        icon="eye"
                        iconColor={BLUE}
                        onPress={() => openModalWith(b)}
                        size={22}
                      />
                      <IconButton
                        icon="pencil"
                        iconColor="#f39c12"
                        onPress={() =>
                          navigation.navigate("AddBeneficiary", {
                            beneficiary: b,
                          })
                        }
                        size={22}
                      />
                      <IconButton
                        icon="delete"
                        iconColor="#e74c3c"
                        onPress={() => handleDelete(b._id)}
                        size={22}
                      />
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Text style={styles.empty}>No beneficiaries found.</Text>
          )}
        </ScrollView>

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={styles.pagination}>
            <Button
              mode="contained"
              onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              buttonColor={BLUE}
              labelStyle={styles.buttonLabel}
            >
              Prev
            </Button>
            <Text style={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </Text>
            <Button
              mode="contained"
              onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              buttonColor={BLUE}
              labelStyle={styles.buttonLabel}
            >
              Next
            </Button>
          </View>
        )}

        {/* Modal */}
        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            {selectedBeneficiary && (
              <ScrollView style={styles.modalScroll}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {selectedBeneficiary.firstName}{" "}
                    {selectedBeneficiary.lastName}
                  </Text>
                  <Button
                    mode="outlined"
                    onPress={() => setModalVisible(false)}
                    textColor={BLUE}
                    style={{ height: 36 }}
                    labelStyle={styles.buttonLabel}
                  >
                    Close
                  </Button>
                </View>

                <Divider style={styles.divider} />

                {/* Personal Info Card */}
                <Card style={styles.modalCard}>
                  <Card.Title
                    title="Personal Info"
                    titleStyle={styles.cardTitle}
                  />
                  <Card.Content>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>National ID:</Text>
                      <Text style={styles.detailValue}>
                        {selectedBeneficiary.nationalId || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Village:</Text>
                      <Text style={styles.detailValue}>
                        {selectedBeneficiary.village || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>
                        Assigned Umunyabuzima:
                      </Text>
                      <Text style={styles.detailValue}>
                        {selectedBeneficiary.userId?.name || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Type:</Text>
                      <Text style={styles.detailValue}>
                        {selectedBeneficiary.type}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status:</Text>
                      <Text style={styles.detailValue}>
                        {selectedBeneficiary.status}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>

                {/* Program Info Card */}
                <Card style={styles.modalCard}>
                  <Card.Title
                    title="Program Details"
                    titleStyle={styles.cardTitle}
                  />
                  <Card.Content>
                    {(() => {
                      const meta = calculateProgramMeta(selectedBeneficiary);
                      return (
                        <>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Total Days:</Text>
                            <Text style={styles.detailValue}>
                              {Number(selectedBeneficiary.totalProgramDays) ||
                                PROGRAM_DAYS}
                            </Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>
                              Completed Days:
                            </Text>
                            <Text style={styles.detailValue}>
                              {Number(selectedBeneficiary.completedDays) || 0}
                            </Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>
                              Attendance Rate:
                            </Text>
                            <Text style={styles.detailValue}>
                              {Number(selectedBeneficiary.attendanceRate) || 0}%
                            </Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>
                              Registered On:
                            </Text>
                            <Text style={styles.detailValue}>
                              {formatDate(selectedBeneficiary.createdAt)}
                            </Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>End Date:</Text>
                            <Text style={styles.detailValue}>
                              {formatDate(meta.endDate)}
                            </Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>
                              Remaining Days:
                            </Text>
                            <Text style={styles.detailValue}>
                              {meta.remainingDays}
                            </Text>
                          </View>

                          {/* Progress */}
                          <View style={{ marginTop: 12 }}>
                            <Text
                              style={[styles.detailLabel, { marginBottom: 4 }]}
                            >
                              Program Completion
                            </Text>
                            <ProgressBar
                              progress={meta.completionPercent}
                              color={BLUE}
                              style={styles.modalProgress}
                            />
                            <Text style={styles.progressText}>
                              {Math.round(meta.completionPercent * 100)}%
                              completed
                            </Text>
                          </View>
                        </>
                      );
                    })()}
                  </Card.Content>
                </Card>
              </ScrollView>
            )}
          </Modal>
        </Portal>
      </Surface>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  addButton: {
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    height: 48,
    justifyContent: "center",
  },
  refreshButton: {
    borderRadius: 8,
    width: 110,
    height: 48,
    justifyContent: "center",
  },
  buttonLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
  },
  searchInput: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  textInputOutline: {
    borderRadius: 12,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterBlock: {
    marginBottom: 12,
  },
  filterLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: "#34495e",
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8, // Use gap for modern spacing
  },
  chip: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
    paddingHorizontal: 4,
    minHeight: 36,
    justifyContent: "center",
  },
  selectedChip: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  chipText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: "#555",
  },
  listContainer: {
    flex: 1,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: "#fff",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#34495e",
  },
  typeTag: {
    backgroundColor: "#e0e0e0",
    alignSelf: "flex-start",
    marginTop: 4,
  },
  typeTagText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#333",
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    fontStyle: "italic",
    color: "#7f8c8d",
    fontFamily: "Poppins_400Regular",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  pageInfo: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: "#555",
  },
  modalContainer: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 16,
    padding: 20,
    maxHeight: "85%",
  },
  modalScroll: {
    paddingHorizontal: 6,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 22,
    color: BLUE,
  },
  divider: {
    marginVertical: 12,
  },
  modalCard: {
    borderRadius: 12,
    marginVertical: 8,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#34495e",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  detailLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: "#34495e",
  },
  detailValue: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#333",
    flexShrink: 1,
    textAlign: "right",
  },
  modalProgress: {
    height: 10,
    borderRadius: 6,
    marginTop: 6,
  },
  progressText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "right",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
});

export default BeneficiariesScreen;
