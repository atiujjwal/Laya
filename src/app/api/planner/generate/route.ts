// app/api/planner/generate/route.ts
import { NextResponse } from "next/server";
import { secureRoute } from "@/lib/proxy";
import { prisma } from "@/lib/prisma";
import { generatePlanSchema } from "@/lib/validations";
import { LayaContextService } from "@/lib/ai/context";
import { GeminiService } from "@/lib/ai/gemini";

export const POST = secureRoute(async (req, session) => {
  try {
    const userId = session?.user?.id!;
    const body = await req.json();

    // Validate Input
    const { date, focus } = generatePlanSchema.parse(body);
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    // Build Context (RAG)
    const context = await LayaContextService.getUserSnapshot(
      userId,
      targetDate,
    );

    // Call Gemini
    const aiResponse = await GeminiService.generateDayPlan(context, focus);

    // Save to Database (Upsert: Update if plan exists, else Create)
    const dayPlan = await prisma.dayPlan.upsert({
      where: {
        userId_date: {
          userId,
          date: targetDate,
        },
      },
      update: {
        schedule: aiResponse.schedule, // JSONB column
        summary: aiResponse.summary,
        dayScore: aiResponse.dayScore,
      },
      create: {
        userId,
        date: targetDate,
        schedule: aiResponse.schedule,
        summary: aiResponse.summary,
        dayScore: aiResponse.dayScore,
      },
    });

    return NextResponse.json(dayPlan);
  } catch (error) {
    console.error("Plan Generation Failed:", error);
    return NextResponse.json(
      { error: "AI Service Unavailable" },
      { status: 500 },
    );
  }
});
