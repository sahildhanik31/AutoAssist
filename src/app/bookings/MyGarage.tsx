import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { auth } from "@/firebase/firebaseConfig";
import { db } from "@/firebase/firestore";
import AppBackButton from "@/components/common/AppBackButton";

interface Vehicle {
    id: string;
    company: string;
    model: string;
    registrationNumber: string;
    vehicleType: string;
}

export default function MyGarageScreen() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            async function loadVehicles() {
                const uid = auth.currentUser?.uid;
                if (!uid) return;
                setLoading(true);
                try {
                    const snap = await getDocs(collection(db, "users", uid, "vehicles"));
                    setVehicles(
                        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Vehicle, "id">) }))
                    );
                } catch (err) {
                    console.log(err);
                } finally {
                    setLoading(false);
                }
            }
            loadVehicles();
        }, [])
    );

    async function deleteVehicle(vehicleId: string) {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        try {
            await deleteDoc(doc(db, "users", uid, "vehicles", vehicleId));
            setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
        } catch (err) {
            console.log(err);
            Alert.alert("Error", "Couldn't delete this vehicle.");
        }
    }

    function handleDelete(vehicleId: string) {
        Alert.alert(
            "Remove Vehicle",
            "Are you sure you want to remove this vehicle from My Garage?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: () => void deleteVehicle(vehicleId),
                },
            ]
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <AppBackButton />
                <Text style={styles.headerTitle}>My Garage</Text>
                <View style={{ width: 42 }} />
            </View>

            <FlatList
                data={vehicles}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                ListEmptyComponent={
                    !loading ? <Text style={styles.emptyText}>No vehicles added yet.</Text> : null
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <TouchableOpacity
                            style={{ flex: 1 }}
                            onPress={() =>
                                router.push({
                                    pathname: "/bookings/EditVehicle",
                                    params: {
                                        vehicleId: item.id,
                                        source: "garage",
                                        returnTo: "/bookings/MyGarage",
                                    },
                                })
                            }
                        >
                            <Text style={styles.vehicleName}>{item.company} {item.model}</Text>
                            <Text style={styles.vehicleReg}>{item.registrationNumber}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item.id)}>
                            <Text style={styles.deleteText}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />

            <TouchableOpacity
                style={styles.addButton}
                onPress={() =>
                    router.push({
                        pathname: "/services/VehicleType",
                        params: {
                            onboarding: "false",
                            source: "garage",
                            returnTo: "/bookings/MyGarage",
                        },
                    })
                }
            >
                <Text style={styles.addButtonText}>+ Add Vehicle</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EAF2FF",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: "#EAF2FF",
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#123A7A",
    letterSpacing: 0.2,
  },

  emptyText: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 50,
    fontSize: 14,
    fontWeight: "600",
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DCE7F5",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#DCE7F5",

    shadowColor: "#173A6A",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },

  vehicleName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#172033",
    lineHeight: 22,
  },

  vehicleReg: {
    fontSize: 13,
    color: "#1E5AB6",
    marginTop: 7,
    fontWeight: "700",
    letterSpacing: 0.7,
    backgroundColor: "#EAF2FF",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    overflow: "hidden",
  },

  deleteText: {
    color: "#C62828",
    fontWeight: "800",
    fontSize: 13,
    backgroundColor: "#FFF1F2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    overflow: "hidden",
  },

  addButton: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
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
    elevation: 9,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
});