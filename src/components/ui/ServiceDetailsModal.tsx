import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Service, ServiceItem } from "../../types/service";
import SelectableServiceItem from "./SelectableServiceItem";
interface ServiceDetailsModalProps {
    visible: boolean;
    service: Service | null;
    onClose: () => void;
    onBook: (service: Service) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({
  visible,
  service,
  onClose,
  onBook,
}) => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [selectedItems, setSelectedItems] = React.useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [ visible, fadeAnim, slideAnim]);
  useEffect(() => {
    if (!service) return;

    const initial: Record<string, boolean> = {};

    service.serviceItems.forEach((item) => {
        initial[item.id] = item.mandatory
            ? true
            : item.defaultSelected;
    });

    setSelectedItems(initial);
}, [service]);

  if (!service) return null;

  const hasDiscount =
    !!service.originalPrice && service.originalPrice > service.price;

  const discountPercent = hasDiscount
    ? Math.round(
        ((service.originalPrice! - service.price) / service.originalPrice!) *
          100
      )
    : 0;
const handleToggle = (item: ServiceItem) => {
    if (item.mandatory) return;

    setSelectedItems((prev) => ({
        ...prev,
        [item.id]: !prev[item.id],
    }));
};

const includedItems = service.serviceItems.filter(
    (item) => item.mandatory
);

const optionalItems = service.serviceItems.filter(
    (item) => !item.mandatory
);

const selectedUpgradesTotal = optionalItems.reduce((sum, item) => {
    return selectedItems[item.id]
        ? sum + item.price
        : sum;
}, 0);

const estimatedTotal =
    service.price + selectedUpgradesTotal;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.handle} />

        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Image
            source={{ uri: service.image }}
            style={styles.image}
            resizeMode="cover"
          />

          <View style={styles.headerRow}>
            <Text style={styles.title}>{service.title}</Text>
            {!!service.rating && (
              <View style={styles.ratingPill}>
                <Text style={styles.ratingText}>★ {service.rating}</Text>
              </View>
            )}
          </View>

          {!!service.reviews && (
            <Text style={styles.reviewsText}>
              {service.reviews.toLocaleString()} reviews
            </Text>
          )}

          <Text style={styles.description}>{service.description}</Text>

          <View style={styles.metaRow}>
            {!!service.duration && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Duration</Text>
                <Text style={styles.metaValue}>{service.duration}</Text>
              </View>
            )}
            {!!service.warranty && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Warranty</Text>
                <Text style={styles.metaValue}>{service.warranty}</Text>
              </View>
            )}
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{service.price}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>
                ₹{service.originalPrice}
              </Text>
            )}
            {hasDiscount && (
              <View style={styles.discountPill}>
                <Text style={styles.discountText}>
                  {discountPercent}% OFF
                </Text>
              </View>
            )}
          </View>

        {/* Included Services */}

<View style={styles.section}>
  <Text style={styles.sectionTitle}>Included in this Package</Text>

  {includedItems.map((item) => (
    <SelectableServiceItem
      key={item.id}
      item={item}
      selected={true}
      onToggle={handleToggle}
    />
  ))}
</View>

{/* Optional Upgrades */}

{optionalItems.length > 0 && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Optional Upgrades</Text>

    {optionalItems.map((item) => (
      <SelectableServiceItem
        key={item.id}
        item={item}
        selected={selectedItems[item.id]}
        onToggle={handleToggle}
      />
    ))}
  </View>
)}

<View style={styles.section}>
  <Text style={styles.sectionTitle}>Estimated Total</Text>

  <Text
    style={{
      fontSize: 28,
      fontWeight: "800",
      color: "#2563EB",
      marginTop: 8,
    }}
  >
    ₹{estimatedTotal}
  </Text>
</View>

<View style={styles.scrollSpacer} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.bookButton}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: "/services/Customization",
                params: {
                  serviceId: service.id,
                },
              })
            }
          >
            <Text style={styles.bookButtonText}>
              Book Service · ₹{estimatedTotal}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default ServiceDetailsModal;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.88,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E2E8F0",
    marginTop: 10,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#334155",
    fontWeight: "600",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
},
  image: {
    width: "100%",
    height: 200,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginRight: 10,
  },
  ratingPill: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  reviewsText: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 4,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#475569",
    marginTop: 14,
  },
  metaRow: {
    flexDirection: "row",
    marginTop: 18,
    gap: 12,
  },
  metaItem: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  metaLabel: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },
  originalPrice: {
    fontSize: 16,
    color: "#94A3B8",
    textDecorationLine: "line-through",
  },
  discountPill: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  discountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#059669",
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },
  checklistRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  includedIcon: {
    color: "#16A34A",
    fontSize: 18,
  },
  excludedIcon: {
    color: "#DC2626",
    fontSize: 18,
  },
  checklistLabel: {
    marginLeft: 10,
    fontSize: 15,
    color: "#222222",
    flexShrink: 1,
  },
  scrollSpacer: {
    height: 90,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  bookButton: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});