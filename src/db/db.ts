import Dexie, { type Table } from 'dexie';
import type { Habit, HabitLog, TaskItem, BreathingLog, UserProfile, DatabaseBackup } from '../types';

export class ZenAirDatabase extends Dexie {
  habits!: Table<Habit, number>;
  habitLogs!: Table<HabitLog, number>;
  tasks!: Table<TaskItem, number>;
  breathingLogs!: Table<BreathingLog, number>;
  userProfile!: Table<UserProfile, number>;

  constructor() {
    super('ZenAirDB');
    this.version(1).stores({
      habits: '++id, title, type, timeOfDay, scheduledTime, streak, bestStreak, difficulty, createdAt, archived',
      habitLogs: '++id, habitId, date, count, xpEarned, timestamp, [habitId+date]',
      tasks: '++id, title, date, startTime, durationMinutes, completed, createdAt, [date+completed]',
      breathingLogs: '++id, exerciseId, durationSeconds, completedAt',
      userProfile: '++id, level, xp, gold, streakFreezes, defaultBreathingId, preferredSessionMinutes, theme'
    });
    this.version(2).stores({
      habitLogs: '++id, habitId, date, count, xpEarned, timestamp, &[habitId+date]'
    });
  }
}

export const db = new ZenAirDatabase();

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 1,
  level: 1,
  xp: 0,
  gold: 0,
  streakFreezes: 0,
  defaultBreathingId: 'box',
  preferredSessionMinutes: 3,
  theme: 'dark'
};

export const INITIAL_HABITS: Omit<Habit, 'id'>[] = [
  {
    title: 'Morning Hydration (500ml)',
    type: 'daily',
    timeOfDay: 'morning',
    scheduledTime: '07:30',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    streak: 0,
    bestStreak: 0,
    difficulty: 'easy',
    createdAt: new Date().toISOString(),
    archived: false
  },
  {
    title: 'Guided Breathing Reset',
    type: 'daily',
    timeOfDay: 'morning',
    scheduledTime: '08:00',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    streak: 0,
    bestStreak: 0,
    difficulty: 'easy',
    createdAt: new Date().toISOString(),
    archived: false
  },
  {
    title: 'Focused Work Sprint',
    type: 'daily',
    timeOfDay: 'afternoon',
    scheduledTime: '14:00',
    daysOfWeek: [1, 2, 3, 4, 5],
    streak: 0,
    bestStreak: 0,
    difficulty: 'medium',
    createdAt: new Date().toISOString(),
    archived: false
  },
  {
    title: 'Mindful Posture & Stretch',
    type: 'positive_negative',
    timeOfDay: 'anytime',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    streak: 0,
    bestStreak: 0,
    difficulty: 'easy',
    createdAt: new Date().toISOString(),
    archived: false
  },
  {
    title: 'Evening Screen-Free Wind-down',
    type: 'daily',
    timeOfDay: 'evening',
    scheduledTime: '21:30',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    streak: 0,
    bestStreak: 0,
    difficulty: 'easy',
    createdAt: new Date().toISOString(),
    archived: false
  }
];

/**
 * Initializes the database when opened for the first time.
 * Only ensures the initial clean user profile exists without seeding dummy data.
 */
export async function initializeDatabase(): Promise<void> {
  const profileCount = await db.userProfile.count();
  if (profileCount === 0) {
    await db.userProfile.put(INITIAL_USER_PROFILE);
  }
}

/**
 * Resets all database tables: clears habits, habit logs, tasks, breathing logs,
 * and resets user profile to the clean initial state.
 */
export async function resetAllDatabaseData(): Promise<void> {
  await db.transaction('rw', [db.userProfile, db.habits, db.habitLogs, db.tasks, db.breathingLogs], async () => {
    await db.habits.clear();
    await db.habitLogs.clear();
    await db.tasks.clear();
    await db.breathingLogs.clear();
    await db.userProfile.clear();
    await db.userProfile.put(INITIAL_USER_PROFILE);
  });
}

/**
 * Serializes all Dexie tables into a clean JSON string.
 */
export async function exportDatabaseToJson(): Promise<string> {
  const [profile, habits, habitLogs, tasks, breathingLogs] = await Promise.all([
    db.userProfile.toArray(),
    db.habits.toArray(),
    db.habitLogs.toArray(),
    db.tasks.toArray(),
    db.breathingLogs.toArray()
  ]);

  const backupData: DatabaseBackup = {
    version: 1,
    exportDate: new Date().toISOString(),
    userProfile: profile,
    habits,
    habitLogs,
    tasks,
    breathingLogs
  };

  return JSON.stringify(backupData, null, 2);
}

/**
 * Generates and triggers browser download of the exported JSON backup file.
 */
export async function downloadDatabaseBackup(): Promise<void> {
  const json = await exportDatabaseToJson();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  a.href = url;
  a.download = `zenair-backup-${timestamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function isValidHabit(h: unknown): h is Habit {
  return (
    typeof h === 'object' &&
    h !== null &&
    typeof (h as Habit).title === 'string' &&
    typeof (h as Habit).type === 'string' &&
    typeof (h as Habit).timeOfDay === 'string' &&
    ((h as Habit).daysOfWeek === undefined ||
      (Array.isArray((h as Habit).daysOfWeek) &&
        (h as Habit).daysOfWeek!.every((d) => typeof d === 'number' && d >= 0 && d <= 6)))
  );
}

function isValidTask(t: unknown): t is TaskItem {
  return (
    typeof t === 'object' &&
    t !== null &&
    typeof (t as TaskItem).title === 'string' &&
    typeof (t as TaskItem).date === 'string'
  );
}

function isValidHabitLog(l: unknown): l is HabitLog {
  return (
    typeof l === 'object' &&
    l !== null &&
    typeof (l as HabitLog).habitId === 'number' &&
    typeof (l as HabitLog).date === 'string'
  );
}

function isValidBreathingLog(b: unknown): b is BreathingLog {
  return (
    typeof b === 'object' &&
    b !== null &&
    typeof (b as BreathingLog).exerciseId === 'string' &&
    typeof (b as BreathingLog).durationSeconds === 'number'
  );
}

/**
 * Imports a JSON string into Dexie, replacing existing tables safely inside a transaction.
 * Performs rigorous pre-validation to avoid database corruption or wiping data on invalid files.
 */
export async function importDatabaseFromJson(jsonString: string): Promise<boolean> {
  try {
    const data: DatabaseBackup = JSON.parse(jsonString);

    if (!data.version || !Array.isArray(data.habits) || !Array.isArray(data.userProfile)) {
      throw new Error('Invalid backup file schema: missing required tables');
    }

    // Pre-validate all records before opening the write transaction
    if (!data.habits.every(isValidHabit)) {
      throw new Error('Invalid habit records detected in backup');
    }

    if (data.tasks && !data.tasks.every(isValidTask)) {
      throw new Error('Invalid task records detected in backup');
    }

    if (data.habitLogs && !data.habitLogs.every(isValidHabitLog)) {
      throw new Error('Invalid habit log records detected in backup');
    }

    if (data.breathingLogs && !data.breathingLogs.every(isValidBreathingLog)) {
      throw new Error('Invalid breathing log records detected in backup');
    }

    await db.transaction('rw', [db.userProfile, db.habits, db.habitLogs, db.tasks, db.breathingLogs], async () => {
      // Clear existing records
      await db.userProfile.clear();
      await db.habits.clear();
      await db.habitLogs.clear();
      await db.tasks.clear();
      await db.breathingLogs.clear();

      // Bulk restore
      if (data.userProfile.length > 0) {
        await db.userProfile.bulkPut(data.userProfile);
      } else {
        await db.userProfile.put(INITIAL_USER_PROFILE);
      }

      if (data.habits.length > 0) {
        await db.habits.bulkPut(data.habits);
      }

      if (data.habitLogs && data.habitLogs.length > 0) {
        await db.habitLogs.bulkPut(data.habitLogs);
      }

      if (data.tasks && data.tasks.length > 0) {
        await db.tasks.bulkPut(data.tasks);
      }

      if (data.breathingLogs && data.breathingLogs.length > 0) {
        await db.breathingLogs.bulkPut(data.breathingLogs);
      }
    });

    return true;
  } catch (error) {
    console.error('Failed to import database backup:', error);
    throw error;
  }
}
