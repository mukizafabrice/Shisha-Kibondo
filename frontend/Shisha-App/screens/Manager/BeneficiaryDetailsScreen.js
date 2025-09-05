import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  Card,
  Surface,
  Button,
  Checkbox,
  TextInput,
  Chip,
  Badge,
  ProgressBar,
  IconButton,
  Divider,
} from "react-native-paper";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import BeneficiaryService from "../../services/beneficiaryService";

const BeneficiaryDetailsScreen = ({ route, navigation }) => {
  const { beneficiaryId } = route.params;

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [beneficiary, setBeneficiary] = useState(null);
  const [programDays, setProgramDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingAttendance, setUpdatingAttendance] = useState({});
  const [newDayNumber, setNewDayNumber] = useState("");
  const [newDayDate, setNewDayDate] = useState("");
  const [newDayType, setNewDayType] = useState("check-in");
  const [addingDay, setAddingDay] = useState(false);

  useEffect(() => {
    fetchBeneficiaryDetails();
    fetchProgramDays();
  }, [beneficiaryId]);

  const fetchBeneficiaryDetails = async () => {
    try {
      const data = await BeneficiaryService.getBeneficiary(beneficiaryId);
      setBeneficiary(data.data);
    } catch (error) {
      console.error("Error fetching beneficiary details:", error);
      Alert.alert("Error", "Failed to fetch beneficiary details. Please try again.");
    }
  };

  const fetchProgramDays = async () => {
    try {
      const data = await BeneficiaryService.getProgramDays(beneficiaryId, { limit: 100 });
      setProgramDays(data.data || []);
    } catch (error) {
      console.error("Error fetching program days:", error);
      Alert.alert("Error", "Failed to fetch program days. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchBeneficiaryDetails(), fetchProgramDays()]);
    setRefreshing(false);
  };

  const handleAttendanceChange = async (dayId, attended) => {
    setUpdatingAttendance(prev => ({ ...prev, [dayId]: true }));
    
    try {
      await BeneficiaryService.updateProgramDayAttendance(beneficiaryId, dayId, { attended });
      
      // Update local state
      setProgramDays(prev => 
        prev.map(day => 
          day._id === dayId ? { ...day, attended } : day
        )
      );
      
      // Refresh beneficiary details to get updated stats
      await fetchBeneficiaryDetails();
      
    } catch (error) {
      console.error("Error updating attendance:", error);
      Alert.alert("Error", "Failed to update attendance. Please try again.");
    } finally {
      setUpdatingAttendance(prev => ({ ...prev, [dayId]: false }));
    }
  };

  const handleAddProgramDay = async () => {
    if (!newDayNumber || !newDayDate) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    setAddingDay(true);
    try {
      const dayData = {
        dayNumber: parseInt(newDayNumber),
        date: new Date(newDayDate).toISOString(),
        activityType: newDayType,
      };

      await BeneficiaryService.addProgramDay(beneficiaryId, dayData);
      
      // Reset form
      setNewDayNumber("");
      setNewDayDate("");
      setNewDayType("check-in");
      
      // Refresh data
      await Promise.all([fetchBeneficiaryDetails(), fetchProgramDays()]);
      
      Alert.alert("Success", "Program day added successfully!");
    } catch (error) {
      console.error("Error adding program day:", error);
      Alert.alert("Error", error.message || "Failed to add program day. Please try again.");
    } finally {
      setAddingDay(false);
    }
  };

  const handleRemoveProgramDay = async (dayId) => {
    Alert.alert(
      "Remove Program Day",
      "Are you sure you want to remove this program day?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await BeneficiaryService.removeProgramDay(beneficiaryId, dayId);
              await Promise.all([fetchBeneficiaryDetails(), fetchProgramDays()]);
              Alert.alert("Success", "Program day removed successfully!");
            } catch (error) {
              console.error("Error removing program day:", error);
              Alert.alert("Error", "Failed to remove program day. Please try again.");
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "#28a745";
      case "inactive": return "#6c757d";
      default: return "#6c757d";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "pregnant": return "#e91e63";
      case "breastfeeding": return "#ff9800";
      case "child": return "#4caf50";
      default: return "#6c757d";
    }
  };

  const getActivityTypeColor = (type) => {
    switch (type) {
      case "check-in": return "#007AFF";
      case "attendance": return "#28a745";
      case "activity": return "#ff9800";
      case "assessment": return "#e91e63";
      default: return "#6c757d";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };


  if (loading || !fontsLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!beneficiary) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Beneficiary not found</Text>
      </View>
    );
  }

  return (
    <Surface style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Beneficiary Info Card */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.headerRow}>
              <View style={styles.beneficiaryInfo}>
                <Text style={styles.beneficiaryName}>
                  {beneficiary.firstName} {beneficiary.lastName}
                </Text>
                <Text style={styles.beneficiaryDetail}>
                  National ID: {beneficiary.nationalId}
                </Text>
                <Text style={styles.beneficiaryDetail}>
                  Village: {beneficiary.village}
                </Text>
              </View>
              <View style={styles.badgeContainer}>
                <Badge style={[styles.statusBadge, { backgroundColor: getStatusColor(beneficiary.status) }]}>
                  {beneficiary.status}
                </Badge>
                <Badge style={[styles.typeBadge, { backgroundColor: getTypeColor(beneficiary.type) }]}>
                  {beneficiary.type}
                </Badge>
              </View>
            </View>

            <Divider style={styles.divider} />
          </Card.Content>
        </Card>

        {/* Progress Card */}
        <Card style={styles.progressCard}>
          <Card.Content>
            <Text style={styles.cardTitle}>Program Progress</Text>
            
            <View style={styles.progressStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{beneficiary.completedDays || 0}</Text>
                <Text style={styles.statLabel}>Completed Days</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{beneficiary.totalProgramDays || 0}</Text>
                <Text style={styles.statLabel}>Total Days</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{beneficiary.attendanceRate || 0}%</Text>
                <Text style={styles.statLabel}>Attendance Rate</Text>
              </View>
            </View>

            <View style={styles.progressBarContainer}>
              <Text style={styles.progressText}>
                Progress: {beneficiary.completedDays || 0}/{beneficiary.totalProgramDays || 0} days
              </Text>
              <ProgressBar
                progress={(beneficiary.completedDays || 0) / Math.max(beneficiary.totalProgramDays || 1, 1)}
                color="#007AFF"
                style={styles.progressBar}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Add Program Day Card */}
        <Card style={styles.addDayCard}>
          <Card.Content>
            <Text style={styles.cardTitle}>Add Program Day</Text>
            
            <View style={styles.addDayForm}>
              <View style={styles.formRow}>
                <TextInput
                  label="Day Number"
                  value={newDayNumber}
                  onChangeText={setNewDayNumber}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.formInput}
                  dense
                />
                <TextInput
                  label="Date (YYYY-MM-DD)"
                  value={newDayDate}
                  onChangeText={setNewDayDate}
                  mode="outlined"
                  placeholder="2024-01-15"
                  style={styles.formInput}
                  dense
                />
              </View>
              
              <View style={styles.activityTypeContainer}>
                <Text style={styles.activityTypeLabel}>Activity Type:</Text>
                <View style={styles.activityTypeChips}>
                  {["check-in", "attendance", "activity", "assessment"].map((type) => (
                    <Chip
                      key={type}
                      mode={newDayType === type ? "flat" : "outlined"}
                      selected={newDayType === type}
                      onPress={() => setNewDayType(type)}
                      style={[
                        styles.activityChip,
                        newDayType === type && { backgroundColor: getActivityTypeColor(type) }
                      ]}
                      compact
                    >
                      {type}
                    </Chip>
                  ))}
                </View>
              </View>

              <Button
                mode="contained"
                onPress={handleAddProgramDay}
                loading={addingDay}
                disabled={addingDay}
                style={styles.addButton}
              >
                Add Program Day
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Program Days Card */}
        <Card style={styles.daysCard}>
          <Card.Content>
            <Text style={styles.cardTitle}>Program Days ({programDays.length})</Text>
            
            {programDays.length === 0 ? (
              <Text style={styles.emptyText}>No program days added yet.</Text>
            ) : (
              programDays
                .sort((a, b) => a.dayNumber - b.dayNumber)
                .map((day) => (
                  <View key={day._id} style={styles.dayItem}>
                    <View style={styles.dayHeader}>
                      <View style={styles.dayInfo}>
                        <Text style={styles.dayNumber}>Day {day.dayNumber}</Text>
                        <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
                        <Chip
                          style={[
                            styles.activityTypeChip,
                            { backgroundColor: getActivityTypeColor(day.activityType) }
                          ]}
                          textStyle={styles.activityTypeText}
                          compact
                        >
                          {day.activityType}
                        </Chip>
                      </View>
                      
                      <View style={styles.dayActions}>
                        <View style={styles.attendanceContainer}>
                          <Text style={styles.attendanceLabel}>Attended:</Text>
                          <Checkbox
                            status={day.attended ? 'checked' : 'unchecked'}
                            onPress={() => handleAttendanceChange(day._id, !day.attended)}
                            color="#007AFF"
                            disabled={updatingAttendance[day._id]}
                          />
                          {updatingAttendance[day._id] && (
                            <ActivityIndicator size="small" style={styles.attendanceLoader} />
                          )}
                        </View>
                        
                        <IconButton
                          icon="delete"
                          size={20}
                          iconColor="#e74c3c"
                          onPress={() => handleRemoveProgramDay(day._id)}
                          style={styles.removeButton}
                        />
                      </View>
                    </View>
                    
                    {day.notes && (
                      <Text style={styles.dayNotes}>Notes: {day.notes}</Text>
                    )}
                  </View>
                ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </Surface>
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#e74c3c",
    textAlign: "center",
  },
  infoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  beneficiaryInfo: {
    flex: 1,
  },
  beneficiaryName: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  beneficiaryDetail: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#7f8c8d",
    marginBottom: 4,
  assignedWorker: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#007AFF",
    marginTop: 4,
  },
  },
  badgeContainer: {
    alignItems: "flex-end",
  },
  statusBadge: {
    marginBottom: 8,
  },
  typeBadge: {
    // Additional styling if needed
  },
  divider: {
    marginVertical: 16,
  },
  progressCard: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: "#2c3e50",
    marginBottom: 16,
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: "#007AFF",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#7f8c8d",
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#34495e",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  addDayCard: {
    marginBottom: 16,
    elevation: 2,
  },
  addDayForm: {
    // Additional styling if needed
  },
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  formInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  activityTypeContainer: {
    marginBottom: 16,
  },
  activityTypeLabel: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#34495e",
    marginBottom: 8,
  },
  activityTypeChips: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  activityChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  addButton: {
    marginTop: 8,
  },
  daysCard: {
    marginBottom: 16,
    elevation: 2,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#7f8c8d",
    textAlign: "center",
    fontStyle: "italic",
    padding: 20,
  },
  dayItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayInfo: {
    flex: 1,
  },
  dayNumber: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  dayDate: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#7f8c8d",
    marginBottom: 8,
  },
  activityTypeChip: {
    alignSelf: "flex-start",
  },
  activityTypeText: {
    color: "#fff",
    fontSize: 10,
  },
  dayActions: {
    alignItems: "center",
  },
  attendanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  attendanceLabel: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: "#34495e",
    marginRight: 8,
  },
  attendanceLoader: {
    marginLeft: 8,
  },
  removeButton: {
    marginTop: 4,
  },
  dayNotes: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#7f8c8d",
    marginTop: 8,
    fontStyle: "italic",
  },
});

export default BeneficiaryDetailsScreen;