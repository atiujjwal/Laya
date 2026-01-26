import { NextResponse } from 'next/server';
import { secureRoute } from '@/lib/proxy';
import { parseISO } from 'date-fns';

export const POST = secureRoute(async (req, session) => {
  const taskId = req.url.split('/').slice(-2, -1)[0]; // Get id from /timeline/[id]/move
  
  try {
    const body = await req.json();
    const { startTime, endTime } = body;

    // In a real implementation, you would update the task time in the day plan schedule
    // and check for conflicts
    return NextResponse.json({
      success: true,
      id: taskId,
      startTime: parseISO(startTime),
      endTime: parseISO(endTime),
    });
  } catch (error: any) {
    console.error('Move timeline task error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to move task' },
      { status: 500 }
    );
  }
});
