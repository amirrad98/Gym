export const muscleGroupOptions = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
  "Full Body",
  "Cardio",
  "Mobility",
];

export const effortOptions = [
  { value: "light", label: "Light" },
  { value: "steady", label: "Steady" },
  { value: "hard", label: "Hard" },
] as const;

export const goalCategoryOptions = [
  { value: "strength", label: "Strength" },
  { value: "weight", label: "Body weight" },
  { value: "habit", label: "Habit" },
  { value: "endurance", label: "Endurance" },
  { value: "other", label: "Other" },
] as const;

export const numberFormatter = new Intl.NumberFormat("en-US");

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function getDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function shiftDateKey(dateKey: string, offset: number) {
  const shifted = parseDateKey(dateKey);
  shifted.setDate(shifted.getDate() + offset);
  return getDateKey(shifted);
}

export function formatLongDate(dateKey: string) {
  return longDateFormatter.format(parseDateKey(dateKey));
}

export function formatShortDate(dateKey: string) {
  return shortDateFormatter.format(parseDateKey(dateKey));
}

export function formatWeight(weightKg?: number | null) {
  if (weightKg === undefined || weightKg === null) return "Bodyweight";
  return `${weightKg} kg`;
}

export function formatMetricValue(value: number | null, suffix = "") {
  if (value === null) return "--";
  return `${numberFormatter.format(Number(value.toFixed(1)))}${suffix}`;
}

export function toOptionalNumber(rawValue: string) {
  const trimmed = rawValue.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function toRequiredNumber(rawValue: string, label: string) {
  const parsed = toOptionalNumber(rawValue);
  if (parsed === undefined) throw new Error(`${label} is required.`);
  return parsed;
}

export function toOptionalString(rawValue: string) {
  const trimmed = rawValue.trim();
  return trimmed ? trimmed : undefined;
}

export function createLocalId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
