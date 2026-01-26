/**
 * Dynamic Adaptation: Self-healing schedule that learns from user deviations
 * Suggests better times based on actual completion patterns
 */

import { addDays, format, isAfter, isBefore } from 'date-fns';
import { Pattern, getOptimalTime, predictCompletionProbability } from './pattern-recognition';

export interface ScheduleDeviation {
  taskId: string;
  originalTime: Date;
  actualTime: Date | null; // null if not completed
  taskType: string;
  completed: boolean;
  reason?: string; // User-provided reason for change
}

export interface AdaptationSuggestion {
  taskId: string;
  currentTime: Date;
  suggestedTime: Date;
  confidence: number; // 0-1
  reason: string;
  expectedImprovement: number; // Percentage improvement in completion probability
}

/**
 * Analyze deviations and generate adaptation suggestions
 */
export function analyzeDeviations(
  deviations: ScheduleDeviation[],
  patterns: Pattern[]
): AdaptationSuggestion[] {
  const suggestions: AdaptationSuggestion[] = [];

  // Group deviations by task type
  const deviationsByType = new Map<string, ScheduleDeviation[]>();
  deviations.forEach((dev) => {
    const type = dev.taskType;
    if (!deviationsByType.has(type)) {
      deviationsByType.set(type, []);
    }
    deviationsByType.get(type)!.push(dev);
  });

  // Analyze each task type
  deviationsByType.forEach((typeDeviations, taskType) => {
    // Find tasks that were consistently moved or not completed
    const movedTasks = typeDeviations.filter(
      (d) => d.actualTime && d.completed && d.actualTime.getTime() !== d.originalTime.getTime()
    );
    const missedTasks = typeDeviations.filter((d) => !d.completed);

    // If tasks are consistently moved to similar times, suggest that time
    if (movedTasks.length >= 3) {
      const averageMovedTime = calculateAverageTime(
        movedTasks.map((d) => d.actualTime!)
      );

      movedTasks.forEach((deviation) => {
        const currentProb = predictCompletionProbability(
          taskType,
          deviation.originalTime,
          patterns
        );
        const suggestedProb = predictCompletionProbability(
          taskType,
          averageMovedTime,
          patterns
        );

        if (suggestedProb > currentProb + 0.1) {
          // At least 10% improvement
          suggestions.push({
            taskId: deviation.taskId,
            currentTime: deviation.originalTime,
            suggestedTime: averageMovedTime,
            confidence: Math.min(movedTasks.length / 10, 1), // More data = higher confidence
            reason: `Users consistently complete this task around ${format(averageMovedTime, 'h:mm a')}`,
            expectedImprovement: (suggestedProb - currentProb) * 100,
          });
        }
      });
    }

    // If tasks are consistently missed at certain times, suggest alternative
    if (missedTasks.length >= 3) {
      const pattern = patterns.find((p) => p.taskType === taskType);
      if (pattern) {
        const optimalTime = getOptimalTime(taskType, patterns);

        missedTasks.forEach((deviation) => {
          const currentProb = predictCompletionProbability(
            taskType,
            deviation.originalTime,
            patterns
          );
          const optimalProb = predictCompletionProbability(
            taskType,
            optimalTime,
            patterns
          );

          if (optimalProb > currentProb + 0.15) {
            // At least 15% improvement
            suggestions.push({
              taskId: deviation.taskId,
              currentTime: deviation.originalTime,
              suggestedTime: optimalTime,
              confidence: pattern.confidence,
              reason: `Based on historical patterns, ${format(optimalTime, 'h:mm a')} has higher completion rate`,
              expectedImprovement: (optimalProb - currentProb) * 100,
            });
          }
        });
      }
    }
  });

  // Sort by expected improvement (descending)
  return suggestions.sort((a, b) => b.expectedImprovement - a.expectedImprovement);
}

/**
 * Calculate average time from array of dates
 */
function calculateAverageTime(times: Date[]): Date {
  if (times.length === 0) {
    return new Date();
  }

  const totalMinutes = times.reduce((sum, time) => {
    return sum + time.getHours() * 60 + time.getMinutes();
  }, 0);

  const avgMinutes = totalMinutes / times.length;
  const hours = Math.floor(avgMinutes / 60);
  const minutes = Math.floor(avgMinutes % 60);

  const avgTime = new Date();
  avgTime.setHours(hours, minutes, 0, 0);

  return avgTime;
}

/**
 * Apply adaptation suggestions to schedule
 */
export function applyAdaptations(
  schedule: Array<{ id: string; time: Date; taskType: string }>,
  suggestions: AdaptationSuggestion[]
): Array<{ id: string; time: Date; taskType: string; adapted: boolean }> {
  const suggestionMap = new Map(
    suggestions.map((s) => [s.taskId, s])
  );

  return schedule.map((item) => {
    const suggestion = suggestionMap.get(item.id);
    if (suggestion && suggestion.confidence > 0.6) {
      // Only apply high-confidence suggestions
      return {
        ...item,
        time: suggestion.suggestedTime,
        adapted: true,
      };
    }
    return {
      ...item,
      adapted: false,
    };
  });
}
