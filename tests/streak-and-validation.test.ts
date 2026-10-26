import { describe, it, expect, beforeEach } from 'vitest';
import { calculateStreakFromDates, get90DayGridDates } from '../src/utils/dates';
import { db, importDatabaseFromJson, exportDatabaseToJson } from '../src/db/db';

describe('Streak Calculation & Decay Mechanics', () => {
  const today = '2026-10-26';
  const yesterday = '2026-10-25';

  it('calculates streak when completed today and consecutive previous days', () => {
    const logs = ['2026-10-26', '2026-10-25', '2026-10-24', '2026-10-23'];
    expect(calculateStreakFromDates(logs, today, yesterday)).toBe(4);
  });

  it('preserves active streak when completed yesterday but not yet completed today', () => {
    const logs = ['2026-10-25', '2026-10-24', '2026-10-23'];
    expect(calculateStreakFromDates(logs, today, yesterday)).toBe(3);
  });

  it('resets streak to 0 if inactive (neither today nor yesterday logged)', () => {
    // Last logged 2 days ago
    const logs = ['2026-10-24', '2026-10-23', '2026-10-22'];
    expect(calculateStreakFromDates(logs, today, yesterday)).toBe(0);
  });

  it('resets streak to 0 on empty logs', () => {
    expect(calculateStreakFromDates([], today, yesterday)).toBe(0);
  });

  it('calculates streak of 1 when completed today after breaking a previous streak', () => {
    // Logged today, but missed yesterday
    const logs = ['2026-10-26', '2026-10-23', '2026-10-22'];
    expect(calculateStreakFromDates(logs, today, yesterday)).toBe(1);
  });
});

describe('90-Day Heatmap Grid Alignment', () => {
  it('pads grid so the first cell is always Sunday (dayOfWeek === 0)', () => {
    const grid = get90DayGridDates();
    expect(grid.length).toBeGreaterThanOrEqual(90);
    expect(grid[0].dayOfWeek).toBe(0); // Row 0 is consistently Sunday
  });
});

describe('Database Backup Validation Robustness', () => {
  beforeEach(async () => {
    await db.habits.clear();
    await db.habits.add({
      title: 'Protected Habit',
      type: 'daily',
      timeOfDay: 'morning',
      streak: 5,
      bestStreak: 10,
      difficulty: 'easy',
      createdAt: new Date().toISOString(),
      archived: false
    });
  });

  it('rejects backup with invalid habit objects without wiping existing database', async () => {
    const invalidBackup = JSON.stringify({
      version: 1,
      userProfile: [{ id: 1 }],
      habits: [{ invalidKey: true }] // Missing title, type, timeOfDay
    });

    await expect(importDatabaseFromJson(invalidBackup)).rejects.toThrow(
      'Invalid habit records detected in backup'
    );

    // Verify existing habit was NOT deleted
    const count = await db.habits.count();
    expect(count).toBe(1);
    const existing = await db.habits.toArray();
    expect(existing[0].title).toBe('Protected Habit');
  });

  it('successfully exports and re-imports structurally valid backup', async () => {
    const exportedJson = await exportDatabaseToJson();
    const success = await importDatabaseFromJson(exportedJson);
    expect(success).toBe(true);

    const habits = await db.habits.toArray();
    expect(habits.length).toBe(1);
    expect(habits[0].title).toBe('Protected Habit');
  });
});
