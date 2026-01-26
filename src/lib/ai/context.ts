// lib/ai/context.ts
import { prisma } from "@/lib/prisma";
import { analyzeTaskPattern, Pattern } from "./pattern-recognition";
import { calculateHabitStrength } from "../behavioral-economics";

export interface UserContext {
  static: {
    goals: string[];
    preferences: Record<string, any>;
  };
  dynamic: {
    calendar: Array<{ time: string; task: string; locked: boolean }>;
    recentCompletions: number;
  };
  heuristic: {
    patterns: Pattern[];
    habitStrengths: Record<string, number>;
    optimalTimes: Record<string, { hour: number; day: number }>;
  };
}

/**
 * User Context Pipeline: RAG system that feeds static, dynamic, and heuristic data
 */
export class LayaContextService {
  /**
   * Aggregates user data into a token-optimized format (TOON-style)
   * for the AI prompt.
   */
  static async getUserSnapshot(userId: string, targetDate: Date) {
    // Fetch Active Habits
    const habits = await prisma.habit.findMany({
      where: { userId, archived: false },
      select: {
        id: true,
        title: true,
        frequency: true,
        targetValue: true,
        unit: true,
        currentStreak: true,
      },
    });

    // Fetch Logs for the last 7 days (for context/trends)
    const oneWeekAgo = new Date(targetDate);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentLogs = await prisma.habitLog.findMany({
      where: {
        habit: { userId },
        date: { gte: oneWeekAgo },
      },
      select: {
        habitId: true,
        date: true,
        status: true,
        value: true,
        meta: true, // Includes mood/notes
      },
    });

    // Fetch Active Goals
    const goals = await prisma.goal.findMany({
      where: { userId, completed: false },
      select: { title: true, progress: true, steps: true },
    });

    // Format for AI (TOON - Token Optimized)
    return {
      habits: habits
        .map(
          (h) =>
            `[ID:${h.id}] ${h.title} (${h.frequency}, Streak:${h.currentStreak})`,
        )
        .join("\n"),

      logs: recentLogs
        .map(
          (l) =>
            `[${l.date.toISOString().split("T")[0]}] Habit:${l.habitId} Val:${l.value} Stat:${l.status}`,
        )
        .join("\n"),

      goals: goals.map((g) => `Goal: ${g.title} (${g.progress}%)`).join("\n"),

      targetDate: targetDate.toISOString().split("T")[0],
    };
  }

  /**
   * Build comprehensive user context for RAG system
   */
  static async buildUserContext(userId: string, targetDate: Date): Promise<UserContext> {
    // Static Data: Goals and Preferences
    const goals = await prisma.goal.findMany({
      where: { userId, completed: false },
      select: { title: true, category: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true, onboarding: true },
    });

    // Dynamic Data: Calendar and Recent Activity
    const dayPlan = await prisma.dayPlan.findUnique({
      where: {
        userId_date: {
          userId,
          date: targetDate,
        },
      },
    });

    const oneWeekAgo = new Date(targetDate);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentCompletions = await prisma.habitLog.count({
      where: {
        habit: { userId },
        date: { gte: oneWeekAgo },
        completed: true,
      },
    });

    // Heuristic Data: Patterns and Habit Strengths
    const allLogs = await prisma.habitLog.findMany({
      where: {
        habit: { userId },
        date: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }, // Last 90 days
      },
      include: {
        habit: true,
      },
    });

    // Analyze patterns for each task type
    const taskCompletions = allLogs.map((log) => ({
      taskId: log.habitId,
      taskType: 'habit' as const,
      completedAt: log.date,
      completed: log.completed,
    }));

    const patterns: Pattern[] = [];
    const taskTypes = ['habit', 'work', 'personal', 'break'];
    
    for (const type of taskTypes) {
      const pattern = analyzeTaskPattern(
        type,
        taskCompletions.filter((tc) => tc.taskType === type)
      );
      if (pattern) {
        patterns.push(pattern);
      }
    }

    // Calculate habit strengths
    const habits = await prisma.habit.findMany({
      where: { userId, archived: false },
      include: {
        logs: {
          where: {
            date: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
          },
        },
      },
    });

    const habitStrengths: Record<string, number> = {};
    habits.forEach((habit) => {
      const daysSinceStart = Math.floor(
        (Date.now() - habit.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      habitStrengths[habit.id] = calculateHabitStrength(
        habit.logs.map((log) => ({
          date: log.date,
          completed: log.completed,
        })),
        daysSinceStart
      );
    });

    // Extract optimal times from patterns
    const optimalTimes: Record<string, { hour: number; day: number }> = {};
    patterns.forEach((pattern) => {
      optimalTimes[pattern.taskType] = {
        hour: pattern.optimalHour,
        day: pattern.optimalDayOfWeek,
      };
    });

    return {
      static: {
        goals: goals.map((g) => g.title),
        preferences: {
          timezone: user?.timezone || 'UTC',
        },
      },
      dynamic: {
        calendar: dayPlan
          ? (dayPlan.schedule as Array<{ time: string; task: string; locked?: boolean }>)
          : [],
        recentCompletions,
      },
      heuristic: {
        patterns,
        habitStrengths,
        optimalTimes,
      },
    };
  }

  /**
   * Update user context based on implicit feedback (e.g., manual task moves)
   */
  static async updateContextFromFeedback(
    userId: string,
    feedback: {
      action: 'task_moved' | 'task_locked' | 'task_completed';
      taskId: string;
      oldTime?: Date;
      newTime?: Date;
      taskType?: string;
    }
  ): Promise<void> {
    // Store feedback for pattern learning
    // This would typically update a feedback table or cache
    // For now, we'll log it (in production, store in database)
    console.log('User feedback:', feedback);
    
    // The pattern recognition system will use this data in future analyses
  }
}
