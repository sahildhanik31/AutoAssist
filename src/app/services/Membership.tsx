// Membership Screen
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "@/firebase/firebaseConfig";
import { db } from "@/firebase/firestore";
import AppBackButton from "@/components/common/AppBackButton";
// ------------------------------------------------------
// Theme (kept identical to PaymentScreen / PaymentSuccessScreen / TaxInvoiceScreen)
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
type PlanId = "monthly" | "yearly";

interface MembershipPlan {
  id: PlanId;
  name: string;
  planLabel: "Monthly" | "Yearly";
  duration: string;
  price: number;
  priceSuffix: string;
  highlight: string;
}

// ------------------------------------------------------
// Data
// ------------------------------------------------------
// GST is calculated dynamically from this rate — never hardcode totals.
const GST_RATE = 0.18;
const MEMBERSHIP_NAME = "AutoAssist Elite";

const membershipPlans: MembershipPlan[] = [
  {
    id: "monthly",
    name: "AutoAssist Elite Monthly",
    planLabel: "Monthly",
    duration: "1 Month",
    price: 299,
    priceSuffix: "/month",
    highlight: "Billed every month",
  },
  {
    id: "yearly",
    name: "AutoAssist Elite Yearly",
    planLabel: "Yearly",
    duration: "12 Months",
    price: 1999,
    priceSuffix: "/year",
    highlight: "Best value \u2022 2 months free vs monthly",
  },
];

const benefits: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
  { icon: "flash-outline", text: "Priority booking at all partner workshops" },
  { icon: "pricetag-outline", text: "Flat discounts on every service" },
  { icon: "car-outline", text: "Free pickup & drop for your vehicle" },
  { icon: "headset-outline", text: "Dedicated 24x7 customer support" },
];

const formatCurrency = (value: number): string =>
  `\u20b9${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// ------------------------------------------------------
// Screen
// ------------------------------------------------------
export default function MembershipScreen() {
  const router = useRouter();
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>("monthly");
const [saving, setSaving] = useState(false);
  const selectedPlan =
    membershipPlans.find((plan) => plan.id === selectedPlanId) ??
    membershipPlans[0];

  // ---- Dynamic GST calculation. Never hardcode totals. ----
  const baseAmount = selectedPlan.price;
  const gstAmount = Math.round(baseAmount * GST_RATE * 100) / 100;
  const totalAmount = Math.round((baseAmount + gstAmount) * 100) / 100;

  const handleBuyMembership = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Not signed in", "Please log in again.");
      return;
    }

    setSaving(true);
    try {
      await setDoc(doc(db, "users", uid, "memberships", "current"), {
        userId: uid,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        billingPeriod: selectedPlan.planLabel,
        duration: selectedPlan.duration,
        baseAmount,
        tax: gstAmount,
        totalAmount,
        amount: totalAmount,
        status: "pending", // flips to "active" once payment succeeds
        startDate: null,
        expiryDate: null,
        paymentId: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push({
        pathname: "/bookings/Payment",
        params: {
          transactionType: "membership",
          recordId: `membership_${uid}`,
          label: selectedPlan.name,
          bookingId: `membership_${uid}`, // used so Payment.tsx has something to reference
          amount: totalAmount.toFixed(2),
          bookingLabel: selectedPlan.name,
          bookingType: "membership",
          service: selectedPlan.name,
          originalAmount: baseAmount.toFixed(2),
          gst: gstAmount.toFixed(2),
          membershipPeriod: selectedPlan.planLabel,
          membershipDuration: selectedPlan.duration,
        },
      });
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Couldn't save your membership selection. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AppBackButton />
        <Text style={styles.headerTitle}>Membership</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Card */}
        <View style={styles.introCard}>
          <View style={styles.introIconCircle}>
            <Ionicons name="shield-checkmark" size={26} color={Colors.card} />
          </View>
          <Text style={styles.introTitle}>{MEMBERSHIP_NAME}</Text>
          <Text style={styles.introSubtitle}>
            One membership, complete peace of mind for your vehicle
          </Text>
        </View>

        {/* Benefits */}
        <Text style={styles.sectionTitle}>What you get</Text>
        <View style={styles.benefitsCard}>
          {benefits.map((benefit, index) => (
            <View key={benefit.text}>
              <View style={styles.benefitRow}>
                <View style={styles.benefitIconCircle}>
                  <Ionicons name={benefit.icon} size={18} color={Colors.accent} />
                </View>
                <Text style={styles.benefitText}>{benefit.text}</Text>
              </View>
              {index < benefits.length - 1 && (
                <View style={styles.benefitDivider} />
              )}
            </View>
          ))}
        </View>

        {/* Plans — only one can be selected */}
        <Text style={styles.sectionTitle}>Choose your plan</Text>
        <View style={styles.plansContainer}>
          {membershipPlans.map((plan) => {
            const isSelected = plan.id === selectedPlanId;
            return (
              <Pressable
                key={plan.id}
                style={[styles.planCard, isSelected && styles.planCardSelected]}
                onPress={() => setSelectedPlanId(plan.id)}
              >
                <View style={styles.planHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planHighlight}>{plan.highlight}</Text>
                  </View>
                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && styles.radioOuterSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>
                <View style={styles.planPriceRow}>
                  <Text style={styles.planPrice}>
                    {formatCurrency(plan.price)}
                  </Text>
                  <Text style={styles.planPriceSuffix}>{plan.priceSuffix}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Price Breakdown — GST calculated dynamically from selected plan */}
        <Text style={styles.sectionTitle}>Price Details</Text>
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{selectedPlan.name}</Text>
            <Text style={styles.priceValue}>{formatCurrency(baseAmount)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>GST (18%)</Text>
            <Text style={styles.priceValue}>{formatCurrency(gstAmount)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceFinalLabel}>Total Amount</Text>
            <Text style={styles.priceFinalValue}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Section */}
      <View style={styles.bottomSection}>
        <View style={styles.bottomAmountRow}>
          <Text style={styles.bottomAmountLabel}>
            {selectedPlan.planLabel} Plan Total
          </Text>
          <Text style={styles.bottomAmountValue}>
            {formatCurrency(totalAmount)}
          </Text>
        </View>
        <Pressable
  style={[
    styles.buyButton,
    saving && { opacity: 0.7 },
  ]}
  onPress={handleBuyMembership}
  disabled={saving}
>
         <Text style={styles.buyButtonText}>
  {saving ? "Saving..." : "Buy Membership"}
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  introCard: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    marginBottom: 20,
  },
  introIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  introTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: Colors.card,
    marginBottom: 4,
  },
  introSubtitle: {
    fontSize: 12.5,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 12,
  },
  benefitsCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    paddingHorizontal: 14,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  benefitIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: {
    flex: 1,
    marginLeft: 14,
    fontSize: 13.5,
    fontWeight: "600",
    color: Colors.textDark,
  },
  benefitDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  plansContainer: {
    marginBottom: 20,
    gap: 12,
  },
  planCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  planCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: "#eff6ff",
  },
  planHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  planName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 4,
  },
  planHighlight: {
    fontSize: 12,
    color: Colors.textMuted,
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
  radioOuterSelected: {
    borderColor: Colors.accent,
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: Colors.accent,
  },
  planPriceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  planPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.primary,
  },
  planPriceSuffix: {
    fontSize: 12.5,
    color: Colors.textMuted,
    marginLeft: 4,
    marginBottom: 3,
  },
  priceCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  priceLabel: {
    fontSize: 13.5,
    color: Colors.textMuted,
    flex: 1,
  },
  priceValue: {
    fontSize: 13.5,
    fontWeight: "600",
    color: Colors.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  priceFinalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
  },
  priceFinalValue: {
    fontSize: 18,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomAmountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  bottomAmountLabel: {
    fontSize: 13.5,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  bottomAmountValue: {
    fontSize: 15,
    color: Colors.textDark,
    fontWeight: "700",
  },
  buyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buyButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.card,
  },
});
