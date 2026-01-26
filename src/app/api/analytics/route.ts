import { NextResponse } from 'next/server';
import { secureRoute } from '@/lib/proxy';
import { prisma } from '@/lib/prisma';
import { calculateXP, calculateLevel } from '@/lib/xp';
import { format, startOfYear, endOfYear, eachDayOfInterval } from 'date-fns';

export const GET = secureRoute(async (req, session) => {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    const userId = session?.user?.id!;
    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(new Date(year, 11, 31));

    // Fetch all habit logs for the year
    const logs = await prisma.habitLog.findMany({
      where: {
        habit: { userId },
        date: { gte: yearStart, lte: yearEnd },
        completed: true,
      },
      include: {
        habit: true,
      },
    });

    // Calculate XP data
    const xpDataMap = new Map<string, { xp: number; category: string }>();
    
    logs.forEach((log) => {
      const dateKey = format(log.date, 'yyyy-MM-dd');
      const existing = xpDataMap.get(dateKey) || { xp: 0, category: log.habit.title };
      
      // Calculate XP for this log
      const xpResult = calculateXP({
        baseTime: 30, // Default 30 minutes
        priority: 3, // Default priority
        currentStreak: log.habit.currentStreak,
        focusBonus: 10,
      });
      
      xpDataMap.set(dateKey, {
        xp: existing.xp + xpResult.xp,
        category: existing.category,
      });
    });

    // Convert to array format
    const xpData = Array.from(xpDataMap.entries()).map(([date, data]) => ({
      date,
      xp: data.xp,
      category: data.category,
    }));

    // Calculate category breakdown
    const categoryMap = new Map<string, number>();
    logs.forEach((log) => {
      const category = log.habit.title; // In production, use actual category field
      const xpResult = calculateXP({
        baseTime: 30,
        priority: 3,
        currentStreak: log.habit.currentStreak,
      });
      categoryMap.set(category, (categoryMap.get(category) || 0) + xpResult.xp);
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: [
        'hsl(var(--primary))',
        'hsl(var(--secondary))',
        'hsl(var(--accent))',
        'hsl(var(--success))',
        'hsl(var(--warning))',
      ][index % 5],
    }));

    // Calculate total XP and level
    const totalXP = Array.from(xpDataMap.values()).reduce((sum, data) => sum + data.xp, 0);
    const levelInfo = calculateLevel(totalXP);

    // Generate contribution data
    const yearDays = eachDayOfInterval({ start: yearStart, end: yearEnd });
    const contributionData = yearDays.map((date) => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayLogs = logs.filter((log) => format(log.date, 'yyyy-MM-dd') === dateKey);
      const count = dayLogs.length;
      
      // Calculate level (0-4) based on count
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count >= 7) level = 4;
      else if (count >= 5) level = 3;
      else if (count >= 3) level = 2;
      else if (count >= 1) level = 1;
      
      return {
        date,
        count,
        level,
      };
    });

    return NextResponse.json({
      xpData,
      categoryBreakdown,
      contributionData,
      stats: {
        totalXP,
        currentLevel: levelInfo.level,
        xpToNextLevel: levelInfo.xpToNextLevel,
        xpInCurrentLevel: levelInfo.xpInCurrentLevel,
      },
    });
  } catch (error: any) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
});
