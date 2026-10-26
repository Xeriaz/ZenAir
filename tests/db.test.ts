import { describe, it, expect, beforeEach } from 'vitest';
import { db, initializeDatabase, resetAllDatabaseData, exportDatabaseToJson, importDatabaseFromJson } from '../src/db/db';

describe('ZenAir Database Layer (Dexie.js + fake-indexeddb)', () => {
  beforeEach(async () => {
    await db.userProfile.clear();
    await db.habits.clear();
    await db.habitLogs.clear();
    await db.tasks.clear();
    await db.breathingLogs.clear();
  });

  it('should initialize clean user profile and no dummy data on first start', async () => {
    await initializeDatabase();

    const profile = await db.userProfile.toArray();
    expect(profile.length).toBe(1);
    expect(profile[0].level).toBe(1);
    expect(profile[0].xp).toBe(0);
    expect(profile[0].gold).toBe(0);
    expect(profile[0].streakFreezes).toBe(0);

    const habits = await db.habits.toArray();
    expect(habits.length).toBe(0);

    const logs = await db.habitLogs.toArray();
    expect(logs.length).toBe(0);

    const tasks = await db.tasks.toArray();
    expect(tasks.length).toBe(0);

    const breathing = await db.breathingLogs.toArray();
    expect(breathing.length).toBe(0);
  });

  it('should reset all database tables to a clean state with resetAllDatabaseData', async () => {
    // Populate some data first
    await db.habits.add({
      title: 'Temporary Habit',
      type: 'daily',
      timeOfDay: 'morning',
      streak: 5,
      bestStreak: 10,
      difficulty: 'easy',
      createdAt: new Date().toISOString(),
      archived: false
    });
    await db.tasks.add({
      title: 'Temporary Task',
      date: '2026-10-26',
      startTime: '10:00',
      durationMinutes: 45,
      completed: true,
      createdAt: new Date().toISOString()
    });
    await db.habitLogs.add({
      habitId: 1,
      date: '2026-10-26',
      count: 1,
      xpEarned: 10,
      timestamp: Date.now()
    });
    await db.breathingLogs.add({
      exerciseId: 'box',
      durationSeconds: 180,
      completedAt: new Date().toISOString()
    });
    await db.userProfile.put({
      id: 1,
      level: 5,
      xp: 200,
      gold: 150,
      streakFreezes: 3,
      defaultBreathingId: 'box',
      preferredSessionMinutes: 3,
      theme: 'dark'
    });

    expect(await db.habits.count()).toBe(1);
    expect(await db.tasks.count()).toBe(1);
    expect(await db.habitLogs.count()).toBe(1);
    expect(await db.breathingLogs.count()).toBe(1);

    // Call resetAllDatabaseData
    await resetAllDatabaseData();

    // Verify all tables are cleared
    expect(await db.habits.count()).toBe(0);
    expect(await db.tasks.count()).toBe(0);
    expect(await db.habitLogs.count()).toBe(0);
    expect(await db.breathingLogs.count()).toBe(0);

    const profile = await db.userProfile.toArray();
    expect(profile.length).toBe(1);
    expect(profile[0].level).toBe(1);
    expect(profile[0].xp).toBe(0);
    expect(profile[0].gold).toBe(0);
    expect(profile[0].streakFreezes).toBe(0);
  });

  it('should perform Habit CRUD operations reliably', async () => {
    // Create
    const habitId = await db.habits.add({
      title: 'Morning Yoga',
      type: 'daily',
      timeOfDay: 'morning',
      streak: 0,
      bestStreak: 0,
      difficulty: 'easy',
      createdAt: new Date().toISOString(),
      archived: false
    });

    // Read
    const saved = await db.habits.get(habitId);
    expect(saved?.title).toBe('Morning Yoga');

    // Update
    await db.habits.update(habitId, { streak: 5, bestStreak: 5 });
    const updated = await db.habits.get(habitId);
    expect(updated?.streak).toBe(5);

    // Delete
    await db.habits.delete(habitId);
    const deleted = await db.habits.get(habitId);
    expect(deleted).toBeUndefined();
  });

  it('should accurately serialize to JSON and restore from JSON backup', async () => {
    // Add sample habit and task
    await db.userProfile.put({
      id: 1,
      level: 4,
      xp: 120,
      gold: 240,
      streakFreezes: 3,
      defaultBreathingId: 'coherent_55',
      preferredSessionMinutes: 5,
      theme: 'dark'
    });

    await db.habits.add({
      title: 'Wim Hof Morning Breath',
      type: 'daily',
      timeOfDay: 'morning',
      streak: 12,
      bestStreak: 15,
      difficulty: 'medium',
      createdAt: new Date().toISOString(),
      archived: false
    });

    // Export to JSON
    const jsonBackup = await exportDatabaseToJson();
    expect(jsonBackup).toContain('Wim Hof Morning Breath');
    expect(jsonBackup).toContain('coherent_55');

    // Wipe tables
    await db.userProfile.clear();
    await db.habits.clear();

    expect(await db.habits.count()).toBe(0);

    // Import from JSON
    const success = await importDatabaseFromJson(jsonBackup);
    expect(success).toBe(true);

    const restoredProfile = await db.userProfile.toCollection().first();
    expect(restoredProfile?.level).toBe(4);
    expect(restoredProfile?.gold).toBe(240);

    const restoredHabits = await db.habits.toArray();
    expect(restoredHabits.length).toBe(1);
    expect(restoredHabits[0].title).toBe('Wim Hof Morning Breath');
    expect(restoredHabits[0].streak).toBe(12);
  });
});
