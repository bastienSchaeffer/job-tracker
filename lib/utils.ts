import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge.
 * Merges Tailwind CSS classes intelligently, resolving conflicts.
 * @param inputs - Class names, objects, or arrays to merge
 * @returns Merged class name string
 * @example
 * cn("text-red-500", "text-blue-500") // "text-blue-500"
 * cn("p-4", condition && "mt-2") // "p-4 mt-2" or "p-4"
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/**
 * Formats a salary range for display in USD currency.
 * @param min - Minimum salary (null if not specified)
 * @param max - Maximum salary (null if not specified)
 * @param fallback - Optional fallback string when both values are null
 * @returns Formatted salary string or fallback value
 * @example
 * formatSalary(80000, 120000) // "$80,000 - $120,000"
 * formatSalary(100000, null) // "From $100,000"
 * formatSalary(null, 150000) // "Up to $150,000"
 * formatSalary(null, null, "Not specified") // "Not specified"
 */
export function formatSalary(
  min: number | null,
  max: number | null,
  fallback: string | null = null
): string | null {
  if (!min && !max) return fallback;
  if (min && max) {
    return `${currencyFormatter.format(min)} - ${currencyFormatter.format(max)}`;
  }
  if (min) return `From ${currencyFormatter.format(min)}`;
  if (max) return `Up to ${currencyFormatter.format(max)}`;
  return fallback;
}

/**
 * Date formatting options for display.
 * - "short": Abbreviated format (e.g., "Feb 26, 2026")
 * - "long": Full format with weekday (e.g., "Wednesday, February 26, 2026")
 */
export type DateFormat = "short" | "long";

const dateFormatOptions: Record<DateFormat, Intl.DateTimeFormatOptions> = {
  short: { month: "short", day: "numeric", year: "numeric" },
  long: { weekday: "long", year: "numeric", month: "long", day: "numeric" },
};

/**
 * Formats an ISO date string for display.
 * @param dateString - ISO date string (e.g., "2026-02-26")
 * @param format - Display format ("short" or "long"), defaults to "short"
 * @returns Formatted date string in en-US locale
 * @example
 * formatDate("2026-02-26") // "Feb 26, 2026"
 * formatDate("2026-02-26", "long") // "Wednesday, February 26, 2026"
 */
export function formatDate(dateString: string, format: DateFormat = "short"): string {
  return new Date(dateString).toLocaleDateString("en-US", dateFormatOptions[format]);
}
