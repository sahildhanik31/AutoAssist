// app/bookings/EditVehicle.tsx

import { router } from "expo-router";
import { useState,useEffect } from "react";
import {
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { doc, addDoc, updateDoc, getDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth } from "@/firebase/firebaseConfig";
import { db } from "@/firebase/firestore";
import {
    collapseSpaces,
    isValidOdometer,
    isValidVehicleText,
    REGISTRATION_REGEX,
    sanitizeDigits,
    sanitizeRegistration,
    sanitizeVehicleText,
} from "@/utils/validation";

// ------------------------------------------------------
// Static option data
// ------------------------------------------------------
const COMPANIES = [
    "Maruti Suzuki",
    "Hyundai",
    "Honda",
    "Toyota",
    "Mahindra",
    "Tata",
    "Kia",
    "MG",
    "Volkswagen",
    "Skoda",
    "BMW",
    "Mercedes",
    "Audi",
    "Ford",
    "Renault",
    "Nissan",
    "Jeep",
];

const VEHICLE_TYPES = ["Two Wheeler", "Four Wheeler"];

const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];

const TRANSMISSIONS = ["Manual", "Automatic", "AMT", "iMT", "CVT"];

const MANUFACTURING_YEARS: string[] = (() => {
    const years: string[] = [];
    for (let year = new Date().getFullYear(); year >= 2000; year--) {
        years.push(String(year));
    }
    return years;
})();

const YES_NO = ["Yes", "No"];

export default function EditVehicleScreen() {
 const {
        vehicleId,
        company: paramCompany,
        model: paramModel,
        vehicleType: paramVehicleType,
        registrationNumber: paramRegistrationNumber,
        fuelType: paramFuelType,
        transmission: paramTransmission,
        odometer: paramOdometer,
        year: paramYear,
        manual,
        onboarding,
        source,
        returnTo,
    } = useLocalSearchParams<{
        vehicleId?: string;
        company?: string;
        model?: string;
        vehicleType?: string;
        registrationNumber?: string;
        fuelType?: string;
        transmission?: string;
        odometer?: string;
        year?: string;
        manual?: string;
        onboarding?: string;
        source?: string;
        returnTo?: string;
    }>();


    // Vehicle Information
    const [company, setCompany] = useState(paramCompany ?? "");
    const [model, setModel] = useState(paramModel ?? "");
    const [registrationNumber, setRegistrationNumber] = useState(paramRegistrationNumber ?? "");
    const [vehicleType, setVehicleType] = useState(paramVehicleType ?? "");
    const [saving, setSaving] = useState(false);

    // Not listed vehicle
    const [notListed, setNotListed] = useState(manual === "true");
    const [customCompany, setCustomCompany] = useState("");
    const [customModel, setCustomModel] = useState("");

    // Technical Details
    const [fuelType, setFuelType] = useState(paramFuelType ?? "");
    const [transmission, setTransmission] = useState(paramTransmission ?? "");
    const [manufacturingYear, setManufacturingYear] = useState(paramYear ?? "");
    const [odometer, setOdometer] = useState(paramOdometer ?? "");

    // Documents
    const [insuranceAvailable, setInsuranceAvailable] = useState("");
    const [pucAvailable, setPucAvailable] = useState("");
    useEffect(() => {
    if (!vehicleId) return;

    const currentVehicleId = vehicleId;

    async function loadVehicle() {
        const uid = auth.currentUser?.uid;

        if (!uid) return;

        try {
            const snap = await getDoc(
                doc(
                    db,
                    "users",
                    uid,
                    "vehicles",
                    currentVehicleId
                )
            );

            if (snap.exists()) {
                const v = snap.data();

                setCompany(v.company ?? "");
                setModel(v.model ?? "");
                setRegistrationNumber(v.registrationNumber ?? "");
                setVehicleType(v.vehicleType ?? "");
                setFuelType(v.fuelType ?? "");
                setTransmission(v.transmission ?? "");
                setManufacturingYear(v.year ?? "");
                setOdometer(v.odometer ?? "");
                setInsuranceAvailable(
                    v.hasInsurance ? "Yes" : "No"
                );
                setPucAvailable(
                    v.hasPuc ? "Yes" : "No"
                );
            }
        } catch (err) {
            console.log(err);
        }
    }

    loadVehicle();
}, [vehicleId]);

    // Tracks which dropdown-style selector is currently open
    const [activeSelector, setActiveSelector] = useState<string | null>(null);

    function toggleSelector(key: string) {
        setActiveSelector((prev) => (prev === key ? null : key));
    }

    function handleBack() {
  if (router.canGoBack()) {
    router.back();
  } else if (returnTo) {
    router.replace(returnTo as never);
  } else {
    router.replace("/bookings/MyGarage");
  }
}

    async function handleSave() {
        if (saving) return;

        const finalCompany = collapseSpaces(
            notListed && customCompany.trim() ? customCompany : company
        );
        const finalModel = collapseSpaces(
            notListed && customModel.trim() ? customModel : model
        );

        if (!isValidVehicleText(finalCompany)) {
            Alert.alert("Vehicle Company Required", "Please select or enter the vehicle company.");
            return;
        }
        if (!isValidVehicleText(finalModel)) {
            Alert.alert("Vehicle Model Required", "Please select or enter the vehicle model.");
            return;
        }
        if (!REGISTRATION_REGEX.test(registrationNumber)) {
            Alert.alert(
                "Invalid Registration Number",
                "Registration number must contain exactly 10 letters or numbers, for example DL01AB1234."
            );
            return;
        }
        if (!vehicleType) {
            Alert.alert("Missing Information", "Please select the vehicle type.");
            return;
        }
        if (!fuelType) {
            Alert.alert("Missing Information", "Please select the fuel type.");
            return;
        }
        if (!transmission) {
            Alert.alert("Missing Information", "Please select the transmission.");
            return;
        }
        if (!manufacturingYear || !MANUFACTURING_YEARS.includes(manufacturingYear)) {
            Alert.alert("Invalid Manufacturing Year", "Please select a valid manufacturing year.");
            return;
        }
        if (!isValidOdometer(odometer)) {
            Alert.alert("Invalid Odometer", "Please enter a valid odometer reading in kilometres.");
            return;
        }
        if (!insuranceAvailable) {
            Alert.alert("Missing Information", "Please select whether insurance is available.");
            return;
        }
        if (!pucAvailable) {
            Alert.alert("Missing Information", "Please select whether PUC is available.");
            return;
        }

        const uid = auth.currentUser?.uid;
        if (!uid) {
            Alert.alert("Not signed in", "Please log in again.");
            return;
        }

        const payload = {
            company: finalCompany,
            model: finalModel,
            vehicleType,
            registrationNumber,
            fuelType,
            transmission,
            year: manufacturingYear,
            odometer,
            hasInsurance: insuranceAvailable === "Yes",
            hasPuc: pucAvailable === "Yes",
            updatedAt: serverTimestamp(),
        };

        setSaving(true);
        try {
            if (vehicleId) {
    const currentVehicleId = vehicleId;

    await updateDoc(
        doc(
            db,
            "users",
            uid,
            "vehicles",
            currentVehicleId
        ),
        payload
    );
} else {
                await addDoc(collection(db, "users", uid, "vehicles"), {
                    ...payload,
                    createdAt: serverTimestamp(),
                });
            }
            if (
                onboarding === "true" ||
                returnTo === "/tabs/HomeScreen" ||
                source === "onboarding"
            ) {
                if (onboarding === "true" || source === "onboarding") {
                    router.dismissAll();
                }
                router.replace("/tabs/HomeScreen");
            } else {
                router.replace("/bookings/MyGarage");
            }
        } catch (err: any) {
            console.log(err);
            Alert.alert("Error", err?.message ?? "Couldn't save the vehicle. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    // ------------------------------------------------------
    // Reusable dropdown-style selector field
    // ------------------------------------------------------
    function SelectorField({
        fieldKey,
        label,
        placeholder,
        value,
        options,
        onSelect,
    }: {
        fieldKey: string;
        label: string;
        placeholder: string;
        value: string;
        options: string[];
        onSelect: (value: string) => void;
    }) {
        const isOpen = activeSelector === fieldKey;

        return (
            <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <TouchableOpacity
                    style={styles.selectorField}
                    activeOpacity={0.7}
                    onPress={() => toggleSelector(fieldKey)}
                >
                    <Text style={value ? styles.selectorValueText : styles.selectorPlaceholderText}>
                        {value || placeholder}
                    </Text>
                    <Text style={styles.selectorArrow}>{isOpen ? "▲" : "▼"}</Text>
                </TouchableOpacity>

                {isOpen && (
                    <View style={styles.optionsWrap}>
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.optionChip,
                                    value === option && styles.optionChipSelected,
                                ]}
                                activeOpacity={0.7}
                                onPress={() => {
                                    onSelect(option);
                                    setActiveSelector(null);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.optionChipText,
                                        value === option && styles.optionChipTextSelected,
                                    ]}
                                >
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        );
    }

    // ------------------------------------------------------
    // Reusable segmented button field
    // ------------------------------------------------------
    function SegmentedField({
        label,
        options,
        value,
        onSelect,
    }: {
        label: string;
        options: string[];
        value: string;
        onSelect: (value: string) => void;
    }) {
        return (
            <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <View style={styles.segmentedRow}>
                    {options.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.segmentedButton,
                                value === option && styles.segmentedButtonSelected,
                            ]}
                            activeOpacity={0.7}
                            onPress={() => onSelect(option)}
                        >
                            <Text
                                style={[
                                    styles.segmentedButtonText,
                                    value === option && styles.segmentedButtonTextSelected,
                                ]}
                            >
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backIconButton}
                        activeOpacity={0.7}
                        onPress={handleBack}
                    >
                        <Text style={styles.backIconText}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Edit Vehicle</Text>
                        <Text style={styles.headerSubtitle}>Update your vehicle information</Text>
                    </View>
                </View>

                {/* Section 1: Vehicle Information */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Vehicle Information</Text>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setNotListed((prev) => !prev)}
                        style={styles.notListedRow}
                    >
                        <Text style={styles.notListedText}>
                            Can't find your vehicle?{" "}
                            <Text style={styles.notListedTextBold}>
                                My Vehicle is Not Listed
                            </Text>
                        </Text>
                    </TouchableOpacity>

                    {notListed ? (
                        <View style={styles.notListedBox}>
                            <Text style={styles.fieldLabel}>Company Name</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter company name"
                                placeholderTextColor="#94A3B8"
                                value={customCompany}
                                onChangeText={(value) =>
                                    setCustomCompany(sanitizeVehicleText(value))
                                }
                                maxLength={50}
                            />

                            <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>
                                Model Name
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter model name"
                                placeholderTextColor="#94A3B8"
                                value={customModel}
                                onChangeText={(value) =>
                                    setCustomModel(sanitizeVehicleText(value))
                                }
                                maxLength={50}
                            />
                        </View>
                    ) : (
                        <>
                            <SelectorField
                                fieldKey="company"
                                label="Company"
                                placeholder="Select Company"
                                value={company}
                                options={COMPANIES}
                                onSelect={setCompany}
                            />
                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>Model</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Enter model name"
                                    placeholderTextColor="#94A3B8"
                                    value={model}
                                    onChangeText={(value) => setModel(sanitizeVehicleText(value))}
                                    maxLength={50}
                                />
                            </View>
                        </>
                    )}

                    <SegmentedField
                        label="Vehicle Type"
                        options={VEHICLE_TYPES}
                        value={
                            vehicleType === "two" || vehicleType === "Two Wheeler"
                                ? "Two Wheeler"
                                : vehicleType
                                ? "Four Wheeler"
                                : ""
                        }
                        onSelect={(value) =>
                            setVehicleType(value === "Two Wheeler" ? "two" : "four")
                        }
                    />

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Registration Number</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="DL01AB1234"
                            placeholderTextColor="#94A3B8"
                            autoCapitalize="characters"
                            maxLength={10}
                            value={registrationNumber}
                            onChangeText={(value) =>
                                setRegistrationNumber(sanitizeRegistration(value))
                            }
                        />
                    </View>
                </View>

                {/* Section 2: Technical Details */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Technical Details</Text>

                    <SelectorField
                        fieldKey="fuelType"
                        label="Fuel Type"
                        placeholder="Select Fuel Type"
                        value={fuelType}
                        options={FUEL_TYPES}
                        onSelect={setFuelType}
                    />

                    <SelectorField
                        fieldKey="transmission"
                        label="Transmission"
                        placeholder="Select Transmission"
                        value={transmission}
                        options={TRANSMISSIONS}
                        onSelect={setTransmission}
                    />

                    <SelectorField
                        fieldKey="manufacturingYear"
                        label="Manufacturing Year"
                        placeholder="Select Year"
                        value={manufacturingYear}
                        options={MANUFACTURING_YEARS}
                        onSelect={setManufacturingYear}
                    />

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Odometer</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="52000"
                            placeholderTextColor="#94A3B8"
                            keyboardType="numeric"
                            maxLength={7}
                            value={odometer}
                            onChangeText={(value) =>
                                setOdometer(sanitizeDigits(value, 7))
                            }
                        />
                    </View>
                </View>

                {/* Section 3: Documents */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Documents</Text>

                    <SegmentedField
                        label="Insurance Available"
                        options={YES_NO}
                        value={insuranceAvailable}
                        onSelect={setInsuranceAvailable}
                    />

                    <SegmentedField
                        label="PUC Available"
                        options={YES_NO}
                        value={pucAvailable}
                        onSelect={setPucAvailable}
                    />
                </View>
            </ScrollView>

            {/* Sticky Bottom Button */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
    style={[
        styles.saveButton,
        saving && { opacity: 0.6 },
    ]}
    activeOpacity={0.85}
    onPress={handleSave}
    disabled={saving}
>
    <Text style={styles.saveButtonText}>
        {saving ? "Saving..." : "Save Changes"}
    </Text>
</TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EAF2FF",
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 34,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  backIconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "#DCE7F5",

    shadowColor: "#123A7A",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  backIconText: {
    fontSize: 23,
    color: "#123A7A",
    fontWeight: "800",
    marginTop: -2,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#123A7A",
    letterSpacing: 0.2,
  },

  headerSubtitle: {
    fontSize: 13.5,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "500",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 19,
    paddingVertical: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#DCE7F5",

    shadowColor: "#173A6A",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 6,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 18,
    letterSpacing: 0.15,
  },

  fieldContainer: {
    marginBottom: 18,
  },

  fieldLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 8,
    letterSpacing: 0.15,
  },

  fieldLabelSpaced: {
    marginTop: 16,
  },

  textInput: {
    minHeight: 54,
    backgroundColor: "#F7FAFF",
    borderWidth: 1.5,
    borderColor: "#D7E2F0",
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 14.5,
    fontWeight: "500",
    color: "#172033",

    shadowColor: "#123A7A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  selectorField: {
    minHeight: 54,
    backgroundColor: "#F7FAFF",
    borderWidth: 1.5,
    borderColor: "#D7E2F0",
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    shadowColor: "#123A7A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  selectorValueText: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: "700",
    color: "#172033",
  },

  selectorPlaceholderText: {
    flex: 1,
    fontSize: 14.5,
    color: "#94A3B8",
    fontWeight: "500",
  },

  selectorArrow: {
    fontSize: 11,
    color: "#2563EB",
    fontWeight: "900",
    marginLeft: 12,
  },

  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 12,
    backgroundColor: "#F7FAFF",
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: "#DCE7F5",
  },

  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D7E2F0",
    backgroundColor: "#FFFFFF",
  },

  optionChipSelected: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",

    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },

  optionChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },

  optionChipTextSelected: {
    color: "#FFFFFF",
  },

  notListedRow: {
    marginBottom: 18,
    marginTop: -4,
    backgroundColor: "#F7FAFF",
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#DCE7F5",
  },

  notListedText: {
    fontSize: 12.5,
    color: "#64748B",
    lineHeight: 18,
    fontWeight: "500",
  },

  notListedTextBold: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#2563EB",
  },

  notListedBox: {
    backgroundColor: "#EEF5FF",
    borderRadius: 17,
    padding: 15,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#CFE0F7",
  },

  segmentedRow: {
    flexDirection: "row",
    gap: 10,
  },

  segmentedButton: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#D7E2F0",
    backgroundColor: "#F7FAFF",
    alignItems: "center",
    justifyContent: "center",
  },

  segmentedButtonSelected: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",

    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.22,
    shadowRadius: 7,
    elevation: 4,
  },

  segmentedButtonText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
  },

  segmentedButtonTextSelected: {
    color: "#FFFFFF",
  },

  bottomBar: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingTop: 15,
    paddingBottom: 26,
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

  saveButton: {
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

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
});