import { describe, it, expect } from 'vitest';
import {
  calculateCurfewTime,
  calculateFirstWindowTime,
  computeCaffeinePacing,
  formatDurationMinutes
} from '../src/utils/caffeineTiming';
import type { Habit } from '../src/types';

describe('Caffeine Pharmacokinetic Timing & Circadian Curfew (80kg Profile)', () => {
  const baseCoffeeHabit: Pick<
    Habit,
    'enablePacing' | 'intervalHours' | 'dailyCap' | 'enforceCurfew' | 'curfewTime' | 'substituteTip'
  > = {
    enablePacing: true,
    intervalHours: 3.5,
    dailyCap: 2,
    enforceCurfew: true,
    substituteTip: 'Cacao'
  };

  const userProfile = {
    wakeTime: '06:00',
    targetBedtime: '22:00'
  };

  it('calculates +90m morning adenosine clearance window from 06:00 wake time', () => {
    expect(calculateFirstWindowTime('06:00', 90)).toBe('07:30');
    expect(calculateFirstWindowTime('07:00', 90)).toBe('08:30');
  });

  it('calculates 10-hour pre-sleep curfew from 22:00 target bedtime', () => {
    expect(calculateCurfewTime('22:00', 10)).toBe('12:00');
    expect(calculateCurfewTime('23:00', 10)).toBe('13:00');
  });

  it('formats durations cleanly', () => {
    expect(formatDurationMinutes(210)).toBe('3h 30m');
    expect(formatDurationMinutes(120)).toBe('2h');
    expect(formatDurationMinutes(45)).toBe('45m');
  });

  it('returns first_delay state between 06:00 wake-up and 07:30 first window', () => {
    const now = new Date('2026-10-29T06:45:00');
    const status = computeCaffeinePacing(baseCoffeeHabit, null, userProfile, now);
    expect(status.state).toBe('first_delay');
    expect(status.canDrinkNow).toBe(false);
    expect(status.firstWindowStr).toBe('07:30');
    expect(status.remainingCooldownMinutes).toBe(45);
  });

  it('returns ready state at 08:00 when no cup has been taken yet', () => {
    const now = new Date('2026-10-29T08:00:00');
    const status = computeCaffeinePacing(baseCoffeeHabit, null, userProfile, now);
    expect(status.state).toBe('ready');
    expect(status.canDrinkNow).toBe(true);
    expect(status.curfewTimeStr).toBe('12:00');
    expect(status.remainingCupsToday).toBe(2);
  });

  it('returns cooldown state with 3.5h spacing after logging 1st Latte at 08:00', () => {
    const firstCupTime = new Date('2026-10-29T08:00:00').getTime();
    const now = new Date('2026-10-29T09:30:00'); // 1.5h later (2h left)
    const status = computeCaffeinePacing(
      baseCoffeeHabit,
      { count: 1, timestamp: firstCupTime },
      userProfile,
      now
    );

    expect(status.state).toBe('cooldown');
    expect(status.canDrinkNow).toBe(false);
    expect(status.nextEligibleTimeStr).toBe('11:30');
    expect(status.remainingCooldownMinutes).toBe(120);
    expect(status.remainingCupsToday).toBe(1);
    expect(status.lastLoggedTimeStr).toBe('08:00');
  });

  it('transitions back to ready at 11:35 (after 3.5h cooldown, before 12:00 curfew)', () => {
    const firstCupTime = new Date('2026-10-29T08:00:00').getTime();
    const now = new Date('2026-10-29T11:35:00');
    const status = computeCaffeinePacing(
      baseCoffeeHabit,
      { count: 1, timestamp: firstCupTime },
      userProfile,
      now
    );

    expect(status.state).toBe('ready');
    expect(status.canDrinkNow).toBe(true);
    expect(status.remainingCupsToday).toBe(1);
  });

  it('returns daily_cap_reached when 2 cups are logged before curfew', () => {
    const secondCupTime = new Date('2026-10-29T11:35:00').getTime();
    const now = new Date('2026-10-29T11:45:00');
    const status = computeCaffeinePacing(
      baseCoffeeHabit,
      { count: 2, timestamp: secondCupTime },
      userProfile,
      now
    );

    expect(status.state).toBe('daily_cap_reached');
    expect(status.canDrinkNow).toBe(false);
    expect(status.remainingCupsToday).toBe(0);
    expect(status.substituteTip).toBe('Cacao');
  });

  it('enforces hard curfew at and after 12:00 PM for 22:00 bedtime', () => {
    const firstCupTime = new Date('2026-10-29T08:15:00').getTime();
    const now = new Date('2026-10-29T13:30:00');
    const status = computeCaffeinePacing(
      baseCoffeeHabit,
      { count: 1, timestamp: firstCupTime },
      userProfile,
      now
    );

    expect(status.state).toBe('curfew');
    expect(status.isPastCurfew).toBe(true);
    expect(status.canDrinkNow).toBe(false);
    expect(status.curfewTimeStr).toBe('12:00');
    expect(status.substituteTip).toBe('Cacao');
  });
});
