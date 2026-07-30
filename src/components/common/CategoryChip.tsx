// src/components/common/CategoryChip.tsx
//
// Reusable chip used to display a ServiceCategory (icon + title).
// Fully driven by props — no hardcoded category data lives in this file.

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ServiceCategory } from "../../types/service";

interface CategoryChipProps {
  category: ServiceCategory;
  selected: boolean;
  onPress: () => void;
}

const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        selected ? styles.chipSelected : styles.chipUnselected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Ionicons
          name={category.iconName as any}
          size={20}
          color={selected ? "#FFFFFF" : "#1E293B"}
          style={styles.icon}
        />

        <Text
          style={[
            styles.title,
            selected ? styles.titleSelected : styles.titleUnselected,
          ]}
        >
          {category.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    paddingVertical: 10,
    paddingHorizontal: 16,

    marginRight: 10,
    borderRadius: 24,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,

    elevation: 2,
  },

  chipSelected: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
    borderWidth: 1,
  },

  chipUnselected: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderWidth: 1,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    marginRight: 8,
  },

  title: {
    fontSize: 14,
    fontWeight: "600",
  },

  titleSelected: {
    color: "#FFFFFF",
  },

  titleUnselected: {
    color: "#1E293B",
  },
});

export default CategoryChip;