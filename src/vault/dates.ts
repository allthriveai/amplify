// ---------------------------------------------------------------------------
// Date helpers
//
// Date keys are YYYY-MM-DD and always represent a LOCAL calendar day.
//
// Two traps this module exists to avoid:
//   - `new Date("2026-08-19")` parses as UTC midnight, which lands on the
//     previous calendar day anywhere west of UTC.
//   - `new Date().toISOString().split("T")[0]` is the UTC day, which rolls over
//     mid-evening in the Americas and files work under tomorrow.
// ---------------------------------------------------------------------------

/** Parse a YYYY-MM-DD key into a Date at local midnight */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Format a Date as a YYYY-MM-DD key in local time */
export function toDateKey(date: Date): string {
  const yyyy = date.getFullYear().toString();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Today's date key in local time */
export function todayKey(): string {
  return toDateKey(new Date());
}

/** The date key N days before `key` */
export function shiftDateKey(key: string, days: number): string {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

/** Whole days from date key `from` to date key `to`. Negative when `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  const ms = parseDateKey(to).getTime() - parseDateKey(from).getTime();
  return Math.round(ms / 86_400_000);
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Format a date using Obsidian-style moment tokens (dddd, MMMM, D, YYYY, ...) */
export function formatDate(date: Date, format: string): string {
  return format.replace(/dddd|ddd|MMMM|MMM|YYYY|YY|MM|DD|D|M/g, (token) => {
    switch (token) {
      case "dddd": return DAY_NAMES[date.getDay()];
      case "ddd": return DAY_NAMES[date.getDay()].slice(0, 3);
      case "MMMM": return MONTH_NAMES[date.getMonth()];
      case "MMM": return MONTH_NAMES[date.getMonth()].slice(0, 3);
      case "YYYY": return date.getFullYear().toString();
      case "YY": return String(date.getFullYear()).slice(-2);
      case "MM": return String(date.getMonth() + 1).padStart(2, "0");
      case "DD": return String(date.getDate()).padStart(2, "0");
      case "D": return String(date.getDate());
      case "M": return String(date.getMonth() + 1);
      default: return token;
    }
  });
}

/**
 * Coerce a frontmatter date into a YYYY-MM-DD key.
 *
 * YAML parses an unquoted `date: 2026-02-23` into a Date at UTC midnight, not a
 * string, even though the type declares string. Reading that Date with local
 * getters yields the previous day west of UTC, so UTC getters are used here.
 * Returns null for anything that is not a usable date.
 */
export function normalizeDateKey(value: unknown): string | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    const yyyy = value.getUTCFullYear().toString();
    const mm = String(value.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(value.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  if (typeof value === "string") {
    const match = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
  }

  return null;
}
