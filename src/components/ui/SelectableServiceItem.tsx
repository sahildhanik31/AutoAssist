import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { ServiceItem } from "../../types/service";

interface SelectableServiceItemProps {
  item: ServiceItem;
  selected: boolean;
  onToggle: (item: ServiceItem) => void;
}

const Colors = {
  accent: "#2563EB",
  accentLight: "#EFF6FF",
  surface: "#F8FAFC",
  border: "#E2E8F0",
  textDark: "#0F172A",
  textMuted: "#64748B",
  success: "#059669",
  successBg: "#ECFDF5",
  successBorder: "#BBF7D0",
  white: "#FFFFFF",
};

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

const SelectableServiceItem: React.FC<SelectableServiceItemProps> = ({
  item,
  selected,
  onToggle,
}) => {
  const progress = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: selected ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [selected]);

  const handlePress = () => {
    if (item.mandatory) return;

    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.96,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    onToggle(item);
  };

  const cardBackground = item.mandatory
    ? Colors.successBg
    : progress.interpolate({
        inputRange: [0, 1],
        outputRange: [Colors.surface, Colors.accentLight],
      });

  const borderColor = item.mandatory
    ? Colors.successBorder
    : progress.interpolate({
        inputRange: [0, 1],
        outputRange: ["transparent", Colors.accent],
      });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: cardBackground,
          borderColor,
          transform: [{ scale }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={item.mandatory ? 1 : 0.75}
        onPress={handlePress}
        style={styles.touchArea}
      >
        <View style={styles.left}>
          <View
            style={[
              styles.checkbox,
              item.mandatory && styles.mandatoryCheckbox,
              selected && !item.mandatory && styles.selectedCheckbox,
            ]}
          >
            {(item.mandatory || selected) && (
              <Text style={styles.tick}>✓</Text>
            )}
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </View>

        <View style={styles.right}>
          {item.mandatory ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Included</Text>
            </View>
          ) : (
            <>
              <View
                style={[
                  styles.badge,
                  selected ? styles.addedBadge : styles.optionalBadge,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    selected
                      ? styles.addedText
                      : styles.optionalText,
                  ]}
                >
                  {selected ? "Added" : "Optional"}
                </Text>
              </View>

              <Text style={styles.price}>
                +{formatCurrency(item.price)}
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default SelectableServiceItem;

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1.5,
    marginBottom: 12,
    elevation: 2,
  },
  touchArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
  },
  left: {
    flexDirection: "row",
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  mandatoryCheckbox: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  selectedCheckbox: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  tick: {
    color: "#fff",
    fontWeight: "700",
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
  },
  description: {
    marginTop: 3,
    fontSize: 12,
    color: Colors.textMuted,
  },
  right: {
    alignItems: "flex-end",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeText: {
    fontWeight: "700",
    fontSize: 11,
  },
  optionalBadge: {
    backgroundColor: "#F1F5F9",
  },
  optionalText: {
    color: Colors.textMuted,
  },
  addedBadge: {
    backgroundColor: Colors.successBg,
  },
  addedText: {
    color: Colors.success,
  },
  price: {
    marginTop: 6,
    fontWeight: "700",
    color: Colors.textDark,
  },
});