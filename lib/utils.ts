import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

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

export type DateFormat = "short" | "long";

const dateFormatOptions: Record<DateFormat, Intl.DateTimeFormatOptions> = {
  short: { month: "short", day: "numeric", year: "numeric" },
  long: { weekday: "long", year: "numeric", month: "long", day: "numeric" },
};

export function formatDate(dateString: string, format: DateFormat = "short"): string {
  return new Date(dateString).toLocaleDateString("en-US", dateFormatOptions[format]);
}
