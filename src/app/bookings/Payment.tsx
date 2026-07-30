//Payment Screen
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Easing,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  isTransactionType,
  parsePositiveAmount,
} from "@/types/workflow";
import { completePayment } from "@/utils/payment";
import AppBackButton from "@/components/common/AppBackButton";
// ------------------------------------------------------
// Theme
// ------------------------------------------------------
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

// ------------------------------------------------------
// Types
// ------------------------------------------------------
type PaymentMethodId =
  | "upi"
  | "credit_card"
  | "debit_card"
  | "cod";

interface PaymentMethod {
  id: PaymentMethodId;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}

// ------------------------------------------------------
// Data
// ------------------------------------------------------
const paymentMethods: PaymentMethod[] = [
  {
    id: "upi",
    title: "UPI",
    subtitle: "Pay via Google Pay, PhonePe, Paytm",
    icon: "phone-portrait-outline",
  },
  {
    id: "credit_card",
    title: "Credit Card",
    subtitle: "Visa, Mastercard, RuPay accepted",
    icon: "card-outline",
  },
  {
    id: "debit_card",
    title: "Debit Card",
    subtitle: "All major banks supported",
    icon: "card",
  },
  {
    id: "cod",
    title: "Cash",
    subtitle: "Pay after the service is completed",
    icon: "cash-outline",
  },
];

const formatCurrency = (value: number): string =>
  `\u20b9${value.toLocaleString("en-IN")}`;

// ------------------------------------------------------
// Payment Option Row
// ------------------------------------------------------
interface PaymentOptionProps {
  method: PaymentMethod;
  isSelected: boolean;
  onSelect: (id: PaymentMethodId) => void;
}

const PaymentOption: React.FC<PaymentOptionProps> = ({
  method,
  isSelected,
  onSelect,
}) => (
  <Pressable
    style={[styles.optionRow, isSelected && styles.optionRowSelected]}
    onPress={() => onSelect(method.id)}
  >
    <View
      style={[
        styles.optionIconCircle,
        isSelected && styles.optionIconCircleSelected,
      ]}
    >
      <Ionicons
        name={method.icon}
        size={20}
        color={isSelected ? Colors.card : Colors.accent}
      />
    </View>
    <View style={styles.optionBody}>
      <Text style={styles.optionTitle}>{method.title}</Text>
      <Text style={styles.optionSubtitle}>{method.subtitle}</Text>
    </View>
    <View style={styles.radioOuter}>
      {isSelected && <View style={styles.radioInner} />}
    </View>
  </Pressable>
);

// ------------------------------------------------------
// Screen
// ------------------------------------------------------
export default function PaymentScreen() {
  const params = useLocalSearchParams<{
    transactionType?: string;
    recordId?: string;
    label?: string;
    bookingId?: string;
    amount?: string;
    bookingLabel?: string;
    bookingType?: string;
    service?: string;
    vehicle?: string;
    registrationNumber?: string;
    workshop?: string;
    workshopAddress?: string;
    date?: string;
    time?: string;
    originalAmount?: string;
    discount?: string;
    gst?: string;
    couponCode?: string;
    membershipPeriod?: string;
    membershipDuration?: string;
  }>();

  const recordId = params.recordId ?? params.bookingId ?? "";
  const bookingLabel = params.label ?? params.bookingLabel ?? "AutoAssist Service";
  const finalAmount = parsePositiveAmount(params.amount);
  const rawType = params.transactionType ?? params.bookingType ?? "service";
  const transactionType = isTransactionType(rawType) ? rawType : null;

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>("upi");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
const spinValue = useRef(new Animated.Value(0)).current;
const startSpinner = () => {
  spinValue.setValue(0);

  Animated.loop(
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 900,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  ).start();
};

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

const forwardParams = {
  transactionType: transactionType ?? "",
  recordId,
  amount: finalAmount?.toFixed(2) ?? "",
  label: bookingLabel,
  bookingId: recordId,
  bookingLabel,
  bookingType: transactionType ?? "",
  service: params.service ?? bookingLabel,
  vehicle: params.vehicle ?? "",
  registrationNumber: params.registrationNumber ?? "",
  workshop: params.workshop ?? "",
  workshopAddress: params.workshopAddress ?? "",
  date: params.date ?? "",
  time: params.time ?? "",
  originalAmount: params.originalAmount ?? finalAmount?.toFixed(2) ?? "",
  discount: params.discount ?? "0",
  gst: params.gst ?? "0",
  couponCode: params.couponCode ?? "",
  membershipPeriod: params.membershipPeriod ?? "",
  membershipDuration: params.membershipDuration ?? "",
};

const availablePaymentMethods =
  transactionType === "membership"
    ? paymentMethods.filter((method) => method.id !== "cod")
    : paymentMethods;

const handlePayNow = async () => {
  if (isProcessing) return;
  if (!transactionType || !recordId || finalAmount === null) {
    Alert.alert(
      "Payment Details Missing",
      "The transaction reference or amount is invalid. Please return to the summary and try again."
    );
    return;
  }

  if (selectedMethod === "upi") {
    router.push({
      pathname: "/payments/UpiPayment",
      params: { ...forwardParams, paymentMethod: "UPI" },
    });
    return;
  }
  if (selectedMethod === "credit_card" || selectedMethod === "debit_card") {
    router.push({
      pathname: "/payments/CardPayment",
      params: {
        ...forwardParams,
        paymentMethod:
          selectedMethod === "credit_card" ? "Credit Card" : "Debit Card",
      },
    });
    return;
  }

  if (transactionType === "membership") {
    Alert.alert("Payment Method Unavailable", "Cash is not available for membership purchases.");
    return;
  }

  setIsProcessing(true);
  startSpinner();
  try {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const result = await completePayment({
      transactionType,
      recordId,
      amount: finalAmount,
      method: "Cash on Service",
      isCash: true,
    });
    router.dismissAll();
    router.replace({
      pathname: "/payments/PaymentSuccess",
      params: {
        ...forwardParams,
        paymentId: result.paymentId,
        transactionId: result.transactionId,
        paymentMethod: "Cash on Service",
        paymentStatus: result.status,
      },
    });
  } catch (error: any) {
    Alert.alert("Payment Failed", error?.message ?? "Please try again.");
  } finally {
    setIsProcessing(false);
  }
};
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AppBackButton fallbackRoute="/bookings/BookingSummary" />
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Booking Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={styles.summaryLabel}>Paying for</Text>
              <Text style={styles.summaryService}>{bookingLabel}</Text>
            </View>
            <Ionicons name="receipt-outline" size={22} color={Colors.accent} />
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryFinalLabel}>Final Amount</Text>
            <Text style={styles.summaryFinalValue}>
              {formatCurrency(finalAmount ?? 0)}
            </Text>
          </View>
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Select Payment Method</Text>
        <View style={styles.methodsCard}>
          {availablePaymentMethods.map((method, index) => (
            <View key={method.id}>
              <PaymentOption
                method={method}
                isSelected={selectedMethod === method.id}
                onSelect={setSelectedMethod}
              />
              {index < availablePaymentMethods.length - 1 && (
                <View style={styles.optionDivider} />
              )}
            </View>
          ))}
        </View>

        {/* Security Info */}
        <View style={styles.securityCard}>
          <View style={styles.securityRow}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.success} />
            <Text style={styles.securityText}>100% Secure Payments</Text>
          </View>
          <View style={styles.securityRow}>
            <Ionicons name="lock-closed" size={20} color={Colors.success} />
            <Text style={styles.securityText}>SSL Encrypted Transaction</Text>
          </View>
          <View style={styles.securityRow}>
            <Ionicons name="refresh-circle" size={20} color={Colors.success} />
            <Text style={styles.securityText}>
              100% refund if service is cancelled before pickup
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Section */}
      <View style={styles.bottomSection}>
        <View style={styles.bottomAmountRow}>
          <Text style={styles.bottomAmountLabel}>Total Payable</Text>
          <Text style={styles.bottomAmountValue}>
            {formatCurrency(finalAmount ?? 0)}
          </Text>
        </View>
        <Pressable
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handlePayNow}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <View style={styles.processingRow}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <ActivityIndicator size="small" color={Colors.card} />
              </Animated.View>
              <Text style={styles.payButtonText}>Processing Payment...</Text>
            </View>
          ) : (
            <Text style={styles.payButtonText}>
              {selectedMethod === "cod" ? "Confirm Cash Payment" : "Continue"}  {formatCurrency(finalAmount ?? 0)}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

// ------------------------------------------------------
// Styles
// ------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF2FF",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#DCE7F5",

    shadowColor: "#123A7A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#172033",
    letterSpacing: 0.2,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28,
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 19,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#DCE7F5",

    shadowColor: "#173A6A",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 6,
  },

  summaryTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  summaryLabel: {
    fontSize: 12.5,
    color: "#64748B",
    marginBottom: 5,
    fontWeight: "600",
  },

  summaryService: {
    fontSize: 17,
    fontWeight: "800",
    color: "#172033",
    lineHeight: 22,
    maxWidth: 250,
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  summaryFinalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
  },

  summaryFinalValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#123A7A",
    letterSpacing: 0.2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 13,
    letterSpacing: 0.1,
  },

  methodsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#DCE7F5",

    shadowColor: "#173A6A",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 5,
  },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 4,
    borderRadius: 15,
  },

  optionRowSelected: {
    backgroundColor: "#EEF5FF",
    paddingHorizontal: 10,
    marginHorizontal: -4,
    borderWidth: 1,
    borderColor: "#CFE0F7",
  },

  optionIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D6E4F5",
  },

  optionIconCircleSelected: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",

    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 4,
  },

  optionBody: {
    flex: 1,
    marginLeft: 14,
  },

  optionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 4,
  },

  optionSubtitle: {
    fontSize: 12.5,
    color: "#64748B",
    lineHeight: 17,
    fontWeight: "500",
  },

  optionDivider: {
    height: 1,
    backgroundColor: "#E6EDF5",
    marginLeft: 60,
  },

  radioOuter: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    backgroundColor: "#FFFFFF",
  },

  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#2563EB",
  },

  securityCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 20,
    padding: 18,
    gap: 13,
    borderWidth: 1,
    borderColor: "#BCE8D2",
    marginBottom: 6,
  },

  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  securityText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#23543A",
    lineHeight: 18,
  },

  bottomSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 19,
    paddingTop: 16,
    paddingBottom: 28,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    borderTopColor: "#DCE7F5",

    shadowColor: "#102D55",
    shadowOffset: {
      width: 0,
      height: -6,
    },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 14,
  },

  bottomAmountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
    paddingHorizontal: 2,
  },

  bottomAmountLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "700",
  },

  bottomAmountValue: {
    fontSize: 20,
    color: "#123A7A",
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  payButton: {
    minHeight: 58,
    backgroundColor: "#123A7A",
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#0D2D62",

    shadowColor: "#123A7A",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.27,
    shadowRadius: 11,
    elevation: 8,
  },

  payButtonDisabled: {
    backgroundColor: "#8093BF",
    borderColor: "#8093BF",
    shadowOpacity: 0,
    elevation: 0,
  },

  processingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  payButtonText: {
    fontSize: 15.5,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.25,
    textAlign: "center",
  },
});