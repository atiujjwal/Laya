// types/habit.ts

export interface HabitsResponse {
  data: Habit[];
}

export interface HabitLog {
  date: string; // ISO Date "2026-01-22"
  status: 'completed' | 'skipped' | 'failed';
  note?: string;
}

export interface Habit {
  id: string;
  title: string;
  category: string; // e.g., "Health", "Productivity"
  frequency: 'daily' | 'weekly';
  goalCount: number; // e.g., 20 times per month
  logs: HabitLog[];
  streak: number;
}
