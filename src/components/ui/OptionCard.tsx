// src/components/ui/OptionCard.tsx
//
// Generic selectable option card. Reused across Battery, Oil, Tyre,
// Car Wash, and Dent & Paint selection screens — everything is passed
// in through props, nothing is hardcoded here.

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface OptionCardProps {
  title: string;
  subtitle: string;
  price: number;
  rating: number;
  recommended: boolean;
  selected: boolean;
  onPress: () => void;
}

const OptionCard: React.FC<OptionCardProps> = ({
  title,
  subtitle,
  price,
  rating,
  recommended,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, selected ? styles.cardSelected : styles.cardUnselected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.leftContent}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {recommended && (
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>Recommended</Text>
            </View>
          )}
        </View>

        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={13} color="#F59E0B" />
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
      </View>

      <View style={styles.rightContent}>
        <Text style={styles.price}>₹{price}</Text>
        <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
          {selected && <View style={styles.radioInner} />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,

    // Shadow (iOS)
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,

    // Shadow (Android)
    elevation: 2,
  },
  cardSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },
  cardUnselected: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  leftContent: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginRight: 8,
  },
  recommendedBadge: {
    backgroundColor: "#16A34A",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
    marginLeft: 4,
  },
  rightContent: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: "#2563EB",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2563EB",
  },
});

export default OptionCard;