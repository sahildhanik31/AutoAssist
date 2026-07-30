// Select Workshop Screen
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AppBackButton from "@/components/common/AppBackButton";
import {
  parseBookingDraft,
  serializeBookingDraft,
} from "../../types/workflow";
interface Workshop {
  id: string;
  name: string;
  image: string;
  rating: number;
  distanceKm: number;
  address: string;
  isOpen: boolean;
  availableSlots: string[];
  homePickupAvailable: boolean;
  freePickup: boolean;
}

// Realistic mock workshop data.
const WORKSHOPS: Workshop[] = [
  {
    id: "ws-001",
    name: "AutoAssist Service Hub",
    image: "https://images.unsplash.com/photo-1632823469850-2f77dd9c7f93",
    rating: 4.9,
    distanceKm: 1.4,
    address: "Sector 9, Rohini, New Delhi",
    isOpen: true,
    availableSlots: ["10:00 AM", "12:30 PM", "4:00 PM"],
    homePickupAvailable: true,
    freePickup: true,
  },
  {
    id: "ws-002",
    name: "Bosch Car Service",
    image: "https://images.unsplash.com/photo-1625047509168-a7026f36de04",
    rating: 4.8,
    distanceKm: 2.3,
    address: "Karol Bagh, New Delhi",
    isOpen: true,
    availableSlots: ["9:30 AM", "1:00 PM", "5:00 PM"],
    homePickupAvailable: true,
    freePickup: false,
  },
  {
    id: "ws-003",
    name: "Mahindra First Choice",
    image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc",
    rating: 4.8,
    distanceKm: 3.1,
    address: "Pitampura, New Delhi",
    isOpen: true,
    availableSlots: ["11:00 AM", "2:00 PM", "6:00 PM"],
    homePickupAvailable: true,
    freePickup: true,
  },
  {
    id: "ws-004",
    name: "GoMechanic Workshop",
    image: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98",
    rating: 4.7,
    distanceKm: 4.6,
    address: "Janakpuri, New Delhi",
    isOpen: true,
    availableSlots: ["10:30 AM", "3:30 PM"],
    homePickupAvailable: true,
    freePickup: false,
  },
  {
    id: "ws-005",
    name: "Carnation Auto India",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7",
    rating: 4.7,
    distanceKm: 5.2,
    address: "Lajpat Nagar, New Delhi",
    isOpen: true,
    availableSlots: ["9:00 AM", "12:00 PM", "4:30 PM"],
    homePickupAvailable: false,
    freePickup: false,
  },
  {
    id: "ws-006",
    name: "MyTVS Car Care",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
    rating: 4.8,
    distanceKm: 6.0,
    address: "Dwarka Sector 12, New Delhi",
    isOpen: true,
    availableSlots: ["10:00 AM", "1:30 PM", "5:30 PM"],
    homePickupAvailable: true,
    freePickup: true,
  },
  {
    id: "ws-007",
    name: "Bosch Car Service CP",
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a",
    rating: 4.9,
    distanceKm: 7.2,
    address: "Connaught Place, New Delhi",
    isOpen: true,
    availableSlots: ["11:30 AM", "2:30 PM"],
    homePickupAvailable: false,
    freePickup: false,
  },
  {
    id: "ws-008",
    name: "Mahindra First Choice",
    image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
    rating: 4.6,
    distanceKm: 8.5,
    address: "Paschim Vihar, New Delhi",
    isOpen: false,
    availableSlots: ["Tomorrow 10 AM", "Tomorrow 3 PM"],
    homePickupAvailable: true,
    freePickup: false,
  },
];

const SelectWorkshopScreen: React.FC = () => {
  const router = useRouter();
const { booking } = useLocalSearchParams<{ booking?: string }>();
  const bookingDraft = parseBookingDraft(booking);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(
    null
  );

  const filteredWorkshops = useMemo(() => {
    return WORKSHOPS.filter((workshop) =>
      workshop.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
  }, [searchQuery]);

  const selectedWorkshop = WORKSHOPS.find(
  (workshop) => workshop.id === selectedWorkshopId
);

const handleContinue = () => {
  if (!bookingDraft) {
    Alert.alert(
      "Booking Details Missing",
      "Your service details could not be loaded. Please choose the service again.",
      [{ text: "OK", onPress: () => router.replace("/bookings/BookService") }]
    );
    return;
  }
  if (!selectedWorkshop) {
    Alert.alert("Workshop Required", "Please select a workshop to continue.");
    return;
  }

  const nextDraft = {
    ...bookingDraft,
    workshop: {
      id: selectedWorkshop.id,
      name: selectedWorkshop.name,
      address: selectedWorkshop.address,
      distanceKm: selectedWorkshop.distanceKm,
    },
  };

  router.push({
    pathname: "/offers/OffersRewards",
    params: {
      from: "booking",
      booking: serializeBookingDraft(nextDraft),
    },
  });
};

  const renderWorkshopCard = ({ item }: { item: Workshop }) => {
    const isSelected = item.id === selectedWorkshopId;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => setSelectedWorkshopId(item.id)}
      >
        <Image source={{ uri: item.image }} style={styles.cardImage} />

        <View style={styles.cardBody}>
          {/* Name + rating */}
          <View style={styles.cardTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.workshopName} numberOfLines={1}>
                {item.name}
              </Text>
              {isSelected && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>✓ Selected</Text>
                </View>
              )}
            </View>
            <View style={styles.ratingPill}>
              <Text style={styles.ratingText}>★ {item.rating}</Text>
            </View>
          </View>

          {/* Address */}
          <Text style={styles.address} numberOfLines={2}>
            {item.address}
          </Text>

          {/* Distance + open status */}
          <View style={styles.metaRow}>
            <Text style={styles.distanceText}>{item.distanceKm} km away</Text>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: item.isOpen ? "#22C55E" : "#EF4444" },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: item.isOpen ? "#16A34A" : "#DC2626" },
              ]}
            >
              {item.isOpen ? "Open Now" : "Closed"}
            </Text>
          </View>

          {/* Badges */}
          <View style={styles.badgeRow}>
            {item.freePickup && (
              <View style={styles.badgeFree}>
                <Text style={styles.badgeFreeText}>Free Pickup</Text>
              </View>
            )}
            {item.homePickupAvailable && (
              <View style={styles.badgePickup}>
                <Text style={styles.badgePickupText}>Home Pickup</Text>
              </View>
            )}
          </View>

          {/* Available slots */}
          <View style={styles.slotsRow}>
            {item.availableSlots.slice(0, 3).map((slot) => (
              <View key={slot} style={styles.slotChip}>
                <Text style={styles.slotChipText}>{slot}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/*Selected Service Card*/}
      <View style={styles.selectedServiceCard}>
    <Text style={styles.selectedServiceTitle}>
        Selected Service
    </Text>

    <Text style={styles.selectedServiceName}>
        {bookingDraft?.serviceTitle ?? "Service details unavailable"}
    </Text>

    <Text style={styles.selectedServiceSubtitle}>
        Choose your preferred workshop below
    </Text>
</View>

      {/* Header */}
      <View style={styles.header}>
  <AppBackButton fallbackRoute="/services/Customization" />

  <Text style={styles.headerTitle}>Select Workshop</Text>

  <Text style={styles.headerSubtitle}>
    Choose a workshop near you to continue
  </Text>
</View>

      {/* Search + Sort + Filter Row */}
      <View style={styles.toolsRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by workshop or area"
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Workshop List */}
      <FlatList
        data={filteredWorkshops}
        keyExtractor={(item) => item.id}
        renderItem={renderWorkshopCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Fixed Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedWorkshopId && styles.continueButtonDisabled,
          ]}
          activeOpacity={0.85}
          disabled={!selectedWorkshopId}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue to Offers & Rewards →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SelectWorkshopScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF2FF",
  },

  mapPlaceholder: {
    height: 160,
    backgroundColor: "#DCE7F5",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#C9D8E8",
  },

  mapPlaceholderText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#123A7A",
  },

  mapPlaceholderSubtext: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 5,
    fontWeight: "500",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: "#123A7A",
    letterSpacing: 0.2,
  },

  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 5,
    lineHeight: 20,
    fontWeight: "500",
  },

  selectedServiceCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 4,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#CFE0F7",

    shadowColor: "#123A7A",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },

  selectedServiceTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  selectedServiceName: {
    marginTop: 7,
    fontSize: 20,
    fontWeight: "900",
    color: "#172033",
    lineHeight: 26,
  },

  selectedServiceSubtitle: {
    marginTop: 7,
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    fontWeight: "500",
  },

  toolsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 17,
    gap: 10,
  },

  searchInput: {
    flex: 1,
    minHeight: 54,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 17,
    paddingVertical: 13,
    fontSize: 14.5,
    fontWeight: "500",
    color: "#172033",
    borderWidth: 1,
    borderColor: "#D7E2F0",

    shadowColor: "#123A7A",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  toolButton: {
    minHeight: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D7E2F0",
  },

  toolButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 125,
    gap: 18,
  },

  card: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#DCE7F5",
    overflow: "hidden",

    shadowColor: "#173A6A",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.11,
    shadowRadius: 14,
    elevation: 6,
  },

  cardSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#F8FBFF",

    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 15,
    elevation: 8,
  },

  cardImage: {
    width: "100%",
    height: 145,
    backgroundColor: "#E2E8F0",
  },

  cardBody: {
    paddingHorizontal: 17,
    paddingTop: 16,
    paddingBottom: 17,
  },

  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  workshopName: {
    flex: 1,
    fontSize: 17.5,
    fontWeight: "800",
    color: "#172033",
    marginRight: 10,
    lineHeight: 23,
  },

  selectedBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 7,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },

  selectedBadgeText: {
    color: "#15803D",
    fontSize: 11,
    fontWeight: "800",
  },

  ratingPill: {
    backgroundColor: "#FFF7D6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },

  ratingText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#A16207",
  },

  address: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 8,
    lineHeight: 19,
    fontWeight: "500",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
  },

  distanceText: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "700",
    marginRight: 8,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  statusText: {
    fontSize: 12.5,
    fontWeight: "800",
  },

  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 13,
  },

  badgeFree: {
    backgroundColor: "#ECFDF5",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },

  badgeFreeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#047857",
  },

  badgePickup: {
    backgroundColor: "#EEF5FF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#CFE0F7",
  },

  badgePickupText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1D4ED8",
  },

  slotsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },

  slotChip: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#DCE7F5",
  },

  slotChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingTop: 15,
    paddingBottom: 25,
    backgroundColor: "#FFFFFF",
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

  continueButton: {
    minHeight: 58,
    backgroundColor: "#123A7A",
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
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

  continueButtonDisabled: {
    backgroundColor: "#A8B5C8",
    borderColor: "#A8B5C8",
    shadowOpacity: 0,
    elevation: 0,
  },

  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    fontWeight: "800",
    letterSpacing: 0.2,
    textAlign: "center",
  },
});