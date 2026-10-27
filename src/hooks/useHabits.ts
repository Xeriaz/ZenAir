import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { Habit, HabitDifficulty, HabitLog, HabitType, TimeOfDay } from '../types';
import { getTodayDateString, getYesterdayDateString, calculateStreakFromDates } from '../utils/dates';

export function useHabits() {
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();

  const habits = useLiveQuery(async () => {
    return await db.habits.filter((h) => !h.archived).toArray();
  }, []);

  const todayLogs = useLiveQuery(async () => {
    return await db.habitLogs.where('date').equals(todayStr).toArray();
  }, [todayStr]);

  // Query logs for computing dynamic streak progression
  const allHabitLogs = useLiveQuery(async () => {
    return await db.habitLogs.toArray();
  }, []);

  const logsMap = new Map<number, HabitLog>();
  (todayLogs ?? []).forEach((log) => logsMap.set(log.habitId, log));

  // Map dates per habit to derive active streak dynamically
  const datesByHabit = new Map<number, string[]>();
  (allHabitLogs ?? []).forEach((log) => {
    if (log.count > 0) {
      const dates = datesByHabit.get(log.habitId) || [];
      dates.push(log.date);
      datesByHabit.set(log.habitId, dates);
    }
  });

  const activeHabits = (habits ?? []).map((h) => {
    if (!h.id) return h;
    const dates = datesByHabit.get(h.id) || [];
    const currentStreak = calculateStreakFromDates(dates, todayStr, yesterdayStr);
    const bestStreak = Math.max(h.bestStreak || 0, currentStreak);
    return {
      ...h,
      streak: currentStreak,
      bestStreak
    };
  });

  const toggleDailyHabit = async (habitId: number): Promise<{ completed: boolean }> => {
    return await db.transaction('rw', [db.habits, db.habitLogs], async () => {
      const habit = await db.habits.get(habitId);
      if (!habit) return { completed: false };

      const existingLog = await db.habitLogs
        .where('[habitId+date]')
        .equals([habitId, todayStr])
        .first();

      if (existingLog && existingLog.id) {
        // Uncheck / Undo completion
        await db.habitLogs.delete(existingLog.id);
        return { completed: false };
      } else {
        // Add completion log for today
        await db.habitLogs.add({
          habitId,
          date: todayStr,
          count: 1,
          xpEarned: 0,
          timestamp: Date.now()
        });

        // Update persistent bestStreak if current streak surpasses it
        const dates = [...(datesByHabit.get(habitId) || []), todayStr];
        const newStreak = calculateStreakFromDates(dates, todayStr, yesterdayStr);
        if (newStreak > (habit.bestStreak || 0)) {
          await db.habits.update(habitId, { bestStreak: newStreak });
        }

        return { completed: true };
      }
    });
  };

  const logHabitCounter = async (habitId: number, isPositive: boolean): Promise<{ count: number }> => {
    return await db.transaction('rw', [db.habits, db.habitLogs], async () => {
      const habit = await db.habits.get(habitId);
      if (!habit) return { count: 0 };

      const existingLog = await db.habitLogs
        .where('[habitId+date]')
        .equals([habitId, todayStr])
        .first();

      const newCount = Math.max(0, (existingLog?.count ?? 0) + (isPositive ? 1 : -1));

      if (existingLog && existingLog.id) {
        if (newCount === 0) {
          await db.habitLogs.delete(existingLog.id);
        } else {
          await db.habitLogs.update(existingLog.id, {
            count: newCount,
            timestamp: Date.now()
          });
        }
      } else if (newCount > 0) {
        await db.habitLogs.add({
          habitId,
          date: todayStr,
          count: newCount,
          xpEarned: 0,
          timestamp: Date.now()
        });
      }

      return { count: newCount };
    });
  };

  const createHabit = async (data: {
    title: string;
    type: HabitType;
    timeOfDay: TimeOfDay;
    scheduledTime?: string;
    daysOfWeek?: number[];
    difficulty: HabitDifficulty;
  }) => {
    return await db.habits.add({
      ...data,
      daysOfWeek: data.daysOfWeek && data.daysOfWeek.length > 0 ? data.daysOfWeek : [0, 1, 2, 3, 4, 5, 6],
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
