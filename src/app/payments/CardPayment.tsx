// Card payment screen 
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { isTransactionType } from '@/types/workflow';
import {
  isFutureExpiry,
  isValidName,
  passesLuhn,
  sanitizeName,
} from '@/utils/validation';
import { completePayment } from '@/utils/payment';
import AppBackButton from "@/components/common/AppBackButton";
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
// HELPERS
// ============================================================
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

// Adds a space after every 4 digits: 4242424242424242 -> 4242 4242 4242 4242
const formatCardNumber = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 16);
  return digitsOnly.replace(/(.{4})/g, '$1 ').trim();
};

// Auto-inserts a slash after 2 digits: 1225 -> 12/25
const formatExpiry = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
  if (digitsOnly.length <= 2) {
    return digitsOnly;
  }
  return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function CardPaymentScreen() {
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

const discount = getParamNumber(params.discount, 0);
const originalAmount = getParamNumber(
  params.originalAmount,
  getParamNumber(params.amount, 0)
);

const finalAmount = getParamNumber(
  params.finalAmount,
  getParamNumber(params.amount, 0)
);
const gst = getParamNumber(
  params.gst,
  Math.max(finalAmount - (originalAmount - discount), 0)
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

  // ---------------- Form state ----------------
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  const [focusedField, setFocusedField] = useState<
    'cardNumber' | 'expiry' | 'cvv' | 'name' | null
  >(null);

  // ---------------- Animated values (Animated API only) ----------------
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const summaryCardAnim = useRef(new Animated.Value(0)).current;
  const amountCardAnim = useRef(new Animated.Value(0)).current;
  const formCardAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  // Per-field focus scale animations, used for the "input focus effect"
  const cardNumberFocusAnim = useRef(new Animated.Value(1)).current;
  const expiryFocusAnim = useRef(new Animated.Value(1)).current;
  const cvvFocusAnim = useRef(new Animated.Value(1)).current;
  const nameFocusAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
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
      Animated.spring(formCardAnim, {
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

  // ---------------- Input focus animation helpers ----------------
  const animateFocus = (animValue: Animated.Value, focused: boolean) => {
    Animated.spring(animValue, {
      toValue: focused ? 1.03 : 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  const handleFocus = (field: 'cardNumber' | 'expiry' | 'cvv' | 'name') => {
    setFocusedField(field);
    const animMap = {
      cardNumber: cardNumberFocusAnim,
      expiry: expiryFocusAnim,
      cvv: cvvFocusAnim,
      name: nameFocusAnim,
    };
    animateFocus(animMap[field], true);
  };

  const handleBlur = (field: 'cardNumber' | 'expiry' | 'cvv' | 'name') => {
    setFocusedField(null);
    const animMap = {
      cardNumber: cardNumberFocusAnim,
      expiry: expiryFocusAnim,
      cvv: cvvFocusAnim,
      name: nameFocusAnim,
    };
    animateFocus(animMap[field], false);
  };

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

  // ---------------- Validation ----------------
  const validateForm = (): boolean => {
    const digitsOnlyCardNumber = cardNumber.replace(/\D/g, '');
    if (digitsOnlyCardNumber.length !== 16) {
      Alert.alert('Invalid Card Number', 'Please enter a valid 16-digit card number');
      return false;
    }
    if (!passesLuhn(digitsOnlyCardNumber)) {
      Alert.alert('Invalid Card Number', 'Please enter a valid card number.');
      return false;
    }

    if (!isFutureExpiry(expiry)) {
      Alert.alert('Invalid Expiry Date', 'Please enter a valid, non-expired date in MM/YY format.');
      return false;
    }

    if (!/^\d{3}$/.test(cvv)) {
      Alert.alert('Invalid CVV', 'Please enter a valid 3-digit CVV');
      return false;
    }

    if (!isValidName(cardholderName)) {
      Alert.alert('Invalid Name', 'Please enter a valid name using letters only.');
      return false;
    }
    if (!transactionType || !recordId || !Number.isFinite(finalAmount) || finalAmount <= 0) {
      Alert.alert(
        "Payment Details Missing",
        "The transaction reference or amount is invalid. Please return to Payment and try again."
      );
      return false;
    }

    return true;
  };

  // ---------------- Payment handler ----------------
  const handlePayment = () => {
    if (isPaying) return;
    if (!validateForm()) {
      return;
    }

    setIsPaying(true);

    setTimeout(async () => {
      try {
        if (!transactionType) return;
        const digits = cardNumber.replace(/\D/g, "");
        const result = await completePayment({
          transactionType,
          recordId,
          amount: finalAmount,
          method: getParamString(params.paymentMethod, "Card"),
          last4: digits.slice(-4),
        });

        router.dismissAll();
        router.replace({
          pathname: "/payments/PaymentSuccess",
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
            paymentMethod: getParamString(params.paymentMethod, "Card"),
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
        <Text style={styles.headerTitle}>Card Payment</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
            <SummaryRow label="Service" value={service} isLast />
          </Animated.View>

          {/* ---------------- Amount Card ---------------- */}
          <Animated.View style={[styles.card, cardEntranceStyle(amountCardAnim)]}>
            <Text style={styles.cardTitle}>Amount</Text>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalValue}>{formatCurrency(finalAmount)}</Text>
            </View>
            {couponCode ? (
              <Text style={styles.couponHint}>
                Coupon {couponCode} applied · Saved {formatCurrency(discount)}
              </Text>
            ) : null}
          </Animated.View>

          {/* ---------------- Card Form ---------------- */}
          <Animated.View style={[styles.card, cardEntranceStyle(formCardAnim)]}>
            <View style={styles.cardFormHeader}>
              <Text style={styles.cardTitle}>Card Details</Text>
              <Image
                source={{ uri: 'https://placehold.co/44x28/1E3A8A/FFFFFF?text=Card' }}
                style={styles.cardBrandIcon}
              />
            </View>

            {/* Card Number */}
            <Text style={styles.inputLabel}>Card Number</Text>
            <Animated.View style={{ transform: [{ scale: cardNumberFocusAnim }] }}>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'cardNumber' && styles.inputFocused,
                ]}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={COLORS.textMuted}
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                onFocus={() => handleFocus('cardNumber')}
                onBlur={() => handleBlur('cardNumber')}
                keyboardType="number-pad"
                maxLength={19}
              />
            </Animated.View>

            {/* Expiry + CVV */}
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <Animated.View style={{ transform: [{ scale: expiryFocusAnim }] }}>
                  <TextInput
                    style={[styles.input, focusedField === 'expiry' && styles.inputFocused]}
                    placeholder="MM/YY"
                    placeholderTextColor={COLORS.textMuted}
                    value={expiry}
                    onChangeText={(text) => setExpiry(formatExpiry(text))}
                    onFocus={() => handleFocus('expiry')}
                    onBlur={() => handleBlur('expiry')}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                </Animated.View>
              </View>

              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>CVV</Text>
                <Animated.View style={{ transform: [{ scale: cvvFocusAnim }] }}>
                  <TextInput
                    style={[styles.input, focusedField === 'cvv' && styles.inputFocused]}
                    placeholder="123"
                    placeholderTextColor={COLORS.textMuted}
                    value={cvv}
                    onChangeText={(text) => setCvv(text.replace(/\D/g, '').slice(0, 3))}
                    onFocus={() => handleFocus('cvv')}
                    onBlur={() => handleBlur('cvv')}
                    keyboardType="number-pad"
                    maxLength={3}
                    secureTextEntry
                  />
                </Animated.View>
              </View>
            </View>

            {/* Cardholder Name */}
            <Text style={styles.inputLabel}>Cardholder Name</Text>
            <Animated.View style={{ transform: [{ scale: nameFocusAnim }] }}>
              <TextInput
                style={[styles.input, focusedField === 'name' && styles.inputFocused]}
                placeholder="Name as shown on card"
                placeholderTextColor={COLORS.textMuted}
                value={cardholderName}
                onChangeText={(value) => setCardholderName(sanitizeName(value))}
                onFocus={() => handleFocus('name')}
                onBlur={() => handleBlur('name')}
                autoCapitalize="words"
                maxLength={50}
              />
            </Animated.View>
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
};

function SummaryRow({ label, value, isLast }: SummaryRowProps) {
  return (
    <View style={[styles.summaryRow, !isLast && styles.summaryRowBorder]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
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
  cardFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBrandIcon: {
    width: 44,
    height: 28,
    borderRadius: 6,
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  couponHint: {
    fontSize: 12,
    color: COLORS.success,
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
    marginTop: 4,
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
    marginBottom: 4,
  },
  inputFocused: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.white,
  },
  rowFields: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfField: {
    width: '48%',
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
