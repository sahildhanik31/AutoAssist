// src/app/screen/BookingSummaryScreen.tsx

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  TextInput,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BookingPayload } from "../../types/service";
import { services } from "../../utils/services";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";import { auth } from "../../firebase/firebaseConfig";
import { db } from "../../firebase/firestore";
import { Alert } from "react-native"; // add to existing react-native import list
import DateTimeFields from "../../components/common/DateTimeFields";
import {
  formatDisplayDate,
  formatDisplayTime,
  isDateInPast,
  isFutureTimeForDate,
} from "../../utils/validation";
import { parseBookingDraft } from "../../types/workflow";
import AppBackButton from "@/components/common/AppBackButton";
// ------------------------------------------------------
// Theme (matches existing app palette)
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
  danger: "#dc2626",
  dangerBg: "#fef2f2",
};

// ------------------------------------------------------
// Local types
// (Vehicle / Workshop / Mechanic are not yet part of BookingPayload —
// mirrors the mock pattern the original screen used, ready to be wired
// to real data once those flows exist upstream.)
// ------------------------------------------------------
interface VehicleInfo {
  name: string;
  registrationNumber: string;
  imageUrl: string;
}

interface WorkshopInfo {
  name: string;
  address: string;
  distanceKm: number;
}

interface CouponOption {
  code: string;
  description: string;
  type: "percent" | "flat";
  value: number;
}

const DEFAULT_VEHICLE_IMAGE =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400";

const PICKUP_FEE = 99;

const AVAILABLE_COUPONS: CouponOption[] = [
  { code: "SAVE10", description: "10% off on your service", type: "percent", value: 10 },
  { code: "FLAT100", description: "Flat ₹100 off", type: "flat", value: 100 },
];

const DEFAULT_BOOKING: BookingPayload = {
  serviceId: "",
  serviceTitle: "Service",
  serviceImage: "",
  serviceDuration: "-",
  serviceWarranty: "-",
  selectedBrand: "-",
  selectedOption: "-",
  addOns: [],
  basePrice: 0,
  additionalCharges: 0,
  gst: 0,
  grandTotal: 0,
};

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------
const formatCurrency = (value: number): string => `₹${value.toLocaleString("en-IN")}`;

// ------------------------------------------------------
// Reusable presentational helpers
// ------------------------------------------------------
interface InfoRowProps {
  label: string;
  value: string;
  valueColor?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, valueColor }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
  </View>
);

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, children }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

// ------------------------------------------------------
// Screen
// ------------------------------------------------------
export default function BookingSummaryScreen() {
  const router = useRouter();
const { booking } = useLocalSearchParams<{
    booking?: string;
  }>();

  const parsedBooking = parseBookingDraft(booking);
  const bookingData: BookingPayload = parsedBooking ?? DEFAULT_BOOKING;
  const serviceMeta = services.find((item) => item.id === bookingData.serviceId);
const [vehicle, setVehicle] = useState<{
  id: string;
  company: string;
  model: string;
  registrationNumber: string;
  imageUrl?: string;
  vehicleImage?: string;
} | null>(null);

  useEffect(() => {
    if (!parsedBooking || !parsedBooking.workshop) {
      Alert.alert(
        "Booking Details Missing",
        "Your booking details are incomplete. Please choose the service again.",
        [{ text: "OK", onPress: () => router.replace("/bookings/BookService") }]
      );
      return;
    }

    async function loadVehicle() {
  const uid = auth.currentUser?.uid;

  if (!uid) {
    setVehicle(null);
    return;
  }

  try {
    const selectedVehicleId =
      bookingData.vehicleId ||
      bookingData.selectedVehicleId;

    if (selectedVehicleId) {
      const selectedVehicleSnapshot = await getDoc(
        doc(db, "users", uid, "vehicles", selectedVehicleId)
      );

      if (selectedVehicleSnapshot.exists()) {
        const data = selectedVehicleSnapshot.data();

        setVehicle({
          id: selectedVehicleSnapshot.id,
          company: data.company ?? "",
          model: data.model ?? "",
          registrationNumber: data.registrationNumber ?? "",
          imageUrl: data.imageUrl ?? data.vehicleImage ?? "",
          vehicleImage: data.vehicleImage ?? data.imageUrl ?? "",
        });

        return;
      }
    }

    const vehicleQuery = query(
      collection(db, "users", uid, "vehicles"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const vehicleSnapshot = await getDocs(vehicleQuery);

    if (vehicleSnapshot.empty) {
      setVehicle(null);
      return;
    }

    const document = vehicleSnapshot.docs[0];
    const data = document.data();

    setVehicle({
      id: document.id,
      company: data.company ?? "",
      model: data.model ?? "",
      registrationNumber: data.registrationNumber ?? "",
      imageUrl: data.imageUrl ?? data.vehicleImage ?? "",
      vehicleImage: data.vehicleImage ?? data.imageUrl ?? "",
    });
  } catch (error) {
    console.log("Vehicle loading error:", error);
    setVehicle(null);
  }
}
    loadVehicle();
  }, [booking]);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const defaultTime = new Date();
  defaultTime.setHours(10, 0, 0, 0);

  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [pickupEnabled, setPickupEnabled] = useState<boolean>(false);
  const [couponInput, setCouponInput] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponOption | null>(
    bookingData.selectedCoupon
      ? {
          code: bookingData.selectedCoupon.code,
          description: "Offer selected on Offers & Rewards",
          type: "flat",
          value: bookingData.selectedCoupon.discount,
        }
      : null
  );
  const [couponError, setCouponError] = useState<string | null>(null);
  const [selectedDateValue, setSelectedDateValue] = useState(tomorrow);
  const [selectedTimeValue, setSelectedTimeValue] = useState(defaultTime);
  const [submitting, setSubmitting] = useState(false);

  const selectedWorkshop: WorkshopInfo = {
    name: bookingData.workshop?.name ?? "Workshop unavailable",
    address: bookingData.workshop?.address ?? "",
    distanceKm: bookingData.workshop?.distanceKm ?? 0,
  };
  const pickupAddress = pickupEnabled
    ? "Doorstep pickup requested; address will be confirmed by the workshop."
    : "Not requested";
  const vehicleDetails: VehicleInfo = {
  name: vehicle
    ? `${vehicle.company} ${vehicle.model}`.trim()
    : "No vehicle selected",

  registrationNumber:
    vehicle?.registrationNumber?.trim() || "Not added",

  imageUrl:
    vehicle?.imageUrl ||
    vehicle?.vehicleImage ||
    DEFAULT_VEHICLE_IMAGE,
};
  const selectedDate = formatDisplayDate(selectedDateValue);
  const selectedTimeSlot = formatDisplayTime(selectedTimeValue);

  // ---------------- Animations ----------------
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(20)).current;
  const checkboxScale = useRef(new Animated.Value(1)).current;
  const pickupAnim = useRef(new Animated.Value(0)).current;
  const couponBounce = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleToggleTerms = () => {
    Animated.sequence([
      Animated.timing(checkboxScale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.timing(checkboxScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    setTermsAccepted((prev) => !prev);
  };

  const togglePickup = () => {
    const next = !pickupEnabled;
    setPickupEnabled(next);
    Animated.timing(pickupAnim, {
      toValue: next ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const toggleCircleTranslate = pickupAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  const toggleTrackColor = pickupAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, Colors.accent],
  });

  const handleApplyCoupon = () => {
    const normalizedCode = couponInput.trim().toUpperCase();
    if (!normalizedCode) {
      Alert.alert("Coupon Required", "Please enter a coupon code.");
      return;
    }
    const match = AVAILABLE_COUPONS.find(
      (option) => option.code === normalizedCode
    );
    if (match) {
      setAppliedCoupon(match);
      setCouponError(null);
      couponBounce.setValue(0.9);
      Animated.spring(couponBounce, { toValue: 1, friction: 4, useNativeDriver: true }).start();
    } else {
      setAppliedCoupon(null);
      setCouponError("Invalid coupon code. Try SAVE10 or FLAT100.");
      Alert.alert(
        "Invalid Coupon",
        "This coupon code is invalid or not applicable."
      );
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  };

  // ---------------- Dynamic price calculation ----------------
  const subtotal = bookingData.basePrice + bookingData.additionalCharges;
  const pickupCharge = pickupEnabled ? PICKUP_FEE : 0;
  const preDiscountTotal = subtotal + pickupCharge;

  const discountAmount = (() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === "flat") return Math.min(appliedCoupon.value, preDiscountTotal);
    const percentOff = Math.round((preDiscountTotal * appliedCoupon.value) / 100);
    return Math.min(percentOff, preDiscountTotal);
  })();

  const rewardDiscount = Math.min(
    bookingData.rewardDiscount ?? 0,
    Math.max(preDiscountTotal - discountAmount, 0)
  );
  const membershipDiscount = Math.min(
    bookingData.membershipDiscount ?? 0,
    Math.max(preDiscountTotal - discountAmount - rewardDiscount, 0)
  );
  const totalDiscount = discountAmount + rewardDiscount + membershipDiscount;
  const taxableAmount = Math.max(preDiscountTotal - totalDiscount, 0);
  const gst = Math.round(taxableAmount * 0.18);
  const grandTotal = taxableAmount + gst;

  const hasCustomizations =
    bookingData.selectedBrand !== "-" ||
    bookingData.selectedOption !== "-" ||
    bookingData.addOns.length > 0;

  // ---------------- Navigation ----------------
  const handleEditBooking = () => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/bookings/BookService");
  }
};
 const handleContinue = async () => {
    if (submitting) return;
    if (!termsAccepted) {
      Alert.alert("Terms Required", "Please accept the Terms & Conditions to continue.");
      return;
    }
    if (!parsedBooking || !parsedBooking.workshop) {
      Alert.alert("Booking Details Missing", "Please restart the service booking.");
      return;
    }
    const workshop = parsedBooking.workshop;
    if (!vehicle) {
      Alert.alert(
        "Vehicle Required",
        "Please add or select a vehicle before booking a service.",
        [{ text: "OK", onPress: () => router.replace("/bookings/VehicleSelection") }]
      );
      return;
    }
    if (isDateInPast(selectedDateValue)) {
      Alert.alert("Invalid Service Date", "Please select today or a future date.");
      return;
    }
    if (!isFutureTimeForDate(selectedDateValue, selectedTimeValue)) {
      Alert.alert("Invalid Service Time", "Please select a future time.");
      return;
    }

    const addOns = [...bookingData.addOns];
    if (pickupEnabled) addOns.push(`Doorstep Pickup & Drop (+${formatCurrency(PICKUP_FEE)})`);
    if (appliedCoupon) addOns.push(`Coupon ${appliedCoupon.code} (-${formatCurrency(discountAmount)})`);

    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Not signed in", "Please log in again.");
      return;
    }

    setSubmitting(true);
    try {
      const bookingRef = await addDoc(collection(db, "bookings"), {
        userId: uid,
        vehicleId: vehicle?.id ?? null,
        vehicleSnapshot: {
          company: vehicle.company,
          model: vehicle.model,
          displayName: `${vehicle.company} ${vehicle.model}`.trim(),
          registrationNumber: vehicle.registrationNumber ?? "",
        },
        serviceId: bookingData.serviceId,
        serviceName: bookingData.serviceTitle,
        serviceSnapshot: {
          id: bookingData.serviceId,
          title: bookingData.serviceTitle,
          duration: bookingData.serviceDuration,
          warranty: bookingData.serviceWarranty,
        },
        workshopId: workshop.id,
        workshopName: selectedWorkshop.name,
        workshopAddress: selectedWorkshop.address,
        workshopSnapshot: {
          id: workshop.id,
          name: selectedWorkshop.name,
          address: selectedWorkshop.address,
          distanceKm: selectedWorkshop.distanceKm,
        },
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        pickupRequired: pickupEnabled,
        pickupAddress,
        addOns,
        basePrice: bookingData.basePrice,
        additionalCharges: bookingData.additionalCharges,
        pickupCharge,
        taxableAmount,
        discount: totalDiscount,
        couponCode: appliedCoupon?.code ?? null,
        tax: gst,
        totalAmount: grandTotal,
        bookingStatus: "pending_payment",
        paymentStatus: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push({
        pathname: "/bookings/Payment",
        params: {
          transactionType: "service",
          recordId: bookingRef.id,
          label: bookingData.serviceTitle,
          bookingId: bookingRef.id,
          amount: grandTotal.toString(),
          bookingLabel: bookingData.serviceTitle,
          bookingType: "service",
          service: bookingData.serviceTitle,
          vehicle: `${vehicle.company} ${vehicle.model}`,
          registrationNumber: vehicle.registrationNumber ?? "",
          workshop: selectedWorkshop.name,
          workshopAddress: selectedWorkshop.address,
          date: selectedDate,
          time: selectedTimeSlot,
          originalAmount: preDiscountTotal.toString(),
          discount: totalDiscount.toString(),
          gst: gst.toString(),
          couponCode: appliedCoupon?.code ?? "",
        },
      });
    } catch (err: any) {
      console.log(err);
      Alert.alert("Error", "Couldn't save your booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
        </Pressable>
        <Text style={styles.headerTitle}>Booking Summary</Text>
        <Pressable onPress={handleEditBooking} hitSlop={10}>
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] }}>
          {/* Vehicle Information */}
          <SectionCard title="Vehicle Information">
            <View style={styles.vehicleRow}>
              <Image source={{ uri: vehicleDetails.imageUrl }} style={styles.vehicleImage} />
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName}>{vehicleDetails.name}</Text>
                <View style={styles.regPill}>
                  <Ionicons name="card-outline" size={13} color={Colors.accent} />
                  <Text style={styles.regPillText}>{vehicleDetails.registrationNumber}</Text>
                </View>
              </View>
            </View>
          </SectionCard>

          {/* Selected Service */}
          <SectionCard title="Selected Service">
            <View style={styles.serviceRow}>
              {!!bookingData.serviceImage && (
                <Image source={{ uri: bookingData.serviceImage }} style={styles.serviceImage} />
              )}
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{bookingData.serviceTitle}</Text>
                {!!serviceMeta?.category && (
                  <Text style={styles.serviceCategory}>{serviceMeta.category}</Text>
                )}
                <View style={styles.durationPill}>
                  <Ionicons name="time-outline" size={14} color={Colors.accent} />
                  <Text style={styles.durationText}>{bookingData.serviceDuration}</Text>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
            <InfoRow label="Warranty" value={bookingData.serviceWarranty} />
          </SectionCard>

          {/* Selected Customizations */}
          <SectionCard title="Selected Customizations">
            {hasCustomizations ? (
              <>
                {bookingData.selectedBrand !== "-" && (
                  <InfoRow label="Brand" value={bookingData.selectedBrand} />
                )}
                {bookingData.selectedOption !== "-" && (
                  <InfoRow label="Option" value={bookingData.selectedOption} />
                )}
                {bookingData.addOns.map((id, index) => (
                  <InfoRow key={`${id}-${index}`} label="Add-on" value={id} />
                ))}
              </>
            ) : (
              <Text style={styles.emptyStateText}>No customizations selected.</Text>
            )}
          </SectionCard>

          {/* Booking Details */}
          <SectionCard title="Booking Details">
            <DateTimeFields
              date={selectedDateValue}
              time={selectedTimeValue}
              minimumDate={new Date()}
              onDateChange={setSelectedDateValue}
              onTimeChange={setSelectedTimeValue}
            />
            <View style={styles.divider} />
            <View style={styles.workshopRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="business-outline" size={18} color={Colors.primary} />
              </View>
              <View style={styles.workshopInfo}>
                <Text style={styles.workshopName}>{selectedWorkshop.name}</Text>
                <Text style={styles.workshopAddress}>{selectedWorkshop.address}</Text>
                <View style={styles.distanceRow}>
                  <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
                  <Text style={styles.distanceText}>
                    {selectedWorkshop.distanceKm > 0
                      ? `${selectedWorkshop.distanceKm} km away`
                      : "Distance unavailable"}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
            <InfoRow label="Pickup Address" value={pickupAddress} />
          </SectionCard>

          {/* Pickup & Drop toggle */}
          <SectionCard title="Doorstep Pickup & Drop">
            <Pressable onPress={togglePickup} style={styles.pickupRow}>
              <View style={styles.pickupRowText}>
                <Text style={styles.pickupRowTitle}>
                  {pickupEnabled ? "Included in this booking" : "Not included"}
                </Text>
                <Text style={styles.pickupRowSubtitle}>We'll collect and return your vehicle</Text>
              </View>
              <Animated.View style={[styles.toggleTrack, { backgroundColor: toggleTrackColor }]}>
                <Animated.View
                  style={[styles.toggleCircle, { transform: [{ translateX: toggleCircleTranslate }] }]}
                />
              </Animated.View>
            </Pressable>
            {pickupEnabled && (
              <Text style={styles.pickupFeeNote}>+ {formatCurrency(PICKUP_FEE)} pickup &amp; drop charge</Text>
            )}
          </SectionCard>

          {/* Coupon */}
          <SectionCard title="Apply Coupon">
            {!appliedCoupon ? (
              <>
                <View style={styles.couponInputRow}>
                  <TextInput
                    style={styles.couponInput}
                    placeholder="Enter coupon code"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="characters"
                    value={couponInput}
                    maxLength={20}
                    onChangeText={(text) => {
                      setCouponInput(text.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20));
                      if (couponError) setCouponError(null);
                    }}
                  />
                  <Pressable
                    style={[styles.applyCouponButton, !couponInput.trim() && styles.applyCouponButtonDisabled]}
                    onPress={handleApplyCoupon}
                    disabled={!couponInput.trim()}
                  >
                    <Text style={styles.applyCouponButtonText}>Apply</Text>
                  </Pressable>
                </View>
                {couponError && <Text style={styles.couponErrorText}>{couponError}</Text>}
                <Text style={styles.couponHintText}>Try SAVE10 or FLAT100</Text>
              </>
            ) : (
              <Animated.View style={[styles.appliedCouponRow, { transform: [{ scale: couponBounce }] }]}>
                <View style={styles.appliedCouponBadge}>
                  <Ionicons name="pricetag" size={14} color={Colors.success} />
                  <Text style={styles.appliedCouponCode}>{appliedCoupon.code}</Text>
                </View>
                <View style={styles.appliedCouponTextBlock}>
                  <Text style={styles.appliedCouponDescription}>{appliedCoupon.description}</Text>
                  <Text style={styles.appliedCouponSavings}>
                    You saved {formatCurrency(discountAmount)}
                  </Text>
                </View>
                <Pressable onPress={handleRemoveCoupon} hitSlop={8}>
                  <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
                </Pressable>
              </Animated.View>
            )}
          </SectionCard>

          {/* Price Breakdown */}
          <SectionCard title="Price Breakdown">
            <InfoRow label="Base Price" value={formatCurrency(bookingData.basePrice)} />
            {bookingData.additionalCharges > 0 && (
              <InfoRow label="Additional Charges" value={formatCurrency(bookingData.additionalCharges)} />
            )}
            {pickupCharge > 0 && (
              <InfoRow label="Pickup & Drop Charges" value={formatCurrency(pickupCharge)} />
            )}
            {discountAmount > 0 && (
              <InfoRow
                label="Coupon Discount"
                value={`- ${formatCurrency(discountAmount)}`}
                valueColor={Colors.success}
              />
            )}
            {rewardDiscount > 0 && (
              <InfoRow
                label="Reward Points Discount"
                value={`- ${formatCurrency(rewardDiscount)}`}
                valueColor={Colors.success}
              />
            )}
            {membershipDiscount > 0 && (
              <InfoRow
                label="Membership Discount"
                value={`- ${formatCurrency(membershipDiscount)}`}
                valueColor={Colors.success}
              />
            )}
            <InfoRow label="Taxes (GST 18%)" value={formatCurrency(gst)} />
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(grandTotal)}</Text>
            </View>
          </SectionCard>
        </Animated.View>
      </ScrollView>

      {/* Sticky Bottom Section */}
      <View style={styles.bottomSection}>
        <Pressable style={styles.termsRow} onPress={handleToggleTerms}>
          <Animated.View
            style={[
              styles.checkbox,
              termsAccepted && styles.checkboxChecked,
              { transform: [{ scale: checkboxScale }] },
            ]}
          >
            {termsAccepted && <Ionicons name="checkmark" size={14} color={Colors.card} />}
          </Animated.View>
          <Text style={styles.termsText}>I agree to the Terms & Conditions and Cancellation Policy</Text>
        </Pressable>

        <View style={styles.bottomTotalRow}>
          <Text style={styles.bottomTotalLabel}>Grand Total</Text>
          <Text style={styles.bottomTotalValue}>{formatCurrency(grandTotal)}</Text>
        </View>

        <Pressable
          style={[styles.continueButton, !termsAccepted && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!termsAccepted || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueButtonText}>Continue to Payment</Text>
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
    paddingTop: 55,
    paddingBottom: 17,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#DCE7F5",

    shadowColor: "#0F2F5F",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#172033",
    letterSpacing: 0.2,
  },

  editText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2563EB",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 17,
    paddingTop: 18,
    paddingBottom: 28,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 19,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#DDE7F3",

    shadowColor: "#173A6A",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 16,
    letterSpacing: 0.15,
  },

  vehicleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  vehicleImage: {
    width: 80,
    height: 80,
    borderRadius: 17,
    backgroundColor: "#EDF4FF",
    borderWidth: 1,
    borderColor: "#D7E4F4",
  },

  vehicleInfo: {
    marginLeft: 15,
    flex: 1,
  },

  vehicleName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 9,
    lineHeight: 22,
  },

  regPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#EAF2FF",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#CFE0F7",
    gap: 6,
  },

  regPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E5AB6",
    letterSpacing: 0.5,
  },

  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  serviceImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: "#EDF4FF",
    borderWidth: 1,
    borderColor: "#D7E4F4",
  },

  serviceInfo: {
    marginLeft: 15,
    flex: 1,
  },

  serviceName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 5,
    lineHeight: 21,
  },

  serviceCategory: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 9,
    fontWeight: "500",
  },

  durationPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#EAF2FF",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#CFE0F7",
    gap: 6,
  },

  durationText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E5AB6",
  },

  workshopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#CFE0F7",
  },

  workshopInfo: {
    marginLeft: 13,
    flex: 1,
  },

  workshopName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 4,
  },

  workshopAddress: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 19,
    marginBottom: 7,
    fontWeight: "500",
  },

  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  distanceText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "700",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
  },

  infoLabel: {
    flex: 1,
    fontSize: 13.5,
    color: "#64748B",
    marginRight: 14,
    fontWeight: "500",
    lineHeight: 19,
  },

  infoValue: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: "700",
    color: "#172033",
    textAlign: "right",
    lineHeight: 19,
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 13,
  },

  emptyStateText: {
    fontSize: 13,
    color: "#7B8798",
    fontStyle: "italic",
    backgroundColor: "#F7FAFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  pickupRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F7FAFF",
    borderRadius: 15,
    padding: 14,
    borderWidth: 1,
    borderColor: "#DCE7F5",
  },

  pickupRowText: {
    flex: 1,
    marginRight: 14,
  },

  pickupRowTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 4,
  },

  pickupRowSubtitle: {
    fontSize: 12.5,
    color: "#64748B",
    lineHeight: 18,
  },

  toggleTrack: {
    width: 50,
    height: 28,
    borderRadius: 15,
    padding: 2,
    justifyContent: "center",
  },

  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 3,
  },

  pickupFeeNote: {
    marginTop: 11,
    fontSize: 12.5,
    fontWeight: "700",
    color: "#1E5AB6",
    backgroundColor: "#EAF2FF",
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 10,
    alignSelf: "flex-start",
  },  couponInputRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
  },

  couponInput: {
    flex: 1,
    minHeight: 52,
    backgroundColor: "#F7FAFF",
    borderWidth: 1.5,
    borderColor: "#D2DEED",
    borderRadius: 14,
    paddingHorizontal: 15,
    fontSize: 14,
    fontWeight: "700",
    color: "#172033",
    letterSpacing: 0.5,
  },

  applyCouponButton: {
    minWidth: 88,
    minHeight: 52,
    backgroundColor: "#123A7A",
    borderRadius: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#123A7A",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 5,
  },

  applyCouponButtonDisabled: {
    backgroundColor: "#A4AFBE",
    shadowOpacity: 0,
    elevation: 0,
  },

  applyCouponButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  couponErrorText: {
    marginTop: 9,
    fontSize: 12.5,
    color: "#C62828",
    fontWeight: "700",
    backgroundColor: "#FFF1F2",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#F7C7CD",
  },

  couponHintText: {
    marginTop: 9,
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },

  appliedCouponRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: "#BCE8D2",
  },

  appliedCouponBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 11,
    marginRight: 11,
    borderWidth: 1,
    borderColor: "#D5F0E1",
  },

  appliedCouponCode: {
    fontSize: 12.5,
    fontWeight: "900",
    color: "#16834A",
    letterSpacing: 0.4,
  },

  appliedCouponTextBlock: {
    flex: 1,
  },

  appliedCouponDescription: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#172033",
    lineHeight: 17,
  },

  appliedCouponSavings: {
    fontSize: 12,
    color: "#16834A",
    fontWeight: "800",
    marginTop: 3,
  },

  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#172033",
  },

  grandTotalValue: {
    fontSize: 19,
    fontWeight: "900",
    color: "#123A7A",
    letterSpacing: 0.2,
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

  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#F7FAFF",
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  checkbox: {
    width: 23,
    height: 23,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#AEBAC9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
    backgroundColor: "#FFFFFF",
  },

  checkboxChecked: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  termsText: {
    flex: 1,
    fontSize: 12.5,
    color: "#566477",
    lineHeight: 18,
    fontWeight: "500",
  },

  bottomTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
    paddingHorizontal: 2,
  },

  bottomTotalLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "700",
  },

  bottomTotalValue: {
    fontSize: 21,
    color: "#123A7A",
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  continueButton: {
    minHeight: 58,
    backgroundColor: "#123A7A",
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
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

  continueButtonDisabled: {
    backgroundColor: "#A4AFBE",
    borderColor: "#A4AFBE",
    shadowOpacity: 0,
    elevation: 0,
  },

  continueButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.4,
  },
});