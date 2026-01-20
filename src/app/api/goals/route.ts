// app/api/goals/route.ts
import { NextResponse } from "next/server";
import { secureRoute } from "@/lib/proxy";
import { prisma } from "@/lib/prisma";
import { createGoalSchema } from "@/lib/validations";

export const GET = secureRoute(async (req, session) => {
  const { searchParams } = new URL(req.url);
  const completed = searchParams.get("completed");
  const category = searchParams.get("category");

  const where: any = { userId: session?.user?.id };
  if (completed !== null) where.completed = completed === "true";
  if (category) where.category = category;

  const goals = await prisma.goal.findMany({
    where,
    orderBy: { targetDate: "asc" }, // Urgent goals first
  });

  return NextResponse.json(goals);
});

export const POST = secureRoute(async (req, session) => {
  try {
    const body = await req.json();
    const data = createGoalSchema.parse(body);

    const goal = await prisma.goal.create({
      data: { ...data, userId: session?.user?.id! },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid Goal Data" }, { status: 400 });
  }
});
