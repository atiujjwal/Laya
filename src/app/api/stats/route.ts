import { NextResponse } from 'next/server';
import { secureRoute } from '@/lib/proxy';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export const GET = secureRoute(async (req, session) => {
  try {
    const userId = session?.user?.id!;
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const thirtyDaysAgo = subDays(today, 30);

    // Get all active habits
    const habits = await prisma.habit.findMany({
      where: {
        userId,
        archived: false,
      },
      include: {
        logs: {
          where: {
            date: { gte: thirtyDaysAgo },
          },
        },
      },
    });

    // Calculate stats
    const totalActive = habits.length;
    
    // Calculate completion rate (last 30 days)
    const totalPossibleCompletions = habits.length * 30;
    const totalCompletions = habits.reduce(
      (sum, habit) => sum + habit.logs.filter((log) => log.completed).length,
      0
    );
    const completionRate = totalPossibleCompletions > 0
      ? Math.round((totalCompletions / totalPossibleCompletions) * 100)
      : 0;

    // Calculate perfect days (days with 100% completion)
    const dayCompletions = new Map<string, number>();
    habits.forEach((habit) => {
      habit.logs.forEach((log) => {
        if (log.completed) {
          const dateKey = log.date.toISOString().split('T')[0];
          dayCompletions.set(dateKey, (dayCompletions.get(dateKey) || 0) + 1);
        }
      });
    });

    const perfectDays = Array.from(dayCompletions.values()).filter(
      (count) => count === totalActive
    ).length;

    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < 30; i++) {
      const checkDate = subDays(today, i);
      const dateKey = checkDate.toISOString().split('T')[0];
      const dayCount = dayCompletions.get(dateKey) || 0;

      if (dayCount === totalActive && totalActive > 0) {
        tempStreak++;
        if (i === 0) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    return NextResponse.json({
      totalActive,
      completionRate,
      perfectDays,
      currentStreak,
      longestStreak,
    });
  } catch (error: any) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
});
