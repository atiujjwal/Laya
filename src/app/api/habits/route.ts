// app/api/habits/route.ts
import { NextResponse } from 'next/server';
import { secureRoute } from '@/lib/proxy';
import { prisma } from '@/lib/prisma';
import { createHabitSchema } from '@/lib/validations';
import { subDays } from 'date-fns';

export const GET = secureRoute(async (req, session) => {
  const { searchParams } = new URL(req.url);
  const userId = session?.user?.id!;

  // Pagination & Filtering
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const archived = searchParams.get('archived') === 'true';
  const skip = (page - 1) * limit;

  try {
    const habits = await prisma.habit.findMany({
      where: {
        userId,
        archived,
      },
      include: {
        logs: {
          where: {
            date: { gte: subDays(new Date(), 30) }, // Last 30 days
          },
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit,
    });

    return NextResponse.json({ data: habits, page, limit });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch habits' },
      { status: 500 },
    );
  }
});

export const POST = secureRoute(async (req, session) => {
  const userId = session?.user?.id!;

  try {
    const body = await req.json();
    const validatedData = createHabitSchema.parse(body);

    const newHabit = await prisma.habit.create({
      data: {
        ...validatedData,
        userId,
      },
    });

    return NextResponse.json(newHabit, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid Input' }, { status: 400 });
  }
});
