import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Card, Title, Caption } from "react-native-paper";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LineChart, PieChart } from "react-native-chart-kit";
import { useAuth } from "../../context/AuthContext";

import BeneficiaryService from "../../services/beneficiaryService";
import { getAllProducts } from "../../services/ProductService";
import { getAllMainStock } from "../../services/mainStockService";
import DistributeToUmunyabuzimaService from "../../services/distributeToUmunyabuzimaService";
import UserService from "../../services/userService";

const screenWidth = Dimensions.get("window").width;

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalBeneficiaries: 0,
    totalProducts: 0,
    totalStock: 0,
    totalDistributions: 0,
    totalUsers: 0,
    totalActives: 0,
  });

  const [pieData, setPieData] = useState([]);
  const [lineData, setLineData] = useState({ labels: [], datasets: [] });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          beneficiariesRes,
          productsRes,
          stockRes,
          distributionsRes,
          usersRes,
        ] = await Promise.all([
          BeneficiaryService.getBeneficiaries(),
          getAllProducts(),
          getAllMainStock(),
          DistributeToUmunyabuzimaService.getDistributions(),
          UserService.getUsers(),
        ]);

        const beneficiaries = beneficiariesRes.data || [];
        const totalBeneficiaries = beneficiaries.length;
        const totalProducts = productsRes.length;
        const totalStock = stockRes.reduce(
          (sum, item) => sum + item.totalStock,
          0
        );
        const totalDistributions = distributionsRes.data.length;
        const totalUsers = usersRes.length;

        const activeBeneficiaries = beneficiaries.filter(
          (b) => b.status === "active" || b.isActive === true
        );
        const totalActives = activeBeneficiaries.length;

        // ---- Pie Data ----
        const childCount = beneficiaries.filter(
          (b) => b.type === "child"
        ).length;
        const breastfeedingCount = beneficiaries.filter(
          (b) => b.type === "breastfeeding"
        ).length;
        const pregnantCount = beneficiaries.filter(
          (b) => b.type === "pregnant"
        ).length;

        setPieData([
          {
            name: "Children",
            population: childCount,
            color: "#10B981",
            legendFontColor: "#333",
            legendFontSize: 12,
          },
          {
            name: "Breastfeeding",
            population: breastfeedingCount,
            color: "#F59E0B",
            legendFontColor: "#333",
            legendFontSize: 12,
          },
          {
            name: "Pregnant",
            population: pregnantCount,
            color: "#2563EB",
            legendFontColor: "#333",
            legendFontSize: 12,
          },
        ]);

        // ---- Line Data (Cumulative Growth Over Last 6 Months) ----
        const now = new Date();
        const last6Months = [...Array(6)].map((_, i) => {
          return new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        });

        const cumulativeCounts = last6Months.map((monthDate) => {
          const month = monthDate.getMonth();
          const year = monthDate.getFullYear();
          return beneficiaries.filter((b) => {
            const created = new Date(b.createdAt);
            return (
              created.getFullYear() < year ||
              (created.getFullYear() === year && created.getMonth() <= month)
            );
          }).length;
        });

        setLineData({
          labels: last6Months.map((d) =>
            d.toLocaleString("default", { month: "short" })
          ),
          datasets: [{ data: cumulativeCounts, strokeWidth: 3 }],
        });

        // ---- Recent Activity (latest 5 across all) ----
        const activities = [];

        beneficiaries.slice(-3).forEach((b) =>
          activities.push({
            type: "beneficiary",
            message: `New beneficiary registered: ${b.name || "Unnamed"}`,
            createdAt: new Date(b.createdAt),
          })
        );

        usersRes.slice(-3).forEach((u) =>
          activities.push({
            type: "user",
            message: `New user added: ${u.name || "Unnamed"}`,
            createdAt: new Date(u.createdAt),
          })
        );

        productsRes.slice(-3).forEach((p) =>
          activities.push({
            type: "product",
            message: `Product updated: ${p.name}`,
            createdAt: new Date(p.createdAt),
          })
        );

        distributionsRes.data.slice(-3).forEach((d) =>
          activities.push({
            type: "distribution",
            message: `Distribution made to Umunyabuzima`,
            createdAt: new Date(d.createdAt),
          })
        );

        activities.sort((a, b) => b.createdAt - a.createdAt);
        setRecentActivity(activities.slice(0, 5));

        // ---- Stats ----
        setStats({
          totalBeneficiaries,
          totalProducts,
          totalStock,
          totalDistributions,
          totalUsers,
          totalActives,
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const statCards = [
    {
      title: "Stock",
      value: stats.totalStock,
      icon: "archive-outline",
      color: "#2563EB",
    },
    {
      title: "Users",
      value: stats.totalUsers,
      icon: "people-circle-outline",
      color: "#4ADE80",
    },
    {
      title: "Beneficiaries",
      value: stats.totalBeneficiaries,
      icon: "heart-outline",
      color: "#14B8A6",
    },
    {
      title: "Products",
      value: stats.totalProducts,
      icon: "layers-outline",
      color: "#FACC15",
    },
    {
      title: "Active",
      value: stats.totalActives,
      icon: "cash-outline",
      color: "#F97316",
    },
    {
      title: "Distributions",
      value: stats.totalDistributions,
      icon: "send-outline",
      color: "#EF4444",
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Welcome back,{" "}
            <Text style={styles.greetingHighlight}>{user?.name}</Text> 👋
          </Text>
          <Caption>Here’s your dashboard overview</Caption>
        </View>
      </View>

      {/* Stat Cards */}
      <View style={styles.statsGrid}>
        {statCards.map((s, i) => (
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
        <Text style={styles.chartTitle}>
          📈 Beneficiaries Growth (Last 6 Months)
        </Text>
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
        {recentActivity.length === 0 ? (
          <Text style={{ color: "#6B7280" }}>No recent activity</Text>
        ) : (
          recentActivity.map((act, index) => (
            <View key={index} style={styles.activityItem}>
              {act.type === "user" && (
                <Ionicons name="person-add" size={18} color="#10B981" />
              )}
              {act.type === "product" && (
                <Ionicons name="cube" size={18} color="#3B82F6" />
              )}
              {act.type === "beneficiary" && (
                <Ionicons name="heart" size={18} color="#EF4444" />
              )}
              {act.type === "distribution" && (
                <Ionicons name="send" size={18} color="#F59E0B" />
              )}
              <Text style={styles.activityText}>{act.message}</Text>
            </View>
          ))
        )}
      </Card>

      {/* Quick Actions */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#3B82F6" }]}
            onPress={() => navigation.navigate("Users")}
          >
            <MaterialCommunityIcons
              name="account-multiple"
              size={20}
              color="#fff"
            />
            <Text style={styles.actionText}>Users</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#10B981" }]}
            onPress={() => navigation.navigate("ProductsScreen")}
          >
            <MaterialCommunityIcons
              name="cube-outline"
              size={20}
              color="#fff"
            />
            <Text style={styles.actionText}>Products</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#F59E0B" }]}
            onPress={() => navigation.navigate("Beneficiaries")}
          >
            <MaterialCommunityIcons name="hand-heart" size={20} color="#fff" />
            <Text style={styles.actionText}>Beneficiaries</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 15 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  greeting: { fontSize: 20, fontWeight: "600", color: "#111827" },
  greetingHighlight: { fontWeight: "bold", color: "blue" },

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

  actionsRow: { flexDirection: "column", alignItems: "center", marginTop: 10 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: "100%",
    marginBottom: 12,
  },
  actionText: { color: "#fff", fontSize: 16, marginLeft: 8 },

  activityItem: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  activityText: { marginLeft: 8, fontSize: 14, color: "#374151" },
});

export default HomeScreen;
