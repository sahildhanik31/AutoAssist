export type TransactionType = "service" | "membership" | "inspection";

export interface WorkshopSnapshot {
  id: string;
  name: string;
  address: string;
  distanceKm?: number;
}

export interface SelectedCoupon {
  code: string;
  discount: number;
}

export interface ServiceBookingDraft {
  serviceId: string;
  serviceTitle: string;
  serviceImage: string;
  serviceDuration: string;
  serviceWarranty: string;
  selectedBrand: string;
  selectedOption: string;
  addOns: string[];
  basePrice: number;
  additionalCharges: number;
  gst: number;
  grandTotal: number;
  workshop?: WorkshopSnapshot;
  selectedCoupon?: SelectedCoupon | null;
  couponDiscount?: number;
  rewardDiscount?: number;
  membershipDiscount?: number;
  rewardPointsApplied?: boolean;
  vehicleId?: string;
}

export interface PaymentRouteParams {
  transactionType: TransactionType;
  recordId: string;
  amount: string;
  label: string;
}

const finiteMoney = (value: unknown): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0
    ? Math.round(parsed * 100) / 100
    : 0;
};

export function parseBookingDraft(value?: string | string[]): ServiceBookingDraft | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ServiceBookingDraft>;
    if (
      typeof parsed.serviceId !== "string" ||
      !parsed.serviceId.trim() ||
      typeof parsed.serviceTitle !== "string" ||
      !parsed.serviceTitle.trim()
    ) {
      return null;
    }

    return {
      serviceId: parsed.serviceId,
      serviceTitle: parsed.serviceTitle,
      serviceImage: typeof parsed.serviceImage === "string" ? parsed.serviceImage : "",
      serviceDuration:
        typeof parsed.serviceDuration === "string" ? parsed.serviceDuration : "-",
      serviceWarranty:
        typeof parsed.serviceWarranty === "string" ? parsed.serviceWarranty : "-",
      selectedBrand:
        typeof parsed.selectedBrand === "string" ? parsed.selectedBrand : "-",
      selectedOption:
        typeof parsed.selectedOption === "string" ? parsed.selectedOption : "-",
      addOns: Array.isArray(parsed.addOns)
        ? parsed.addOns.filter((item): item is string => typeof item === "string")
        : [],
      basePrice: finiteMoney(parsed.basePrice),
      additionalCharges: finiteMoney(parsed.additionalCharges),
      gst: finiteMoney(parsed.gst),
      grandTotal: finiteMoney(parsed.grandTotal),
      workshop:
        parsed.workshop &&
        typeof parsed.workshop.id === "string" &&
        typeof parsed.workshop.name === "string" &&
        typeof parsed.workshop.address === "string"
          ? {
              id: parsed.workshop.id,
              name: parsed.workshop.name,
              address: parsed.workshop.address,
              distanceKm: finiteMoney(parsed.workshop.distanceKm),
            }
          : undefined,
      selectedCoupon:
        parsed.selectedCoupon &&
        typeof parsed.selectedCoupon.code === "string"
          ? {
              code: parsed.selectedCoupon.code,
              discount: finiteMoney(parsed.selectedCoupon.discount),
            }
          : null,
      couponDiscount: finiteMoney(parsed.couponDiscount),
      rewardDiscount: finiteMoney(parsed.rewardDiscount),
      membershipDiscount: finiteMoney(parsed.membershipDiscount),
      rewardPointsApplied: parsed.rewardPointsApplied === true,
      vehicleId:
        typeof parsed.vehicleId === "string" ? parsed.vehicleId : undefined,
    };
  } catch {
    return null;
  }
}

export const serializeBookingDraft = (draft: ServiceBookingDraft): string =>
  JSON.stringify(draft);

export const getParamString = (
  value: string | string[] | undefined,
  fallback = ""
): string => (Array.isArray(value) ? value[0] ?? fallback : value ?? fallback);

export const parsePositiveAmount = (
  value: string | string[] | undefined
): number | null => {
  const amount = Number(getParamString(value));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.round(amount * 100) / 100;
};

export function isTransactionType(value: string): value is TransactionType {
  return value === "service" || value === "membership" || value === "inspection";
}
