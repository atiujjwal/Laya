import { NextResponse } from 'next/server';
import { secureRoute } from '@/lib/proxy';
import { prisma } from '@/lib/prisma';
import { calculateXP, calculateLevel } from '@/lib/xp';

export const GET = secureRoute(async (req, session) => {
  try {
    const userId = session?.user?.id!;

    // Fetch all completed logs
    const logs = await prisma.habitLog.findMany({
      where: {
        habit: { userId },
        completed: true,
      },
      include: {
        habit: true,
      },
    });

    // Calculate total XP
    let totalXP = 0;
    logs.forEach((log) => {
      const xpResult = calculateXP({
        baseTime: 30, // Default 30 minutes
        priority: 3, // Default priority
        currentStreak: log.habit.currentStreak,
        focusBonus: 10,
      });
      totalXP += xpResult.xp;
    });

    const levelInfo = calculateLevel(totalXP);

    return NextResponse.json({
      totalXP,
      currentLevel: levelInfo.level,
      xpToNextLevel: levelInfo.xpToNextLevel,
      xpInCurrentLevel: levelInfo.xpInCurrentLevel,
    });
  } catch (error: any) {
    console.error('XP Stats API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch XP stats' },
      { status: 500 }
    );
  }
});
