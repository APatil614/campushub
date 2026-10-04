import {
  format,
  formatDistanceToNow,
  isPast,
  isToday,
  isTomorrow,
} from "date-fns";

/**
 * Convert a Motoko `Time.now()` nanosecond bigint into a JS Date.
 * Returns null when the value cannot be represented as a valid date.
 */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a backend timestamp as e.g. "Oct 3, 2026". */
export function formatDate(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  return date ? format(date, "MMM d, yyyy") : "Date unavailable";
}

/** Format a backend timestamp as e.g. "Oct 3, 2026 · 2:30 PM". */
export function formatDateTime(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  return date ? format(date, "MMM d, yyyy · h:mm a") : "Date unavailable";
}

/** Format a backend timestamp as a short "OCT 03" style day badge. */
export function formatDayBadge(timestamp: bigint): {
  day: string;
  month: string;
} {
  const date = timestampToDate(timestamp);
  if (!date) return { day: "--", month: "---" };
  return {
    day: format(date, "dd"),
    month: format(date, "MMM").toUpperCase(),
  };
}

/** Relative time such as "3 days ago" for a backend timestamp. */
export function formatRelative(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  return date ? formatDistanceToNow(date, { addSuffix: true }) : "Unknown time";
}

/** Friendly label for an event start: Today, Tomorrow, or a formatted date. */
export function formatEventWhen(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "Date unavailable";
  if (isToday(date)) return `Today · ${format(date, "h:mm a")}`;
  if (isTomorrow(date)) return `Tomorrow · ${format(date, "h:mm a")}`;
  return format(date, "EEE, MMM d · h:mm a");
}

/** True when a backend timestamp is in the past. */
export function isPastTimestamp(timestamp: bigint): boolean {
  const date = timestampToDate(timestamp);
  return date ? isPast(date) : false;
}

/** Format a "HH:MM" 24h time string as e.g. "9:30 AM". */
export function formatTimeRange(startTime: string, endTime: string): string {
  const to12h = (value: string): string => {
    const [hoursRaw, minutesRaw] = value.split(":");
    const hours = Number(hoursRaw);
    const minutes = Number(minutesRaw);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
    const period = hours >= 12 ? "PM" : "AM";
    const display = hours % 12 === 0 ? 12 : hours % 12;
    return `${display}:${minutes.toString().padStart(2, "0")} ${period}`;
  };
  return `${to12h(startTime)} – ${to12h(endTime)}`;
}

/** Truncate text to a maximum length with an ellipsis. */
export function truncate(text: string, max = 140): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

/** Shorten a principal string for display. */
export function shortPrincipal(principal: string): string {
  if (principal.length <= 12) return principal;
  return `${principal.slice(0, 5)}…${principal.slice(-4)}`;
}
