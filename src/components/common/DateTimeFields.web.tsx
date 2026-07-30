import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import type { DateTimeFieldsProps } from "./DateTimeFields";

const toDateInput = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toTimeInput = (value: Date): string =>
  `${String(value.getHours()).padStart(2, "0")}:${String(
    value.getMinutes()
  ).padStart(2, "0")}`;

export default function DateTimeFields({
  date,
  time,
  onDateChange,
  onTimeChange,
  minimumDate,
}: DateTimeFieldsProps) {
  const [dateText, setDateText] = useState(toDateInput(date));
  const [timeText, setTimeText] = useState(toTimeInput(time));

  useEffect(() => setDateText(toDateInput(date)), [date]);
  useEffect(() => setTimeText(toTimeInput(time)), [time]);

  const updateDate = (value: string) => {
    const sanitized = value.replace(/[^0-9-]/g, "").slice(0, 10);
    setDateText(sanitized);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(sanitized)) return;
    const parsed = new Date(`${sanitized}T00:00:00`);
    if (
      Number.isNaN(parsed.getTime()) ||
      toDateInput(parsed) !== sanitized ||
      (minimumDate && parsed < new Date(toDateInput(minimumDate)))
    ) {
      return;
    }
    onDateChange(parsed);
  };

  const updateTime = (value: string) => {
    const sanitized = value.replace(/[^0-9:]/g, "").slice(0, 5);
    setTimeText(sanitized);
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(sanitized);
    if (!match) return;
    const parsed = new Date(time);
    parsed.setHours(Number(match[1]), Number(match[2]), 0, 0);
    onTimeChange(parsed);
  };

  return (
    <View style={styles.row}>
      <View style={styles.field}>
        <Text style={styles.label}>Preferred Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={dateText}
          onChangeText={updateDate}
          placeholder="2026-07-30"
          maxLength={10}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Preferred Time (24-hour HH:MM)</Text>
        <TextInput
          style={styles.input}
          value={timeText}
          onChangeText={updateTime}
          placeholder="10:30"
          maxLength={5}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: 12 },
  field: { gap: 7 },
  label: { fontSize: 13, fontWeight: "600", color: "#475569" },
  input: {
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: "#F8FAFC",
    color: "#1F2937",
  },
});
