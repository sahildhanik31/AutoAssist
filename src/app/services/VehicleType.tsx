import { router, useLocalSearchParams } from "expo-router";
import {
    
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function VehicleTypeScreen() {
    const params = useLocalSearchParams<{
        onboarding?: string;
        source?: string;
        returnTo?: string;
    }>();

    function handleFourWheeler() {
router.push({
  pathname: "/bookings/VehicleSelection",
  params: {
    vehicleType: "four",
    onboarding: params.onboarding ?? "false",
    source: params.source ?? "garage",
    returnTo: params.returnTo ?? "/bookings/MyGarage",
  },
});    }

    function handleTwoWheeler() {
router.push({
  pathname: "/bookings/VehicleSelection",
  params: {
    vehicleType: "two",
    onboarding: params.onboarding ?? "false",
    source: params.source ?? "garage",
    returnTo: params.returnTo ?? "/bookings/MyGarage",
  },
});    }

   function handleBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(
      (params.returnTo ?? "/bookings/MyGarage") as never
    );
  }
}

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.card}>

                    <View style={styles.headerIcon}>
                        <Text style={styles.headerIconText}>🚘</Text>
                    </View>

                    <Text style={styles.heading}>
                        Choose Your Vehicle
                    </Text>

                    <Text style={styles.subtitle}>
                        Select the type of vehicle you want assistance for.
                    </Text>

                    <TouchableOpacity
                        style={styles.selectionCard}
                        activeOpacity={0.7}
                        onPress={handleFourWheeler}
                    >

                        <Text style={styles.icon}>🚗</Text>

                        <Text style={styles.selectionTitle}>
                            Four Wheeler
                        </Text>

                        <Text style={styles.selectionDescription}>
                            Cars, SUVs, Vans
                        </Text>

                        <Text style={styles.cardArrow}>
                            Tap to Continue →
                        </Text>

                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.selectionCard}
                        activeOpacity={0.7}
                        onPress={handleTwoWheeler}
                    >

                        <Text style={styles.icon}>🏍</Text>

                        <Text style={styles.selectionTitle}>
                            Two Wheeler
                        </Text>

                        <Text style={styles.selectionDescription}>
                            Bike, Scooter, Sports Bike
                        </Text>

                        <Text style={styles.cardArrow}>
                            Tap to Continue →
                        </Text>

                    </TouchableOpacity>

                    <View style={styles.infoBox}>

                        <Text style={styles.infoIcon}>
                            ℹ️
                        </Text>

                        <Text style={styles.infoText}>
                            You can change your vehicle anytime from your profile.
                        </Text>

                    </View>

                </View>

                <TouchableOpacity
                    style={styles.backButton}
                    activeOpacity={0.7}
                    onPress={handleBack}
                >
                    <Text style={styles.backButtonText}>
                        ← Back
                    </Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    safeArea: {
    flex: 1,
    backgroundColor: "#d0e7ff",
},

scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
},

card: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    borderRadius: 22,
    paddingVertical: 35,
    paddingHorizontal: 25,
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,

    elevation: 6,
},

headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#1e3a8a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
},

headerIconText: {
    fontSize: 34,
},

heading: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1e3a8a",
    textAlign: "center",
    marginBottom: 8,
},

subtitle: {
    fontSize: 14,
    color: "#777777",
    textAlign: "center",
    marginBottom: 28,
    paddingHorizontal: 8,
},

selectionCard: {
    width: "100%",
    backgroundColor: "#eef5ff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#c9defb",
    paddingVertical: 24,
    paddingHorizontal: 15,
    alignItems: "center",
    marginBottom: 18,

    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,

    elevation: 3,
},

icon: {
    fontSize: 46,
    marginBottom: 10,
},

selectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 5,
},

selectionDescription: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
},
cardArrow: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "600",
    color: "#1e3a8a",
},

infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    backgroundColor: "#eef2f9",
    borderRadius: 14,
    padding: 15,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#1e3a8a",
},

infoIcon: {
    fontSize: 18,
    marginRight: 10,
},

infoText: {
    flex: 1,
    fontSize: 13,
    color: "#555555",
    lineHeight: 20,
},

backButton: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#f8fbff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e3a8a",
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 22,

    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,

    elevation: 2,
},

backButtonText: {
    color: "#1e3a8a",
    fontSize: 16,
    fontWeight: "bold",
},
});
