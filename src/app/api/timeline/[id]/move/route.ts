import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { parseISO } from 'date-fns';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { startTime, endTime } = body;

    // In a real implementation, you would update the task time in the day plan schedule
    // and check for conflicts
    return NextResponse.json({
      success: true,
      id: params.id,
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
}
