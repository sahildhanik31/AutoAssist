// Evaluation Report Screen (read-only certified inspection report)
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { db } from "@/firebase/firestore";
import { Image } from "react-native";
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
  danger: "#dc2626",
  dangerBg: "#fef2f2",
};

// ------------------------------------------------------
// Types
// ------------------------------------------------------
type BadgeVariant = "success" | "warning" | "danger";

interface ChecklistItemData {
  label: string;
  status: string;
}

interface TyreData {
  position: string;
  treadPercent: number;
}

interface VehicleInfo {
  company: string;
  model: string;
  year: string;
  registrationNumber: string;
  odometer: string;
  fuelType: string;
  transmission: string;
  inspectionLocation: string;
}

interface PaintInfo {
  factoryPaint: string;
  factoryPaintStatus: string;
  repaintedPanels: string;
  repaintedPanelsStatus: string;
  paintThickness: string;
  paintThicknessStatus: string;
}

interface AccidentInfo {
  status: string;
  explanation: string;
}

interface ObdInfo {
  status: string;
  note: string;
}

interface FloodInfo {
  status: string;
  note: string;
}

interface RustInfo {
  status: string;
  note: string;
}

interface MarketValuation {
  estimatedValue: number;
  recommendedPrice: number;
  negotiationMargin: number;
}

type RecommendationType =
  | "Recommended"
  | "Recommended with Minor Repairs"
  | "Not Recommended";

// ------------------------------------------------------
// Static sample data (report is read-only — no backend)
// ------------------------------------------------------
const mechanicName = "Suresh Kumar, Certified AutoAssist Mechanic";
const overallScore = 88;
const scoreLabel = "Very Good Condition";

const recommendation: RecommendationType = "Recommended with Minor Repairs";
const recommendationText =
  "This vehicle is in very good overall condition with strong engine and interior health. A few minor items — rear brake pads and rear tyres — should be attended to shortly after purchase. With these addressed, the vehicle represents a sound, low-risk buy.";

const sampleVehicle: VehicleInfo = {
  company: "Hyundai",
  model: "Creta SX(O)",
  year: "2022",
  registrationNumber: "DL01AB1234",
  odometer: "42,180 km",
  fuelType: "Petrol",
  transmission: "Manual",
  inspectionLocation: "B-204 Rajouri Garden, New Delhi",
};

const exteriorChecklist: ChecklistItemData[] = [
  { label: "Front Bumper", status: "Good" },
  { label: "Rear Bumper", status: "Minor Scratch" },
  { label: "Bonnet", status: "Good" },
  { label: "Roof", status: "Good" },
  { label: "Doors", status: "Good" },
  { label: "Headlights", status: "Good" },
  { label: "Tail Lamps", status: "Good" },
  { label: "Mirrors", status: "Good" },
  { label: "Windshield", status: "Good" },
];

const paint: PaintInfo = {
  factoryPaint: "8 of 9 Panels Original",
  factoryPaintStatus: "Original",
  repaintedPanels: "Rear Bumper",
  repaintedPanelsStatus: "Repainted",
  paintThickness: "80 - 130 microns across panels",
  paintThicknessStatus: "Within Normal Range",
};

const accident: AccidentInfo = {
  status: "No Major Accident",
  explanation:
    "Paint thickness and panel alignment readings show no evidence of major structural repair. The rear bumper shows a minor respray, consistent with a small cosmetic touch-up rather than an accident.",
};

const engineChecklist: ChecklistItemData[] = [
  { label: "Engine Noise", status: "Good" },
  { label: "Oil Leakage", status: "Good" },
  { label: "Coolant", status: "Good" },
  { label: "Smoke", status: "Good" },
  { label: "Engine Mounts", status: "Average" },
  { label: "Battery", status: "Good" },
];

const suspensionChecklist: ChecklistItemData[] = [
  { label: "Suspension", status: "Good" },
  { label: "Shock Absorbers", status: "Good" },
  { label: "Steering", status: "Excellent" },
  { label: "Brake Pads", status: "Average" },
  { label: "Brake Discs", status: "Good" },
];

const tyres: TyreData[] = [
  { position: "Front Left", treadPercent: 65 },
  { position: "Front Right", treadPercent: 63 },
  { position: "Rear Left", treadPercent: 38 },
  { position: "Rear Right", treadPercent: 35 },
  { position: "Spare", treadPercent: 90 },
];

const interiorChecklist: ChecklistItemData[] = [
  { label: "Dashboard", status: "Good" },
  { label: "AC", status: "Excellent" },
  { label: "Infotainment", status: "Good" },
  { label: "Seats", status: "Good" },
  { label: "Steering", status: "Good" },
  { label: "Odometer Verification", status: "Verified" },
];

const obd: ObdInfo = {
  status: "No Error Codes Found",
  note: "Full diagnostic scan completed across engine, transmission, ABS and airbag modules.",
};

const replacedParts: string[] = [
  "Front Windshield — Replaced (2023)",
  "Right Headlight Assembly — Replaced (2024)",
];

const flood: FloodInfo = {
  status: "No Flood Damage Detected",
  note: "No signs of water intrusion, silt deposits or corrosion found under carpets, seats or electrical harnesses.",
};

const rust: RustInfo = {
  status: "Minor Rust",
  note: "Light surface rust observed in the rear wheel arches. Recommended to treat during next service.",
};

const marketValuation: MarketValuation = {
  estimatedValue: 985000,
  recommendedPrice: 940000,
  negotiationMargin: 45000,
};

const pros: string[] = [
  "Strong Engine Performance",
  "Original Factory Paint (8 of 9 Panels)",
  "Single Owner Vehicle",
  "Well-Maintained Interior",
];

const cons: string[] = [
  "Minor Dent on Rear Bumper",
  "Brake Pads at 40% Life",
  "Rear Tyres Need Replacement Soon",
  "Minor Rust in Wheel Arches",
];

const finalVerdict = {
  recommendation,
  overallCondition: scoreLabel,
  score: overallScore,
  summary:
    "A well-maintained, single-owner Creta with a clean mechanical and accident history. Budget for rear brake pads and rear tyres shortly after purchase.",
};

const formatCurrency = (value: number): string =>
  `\u20b9${value.toLocaleString("en-IN")}`;

// ------------------------------------------------------
// Status → badge variant mapping
// ------------------------------------------------------
const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  Good: "success",
  Excellent: "success",
  Verified: "success",
  Original: "success",
  "Within Normal Range": "success",
  "No Major Accident": "success",
  "No Flood Damage Detected": "success",
  "No Rust": "success",
  "No Error Codes Found": "success",

  Average: "warning",
  "Minor Scratch": "warning",
  Repainted: "warning",
  "Minor Accident": "warning",
  "Minor Rust": "warning",

  Poor: "danger",
  "Needs Repair": "danger",
  "Major Structural Damage": "danger",
  "Possible Flood Damage": "danger",
  "Heavy Rust": "danger",
  "Active Fault Codes": "danger",
};

const getStatusVariant = (status: string): BadgeVariant =>
  STATUS_VARIANTS[status] ?? "warning";

const getTreadVariant = (percent: number): BadgeVariant => {
  if (percent >= 50) return "success";
  if (percent >= 30) return "warning";
  return "danger";
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return Colors.success;
  if (score >= 60) return Colors.warning;
  return Colors.danger;
};

const getRecommendationColors = (
  type: RecommendationType
): { bg: string; border: string; text: string; icon: keyof typeof Ionicons.glyphMap } => {
  switch (type) {
    case "Recommended":
      return { bg: Colors.successBg, border: Colors.success, text: Colors.success, icon: "checkmark-circle" };
    case "Not Recommended":
      return { bg: Colors.dangerBg, border: Colors.danger, text: Colors.danger, icon: "close-circle" };
    default:
      return { bg: Colors.warningBg, border: Colors.warning, text: Colors.warning, icon: "alert-circle" };
  }
};

// ------------------------------------------------------
// Reusable: colored status pill
// ------------------------------------------------------
interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const variant = getStatusVariant(status);
  return (
    <View style={[styles.badge, badgeVariantStyles[variant].badge]}>
      <Text style={[styles.badgeText, badgeVariantStyles[variant].text]}>
        {status}
      </Text>
    </View>
  );
};

// ------------------------------------------------------
// Reusable: section card wrapper
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
// Reusable: label / value row
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
// Reusable: checklist row with a status badge
// ------------------------------------------------------
interface ChecklistRowProps {
  item: ChecklistItemData;
}

const ChecklistRow: React.FC<ChecklistRowProps> = ({ item }) => (
  <View style={styles.checklistRow}>
    <Text style={styles.checklistLabel}>{item.label}</Text>
    <StatusBadge status={item.status} />
  </View>
);

// ------------------------------------------------------
// Reusable: tyre tread row with a progress bar
// ------------------------------------------------------
interface TyreRowProps {
  tyre: TyreData;
}

const TyreRow: React.FC<TyreRowProps> = ({ tyre }) => {
  const variant = getTreadVariant(tyre.treadPercent);
  return (
    <View style={styles.tyreRow}>
      <View style={styles.tyreLabelRow}>
        <Text style={styles.checklistLabel}>{tyre.position}</Text>
        <Text style={[styles.tyrePercentText, badgeVariantStyles[variant].text]}>
          {tyre.treadPercent}%
        </Text>
      </View>
      <View style={styles.tyreBarTrack}>
        <View
          style={[
            styles.tyreBarFill,
            badgeVariantStyles[variant].bar,
            { width: `${tyre.treadPercent}%` },
          ]}
        />
      </View>
    </View>
  );
};

// ------------------------------------------------------
// Reusable: circular score indicator
// ------------------------------------------------------
interface ScoreCircleProps {
  score: number;
}

const ScoreCircle: React.FC<ScoreCircleProps> = ({ score }) => {
  const color = getScoreColor(score);
  return (
    <View style={[styles.scoreCircle, { borderColor: color }]}>
      <Text style={[styles.scoreValue, { color }]}>{score}</Text>
      <Text style={styles.scoreOutOf}>/ 100</Text>
    </View>
  );
};

// ------------------------------------------------------
// Reusable: pros / cons list
// ------------------------------------------------------
interface ProsConsListProps {
  items: string[];
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const ProsConsList: React.FC<ProsConsListProps> = ({ items, icon, color }) => (
  <View style={styles.prosConsColumn}>
    {items.map((item) => (
      <View key={item} style={styles.prosConsRow}>
        <Ionicons name={icon} size={15} color={color} />
        <Text style={styles.prosConsText}>{item}</Text>
      </View>
    ))}
  </View>
);

// ------------------------------------------------------
// Screen
// ------------------------------------------------------
export default function EvaluationReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ inspectionId?: string }>();
  const recommendationColors = getRecommendationColors(recommendation);
  const [vehicle, setVehicle] = useState<VehicleInfo>(sampleVehicle);
  const [inspectionDate, setInspectionDate] = useState(
    new Date().toLocaleDateString("en-IN")
  );
  const reportId = params.inspectionId
    ? `AA-RPT-${params.inspectionId.slice(-8).toUpperCase()}`
    : "AA-RPT-DEMO";

  useEffect(() => {
    async function loadInspection() {
      if (!params.inspectionId) {
        Alert.alert(
          "Demo Report",
          "No inspection ID was received, so sample evaluation data is shown."
        );
        return;
      }
      try {
        const snapshot = await getDoc(
          doc(db, "inspectionRequests", params.inspectionId)
        );
        if (!snapshot.exists()) {
          Alert.alert("Inspection Not Found", "The inspection request could not be loaded.");
          return;
        }
        const data = snapshot.data();
        setVehicle({
          company: data.vehicle?.company ?? "Not provided",
          model: data.vehicle?.model ?? "Not provided",
          year: data.vehicle?.year ?? "Not provided",
          registrationNumber:
            data.vehicle?.registrationNumber ?? "Not provided",
          odometer: data.vehicle?.odometer ?? "Sample evaluation",
          fuelType: data.vehicle?.fuelType ?? "Sample evaluation",
          transmission: data.vehicle?.transmission ?? "Sample evaluation",
          inspectionLocation: [
            data.address,
            data.city,
            data.state,
            data.pin,
          ]
            .filter(Boolean)
            .join(", "),
        });
        setInspectionDate(data.preferredDate ?? new Date().toLocaleDateString("en-IN"));
      } catch (error) {
        console.log(error);
        Alert.alert("Unable to Load Report", "Please try again.");
      }
    }
    loadInspection();
  }, [params.inspectionId]);

  const handleDownloadPdf = async () => {
    try {
      const html = `
        <html>
          <body style="font-family:Arial;padding:28px;color:#1f2937">
            <h1 style="color:#1e3a8a">AutoAssist Evaluation Report</h1>
            <p><strong>Report ID:</strong> ${reportId}</p>
            <p><strong>Inspection Date:</strong> ${inspectionDate}</p>
            <h2>${vehicle.company} ${vehicle.model}</h2>
            <p>Registration: ${vehicle.registrationNumber}</p>
            <p>Location: ${vehicle.inspectionLocation}</p>
            <h2>Overall Score: ${overallScore}/100</h2>
            <p>${recommendation}</p>
            <p>${recommendationText}</p>
            <p><em>The request details above are dynamic. The mechanical checklist and score are sample evaluation data for this college demonstration.</em></p>
          </body>
        </html>`;
      const result = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, {
          mimeType: "application/pdf",
          dialogTitle: `AutoAssist Report ${reportId}`,
        });
      } else {
        Alert.alert(
          "Report Created",
          "The PDF was created, but sharing is not available on this device."
        );
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Report Failed", "Couldn't create the report PDF. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AppBackButton fallbackRoute="/inspection/InspectionSummary" />
        <Text style={styles.headerTitle}>Evaluation Report</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Report Meta / Score Card */}
        <View style={styles.brandCard}>
         <View style={styles.logoPlaceholder}>
    <Image
        source={require("@/assets/images/logo.png")}
        style={styles.logoImage}
        resizeMode="contain"
    />
</View>
          <Text style={styles.brandName}>AutoAssist Certified Inspection Report</Text>

          <View style={styles.brandDivider} />

          <InfoLine label="Report ID" value={reportId} />
          <InfoLine label="Inspection Date" value={inspectionDate} />
          <InfoLine label="Mechanic" value={mechanicName} />

          <View style={styles.scoreWrap}>
            <ScoreCircle score={overallScore} />
            <Text style={styles.scoreLabel}>{scoreLabel}</Text>
          </View>
        </View>

        {/* Purchase Recommendation */}
        <View
          style={[
            styles.recommendationCard,
            {
              backgroundColor: recommendationColors.bg,
              borderColor: recommendationColors.border,
            },
          ]}
        >
          <View style={styles.recommendationHeaderRow}>
            <Ionicons
              name={recommendationColors.icon}
              size={22}
              color={recommendationColors.text}
            />
            <Text style={[styles.recommendationTitle, { color: recommendationColors.text }]}>
              {recommendation}
            </Text>
          </View>
          <Text style={styles.recommendationText}>{recommendationText}</Text>
        </View>

        {/* Vehicle Information */}
        <SectionCard icon="car-outline" title="Vehicle Information">
          <InfoLine label="Company" value={vehicle.company} />
          <InfoLine label="Model" value={vehicle.model} />
          <InfoLine label="Manufacturing Year" value={vehicle.year} />
          <InfoLine label="Registration Number" value={vehicle.registrationNumber} />
          <InfoLine label="Odometer" value={vehicle.odometer} />
          <InfoLine label="Fuel Type" value={vehicle.fuelType} />
          <InfoLine label="Transmission" value={vehicle.transmission} />
          <InfoLine label="Inspection Location" value={vehicle.inspectionLocation} />
          <Text style={styles.paintDetailText}>
            Vehicle and request details are loaded from this inspection. Mechanical
            scores below are sample evaluation data for the college demo.
          </Text>
        </SectionCard>

        {/* Exterior Inspection */}
        <SectionCard icon="car-sport-outline" title="Exterior Inspection">
          {exteriorChecklist.map((item) => (
            <ChecklistRow key={item.label} item={item} />
          ))}
        </SectionCard>

        {/* Paint Inspection */}
        <SectionCard icon="color-palette-outline" title="Paint Inspection">
          <View style={styles.checklistRow}>
            <Text style={styles.checklistLabel}>Factory Paint</Text>
            <StatusBadge status={paint.factoryPaintStatus} />
          </View>
          <Text style={styles.paintDetailText}>{paint.factoryPaint}</Text>

          <View style={[styles.checklistRow, styles.paintRowSpacing]}>
            <Text style={styles.checklistLabel}>Repainted Panels</Text>
            <StatusBadge status={paint.repaintedPanelsStatus} />
          </View>
          <Text style={styles.paintDetailText}>{paint.repaintedPanels}</Text>

          <View style={[styles.checklistRow, styles.paintRowSpacing]}>
            <Text style={styles.checklistLabel}>Paint Thickness</Text>
            <StatusBadge status={paint.paintThicknessStatus} />
          </View>
          <Text style={styles.paintDetailText}>{paint.paintThickness}</Text>
        </SectionCard>

        {/* Accident Detection */}
        <SectionCard icon="alert-circle-outline" title="Accident Detection">
          <View style={styles.checklistRow}>
            <Text style={styles.checklistLabel}>Status</Text>
            <StatusBadge status={accident.status} />
          </View>
          <Text style={styles.paintDetailText}>{accident.explanation}</Text>
        </SectionCard>

        {/* Engine Inspection */}
        <SectionCard icon="construct-outline" title="Engine Inspection">
          {engineChecklist.map((item) => (
            <ChecklistRow key={item.label} item={item} />
          ))}
        </SectionCard>

        {/* Suspension & Brakes */}
        <SectionCard icon="build-outline" title="Suspension & Brakes">
          {suspensionChecklist.map((item) => (
            <ChecklistRow key={item.label} item={item} />
          ))}
        </SectionCard>

        {/* Tyres */}
        <SectionCard icon="ellipse-outline" title="Tyres">
          {tyres.map((tyre) => (
            <TyreRow key={tyre.position} tyre={tyre} />
          ))}
        </SectionCard>

        {/* Interior */}
        <SectionCard icon="options-outline" title="Interior">
          {interiorChecklist.map((item) => (
            <ChecklistRow key={item.label} item={item} />
          ))}
        </SectionCard>

        {/* OBD Scan */}
        <SectionCard icon="hardware-chip-outline" title="OBD Scan">
          <View style={styles.checklistRow}>
            <Text style={styles.checklistLabel}>Diagnostic Result</Text>
            <StatusBadge status={obd.status} />
          </View>
          <Text style={styles.paintDetailText}>{obd.note}</Text>
        </SectionCard>

        {/* Replaced Parts */}
        <SectionCard icon="swap-horizontal-outline" title="Replaced Parts">
          {replacedParts.length > 0 ? (
            replacedParts.map((part) => (
              <View key={part} style={styles.replacedPartRow}>
                <Ionicons name="ellipse" size={6} color={Colors.textMuted} />
                <Text style={styles.replacedPartText}>{part}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.paintDetailText}>No replaced parts detected.</Text>
          )}
        </SectionCard>

        {/* Flood Damage */}
        <SectionCard icon="water-outline" title="Flood Damage">
          <View style={styles.checklistRow}>
            <Text style={styles.checklistLabel}>Status</Text>
            <StatusBadge status={flood.status} />
          </View>
          <Text style={styles.paintDetailText}>{flood.note}</Text>
        </SectionCard>

        {/* Rust Inspection */}
        <SectionCard icon="warning-outline" title="Rust Inspection">
          <View style={styles.checklistRow}>
            <Text style={styles.checklistLabel}>Status</Text>
            <StatusBadge status={rust.status} />
          </View>
          <Text style={styles.paintDetailText}>{rust.note}</Text>
        </SectionCard>

        {/* Market Valuation */}
        <Text style={styles.sectionHeading}>Market Valuation</Text>
        <View style={styles.valuationRow}>
          <View style={styles.valuationCard}>
            <Ionicons name="cash-outline" size={18} color={Colors.accent} />
            <Text style={styles.valuationLabel}>Estimated Market Value</Text>
            <Text style={styles.valuationValue}>
              {formatCurrency(marketValuation.estimatedValue)}
            </Text>
          </View>
          <View style={styles.valuationCard}>
            <Ionicons name="pricetag-outline" size={18} color={Colors.accent} />
            <Text style={styles.valuationLabel}>Recommended Purchase Price</Text>
            <Text style={styles.valuationValue}>
              {formatCurrency(marketValuation.recommendedPrice)}
            </Text>
          </View>
          <View style={styles.valuationCard}>
            <Ionicons name="trending-down-outline" size={18} color={Colors.accent} />
            <Text style={styles.valuationLabel}>Negotiation Margin</Text>
            <Text style={styles.valuationValue}>
              {formatCurrency(marketValuation.negotiationMargin)}
            </Text>
          </View>
        </View>

        {/* Pros & Cons */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pros & Cons</Text>
          <View style={styles.prosConsContainer}>
            <View style={styles.prosConsSection}>
              <View style={styles.prosConsHeaderRow}>
                <Ionicons name="thumbs-up-outline" size={16} color={Colors.success} />
                <Text style={[styles.prosConsHeading, { color: Colors.success }]}>Pros</Text>
              </View>
              <ProsConsList items={pros} icon="checkmark" color={Colors.success} />
            </View>
            <View style={styles.prosConsSection}>
              <View style={styles.prosConsHeaderRow}>
                <Ionicons name="thumbs-down-outline" size={16} color={Colors.warning} />
                <Text style={[styles.prosConsHeading, { color: Colors.warning }]}>Cons</Text>
              </View>
              <ProsConsList items={cons} icon="close" color={Colors.warning} />
            </View>
          </View>
        </View>

        {/* Final Verdict */}
        <View style={styles.verdictCard}>
          <View style={styles.verdictHeaderRow}>
            <Ionicons name="ribbon-outline" size={22} color={Colors.card} />
            <Text style={styles.verdictHeading}>Final Verdict</Text>
          </View>

          <View style={styles.verdictScoreRow}>
            <View>
              <Text style={styles.verdictLabelLight}>Recommendation</Text>
              <Text style={styles.verdictValueLight}>
                {finalVerdict.recommendation}
              </Text>
            </View>
            <View style={styles.verdictScoreBadge}>
              <Text style={styles.verdictScoreText}>{finalVerdict.score}/100</Text>
            </View>
          </View>

          <View style={styles.verdictDivider} />

          <Text style={styles.verdictLabelLight}>Overall Condition</Text>
          <Text style={styles.verdictValueLight}>{finalVerdict.overallCondition}</Text>

          <Text style={[styles.verdictLabelLight, styles.verdictSummaryLabel]}>
            Summary
          </Text>
          <Text style={styles.verdictSummaryText}>{finalVerdict.summary}</Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View style={styles.bottomSection}>
        <Pressable style={styles.downloadButton} onPress={handleDownloadPdf}>
          <Ionicons name="download-outline" size={18} color={Colors.card} />
          <Text style={styles.downloadButtonText}>Download PDF</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ------------------------------------------------------
// Badge variant style lookup
// ------------------------------------------------------
const badgeVariantStyles = {
  success: StyleSheet.create({
    badge: { backgroundColor: Colors.successBg, borderColor: Colors.success },
    text: { color: Colors.success },
    bar: { backgroundColor: Colors.success },
  }),
  warning: StyleSheet.create({
    badge: { backgroundColor: Colors.warningBg, borderColor: Colors.warning },
    text: { color: Colors.warning },
    bar: { backgroundColor: Colors.warning },
  }),
  danger: StyleSheet.create({
    badge: { backgroundColor: Colors.dangerBg, borderColor: Colors.danger },
    text: { color: Colors.danger },
    bar: { backgroundColor: Colors.danger },
  }),
};

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

  // Brand / report meta card
  brandCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  logoImage: {
    width: 34,
    height: 34,
},
  brandName: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textDark,
    textAlign: "center",
    marginBottom: 14,
  },
  brandDivider: {
    height: 1,
    width: "100%",
    backgroundColor: Colors.border,
    marginBottom: 12,
  },
  scoreWrap: {
    alignItems: "center",
    marginTop: 16,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textDark,
    marginTop: 10,
  },
  scoreCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  scoreValue: {
    fontSize: 26,
    fontWeight: "800",
  },
  scoreOutOf: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textMuted,
    marginTop: -2,
  },

  // Purchase recommendation
  recommendationCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 18,
    marginBottom: 16,
  },
  recommendationHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  recommendationText: {
    fontSize: 13,
    color: Colors.textDark,
    lineHeight: 19,
  },

  // Section card
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
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
    fontSize: 14.5,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 14,
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
    flex: 1.3,
    textAlign: "right",
  },

  // Checklist row + badge
  checklistRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  checklistLabel: {
    fontSize: 13.5,
    fontWeight: "600",
    color: Colors.textDark,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: "700",
  },

  // Paint / accident / OBD / flood / rust supporting text
  paintDetailText: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
    marginBottom: 4,
  },
  paintRowSpacing: {
    marginTop: 10,
  },

  // Replaced parts
  replacedPartRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 5,
  },
  replacedPartText: {
    fontSize: 12.5,
    color: Colors.textDark,
  },

  // Tyres
  tyreRow: {
    marginBottom: 14,
  },
  tyreLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  tyrePercentText: {
    fontSize: 13,
    fontWeight: "700",
  },
  tyreBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
    overflow: "hidden",
  },
  tyreBarFill: {
    height: 8,
    borderRadius: 4,
  },

  // Market valuation
  sectionHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 12,
  },
  valuationRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  valuationCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  valuationLabel: {
    fontSize: 10.5,
    color: Colors.textMuted,
    marginTop: 8,
    marginBottom: 4,
    lineHeight: 14,
  },
  valuationValue: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.primary,
  },

  // Pros & Cons
  prosConsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  prosConsSection: {
    flex: 1,
  },
  prosConsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  prosConsHeading: {
    fontSize: 13,
    fontWeight: "700",
  },
  prosConsColumn: {
    gap: 8,
  },
  prosConsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  prosConsText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textDark,
    lineHeight: 16,
  },

  // Final verdict
  verdictCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  verdictHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  verdictHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.card,
  },
  verdictScoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  verdictScoreBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  verdictScoreText: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.card,
  },
  verdictDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginVertical: 14,
  },
  verdictLabelLight: {
    fontSize: 11.5,
    color: "#c7d2fe",
    marginBottom: 4,
  },
  verdictValueLight: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.card,
  },
  verdictSummaryLabel: {
    marginTop: 16,
  },
  verdictSummaryText: {
    fontSize: 12.5,
    color: "#e0e7ff",
    lineHeight: 18,
  },

  // Sticky bottom bar
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
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
  },
  downloadButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.card,
  },
});
