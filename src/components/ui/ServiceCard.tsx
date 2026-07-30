// src/components/ui/ServiceCard.tsx
//
// Displays a single service (Oil Change, General Service, Car Wash, etc.)
// inside BookServiceScreen. Fully driven by the `service` prop — no
// hardcoded service data lives here.

import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Service } from "../../types/service";

interface ServiceCardProps {
  service: Service;
  onPress: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onPress }) => {
  // Calculate discount percentage only when an original price is available.
 const originalPrice = service.originalPrice;

const hasDiscount =
  originalPrice !== undefined &&
  originalPrice > service.price;

const discountPercent =
  hasDiscount && originalPrice !== undefined
    ? Math.round(((originalPrice - service.price) / originalPrice) * 100)
    : 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Image + badges */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: service.image }} style={styles.image} resizeMode="contain" />

        <View style={styles.badgeRow}>
          {service.recommended && (
            <View style={[styles.badge, styles.recommendedBadge]}>
              <Text style={styles.badgeText}>Recommended</Text>
            </View>
          )}
          {service.popular && (
            <View style={[styles.badge, styles.popularBadge]}>
              <Text style={styles.badgeText}>Popular</Text>
            </View>
          )}
        </View>

        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercent}% OFF</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {service.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {service.description}
        </Text>

        {/* Rating + reviews */}
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.ratingText}>{service.rating}</Text>
          <Text style={styles.reviewsText}>({service.reviews} reviews)</Text>
        </View>

        {/* Duration + warranty */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#64748B" />
            <Text style={styles.metaText}>{service.duration}</Text>
          </View>
          {service.warranty && (
            <View style={styles.metaItem}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#64748B" />
              <Text style={styles.metaText}>{service.warranty}</Text>
            </View>
          )}
        </View>

        {/* Price row */}
        <View style={styles.priceRow}>
          <View style={styles.priceGroup}>
            <Text style={styles.price}>₹{service.price}</Text>
            {hasDiscount && <Text style={styles.originalPrice}>₹{service.originalPrice}</Text>}
          </View>

          <TouchableOpacity style={styles.bookButton} onPress={onPress} activeOpacity={0.8}>
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginBottom: 16,
    overflow: "hidden",

    // Shadow (iOS)
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,

    // Shadow (Android)
    elevation: 3,
  },
  imageWrapper: {
    width: "100%",
    height: 160,
    backgroundColor: "#E2E8F0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badgeRow: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  recommendedBadge: {
    backgroundColor: "#16A34A",
  },
  popularBadge: {
    backgroundColor: "#F59E0B",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  discountBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#DC2626",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: "#94A3B8",
    marginLeft: 4,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceGroup: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: "#94A3B8",
    textDecorationLine: "line-through",
  },
  bookButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default ServiceCard;