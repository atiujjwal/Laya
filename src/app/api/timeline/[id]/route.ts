import { NextResponse } from 'next/server';
import { secureRoute } from '@/lib/proxy';
import { prisma } from '@/lib/prisma';

export const PATCH = secureRoute(async (req, session) => {
  const taskId = req.url.split('/').pop();
  
  try {
    const body = await req.json();
    const { isLocked, ...otherUpdates } = body;

    // In a real implementation, you would update the task in the day plan schedule
    // For now, we'll return success
    return NextResponse.json({ success: true, id: taskId, ...otherUpdates });
  } catch (error: any) {
    console.error('Update timeline task error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update task' },
      { status: 500 }
    );
  }
});

export const DELETE = secureRoute(async (req, session) => {
  const taskId = req.url.split('/').pop();
  
  try {
    // In a real implementation, you would remove the task from the day plan schedule
    return NextResponse.json({ success: true, id: taskId });
  } catch (error: any) {
    console.error('Delete timeline task error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete task' },
      { status: 500 }
    );
  }
});
