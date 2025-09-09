import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import {
  Surface,
  Card,
  IconButton,
  Title,
  Caption,
  ProgressBar,
  Button,
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
  const [stats, setStats] = useState({
    stocks: 0,
    products: 0,
    beneficiaries: 0,
    distributions: 0,
  });
  const [stockBreakdown, setStockBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

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
  }, []);

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
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>
              Hello,{" "}
              <Text style={{ fontWeight: "bold", color: "blue" }}>
                {user.name || "Community Health Worker"}
              </Text>
              👋
            </Text>

            <Caption style={styles.captionText}>
              Welcome back! Here’s your latest dashboard overview.
            </Caption>
          </View>
          <View style={styles.profileContainer}>
            <Avatar.Image
              size={44}
              source={{
                uri:
                  user?.avatar ||
                  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
              }}
            />
            <IconButton
              icon="logout"
              color="#EF4444"
              size={24}
              onPress={logout}
            />
          </View>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.iconBox, { backgroundColor: "#DBEAFE" }]}>
                <Ionicons name="cube-outline" size={28} color="#2563EB" />
              </View>
              <View style={styles.statInfo}>
                <Title>{stats.stocks}</Title>
                <Caption>Total Stock</Caption>
              </View>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.iconBox, { backgroundColor: "#FEE2E2" }]}>
                <Ionicons name="pricetags-outline" size={28} color="#DC2626" />
              </View>
              <View style={styles.statInfo}>
                <Title>{stats.products}</Title>
                <Caption>Products</Caption>
              </View>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.iconBox, { backgroundColor: "#FEF9C3" }]}>
                <Ionicons name="people-outline" size={28} color="#CA8A04" />
              </View>
              <View style={styles.statInfo}>
                <Title>{stats.beneficiaries}</Title>
                <Caption>Beneficiaries</Caption>
              </View>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.iconBox, { backgroundColor: "#DCFCE7" }]}>
                <Ionicons name="send-outline" size={28} color="#16A34A" />
              </View>
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
                  <View style={styles.progressRow}>
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

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>⚡ Quick Actions</Title>
            <View style={styles.actionsRow}>
              <Button
                mode="contained"
                icon="eye"
                style={styles.actionButton}
                onPress={() => navigation.navigate("health-Beneficiaries")}
              >
                Beneficiaries
              </Button>
              <Button
                mode="contained"
                icon="send"
                style={styles.actionButton}
                onPress={() => navigation.navigate("Reports")}
              >
                New Distribution
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.recentCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>📝 Recent Activity</Title>
            <View style={styles.activityItem}>
              <Ionicons name="checkmark-done" size={20} color="#16A34A" />
              <Text style={styles.activityText}>
                Distributed supplements to 12 beneficiaries
              </Text>
            </View>
            <View style={styles.activityItem}>
              <Ionicons name="cube" size={20} color="#2563EB" />
              <Text style={styles.activityText}>Updated stock records</Text>
            </View>
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
  captionText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#64748B",
  },
  profileContainer: { flexDirection: "row", alignItems: "center" },

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
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  visualizationCard: {
    borderRadius: 16,
    backgroundColor: "#fff",
    elevation: 3,
    padding: 15,
    marginBottom: 20,
  },
  cardTitle: {
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 10,
    color: "#374151",
    fontSize: 16,
  },
  progressItem: { marginBottom: 15 },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
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

  recentCard: {
    borderRadius: 16,
    backgroundColor: "#fff",
    elevation: 3,
    padding: 15,
    marginBottom: 30,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  activityText: {
    marginLeft: 8,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#374151",
  },
  emptyText: { textAlign: "center", color: "#9CA3AF", paddingVertical: 20 },
});

export default HealthWorkerHomeScreen;
