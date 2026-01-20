// app/api/planner/route.ts
import { NextResponse } from "next/server";
import { secureRoute } from "@/lib/proxy";
import { prisma } from "@/lib/prisma";

export const GET = secureRoute(async (req, session) => {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date"); // YYYY-MM-DD

  if (!dateStr) {
    return NextResponse.json({ error: "Date required" }, { status: 400 });
  }

  // Normalize date to Midnight UTC to match storage
  const date = new Date(dateStr);
  date.setUTCHours(0, 0, 0, 0);

  const plan = await prisma.dayPlan.findUnique({
    where: {
      userId_date: {
        userId: session?.user?.id!,
        date: date,
      },
    },
  });

  // Return null if no plan exists (Frontend should show "Generate Plan" button)
  return NextResponse.json(plan || { schedule: [], summary: null });
});
