/**
 * Behavioral Economics: Variable Reinforcement Schedules
 * Implements habit-forming mechanics using psychological principles
 */

export type ReinforcementSchedule = 'fixed-ratio' | 'variable-ratio' | 'fixed-interval' | 'variable-interval';

export interface ReinforcementConfig {
  schedule: ReinforcementSchedule;
  baseReward: number; // Base XP reward
  variability?: number; // Variability factor (0-1)
  interval?: number; // For interval schedules
}

/**
 * Variable Ratio Schedule (VR)
 * Rewards after a variable number of responses
 * Most effective for maintaining behavior
 */
export function calculateVariableRatioReward(
  completionCount: number,
  config: ReinforcementConfig
): number {
  const { baseReward, variability = 0.3 } = config;
  
  // Random multiplier between (1 - variability) and (1 + variability)
  const multiplier = 1 + (Math.random() * 2 - 1) * variability;
  
  // Occasional "jackpot" rewards (10% chance of 2x)
  const jackpot = Math.random() < 0.1 ? 2 : 1;
  
  return Math.round(baseReward * multiplier * jackpot);
}

/**
 * Fixed Ratio Schedule (FR)
 * Rewards after a fixed number of completions
 */
export function calculateFixedRatioReward(
  completionCount: number,
  config: ReinforcementConfig
): number {
  const { baseReward, interval = 5 } = config;
  
  if (completionCount % interval === 0) {
    return baseReward * 2; // Bonus reward
  }
  
  return baseReward;
}

/**
 * Variable Interval Schedule (VI)
 * Rewards after a variable amount of time
 */
export function calculateVariableIntervalReward(
  lastRewardTime: Date | null,
  config: ReinforcementConfig
): { reward: number; shouldReward: boolean } {
  const { baseReward, interval = 3, variability = 0.5 } = config;
  
  if (!lastRewardTime) {
    return { reward: baseReward, shouldReward: true };
  }
  
  const hoursSinceLastReward = (Date.now() - lastRewardTime.getTime()) / (1000 * 60 * 60);
  const minInterval = interval * (1 - variability);
  const maxInterval = interval * (1 + variability);
  const randomInterval = minInterval + Math.random() * (maxInterval - minInterval);
  
  if (hoursSinceLastReward >= randomInterval) {
    const multiplier = 1 + Math.random() * 0.5; // 1.0x to 1.5x
    return { reward: Math.round(baseReward * multiplier), shouldReward: true };
  }
  
  return { reward: 0, shouldReward: false };
}

/**
 * Fixed Interval Schedule (FI)
 * Rewards after a fixed amount of time
 */
export function calculateFixedIntervalReward(
  lastRewardTime: Date | null,
  config: ReinforcementConfig
): { reward: number; shouldReward: boolean } {
  const { baseReward, interval = 3 } = config;
  
  if (!lastRewardTime) {
    return { reward: baseReward, shouldReward: true };
  }
  
  const hoursSinceLastReward = (Date.now() - lastRewardTime.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceLastReward >= interval) {
    return { reward: baseReward * 1.5, shouldReward: true }; // Bonus for waiting
  }
  
  return { reward: 0, shouldReward: false };
}

/**
 * Get reward based on reinforcement schedule
 */
export function getReinforcementReward(
  schedule: ReinforcementSchedule,
  completionCount: number,
  lastRewardTime: Date | null,
  config: ReinforcementConfig
): { reward: number; shouldReward: boolean } {
  switch (schedule) {
    case 'variable-ratio':
      return {
        reward: calculateVariableRatioReward(completionCount, config),
        shouldReward: true,
      };
    
    case 'fixed-ratio':
      return {
        reward: calculateFixedRatioReward(completionCount, config),
        shouldReward: completionCount % (config.interval || 5) === 0,
      };
    
    case 'variable-interval':
      return calculateVariableIntervalReward(lastRewardTime, config);
    
    case 'fixed-interval':
      return calculateFixedIntervalReward(lastRewardTime, config);
    
    default:
      return { reward: config.baseReward, shouldReward: true };
  }
}

/**
 * Calculate habit strength based on completion history
 * Uses the "Habit Loop" model: Cue → Routine → Reward
 */
export function calculateHabitStrength(
  completions: Array<{ date: Date; completed: boolean }>,
  daysSinceStart: number
): number {
  if (completions.length === 0 || daysSinceStart === 0) return 0;
  
  const completionRate = completions.filter((c) => c.completed).length / completions.length;
  
  // Habit strength increases with:
  // 1. Consistency (completion rate)
  // 2. Time (days since start, with diminishing returns)
  // 3. Recency (recent completions weighted more)
  
  const consistencyScore = completionRate * 0.5;
  const timeScore = Math.min(daysSinceStart / 66, 1) * 0.3; // 66 days to form a habit
  const recencyScore = calculateRecencyScore(completions) * 0.2;
  
  return Math.min(consistencyScore + timeScore + recencyScore, 1) * 100;
}

/**
 * Calculate recency score (recent completions weighted more)
 */
function calculateRecencyScore(completions: Array<{ date: Date; completed: boolean }>): number {
  const now = Date.now();
  const recentCompletions = completions.filter((c) => {
    const daysAgo = (now - c.date.getTime()) / (1000 * 60 * 60 * 24);
    return c.completed && daysAgo <= 7; // Last 7 days
  });
  
  return Math.min(recentCompletions.length / 7, 1);
}
