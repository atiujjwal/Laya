import { NextResponse } from 'next/server';
import { secureRoute } from '@/lib/proxy';
import { prisma } from '@/lib/prisma';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';

export const GET = secureRoute(async (req, session) => {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date');
    
    if (!dateStr) {
      return NextResponse.json({ error: 'Date parameter required' }, { status: 400 });
    }

    const date = parseISO(dateStr);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const userId = session?.user?.id!;

    // Fetch day plan
    const dayPlan = await prisma.dayPlan.findUnique({
      where: {
        userId_date: {
          userId,
          date: dayStart,
        },
      },
    });

    if (!dayPlan || !dayPlan.schedule) {
      return NextResponse.json([]);
    }

    // Convert schedule to timeline tasks
    const schedule = dayPlan.schedule as Array<{
      time: string;
      task: string;
      duration: number;
      type: string;
      priority?: number;
      isLocked?: boolean;
    }>;

    const tasks = schedule.map((item, index) => {
      const [hours, minutes] = item.time.split(':').map(Number);
      const startTime = new Date(dayStart);
      startTime.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + (item.duration || 30));

      return {
        id: `task-${index}`,
        title: item.task,
        startTime,
        endTime,
        type: (item.type || 'habit') as 'habit' | 'work' | 'personal' | 'break',
        priority: item.priority || 3,
        isLocked: item.isLocked || false,
      };
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error('Timeline API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch timeline' },
      { status: 500 }
    );
  }
});
