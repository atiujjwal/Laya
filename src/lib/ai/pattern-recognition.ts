/**
 * Pattern Recognition: AI-driven analysis of historical data
 * Determines when a user is most likely to complete specific task types
 */

import { format, getHours, getDay } from 'date-fns';

export interface TaskCompletion {
  taskId: string;
  taskType: 'habit' | 'work' | 'personal' | 'break';
  completedAt: Date;
  completed: boolean;
  duration?: number; // Minutes
}

export interface Pattern {
  taskType: string;
  optimalHour: number; // 0-23
  optimalDayOfWeek: number; // 0-6 (Sunday = 0)
  successRate: number; // 0-1
  averageDuration: number; // Minutes
  confidence: number; // 0-1
}

/**
 * Analyze completion patterns for a specific task type
 */
export function analyzeTaskPattern(
  taskType: string,
  completions: TaskCompletion[]
): Pattern | null {
  const relevantCompletions = completions.filter(
    (c) => c.taskType === taskType && c.completed
  );

  if (relevantCompletions.length < 5) {
    return null; // Not enough data
  }

  // Analyze by hour
  const hourCounts = new Map<number, number>();
  const hourSuccesses = new Map<number, number>();
  
  // Analyze by day of week
  const dayCounts = new Map<number, number>();
  const daySuccesses = new Map<number, number>();
  
  let totalDuration = 0;
  let durationCount = 0;

  completions.forEach((completion) => {
    const hour = getHours(completion.completedAt);
    const dayOfWeek = getDay(completion.completedAt);
    
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    dayCounts.set(dayOfWeek, (dayCounts.get(dayOfWeek) || 0) + 1);
    
    if (completion.completed) {
      hourSuccesses.set(hour, (hourSuccesses.get(hour) || 0) + 1);
      daySuccesses.set(dayOfWeek, (daySuccesses.get(dayOfWeek) || 0) + 1);
      
      if (completion.duration) {
        totalDuration += completion.duration;
        durationCount++;
      }
    }
  });

  // Find optimal hour (highest success rate with sufficient data)
  let optimalHour = 9; // Default to 9 AM
  let maxHourSuccessRate = 0;
  
  hourCounts.forEach((count, hour) => {
    if (count >= 3) { // At least 3 attempts
      const successRate = (hourSuccesses.get(hour) || 0) / count;
      if (successRate > maxHourSuccessRate) {
        maxHourSuccessRate = successRate;
        optimalHour = hour;
      }
    }
  });

  // Find optimal day of week
  let optimalDay = 1; // Default to Monday
  let maxDaySuccessRate = 0;
  
  dayCounts.forEach((count, day) => {
    if (count >= 3) {
      const successRate = (daySuccesses.get(day) || 0) / count;
      if (successRate > maxDaySuccessRate) {
        maxDaySuccessRate = successRate;
        optimalDay = day;
      }
    }
  });

  // Calculate overall success rate
  const totalAttempts = completions.filter((c) => c.taskType === taskType).length;
  const totalSuccesses = relevantCompletions.length;
  const successRate = totalAttempts > 0 ? totalSuccesses / totalAttempts : 0;

  // Calculate confidence (based on sample size)
  const confidence = Math.min(relevantCompletions.length / 20, 1);

  return {
    taskType,
    optimalHour,
    optimalDayOfWeek: optimalDay,
    successRate,
    averageDuration: durationCount > 0 ? totalDuration / durationCount : 30,
    confidence,
  };
}

/**
 * Get optimal time for a task based on patterns
 */
export function getOptimalTime(
  taskType: string,
  patterns: Pattern[],
  preferredDate?: Date
): Date {
  const pattern = patterns.find((p) => p.taskType === taskType);
  
  if (!pattern) {
    // Default to 9 AM if no pattern found
    const date = preferredDate || new Date();
    date.setHours(9, 0, 0, 0);
    return date;
  }

  const date = preferredDate || new Date();
  
  // Set to optimal hour
  date.setHours(pattern.optimalHour, 0, 0, 0);
  
  // Adjust day of week if needed (for weekly planning)
  if (preferredDate) {
    const currentDay = getDay(date);
    const dayDiff = pattern.optimalDayOfWeek - currentDay;
    date.setDate(date.getDate() + dayDiff);
  }
  
  return date;
}

/**
 * Predict completion probability for a task at a specific time
 */
export function predictCompletionProbability(
  taskType: string,
  scheduledTime: Date,
  patterns: Pattern[]
): number {
  const pattern = patterns.find((p) => p.taskType === taskType);
  
  if (!pattern) {
    return 0.5; // Default 50% if no pattern
  }

  const scheduledHour = getHours(scheduledTime);
  const scheduledDay = getDay(scheduledTime);
  
  // Base probability from overall success rate
  let probability = pattern.successRate;
  
  // Adjust based on hour match
  const hourDiff = Math.abs(scheduledHour - pattern.optimalHour);
  const hourPenalty = hourDiff * 0.05; // 5% per hour difference
  probability -= hourPenalty;
  
  // Adjust based on day match
  if (scheduledDay !== pattern.optimalDayOfWeek) {
    probability -= 0.1; // 10% penalty for wrong day
  }
  
  // Apply confidence factor
  probability = probability * (0.5 + pattern.confidence * 0.5);
  
  return Math.max(0, Math.min(1, probability));
}
