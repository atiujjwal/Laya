/**
 * Forgiving Streak Logic
 * Implements "Grace Period" system and "Streak Freezes" to prevent motivation loss
 */

export interface StreakConfig {
  gracePeriodDays: number; // Number of days allowed to miss before breaking streak
  streakFreezesAvailable: number; // Number of streak freezes user has
  weeklyAggregateTarget: number; // Weekly completion target (e.g., 5 out of 7 days)
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  gracePeriodUsed: number;
  streakFreezesUsed: number;
  lastActivityDate: Date | null;
  weeklyCompletions: number[]; // Array of completion counts per week
}

/**
 * Calculate streak with grace period and freezes
 */
export function calculateStreak(
  logs: Array<{ date: Date; completed: boolean }>,
  config: StreakConfig
): StreakState {
  if (logs.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      gracePeriodUsed: 0,
      streakFreezesUsed: 0,
      lastActivityDate: null,
      weeklyCompletions: [],
    };
  }

  // Sort logs by date (oldest first)
  const sortedLogs = [...logs].sort((a, b) => a.date.getTime() - b.date.getTime());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let gracePeriodUsed = 0;
  let streakFreezesUsed = 0;
  let lastActivityDate: Date | null = null;

  // Track weekly completions
  const weeklyCompletions: number[] = [];
  let currentWeekCompletions = 0;
  let currentWeekStart: Date | null = null;

  // Process logs in reverse (newest first for current streak)
  for (let i = sortedLogs.length - 1; i >= 0; i--) {
    const log = sortedLogs[i];
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);

    if (log.completed) {
      if (lastActivityDate === null) {
        lastActivityDate = logDate;
        currentStreak = 1;
        tempStreak = 1;
      } else {
        const daysDiff = Math.floor(
          (lastActivityDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 1) {
          // Consecutive day
          currentStreak++;
          tempStreak++;
        } else if (daysDiff <= 1 + config.gracePeriodDays) {
          // Within grace period
          gracePeriodUsed += daysDiff - 1;
          currentStreak++;
          tempStreak++;
        } else if (config.streakFreezesAvailable > streakFreezesUsed && daysDiff <= 2) {
          // Use streak freeze
          streakFreezesUsed++;
          currentStreak++;
          tempStreak++;
        } else {
          // Streak broken
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
          currentStreak = 1;
        }

        lastActivityDate = logDate;
      }

      // Track weekly completions
      if (currentWeekStart === null) {
        currentWeekStart = logDate;
        currentWeekCompletions = 1;
      } else {
        const weekDiff = Math.floor(
          (currentWeekStart.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
        );

        if (weekDiff === 0) {
          currentWeekCompletions++;
        } else {
          weeklyCompletions.push(currentWeekCompletions);
          currentWeekStart = logDate;
          currentWeekCompletions = 1;
        }
      }
    }
  }

  // Add current week
  if (currentWeekCompletions > 0) {
    weeklyCompletions.push(currentWeekCompletions);
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    gracePeriodUsed,
    streakFreezesUsed,
    lastActivityDate,
    weeklyCompletions,
  };
}

/**
 * Check if weekly aggregate target is met
 */
export function checkWeeklyTarget(
  weeklyCompletions: number[],
  target: number
): { met: boolean; currentWeek: number; target: number } {
  const currentWeek = weeklyCompletions[weeklyCompletions.length - 1] || 0;
  return {
    met: currentWeek >= target,
    currentWeek,
    target,
  };
}

/**
 * Calculate streak freeze cost (increases with usage)
 */
export function getStreakFreezeCost(used: number): number {
  // Base cost: 100 XP, increases by 50 XP per use
  return 100 + used * 50;
}
