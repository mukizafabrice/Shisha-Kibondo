import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";
import {
  Card,
  Text,
  Button,
  ActivityIndicator,
  List,
  Chip,
  Surface,
  ProgressBar,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import HealthWorkerReportService from "../../services/healthWorkerReportService";

const ReportsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await HealthWorkerReportService.getComprehensiveReport();
      setReportData(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load comprehensive report. Please try again.");
      console.error("Load reports error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const navigateToDetailedReport = (reportType, data) => {
    // You can implement detailed report screens later
    Alert.alert("Coming Soon", `${reportType} detailed report will be available soon.`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Reports...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Comprehensive Report Header */}
      <LinearGradient colors={["#007AFF", "#0056b3"]} style={styles.headerCard}>
        <Text style={styles.headerTitle}>Comprehensive Report</Text>
        <Text style={styles.headerSubtitle}>Last 6 months performance overview</Text>
      </LinearGradient>

      {reportData?.overview && (
        <View style={styles.statsGrid}>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{reportData.overview.beneficiaryCount}</Text>
            <Text style={styles.statLabel}>My Beneficiaries</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{reportData.overview.activeBeneficiaries}</Text>
            <Text style={styles.statLabel}>Active Beneficiaries</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{reportData.overview.newBeneficiariesLast6Months}</Text>
            <Text style={styles.statLabel}>New (6 months)</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{reportData.overview.totalDistributions}</Text>
            <Text style={styles.statLabel}>Total Distributions</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{reportData.overview.recentDistributionsLast6Months}</Text>
            <Text style={styles.statLabel}>Recent Distributions</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{reportData.overview.maleChildren}</Text>
            <Text style={styles.statLabel}>Male Children</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{reportData.overview.femaleChildren}</Text>
            <Text style={styles.statLabel}>Female Children</Text>
          </Surface>
        </View>
      )}

      {/* 6-Month Trends */}
      <Card style={styles.reportCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>6-Month Trends</Text>

          <View style={styles.trendsContainer}>
            <View style={styles.trendSection}>
              <Text style={styles.sectionTitle}>Distribution Trends</Text>
              {reportData?.details?.distributionTrends?.slice(-6).map((trend, index) => (
                <View key={index} style={styles.trendItem}>
                  <Text style={styles.trendLabel}>
                    {trend._id.year}-{String(trend._id.month).padStart(2, '0')}
                  </Text>
                  <View style={styles.trendValue}>
                    <Text style={styles.trendNumber}>{trend.count}</Text>
                    <Text style={styles.trendUnit}>distributions</Text>
                  </View>
                  <ProgressBar
                    progress={trend.count / Math.max(...reportData.details.distributionTrends.map(t => t.count))}
                    color="#007AFF"
                    style={styles.trendBar}
                  />
                </View>
              ))}
            </View>

            <View style={styles.trendSection}>
              <Text style={styles.sectionTitle}>Beneficiary Growth</Text>
              {reportData?.details?.beneficiaryTrends?.slice(-6).map((trend, index) => (
                <View key={index} style={styles.trendItem}>
                  <Text style={styles.trendLabel}>
                    {trend._id.year}-{String(trend._id.month).padStart(2, '0')}
                  </Text>
                  <View style={styles.trendValue}>
                    <Text style={styles.trendNumber}>{trend.count}</Text>
                    <Text style={styles.trendUnit}>new</Text>
                  </View>
                  <ProgressBar
                    progress={trend.count / Math.max(...reportData.details.beneficiaryTrends.map(t => t.count))}
                    color="#4CAF50"
                    style={styles.trendBar}
                  />
                </View>
              ))}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Attendance Overview */}
      <Card style={styles.reportCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>Attendance Overview</Text>
          <View style={styles.attendanceSummary}>
            <View style={styles.attendanceItem}>
              <Text style={styles.attendanceValue}>{reportData?.overview?.attendanceRate || 0}%</Text>
              <Text style={styles.attendanceLabel}>Overall Rate</Text>
            </View>
            <View style={styles.attendanceItem}>
              <Text style={styles.attendanceValue}>{reportData?.overview?.totalDistributions || 0}</Text>
              <Text style={styles.attendanceLabel}>Total Distributions</Text>
            </View>
            <View style={styles.attendanceItem}>
              <Text style={styles.attendanceValue}>{reportData?.overview?.beneficiaryCount || 0}</Text>
              <Text style={styles.attendanceLabel}>Total Beneficiaries</Text>
            </View>
          </View>
        </Card.Content>
      </Card>


      {/* Performance Insights */}
      <Card style={styles.reportCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>Performance Insights</Text>
          <View style={styles.insightsContainer}>
            <View style={styles.insightItem}>
              <Text style={styles.insightValue}>
                {reportData?.overview ? Math.round((reportData.overview.recentDistributionsLast6Months / reportData.overview.totalDistributions) * 100) : 0}%
              </Text>
              <Text style={styles.insightLabel}>Recent Activity Rate</Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightValue}>
                {reportData?.overview ? Math.round((reportData.overview.activeBeneficiaries / reportData.overview.beneficiaryCount) * 100) : 0}%
              </Text>
              <Text style={styles.insightLabel}>Active Beneficiary Rate</Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightValue}>
                {reportData?.overview ? Math.round((reportData.overview.newBeneficiariesLast6Months / reportData.overview.beneficiaryCount) * 100) : 0}%
              </Text>
              <Text style={styles.insightLabel}>Growth Rate (6 months)</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.reportCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate("health-Beneficiaries")}
              style={styles.actionButton}
              textColor="#007AFF"
              icon="account-heart"
            >
              Manage Beneficiaries
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate("health-ProductsScreen")}
              style={styles.actionButton}
              textColor="#007AFF"
              icon="package-variant"
            >
              View Products
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontFamily: "Poppins_500Medium",
  },
  headerCard: {
    padding: 20,
    margin: 16,
    borderRadius: 16,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#dce6f9",
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    width: "48%",
    margin: "1%",
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    alignItems: "center",
    backgroundColor: "#fff",
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 32,
    fontFamily: "Poppins_700Bold",
    color: "#007AFF",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#2c3e50",
    textAlign: "center",
    lineHeight: 18,
  },
  reportCard: {
    margin: 16,
    marginTop: 0,
    elevation: 3,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Poppins_400Regular",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginVertical: 16,
  },
  attendanceStats: {
    marginBottom: 16,
  },
  attendanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  attendanceLabel: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#2c3e50",
    flex: 1,
  },
  attendanceChip: {
    marginLeft: 8,
  },
  trendsContainer: {
    marginTop: 16,
  },
  trendSection: {
    marginBottom: 24,
  },
  trendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 4,
  },
  trendLabel: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#666",
    width: 80,
  },
  trendValue: {
    flex: 1,
    alignItems: "center",
  },
  trendNumber: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#007AFF",
  },
  trendUnit: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Poppins_400Regular",
  },
  trendBar: {
    width: 60,
    height: 4,
    marginLeft: 8,
  },
  attendanceSummary: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  attendanceItem: {
    alignItems: "center",
  },
  attendanceValue: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: "#007AFF",
  },
  attendanceLabel: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Poppins_500Medium",
    textAlign: "center",
    marginTop: 4,
  },
  insightsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  insightItem: {
    alignItems: "center",
    flex: 1,
  },
  insightValue: {
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  insightLabel: {
    fontSize: 13,
    color: "#2c3e50",
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
    lineHeight: 16,
  },
  quickActions: {
    marginTop: 16,
  },
  actionButton: {
    marginBottom: 8,
    borderColor: "#007AFF",
  },
});

export default ReportsScreen;