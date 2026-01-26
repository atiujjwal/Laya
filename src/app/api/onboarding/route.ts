import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { goals, habits, preferences } = body;

    // Create goals
    if (goals && goals.length > 0) {
      await Promise.all(
        goals.map((goalTitle: string) =>
          prisma.goal.create({
            data: {
              userId,
              title: goalTitle,
              category: 'General',
              steps: [],
              progress: 0,
              completed: false,
            },
          })
        )
      );
    }

    // Create habits
    if (habits && habits.length > 0) {
      await Promise.all(
        habits.map((habit: { title: string; time: string; category: string }) =>
          prisma.habit.create({
            data: {
              userId,
              title: habit.title,
              description: `Created during onboarding`,
              color: '#FF6B00',
              frequency: 'DAILY',
              weekDays: [1, 2, 3, 4, 5, 6, 7], // All days
              targetValue: 1,
              currentStreak: 0,
              longestStreak: 0,
            },
          })
        )
      );
    }

    // Update user preferences
    if (preferences) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          onboarding: true,
          // Store preferences in a JSON field or separate table if needed
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Onboarding API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
