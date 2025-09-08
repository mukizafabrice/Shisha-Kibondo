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
const HealthWorkerHomeScreen = () => {
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

  // Fetch all dashboard data
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

        // Prepare data for stock breakdown
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
              Hello, {user?.name || "Community Health Worker"}!
            </Text>
            <Caption style={styles.captionText}>
              Here is an overview of your inventory.
            </Caption>
          </View>
          <IconButton
            icon="logout"
            color="#007AFF"
            size={24}
            onPress={logout}
          />
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <Ionicons name="cube-outline" size={32} color="#4285F4" />
              <View style={styles.statInfo}>
                <Title>{stats.stocks}</Title>
                <Caption>Total Stock</Caption>
              </View>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <Ionicons name="pricetags-outline" size={32} color="#DB4437" />
              <View style={styles.statInfo}>
                <Title>{stats.products}</Title>
                <Caption>Total Products</Caption>
              </View>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <Ionicons name="people-outline" size={32} color="#F4B400" />
              <View style={styles.statInfo}>
                <Title>{stats.beneficiaries}</Title>
                <Caption>Beneficiaries</Caption>
              </View>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <Ionicons name="send-outline" size={32} color="#0F9D58" />
              <View style={styles.statInfo}>
                <Title>{stats.distributions}</Title>
                <Caption>Distributions</Caption>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Stock Breakdown Visualization */}
        <Card style={styles.visualizationCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Stock Breakdown by Product</Title>
            {stockBreakdown.length > 0 ? (
              <View>
                {stockBreakdown.map((item, index) => (
                  <View key={index} style={styles.progressItem}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <View style={styles.progressBarContainer}>
                      <ProgressBar
                        progress={item.percentage}
                        color="#007AFF"
                        style={styles.progressBar}
                      />
                      <Caption style={styles.progressText}>
                        {item.value} ({Math.round(item.percentage * 100)}%)
                      </Caption>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>No stock data to display.</Text>
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
    padding: 16,
    backgroundColor: "#F0F2F5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 24,
    fontFamily: "Poppins_600SemiBold",
    color: "#34495E",
  },
  captionText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    width: "48%",
    marginBottom: 10,
    elevation: 2,
    borderRadius: 12,
  },
  statCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statInfo: {
    marginLeft: 10,
  },
  visualizationCard: {
    elevation: 2,
    borderRadius: 12,
  },
  cardTitle: {
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 10,
    color: "#34495E",
  },
  progressItem: {
    marginBottom: 15,
  },
  productName: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    marginBottom: 5,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 10,
    borderRadius: 5,
  },
  progressText: {
    marginLeft: 10,
    minWidth: 50,
    textAlign: "right",
    fontFamily: "Poppins_400Regular",
  },
  emptyText: {
    textAlign: "center",
    color: "#7F8C8D",
    paddingVertical: 20,
  },
});

export default HealthWorkerHomeScreen;
