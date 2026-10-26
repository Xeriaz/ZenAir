import { describe, it, expect, beforeEach } from 'vitest';
import { db, initializeDatabase, exportDatabaseToJson, importDatabaseFromJson } from '../src/db/db';

describe('ZenAir Database Layer (Dexie.js + fake-indexeddb)', () => {
  beforeEach(async () => {
    await db.userProfile.clear();
    await db.habits.clear();
    await db.habitLogs.clear();
    await db.tasks.clear();
    await db.breathingLogs.clear();
  });

  it('should seed initial user profile and sample habits on empty start', async () => {
    await initializeDatabase();

    const profile = await db.userProfile.toArray();
    expect(profile.length).toBe(1);
    expect(profile[0].level).toBe(1);
    expect(profile[0].streakFreezes).toBe(2);

    const habits = await db.habits.toArray();
    expect(habits.length).toBeGreaterThan(0);
    expect(habits[0].title).toBeDefined();
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
