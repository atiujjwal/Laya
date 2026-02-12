import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, subDays, isSameDay } from 'date-fns';

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



type Log = {
  date: string | Date;
  completed: boolean;
  status?: string;
};

export const getMaxContinuousStreakLast30Days = (logs: Log[] = []): number => {
  // 1. Guard Clause: No logs = 0 streak
  if (!logs || logs.length === 0) return 0;

  // 2. Extract all "Completed" dates into a Set of 'YYYY-MM-DD' strings
  // This removes time components and duplicate entries for the same day
  const completedDates = new Set<string>();
  
  logs.forEach((log) => {
    if (log.completed === true || log.status === 'COMPLETED') {
      // Ensure we use local time parsing to match the user's calendar view
      const dateObj = new Date(log.date); 
      const dateStr = format(dateObj, 'yyyy-MM-dd');
      completedDates.add(dateStr);
    }
  });

  // 3. Determine the Anchor Date (Where do we start counting backwards?)
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  
  const yesterday = subDays(today, 1);
  const yesterdayStr = format(yesterday, 'yyyy-MM-dd');

  let currentCheckDate: Date;

  // Logic: 
  // If I did it Today -> Streak is alive, start counting from Today.
  // If I haven't done it Today, but did it Yesterday -> Streak is still alive, start from Yesterday.
  // If neither -> Streak is broken (0).
  if (completedDates.has(todayStr)) {
    currentCheckDate = today;
  } else if (completedDates.has(yesterdayStr)) {
    currentCheckDate = yesterday;
  } else {
    return 0; 
  }

  // 4. Count Backwards (Max 30 days)
  let streak = 0;
  
  for (let i = 0; i < 30; i++) {
    // Generate the date string for (Anchor - i)
    const checkDate = subDays(currentCheckDate, i);
    const checkStr = format(checkDate, 'yyyy-MM-dd');

    if (completedDates.has(checkStr)) {
      streak++;
    } else {
      // The moment we find a gap, the continuous streak ends.
      break; 
    }
  }

  return streak;
};