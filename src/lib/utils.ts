import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes with proper conflict resolution.
 * Example: cn("px-2 py-1 bg-red-500", "bg-blue-500") -> "px-2 py-1 bg-blue-500"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date for display (e.g., "Mon, Jan 1")
 * Uses the user's browser locale for consistent formatting.
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

/**
 * Generates an array of dates for a given month and year.
 * Useful for building the grid headers.
 */
export function getDaysInMonth(year: number, month: number): Date[] {
  const date = new Date(year, month, 1);
  const days: Date[] = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}
