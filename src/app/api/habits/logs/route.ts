// app/api/habits/logs/route.ts
import { NextResponse } from "next/server";
import { secureRoute } from "@/lib/proxy";
import { prisma } from "@/lib/prisma";

export const GET = secureRoute(async (req, session) => {
  const { searchParams } = new URL(req.url);
  const userId = session?.user?.id!;

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!startDate || !endDate) {
    return NextResponse.json({ error: "Date range required" }, { status: 400 });
  }

  try {
    // Optimized Query: Only select necessary fields
    const logs = await prisma.habitLog.findMany({
      where: {
        habit: { userId }, // Implicit join to ensure we only get this user's logs
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      select: {
        habitId: true,
        date: true,
        completed: true,
        value: true,
        status: true,
      },
    });

    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
});
