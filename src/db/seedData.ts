import { subDays, format } from 'date-fns';
import { db, INITIAL_USER_PROFILE, INITIAL_HABITS } from './db';
import type { Habit, HabitLog, TaskItem, BreathingLog, BreathingExerciseId } from '../types';
import { calculateStatsUpdate, getRewardsForDifficulty } from '../utils/gamification';

const EXTRA_SAMPLE_HABITS: Omit<Habit, 'id'>[] = [
  {
    title: 'Morning Sunlight & Walk',
    type: 'daily',
    timeOfDay: 'morning',
    scheduledTime: '07:00',
    streak: 6,
    bestStreak: 18,
    difficulty: 'medium',
    createdAt: subDays(new Date(), 50).toISOString(),
    archived: false
  },
  {
    title: '10,000 Daily Steps',
    type: 'daily',
    timeOfDay: 'afternoon',
    scheduledTime: '17:00',
    streak: 8,
    bestStreak: 21,
    difficulty: 'hard',
    createdAt: subDays(new Date(), 50).toISOString(),
    archived: false
  },
  {
    title: 'Mindful Breathing Break',
    type: 'positive_negative',
    timeOfDay: 'anytime',
    streak: 12,
    bestStreak: 24,
    difficulty: 'easy',
    createdAt: subDays(new Date(), 50).toISOString(),
    archived: false
  }
];

const SAMPLE_TASKS_TITLES = [
  'Deep Focus Architecture Sprint',
  'Code Review & Refactoring',
  'Team Sync & Strategy Planning',
  'Read 20 Pages Non-fiction',
  'Evening Mobility & Foam Roll',
  'Weekly Goal Review & Journal',
  'Inbox Zero & Clean Workspace'
];

const BREATHING_IDS: BreathingExerciseId[] = ['box', 'relax_478', 'wim_hof', 'coherent_55', 'physio_sigh'];

/**
 * Generates ~50 days of realistic history for habits, breathing sessions, and tasks.
 */
export async function generate50DaysDemoData(): Promise<void> {
  await db.transaction('rw', [db.userProfile, db.habits, db.habitLogs, db.tasks, db.breathingLogs], async () => {
    // 1. Ensure habits exist
    let habits = await db.habits.toArray();
    if (habits.length === 0) {
      const allSampleHabits = [...INITIAL_HABITS, ...EXTRA_SAMPLE_HABITS];
      await db.habits.bulkAdd(allSampleHabits as Habit[]);
      habits = await db.habits.toArray();
    } else if (habits.length < 5) {
      await db.habits.bulkAdd(EXTRA_SAMPLE_HABITS as Habit[]);
      habits = await db.habits.toArray();
    }

    // 2. Clear old logs before generating fresh ~50 days history
    await db.habitLogs.clear();
    await db.breathingLogs.clear();
    await db.tasks.clear();

    const habitLogs: HabitLog[] = [];
    const breathingLogs: BreathingLog[] = [];
    const taskItems: TaskItem[] = [];

    let totalXpEarned = 0;
    let totalGoldEarned = 0;

    const today = new Date();

    // Track streaks per habit as we simulate 50 days
    const habitStreakTracker = new Map<number, { current: number; best: number }>();
    habits.forEach((h) => {
      if (h.id) habitStreakTracker.set(h.id, { current: 0, best: 0 });
    });

    // Iterate through past 50 days (from 49 days ago up to 0 = today)
    for (let dayOffset = 49; dayOffset >= 0; dayOffset--) {
      const dayDate = subDays(today, dayOffset);
      const dateStr = format(dayDate, 'yyyy-MM-dd');
      const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;

      // Deterministic yet realistic pseudorandom completion (seed based on offset and index)
      for (let hIdx = 0; hIdx < habits.length; hIdx++) {
        const habit = habits[hIdx];
        if (!habit.id) continue;

        // Completion rate between 70% and 85%
        const pseudoRand = ((dayOffset * 17 + hIdx * 31) % 100) / 100;
        const completionThreshold = isWeekend ? 0.35 : 0.22; // slightly more misses on weekends
        const completed = pseudoRand > completionThreshold;

        const tracker = habitStreakTracker.get(habit.id) || { current: 0, best: 0 };

        if (completed) {
          tracker.current += 1;
          if (tracker.current > tracker.best) {
            tracker.best = tracker.current;
          }

          const rewards = getRewardsForDifficulty(habit.difficulty);
          const count = habit.type === 'positive_negative' ? Math.floor(pseudoRand * 4) + 1 : 1;
          const xp = rewards.xp * (habit.type === 'positive_negative' ? count : 1);
          const gold = rewards.gold * (habit.type === 'positive_negative' ? count : 1);

          totalXpEarned += xp;
          totalGoldEarned += gold;

          habitLogs.push({
            habitId: habit.id,
            date: dateStr,
            count,
            xpEarned: xp,
            timestamp: dayDate.getTime() + 1000 * (3600 * 8 + hIdx * 1800)
          });
        } else {
          // Missed day: streak resets (or freeze preserved if within 1 day)
          if (dayOffset > 0) {
            tracker.current = 0;
          }
        }

        habitStreakTracker.set(habit.id, tracker);
      }

      // Add breathing sessions for ~60% of the days
      const breathRand = ((dayOffset * 23 + 7) % 100) / 100;
      if (breathRand > 0.38) {
        const exerciseId = BREATHING_IDS[(dayOffset + 2) % BREATHING_IDS.length];
        const durations = [180, 300, 300, 600]; // 3m, 5m, 10m
        const durationSeconds = durations[dayOffset % durations.length];

        breathingLogs.push({
          exerciseId,
          durationSeconds,
          completedAt: new Date(dayDate.getTime() + 1000 * 3600 * 20).toISOString()
        });

        totalXpEarned += 50;
        totalGoldEarned += 15;
      }

      // Add 2-3 daily tasks for the past 7 days and today
      if (dayOffset <= 7) {
        const taskCount = 2 + (dayOffset % 2);
        for (let t = 0; t < taskCount; t++) {
          const title = SAMPLE_TASKS_TITLES[(dayOffset * 2 + t) % SAMPLE_TASKS_TITLES.length];
          const startHours = 9 + t * 3;
          const startStr = `${startHours < 10 ? '0' : ''}${startHours}:00`;
          const isTaskDone = dayOffset > 0 ? ((dayOffset + t) % 4 !== 0) : t === 0;

          if (isTaskDone) {
            totalXpEarned += 15;
            totalGoldEarned += 5;
          }

          taskItems.push({
            title,
            date: dateStr,
            startTime: startStr,
            durationMinutes: 30 + (t % 2) * 15,
            completed: isTaskDone,
            createdAt: dayDate.toISOString()
          });
        }
      }
    }

    // 3. Update habit records with their calculated streaks
    for (const habit of habits) {
      if (habit.id) {
        const tracker = habitStreakTracker.get(habit.id);
        if (tracker) {
          await db.habits.update(habit.id, {
            streak: tracker.current,
            bestStreak: Math.max(tracker.best, tracker.current, 5)
          });
        }
      }
    }

    // 4. Save bulk logs
    await db.habitLogs.bulkAdd(habitLogs);
    await db.breathingLogs.bulkAdd(breathingLogs);
    await db.tasks.bulkAdd(taskItems);

    // 5. Update user profile to reflect all accumulated XP & Gold
    let profile = (await db.userProfile.toCollection().first()) ?? INITIAL_USER_PROFILE;
    profile = {
      ...profile,
      level: 1,
      xp: 0,
      gold: 150,
      streakFreezes: 3
    };

    const { updated } = calculateStatsUpdate(profile, totalXpEarned, totalGoldEarned);
    await db.userProfile.put(updated);
  });
}
