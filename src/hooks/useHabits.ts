import { useLiveQuery } from 'dexie-react-hooks';
import { db, INITIAL_USER_PROFILE } from '../db/db';
import type { Habit, HabitDifficulty, HabitLog, HabitType, TimeOfDay } from '../types';
import { getTodayDateString, getYesterdayDateString } from '../utils/dates';
import { calculateStatsUpdate, getRewardsForDifficulty } from '../utils/gamification';

export function useHabits() {
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();

  const habits = useLiveQuery(async () => {
    return await db.habits.filter(h => !h.archived).toArray();
  }, []);

  const todayLogs = useLiveQuery(async () => {
    return await db.habitLogs.where('date').equals(todayStr).toArray();
  }, [todayStr]);

  const activeHabits = habits ?? [];
  const logsMap = new Map<number, HabitLog>();
  (todayLogs ?? []).forEach(log => logsMap.set(log.habitId, log));

  const toggleDailyHabit = async (habitId: number): Promise<{ completed: boolean; leveledUp: boolean; xpEarned: number }> => {
    const habit = await db.habits.get(habitId);
    if (!habit) return { completed: false, leveledUp: false, xpEarned: 0 };

    const existingLog = await db.habitLogs
      .where('[habitId+date]')
      .equals([habitId, todayStr])
      .first();

    const rewards = getRewardsForDifficulty(habit.difficulty);
    const profile = (await db.userProfile.toCollection().first()) ?? INITIAL_USER_PROFILE;

    if (existingLog) {
      // Uncheck / Undo completion
      if (existingLog.id) {
        await db.habitLogs.delete(existingLog.id);
      }
      
      const newStreak = Math.max(0, habit.streak - 1);
      await db.habits.update(habitId, { streak: newStreak });

      // Deduct rewards
      const { updated } = calculateStatsUpdate(profile, -rewards.xp, -rewards.gold);
      await db.userProfile.put(updated);

      return { completed: false, leveledUp: false, xpEarned: 0 };
    } else {
      // Check yesterday's log to calculate streak
      const yesterdayLog = await db.habitLogs
        .where('[habitId+date]')
        .equals([habitId, yesterdayStr])
        .first();

      let newStreak = habit.streak;

      if (yesterdayLog) {
        newStreak = habit.streak + 1;
      } else {
        // Streak broken or brand new
        newStreak = 1;
      }

      const bestStreak = Math.max(habit.bestStreak || 0, newStreak);
      await db.habits.update(habitId, { streak: newStreak, bestStreak });

      // Add log
      await db.habitLogs.add({
        habitId,
        date: todayStr,
        count: 1,
        xpEarned: rewards.xp,
        timestamp: Date.now()
      });

      // Award XP & Gold in background
      const { updated, leveledUp } = calculateStatsUpdate(profile, rewards.xp, rewards.gold);
      await db.userProfile.put(updated);

      return { completed: true, leveledUp, xpEarned: rewards.xp };
    }
  };

  const logHabitCounter = async (habitId: number, isPositive: boolean): Promise<{ count: number; leveledUp: boolean }> => {
    const habit = await db.habits.get(habitId);
    if (!habit) return { count: 0, leveledUp: false };

    const existingLog = await db.habitLogs
      .where('[habitId+date]')
      .equals([habitId, todayStr])
      .first();

    const rewards = getRewardsForDifficulty(habit.difficulty);
    const profile = (await db.userProfile.toCollection().first()) ?? INITIAL_USER_PROFILE;

    const xpDelta = isPositive ? rewards.xp : -10;
    const goldDelta = isPositive ? rewards.gold : 0;

    let newCount = (existingLog?.count ?? 0) + (isPositive ? 1 : -1);

    if (existingLog && existingLog.id) {
      await db.habitLogs.update(existingLog.id, {
        count: newCount,
        xpEarned: existingLog.xpEarned + xpDelta,
        timestamp: Date.now()
      });
    } else {
      await db.habitLogs.add({
        habitId,
        date: todayStr,
        count: Math.max(1, newCount),
        xpEarned: Math.max(0, xpDelta),
        timestamp: Date.now()
      });
    }

    if (isPositive) {
      const newStreak = Math.max(1, habit.streak + 1);
      const bestStreak = Math.max(habit.bestStreak, newStreak);
      await db.habits.update(habitId, { streak: newStreak, bestStreak });
    }

    const { updated, leveledUp } = calculateStatsUpdate(profile, xpDelta, goldDelta);
    await db.userProfile.put(updated);

    return { count: newCount, leveledUp };
  };

  const createHabit = async (data: {
    title: string;
    type: HabitType;
    timeOfDay: TimeOfDay;
    scheduledTime?: string;
    difficulty: HabitDifficulty;
  }) => {
    return await db.habits.add({
      ...data,
      streak: 0,
      bestStreak: 0,
      createdAt: new Date().toISOString(),
      archived: false
    });
  };

  const updateHabit = async (id: number, data: Partial<Habit>) => {
    return await db.habits.update(id, data);
  };

  const deleteHabit = async (id: number) => {
    await db.transaction('rw', [db.habits, db.habitLogs], async () => {
      await db.habits.delete(id);
      await db.habitLogs.where('habitId').equals(id).delete();
    });
  };

  return {
    habits: activeHabits,
    todayLogsMap: logsMap,
    toggleDailyHabit,
    logHabitCounter,
    createHabit,
    updateHabit,
    deleteHabit
  };
}
