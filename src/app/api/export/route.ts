// app/api/export/route.ts
import { NextResponse } from "next/server";
import { secureRoute } from "@/lib/proxy";
import { prisma } from "@/lib/prisma";
import Papa from "papaparse";

export const GET = secureRoute(async (req, session) => {
  const userId = session?.user?.id!;

  // Fetch all user logs flat
  const data = await prisma.habitLog.findMany({
    where: {
      habit: { userId },
    },
    include: {
      habit: { select: { title: true, category: true } },
    },
    orderBy: { date: "desc" },
  });

  // Flatten for CSV
  const csvData = data.map((log) => ({
    Date: log.date.toISOString().split("T")[0],
    Habit: log.habit.title,
    Category: log.habit.category,
    Value: log.value,
    Completed: log.completed ? "Yes" : "No",
    Status: log.status,
  }));

  const csv = Papa.unparse(csvData);

  // Return as downloadable file
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="laya_export_${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
});
