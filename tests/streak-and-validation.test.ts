import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateStreakFromDates,
  get90DayGridDates,
  formatDaysOfWeek,
  isHabitScheduledForDate,
  isHabitScheduledForToday
} from '../src/utils/dates';
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

describe('Days of the Week Scheduling & Formatting', () => {
  it('formats everyday correctly in EN and LT', () => {
    expect(formatDaysOfWeek(undefined, 'en')).toBe('Every day');
    expect(formatDaysOfWeek([], 'en')).toBe('Every day');
    expect(formatDaysOfWeek([0, 1, 2, 3, 4, 5, 6], 'en')).toBe('Every day');

    expect(formatDaysOfWeek(undefined, 'lt')).toBe('Kasdien');
    expect(formatDaysOfWeek([], 'lt')).toBe('Kasdien');
    expect(formatDaysOfWeek([0, 1, 2, 3, 4, 5, 6], 'lt')).toBe('Kasdien');
  });

  it('formats weekdays and weekends correctly', () => {
    expect(formatDaysOfWeek([1, 2, 3, 4, 5], 'en')).toBe('Weekdays');
    expect(formatDaysOfWeek([1, 2, 3, 4, 5], 'lt')).toBe('Darbo d.');

    expect(formatDaysOfWeek([6, 0], 'en')).toBe('Weekends');
    expect(formatDaysOfWeek([0, 6], 'lt')).toBe('Savaitgaliai');
  });

  it('formats custom days sorted starting from Monday', () => {
    // Monday, Wednesday, Friday
    expect(formatDaysOfWeek([5, 1, 3], 'en')).toBe('Mon, Wed, Fri');
    expect(formatDaysOfWeek([5, 1, 3], 'lt')).toBe('Pr, Tr, Pn');

    // Sunday and Tuesday
    expect(formatDaysOfWeek([0, 2], 'en')).toBe('Tue, Sun');
    expect(formatDaysOfWeek([0, 2], 'lt')).toBe('An, Sk');
  });

  it('determines if habit is scheduled for date correctly', () => {
    // 2026-10-26 is Monday (day 1)
    // 2026-10-27 is Tuesday (day 2)
    // 2026-10-28 is Wednesday (day 3)
    // 2026-11-01 is Sunday (day 0)
    const weekdayHabit = [1, 2, 3, 4, 5];
    const weekendHabit = [6, 0];

    expect(isHabitScheduledForDate(weekdayHabit, '2026-10-26')).toBe(true);
    expect(isHabitScheduledForDate(weekdayHabit, '2026-11-01')).toBe(false);

    expect(isHabitScheduledForDate(weekendHabit, '2026-10-26')).toBe(false);
    expect(isHabitScheduledForDate(weekendHabit, '2026-11-01')).toBe(true);

    // If daysOfWeek undefined or empty, it is scheduled every day
    expect(isHabitScheduledForDate(undefined, '2026-10-26')).toBe(true);
    expect(isHabitScheduledForDate([], '2026-11-01')).toBe(true);

    const todayDay = new Date().getDay();
    expect(isHabitScheduledForToday([todayDay])).toBe(true);
    expect(isHabitScheduledForToday([(todayDay + 1) % 7])).toBe(false);
    expect(isHabitScheduledForToday(undefined)).toBe(true);
  });
});

describe('Database Backup Validation Robustness', () => {
  beforeEach(async () => {
    await db.habits.clear();
    await db.habits.add({
      title: 'Protected Habit',
      type: 'daily',
      timeOfDay: 'morning',
      scheduledTime: '08:00',
      daysOfWeek: [1, 3, 5],
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

  it('successfully exports and re-imports structurally valid backup including daysOfWeek', async () => {
    const exportedJson = await exportDatabaseToJson();
    const success = await importDatabaseFromJson(exportedJson);
    expect(success).toBe(true);

    const habits = await db.habits.toArray();
    expect(habits.length).toBe(1);
    expect(habits[0].title).toBe('Protected Habit');
    expect(habits[0].daysOfWeek).toEqual([1, 3, 5]);
    expect(habits[0].scheduledTime).toBe('08:00');
  });
});
