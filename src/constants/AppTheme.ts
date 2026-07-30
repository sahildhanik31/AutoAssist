// AppTheme.ts
// Simple, beginner-friendly design system for the AutoAssist app.
// This file only exports plain constants (colors, spacing, radius, fonts).
// It does NOT change any logic, navigation, or Firebase code anywhere in the app.

export const Colors = {
  // Brand
  primary: "#1e3a8a", // main blue used across buttons, headers, links
  primaryDark: "#152a63",
  primaryLight: "#e7edfb",

  // Backgrounds
  background: "#f4f6fb", // light app background
  surface: "#ffffff", // card / input background

  // Text
  textPrimary: "#1a1a1a",
  textSecondary: "#60646c",
  textMuted: "#9aa0a8",
  textOnPrimary: "#ffffff",

  // Borders
  border: "#e2e5eb",
  borderFocused: "#1e3a8a",

  // Status
  success: "#1a8a4c",
  successLight: "#e6f6ec",
  error: "#d92d20",
  errorLight: "#fdeceb",
  warning: "#b7791f",
  warningLight: "#fdf3e0",

  // Misc
  white: "#ffffff",
  black: "#000000",
  overlay: "rgba(0,0,0,0.45)",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
};

export const FontSize = {
  xs: 12,
  sm: 13,
  base: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 26,
};

export const FontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semiBold: "600" as const,
  bold: "700" as const,
};

// Standard heights used for inputs and buttons across the app
export const ControlHeight = {
  input: 48,
  button: 50,
};

// One shared shadow style. Works with `elevation` on Android
// and `shadowColor` / `shadowOpacity` etc. on iOS.
export const CardShadow = {
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 3,
};