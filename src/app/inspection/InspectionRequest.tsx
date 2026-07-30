// app/inspection/InspectionRequest.tsx

import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "@/firebase/firebaseConfig";
import { db } from "@/firebase/firestore";
import DateTimeFields from "@/components/common/DateTimeFields";
import {
    collapseSpaces,
    formatDisplayDate,
    formatDisplayTime,
    INDIAN_MOBILE_REGEX,
    isDateInPast,
    isFutureTimeForDate,
    isValidAddress,
    isValidCityState,
    isValidGmail,
    isValidName,
    isValidVehicleText,
    PIN_REGEX,
    REGISTRATION_REGEX,
    sanitizeAddress,
    sanitizeCityState,
    sanitizeDigits,
    sanitizeGmail,
    sanitizeName,
    sanitizeRegistration,
} from "@/utils/validation";

// ------------------------------------------------------
// Static option data
// ------------------------------------------------------
const VEHICLE_DATA: Record<string,string[]> = {
    Hyundai:["Creta","Venue","i20","Verna"],
    "Maruti Suzuki":["Swift","Baleno","Brezza","Dzire"],
    Tata:["Nexon","Punch","Harrier","Safari"],
    Mahindra:["XUV700","Scorpio N","Thar"],
    Toyota:["Fortuner","Glanza","Innova Hycross"],
    Honda:["City","Amaze","Elevate"],
    Kia:["Seltos","Sonet","Carens"],
    BMW:["3 Series","X1","X5"],
    Audi:["A4","Q3","Q5"],
    Mercedes:["C-Class","E-Class","GLA"],
};

const VEHICLE_COMPANIES = Object.keys(VEHICLE_DATA);
/*
    "Hyundai",
    "Maruti Suzuki",
    "Honda",
    "Toyota",
    "Mahindra",
    "Tata",
    "Kia",
    "BMW",
    "Audi",
    "Mercedes",
*/

const CURRENT_YEAR = new Date().getFullYear();
const MANUFACTURING_YEARS: string[] = (() => {
    const years: string[] = [];
    for (let year = CURRENT_YEAR; year >= 2000; year--) {
        years.push(String(year));
    }
    return years;
})();



export default function InspectionRequestScreen() {
    const initialDate = new Date();
    initialDate.setDate(initialDate.getDate() + 1);
    initialDate.setHours(0, 0, 0, 0);
    const initialTime = new Date();
    initialTime.setHours(10, 0, 0, 0);

    // Buyer Information
    const [buyerName, setBuyerName] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [emailAddress, setEmailAddress] = useState("");

    // Vehicle Information
    const [vehicleCompany, setVehicleCompany] = useState("");
    const [vehicleModel, setVehicleModel] = useState("");
    const [manufacturingYear, setManufacturingYear] = useState("");
    const [registrationNumber, setRegistrationNumber] = useState("");

    // Seller Information
    const [sellerName, setSellerName] = useState("");
    const [sellerContact, setSellerContact] = useState("");

    // Inspection Address
    const [sellerAddress, setSellerAddress] = useState("");
    const [city, setCity] = useState("");
    const [stateName, setStateName] = useState("");
    const [pinCode, setPinCode] = useState("");
    const [landmark, setLandmark] = useState("");

    // Inspection Schedule
    const [preferredDate, setPreferredDate] = useState(initialDate);
    const [preferredTime, setPreferredTime] = useState(initialTime);

    // Additional Notes
    const [additionalNotes, setAdditionalNotes] = useState("");

    // Tracks which dropdown-style selector is currently open
    const [activeSelector, setActiveSelector] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function loadBuyerDetails() {
            const currentUser = auth.currentUser;
            if (!currentUser) return;
            setEmailAddress(currentUser.email ?? "");
            try {
                const userSnapshot = await getDoc(doc(db, "users", currentUser.uid));
                if (userSnapshot.exists()) {
                    const data = userSnapshot.data();
                    setBuyerName(data.name ?? currentUser.displayName ?? "");
                    setEmailAddress(data.email ?? currentUser.email ?? "");
                }
            } catch (error) {
                console.log(error);
            }
        }
        loadBuyerDetails();
    }, []);

    function toggleSelector(key: string) {
        setActiveSelector((prev) => (prev === key ? null : key));
    }

    function handleBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/tabs/HomeScreen");
  }
}

    async function handleContinue() {
        if (submitting) return;
        if (!isValidName(buyerName)) {
            Alert.alert("Invalid Name", "Please enter a valid buyer name using letters only.");
            return;
        }
        if (!INDIAN_MOBILE_REGEX.test(mobileNumber)) {
            Alert.alert("Invalid Mobile Number", "Please enter a valid 10-digit mobile number.");
            return;
        }
        if (!isValidGmail(emailAddress)) {
            Alert.alert("Invalid Email", "Please enter a valid Gmail address ending with @gmail.com.");
            return;
        }
        if (!isValidVehicleText(vehicleCompany)) {
            Alert.alert("Vehicle Company Required", "Please select or enter the vehicle company.");
            return;
        }
        if (!isValidVehicleText(vehicleModel)) {
            Alert.alert("Vehicle Model Required", "Please select or enter the vehicle model.");
            return;
        }
        const year = Number(manufacturingYear);
        if (!Number.isInteger(year) || year < 2000 || year > CURRENT_YEAR) {
            Alert.alert("Invalid Manufacturing Year", "Please select a valid manufacturing year.");
            return;
        }
        if (!REGISTRATION_REGEX.test(registrationNumber)) {
            Alert.alert(
                "Invalid Registration Number",
                "Registration number must contain exactly 10 letters or numbers, for example DL01AB1234."
            );
            return;
        }
        if (!isValidName(sellerName)) {
            Alert.alert("Invalid Name", "Please enter a valid seller name using letters only.");
            return;
        }
        if (!INDIAN_MOBILE_REGEX.test(sellerContact)) {
            Alert.alert("Invalid Mobile Number", "Please enter a valid 10-digit mobile number.");
            return;
        }
        if (!isValidAddress(sellerAddress)) {
            Alert.alert("Invalid Address", "Please enter the complete inspection address.");
            return;
        }
        if (!isValidCityState(city)) {
            Alert.alert("Invalid City", "Please enter a valid city name.");
            return;
        }
        if (!isValidCityState(stateName)) {
            Alert.alert("Invalid State", "Please enter a valid state name.");
            return;
        }
        if (!PIN_REGEX.test(pinCode)) {
            Alert.alert("Invalid PIN Code", "Please enter a valid 6-digit PIN code.");
            return;
        }
        if (isDateInPast(preferredDate)) {
            Alert.alert("Invalid Inspection Date", "Please select today or a future date.");
            return;
        }
        if (!isFutureTimeForDate(preferredDate, preferredTime)) {
            Alert.alert("Invalid Inspection Time", "Please select a future time.");
            return;
        }

        const uid = auth.currentUser?.uid;
        if (!uid) {
            Alert.alert("Not signed in", "Please log in again.");
            return;
        }

        setSubmitting(true);
        try {
            const inspectionRef = await addDoc(collection(db, "inspectionRequests"), {
                userId: uid,
                buyer: {
                    name: collapseSpaces(buyerName),
                    mobile: mobileNumber,
                    email: sanitizeGmail(emailAddress),
                },
                seller: { name: collapseSpaces(sellerName), contact: sellerContact },
                vehicle: {
                    company: collapseSpaces(vehicleCompany),
                    model: collapseSpaces(vehicleModel),
                    year: manufacturingYear,
                    registrationNumber,
                },
                address: collapseSpaces(sellerAddress),
                city: collapseSpaces(city),
                state: collapseSpaces(stateName),
                pin: pinCode,
                landmark: collapseSpaces(landmark),
                preferredDate: formatDisplayDate(preferredDate),
                preferredTime: formatDisplayTime(preferredTime),
                scheduleDate: preferredDate.toISOString(),
                notes: additionalNotes.trim(),
                status: "pending_payment",
                paymentStatus: "pending",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            router.replace({
                pathname: "/inspection/InspectionSummary",
                params: { inspectionId: inspectionRef.id },
            });
        } catch (err: any) {
            console.log(err);
            Alert.alert("Error", "Couldn't submit your request. Please try again.");
        } finally {
            setSubmitting(false);
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

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
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
                            <Text style={styles.headerTitle}>Pre-Owned Vehicle Inspection</Text>
                            <Text style={styles.headerSubtitle}>
                                Book a certified mechanic to inspect a used vehicle before purchasing it.
                            </Text>
                        </View>
                    </View>

                    {/* Illustration */}
                    <View style={styles.illustrationWrap}>
                        <View style={styles.illustrationCircle}>
                            <Text style={styles.illustrationEmoji}>🚗🔍👨🏻‍🔧</Text>
                        </View>
                    </View>

                    {/* Section 1: Buyer Information */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Buyer Information</Text>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Buyer Name</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter buyer's full name"
                                placeholderTextColor="#94A3B8"
                                value={buyerName}
                                onChangeText={(value) => setBuyerName(sanitizeName(value))}
                                maxLength={50}
                            />
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Mobile Number</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="10-digit mobile number"
                                placeholderTextColor="#94A3B8"
                                keyboardType="numeric"
                                value={mobileNumber}
                                onChangeText={(value) => setMobileNumber(sanitizeDigits(value, 10))}
                                maxLength={10}
                            />
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Email Address</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="you@gmail.com"
                                placeholderTextColor="#94A3B8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={emailAddress}
                                onChangeText={(value) => setEmailAddress(sanitizeGmail(value))}
                                maxLength={100}
                            />
                        </View>
                    </View>

                    {/* Section 2: Vehicle Information */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Vehicle Information</Text>

                        <SelectorField
                            fieldKey="vehicleCompany"
                            label="Vehicle Company"
                            placeholder="Select vehicle company"
                            value={vehicleCompany}
                            options={VEHICLE_COMPANIES}
                            onSelect={(company)=>{
                            setVehicleCompany(company);
                            setVehicleModel("");
}}
                        />

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Vehicle Model</Text>
                            <SelectorField
                            fieldKey="vehicleModel"
                            label="Vehicle Model"
                            placeholder="Select Vehicle Model"
                            value={vehicleModel}
                            options={vehicleCompany ? VEHICLE_DATA[vehicleCompany] : []}
                            onSelect={setVehicleModel}
/>
                        </View>

                        <SelectorField
                            fieldKey="manufacturingYear"
                            label="Manufacturing Year"
                            placeholder="Select manufacturing year"
                            value={manufacturingYear}
                            options={MANUFACTURING_YEARS}
                            onSelect={setManufacturingYear}
                        />

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Registration Number</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="DL01AB1234"
                                placeholderTextColor="#94A3B8"
                                autoCapitalize="characters"
                                value={registrationNumber}
                                onChangeText={(value) => setRegistrationNumber(sanitizeRegistration(value))}
                                maxLength={10}
                            />
                        </View>
                    </View>

                    {/* Section 3: Seller Information */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Seller Information</Text>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Seller Name</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter seller's full name"
                                placeholderTextColor="#94A3B8"
                                value={sellerName}
                                onChangeText={(value) => setSellerName(sanitizeName(value))}
                                maxLength={50}
                            />
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Seller Contact Number</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="10-digit mobile number"
                                placeholderTextColor="#94A3B8"
                                keyboardType="numeric"
                                value={sellerContact}
                                onChangeText={(value) => setSellerContact(sanitizeDigits(value, 10))}
                                maxLength={10}
                            />
                        </View>
                    </View>

                    {/* Section 4: Inspection Address */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Inspection Address</Text>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Seller Address</Text>
                            <TextInput
                                style={[styles.textInput, styles.multilineInput]}
                                placeholder="Enter the full address where the vehicle is located"
                                placeholderTextColor="#94A3B8"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                value={sellerAddress}
                                onChangeText={(value) => setSellerAddress(sanitizeAddress(value))}
                                maxLength={200}
                            />
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>City</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter city"
                                placeholderTextColor="#94A3B8"
                                value={city}
                                onChangeText={(value) => setCity(sanitizeCityState(value))}
                                maxLength={50}
                            />
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>State</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter state"
                                placeholderTextColor="#94A3B8"
                                value={stateName}
                                onChangeText={(value) => setStateName(sanitizeCityState(value))}
                                maxLength={50}
                            />
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>PIN Code</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="6-digit PIN code"
                                placeholderTextColor="#94A3B8"
                                keyboardType="numeric"
                                value={pinCode}
                                onChangeText={(value) => setPinCode(sanitizeDigits(value, 6))}
                                maxLength={6}
                            />
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Vehicle Location Landmark</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Near Metro Station"
                                placeholderTextColor="#94A3B8"
                                value={landmark}
                                onChangeText={(value) => setLandmark(sanitizeAddress(value, 100))}
                                maxLength={100}
                            />
                        </View>
                    </View>

                    {/* Section 5: Inspection Schedule */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Inspection Schedule</Text>

                        <DateTimeFields
                            date={preferredDate}
                            time={preferredTime}
                            minimumDate={new Date()}
                            onDateChange={setPreferredDate}
                            onTimeChange={setPreferredTime}
                        />
                    </View>

                    {/* Section 6: Additional Notes */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Additional Notes</Text>

                        <TextInput
                            style={[styles.textInput, styles.multilineInput]}
                            placeholder="Mention any special instructions for the mechanic."
                            placeholderTextColor="#94A3B8"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            value={additionalNotes}
                            onChangeText={(value) => setAdditionalNotes(value.slice(0, 500))}
                            maxLength={500}
                        />
                    </View>

                    {/* Bottom Information Card */}
                    <View style={styles.infoCard}>
                        <Text style={styles.infoIcon}>ℹ️</Text>
                        <Text style={styles.infoText}>
                            Our certified mechanic will visit the seller&apos;s location, inspect the
                            vehicle professionally, and prepare a detailed inspection report including
                            market valuation, accidental history, replaced parts, engine condition,
                            paint quality, and purchase recommendation.
                        </Text>
                    </View>
                </ScrollView>

                {/* Sticky Bottom Button */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={[styles.continueButton, submitting && { opacity: 0.6 }]}
                        activeOpacity={0.85}
                        onPress={handleContinue} 
                        disabled={submitting}
                    >
                        <Text style={styles.continueButtonText}>
                            {submitting ? "Submitting..." : "Continue"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EAF2FF",
  },

  flex: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 36,
  },

  /* Header */

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  backIconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#DCE7F5",

    shadowColor: "#123A7A",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  backIconText: {
    fontSize: 22,
    color: "#123A7A",
    fontWeight: "800",
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
    marginTop: 5,
    lineHeight: 20,
    fontWeight: "500",
  },

  /* Illustration */

  illustrationWrap: {
    alignItems: "center",
    marginBottom: 24,
  },

  illustrationCircle: {
    width: 145,
    height: 145,
    borderRadius: 73,
    backgroundColor: "#123A7A",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#123A7A",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
  },

  illustrationEmoji: {
    fontSize: 48,
  },

  /* Cards */

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#DCE7F5",

    shadowColor: "#173A6A",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 18,
  },

  /* Fields */

  fieldContainer: {
    marginBottom: 18,
  },

  fieldLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 8,
  },

  textInput: {
    backgroundColor: "#F8FBFF",
    borderWidth: 1.5,
    borderColor: "#DCE7F5",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14.5,
    color: "#172033",
  },

  multilineInput: {
    minHeight: 100,
    paddingTop: 14,
  },

  dateInput: {
    flex: 1,
    fontSize: 14,
    color: "#172033",
    padding: 0,
  },

  /* Selector */

  selectorField: {
    backgroundColor: "#F8FBFF",
    borderWidth: 1.5,
    borderColor: "#DCE7F5",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  selectorValueText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#172033",
  },

  selectorPlaceholderText: {
    fontSize: 14,
    color: "#94A3B8",
  },

  selectorArrow: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "800",
  },

  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },

  optionChip: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 13,
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: "#DCE7F5",
  },

  optionChipSelected: {
    backgroundColor: "#123A7A",
    borderColor: "#123A7A",

    shadowColor: "#123A7A",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },

  optionChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#172033",
  },

  optionChipTextSelected: {
    color: "#FFFFFF",
  },

  /* Info */

  infoCard: {
    flexDirection: "row",
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#CFE0F7",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },

  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#1D4ED8",
    fontWeight: "500",
  },

  /* Bottom */

  bottomBar: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
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
    elevation: 12,
  },

  continueButton: {
    minHeight: 58,
    backgroundColor: "#123A7A",
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#123A7A",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.27,
    shadowRadius: 11,
    elevation: 8,
  },

  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.25,
  },
});