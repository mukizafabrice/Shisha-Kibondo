import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, Title, Caption } from "react-native-paper";
import { LineChart, PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { useAuth } from "../../context/AuthContext";
import BeneficiaryService from "../../services/beneficiaryService";
import { getAllProducts } from "../../services/ProductService.js";
import { getAllMainStock } from "../../services/mainStockService";
import DistributeToUmunyabuzimaService from "../../services/distributeToUmunyabuzimaService";
import UserService from "../../services/userService";

const screenWidth = Dimensions.get("window").width;

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [totalBeneficiaries, setTotalBeneficiaries] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const beneficiaries = await BeneficiaryService.getBeneficiaries();
        setTotalBeneficiaries(beneficiaries.data.length);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);
  const [totalProducts, setTotalProducts] = useState(0);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await getAllProducts();
        setTotalProducts(products.length);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const [totalStock, setTotalStock] = useState(0);
  useEffect(() => {
    const fetchStock = async () => {
      try {
        const stockItems = await getAllMainStock();
        const total = stockItems.reduce(
          (sum, item) => sum + item.totalStock,
          0
        );
        setTotalStock(total);
      } catch (error) {
        console.error("Error fetching stock:", error);
      }
    };
    fetchStock();
  }, []);
  const [totalDistributionToUmunyabuzima, setTotalDistributionToUmunyabuzima] =
    useState(0);
  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        const distributions =
          await DistributeToUmunyabuzimaService.getDistributions();
        setTotalDistributionToUmunyabuzima(distributions.data.length);
      } catch (error) {
        console.error("Error fetching distributions:", error);
      }
    };
    fetchDistribution();
  }, []);
  const [totalUsers, setTotalUsers] = useState(0);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await UserService.getUsers();
        setTotalUsers(users.length);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);
  const stats = [
    {
      title: "Stock",
      value: totalStock,
      icon: "archive-outline",
      color: "#2563EB",
    },
    {
      title: "Total Users",
      value: totalUsers,
      icon: "people-circle-outline",
      color: "#4ADE80",
    },
    {
      title: "Beneficiaries",
      value: totalBeneficiaries,
      icon: "heart-outline",
      color: "#14B8A6",
    },
    {
      title: "Products",
      value: totalProducts,
      icon: "layers-outline",
      color: "#FACC15",
    },
    {
      title: "Active ones",
      value: "2",
      icon: "cash-outline",
      color: "#F97316",
    },
    {
      title: "Distribution",
      value: totalDistributionToUmunyabuzima,
      icon: "send-outline",
      color: "#EF4444",
    },
  ];

  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{ data: [400, 600, 800, 500, 750, 900], strokeWidth: 3 }],
  };

  const [children, setChildren] = useState(45);
  const [breastfeeding, setBreastfeeding] = useState(35);
  const [pregnant, setPregnant] = useState(20);

  useEffect(() => {
    const fetchBeneficiaryStats = async () => {
      try {
        const stats = await BeneficiaryService.getBeneficiaries(); // returns array

        // Count each type
        const childCount = stats.data.filter((b) => b.type === "child").length;
        const breastfeedingCount = stats.data.filter(
          (b) => b.type === "breastfeeding"
        ).length;
        const pregnantCount = stats.data.filter(
          (b) => b.type === "pregnant"
        ).length;

        const total = childCount + breastfeedingCount + pregnantCount;

        // Optionally calculate percentages
        const childrenPercent = total > 0 ? (childCount / total) * 100 : 0;
        const breastfeedingPercent =
          total > 0 ? (breastfeedingCount / total) * 100 : 0;
        const pregnantPercent = total > 0 ? (pregnantCount / total) * 100 : 0;

        // Save counts in state
        setChildren(childCount);
        setBreastfeeding(breastfeedingCount);
        setPregnant(pregnantCount);

        console.log("Counts:", childCount, breastfeedingCount, pregnantCount);
        console.log(
          "Percentages:",
          childrenPercent,
          breastfeedingPercent,
          pregnantPercent
        );
      } catch (error) {
        console.error("Error fetching beneficiary stats:", error);
      }
    };

    fetchBeneficiaryStats();
  }, []);

  // Pie chart data
  const pieData = [
    {
      name: "Children",
      population: children, // number, not object
      color: "#10B981",
      legendFontColor: "#333",
      legendFontSize: 12,
    },
    {
      name: "Breastfeeding",
      population: breastfeeding,
      color: "#F59E0B",
      legendFontColor: "#333",
      legendFontSize: 12,
    },
    {
      name: "Pregnant",
      population: pregnant,
      color: "#2563EB",
      legendFontColor: "#333",
      legendFontSize: 12,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Welcome back,{" "}
            <Text style={{ fontWeight: "bold", color: "blue" }}>
              {user.name}
            </Text>
            👋
          </Text>
          <Caption>Here’s your dashboard overview</Caption>
        </View>
        {/* <View style={styles.headerRight}>
          <Ionicons name="notifications-outline" size={22} color="#6B7280" />
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            }}
            style={styles.avatar}
          />
        </View> */}
      </View>

      {/* Stat Cards */}
      <View style={styles.statsGrid}>
        {stats.map((s, i) => (
          <Card key={i} style={styles.statCard}>
            <View style={styles.statCardContent}>
              <View
                style={[styles.iconBox, { backgroundColor: s.color + "20" }]}
              >
                <Ionicons name={s.icon} size={24} color={s.color} />
              </View>
              <View>
                <Title>{s.value}</Title>
                <Caption>{s.title}</Caption>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* Charts */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>📈 Beneficiaries Overview</Text>
        <LineChart
          data={lineData}
          width={screenWidth - 50}
          height={220}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            labelColor: () => "#6B7280",
          }}
          bezier
          style={{ borderRadius: 12 }}
        />
      </Card>

      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>📊 Beneficiaries Status</Text>
        <PieChart
          data={pieData}
          width={screenWidth - 50}
          height={220}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          chartConfig={{
            color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
          }}
          style={{ borderRadius: 12 }}
        />
      </Card>

      {/* Recent Activity */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📝 Recent Activity</Text>
        <View style={styles.activityItem}>
          <Ionicons name="person-add" size={18} color="#10B981" />
          <Text style={styles.activityText}>5 new users registered today</Text>
        </View>
        <View style={styles.activityItem}>
          <Ionicons name="cube" size={18} color="#3B82F6" />
          <Text style={styles.activityText}>
            Product “Vitamin Pack” updated
          </Text>
        </View>
        <View style={styles.activityItem}>
          <Ionicons name="cash" size={18} color="#F59E0B" />
          <Text style={styles.activityText}>Revenue report generated</Text>
        </View>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#3B82F6" }]}
            onPress={() => navigation.navigate("Users")}
          >
            <Text style={styles.actionText}>+ Add User</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#10B981" }]}
            onPress={() => navigation.navigate("ProductsScreen")}
          >
            <Text style={styles.actionText}>+ Add Product</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#F59E0B" }]}
          >
            <Text style={styles.actionText}>Generate Report</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 15 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { fontSize: 20, fontWeight: "600", color: "#111827" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginLeft: 10 },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: { width: "48%", marginBottom: 12, borderRadius: 12, elevation: 3 },
  statCardContent: { flexDirection: "row", alignItems: "center", padding: 15 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  chartCard: { borderRadius: 12, elevation: 3, padding: 15, marginBottom: 20 },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#374151",
  },

  sectionCard: {
    borderRadius: 12,
    elevation: 3,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#374151",
  },
  activityItem: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  activityText: { marginLeft: 8, fontSize: 14, color: "#374151" },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  actionText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});

export default HomeScreen;
