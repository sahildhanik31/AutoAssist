// serviceHistory.tsx
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import AppBackButton from "@/components/common/AppBackButton";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth } from "@/firebase/firebaseConfig";
import { db } from "@/firebase/firestore";
import { SafeAreaView} from "react-native-safe-area-context";
const Colors = {
  primary: "#1E3A8A",
  accent: "#2563EB",
  background: "#D0E7FF",
  card: "#FFFFFF",
  textDark: "#1F2937",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  success: "#16A34A",
  successBg: "#ECFDF5",
};

type ServiceHistoryItem = {
  id: string;
  service: string;
  vehicle: string;
  workshop: string;
  date: string;
  amount: number;
  status: string;
  timestamp: number;
};



const formatCurrency = (a: number) =>
  `₹${a.toLocaleString("en-IN")}`;

export default function ServiceHistory() {
  const [historyData, setHistoryData] =
    useState<ServiceHistoryItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      async function loadHistory() {
        const uid = auth.currentUser?.uid;

        if (!uid) {
          setLoading(false);
          return;
        }

        setLoading(true);
        setError("");

        try {
          const q = query(
            collection(db, "bookings"),
            where("userId", "==", uid)
          );

          const snap = await getDocs(q);

          const items = snap.docs.map((d) => {
              const data = d.data();
              const snapshotVehicle =
                data.vehicleSnapshot?.displayName ??
                [data.vehicleSnapshot?.company, data.vehicleSnapshot?.model]
                  .filter(Boolean)
                  .join(" ");
              const vehicleName =
                snapshotVehicle ||
                data.vehicleName ||
                "Vehicle details unavailable";
              const registration =
                data.vehicleSnapshot?.registrationNumber ??
                data.registrationNumber ??
                "";

              return {
                id: d.id,
                service: data.serviceName ?? "Service",
                vehicle: registration
                  ? `${vehicleName} · ${registration}`
                  : vehicleName,
                workshop:
                  data.workshopName ??
                  data.workshopSnapshot?.name ??
                  "Workshop unavailable",
                date: data.date ?? "--",
                amount: Number(data.totalAmount) || 0,
                status: data.bookingStatus ?? data.paymentStatus ?? "Pending",
                timestamp: data.createdAt?.toMillis
                  ? data.createdAt.toMillis()
                  : 0,
              };
            });
          items.sort((a, b) => b.timestamp - a.timestamp);
          setHistoryData(items);
        } catch (err) {
          console.log(err);
          setError("Couldn't load service history. Please try again.");
        } finally {
          setLoading(false);
        }
      }

      loadHistory();
    }, [])
  );

  const totalSpent = historyData.reduce((s, i) => s + i.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <AppBackButton />

        <Text style={styles.headerTitle}>
          Service History
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {historyData.length}
              </Text>

              <Text style={styles.summaryLabel}>
                Total Services
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {formatCurrency(totalSpent)}
              </Text>

              <Text style={styles.summaryLabel}>
                Total Spent
              </Text>
            </View>
          </View>
          {loading && (
            <View style={styles.centerState}>
              <ActivityIndicator color={Colors.primary} />
              <Text style={styles.stateText}>Loading service history...</Text>
            </View>
          )}
          {!loading && !!error && (
            <Text style={[styles.stateText, { color: "#dc2626" }]}>{error}</Text>
          )}
          {!loading && !error && historyData.length === 0 && (
            <Text style={styles.stateText}>No service bookings yet.</Text>
          )}
          {historyData.map((item) => (
            <View
              key={item.id}
              style={styles.card}
            >
              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.service}>
                    {item.service}
                  </Text>

                  <Text style={styles.date}>
                    {item.date}
                  </Text>
                </View>

                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {item.status.replace(/_/g, " ")}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons
                  name="car-outline"
                  size={18}
                  color={Colors.accent}
                />

                <Text style={styles.info}>
                  {item.vehicle}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons
                  name="business-outline"
                  size={18}
                  color={Colors.accent}
                />

                <Text style={styles.info}>
                  {item.workshop}
                </Text>
              </View>

              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>
                  Amount Paid
                </Text>

                <Text style={styles.amount}>
                  {formatCurrency(item.amount)}
                </Text>
              </View>

              <Pressable style={styles.button}>
                <Text style={styles.buttonText}>
                  View Details
                </Text>
              </Pressable>
            </View>
          ))}
        </>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    backgroundColor: Colors.primary,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },

  content: {
    padding: 18,
    paddingBottom: 40,
  },
  centerState: {
    alignItems: "center",
    marginVertical: 16,
  },
  stateText: {
    textAlign: "center",
    color: Colors.textMuted,
    marginTop: 8,
  },

  summaryCard: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
  },

  divider: {
    width: 1,
    backgroundColor: Colors.border,
  },

  summaryValue: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.primary,
  },

  summaryLabel: {
    marginTop: 4,
    color: Colors.textMuted,
  },

  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  service: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textDark,
  },

  date: {
    marginTop: 4,
    color: Colors.textMuted,
  },

  badge: {
    backgroundColor: Colors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },

  badgeText: {
    color: Colors.success,
    fontWeight: "700",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  info: {
    marginLeft: 10,
    flex: 1,
  },

  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  amountLabel: {
    color: Colors.textMuted,
  },

  amount: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.primary,
  },

  button: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});