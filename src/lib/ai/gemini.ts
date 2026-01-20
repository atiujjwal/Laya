// lib/ai/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Use Flash for speed/cost, or Pro for complex reasoning
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json" },
});

export class GeminiService {
  static async generateDayPlan(context: any, userFocus?: string) {
    const prompt = `
      ROLE: You are "Laya", an expert productivity coach and scheduler.
      
      CONTEXT (User Data):
      - DATE: ${context.targetDate}
      - FOCUS: ${userFocus || "General Productivity"}
      - HABITS: 
      ${context.habits}
      - RECENT LOGS (Last 7 Days):
      ${context.logs}
      - GOALS:
      ${context.goals}

      TASK:
      1. Analyze the logs to find trends (e.g., "Missed gym 3 days in a row").
      2. Generate a 'schedule' for the TARGET DATE that fits their Habits and Goals.
      3. Assign a 'dayScore' prediction (0-100) based on how realistic this plan is given their recent history.
      4. Write a 'summary' explaining the plan and giving 1 specific coaching tip.

      OUTPUT JSON FORMAT ONLY:
      {
        "schedule": [
          { "time": "08:00", "task": "Morning Meditation", "type": "habit", "duration": 10, "reason": "Consistent morning habit" },
          { "time": "09:00", "task": "Deep Work", "type": "work", "duration": 120, "reason": "Best energy block" }
        ],
        "summary": "I've prioritized deep work this morning because...",
        "dayScore": 85
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text);
    } catch (e) {
      console.error("Gemini Generation Error:", e);
      throw new Error("Failed to generate plan");
    }
  }

  static async analyzeTrends(context: any) {
    const prompt = `
      ROLE: Data Analyst for Habits.
      DATA: ${JSON.stringify(context)}
      TASK: Identify 3 key insights (positive or negative) and 1 actionable improvement.
      OUTPUT JSON: { "insights": ["..."], "suggestion": "..." }
    `;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }
}
