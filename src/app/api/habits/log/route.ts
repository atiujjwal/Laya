// app/api/habits/log/route.ts
import { NextResponse } from "next/server";
import { secureRoute } from "@/lib/proxy";
import { prisma } from "@/lib/prisma";
import { logHabitSchema } from "@/lib/validations";
import { LogStatus } from "@prisma/client";

export const POST = secureRoute(async (req, session) => {
  const userId = session?.user?.id!;

  try {
    const body = await req.json();
    const { habitId, date, value, completed, meta } =
      logHabitSchema.parse(body);

    // Verify ownership of the habit to prevent unauthorized logging
    const habit = await prisma.habit.findUnique({
      where: { id: habitId, userId },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Upsert: Create log if not exists, Update if it does
    const log = await prisma.habitLog.upsert({
      where: {
        habitId_date: {
          habitId,
          date: new Date(date), // Ensure this matches the Midnight UTC format
        },
      },
      update: {
        value,
        completed,
        status: completed ? LogStatus.COMPLETED : LogStatus.SKIPPED,
        meta: meta || undefined,
      },
      create: {
        habitId,
        date: new Date(date),
        value,
        completed,
        status: completed ? LogStatus.COMPLETED : LogStatus.SKIPPED,
        meta: meta || undefined,
      },
    });

    // TODO: Trigger Async Job here to update "Streaks" (Phase 6)

    return NextResponse.json(log);
  } catch (error) {
    console.error("Logging Error:", error);
    return NextResponse.json({ error: "Failed to log habit" }, { status: 500 });
  }
});
