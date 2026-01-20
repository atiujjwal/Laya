// app/api/goals/[id]/route.ts
import { NextResponse } from "next/server";
import { secureRoute } from "@/lib/proxy";
import { prisma } from "@/lib/prisma";
import { updateGoalSchema } from "@/lib/validations";

export const PATCH = secureRoute(async (req, session) => {
  const goalId = req.url.split("/").pop();

  try {
    const body = await req.json();
    // Parse carefully: steps are JSON in DB but Array in Zod
    const data = updateGoalSchema.parse(body);

    const updated = await prisma.goal.update({
      where: { id: goalId, userId: session?.user?.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
});
