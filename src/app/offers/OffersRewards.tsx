
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import {
  parseBookingDraft,
  serializeBookingDraft,
} from "../../types/workflow";
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
  gold: "#b45309",
  goldBg: "#fffbeb",
};

// ------------------------------------------------------
// Types
// ------------------------------------------------------
interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: number;
  recommended?: boolean;
}

// ------------------------------------------------------
// Mock data
// ------------------------------------------------------
const coupons: Coupon[] = [
  {
    id: "c1",
    code: "FIRST200",
    title: "\u20b9200 off",
    description: "On your first service booking",
    discount: 200,
    recommended: true,
  },
  {
    id: "c2",
    code: "SAVE10",
    title: "10% off up to \u20b9300",
    description: "Valid on all service categories",
    discount: 300,
  },
  {
    id: "c3",
    code: "WEEKEND150",
    title: "\u20b9150 off",
    description: "Applicable on weekend bookings",
    discount: 150,
  },
];

const formatCurrency = (value: number): string =>
  `\u20b9${value.toLocaleString("en-IN")}`;

// ------------------------------------------------------
// Coupon Card
// ------------------------------------------------------
interface CouponCardProps {
  coupon: Coupon;
  isSelected: boolean;
  onSelect: (coupon: Coupon) => void;
}

const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  isSelected,
  onSelect,
}) => (
  <Pressable
    style={[styles.couponCard, isSelected && styles.couponCardSelected]}
    onPress={() => onSelect(coupon)}
  >
    <View style={styles.couponLeft}>
      <View
        style={[
          styles.couponIconCircle,
          isSelected && styles.couponIconCircleSelected,
        ]}
      >
        <Ionicons
          name="pricetag"
          size={18}
          color={isSelected ? Colors.card : Colors.accent}
        />
      </View>
    </View>

    <View style={styles.couponBody}>
      {coupon.recommended && (
        <View style={styles.recommendedPill}>
          <Text style={styles.recommendedText}>RECOMMENDED</Text>
        </View>
      )}
      <Text style={styles.couponTitle}>{coupon.title}</Text>
      <Text style={styles.couponDescription}>{coupon.description}</Text>
      <Text style={styles.couponCode}>Code: {coupon.code}</Text>
    </View>

    <View style={styles.radioOuter}>
      {isSelected && <View style={styles.radioInner} />}
    </View>
  </Pressable>
);

// ------------------------------------------------------
// Screen
// ------------------------------------------------------
export default function OffersRewards() {
const router = useRouter();

const {
  from,
  booking,
} = useLocalSearchParams<{
  from?: "home" | "booking";
  booking?: string;
}>();

const bookingDraft = parseBookingDraft(booking);
const bookingAmount = bookingDraft?.grandTotal ??
  ((bookingDraft?.basePrice ?? 0) + (bookingDraft?.additionalCharges ?? 0));
const membershipDiscount = Math.max(bookingDraft?.membershipDiscount ?? 0, 0);
const rewardPointsAvailable = 240;
const rewardPointsValue = 240;
const cashbackPercent = 5;
const isBookingFlow = from === "booking";
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [promoCode, setPromoCode] = useState<string>("");
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [rewardPointsApplied, setRewardPointsApplied] =
    useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const successOpacity = useRef(new Animated.Value(0)).current;
  const successTranslateY = useRef(new Animated.Value(-8)).current;

  const filteredCoupons = coupons.filter(
    (coupon) =>
      coupon.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      coupon.code.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const playSuccessAnimation = () => {
    successOpacity.setValue(0);
    successTranslateY.setValue(-8);
    setShowSuccess(true);
    Animated.parallel([
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(successTranslateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        Animated.timing(successOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => setShowSuccess(false));
      }, 1800);
    });
  };

  const handleSelectCoupon = (coupon: Coupon) => {
    setSelectedCoupon((prev) => (prev?.id === coupon.id ? null : coupon));
    setPromoCode("");
    if (selectedCoupon?.id !== coupon.id) {
      playSuccessAnimation();
    }
  };

  const handleApplyPromoCode = () => {
    const normalizedCode = promoCode.trim().toUpperCase();
    if (!normalizedCode) {
      Alert.alert("Coupon Required", "Please enter a coupon code.");
      return;
    }
    const match = coupons.find(
      (coupon) => coupon.code === normalizedCode
    );
    if (match) {
      setSelectedCoupon(match);
      setPromoCode(normalizedCode);
      playSuccessAnimation();
    } else {
      Alert.alert(
        "Invalid Coupon",
        "This coupon code is invalid or not applicable."
      );
    }
  };

  const handleToggleRewardPoints = () => {
    setRewardPointsApplied((prev) => !prev);
  };

const couponSavings = Math.min(selectedCoupon?.discount ?? 0, bookingAmount);
const rewardSavings = Math.min(
  rewardPointsApplied ? rewardPointsValue : 0,
  Math.max(bookingAmount - couponSavings, 0)
);
const cashbackAmount = Math.round(
  (Math.max(bookingAmount - couponSavings - rewardSavings, 0) * cashbackPercent) / 100
);
const totalSavings = couponSavings + rewardSavings;
const payableAmount = Math.max(bookingAmount - totalSavings, 0);
  const handleContinue = () => {
  if (from === "home") {
    router.push("/bookings/BookService");
    return;
  }

  if (!bookingDraft || !bookingDraft.workshop) {
    Alert.alert(
      "Booking Details Missing",
      "Your service or workshop details are missing. Please restart the booking.",
      [{ text: "OK", onPress: () => router.replace("/bookings/BookService") }]
    );
    return;
  }

  const nextDraft = {
    ...bookingDraft,
    selectedCoupon: selectedCoupon
      ? { code: selectedCoupon.code, discount: couponSavings }
      : null,
    couponDiscount: couponSavings,
    rewardDiscount: rewardSavings,
    membershipDiscount,
    rewardPointsApplied,
  };

  router.push({
    pathname: "/bookings/BookingSummary",
    params: {
      booking: serializeBookingDraft(nextDraft),
    },
  });
};

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AppBackButton fallbackRoute="/bookings/SelectWorkshop" />
        <Text style={styles.headerTitle}>Offers & Rewards</Text>
        <View style={{ width: 24 }} />
      </View>

      {showSuccess && (
        <Animated.View
          style={[
            styles.successBanner,
            {
              opacity: successOpacity,
              transform: [{ translateY: successTranslateY }],
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
          <Text style={styles.successText}>Coupon applied successfully</Text>
        </Animated.View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Coupon Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search available coupons"
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Promo Code Field */}
        <View style={styles.promoRow}>
          <TextInput
            style={styles.promoInput}
            placeholder="Enter promo code"
            placeholderTextColor={Colors.textMuted}
            value={promoCode}
            autoCapitalize="characters"
            maxLength={20}
            onChangeText={(value) =>
              setPromoCode(value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20))
            }
          />
          <Pressable style={styles.applyButton} onPress={handleApplyPromoCode}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </Pressable>
        </View>

        {/* Available Coupons */}
        <Text style={styles.sectionTitle}>Available Coupons</Text>
        {filteredCoupons.map((coupon) => (
          <CouponCard
            key={coupon.id}
            coupon={coupon}
            isSelected={selectedCoupon?.id === coupon.id}
            onSelect={handleSelectCoupon}
          />
        ))}

        {/* Membership Discount */}
        <View style={styles.perkCard}>
          <View style={[styles.perkIconCircle, { backgroundColor: Colors.goldBg }]}>
            <Ionicons name="ribbon" size={20} color={Colors.gold} />
          </View>
          <View style={styles.perkBody}>
            <Text style={styles.perkTitle}>Membership Discount</Text>
            <Text style={styles.perkDescription}>
              AutoAssist Plus members save {formatCurrency(membershipDiscount)}{" "}
              on every service
            </Text>
          </View>
        </View>

        {/* Reward Points */}
        <Pressable
          style={[
            styles.perkCard,
            rewardPointsApplied && styles.perkCardSelected,
          ]}
          onPress={handleToggleRewardPoints}
        >
          <View style={[styles.perkIconCircle, { backgroundColor: "#eff6ff" }]}>
            <Ionicons name="star" size={20} color={Colors.accent} />
          </View>
          <View style={styles.perkBody}>
            <Text style={styles.perkTitle}>Reward Points</Text>
            <Text style={styles.perkDescription}>
              You have {rewardPointsAvailable} points worth{" "}
              {formatCurrency(rewardPointsValue)}
            </Text>
          </View>
          <View style={styles.radioOuter}>
            {rewardPointsApplied && <View style={styles.radioInner} />}
          </View>
        </Pressable>

        {/* Cashback Offer */}
        <View style={styles.perkCard}>
          <View style={[styles.perkIconCircle, { backgroundColor: Colors.successBg }]}>
            <Ionicons name="cash" size={20} color={Colors.success} />
          </View>
          <View style={styles.perkBody}>
            <Text style={styles.perkTitle}>Cashback Offer</Text>
            <Text style={styles.perkDescription}>
              Get {cashbackPercent}% cashback ({formatCurrency(cashbackAmount)}
              ) credited within 24 hours
            </Text>
          </View>
        </View>

        {/* Savings Summary */}
        {isBookingFlow && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Savings Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Booking Amount</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(bookingAmount)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Coupon Savings</Text>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>
              - {formatCurrency(couponSavings)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Reward Points Used</Text>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>
              - {formatCurrency(rewardSavings)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryPayableLabel}>Amount Payable</Text>
            <Text style={styles.summaryPayableValue}>
              {formatCurrency(payableAmount)}
            </Text>
          </View>
        </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Section */}
      <View style={styles.bottomSection}>

  {isBookingFlow && (
    <View style={styles.bottomSavingsRow}>
      <Text style={styles.bottomSavingsLabel}>
        Total Savings
      </Text>

      <Text style={styles.bottomSavingsValue}>
        {formatCurrency(totalSavings)}
      </Text>
    </View>
  )}

  <Pressable
    style={styles.continueButton}
    onPress={handleContinue}
  >
    <Text style={styles.continueButtonText}>
  {from === "home"
    ? "Continue to Book Service"
    : "Continue to Booking Summary"}
</Text>
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
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textDark,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: Colors.successBg,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  successText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.success,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  searchBar: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: Colors.card,
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 12,
  marginBottom: 12,
  gap: 10,
  boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)",
  elevation: 2,
},
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
  },
  promoRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
 promoInput: {
  flex: 1,
  backgroundColor: Colors.card,
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 14,
  color: Colors.textDark,
  boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)",
  elevation: 2,
},
  applyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: Colors.card,
    fontSize: 14,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 12,
  },
 couponCard: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: Colors.card,
  borderRadius: 16,
  padding: 14,
  marginBottom: 12,
  borderWidth: 1.5,
  borderColor: "transparent",
  boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.05)",
  elevation: 2,
},
  couponCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: "#eff6ff",
  },
  couponLeft: {
    marginRight: 12,
  },
  couponIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  couponIconCircleSelected: {
    backgroundColor: Colors.accent,
  },
  couponBody: {
    flex: 1,
  },
  recommendedPill: {
    alignSelf: "flex-start",
    backgroundColor: Colors.goldBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.gold,
    letterSpacing: 0.4,
  },
  couponTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 3,
  },
  couponDescription: {
    fontSize: 12.5,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  couponCode: {
    fontSize: 11.5,
    fontWeight: "600",
    color: Colors.accent,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: Colors.accent,
  },
  perkCard: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: Colors.card,
  borderRadius: 16,
  padding: 14,
  marginBottom: 12,
  borderWidth: 1.5,
  borderColor: "transparent",
  boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.05)",
  elevation: 2,
},
  perkCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: "#eff6ff",
  },
  perkIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  perkBody: {
    flex: 1,
  },
  perkTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 3,
  },
  perkDescription: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  summaryCard: {
  backgroundColor: Colors.card,
  borderRadius: 18,
  padding: 18,
  marginTop: 8,
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.06)",
  elevation: 3,
},
  summaryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 13.5,
    color: Colors.textMuted,
  },
  summaryValue: {
    fontSize: 13.5,
    fontWeight: "600",
    color: Colors.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  summaryPayableLabel: {
    fontSize: 15.5,
    fontWeight: "700",
    color: Colors.textDark,
  },
  summaryPayableValue: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.primary,
  },
 bottomSection: {
  backgroundColor: Colors.card,
  paddingHorizontal: 20,
  paddingTop: 16,
  paddingBottom: 28,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  boxShadow: "0px -4px 12px rgba(0, 0, 0, 0.08)",
  elevation: 10,
},
  bottomSavingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  bottomSavingsLabel: {
    fontSize: 13.5,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  bottomSavingsValue: {
    fontSize: 13.5,
    color: Colors.success,
    fontWeight: "700",
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.card,
  },
});
