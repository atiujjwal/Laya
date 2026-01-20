// app/api/habits/[id]/route.ts
import { NextResponse } from "next/server";
import { secureRoute } from "@/lib/proxy";
import { prisma } from "@/lib/prisma";
import { updateHabitSchema } from "@/lib/validations";

// GET: Fetch single habit details
export const GET = secureRoute(async (req, session) => {
  const habitId = req.url.split("/").pop();

  const habit = await prisma.habit.findUnique({
    where: {
      id: habitId,
      userId: session?.user?.id,
    },
  });

  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(habit);
});

// PATCH: Update habit
export const PATCH = secureRoute(async (req, session) => {
  const habitId = req.url.split("/").pop();

  try {
    const body = await req.json();
    const data = updateHabitSchema.parse(body);

    const updated = await prisma.habit.update({
      where: { id: habitId, userId: session?.user?.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
});

// DELETE: Archive Habit (Soft Delete)
export const DELETE = secureRoute(async (req, session) => {
  const habitId = req.url.split("/").pop();

  try {
    // archive or soft hard delete to preserve historical logs
    await prisma.habit.update({
      where: { id: habitId, userId: session?.user?.id },
      data: { archived: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
});
