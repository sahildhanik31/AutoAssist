// Inspection Summary Screen
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firestore";
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
  warning: "#d97706",
  warningBg: "#fffbeb",
  stepUpcoming: "#cbd5e1",
};

// ------------------------------------------------------
// Types
// ------------------------------------------------------
interface CustomerInfo {
  name: string;
  mobile: string;
  email: string;
}

interface VehicleInfo {
  company: string;
  model: string;
  year: string;
  registrationNumber: string;
  fuelType: string;
  transmission: string;
}

interface SellerInfo {
  name: string;
  contact: string;
}

interface LocationInfo {
  address: string;
  city: string;
  state: string;
  pin: string;
  landmark: string;
}

interface ScheduleInfo {
  date: string;
  slot: string;
}

interface PriceItem {
  label: string;
  amount: number;
}

type StepStatus = "completed" | "current" | "upcoming";

interface ProgressStepData {
  label: string;
  status: StepStatus;
}

// ------------------------------------------------------
// Static data (would come from the previous screen / booking
// state in production — no backend wired up here)
// ------------------------------------------------------

const servicesIncluded: string[] = [
  "Exterior Inspection",
  "Interior Inspection",
  "Engine Inspection",
  "Suspension Inspection",
  "Brake Inspection",
  "Tyre Condition",
  "Paint Thickness Test",
  "OBD Diagnostic Scan",
  "Battery Health",
  "Accidental Damage Inspection",
  "Flood Damage Inspection",
  "Rust Inspection",
  "Parts Replacement Verification",
  "Market Valuation",
  "Recommended Purchase Price",
  "Negotiation Recommendation",
  "Professional Evaluation Report",
  "Report Delivered via Email",
];

const priceItems: PriceItem[] = [
  { label: "Inspection Charges", amount: 1200 },
  { label: "Convenience Fee", amount: 150 },
  { label: "Platform Fee", amount: 75 },
  { label: "GST", amount: 75 },
];

const totalAmount: number = priceItems.reduce(
  (total, item) => total + item.amount,
  0
);

const serviceName = "Pre-Owned Vehicle Inspection";

const progressSteps: ProgressStepData[] = [
  { label: "Inspection Details", status: "completed" },
  { label: "Review", status: "current" },
  { label: "Payment", status: "upcoming" },
];

const formatCurrency = (value: number): string =>
  `\u20b9${value.toLocaleString("en-IN")}`;

// ------------------------------------------------------
// Reusable: Section card wrapper
// ------------------------------------------------------
interface SectionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ icon, title, children }) => (
  <View style={styles.card}>
    <View style={styles.cardTitleRow}>
      <View style={styles.cardTitleIconCircle}>
        <Ionicons name={icon} size={16} color={Colors.accent} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

// ------------------------------------------------------
// Reusable: Label / value row
// ------------------------------------------------------
interface InfoLineProps {
  label: string;
  value: string;
}

const InfoLine: React.FC<InfoLineProps> = ({ label, value }) => (
  <View style={styles.infoLine}>
    <Text style={styles.infoLineLabel}>{label}</Text>
    <Text style={styles.infoLineValue}>{value}</Text>
  </View>
);

// ------------------------------------------------------
// Reusable: Checklist row with a green tick
// ------------------------------------------------------
interface ChecklistRowProps {
  label: string;
}

const ChecklistRow: React.FC<ChecklistRowProps> = ({ label }) => (
  <View style={styles.checklistRow}>
    <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
    <Text style={styles.checklistLabel}>{label}</Text>
  </View>
);

// ------------------------------------------------------
// Reusable: Price breakdown row
// ------------------------------------------------------
interface PriceLineProps {
  item: PriceItem;
}

const PriceLine: React.FC<PriceLineProps> = ({ item }) => (
  <View style={styles.infoLine}>
    <Text style={styles.infoLineLabel}>{item.label}</Text>
    <Text style={styles.infoLineValue}>{formatCurrency(item.amount)}</Text>
  </View>
);

// ------------------------------------------------------
// Reusable: Progress step indicator
// ------------------------------------------------------
interface ProgressStepProps {
  step: ProgressStepData;
  stepNumber: number;
  isLast: boolean;
}

const ProgressStep: React.FC<ProgressStepProps> = ({
  step,
  stepNumber,
  isLast,
}) => {
  const circleStyle =
    step.status === "completed"
      ? styles.stepCircleCompleted
      : step.status === "current"
      ? styles.stepCircleCurrent
      : styles.stepCircleUpcoming;

  const labelStyle =
    step.status === "upcoming" ? styles.stepLabelUpcoming : styles.stepLabel;

  const connectorStyle =
    step.status === "completed"
      ? styles.stepConnectorFilled
      : styles.stepConnector;

  return (
    <React.Fragment>
      <View style={styles.stepColumn}>
        <View style={[styles.stepCircle, circleStyle]}>
          {step.status === "completed" ? (
            <Ionicons name="checkmark" size={16} color={Colors.card} />
          ) : (
            <Text
              style={
                step.status === "current"
                  ? styles.stepNumberCurrent
                  : styles.stepNumberUpcoming
              }
            >
              {stepNumber}
            </Text>
          )}
        </View>
        <Text style={labelStyle}>{step.label}</Text>
      </View>
      {!isLast && <View style={[styles.stepConnectorBase, connectorStyle]} />}
    </React.Fragment>
  );
};

// ------------------------------------------------------
// Screen
// ------------------------------------------------------
export default function InspectionSummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ inspectionId?: string }>();

  const [customer, setCustomer] = useState({ name: "--", mobile: "--", email: "--" });
  const [vehicle, setVehicle] = useState({
    company: "--", model: "--", year: "--", registrationNumber: "--", fuelType: "--", transmission: "--",
  });
  const [seller, setSeller] = useState({ name: "--", contact: "--" });
  const [location, setLocation] = useState({ address: "--", city: "--", state: "--", pin: "--", landmark: "--" });
  const [schedule, setSchedule] = useState({ date: "--", slot: "--" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInspection() {
      if (!params.inspectionId) {
        setLoading(false);
        Alert.alert(
          "Inspection Missing",
          "The inspection reference is missing. Please submit the request again.",
          [{ text: "OK", onPress: () => router.replace("/inspection/InspectionRequest") }]
        );
        return;
      }
      try {
        const snap = await getDoc(doc(db, "inspectionRequests", params.inspectionId));
        if (!snap.exists()) {
          Alert.alert(
            "Inspection Not Found",
            "This inspection request could not be found.",
            [{ text: "OK", onPress: () => router.replace("/inspection/InspectionRequest") }]
          );
          return;
        }
        const data = snap.data();
        setCustomer({
          name: data.buyer?.name ?? "--",
          mobile: data.buyer?.mobile ?? "--",
          email: data.buyer?.email ?? "--",
        });
        setVehicle({
          company: data.vehicle?.company ?? "--",
          model: data.vehicle?.model ?? "--",
          year: data.vehicle?.year ?? "--",
          registrationNumber: data.vehicle?.registrationNumber ?? "--",
          fuelType: data.vehicle?.fuelType ?? "--",
          transmission: data.vehicle?.transmission ?? "--",
        });
        setSeller({ name: data.seller?.name ?? "--", contact: data.seller?.contact ?? "--" });
        setLocation({
          address: data.address ?? "--",
          city: data.city ?? "--",
          state: data.state ?? "--",
          pin: data.pin ?? "--",
          landmark: data.landmark || "Not provided",
        });
        setSchedule({ date: data.preferredDate ?? "--", slot: data.preferredTime ?? "--" });
      } catch (err) {
        console.log(err);
        Alert.alert("Unable to Load", "Couldn't load the inspection request. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadInspection();
  }, [params.inspectionId]);
  const handleProceedToPayment = () => {
  if (!params.inspectionId) {
    Alert.alert("Inspection Missing", "The inspection reference is missing.");
    return;
  }

  router.push({
    pathname: "/bookings/Payment",
    params: {
      transactionType: "inspection",
      recordId: params.inspectionId,
      label: serviceName,
      bookingId: params.inspectionId,
      amount: totalAmount.toString(),
      bookingLabel: serviceName,
      bookingType: "inspection",
      service: serviceName,
      vehicle: `${vehicle.company} ${vehicle.model}`,
      registrationNumber: vehicle.registrationNumber,
      date: schedule.date,
      time: schedule.slot,
      originalAmount: (totalAmount - 75).toString(),
      gst: "75",
    },
  });
};

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 10, color: Colors.textMuted }}>Loading inspection...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AppBackButton fallbackRoute="/inspection/InspectionRequest" />
        <Text style={styles.headerTitle}>Inspection Summary</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerSubtitle}>
          Review your inspection request before confirming your booking.
        </Text>

        {/* Booking Status */}
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            {progressSteps.map((step, index) => (
              <ProgressStep
                key={step.label}
                step={step}
                stepNumber={index + 1}
                isLast={index === progressSteps.length - 1}
              />
            ))}
          </View>
        </View>

        {/* Customer Details */}
        <SectionCard icon="person-outline" title="Customer Details">
          <InfoLine label="Customer Name" value={customer.name} />
          <InfoLine label="Mobile Number" value={customer.mobile} />
          <InfoLine label="Email" value={customer.email} />
        </SectionCard>

        {/* Vehicle Details */}
        <SectionCard icon="car-outline" title="Vehicle Details">
          <InfoLine label="Vehicle Company" value={vehicle.company} />
          <InfoLine label="Vehicle Model" value={vehicle.model} />
          <InfoLine label="Manufacturing Year" value={vehicle.year} />
          <InfoLine
            label="Registration Number"
            value={vehicle.registrationNumber}
          />
          <InfoLine label="Fuel Type" value={vehicle.fuelType} />
          <InfoLine label="Transmission" value={vehicle.transmission} />
        </SectionCard>

        {/* Seller Details */}
        <SectionCard icon="person-circle-outline" title="Seller Details">
          <InfoLine label="Seller Name" value={seller.name} />
          <InfoLine label="Seller Contact" value={seller.contact} />
        </SectionCard>

        {/* Inspection Location */}
        <SectionCard icon="location-outline" title="Inspection Location">
          <InfoLine label="Address" value={location.address} />
          <InfoLine label="City" value={location.city} />
          <InfoLine label="State" value={location.state} />
          <InfoLine label="PIN" value={location.pin} />
          <InfoLine label="Landmark" value={location.landmark} />
        </SectionCard>

        {/* Inspection Schedule */}
        <SectionCard icon="calendar-outline" title="Inspection Schedule">
          <InfoLine label="Preferred Date" value={schedule.date} />
          <InfoLine label="Preferred Slot" value={schedule.slot} />
        </SectionCard>

        {/* Services Included */}
        <SectionCard icon="clipboard-outline" title="Services Included">
          {servicesIncluded.map((service) => (
            <ChecklistRow key={service} label={service} />
          ))}
        </SectionCard>

        {/* Why Choose AutoAssist */}
        <View style={styles.infoBanner}>
          <View style={styles.infoBannerIconCircle}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
          </View>
          <View style={styles.infoBannerBody}>
            <Text style={styles.infoBannerTitle}>Why Choose AutoAssist</Text>
            <Text style={styles.infoBannerText}>
              Every inspection is performed by trained and verified mechanics
              using professional inspection tools. The final report includes
              vehicle health, accidental history, paint inspection, market
              valuation, purchase recommendation, parts replacement
              verification, and negotiation guidance — helping you buy used
              vehicles with confidence.
            </Text>
          </View>
        </View>

        {/* Price Breakdown */}
        <SectionCard icon="receipt-outline" title="Price Breakdown">
          {priceItems.map((item) => (
            <PriceLine key={item.label} item={item} />
          ))}
          <View style={styles.divider} />
          <View style={styles.infoLine}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
        </SectionCard>

        {/* Important Information */}
        <View style={styles.warningBanner}>
          <Ionicons name="warning-outline" size={20} color={Colors.warning} />
          <View style={styles.warningBody}>
            <Text style={styles.warningTitle}>Important Information</Text>
            <Text style={styles.warningLine}>
              • Mechanic will contact the seller before arriving.
            </Text>
            <Text style={styles.warningLine}>
              • Inspection usually takes around 60–90 minutes.
            </Text>
            <Text style={styles.warningLine}>
              • The final report will be available inside AutoAssist and also
              sent to your registered email.
            </Text>
            <Text style={styles.warningLine}>
              • Booking can be rescheduled before mechanic dispatch.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View style={styles.bottomSection}>
        <Pressable style={styles.payButton} onPress={handleProceedToPayment}>
          <Text style={styles.payButtonText}>
            Proceed to Payment  {formatCurrency(totalAmount)}
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
  fontSize: 22,
  fontWeight: "800",
  color: Colors.textDark,
},
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerSubtitle: {
  marginBottom: 22,
  lineHeight: 20,
},

  // Progress card
  progressCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginBottom: 20,
    shadowColor: "#173A6A",
shadowOffset: {
    width: 0,
    height: 6,
},
shadowOpacity: 0.10,
shadowRadius: 12,
elevation: 5,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepColumn: {
    alignItems: "center",
    width: 78,
  },
  stepCircle: {
   width: 38,
height: 38,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  stepCircleCompleted: {
    backgroundColor: Colors.success,
  },
  stepCircleCurrent: {
    backgroundColor: Colors.accent,
  },
  stepCircleUpcoming: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1.5,
    borderColor: Colors.stepUpcoming,
  },
  stepNumberCurrent: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.card,
  },
  stepNumberUpcoming: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textMuted,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textDark,
    textAlign: "center",
  },
  stepLabelUpcoming: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textMuted,
    textAlign: "center",
  },
  stepConnectorBase: {
    height: 2,
    flex: 1,
    marginTop: 15,
    marginHorizontal: -8,
  },
  stepConnector: {
    backgroundColor: Colors.stepUpcoming,
  },
  stepConnectorFilled: {
    backgroundColor: Colors.success,
  },

  // Section card
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#173A6A",
shadowOffset: {
    width: 0,
    height: 6,
},
shadowOpacity: 0.10,
shadowRadius: 12,
elevation: 5,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  cardTitleIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
},

  // Info line
  infoLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 6,
  },
  infoLineLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    flex: 1,
  },
  infoLineValue: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textDark,
    flex: 1,
    textAlign: "right",
  },

  // Checklist
  checklistRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    gap: 10,
  },
  checklistLabel: {
    fontSize: 13.5,
    fontWeight: "600",
    color: Colors.textDark,
  },

  // Info banner (Why Choose AutoAssist)
  infoBanner: {
    flexDirection: "row",
    backgroundColor: "#eff6ff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  infoBannerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoBannerBody: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 6,
  },
  infoBannerText: {
    fontSize: 12.5,
    color: Colors.textDark,
    lineHeight: 18,
  },

  // Divider / grand total
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
  },
  grandTotalValue: {
    fontSize: 22,
fontWeight: "900",
color: Colors.primary
},

  // Warning banner (Important Information)
  warningBanner: {
    flexDirection: "row",
    backgroundColor: Colors.warningBg,
    borderRadius: 18,
    padding: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  warningBody: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.warning,
    marginBottom: 8,
  },
  warningLine: {
    fontSize: 12.5,
    color: Colors.textDark,
    lineHeight: 19,
  },

  // Sticky bottom bar
  bottomSection: {
    backgroundColor: Colors.card,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#173A6A",
shadowOffset: {
    width: 0,
    height: 6,
},
shadowOpacity: 0.10,
shadowRadius: 12,
elevation: 5,
  },
  payButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 58,
    borderRadius: 17,
  },
  payButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.card,
  },
});
