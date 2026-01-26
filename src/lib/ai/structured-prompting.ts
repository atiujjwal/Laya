/**
 * Structured JSON Prompting
 * Ensures AI output is programmatically reliable for direct conversion into schedule rows
 */

export interface StructuredScheduleItem {
  time: string; // HH:mm format
  task: string;
  duration: number; // Minutes
  type: 'habit' | 'work' | 'personal' | 'break';
  priority: number; // 1-5
  reason?: string; // AI explanation
  isLocked?: boolean;
}

export interface StructuredSchedule {
  date: string; // YYYY-MM-DD
  items: StructuredScheduleItem[];
  summary?: string;
  confidence?: number; // 0-1
}

/**
 * Generate structured prompt for AI
 */
export function generateStructuredPrompt(
  userContext: any,
  targetDate: Date
): string {
  return `You are an AI scheduling assistant. Generate a daily schedule in the following JSON format:

{
  "date": "YYYY-MM-DD",
  "items": [
    {
      "time": "HH:mm",
      "task": "Task name",
      "duration": 30,
      "type": "habit|work|personal|break",
      "priority": 1-5,
      "reason": "Brief explanation",
      "isLocked": false
    }
  ],
  "summary": "Brief day summary",
  "confidence": 0.0-1.0
}

Requirements:
- All times must be in 24-hour format (HH:mm)
- Duration must be in minutes (minimum 5, maximum 240)
- Priority: 1=low, 5=high
- Types: "habit" for habits, "work" for work tasks, "personal" for personal tasks, "break" for breaks
- No overlapping times
- Total scheduled time should not exceed 16 hours
- Include breaks between intensive tasks
- Respect locked tasks (isLocked: true) - do not reschedule them

User Context:
${JSON.stringify(userContext, null, 2)}

Target Date: ${targetDate.toISOString().split('T')[0]}

Generate the schedule now:`;
}

/**
 * Validate structured schedule response
 */
export function validateStructuredSchedule(
  response: any
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!response.date) {
    errors.push('Missing date field');
  }

  if (!Array.isArray(response.items)) {
    errors.push('Items must be an array');
  } else {
    response.items.forEach((item: any, index: number) => {
      if (!item.time || !/^\d{2}:\d{2}$/.test(item.time)) {
        errors.push(`Item ${index}: Invalid time format (expected HH:mm)`);
      }

      if (!item.task || typeof item.task !== 'string') {
        errors.push(`Item ${index}: Missing or invalid task name`);
      }

      if (typeof item.duration !== 'number' || item.duration < 5 || item.duration > 240) {
        errors.push(`Item ${index}: Duration must be between 5 and 240 minutes`);
      }

      if (!['habit', 'work', 'personal', 'break'].includes(item.type)) {
        errors.push(`Item ${index}: Invalid type (must be habit, work, personal, or break)`);
      }

      if (typeof item.priority !== 'number' || item.priority < 1 || item.priority > 5) {
        errors.push(`Item ${index}: Priority must be between 1 and 5`);
      }
    });

    // Check for time conflicts
    const times = response.items
      .map((item: any) => {
        const [hours, minutes] = item.time.split(':').map(Number);
        return { start: hours * 60 + minutes, end: hours * 60 + minutes + item.duration };
      })
      .sort((a: any, b: any) => a.start - b.start);

    for (let i = 0; i < times.length - 1; i++) {
      if (times[i].end > times[i + 1].start) {
        errors.push(`Time conflict: Item ${i} overlaps with item ${i + 1}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Parse and clean AI response
 */
export function parseStructuredResponse(
  aiResponse: string
): StructuredSchedule | null {
  try {
    // Try to extract JSON from markdown code blocks
    let jsonString = aiResponse;
    
    // Remove markdown code blocks if present
    jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Try to find JSON object
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonString);
    const validation = validateStructuredSchedule(parsed);

    if (!validation.valid) {
      console.error('Validation errors:', validation.errors);
      return null;
    }

    return parsed as StructuredSchedule;
  } catch (error) {
    console.error('Failed to parse structured response:', error);
    return null;
  }
}
