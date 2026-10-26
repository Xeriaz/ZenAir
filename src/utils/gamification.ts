import type { HabitDifficulty, UserProfile } from '../types';

export const STREAK_FREEZE_PRICE = 100;

export function getXpRequiredForLevel(level: number): number {
  return level * 75 + 100;
}

export function getRewardsForDifficulty(difficulty: HabitDifficulty): { xp: number; gold: number } {
  switch (difficulty) {
    case 'hard':
      return { xp: 35, gold: 20 };
    case 'medium':
      return { xp: 20, gold: 10 };
    case 'easy':
    default:
      return { xp: 10, gold: 5 };
  }
}

export const BREATHING_SESSION_REWARD = {
  xp: 50,
  gold: 15
};

export function calculateStatsUpdate(
  current: UserProfile,
  xpDelta: number,
  goldDelta: number
): { updated: UserProfile; leveledUp: boolean; newLevel: number } {
  let level = current.level;
  let xp = current.xp + xpDelta;
  let gold = Math.max(0, current.gold + goldDelta);
  let leveledUp = false;

  // Handle XP reduction from negative reinforcement habits
  if (xp < 0) {
    xp = 0; // Clamped at 0 for current level, no de-leveling
  }

  // Handle Level Up progression (supports multiple level ups if huge XP)
  let xpRequired = getXpRequiredForLevel(level);
  while (xp >= xpRequired) {
    xp -= xpRequired;
    level += 1;
    gold += 25; // Bonus reward for leveling up
    leveledUp = true;
    xpRequired = getXpRequiredForLevel(level);
  }

  return {
    updated: {
      ...current,
      level,
      xp,
      gold
    },
    leveledUp,
    newLevel: level
  };
}
