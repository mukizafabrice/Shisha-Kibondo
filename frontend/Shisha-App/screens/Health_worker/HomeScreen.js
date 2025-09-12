import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Surface,
  Card,
  Button,
  IconButton,
  Title,
  Caption,
  ProgressBar,
  Avatar,
} from "react-native-paper";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getAllStocks } from "../../services/stockService";
import BeneficiaryService from "../../services/beneficiaryService";
import { getAllProducts } from "../../services/ProductService";
import { getAllDistributions } from "../../services/distributionService";

const HealthWorkerHomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  // --- All hooks at the top ---
  const [stats, setStats] = useState({
    stocks: 0,
    products: 0,
    beneficiaries: 0,
    distributions: 0,
  });
  const [stockBreakdown, setStockBreakdown] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  // --- Fetch dashboard data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stocksData, productsData, beneficiariesData, distributionsData] =
          await Promise.all([
            getAllStocks(),
            getAllProducts(),
            BeneficiaryService.getBeneficiary(user?.id),
            getAllDistributions(),
          ]);

        const totalStocks = stocksData.reduce(
          (sum, item) => sum + item.totalStock,
          0
        );
        const totalProducts = productsData.length;
        const totalBeneficiaries = beneficiariesData.length;
        const totalDistributions = distributionsData.length;

        setStats({
          stocks: totalStocks,
          products: totalProducts,
          beneficiaries: totalBeneficiaries,
          distributions: totalDistributions,
        });

        const totalStockSum = totalStocks;
        const breakdown = productsData.map((product) => {
          const productStocks = stocksData.filter(
            (stock) => stock.productId._id === product._id
          );
          const totalProductStock = productStocks.reduce(
            (sum, item) => sum + item.totalStock,
            0
          );
          return {
            name: product.name,
            value: totalProductStock,
            percentage:
              totalStockSum > 0 ? totalProductStock / totalStockSum : 0,
          };
        });
        setStockBreakdown(breakdown);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        Alert.alert(
          "Error",
          "Failed to load dashboard data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  // --- Fetch recent activity ---
  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const [stocksData, productsData, beneficiariesData, distributionsData] =
          await Promise.all([
            getAllStocks(),
            getAllProducts(),
            BeneficiaryService.getBeneficiary(user?.id),
            getAllDistributions(),
          ]);

        const activities = [];

        beneficiariesData.slice(-3).forEach((b) =>
          activities.push({
            type: "beneficiary",
            message: `New beneficiary registered: ${b.name || "Unnamed"}`,
            createdAt: new Date(b.createdAt),
          })
        );

        productsData.slice(-3).forEach((p) =>
          activities.push({
            type: "product",
            message: `Product updated: ${p.name}`,
            createdAt: new Date(p.createdAt),
          })
        );

        stocksData.slice(-3).forEach((s) =>
          activities.push({
            type: "stock",
            message: `Stock update: ${s.productId?.name || "Unknown Product"}`,
            createdAt: new Date(s.createdAt),
          })
        );

        distributionsData.slice(-3).forEach((d) =>
          activities.push({
            type: "distribution",
            message: `Distributed supplements to beneficiaries`,
            createdAt: new Date(d.createdAt),
          })
        );

        activities.sort((a, b) => b.createdAt - a.createdAt);
        setRecentActivity(activities.slice(0, 5));
      } catch (error) {
        console.error("Error fetching recent activity:", error);
      }
    };

    fetchRecentActivity();
  }, [user?.id]);

  // --- Show loading until data & fonts are ready ---
  if (loading || !fontsLoaded) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Surface style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>
              Hello,
              <Text style={styles.greetingHighlight}>
                {user?.name || "Community Health Worker"}
              </Text>
            </Text>
            <Text style={styles.captionText}>
              Welcome back! Here’s your latest dashboard overview.
            </Text>
          </View>
        </View>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <Card
            style={styles.statCard}
            onPress={() => navigation.navigate("Stock")}
          >
            <Card.Content style={styles.statCardContent}>
              <Ionicons name="cube-outline" size={28} color="#2563EB" />
              <View style={styles.statInfo}>
                <Title>{stats.stocks}</Title>
                <Caption>Total Stock</Caption>
              </View>
            </Card.Content>
          </Card>

          <Card
            style={styles.statCard}
            onPress={() => navigation.navigate("health-ProductsScreen")}
          >
            <Card.Content style={styles.statCardContent}>
              <Ionicons name="pricetags-outline" size={28} color="#DC2626" />
              <View style={styles.statInfo}>
                <Title>{stats.products}</Title>
                <Caption>Products</Caption>
              </View>
            </Card.Content>
          </Card>

          <Card
            style={styles.statCard}
            onPress={() => navigation.navigate("health-Beneficiaries")}
          >
            <Card.Content style={styles.statCardContent}>
              <Ionicons name="people-outline" size={28} color="#CA8A04" />
              <View style={styles.statInfo}>
                <Title>{stats.beneficiaries}</Title>
                <Caption>Beneficiaries</Caption>
              </View>
            </Card.Content>
          </Card>

          <Card
            style={styles.statCard}
            onPress={() => navigation.navigate("Reports")}
          >
            <Card.Content style={styles.statCardContent}>
              <Ionicons name="send-outline" size={28} color="#16A34A" />
              <View style={styles.statInfo}>
                <Title>{stats.distributions}</Title>
                <Caption>Distributions</Caption>
              </View>
            </Card.Content>
          </Card>
        </View>
        {/* Stock Breakdown */}
        <Card style={styles.visualizationCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>📊 Stock Breakdown</Title>
            {stockBreakdown.length > 0 ? (
              stockBreakdown.map((item, index) => (
                <View key={index} style={styles.progressItem}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.progressText}>
                      {item.value} ({Math.round(item.percentage * 100)}%)
                    </Text>
                  </View>
                  <ProgressBar
                    progress={item.percentage}
                    color="#2563EB"
                    style={styles.progressBar}
                  />
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No stock data to display.</Text>
            )}
          </Card.Content>
        </Card>
        {/* Quick Actions */}{" "}
        <Card style={styles.actionsCard}>
          {" "}
          <Card.Content>
            {" "}
            <Title style={styles.cardTitle}>⚡ Quick Actions</Title>{" "}
            <View style={styles.actionsRow}>
              {" "}
              <Button
                mode="contained"
                icon="eye"
                style={styles.actionButton}
                onPress={() => navigation.navigate("health-Beneficiaries")}
              >
                {" "}
                Beneficiaries{" "}
              </Button>{" "}
              <Button
                mode="contained"
                icon="send"
                style={styles.actionButton}
                onPress={() => navigation.navigate("Reports")}
              >
                {" "}
                New Distribution{" "}
              </Button>{" "}
            </View>{" "}
          </Card.Content>{" "}
        </Card>
        {/* Recent Activity */}
        <Card style={styles.visualizationCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>📝 Recent Activity</Title>
            {recentActivity.length === 0 ? (
              <Text style={styles.emptyText}>No recent activity</Text>
            ) : (
              recentActivity.map((act, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  {act.type === "beneficiary" && (
                    <Ionicons name="person-add" size={20} color="#F59E0B" />
                  )}
                  {act.type === "product" && (
                    <Ionicons name="cube" size={20} color="#2563EB" />
                  )}
                  {act.type === "stock" && (
                    <Ionicons name="archive" size={20} color="#10B981" />
                  )}
                  {act.type === "distribution" && (
                    <Ionicons name="send" size={20} color="#16A34A" />
                  )}
                  <Text
                    style={styles.activityText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {act.message}
                  </Text>
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
  container: { flex: 1, padding: 16, backgroundColor: "#F9FAFB" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  greetingText: {
    fontSize: 22,
    fontFamily: "Poppins_600SemiBold",
    color: "#1E293B",
  },
  greetingHighlight: { fontWeight: "bold", color: "blue" },
  captionText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#64748B",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  statCard: {
    width: "48%",
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    elevation: 4,
  },
  statCardContent: { flexDirection: "row", alignItems: "center", padding: 12 },
  statInfo: { marginLeft: 12 },
  progressItem: { marginBottom: 15 },
  productName: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "#111827",
  },
  progressBar: { height: 10, borderRadius: 5 },
  progressText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#475569",
  },
  visualizationCard: {
    borderRadius: 16,
    backgroundColor: "#fff",
    elevation: 3,
    padding: 15,
    marginBottom: 20,
  },
  emptyText: { textAlign: "center", color: "#9CA3AF", paddingVertical: 20 },
  activityText: {
    marginLeft: 8,
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#374151",
    flexShrink: 1,
  },
  actionsCard: {
    borderRadius: 16,
    backgroundColor: "#fff",
    elevation: 3,
    padding: 15,
    marginBottom: 20,
  },
  actionsRow: { flexDirection: "row", justifyContent: "space-between" },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#2563EB",
  },
});

export default HealthWorkerHomeScreen;
