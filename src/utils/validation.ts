export const GMAIL_REGEX = /^[A-Z0-9._%+-]+@gmail\.com$/i;
export const NAME_REGEX = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
export const VEHICLE_TEXT_REGEX = /^(?=.*[A-Za-z0-9])[A-Za-z0-9 &().-]{2,50}$/;
export const REGISTRATION_REGEX = /^[A-Z0-9]{10}$/;
export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;
export const PIN_REGEX = /^[1-9]\d{5}$/;
export const UPI_REGEX = /^[A-Za-z0-9._-]{2,}@[A-Za-z0-9]{2,}$/;

export const collapseSpaces = (value: string): string =>
  value.trim().replace(/\s+/g, " ");

export const sanitizeName = (value: string): string =>
  value.replace(/[^A-Za-z '-]/g, "").replace(/\s{2,}/g, " ").slice(0, 50);

export const isValidName = (value: string): boolean => {
  const normalized = collapseSpaces(value);
  return normalized.length >= 2 && normalized.length <= 50 && NAME_REGEX.test(normalized);
};

export const sanitizeGmail = (value: string): string =>
  value.replace(/\s/g, "").toLowerCase().slice(0, 100);

export const isValidGmail = (value: string): boolean =>
  GMAIL_REGEX.test(value.trim());

export const isStrongPassword = (value: string): boolean =>
  value.length >= 8 &&
  value.length <= 64 &&
  value.trim() === value &&
  /[A-Z]/.test(value) &&
  /[a-z]/.test(value) &&
  /\d/.test(value) &&
  /[^A-Za-z0-9]/.test(value);

export const sanitizeRegistration = (value: string): string =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);

export const sanitizeDigits = (value: string, maxLength: number): string =>
  value.replace(/\D/g, "").slice(0, maxLength);

export const sanitizeVehicleText = (value: string): string =>
  value.replace(/[^A-Za-z0-9 &().-]/g, "").replace(/\s{2,}/g, " ").slice(0, 50);

export const isValidVehicleText = (value: string): boolean =>
  VEHICLE_TEXT_REGEX.test(collapseSpaces(value));

export const sanitizeCityState = (value: string): string =>
  value.replace(/[^A-Za-z -]/g, "").replace(/\s{2,}/g, " ").slice(0, 50);

export const isValidCityState = (value: string): boolean => {
  const normalized = collapseSpaces(value);
  return (
    normalized.length >= 2 &&
    normalized.length <= 50 &&
    /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/.test(normalized)
  );
};

export const sanitizeAddress = (value: string, maxLength = 200): string =>
  value.replace(/[^A-Za-z0-9 ,/().#'-]/g, "").slice(0, maxLength);

export const isValidAddress = (value: string): boolean => {
  const normalized = collapseSpaces(value);
  return (
    normalized.length >= 10 &&
    normalized.length <= 200 &&
    /[A-Za-z0-9]/.test(normalized)
  );
};

export const isValidOdometer = (value: string): boolean =>
  /^\d{1,7}$/.test(value) && Number(value) <= 9_999_999;

export const isValidUpiId = (value: string): boolean =>
  value.length <= 100 && !/\s/.test(value) && UPI_REGEX.test(value);

export const passesLuhn = (cardNumber: string): boolean => {
  let sum = 0;
  let doubleDigit = false;

  for (let index = cardNumber.length - 1; index >= 0; index -= 1) {
    let digit = Number(cardNumber[index]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }

  return sum % 10 === 0;
};

export const isFutureExpiry = (value: string, now = new Date()): boolean => {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  return year > now.getFullYear() ||
    (year === now.getFullYear() && month >= now.getMonth() + 1);
};

export const atStartOfDay = (value: Date): Date => {
  const result = new Date(value);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const isToday = (value: Date, now = new Date()): boolean =>
  atStartOfDay(value).getTime() === atStartOfDay(now).getTime();

export const isDateInPast = (value: Date, now = new Date()): boolean =>
  atStartOfDay(value).getTime() < atStartOfDay(now).getTime();

export const isFutureTimeForDate = (
  date: Date,
  time: Date,
  now = new Date()
): boolean => {
  if (!isToday(date, now)) return true;
  const selected = new Date(date);
  selected.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return selected.getTime() > now.getTime();
};

export const formatDisplayDate = (value: Date): string =>
  value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const formatDisplayTime = (value: Date): string =>
  value.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
