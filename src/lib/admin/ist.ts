const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Start of an IST calendar day, returned as a UTC Date usable in queries. */
export function istDayStart(daysAgo = 0): Date {
  const nowIst = new Date(Date.now() + IST_OFFSET_MS);
  nowIst.setUTCHours(0, 0, 0, 0);
  nowIst.setUTCDate(nowIst.getUTCDate() - daysAgo);
  return new Date(nowIst.getTime() - IST_OFFSET_MS);
}

export function istDayKey(value: string | Date): string {
  const d = new Date(value);
  return new Date(d.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

export function istDayLabel(key: string): string {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", timeZone: "UTC" }).format(
    new Date(`${key}T00:00:00Z`),
  );
}
