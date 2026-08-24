export type TimeRangeFilter = "TODAY" | "48H" | "ALL";

/**
 * Filter function to determine whether a given ISO date string falls within the selected TimeRangeFilter.
 * - "TODAY": Current calendar day starting at 00:00:00 local time.
 * - "48H": Rolling 48-hour window from current timestamp.
 * - "ALL": Complete local dataset.
 */
export function isWithinTimeRange(isoDateString: string, filter: TimeRangeFilter): boolean {
  if (filter === "ALL") return true;

  const signalDate = new Date(isoDateString);
  const now = new Date();

  if (filter === "TODAY") {
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    return signalDate >= todayStart;
  }

  if (filter === "48H") {
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    return signalDate >= fortyEightHoursAgo;
  }

  return true;
}
