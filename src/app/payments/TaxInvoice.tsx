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
import { doc, getDoc } from "firebase/firestore";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { auth } from "@/firebase/firebaseConfig";
import { db } from "@/firebase/firestore";
import {
  getParamString,
  isTransactionType,
  parsePositiveAmount,
} from "@/types/workflow";
import AppBackButton from "@/components/common/AppBackButton";
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

interface InvoiceLine {
  label: string;
  amount: number;
  deduction?: boolean;
}

interface InvoiceDetails {
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  title: string;
  subtitle: string;
  vehicle: string;
  registration: string;
  workshop: string;
  schedule: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
  lines: InvoiceLine[];
  total: number;
}

const formatCurrency = (value: number): string =>
  `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const safeMoney = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0
    ? Math.round(parsed * 100) / 100
    : 0;
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export default function TaxInvoiceScreen() {
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
  const routeAmount = parsePositiveAmount(params.amount) ?? 0;
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);

  useEffect(() => {
    async function loadInvoice() {
      const uid = auth.currentUser?.uid;
      if (!uid || !recordId) {
        Alert.alert(
          "Invoice Details Missing",
          "Please log in and open the invoice from Payment Success.",
          [{ text: "Go Home", onPress: () => router.replace("/tabs/HomeScreen") }]
        );
        setLoading(false);
        return;
      }

      try {
        const userSnapshot = await getDoc(doc(db, "users", uid));
        const userData = userSnapshot.exists() ? userSnapshot.data() : {};

        let recordData: any = {};
        if (transactionType === "membership") {
          const snapshot = await getDoc(
            doc(db, "users", uid, "memberships", "current")
          );
          recordData = snapshot.exists() ? snapshot.data() : {};
        } else {
          const collectionName =
            transactionType === "inspection" ? "inspectionRequests" : "bookings";
          const snapshot = await getDoc(doc(db, collectionName, recordId));
          recordData = snapshot.exists() ? snapshot.data() : {};
        }

        let paymentData: any = {};
        if (paymentId) {
          const paymentSnapshot = await getDoc(doc(db, "payments", paymentId));
          paymentData = paymentSnapshot.exists() ? paymentSnapshot.data() : {};
        }

        const total = safeMoney(
          paymentData.amount ?? recordData.totalAmount ?? recordData.amount ?? routeAmount
        );
        const baseAmount = safeMoney(
          recordData.basePrice ??
            recordData.baseAmount ??
            getParamString(params.originalAmount)
        );
        const pickupCharge = safeMoney(recordData.pickupCharge);
        const discount = safeMoney(
          recordData.discount ?? getParamString(params.discount)
        );
        const tax = safeMoney(
          recordData.tax ?? recordData.gst ?? getParamString(params.gst)
        );
        const fallbackBase = Math.max(total - tax + discount - pickupCharge, 0);
        const lines: InvoiceLine[] = [
          {
            label:
              transactionType === "membership"
                ? "Membership Price"
                : transactionType === "inspection"
                ? "Inspection Charges & Fees"
                : "Service & Add-ons",
            amount: baseAmount || fallbackBase,
          },
        ];
        if (pickupCharge > 0) {
          lines.push({ label: "Doorstep Pickup & Drop", amount: pickupCharge });
        }
        if (discount > 0) {
          lines.push({ label: "Discount", amount: discount, deduction: true });
        }
        if (tax > 0) lines.push({ label: "GST", amount: tax });

        const vehicleData =
          recordData.vehicleSnapshot ?? recordData.vehicle ?? {};
        const vehicleFromRoute = getParamString(params.vehicle);
        const vehicleName =
          vehicleData.displayName ??
          [vehicleData.company, vehicleData.model].filter(Boolean).join(" ") ??
          vehicleFromRoute;

        const invoiceNumber = `AA-${transactionType
          .slice(0, 3)
          .toUpperCase()}-${recordId.slice(-6).toUpperCase()}`;
        const title =
          transactionType === "membership"
            ? recordData.planName ??
              getParamString(params.label, "AutoAssist Elite Membership")
            : transactionType === "inspection"
            ? "Pre-Owned Vehicle Inspection"
            : recordData.serviceName ??
              getParamString(params.service, getParamString(params.label, "Vehicle Service"));
        const subtitle =
          transactionType === "membership"
            ? recordData.billingPeriod ??
              getParamString(
                params.membershipDuration,
                getParamString(params.membershipPeriod, "")
              )
            : transactionType === "inspection"
            ? `${recordData.preferredDate ?? getParamString(params.date, "")} ${
                recordData.preferredTime ?? getParamString(params.time, "")
              }`.trim()
            : recordData.workshopName ??
              recordData.workshopSnapshot?.name ??
              getParamString(params.workshop);

        setInvoice({
          invoiceNumber,
          customerName:
            userData.name ?? auth.currentUser?.displayName ?? "AutoAssist Customer",
          customerEmail:
            userData.email ?? auth.currentUser?.email ?? "Not available",
          title,
          subtitle,
          vehicle: vehicleName || "Not linked",
          registration:
            vehicleData.registrationNumber ??
            getParamString(params.registrationNumber, "Not added"),
          workshop:
            transactionType === "service"
              ? recordData.workshopName ??
                recordData.workshopSnapshot?.name ??
                getParamString(params.workshop, "Not available")
              : "",
          schedule:
            transactionType === "membership"
              ? subtitle
              : `${recordData.date ?? recordData.preferredDate ?? getParamString(params.date, "")} ${
                  recordData.timeSlot ??
                  recordData.preferredTime ??
                  getParamString(params.time, "")
                }`.trim(),
          paymentMethod:
            paymentData.method ??
            getParamString(params.paymentMethod, "Online Payment"),
          paymentStatus:
            paymentData.status ??
            getParamString(params.paymentStatus, "success"),
          transactionId:
            paymentData.transactionId ??
            getParamString(params.transactionId, paymentId || "--"),
          lines,
          total,
        });
      } catch (error) {
        console.log(error);
        Alert.alert("Unable to Load Invoice", "Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadInvoice();
  }, [paymentId, recordId, transactionType]);

  function buildInvoiceHtml(data: InvoiceDetails): string {
    const lineRows = data.lines
      .map(
        (line) => `
          <tr>
            <td>${escapeHtml(line.label)}</td>
            <td style="text-align:right">${line.deduction ? "- " : ""}${escapeHtml(
              formatCurrency(line.amount)
            )}</td>
          </tr>`
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; color: #1f2937; padding: 28px; }
            h1 { color: #1e3a8a; margin-bottom: 4px; }
            .muted { color: #6b7280; }
            .box { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-top: 18px; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .total { font-size: 18px; font-weight: bold; color: #1e3a8a; }
          </style>
        </head>
        <body>
          <h1>AutoAssist Tax Invoice</h1>
          <div class="muted">${escapeHtml(data.invoiceNumber)} · ${escapeHtml(
            new Date().toLocaleDateString("en-IN")
          )}</div>
          <div class="box">
            <strong>${escapeHtml(data.customerName)}</strong><br>
            <span class="muted">${escapeHtml(data.customerEmail)}</span><br><br>
            <strong>${escapeHtml(data.title)}</strong><br>
            <span>${escapeHtml(data.subtitle)}</span><br>
            <span>Vehicle: ${escapeHtml(data.vehicle)} · ${escapeHtml(
              data.registration
            )}</span>
          </div>
          <div class="box">
            <table>${lineRows}
              <tr class="total"><td>Total</td><td style="text-align:right">${escapeHtml(
                formatCurrency(data.total)
              )}</td></tr>
            </table>
          </div>
          <div class="box">
            Transaction: ${escapeHtml(data.transactionId)}<br>
            Method: ${escapeHtml(data.paymentMethod)}<br>
            Status: ${escapeHtml(data.paymentStatus)}
          </div>
        </body>
      </html>`;
  }

  async function downloadInvoice() {
    if (!invoice || downloading) return;
    setDownloading(true);
    try {
      const result = await Print.printToFileAsync({
        html: buildInvoiceHtml(invoice),
      });
      const sharingAvailable = await Sharing.isAvailableAsync();
      if (sharingAvailable) {
        await Sharing.shareAsync(result.uri, {
          mimeType: "application/pdf",
          dialogTitle: `AutoAssist Invoice ${invoice.invoiceNumber}`,
        });
      } else {
        Alert.alert(
          "Invoice Created",
          "The PDF was created, but sharing is not available on this device."
        );
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Invoice Failed", "Couldn't create the invoice PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.mutedText}>Preparing invoice...</Text>
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyTitle}>Invoice unavailable</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.replace("/tabs/HomeScreen")}
        >
          <Text style={styles.primaryButtonText}>Go to Home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppBackButton fallbackRoute="/payments/PaymentSuccess" />
        <Text style={styles.headerTitle}>Tax Invoice</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandCard}>
          <View style={styles.logoCircle}>
            <Ionicons name="car-sport" size={24} color={Colors.card} />
          </View>
          <Text style={styles.brandName}>AutoAssist</Text>
          <Text style={styles.brandTagline}>Tax Invoice</Text>
          <View style={styles.divider} />
          <InfoLine label="Invoice Number" value={invoice.invoiceNumber} />
          <InfoLine
            label="Invoice Date"
            value={new Date().toLocaleDateString("en-IN")}
          />
          <View style={styles.paidBadge}>
            <Text style={styles.paidBadgeText}>
              {invoice.paymentStatus === "cash_pending" ? "PAYMENT DUE" : "PAID"}
            </Text>
          </View>
        </View>

        <SectionCard title="Customer">
          <InfoLine label="Name" value={invoice.customerName} />
          <InfoLine label="Email" value={invoice.customerEmail} />
        </SectionCard>

        <SectionCard title="Transaction Details">
          <InfoLine label="Item" value={invoice.title} />
          {!!invoice.subtitle && <InfoLine label="Plan / Workshop" value={invoice.subtitle} />}
          <InfoLine label="Vehicle" value={invoice.vehicle} />
          <InfoLine label="Registration" value={invoice.registration} />
          {!!invoice.schedule && <InfoLine label="Schedule" value={invoice.schedule} />}
          <InfoLine label="Transaction ID" value={invoice.transactionId} />
          <InfoLine label="Payment Method" value={invoice.paymentMethod} />
        </SectionCard>

        <SectionCard title="Amount Breakdown">
          {invoice.lines.map((line) => (
            <View style={styles.infoLine} key={line.label}>
              <Text style={styles.infoLabel}>{line.label}</Text>
              <Text
                style={[
                  styles.infoValue,
                  line.deduction ? { color: Colors.success } : null,
                ]}
              >
                {line.deduction ? "- " : ""}
                {formatCurrency(line.amount)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.infoLine}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.total)}</Text>
          </View>
        </SectionCard>

        <Pressable
          style={[styles.primaryButton, downloading && { opacity: 0.6 }]}
          onPress={downloadInvoice}
          disabled={downloading}
        >
          {downloading ? (
            <ActivityIndicator color={Colors.card} />
          ) : (
            <>
              <Ionicons name="download-outline" size={18} color={Colors.card} />
              <Text style={styles.primaryButtonText}>Create & Share PDF</Text>
            </>
          )}
        </Pressable>

        {transactionType === "inspection" ? (
          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              router.push({
                pathname: "/inspection/EvaluationReport",
                params: { inspectionId: recordId },
              })
            }
          >
            <Text style={styles.secondaryButtonText}>View Evaluation Report</Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.replace("/tabs/HomeScreen")}
          >
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
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
    padding: 24,
  },
  mutedText: { marginTop: 12, color: Colors.textMuted },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: Colors.textDark },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 36 },
  brandCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    elevation: 3,
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  brandName: { fontSize: 20, fontWeight: "800", color: Colors.textDark },
  brandTagline: { fontSize: 12, color: Colors.textMuted, marginBottom: 12 },
  paidBadge: {
    backgroundColor: Colors.successBg,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 10,
  },
  paidBadgeText: { color: Colors.success, fontSize: 12, fontWeight: "800" },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 10,
  },
  infoLine: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 6,
  },
  infoLabel: { flex: 1, fontSize: 13, color: Colors.textMuted },
  infoValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textDark,
    textAlign: "right",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  totalLabel: { fontSize: 15, fontWeight: "800", color: Colors.textDark },
  totalValue: { fontSize: 17, fontWeight: "800", color: Colors.primary },
  primaryButton: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 12,
    minWidth: 180,
  },
  primaryButtonText: { color: Colors.card, fontSize: 15, fontWeight: "700" },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 15,
    marginBottom: 18,
  },
  secondaryButtonText: { color: Colors.accent, fontSize: 15, fontWeight: "700" },
});
