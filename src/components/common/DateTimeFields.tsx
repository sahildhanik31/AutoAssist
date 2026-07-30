import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  formatDisplayDate,
  formatDisplayTime,
} from "@/utils/validation";

export interface DateTimeFieldsProps {
  date: Date;
  time: Date;
  onDateChange: (value: Date) => void;
  onTimeChange: (value: Date) => void;
  minimumDate?: Date;
}

export default function DateTimeFields({
  date,
  time,
  onDateChange,
  onTimeChange,
  minimumDate,
}: DateTimeFieldsProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, value?: Date) => {
    setShowDatePicker(false);
    if (event.type !== "dismissed" && value) onDateChange(value);
  };

  const handleTimeChange = (event: DateTimePickerEvent, value?: Date) => {
    setShowTimePicker(false);
    if (event.type !== "dismissed" && value) onTimeChange(value);
  };

  return (
    <View style={styles.row}>
      <View style={styles.field}>
        <Text style={styles.label}>Preferred Date</Text>
        <Pressable style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.value}>📅 {formatDisplayDate(date)}</Text>
        </Pressable>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Preferred Time</Text>
        <Pressable style={styles.input} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.value}>🕒 {formatDisplayTime(time)}</Text>
        </Pressable>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          minimumDate={minimumDate}
          onChange={handleDateChange}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 12,
  },
  field: {
    gap: 7,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: "#F8FAFC",
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
});
