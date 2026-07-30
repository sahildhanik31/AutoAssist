// VehicleDetails.tsx
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "@/firebase/firebaseConfig";
import { db } from "@/firebase/firestore";
import AppBackButton from "@/components/common/AppBackButton";

export default function VehicleDetailsScreen() {
    const {
    vehicleId,
    company,
    model,
    vehicleType,
    registrationNumber,
    fuelType,
    transmission,
    odometer,
    year,
    onboarding,
    source,
    returnTo,
} = useLocalSearchParams<{
        company?: string;
        model?: string;
        vehicleType?: string;
        registrationNumber?: string;
        fuelType?: string;
        transmission?: string;
        odometer?: string;
        year?: string;
        vehicleId?: string;
        onboarding?: string;
        source?: string;
        returnTo?: string;
    }>()

    const [loadedVehicle, setLoadedVehicle] = useState<{
        company?: string;
        model?: string;
        vehicleType?: string;
        registrationNumber?: string;
        fuelType?: string;
        transmission?: string;
        odometer?: string;
        year?: string;
    } | null>(null);
    const [loading, setLoading] = useState(Boolean(vehicleId && (!company || !model)));
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!vehicleId || (company && model)) return;

        async function loadVehicle() {
            const uid = auth.currentUser?.uid;
            if (!uid || !vehicleId) {
                setLoading(false);
                return;
            }
            try {
                const snap = await getDoc(doc(db, "users", uid, "vehicles", vehicleId));
                if (!snap.exists()) {
                    Alert.alert(
                        "Vehicle Not Found",
                        "This vehicle could not be found. Please select a vehicle again.",
                        [{ text: "OK", onPress: () => router.replace("/bookings/VehicleSelection") }]
                    );
                    return;
                }
                setLoadedVehicle(snap.data());
            } catch {
                Alert.alert("Unable to Load Vehicle", "Please try again.");
            } finally {
                setLoading(false);
            }
        }

        loadVehicle();
    }, [vehicleId, company, model]);

    const details = {
        company: company ?? loadedVehicle?.company ?? "",
        model: model ?? loadedVehicle?.model ?? "",
        vehicleType: vehicleType ?? loadedVehicle?.vehicleType ?? "four",
        registrationNumber:
            registrationNumber ?? loadedVehicle?.registrationNumber ?? "",
        fuelType: fuelType ?? loadedVehicle?.fuelType ?? "",
        transmission: transmission ?? loadedVehicle?.transmission ?? "",
        odometer: odometer ?? loadedVehicle?.odometer ?? "",
        year: year ?? loadedVehicle?.year ?? "",
    };

    const goToDestination = () => {
        if (returnTo === "/bookings/MyGarage" || source === "garage") {
            router.replace("/bookings/MyGarage");
        } else {
            if (onboarding === "true" || source === "onboarding") {
                router.dismissAll();
            }
            router.replace("/tabs/HomeScreen");
        }
    };

    async function handleContinue() {
        if (saving) return;
        if (vehicleId) {
            goToDestination();
            return;
        }
        if (!details.company || !details.model) {
            Alert.alert(
                "Vehicle Details Missing",
                "Please select a company and model before continuing."
            );
            return;
        }

        const uid = auth.currentUser?.uid;
        if (!uid) {
            Alert.alert("Not signed in", "Please log in again.");
            return;
        }

        setSaving(true);
        try {
            await addDoc(collection(db, "users", uid, "vehicles"), {
                company: details.company,
                model: details.model,
                vehicleType: details.vehicleType,
                registrationNumber: details.registrationNumber,
                fuelType: details.fuelType,
                transmission: details.transmission,
                year: details.year,
                odometer: details.odometer,
                hasInsurance: false,
                hasPuc: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            goToDestination();
        } catch {
            Alert.alert("Error", "Couldn't save the vehicle. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <View style={[styles.safeArea, styles.loadingState]}>
                <ActivityIndicator size="large" color="#1e3a8a" />
                <Text style={styles.loadingText}>Loading vehicle details...</Text>
            </View>
        );
    }

    return (
        <View style={styles.safeArea}>
           <ScrollView contentContainerStyle={styles.scrollContent}>
  <AppBackButton fallbackRoute="/bookings/MyGarage" />

  <Text style={styles.title}>Vehicle Details</Text>

                <View style={styles.card}>
                    <Row label="Vehicle Type" value={details.vehicleType === "two" || details.vehicleType === "Two Wheeler" ? "Two Wheeler" : "Four Wheeler"} />
                    <Row label="Company" value={details.company || "--"} />
                    <Row label="Model" value={details.model || "--"} />
                    <Row label="Registration" value={details.registrationNumber || "Not added"} />
                    <Row label="Fuel Type" value={details.fuelType || "Not added"} />
                    <Row label="Transmission" value={details.transmission || "Not added"} />
                    <Row label="Odometer" value={details.odometer ? `${details.odometer} km` : "Not added"} />
                    <Row label="Manufacturing Year" value={details.year || "Not added"} last />
                </View>

                <TouchableOpacity
  style={styles.editButton}
  onPress={() =>
    router.push({
      pathname: "/bookings/EditVehicle",
      params: {
        vehicleId,
        ...details,
        onboarding: onboarding ?? "false",
        source: source ?? "vehicle-details",
        returnTo: returnTo ?? "/tabs/HomeScreen",
      },
    })
  }
>
                    <Text style={styles.editButtonText}>Edit Vehicle</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleContinue}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.continueButtonText}>Continue</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

function Row({
    label,
    value,
    last = false,
}: {
    label: string;
    value: string;
    last?: boolean;
}) {
    return (
        <View style={[styles.row, last && { borderBottomWidth: 0 }]}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EAF2FF",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#123A7A",
    marginBottom: 22,
    letterSpacing: 0.2,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginBottom: 22,
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

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#E6EDF5",
    gap: 18,
  },

  label: {
    flex: 1,
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },

  value: {
    flex: 1,
    color: "#172033",
    fontSize: 14.5,
    fontWeight: "800",
    textAlign: "right",
    lineHeight: 20,
  },

  editButton: {
    minHeight: 56,
    borderWidth: 1.5,
    borderColor: "#2563EB",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginBottom: 14,

    shadowColor: "#123A7A",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  editButtonText: {
    color: "#1D4ED8",
    fontWeight: "800",
    fontSize: 16,
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

  continueButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.3,
  },

  loadingState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 14,
    color: "#123A7A",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
  },
});