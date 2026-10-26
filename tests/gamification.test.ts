import { describe, it, expect } from 'vitest';
import { calculateStatsUpdate, getXpRequiredForLevel, getRewardsForDifficulty } from '../src/utils/gamification';
import type { UserProfile } from '../src/types';

describe('Gamification & Behavioral Psychology Engine', () => {
  const baseProfile: UserProfile = {
    id: 1,
    level: 1,
    xp: 0,
    gold: 50,
    streakFreezes: 1,
    defaultBreathingId: 'box',
    preferredSessionMinutes: 3,
    theme: 'dark'
  };

  it('should scale XP required for each level according to level curve', () => {
    expect(getXpRequiredForLevel(1)).toBe(175); // 1 * 75 + 100
    expect(getXpRequiredForLevel(2)).toBe(250); // 2 * 75 + 100
    expect(getXpRequiredForLevel(5)).toBe(475); // 5 * 75 + 100
  });

  it('should award correct XP and Gold by habit difficulty', () => {
    expect(getRewardsForDifficulty('easy')).toEqual({ xp: 10, gold: 5 });
    expect(getRewardsForDifficulty('medium')).toEqual({ xp: 20, gold: 10 });
    expect(getRewardsForDifficulty('hard')).toEqual({ xp: 35, gold: 20 });
  });

  it('should trigger level up and bonus gold when XP exceeds requirement', () => {
    // Level 1 needs 175 XP. Gaining 185 XP should trigger level up to Level 2 with 10 leftover XP and +25 bonus gold
    const { updated, leveledUp, newLevel } = calculateStatsUpdate(baseProfile, 185, 10);

    expect(leveledUp).toBe(true);
    expect(newLevel).toBe(2);
    expect(updated.level).toBe(2);
    expect(updated.xp).toBe(10);
    expect(updated.gold).toBe(85); // 50 + 10 + 25
  });

  it('should clamp XP to 0 without de-leveling on negative habit clicks', () => {
    const profileWithXp: UserProfile = {
      ...baseProfile,
      level: 3,
      xp: 5
    };

    // Deduct 20 XP
    const { updated, leveledUp } = calculateStatsUpdate(profileWithXp, -20, 0);

    expect(leveledUp).toBe(false);
    expect(updated.level).toBe(3);
    expect(updated.xp).toBe(0); // clamped to 0
  });
});
