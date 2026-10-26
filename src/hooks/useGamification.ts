import { useLiveQuery } from 'dexie-react-hooks';
import { db, INITIAL_USER_PROFILE } from '../db/db';
import { calculateStatsUpdate, getXpRequiredForLevel, STREAK_FREEZE_PRICE } from '../utils/gamification';

export function useGamification() {
  const profile = useLiveQuery(async () => {
    const list = await db.userProfile.toArray();
    return list[0] ?? INITIAL_USER_PROFILE;
  }, []);

  const currentProfile = profile ?? INITIAL_USER_PROFILE;
  const xpRequired = getXpRequiredForLevel(currentProfile.level);
  const progressPercent = Math.min(100, Math.round((currentProfile.xp / xpRequired) * 100));

  const addXpAndGold = async (xpDelta: number, goldDelta: number) => {
    const current = (await db.userProfile.toCollection().first()) ?? INITIAL_USER_PROFILE;
    const { updated, leveledUp, newLevel } = calculateStatsUpdate(current, xpDelta, goldDelta);
    await db.userProfile.put(updated);
    return { leveledUp, newLevel };
  };

  const buyStreakFreeze = async (): Promise<boolean> => {
    const current = (await db.userProfile.toCollection().first()) ?? INITIAL_USER_PROFILE;
    if (current.gold < STREAK_FREEZE_PRICE) {
      return false;
    }

    await db.userProfile.put({
      ...current,
      gold: current.gold - STREAK_FREEZE_PRICE,
      streakFreezes: current.streakFreezes + 1
    });

    return true;
  };

  const updatePreferences = async (updates: Partial<{
    defaultBreathingId: string;
    preferredSessionMinutes: number;
    theme: 'dark' | 'light';
  }>) => {
    const current = (await db.userProfile.toCollection().first()) ?? INITIAL_USER_PROFILE;
    await db.userProfile.put({
      ...current,
      ...updates
    });
  };

  return {
    profile: currentProfile,
    xpRequired,
    progressPercent,
    addXpAndGold,
    buyStreakFreeze,
    updatePreferences
  };
}
