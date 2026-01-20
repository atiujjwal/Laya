// lib/ai/context.ts
import { prisma } from "@/lib/prisma";

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
}
