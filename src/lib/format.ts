export function inr(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);
}

export function discountPercent(mrp: number | string, price: number | string) {
  const m = Number(mrp);
  const p = Number(price);
  if (!m || m <= p) return 0;
  return Math.round(((m - p) / m) * 100);
}

export function formatDateIST(value: string | Date | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

export function formatDayIST(value: string | Date | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isValidPincode(value: string) {
  return /^[1-9][0-9]{5}$/.test(value.trim());
}

export function isValidIndianPhone(value: string) {
  return /^[6-9][0-9]{9}$/.test(value.replace(/\s|-|\+91/g, "").trim());
}
