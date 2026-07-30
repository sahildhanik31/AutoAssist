import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import AppBackButton from "@/components/common/AppBackButton";
import { doc, getDoc } from "firebase/firestore";
import { auth } from "@/firebase/firebaseConfig";
import { db } from "@/firebase/firestore";
import {
  getParamString,
  isTransactionType,
  parsePositiveAmount,
} from "@/types/workflow";

const Colors = {
  primary: "#1e3a8a",
  accent: "#2563EB",
  background: "#d0e7ff",
  card: "#ffffff",
  textDark: "#1f2937",
  textMuted: "#6b7280",
  border: "#e5e7eb",
  success: "#16a34a",
  successBg: "#ecfdf5",
};

interface Detail {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const formatCurrency = (value: number): string =>
  `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const rawType = getParamString(
    params.transactionType,
    getParamString(params.bookingType, "service")
  );
  const transactionType = isTransactionType(rawType) ? rawType : "service";
  const recordId = getParamString(
    params.recordId,
    getParamString(params.bookingId)
  );
  const paymentId = getParamString(params.paymentId);
  const amount = parsePositiveAmount(params.amount) ?? 0;
  const isCash = getParamString(params.paymentStatus) === "cash_pending";

  const [title, setTitle] = useState(
    transactionType === "membership"
      ? "Membership Purchased Successfully"
      : transactionType === "inspection"
      ? "Inspection Booking Successful"
      : "Booking Successful"
  );
  const [details, setDetails] = useState<Detail[]>([]);
  const [transactionId, setTransactionId] = useState(
    getParamString(params.transactionId, paymentId || "--")
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSuccessDetails() {
      if (!recordId) {
        Alert.alert(
          "Payment Details Missing",
          "The transaction reference is missing.",
          [{ text: "Go Home", onPress: () => router.replace("/tabs/HomeScreen") }]
        );
        setLoading(false);
        return;
      }

      try {
        if (paymentId) {
          const paymentSnapshot = await getDoc(doc(db, "payments", paymentId));
          if (paymentSnapshot.exists()) {
            setTransactionId(
              paymentSnapshot.data().transactionId ?? transactionId
            );
          }
        }

        if (transactionType === "membership") {
          const uid = auth.currentUser?.uid;
          if (!uid) throw new Error("Please log in again.");
          const membershipSnapshot = await getDoc(
            doc(db, "users", uid, "memberships", "current")
          );
          const data = membershipSnapshot.exists()
            ? membershipSnapshot.data()
            : {};
          setTitle("Membership Purchased Successfully");
          setDetails([
            {
              icon: "shield-checkmark-outline",
              label: "Membership Plan",
              value:
                data.planName ??
                getParamString(params.label, "AutoAssist Elite"),
            },
            {
              icon: "calendar-outline",
              label: "Plan Duration",
              value:
                data.billingPeriod ??
                getParamString(
                  params.membershipDuration,
                  getParamString(params.membershipPeriod, "--")
                ),
            },
            {
              icon: "calendar-number-outline",
              label: "Start Date",
              value: data.startDate?.toDate
                ? data.startDate.toDate().toLocaleDateString("en-IN")
                : new Date().toLocaleDateString("en-IN"),
            },
          ]);
        } else if (transactionType === "inspection") {
          const snapshot = await getDoc(
            doc(db, "inspectionRequests", recordId)
          );
          const data = snapshot.exists() ? snapshot.data() : {};
          setTitle("Inspection Booking Successful");
          setDetails([
            {
              icon: "car-outline",
              label: "Vehicle",
              value: data.vehicle
                ? `${data.vehicle.company ?? ""} ${data.vehicle.model ?? ""}`.trim()
                : getParamString(params.vehicle, "--"),
            },
            {
              icon: "card-outline",
              label: "Registration",
              value:
                data.vehicle?.registrationNumber ??
                getParamString(params.registrationNumber, "--"),
            },
            {
              icon: "calendar-outline",
              label: "Inspection Schedule",
              value: `${data.preferredDate ?? getParamString(params.date, "--")} · ${
                data.preferredTime ?? getParamString(params.time, "--")
              }`,
            },
            {
              icon: "location-outline",
              label: "Inspection Location",
              value: [
                data.address,
                data.city,
                data.state,
                data.pin,
              ]
                .filter(Boolean)
                .join(", ") || "--",
            },
          ]);
        } else {
          const snapshot = await getDoc(doc(db, "bookings", recordId));
          const data = snapshot.exists() ? snapshot.data() : {};
          setDetails([
            {
              icon: "construct-outline",
              label: "Service",
              value:
                data.serviceName ??
                getParamString(params.service, getParamString(params.label, "Service")),
            },
            {
              icon: "car-outline",
              label: "Vehicle",
              value:
                data.vehicleSnapshot?.displayName ??
                getParamString(params.vehicle, "--"),
            },
            {
              icon: "card-outline",
              label: "Registration",
              value:
                data.vehicleSnapshot?.registrationNumber ??
                getParamString(params.registrationNumber, "--"),
            },
            {
              icon: "business-outline",
              label: "Workshop",
              value:
                data.workshopName ??
                data.workshopSnapshot?.name ??
                getParamString(params.workshop, "--"),
            },
            {
              icon: "calendar-outline",
              label: "Service Date & Time",
              value: `${data.date ?? getParamString(params.date, "--")} · ${
                data.timeSlot ?? getParamString(params.time, "--")
              }`,
            },
          ]);
        }
      } catch (error) {
        console.log(error);
        Alert.alert(
          "Details Unavailable",
          "Payment succeeded, but some transaction details could not be loaded."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSuccessDetails();
  }, [paymentId, recordId, transactionType]);

  function openInvoice() {
    router.push({
      pathname: "/payments/TaxInvoice",
      params: {
        ...params,
        transactionType,
        recordId,
        paymentId,
        amount: amount.toFixed(2),
        transactionId,
      },
    });
  }

  function trackBooking() {
    Alert.alert(
      "Coming Soon",
      "Live booking tracking will be available soon.",
      [{ text: "OK", onPress: () => router.replace("/tabs/HomeScreen") }]
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading transaction details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
  contentContainerStyle={styles.scrollContent}
  showsVerticalScrollIndicator={false}
>
  <AppBackButton fallbackRoute="/tabs/HomeScreen" />

  <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={52} color={Colors.card} />
        </View>
        <Text style={styles.successTitle}>{title}</Text>
        <Text style={styles.successSubtitle}>
          {isCash
            ? "Your booking is confirmed. Payment is due at the time of service."
            : "Your payment was completed successfully."}
        </Text>

        <View style={styles.card}>
          <View style={styles.idRow}>
            <View style={styles.idColumn}>
              <Text style={styles.idLabel}>
                {transactionType === "inspection"
                  ? "Inspection ID"
                  : transactionType === "membership"
                  ? "Membership ID"
                  : "Booking ID"}
              </Text>
              <Text style={styles.idValue}>{recordId}</Text>
            </View>
            <View style={styles.idDivider} />
            <View style={styles.idColumn}>
              <Text style={styles.idLabel}>Transaction ID</Text>
              <Text style={styles.idValue}>{transactionId}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>
              {isCash ? "Amount Due" : "Amount Paid"}
            </Text>
            <Text style={styles.amountValue}>{formatCurrency(amount)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          {details.map((detail) => (
            <View style={styles.detailRow} key={detail.label}>
              <View style={styles.detailIconCircle}>
                <Ionicons name={detail.icon} size={17} color={Colors.accent} />
              </View>
              <View style={styles.detailBody}>
                <Text style={styles.detailLabel}>{detail.label}</Text>
                <Text style={styles.detailValue}>{detail.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable style={styles.primaryButton} onPress={openInvoice}>
          <Ionicons name="document-text-outline" size={18} color={Colors.card} />
          <Text style={styles.primaryButtonText}>View & Download Invoice</Text>
        </Pressable>

        {transactionType === "service" && (
          <Pressable style={styles.secondaryButton} onPress={trackBooking}>
            <Ionicons name="navigate-outline" size={18} color={Colors.accent} />
            <Text style={styles.secondaryButtonText}>Track Booking</Text>
          </Pressable>
        )}

        <Pressable
          style={styles.homeButton}
          onPress={() => router.replace("/tabs/HomeScreen")}
        >
          <Text style={styles.homeButtonText}>Go to Home</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  loadingText: { marginTop: 12, color: Colors.textMuted },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 40,
    alignItems: "center",
  },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
    elevation: 8,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textDark,
    textAlign: "center",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 13.5,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 24,
  },
  card: {
    width: "100%",
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
  },
  idRow: { flexDirection: "row", alignItems: "center" },
  idColumn: { flex: 1 },
  idLabel: { fontSize: 11.5, color: Colors.textMuted, marginBottom: 4 },
  idValue: { fontSize: 12.5, fontWeight: "700", color: Colors.textDark },
  idDivider: {
    width: 1,
    height: 38,
    backgroundColor: Colors.border,
    marginHorizontal: 14,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 14 },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountLabel: { fontSize: 15, fontWeight: "700", color: Colors.textDark },
  amountValue: { fontSize: 18, fontWeight: "800", color: Colors.success },
  detailRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  detailIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  detailBody: { marginLeft: 12, flex: 1 },
  detailLabel: { fontSize: 11.5, color: Colors.textMuted, marginBottom: 2 },
  detailValue: { fontSize: 14, fontWeight: "600", color: Colors.textDark },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 12,
  },
  primaryButtonText: { fontSize: 15, fontWeight: "700", color: Colors.card },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  secondaryButtonText: { fontSize: 15, fontWeight: "700", color: Colors.accent },
  homeButton: { paddingVertical: 13, width: "100%", alignItems: "center" },
  homeButtonText: { fontSize: 14, fontWeight: "700", color: Colors.textMuted },
});
