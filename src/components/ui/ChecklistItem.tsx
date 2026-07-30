// src/components/ui/ChecklistItem.tsx
//
// Single row used to render "included" / "excluded" lists on service and
// option detail screens (e.g. what's included in a Car Wash package).

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ChecklistItemProps {
  title: string;
  included: boolean;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ title, included }) => {
  return (
    <View style={styles.row}>
      <Ionicons
        name={included ? "checkmark-circle" : "close-circle"}
        size={18}
        color={included ? "#16A34A" : "#DC2626"}
        style={styles.icon}
      />
      <Text style={[styles.text, included ? styles.textIncluded : styles.textExcluded]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontSize: 14,
    flexShrink: 1,
  },
  textIncluded: {
    color: "#16A34A",
    fontWeight: "600",
  },
  textExcluded: {
    color: "#DC2626",
    fontWeight: "600",
  },
});

export default ChecklistItem;