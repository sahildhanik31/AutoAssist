// src/app/screen/CustomizationScreen.tsx

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { services } from "../../utils/services";
import { oilCategories } from "../../utils/oils";
import { batteryBrands } from "../../utils/batteryBrands";
import { tyreBrands } from "../../utils/tyres";
import { carWashPackages } from "../../utils/carWashPackages";
import { dentPaintServices } from "../../utils/dentPaintServices";
import { roadsideServices } from "../../utils/roadsideServices";
import { addOnServices } from "../../utils/addOnServices";
import AppBackButton from "@/components/common/AppBackButton";
import {
  OilCategory,
  OilBrand,
  BatteryBrand,
  BatteryOption,
  TyreBrand,
  TyreOption,
  CarWashPackage,
  DentPaintPanel,
  RoadsideService,
  BookingPayload,
} from "../../types/service";
import { serializeBookingDraft } from "../../types/workflow";

// ------------------------------------------------------
// Theme
// ------------------------------------------------------
const Colors = {
  primary: "#1e3a8a",
  accent: "#2563EB",
  background: "#d0e7ff",
  card: "#ffffff",
  textDark: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  success: "#16A34A",
  successBg: "#ECFDF5",
  danger: "#DC2626",
  dangerBg: "#FEF2F2",
  neutralBg: "#F1F5F9",
  neutralText: "#475569",
};

const formatPrice = (value: number): string => `₹${value.toLocaleString("en-IN")}`;

// ------------------------------------------------------
// Small reusable badge
// ------------------------------------------------------
type BadgeTone = "accent" | "success" | "neutral" | "danger";

const Badge: React.FC<{ label: string; tone?: BadgeTone }> = ({ label, tone = "accent" }) => {
  const toneMap: Record<BadgeTone, { bg: string; text: string }> = {
    accent: { bg: "#EFF6FF", text: Colors.accent },
    success: { bg: Colors.successBg, text: Colors.success },
    neutral: { bg: Colors.neutralBg, text: Colors.neutralText },
    danger: { bg: Colors.dangerBg, text: Colors.danger },
  };
  const tone_ = toneMap[tone];
  return (
    <View style={[styles.badge, { backgroundColor: tone_.bg }]}>
      <Text style={[styles.badgeText, { color: tone_.text }]}>{label}</Text>
    </View>
  );
};

const knownServiceIds = [
  "oil-change",
  "battery-replacement",
  "tyre-replacement",
  "car-wash",
  "dent-paint",
  "general-service",
  "roadside",
];

export default function CustomizationScreen() {
  // The selected service id is passed in as a route param, for example:
  // router.push({ pathname: "...", params: { serviceId: "oil-change" } })
  // The ServiceDetailsModal also forwards the package total (modalBasePrice)
  // and any optional service upgrades chosen there (modalUpgrades).
  const { serviceId, modalBasePrice, modalUpgrades } = useLocalSearchParams<{
    serviceId: string;
    modalBasePrice?: string;
    modalUpgrades?: string;
  }>();
  const router = useRouter();

  // Look up the full service object from the existing services data file.
  const service = services.find((item) => item.id === serviceId);

  // ---------------- Oil flow state ----------------
  const [selectedOilCategory, setSelectedOilCategory] = useState<OilCategory | null>(null);
  const [selectedOilBrand, setSelectedOilBrand] = useState<OilBrand | null>(null);

  // ---------------- Battery flow state ----------------
  const [selectedBatteryBrand, setSelectedBatteryBrand] = useState<BatteryBrand | null>(null);
  const [selectedBatteryOption, setSelectedBatteryOption] = useState<BatteryOption | null>(null);

  // ---------------- Tyre flow state ----------------
  const [selectedTyreBrand, setSelectedTyreBrand] = useState<TyreBrand | null>(null);
  const [selectedTyreOption, setSelectedTyreOption] = useState<TyreOption | null>(null);

  // ---------------- Car wash flow state ----------------
  const [selectedCarWashPackage, setSelectedCarWashPackage] = useState<CarWashPackage | null>(null);

  // ---------------- Dent paint flow state ----------------
  const [selectedDentPanel, setSelectedDentPanel] = useState<DentPaintPanel | null>(null);

  // ---------------- General service flow state (multiple add-ons) ----------------
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);

  // ---------------- Roadside flow state ----------------
  const [selectedRoadsideService, setSelectedRoadsideService] = useState<RoadsideService | null>(null);

  // ---------------- Continue validation ----------------
  const [attemptedContinue, setAttemptedContinue] = useState(false);

  const toggleAddOn = (id: string) => {
    if (selectedAddOnIds.includes(id)) {
      setSelectedAddOnIds(selectedAddOnIds.filter((item) => item !== id));
    } else {
      setSelectedAddOnIds([...selectedAddOnIds, id]);
    }
  };

  // Upgrades chosen in the ServiceDetailsModal (optional serviceItems), if any.
  const parsedModalUpgrades: string[] = (() => {
    try {
      return modalUpgrades ? (JSON.parse(modalUpgrades) as string[]) : [];
    } catch {
      return [];
    }
  })();

  // Base price = service package total handed off by the modal (service price
  // + any optional service-item upgrades chosen there). Falls back to the
  // plain service price if the screen was opened without that context.
  const fallbackBasePrice = service?.price ?? 0;
  const parsedModalBasePrice = modalBasePrice ? Number(modalBasePrice) : NaN;
  const basePrice = Number.isFinite(parsedModalBasePrice) ? parsedModalBasePrice : fallbackBasePrice;

  const getAdditionalCharges = (): number => {
    switch (serviceId) {
      case "oil-change":
        return selectedOilBrand?.price ?? 0;
      case "battery-replacement":
        return selectedBatteryOption?.totalPrice ?? 0;
      case "tyre-replacement":
        return selectedTyreOption?.price ?? 0;
      case "car-wash":
        return selectedCarWashPackage?.discountPrice ?? selectedCarWashPackage?.price ?? 0;
      case "dent-paint":
        return selectedDentPanel?.price ?? 0;
      case "roadside":
        return selectedRoadsideService?.price ?? 0;
      case "general-service": {
        const chosen = addOnServices.filter((addOn) => selectedAddOnIds.includes(addOn.id));
        return chosen.reduce((sum, addOn) => sum + addOn.price, 0);
      }
      default:
        return 0;
    }
  };

  const getSelectionLabels = (): { brand: string; option: string } => {
    switch (serviceId) {
      case "oil-change":
        return {
          brand: selectedOilCategory?.title ?? "-",
          option: selectedOilBrand?.name ?? "-",
        };
      case "battery-replacement":
        return {
          brand: selectedBatteryBrand?.brandName ?? "-",
          option: selectedBatteryOption?.batteryModel ?? "-",
        };
      case "tyre-replacement":
        return {
          brand: selectedTyreBrand?.name ?? "-",
          option: selectedTyreOption?.size ?? "-",
        };
      case "car-wash":
        return {
          brand: "Car Wash",
          option: selectedCarWashPackage?.title ?? "-",
        };
      case "dent-paint":
        return {
          brand: "Dent & Paint",
          option: selectedDentPanel?.title ?? "-",
        };
      case "roadside":
        return {
          brand: "Roadside Assistance",
          option: selectedRoadsideService?.title ?? "-",
        };
      case "general-service":
        return {
          brand: service?.title ?? "General Service",
          option:
            selectedAddOnIds.length > 0
              ? `${selectedAddOnIds.length} add-on${selectedAddOnIds.length === 1 ? "" : "s"} selected`
              : "Standard Package",
        };
      default:
        return { brand: service?.title ?? "-", option: "Standard" };
    }
  };

  const buildAddOnLabels = (): string[] => {
    const labels = [...parsedModalUpgrades];
    if (serviceId === "general-service") {
      const chosen = addOnServices.filter((addOn) => selectedAddOnIds.includes(addOn.id));
      labels.push(...chosen.map((addOn) => addOn.title));
    }
    return labels;
  };

  const canContinue = (): boolean => {
    if (!service || serviceId === "roadside") return false;
    switch (serviceId) {
      case "oil-change":
        return !!selectedOilBrand;
      case "battery-replacement":
        return !!selectedBatteryOption;
      case "tyre-replacement":
        return !!selectedTyreOption;
      case "car-wash":
        return !!selectedCarWashPackage;
      case "dent-paint":
        return !!selectedDentPanel;
      case "roadside":
        return !!selectedRoadsideService;
      default:
        return true;
    }
  };

  const getValidationMessage = (): string => {
    switch (serviceId) {
      case "oil-change":
        return "Please select an engine oil brand to continue.";
      case "battery-replacement":
        return "Please select a battery option to continue.";
      case "tyre-replacement":
        return "Please select a tyre option to continue.";
      case "car-wash":
        return "Please select a wash package to continue.";
      case "dent-paint":
        return "Please select a panel to continue.";
      case "roadside":
        return "Please select a roadside service to continue.";
      default:
        return "";
    }
  };

  const handleContinue = () => {
    if (!service) {
      Alert.alert(
        "Service Unavailable",
        "The selected service could not be found. Please choose a service again.",
        [{ text: "OK", onPress: () => router.replace("/bookings/BookService") }]
      );
      return;
    }
    if (serviceId === "roadside") {
      Alert.alert(
        "Coming Soon",
        "Roadside assistance services will be available soon."
      );
      return;
    }
    if (!canContinue()) {
      setAttemptedContinue(true);
      Alert.alert("Selection Required", getValidationMessage());
      return;
    }

    const additionalCharges = getAdditionalCharges();
    const { brand, option } = getSelectionLabels();
    const subtotal = basePrice + additionalCharges;
    const gst = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + gst;

    const payload: BookingPayload = {
      serviceId: serviceId ?? "",
      serviceTitle: service?.title ?? "Service",
      serviceImage: service?.image ?? "",
      serviceDuration: service?.duration ?? "-",
      serviceWarranty: service?.warranty ?? "-",
      selectedBrand: brand,
      selectedOption: option,
      addOns: buildAddOnLabels(),
      basePrice,
      additionalCharges,
      gst,
      grandTotal,
    };

    router.push({
      pathname: "/bookings/SelectWorkshop",
      params: { booking: serializeBookingDraft(payload) },
    });
  };

  const showValidationError = attemptedContinue && !canContinue();

  return (
    <View style={styles.container}>
     <ScrollView contentContainerStyle={styles.scrollContent}>
  <AppBackButton fallbackRoute="/bookings/BookService" />

  <Text style={styles.headerTitle}>
    {service ? service.title : "Customize Your Service"}
  </Text>

        {service && (
          <View style={styles.headerMetaRow}>
            <Badge label={service.duration} tone="neutral" />
            <Badge label={service.warranty} tone="neutral" />
          </View>
        )}

        {/* ---------------- OIL FLOW ---------------- */}
        {serviceId === "oil-change" && (
          <>
            {!selectedOilCategory && (
              <>
                <Text style={styles.sectionTitle}>Choose Oil Type</Text>
                <Text style={styles.sectionSubtitle}>Select the oil category that suits your engine</Text>
                {oilCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryCard}
                    activeOpacity={0.85}
                    onPress={() => setSelectedOilCategory(category)}
                  >
                    <Text style={styles.categoryCardTitle}>{category.title}</Text>
                    <Text style={styles.categoryCardDescription}>{category.description}</Text>
                    <Text style={styles.categoryCardMeta}>
                      {category.brands.length} brand{category.brands.length === 1 ? "" : "s"} available
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {selectedOilCategory && !selectedOilBrand && (
              <>
                <Text style={styles.sectionTitle}>Choose Brand</Text>
                <Text style={styles.sectionSubtitle}>{selectedOilCategory.title} oils</Text>

                {selectedOilCategory.brands.map((brand) => (
                  <TouchableOpacity
                    key={brand.id}
                    style={styles.oilCard}
                    activeOpacity={0.85}
                    onPress={() => setSelectedOilBrand(brand)}
                  >
                    <View style={styles.oilCardHeader}>
                      <Text style={styles.oilCardBrand}>{brand.name}</Text>
                      {brand.recommended && <Badge label="Recommended" tone="success" />}
                    </View>
                    <Text style={styles.oilCardType}>{selectedOilCategory.title}</Text>
                    {!!brand.description && (
                      <Text style={styles.oilCardDescription}>{brand.description}</Text>
                    )}
                    <View style={styles.oilCardSpecsRow}>
                      <View style={styles.oilCardSpecItem}>
                        <Text style={styles.oilCardSpecLabel}>Viscosity</Text>
                        <Text style={styles.oilCardSpecValue}>{brand.viscosity}</Text>
                      </View>
                      <View style={styles.oilCardSpecItem}>
                        <Text style={styles.oilCardSpecLabel}>Quantity</Text>
                        <Text style={styles.oilCardSpecValue}>{brand.quantity}</Text>
                      </View>
                    </View>
                    <View style={styles.oilCardFooter}>
                      <Text style={styles.oilCardPrice}>{formatPrice(brand.price)}</Text>
                      <View style={styles.selectHint}>
                        <Text style={styles.selectHintText}>Select</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.backButton} onPress={() => setSelectedOilCategory(null)}>
                  <Text style={styles.backButtonText}>‹ Back to Oil Types</Text>
                </TouchableOpacity>
              </>
            )}

            {selectedOilCategory && selectedOilBrand && (
              <>
                <Text style={styles.sectionTitle}>Your Selection</Text>
                <View style={[styles.oilCard, styles.oilCardSelected]}>
                  <View style={styles.oilCardHeader}>
                    <Text style={styles.oilCardBrand}>{selectedOilBrand.name}</Text>
                    {selectedOilBrand.recommended && <Badge label="Recommended" tone="success" />}
                  </View>
                  <Text style={styles.oilCardType}>{selectedOilCategory.title}</Text>
                  {!!selectedOilBrand.description && (
                    <Text style={styles.oilCardDescription}>{selectedOilBrand.description}</Text>
                  )}
                  <View style={styles.oilCardSpecsRow}>
                    <View style={styles.oilCardSpecItem}>
                      <Text style={styles.oilCardSpecLabel}>Viscosity</Text>
                      <Text style={styles.oilCardSpecValue}>{selectedOilBrand.viscosity}</Text>
                    </View>
                    <View style={styles.oilCardSpecItem}>
                      <Text style={styles.oilCardSpecLabel}>Quantity</Text>
                      <Text style={styles.oilCardSpecValue}>{selectedOilBrand.quantity}</Text>
                    </View>
                  </View>
                  <View style={styles.oilCardFooter}>
                    <Text style={styles.oilCardPrice}>{formatPrice(selectedOilBrand.price)}</Text>
                    <Badge label="Selected" tone="accent" />
                  </View>
                </View>
                <TouchableOpacity style={styles.backButton} onPress={() => setSelectedOilBrand(null)}>
                  <Text style={styles.backButtonText}>‹ Change Brand</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}

        {/* ---------------- BATTERY FLOW ---------------- */}
        {serviceId === "battery-replacement" && (
          <>
            {!selectedBatteryBrand && (
              <>
                <Text style={styles.sectionTitle}>Choose Battery Brand</Text>
                {batteryBrands.map((brand) => {
                  const startingPrice =
                    brand.options.length > 0
                      ? Math.min(...brand.options.map((option) => option.totalPrice))
                      : null;
                  return (
                    <TouchableOpacity
                      key={brand.brandId}
                      style={styles.brandCard}
                      activeOpacity={0.85}
                      onPress={() => setSelectedBatteryBrand(brand)}
                    >
                      <View style={styles.brandCardHeader}>
                        <Text style={styles.brandCardTitle}>{brand.brandName}</Text>
                        <Text style={styles.brandCardCountry}>{brand.country}</Text>
                      </View>
                      <Text style={styles.brandCardDescription}>{brand.description}</Text>
                      <View style={styles.brandCardFooter}>
                        <Text style={styles.brandCardMeta}>
                          {brand.options.length} option{brand.options.length === 1 ? "" : "s"}
                        </Text>
                        {startingPrice !== null && (
                          <Text style={styles.brandCardStartingPrice}>From {formatPrice(startingPrice)}</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {selectedBatteryBrand && !selectedBatteryOption && (
              <>
                <Text style={styles.sectionTitle}>Choose Battery Model</Text>
                <Text style={styles.sectionSubtitle}>{selectedBatteryBrand.brandName}</Text>

                {selectedBatteryBrand.options.map((option) => (
                  <TouchableOpacity
                    key={option.batteryModel}
                    style={[styles.optionCard, !option.inStock && styles.optionCardDisabled]}
                    activeOpacity={option.inStock ? 0.85 : 1}
                    disabled={!option.inStock}
                    onPress={() => setSelectedBatteryOption(option)}
                  >
                    <View style={styles.optionCardHeader}>
                      <Text style={styles.optionCardTitle}>{option.batteryModel}</Text>
                      {!option.inStock ? (
                        <Badge label="Out of Stock" tone="danger" />
                      ) : (
                        option.recommended && <Badge label="Recommended" tone="success" />
                      )}
                    </View>
                    <View style={styles.oilCardSpecsRow}>
                      <View style={styles.oilCardSpecItem}>
                        <Text style={styles.oilCardSpecLabel}>Capacity</Text>
                        <Text style={styles.oilCardSpecValue}>{option.capacity}</Text>
                      </View>
                      <View style={styles.oilCardSpecItem}>
                        <Text style={styles.oilCardSpecLabel}>Voltage</Text>
                        <Text style={styles.oilCardSpecValue}>{option.voltage}</Text>
                      </View>
                      <View style={styles.oilCardSpecItem}>
                        <Text style={styles.oilCardSpecLabel}>Technology</Text>
                        <Text style={styles.oilCardSpecValue}>{option.technology}</Text>
                      </View>
                    </View>
                    <Text style={styles.optionCardWarranty}>Warranty: {option.warranty}</Text>
                    <Text style={styles.optionCardAvailability}>{option.availability}</Text>
                    <View style={styles.optionCardFooter}>
                      <Text style={styles.optionCardPrice}>{formatPrice(option.totalPrice)}</Text>
                    </View>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.backButton} onPress={() => setSelectedBatteryBrand(null)}>
                  <Text style={styles.backButtonText}>‹ Back to Brands</Text>
                </TouchableOpacity>
              </>
            )}

            {selectedBatteryBrand && selectedBatteryOption && (
              <>
                <Text style={styles.sectionTitle}>Your Selection</Text>
                <View style={[styles.optionCard, styles.optionCardSelected]}>
                  <View style={styles.optionCardHeader}>
                    <Text style={styles.optionCardTitle}>
                      {selectedBatteryBrand.brandName} · {selectedBatteryOption.batteryModel}
                    </Text>
                    {selectedBatteryOption.recommended && <Badge label="Recommended" tone="success" />}
                  </View>
                  <View style={styles.oilCardSpecsRow}>
                    <View style={styles.oilCardSpecItem}>
                      <Text style={styles.oilCardSpecLabel}>Capacity</Text>
                      <Text style={styles.oilCardSpecValue}>{selectedBatteryOption.capacity}</Text>
                    </View>
                    <View style={styles.oilCardSpecItem}>
                      <Text style={styles.oilCardSpecLabel}>Voltage</Text>
                      <Text style={styles.oilCardSpecValue}>{selectedBatteryOption.voltage}</Text>
                    </View>
                    <View style={styles.oilCardSpecItem}>
                      <Text style={styles.oilCardSpecLabel}>Technology</Text>
                      <Text style={styles.oilCardSpecValue}>{selectedBatteryOption.technology}</Text>
                    </View>
                  </View>
                  <Text style={styles.optionCardWarranty}>Warranty: {selectedBatteryOption.warranty}</Text>
                  <View style={styles.optionCardFooter}>
                    <Text style={styles.optionCardPrice}>{formatPrice(selectedBatteryOption.totalPrice)}</Text>
                    <Badge label="Selected" tone="accent" />
                  </View>
                </View>
                <TouchableOpacity style={styles.backButton} onPress={() => setSelectedBatteryOption(null)}>
                  <Text style={styles.backButtonText}>‹ Change Model</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}

        {/* ---------------- TYRE FLOW ---------------- */}
        {serviceId === "tyre-replacement" && (
          <>
            {!selectedTyreBrand && (
              <>
                <Text style={styles.sectionTitle}>Choose Tyre Brand</Text>
                <Text style={styles.sectionSubtitle}>Pick a brand to see available sizes</Text>
                {tyreBrands.map((brand) => {
                  const startingPrice =
                    brand.options.length > 0 ? Math.min(...brand.options.map((option) => option.price)) : null;
                  return (
                    <TouchableOpacity
                      key={brand.brandId}
                      style={styles.brandCard}
                      activeOpacity={0.85}
                      onPress={() => setSelectedTyreBrand(brand)}
                    >
                      <View style={styles.brandCardHeader}>
                        <Text style={styles.brandCardTitle}>{brand.name}</Text>
                        {!!brand.countryOfOrigin && (
                          <Text style={styles.brandCardCountry}>{brand.countryOfOrigin}</Text>
                        )}
                      </View>
                      {!!brand.description && (
                        <Text style={styles.brandCardDescription}>{brand.description}</Text>
                      )}
                      <View style={styles.brandCardFooter}>
                        <Text style={styles.brandCardMeta}>
                          {brand.options.length} option{brand.options.length === 1 ? "" : "s"}
                        </Text>
                        {startingPrice !== null && (
                          <Text style={styles.brandCardStartingPrice}>From {formatPrice(startingPrice)}</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {selectedTyreBrand && !selectedTyreOption && (
              <>
                <Text style={styles.sectionTitle}>Choose Size</Text>
                <Text style={styles.sectionSubtitle}>{selectedTyreBrand.name} tyres</Text>

                {selectedTyreBrand.options.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.optionCard, !option.inStock && styles.optionCardDisabled]}
                    activeOpacity={option.inStock ? 0.85 : 1}
                    disabled={!option.inStock}
                    onPress={() => setSelectedTyreOption(option)}
                  >
                    <View style={styles.optionCardHeader}>
                      <Text style={styles.optionCardTitle}>{option.size}</Text>
                      {!option.inStock ? (
                        <Badge label="Out of Stock" tone="danger" />
                      ) : (
                        option.tubeless && <Badge label="Tubeless" tone="neutral" />
                      )}
                    </View>
                    <Text style={styles.optionCardWarranty}>Warranty: {option.warranty}</Text>
                    <View style={styles.optionCardFooter}>
                      <Text style={styles.optionCardPrice}>{formatPrice(option.price)}</Text>
                    </View>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.backButton} onPress={() => setSelectedTyreBrand(null)}>
                  <Text style={styles.backButtonText}>‹ Back to Brands</Text>
                </TouchableOpacity>
              </>
            )}

            {selectedTyreBrand && selectedTyreOption && (
              <>
                <Text style={styles.sectionTitle}>Your Selection</Text>
                <View style={[styles.optionCard, styles.optionCardSelected]}>
                  <View style={styles.optionCardHeader}>
                    <Text style={styles.optionCardTitle}>
                      {selectedTyreBrand.name} · {selectedTyreOption.size}
                    </Text>
                    {selectedTyreOption.tubeless && <Badge label="Tubeless" tone="neutral" />}
                  </View>
                  <Text style={styles.optionCardWarranty}>Warranty: {selectedTyreOption.warranty}</Text>
                  <View style={styles.optionCardFooter}>
                    <Text style={styles.optionCardPrice}>{formatPrice(selectedTyreOption.price)}</Text>
                    <Badge label="Selected" tone="accent" />
                  </View>
                </View>
                <TouchableOpacity style={styles.backButton} onPress={() => setSelectedTyreOption(null)}>
                  <Text style={styles.backButtonText}>‹ Change Size</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}

        {/* ---------------- CAR WASH FLOW ---------------- */}
        {serviceId === "car-wash" && (
          <>
            <Text style={styles.sectionTitle}>Choose Package</Text>
            {carWashPackages.map((pkg) => {
              const isSelected = selectedCarWashPackage?.packageId === pkg.packageId;
              const hasDiscount = pkg.discountPrice < pkg.price;
              return (
                <TouchableOpacity
                  key={pkg.packageId}
                  style={[styles.packageCard, isSelected && styles.packageCardSelected]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedCarWashPackage(pkg)}
                >
                  <View style={styles.packageCardHeader}>
                    <Text style={styles.packageCardTitle}>{pkg.title}</Text>
                    {pkg.recommended && <Badge label="Recommended" tone="success" />}
                  </View>
                  <Text style={styles.packageCardDescription}>{pkg.description}</Text>
                  <Text style={styles.packageCardDuration}>Duration: {pkg.duration}</Text>

                  <View style={styles.packageIncludedList}>
                    {pkg.included.map((item) => (
                      <Text key={item} style={styles.packageIncludedItem}>
                        ✓ {item}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.packageCardFooter}>
                    <View style={styles.priceRowInline}>
                      <Text style={styles.packageCardPrice}>{formatPrice(pkg.discountPrice)}</Text>
                      {hasDiscount && (
                        <Text style={styles.packageCardOriginalPrice}>{formatPrice(pkg.price)}</Text>
                      )}
                    </View>
                    {isSelected && <Badge label="Selected" tone="accent" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* ---------------- DENT PAINT FLOW ---------------- */}
        {serviceId === "dent-paint" && (
          <>
            <Text style={styles.sectionTitle}>Choose Panel</Text>
            {dentPaintServices.map((panel) => {
              const isSelected = selectedDentPanel?.panelId === panel.panelId;
              return (
                <TouchableOpacity
                  key={panel.panelId}
                  style={[styles.packageCard, isSelected && styles.packageCardSelected]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedDentPanel(panel)}
                >
                  <View style={styles.packageCardHeader}>
                    <Text style={styles.packageCardTitle}>{panel.title}</Text>
                    {panel.recommended && <Badge label="Recommended" tone="success" />}
                  </View>
                  <Text style={styles.packageCardDuration}>Duration: {panel.duration}</Text>
                  <Text style={styles.packageCardDuration}>Paint Warranty: {panel.paintWarranty}</Text>
                  <View style={styles.packageCardFooter}>
                    <Text style={styles.packageCardPrice}>{formatPrice(panel.price)}</Text>
                    {isSelected && <Badge label="Selected" tone="accent" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* ---------------- GENERAL SERVICE FLOW ---------------- */}
        {serviceId === "general-service" && (
          <>
            <Text style={styles.sectionTitle}>Optional Add-ons</Text>
            <Text style={styles.sectionSubtitle}>Enhance your service with these extras</Text>
            {addOnServices.map((addOn) => {
              const isSelected = selectedAddOnIds.includes(addOn.id);
              return (
                <TouchableOpacity
                  key={addOn.id}
                  style={[styles.addOnCard, isSelected && styles.addOnCardSelected]}
                  activeOpacity={0.85}
                  onPress={() => toggleAddOn(addOn.id)}
                >
                  <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                    {isSelected && <Text style={styles.checkboxTick}>✓</Text>}
                  </View>
                  <View style={styles.addOnCardBody}>
                    <View style={styles.addOnCardHeaderRow}>
                      <Text style={styles.addOnCardTitle}>{addOn.title}</Text>
                      {addOn.recommended && <Badge label="Recommended" tone="success" />}
                    </View>
                    <Text style={styles.addOnCardDescription}>{addOn.description}</Text>
                    <Text style={styles.addOnCardDuration}>{addOn.duration}</Text>
                  </View>
                  <Text style={styles.addOnCardPrice}>{formatPrice(addOn.price)}</Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* ---------------- ROADSIDE FLOW ---------------- */}
        {serviceId === "roadside" && (
          <>
            <Text style={styles.sectionTitle}>Choose Service</Text>
            {roadsideServices.map((item) => {
              const isSelected = selectedRoadsideService?.id === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.packageCard,
                    isSelected && styles.packageCardSelected,
                    item.comingSoon && styles.optionCardDisabled,
                  ]}
                  activeOpacity={item.comingSoon ? 1 : 0.85}
                  disabled={item.comingSoon}
                  onPress={() => setSelectedRoadsideService(item)}
                >
                  <View style={styles.packageCardHeader}>
                    <Text style={styles.packageCardTitle}>{item.title}</Text>
                    {item.comingSoon && <Badge label="Coming Soon" tone="neutral" />}
                  </View>
                  <Text style={styles.packageCardDescription}>{item.description}</Text>
                  <Text style={styles.packageCardDuration}>
                    ETA: {item.estimatedArrival} · {item.availability}
                  </Text>
                  <View style={styles.packageCardFooter}>
                    <Text style={styles.packageCardPrice}>{formatPrice(item.price)}</Text>
                    {isSelected && <Badge label="Selected" tone="accent" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* ---------------- NO CUSTOMIZATION FALLBACK ---------------- */}
        {!knownServiceIds.includes(serviceId as string) && (
          <View style={styles.noCustomizationBox}>
            <Text style={styles.noCustomizationText}>No additional customization available.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        {showValidationError && <Text style={styles.validationText}>{getValidationMessage()}</Text>}
        <TouchableOpacity
          style={[styles.continueButton, !canContinue() && styles.continueButtonDisabled]}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 8,
  },
  headerMetaRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    color: Colors.textMuted,
    marginBottom: 12,
  },

  // Badge
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // Oil category card
  categoryCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 4,
  },
  categoryCardDescription: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
    marginBottom: 8,
  },
  categoryCardMeta: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.accent,
  },

  // Oil brand card
  oilCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  oilCardSelected: {
    borderColor: Colors.accent,
  },
  oilCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  oilCardBrand: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textDark,
    flexShrink: 1,
    marginRight: 8,
  },
  oilCardType: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.accent,
    marginBottom: 6,
  },
  oilCardDescription: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
    marginBottom: 10,
  },
  oilCardSpecsRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 12,
  },
  oilCardSpecItem: {},
  oilCardSpecLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  oilCardSpecValue: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textDark,
  },
  oilCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  oilCardPrice: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.primary,
  },
  selectHint: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  selectHintText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.accent,
  },

  // Brand card (tyre / battery)
  brandCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  brandCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  brandCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textDark,
  },
  brandCardCountry: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  brandCardDescription: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
    marginBottom: 10,
  },
  brandCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandCardMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  brandCardStartingPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
  },

  // Option card (tyre size / battery model)
  optionCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  optionCardSelected: {
    borderColor: Colors.accent,
  },
  optionCardDisabled: {
    opacity: 0.5,
  },
  optionCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  optionCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
    flexShrink: 1,
    marginRight: 8,
  },
  optionCardWarranty: {
    fontSize: 12.5,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  optionCardAvailability: {
    fontSize: 12.5,
    color: Colors.textMuted,
    marginBottom: 10,
  },
  optionCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  optionCardPrice: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.primary,
  },

  // Package card (car wash / dent-paint / roadside)
  packageCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  packageCardSelected: {
    borderColor: Colors.accent,
  },
  packageCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  packageCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textDark,
    flexShrink: 1,
    marginRight: 8,
  },
  packageCardDescription: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
    marginBottom: 6,
  },
  packageCardDuration: {
    fontSize: 12.5,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  packageIncludedList: {
    marginTop: 6,
    marginBottom: 10,
  },
  packageIncludedItem: {
    fontSize: 12.5,
    color: Colors.success,
    fontWeight: "600",
    marginBottom: 3,
  },
  packageCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceRowInline: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  packageCardPrice: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.primary,
  },
  packageCardOriginalPrice: {
    fontSize: 13,
    color: Colors.textMuted,
    textDecorationLine: "line-through",
  },

  // Add-on card (general service)
  addOnCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  addOnCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: "#EFF6FF",
  },
  addOnCardBody: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  addOnCardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },
  addOnCardTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: Colors.textDark,
  },
  addOnCardDescription: {
    fontSize: 12.5,
    color: Colors.textMuted,
    lineHeight: 17,
    marginBottom: 4,
  },
  addOnCardDuration: {
    fontSize: 11.5,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  addOnCardPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  checkboxTick: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.accent,
  },

  noCustomizationBox: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    marginTop: 20,
  },
  noCustomizationText: {
    fontSize: 15,
    color: "#555555",
    textAlign: "center",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  validationText: {
    fontSize: 12.5,
    color: Colors.danger,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  continueButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  continueButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
