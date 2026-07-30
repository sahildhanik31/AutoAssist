//Homescreen
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    
    ScrollView,
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, getDoc, getDocs, limit, orderBy, query, doc } from "firebase/firestore";
import { auth } from "@/firebase/firebaseConfig";
import { db } from "@/firebase/firestore";

const vehicleImage =
  "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcR_1TMtldnqlDMLcYyWVIMw-aP5Z3QjXp0vTUUPAQnay1Pe6FOW";

const inspectionBanner =
"https://cdn-icons-png.flaticon.com/512/854/854894.png";


const icons = {
  bookService:
    "https://cdn-icons-png.flaticon.com/512/3063/3063822.png",

  membership:
    "https://cdn-icons-png.flaticon.com/512/2919/2919592.png",

  payment:
    "https://cdn-icons-png.flaticon.com/512/3135/3135706.png",

  roadside:
    "https://cdn-icons-png.flaticon.com/512/854/854878.png",

  notification:
    "https://cdn-icons-png.flaticon.com/512/1827/1827392.png",

  home:
    "https://cdn-icons-png.flaticon.com/512/1946/1946436.png",

  vehicle:
    "https://cdn-icons-png.flaticon.com/512/741/741407.png",

  profile:
    "https://cdn-icons-png.flaticon.com/512/1077/1077114.png",

  service:
    "https://cdn-icons-png.flaticon.com/512/3063/3063822.png",
};

export default function HomeScreen() {
    const [name, setName] = useState(auth.currentUser?.displayName ?? "");
    const [vehicle, setVehicle] = useState<{
        id: string;
        company: string;
        model: string;
        vehicleType: string;
        registrationNumber?: string;
        fuelType?: string;
        transmission?: string;
        odometer?: string;
        year?: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    useFocusEffect(
        useCallback(() => {
            let active = true;

            async function loadHomeData() {
                const uid = auth.currentUser?.uid;
                if (!uid) {
                    if (active) {
                        setLoading(false);
                        router.replace("/auth/Login");
                    }
                    return;
                }

                setLoading(true);
                setLoadError("");
                try {
                    const [profileSnap, vehicleSnap] = await Promise.all([
                        getDoc(doc(db, "users", uid)),
                        getDocs(
                            query(
                                collection(db, "users", uid, "vehicles"),
                                orderBy("createdAt", "desc"),
                                limit(1)
                            )
                        ),
                    ]);

                    if (!active) return;
                    const profileName = profileSnap.exists()
                        ? profileSnap.data().name
                        : undefined;
                    setName(
                        profileName ||
                            auth.currentUser?.displayName ||
                            auth.currentUser?.email?.split("@")[0] ||
                            "Driver"
                    );

                    if (vehicleSnap.empty) {
                        setVehicle(null);
                    } else {
                        const first = vehicleSnap.docs[0];
                        const data = first.data();
                        setVehicle({
                            id: first.id,
                            company: data.company ?? "",
                            model: data.model ?? "",
                            vehicleType: data.vehicleType ?? "four",
                            registrationNumber: data.registrationNumber ?? "",
                            fuelType: data.fuelType ?? "",
                            transmission: data.transmission ?? "",
                            odometer: data.odometer ?? "",
                            year: data.year ?? "",
                        });
                    }
                } catch {
                    if (active) {
                        setLoadError("We couldn't load your saved vehicle.");
                    }
                } finally {
                    if (active) setLoading(false);
                }
            }

            void loadHomeData();
            return () => {
                active = false;
            };
        }, [])
    );

    const openVehicleSelection = () =>
        router.push({
            pathname: "/bookings/VehicleSelection",
            params: {
                vehicleType: "four",
                onboarding: "false",
                source: "bottom-nav",
                returnTo: "/tabs/HomeScreen",
            },
        });

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerIcon} />

                    <Text style={styles.headerTitle}>AutoAssist</Text>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => router.push("/tabs/NotificationScreen")}
                    >
                        <Image
                            source={{ uri: icons.notification }}
                            style={styles.headerIcon}
                        />
                    </TouchableOpacity>
                </View>

                {/* Greeting Section */}
                <View style={styles.greetingSection}>
                    <Text style={styles.greetingText}>Hello, {name || "Driver"}</Text>
                    <Text style={styles.greetingSubtext}>Welcome back to AutoAssist</Text>
                </View>

                {/* Vehicle Card */}
                {loading ? (
                    <View style={[styles.vehicleCard, styles.vehicleLoading]}>
                        <ActivityIndicator size="large" color="#1e3a8a" />
                        <Text style={styles.loadingText}>Loading your garage...</Text>
                    </View>
                ) : vehicle ? (
                <View style={styles.vehicleCard}>
                    <Image
                        source={{ uri: vehicleImage }}
                        style={styles.vehicleImage}
                    />

                    <View style={styles.vehicleInfoRow}>
                        <View style={styles.vehicleInfoBlock}>
                            <Text style={styles.vehicleLabel}>Company</Text>
                            <Text style={styles.vehicleValue}>{vehicle.company}</Text>
                        </View>

                        <View style={styles.vehicleInfoBlock}>
                            <Text style={styles.vehicleLabel}>Model</Text>
                            <Text style={styles.vehicleValue}>{vehicle.model}</Text>
                        </View>

                        <View style={styles.vehicleInfoBlock}>
                            <Text style={styles.vehicleLabel}>Vehicle Type</Text>
                            <Text style={styles.vehicleValue}>
                                {vehicle.vehicleType === "two" || vehicle.vehicleType === "Two Wheeler"
                                    ? "Two Wheeler"
                                    : "Four Wheeler"}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.viewDetailsButton}
                        activeOpacity={0.8}
                        onPress={() =>
                            router.push({
                                pathname: "/bookings/VehicleDetails",
                                params: {
                                    vehicleId: vehicle.id,
                                    company: vehicle.company,
                                    model: vehicle.model,
                                    vehicleType: vehicle.vehicleType,
                                    registrationNumber: vehicle.registrationNumber ?? "",
                                    fuelType: vehicle.fuelType ?? "",
                                    transmission: vehicle.transmission ?? "",
                                    odometer: vehicle.odometer ?? "",
                                    year: vehicle.year ?? "",
                                    source: "home",
                                    returnTo: "/tabs/HomeScreen",
                                },
                            })
                        }
                    >
                        <Text style={styles.viewDetailsText}>
                            View Details
                        </Text>
                    </TouchableOpacity>
                </View>
                ) : (
                    <View style={styles.vehicleCard}>
                        <Text style={styles.emptyVehicleTitle}>No vehicle added yet</Text>
                        <Text style={styles.emptyVehicleText}>
                            Add your vehicle to get personalised service recommendations.
                        </Text>
                        {!!loadError && <Text style={styles.loadError}>{loadError}</Text>}
                        <TouchableOpacity
                            style={styles.viewDetailsButton}
                            onPress={openVehicleSelection}
                        >
                            <Text style={styles.viewDetailsText}>Add Vehicle</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Quick Actions */}
                <Text style={styles.sectionHeading}>Quick Actions</Text>

                <View style={styles.quickActionsGrid}>
                    <TouchableOpacity
                        style={styles.quickActionCard}
                        activeOpacity={0.8}
                        onPress={() => router.push("/bookings/BookService")}
                    >
                        <Image
                            source={{ uri: icons.bookService }}
                            style={styles.quickActionIcon}
                        />
                        <Text style={styles.quickActionText}>Book Service</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionCard}
                        activeOpacity={0.8}
                        onPress={() => router.push("/services/Membership")}
                    >
                        <Image
                            source={{ uri: icons.membership }}
                            style={styles.quickActionIcon}
                        />
                        <Text style={styles.quickActionText}>Membership</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
    style={styles.quickActionCard}
    activeOpacity={0.8}
    onPress={() =>
        router.push({
            pathname: "/inspection/InspectionRequest",
            params: {
                from: "home",
            },
        })
    }
>
    <Image
        source={{ uri: inspectionBanner }}
        style={styles.quickActionIcon}
    />
    <Text style={styles.quickActionText}>
        Pre-Owned Vehicle Inspection
    </Text>
</TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionCard}
                        activeOpacity={0.8}
                        onPress={() =>
                            Alert.alert(
                                "Coming Soon",
                                "Roadside assistance services will be available soon."
                            )
                        }>
                        <Image
                            source={{ uri: icons.roadside }}
                            style={styles.quickActionIcon}
                        />
                        <Text style={styles.quickActionText}>Roadside</Text>
                    </TouchableOpacity>
                </View>

                {/* Upcoming Service */}
                <Text style={styles.sectionHeading}>Upcoming Service</Text>

                <View style={styles.upcomingCard}>
                    <Text style={styles.upcomingTitle}>General Service</Text>
                    <Text style={styles.upcomingDate}>25 July 2026</Text>

                    <TouchableOpacity
                        style={styles.upcomingButton}
                        activeOpacity={0.8}
                        onPress={() => router.push("/bookings/BookService")}
                    >
                        <Text style={styles.upcomingButtonText}>View Details</Text>
                    </TouchableOpacity>
                </View>

                {/* Special Offers Banner */}
                <TouchableOpacity
        style={styles.offerBanner}
  activeOpacity={0.8}
  onPress={() => router.push("/inspection/InspectionRequest")}
>
  <Image
    source={{ uri: inspectionBanner }}
    style={styles.offerImage}
  />

  <Text style={styles.offerTitle}>
    Pre-Owned Vehicle Inspection
</Text>

<Text style={styles.offerSubtitle}>
    Book a certified mechanic to inspect a used vehicle before purchase.
</Text>
</TouchableOpacity>
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navButton} activeOpacity={0.7}
                    onPress={() => router.replace("/tabs/HomeScreen")}>
                    <Image
                        source={{ uri: icons.home }}
                        style={styles.navIcon}
                    />
                    <Text style={styles.navTextActive}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navButton} activeOpacity={0.7}
                    onPress={() => router.push("/bookings/BookService")}>
                    <Image
                        source={{ uri: icons.service }}
                        style={styles.navIcon}
                    />
                    <Text style={styles.navText}>Service</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navButton} activeOpacity={0.7}
                    onPress={openVehicleSelection}>
                    <Image
                        source={{ uri: icons.vehicle }}
                        style={styles.navIcon}
                    />
                    <Text style={styles.navText}>Vehicle</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navButton} activeOpacity={0.7}
                    onPress={() => router.push("/tabs/ProfileScreen")}>
                    <Image
                        source={{ uri: icons.profile }}
                        style={styles.navIcon}
                    />
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

// const styles = StyleSheet.create({
//     safeArea: {
//         flex: 1,
//         backgroundColor: "#d0e7ff",
//     },
//     scrollView: {
//         flex: 1,
//     },
//     scrollContent: {
//         paddingTop: 6,
//         paddingBottom: 20,
//     },

//     // Header
//     header: {
//         flexDirection: "row",
//         alignItems: "center",
//         justifyContent: "space-between",
//         paddingHorizontal: 20,
//         paddingTop: 10,
//         paddingBottom: 16,
//     },
//     headerIcon: {
//         width: 24,
//         height: 24,
//         resizeMode: "contain",
//     },
//     headerTitle: {
//         fontSize: 20,
//         fontWeight: "bold",
//         color: "#1e3a8a",
//     },

//     // Greeting Section
//     greetingSection: {
//         paddingHorizontal: 20,
//         marginBottom: 20,
//     },
//     greetingText: {
//         fontSize: 22,
//         fontWeight: "bold",
//         color: "#1e3a8a",
//         marginBottom: 4,
//     },
//     greetingSubtext: {
//         fontSize: 14,
//         color: "#555555",
//     },

//     // Vehicle Card
//     vehicleCard: {
//         backgroundColor: "#ffffff",
//         borderRadius: 20,
//         padding: 18,
//         marginHorizontal: 20,
//         marginBottom: 26,

//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.12,
//         shadowRadius: 8,
//         elevation: 5,
//     },
// vehicleImage: {
//   width: "100%",
//   height: 180,
//   resizeMode: "contain",
//   marginBottom: 16,
// },
//     vehicleLoading: {
//         alignItems: "center",
//         justifyContent: "center",
//         minHeight: 180,
//     },
//     loadingText: {
//         marginTop: 10,
//         color: "#64748B",
//         fontWeight: "600",
//     },
//     emptyVehicleTitle: {
//         fontSize: 18,
//         fontWeight: "700",
//         color: "#1e3a8a",
//         marginBottom: 6,
//     },
//     emptyVehicleText: {
//         color: "#64748B",
//         lineHeight: 20,
//         marginBottom: 14,
//     },
//     loadError: {
//         color: "#dc2626",
//         marginBottom: 12,
//     },
//     vehicleInfoRow: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         marginBottom: 18,
//     },
//     vehicleInfoBlock: {
//         flex: 1,
//     },
//     vehicleLabel: {
//         fontSize: 12,
//         color: "#888888",
//         marginBottom: 4,
//     },
//     vehicleValue: {
//         fontSize: 15,
//         fontWeight: "bold",
//         color: "#222222",
//     },
//     viewDetailsButton: {
//         backgroundColor: "#1e3a8a",
//         borderRadius: 12,
//         paddingVertical: 13,
//         alignItems: "center",
//     },
//     viewDetailsText: {
//         color: "#ffffff",
//         fontSize: 15,
//         fontWeight: "bold",
//     },

//     // Section Heading (Quick Actions / Upcoming Service)
//     sectionHeading: {
//         fontSize: 17,
//         fontWeight: "bold",
//         color: "#1e3a8a",
//         marginHorizontal: 20,
//         marginBottom: 14,
//     },

//     // Quick Actions
//     quickActionsGrid: {
//         flexDirection: "row",
//         flexWrap: "wrap",
//         justifyContent: "space-between",
//         paddingHorizontal: 20,
//         marginBottom: 26,
//     },
//     quickActionCard: {
//         width: "47%",
//         backgroundColor: "#ffffff",
//         borderRadius: 16,
//         paddingVertical: 20,
//         alignItems: "center",
//         marginBottom: 14,

//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 3 },
//         shadowOpacity: 0.1,
//         shadowRadius: 6,
//         elevation: 3,
//     },
//     quickActionIcon: {
//         width: 32,
//         height: 32,
//         marginBottom: 10,
//         resizeMode: "contain",
//     },
//     quickActionText: {
//         fontSize: 13,
//         fontWeight: "600",
//         color: "#333333",
//         textAlign: "center",
//     },

//     // Upcoming Service
//     upcomingCard: {
//         backgroundColor: "#ffffff",
//         borderRadius: 16,
//         padding: 18,
//         marginHorizontal: 20,
//         marginBottom: 26,

//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 3 },
//         shadowOpacity: 0.1,
//         shadowRadius: 6,
//         elevation: 3,
//     },
//     upcomingTitle: {
//         fontSize: 16,
//         fontWeight: "bold",
//         color: "#222222",
//         marginBottom: 4,
//     },
//     upcomingDate: {
//         fontSize: 13,
//         color: "#777777",
//         marginBottom: 14,
//     },
//     upcomingButton: {
//         borderWidth: 1.5,
//         borderColor: "#1e3a8a",
//         borderRadius: 10,
//         paddingVertical: 11,
//         alignItems: "center",
//     },
//     upcomingButtonText: {
//         color: "#1e3a8a",
//         fontSize: 14,
//         fontWeight: "bold",
//     },

//     // Special Offers Banner
//     offerBanner: {
//   backgroundColor: "#1e3a8a",
//   borderRadius: 18,
//   paddingVertical: 20,
//   alignItems: "center",
//   marginHorizontal: 20,
//   marginBottom: 10,

//   shadowColor: "#000",
//   shadowOffset: { width: 0, height: 4 },
//   shadowOpacity: 0.15,
//   shadowRadius: 8,
//   elevation: 5,
// },
// offerImage: {
//   width: 100,
//   height: 100,
//   resizeMode: "contain",
//   marginBottom: 10,
// },
//     offerTitle: {
//         fontSize: 26,
//         fontWeight: "bold",
//         color: "#ffffff",
//         marginBottom: 6,
//     },
//     offerSubtitle: {
//         fontSize: 14,
//         color: "#d0e7ff",
//         fontWeight: "600",
//     },

//     // Bottom Navigation
//     bottomNav: {
//         flexDirection: "row",
//         justifyContent: "space-around",
//         alignItems: "center",
//         backgroundColor: "#ffffff",
//         paddingVertical: 12,
//         borderTopWidth: 1,
//         borderTopColor: "#e2e8f0",

//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: -2 },
//         shadowOpacity: 0.06,
//         shadowRadius: 6,
//         elevation: 6,
//     },
//     navButton: {
//         alignItems: "center",
//     },
//     navIcon: {
//         width: 22,
//         height: 22,
//         marginBottom: 4,
//         resizeMode: "contain",
//     },
//     navText: {
//         fontSize: 11,
//         color: "#888888",
//     },
//     navTextActive: {
//         fontSize: 11,
//         color: "#1e3a8a",
//         fontWeight: "bold",
//     },
// });


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f4f6fb",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 6,
        paddingBottom: 24,
    },

    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16,
    },
    headerIcon: {
        width: 24,
        height: 24,
        resizeMode: "contain",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1e3a8a",
    },

    // Greeting Section
    greetingSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    greetingText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1e3a8a",
        marginBottom: 4,
    },
    greetingSubtext: {
        fontSize: 14,
        color: "#60646c",
    },

    // Vehicle Card
    vehicleCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 18,
        marginHorizontal: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#e2e5eb",

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    vehicleImage: {
        width: "100%",
        height: 180,
        resizeMode: "contain",
        marginBottom: 16,
    },
    vehicleLoading: {
        alignItems: "center",
        justifyContent: "center",
        minHeight: 180,
    },
    loadingText: {
        marginTop: 10,
        color: "#60646c",
        fontWeight: "600",
    },
    emptyVehicleTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1e3a8a",
        marginBottom: 6,
    },
    emptyVehicleText: {
        color: "#60646c",
        lineHeight: 20,
        marginBottom: 14,
    },
    loadError: {
        color: "#d92d20",
        marginBottom: 12,
    },
    vehicleInfoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 18,
    },
    vehicleInfoBlock: {
        flex: 1,
    },
    vehicleLabel: {
        fontSize: 12,
        color: "#9aa0a8",
        marginBottom: 4,
    },
    vehicleValue: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#1a1a1a",
    },
    viewDetailsButton: {
        backgroundColor: "#1e3a8a",
        borderRadius: 12,
        paddingVertical: 13,
        alignItems: "center",
    },
    viewDetailsText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "bold",
    },

    // Section Heading (Quick Actions / Upcoming Service)
    sectionHeading: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#1e3a8a",
        marginHorizontal: 20,
        marginBottom: 14,
    },

    // Quick Actions
    quickActionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    quickActionCard: {
        width: "47%",
        backgroundColor: "#ffffff",
        borderRadius: 16,
        paddingVertical: 20,
        alignItems: "center",
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#e2e5eb",

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    quickActionIcon: {
        width: 32,
        height: 32,
        marginBottom: 10,
        resizeMode: "contain",
    },
    quickActionText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#1a1a1a",
        textAlign: "center",
    },

    // Upcoming Service
    upcomingCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 18,
        marginHorizontal: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#e2e5eb",

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    upcomingTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 4,
    },
    upcomingDate: {
        fontSize: 13,
        color: "#60646c",
        marginBottom: 14,
    },
    upcomingButton: {
        borderWidth: 1.5,
        borderColor: "#1e3a8a",
        borderRadius: 10,
        paddingVertical: 11,
        alignItems: "center",
    },
    upcomingButtonText: {
        color: "#1e3a8a",
        fontSize: 14,
        fontWeight: "bold",
    },

    // Special Offers Banner
    offerBanner: {
        backgroundColor: "#1e3a8a",
        borderRadius: 18,
        paddingVertical: 20,
        alignItems: "center",
        marginHorizontal: 20,
        marginBottom: 10,

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    offerImage: {
        width: 100,
        height: 100,
        resizeMode: "contain",
        marginBottom: 10,
    },
    offerTitle: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#ffffff",
        marginBottom: 6,
    },
    offerSubtitle: {
        fontSize: 14,
        color: "#d0e7ff",
        fontWeight: "600",
    },

    // Bottom Navigation
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#ffffff",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#e2e5eb",

        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 6,
    },
    navButton: {
        alignItems: "center",
    },
    navIcon: {
        width: 22,
        height: 22,
        marginBottom: 4,
        resizeMode: "contain",
    },
    navText: {
        fontSize: 11,
        color: "#9aa0a8",
    },
    navTextActive: {
        fontSize: 11,
        color: "#1e3a8a",
        fontWeight: "bold",
    },
});