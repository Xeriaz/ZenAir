import { useLiveQuery } from 'dexie-react-hooks';
import { db, INITIAL_USER_PROFILE } from '../db/db';

export function useGamification() {
  const profile = useLiveQuery(async () => {
    const list = await db.userProfile.toArray();
    return list[0] ?? INITIAL_USER_PROFILE;
  }, []);

  const currentProfile = profile ?? INITIAL_USER_PROFILE;

  const updatePreferences = async (
    updates: Partial<{
      defaultBreathingId: string;
      preferredSessionMinutes: number;
      theme: 'dark' | 'light';
      vibrationEnabled: boolean;
    }>
  ) => {
    const current = (await db.userProfile.toCollection().first()) ?? INITIAL_USER_PROFILE;
    await db.userProfile.put({
      ...current,
      ...updates
    });
  };

  return {
    profile: currentProfile,
    updatePreferences
  };
}
