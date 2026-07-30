// UPI Payment Screen
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import AppBackButton from "@/components/common/AppBackButton";
import { isTransactionType } from '@/types/workflow';
import { isValidUpiId } from '@/utils/validation';
import { completePayment } from '@/utils/payment';
import { SafeAreaView } from 'react-native-safe-area-context';

// ============================================================
// THEME
// ============================================================
const COLORS = {
  primary: '#1E3A8A',
  accent: '#2563EB',
  background: '#D0E7FF',
  white: '#FFFFFF',
  textDark: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  success: '#16A34A',
  danger: '#DC2626',
};

// ============================================================
// TYPES
// ============================================================
type UPIApp = {
  id: string;
  name: string;
  icon: string;
};

// ============================================================
// STATIC DATA
// ============================================================
const UPI_APPS: UPIApp[] = [
  {
    id: 'gpay',
    name: 'Google Pay',
    icon: 'https://placehold.co/60x60/FFFFFF/1E3A8A?text=GPay',
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    icon: 'https://placehold.co/60x60/FFFFFF/2563EB?text=Phone+Pe',
  },
  {
    id: 'paytm',
    name: 'Paytm',
    icon: 'https://placehold.co/60x60/FFFFFF/1E3A8A?text=Paytm',
  },
  {
    id: 'bhim',
    name: 'BHIM',
    icon: 'https://placehold.co/60x60/FFFFFF/2563EB?text=BHIM',
  },
];

// ============================================================
// HELPERS
// ============================================================
// useLocalSearchParams can return a string or an array of strings.
// This helper always gives us back a clean single string.
const getParamString = (value: string | string[] | undefined, fallback = ''): string => {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }
  return value ?? fallback;
};

const getParamNumber = (value: string | string[] | undefined, fallback = 0): number => {
  const stringValue = getParamString(value, '');
  const parsed = parseFloat(stringValue);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function UPIPaymentScreen() {
  // ---------------- Params received from the previous screen ----------------
  const params = useLocalSearchParams();

const vehicle = getParamString(params.vehicle, 'Membership');
const workshop = getParamString(params.workshop, '-');

const service = getParamString(
  params.service,
  getParamString(params.bookingLabel, 'Membership')
);

const date = getParamString(params.date, '-');
const time = getParamString(params.time, '-');

const couponCode = getParamString(params.couponCode, '');

const originalAmount = getParamNumber(
  params.originalAmount,
  getParamNumber(params.amount, 0)
);

const discount = getParamNumber(params.discount, 0);

const finalAmount = getParamNumber(
  params.finalAmount,
  getParamNumber(params.amount, originalAmount - discount)
);
const rawTransactionType = getParamString(
  params.transactionType,
  getParamString(params.bookingType, "service")
);
const transactionType = isTransactionType(rawTransactionType)
  ? rawTransactionType
  : null;
const recordId = getParamString(
  params.recordId,
  getParamString(params.bookingId)
);
const label = getParamString(
  params.label,
  getParamString(params.bookingLabel, service)
);

  const gst = getParamNumber(
    params.gst,
    Math.max(finalAmount - (originalAmount - discount), 0)
  );

  // ---------------- Local state ----------------
  const [upiId, setUpiId] = useState('');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // ---------------- Animated values (Animated API only) ----------------
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const summaryCardAnim = useRef(new Animated.Value(0)).current;
  const amountCardAnim = useRef(new Animated.Value(0)).current;
  const appsCardAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade + slide the whole screen in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered card entrance animations
    Animated.stagger(140, [
      Animated.spring(summaryCardAnim, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.spring(amountCardAnim, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.spring(appsCardAnim, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const cardEntranceStyle = (animValue: Animated.Value) => ({
    opacity: animValue,
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.95, 1],
        }),
      },
    ],
  });

  // ---------------- Button press scale animation ----------------
  const handlePressIn = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 0.96,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  // ---------------- Payment handler ----------------
  const handlePayment = () => {
    if (isPaying) return;
    const trimmedUpiId = upiId.trim();

    if (!trimmedUpiId) {
      Alert.alert('UPI ID Required', 'Please enter your UPI ID');
      return;
    }

    if (!isValidUpiId(trimmedUpiId)) {
      Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID, for example sahil123@okaxis.');
      return;
    }
    if (!transactionType || !recordId || !Number.isFinite(finalAmount) || finalAmount <= 0) {
      Alert.alert(
        "Payment Details Missing",
        "The transaction reference or amount is invalid. Please return to Payment and try again."
      );
      return;
    }

    setIsPaying(true);

    setTimeout(async () => {
      try {
        const result = await completePayment({
          transactionType,
          recordId,
          amount: finalAmount,
          method: getParamString(params.paymentMethod, "UPI"),
        });

        router.dismissAll();
        router.replace({
          pathname: '/payments/PaymentSuccess',
          params: {
            transactionType,
            recordId,
            amount: finalAmount.toFixed(2),
            label,
            bookingId: recordId,
            bookingLabel: label,
            bookingType: transactionType,
            paymentId: result.paymentId,
            transactionId: result.transactionId,
            paymentStatus: result.status,
            vehicle,
            registrationNumber: getParamString(params.registrationNumber),
            workshop,
            workshopAddress: getParamString(params.workshopAddress),
            service,
            date,
            time,
            originalAmount: originalAmount.toFixed(2),
            discount: discount.toFixed(2),
            gst: gst.toFixed(2),
            couponCode,
            membershipPeriod: getParamString(params.membershipPeriod),
            membershipDuration: getParamString(params.membershipDuration),
            paymentMethod: getParamString(params.paymentMethod, "UPI"),
          },
        });
      } catch (error: any) {
        Alert.alert("Payment Failed", error?.message ?? "Please try again.");
        setIsPaying(false);
      }
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ---------------- Header ---------------- */}
      <View style={styles.header}>
        <AppBackButton fallbackRoute="/bookings/Payment" />
        <Text style={styles.headerTitle}>UPI Payment</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* ---------------- Booking Summary Card ---------------- */}
          <Animated.View style={[styles.card, cardEntranceStyle(summaryCardAnim)]}>
            <Text style={styles.cardTitle}>Booking Summary</Text>

            <SummaryRow label="Vehicle" value={vehicle} />
            <SummaryRow label="Workshop" value={workshop} />
            <SummaryRow label="Service" value={service} />
            <SummaryRow label="Date" value={date} />
            <SummaryRow label="Time" value={time} isLast />
          </Animated.View>

          {/* ---------------- Amount Card ---------------- */}
          <Animated.View style={[styles.card, cardEntranceStyle(amountCardAnim)]}>
            <Text style={styles.cardTitle}>Amount Details</Text>

            <SummaryRow label="Original Amount" value={formatCurrency(originalAmount)} />
            <SummaryRow
              label={couponCode ? `Coupon Discount (${couponCode})` : 'Coupon Discount'}
              value={`- ${formatCurrency(discount)}`}
              valueColor={COLORS.success}
            />
            <SummaryRow label="GST" value={formatCurrency(gst)} />

            <View style={styles.divider} />

            <View style={styles.finalAmountRow}>
              <Text style={styles.finalAmountLabel}>Final Amount</Text>
              <Text style={styles.finalAmountValue}>{formatCurrency(finalAmount)}</Text>
            </View>
          </Animated.View>

          {/* ---------------- UPI Apps Card ---------------- */}
          <Animated.View style={[styles.card, cardEntranceStyle(appsCardAnim)]}>
            <Text style={styles.cardTitle}>Pay Using UPI App</Text>

            <View style={styles.appsGrid}>
              {UPI_APPS.map((app) => {
                const isSelected = selectedApp === app.id;
                return (
                  <TouchableOpacity
                    key={app.id}
                    style={[styles.appCard, isSelected && styles.appCardSelected]}
                    onPress={() => setSelectedApp(app.id)}
                    activeOpacity={0.75}
                  >
                    <Image source={{ uri: app.icon }} style={styles.appIcon} />
                    <Text
                      style={[styles.appName, isSelected && styles.appNameSelected]}
                      numberOfLines={1}
                    >
                      {app.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>UPI ID</Text>
            <TextInput
              style={[styles.input, isInputFocused && styles.inputFocused]}
              placeholder="Enter your UPI ID"
              placeholderTextColor={COLORS.textMuted}
              value={upiId}
              onChangeText={(value) => setUpiId(value.slice(0, 100))}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              maxLength={100}
            />
            <Text style={styles.inputHint}>Example: username@okaxis</Text>
          </Animated.View>

          {/* ---------------- Pay Button ---------------- */}
          <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
            <TouchableOpacity
              style={[styles.payButton, isPaying && styles.payButtonDisabled]}
              onPress={handlePayment}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={isPaying}
              activeOpacity={0.85}
            >
              {isPaying ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.payButtonText}>Pay {formatCurrency(finalAmount)}</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.bottomSpacer} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================
// SMALL REUSABLE ROW COMPONENT
// ============================================================
type SummaryRowProps = {
  label: string;
  value: string;
  isLast?: boolean;
  valueColor?: string;
};

function SummaryRow({ label, value, isLast, valueColor }: SummaryRowProps) {
  return (
    <View style={[styles.summaryRow, !isLast && styles.summaryRowBorder]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.primary,
  },
 
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
  },
  summaryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: 13.5,
    color: COLORS.textMuted,
    flex: 1,
  },
  summaryValue: {
    fontSize: 13.5,
    color: COLORS.textDark,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  finalAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  finalAmountLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  finalAmountValue: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.primary,
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  appCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  appCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: '#EAF2FF',
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginBottom: 8,
  },
  appName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  appNameSelected: {
    color: COLORS.accent,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 14,
    color: COLORS.textDark,
    backgroundColor: '#FAFBFF',
  },
  inputFocused: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.white,
  },
  inputHint: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  payButtonDisabled: {
    backgroundColor: '#5D78B8',
  },
  payButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 24,
  },
});
