/**
 * XP Calculation Algorithm
 * Formula: XP_total = (T_base × M_priority × M_streak) + B_focus
 * 
 * Where:
 * - T_base: Base time spent (in minutes)
 * - M_priority: Priority multiplier (1.0 - 2.0)
 * - M_streak: Streak multiplier (1.0 - 1.5)
 * - B_focus: Focus bonus (0-50 XP)
 */

export interface XPCalculationParams {
  baseTime: number; // Minutes
  priority: number; // 1-5 scale
  currentStreak: number;
  focusBonus?: number; // 0-50
  consistencyBonus?: number; // Additional bonus for consistency
}

export interface XPResult {
  xp: number;
  breakdown: {
    baseXP: number;
    priorityMultiplier: number;
    streakMultiplier: number;
    focusBonus: number;
    consistencyBonus: number;
    total: number;
  };
}

/**
 * Calculate XP based on activity parameters
 */
export function calculateXP(params: XPCalculationParams): XPResult {
  const { baseTime, priority, currentStreak, focusBonus = 0, consistencyBonus = 0 } = params;

  // Base XP from time (1 XP per minute, capped at 120 minutes)
  const T_base = Math.min(baseTime, 120);

  // Priority multiplier (1.0 to 2.0)
  // Priority 1 = 1.0x, Priority 5 = 2.0x
  const M_priority = 1.0 + (priority - 1) * 0.25;

  // Streak multiplier (1.0 to 1.5)
  // Linear scaling: 0 days = 1.0x, 30+ days = 1.5x
  const M_streak = Math.min(1.0 + (currentStreak / 30) * 0.5, 1.5);

  // Focus bonus (0-50 XP)
  const B_focus = Math.min(Math.max(focusBonus, 0), 50);

  // Consistency bonus (0-25 XP)
  const B_consistency = Math.min(Math.max(consistencyBonus, 0), 25);

  // Calculate total XP
  const baseXP = T_base;
  const priorityXP = baseXP * M_priority;
  const streakXP = priorityXP * M_streak;
  const totalXP = streakXP + B_focus + B_consistency;

  return {
    xp: Math.round(totalXP),
    breakdown: {
      baseXP: Math.round(baseXP),
      priorityMultiplier: M_priority,
      streakMultiplier: M_streak,
      focusBonus: B_focus,
      consistencyBonus: B_consistency,
      total: Math.round(totalXP),
    },
  };
}

/**
 * Calculate level from total XP
 * Level progression: 1000 XP per level (exponential scaling after level 10)
 */
export function calculateLevel(totalXP: number): { level: number; xpInCurrentLevel: number; xpToNextLevel: number } {
  if (totalXP < 1000) {
    return {
      level: 1,
      xpInCurrentLevel: totalXP,
      xpToNextLevel: 1000 - totalXP,
    };
  }

  // Levels 1-10: 1000 XP each
  if (totalXP < 10000) {
    const level = Math.floor(totalXP / 1000) + 1;
    const xpInCurrentLevel = totalXP % 1000;
    return {
      level,
      xpInCurrentLevel,
      xpToNextLevel: 1000 - xpInCurrentLevel,
    };
  }

  // Levels 11+: Exponential scaling
  // Level 11 = 1500 XP, Level 12 = 2000 XP, etc.
  let level = 10;
  let xpRequired = 10000;
  let xpForNextLevel = 1500;

  while (xpRequired + xpForNextLevel <= totalXP) {
    xpRequired += xpForNextLevel;
    level++;
    xpForNextLevel = Math.floor(xpForNextLevel * 1.2); // 20% increase per level
  }

  const xpInCurrentLevel = totalXP - xpRequired;
  return {
    level,
    xpInCurrentLevel,
    xpToNextLevel: xpForNextLevel - xpInCurrentLevel,
  };
}

/**
 * Get level rewards/unlocks
 */
export function getLevelRewards(level: number): {
  themes: string[];
  features: string[];
} {
  const rewards: { themes: string[]; features: string[] } = {
    themes: [],
    features: [],
  };

  // Theme unlocks
  if (level >= 5) rewards.themes.push('Ocean Breeze');
  if (level >= 10) rewards.themes.push('Sunset Glow');
  if (level >= 15) rewards.themes.push('Forest Canopy');
  if (level >= 20) rewards.themes.push('Cosmic Night');
  if (level >= 25) rewards.themes.push('Golden Hour');

  // Feature unlocks
  if (level >= 3) rewards.features.push('Advanced Analytics');
  if (level >= 7) rewards.features.push('Custom Themes');
  if (level >= 12) rewards.features.push('AI Insights');
  if (level >= 18) rewards.features.push('Export Reports');
  if (level >= 25) rewards.features.push('Priority Support');

  return rewards;
}
