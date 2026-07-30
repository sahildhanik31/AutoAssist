// src/data/serviceCategories.ts
//
// High-level service categories used to group items from services.ts
// on the Home / Browse Services screens. Every entry in services.ts
// should reference one of these categories via its own category field.

import { ServiceCategory } from "../types/service";

export const serviceCategories: ServiceCategory[] = [
  {
    id: "maintenance",
    title: "Maintenance",
    description: "General service, oil change, and periodic checkups to keep your car running smoothly.",
    iconName: "settings-outline",
    color: "#2563EB",
    displayOrder: 1,
  },
  {
    id: "cleaning",
    title: "Cleaning",
    description: "Car wash, interior and exterior detailing, and ceramic coating packages.",
    iconName: "sparkles-outline",
    color: "#0EA5E9",
    displayOrder: 2,
  },
  {
    id: "tyre_care",
    title: "Tyre Care",
    description: "Tyre replacement, rotation, wheel alignment, and balancing.",
    iconName: "disc-outline",
    color: "#334155",
    displayOrder: 3,
  },
  {
    id: "battery",
    title: "Battery",
    description: "Battery testing, replacement, and jump start assistance.",
    iconName: "battery-charging-outline",
    color: "#F59E0B",
    displayOrder: 4,
  },
  {
    id: "body_care",
    title: "Body Care",
    description: "Dent removal, panel painting, and full body respray services.",
    iconName: "color-palette-outline",
    color: "#DC2626",
    displayOrder: 5,
  },
  {
    id: "ac_care",
    title: "AC Care",
    description: "AC gas top-up, cooling coil cleaning, and full AC servicing.",
    iconName: "snow-outline",
    color: "#06B6D4",
    displayOrder: 6,
  },
  {
    id: "repair",
    title: "Repair",
    description: "Brake, suspension, clutch, and other mechanical repairs.",
    iconName: "construct-outline",
    color: "#7C3AED",
    displayOrder: 7,
  },
  {
    id: "roadside_assistance",
    title: "Roadside Assistance",
    description: "On-demand help for breakdowns, flat tyres, and emergencies.",
    iconName: "car-outline",
    color: "#16A34A",
    displayOrder: 8,
  },
];