import type { Habit, HabitLog, UserProfile } from '../types';

export type PacingState =
  | 'first_delay'
  | 'ready'
  | 'cooldown'
  | 'daily_cap_reached'
  | 'curfew';

export interface CaffeinePacingStatus {
  state: PacingState;
  canDrinkNow: boolean;
  isPastCurfew: boolean;
  curfewTimeStr: string; // e.g. "12:00"
  firstWindowStr: string; // e.g. "07:30"
  nextEligibleTimeStr: string | null; // e.g. "11:45"
  remainingCooldownMinutes: number;
  remainingCupsToday: number | null;
  dailyCap: number | null;
  substituteTip: string;
  lastLoggedTimeStr: string | null;
}

/**
 * Parses an "HH:mm" string into minutes since midnight (0 - 1439).
 * Falls back to defaultMinutes if invalid.
 */
export function parseTimeToMinutes(timeStr: string | undefined, defaultMinutes: number): number {
  if (!timeStr || !/^\d{1,2}:\d{2}$/.test(timeStr.trim())) {
    return defaultMinutes;
  }
  const [hStr, mStr] = timeStr.trim().split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    return defaultMinutes;
  }
  return h * 60 + m;
}

/**
 * Formats minutes since midnight (0 - 1439, wrapping around 24h) into "HH:mm".
 */
export function formatMinutesToTime(totalMinutes: number): string {
  const normalized = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Calculates the recommended first coffee window (default +90 minutes after wake-up
 * to allow natural cortisol peak and adenosine clearance).
 */
export function calculateFirstWindowTime(wakeTime = '06:00', delayMinutes = 90): string {
  const wakeMins = parseTimeToMinutes(wakeTime, 6 * 60);
  return formatMinutesToTime(wakeMins + delayMinutes);
}

/**
 * Calculates the hard caffeine curfew time based on target bedtime
 * (default 10 hours before bedtime, ~2 metabolic half-lives for an 80kg male).
 */
export function calculateCurfewTime(targetBedtime = '22:00', sleepBufferHours = 10): string {
  const bedMins = parseTimeToMinutes(targetBedtime, 22 * 60);
  return formatMinutesToTime(bedMins - Math.round(sleepBufferHours * 60));
}

/**
 * Formats a minute duration into a compact human string (e.g. "3h 30m" or "45m").
 */
export function formatDurationMinutes(minutes: number): string {
  const clamped = Math.max(0, Math.ceil(minutes));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  if (h > 0 && m > 0) {
    return `${h}h ${m}m`;
  }
  if (h > 0) {
    return `${h}h`;
  }
  return `${m}m`;
}

/**
 * Formats a timestamp (ms) into local "HH:mm".
 */
export function formatTimestampToTime(timestamp: number): string {
  const d = new Date(timestamp);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * Computes real-time pharmacokinetic caffeine pacing & circadian status for a habit.
 */
export function computeCaffeinePacing(
  habit: Pick<
    Habit,
    'enablePacing' | 'intervalHours' | 'dailyCap' | 'enforceCurfew' | 'curfewTime' | 'substituteTip'
  >,
  log?: Pick<HabitLog, 'count' | 'timestamp'> | null,
  profile?: Pick<UserProfile, 'wakeTime' | 'targetBedtime'> | null,
  now: Date = new Date()
): CaffeinePacingStatus {
  const wakeTime = profile?.wakeTime || '06:00';
  const targetBedtime = profile?.targetBedtime || '22:00';

  const firstWindowStr = calculateFirstWindowTime(wakeTime, 90);
  const curfewTimeStr = habit.curfewTime?.trim()
    ? habit.curfewTime.trim()
    : calculateCurfewTime(targetBedtime, 10);

  const wakeMins = parseTimeToMinutes(wakeTime, 6 * 60);
  const firstWindowMins = parseTimeToMinutes(firstWindowStr, 7 * 60 + 30);
  const curfewMins = parseTimeToMinutes(curfewTimeStr, 12 * 60);
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const intervalHours = habit.intervalHours !== undefined && habit.intervalHours > 0 ? habit.intervalHours : 3.5;
  const dailyCap = habit.dailyCap !== undefined && habit.dailyCap > 0 ? habit.dailyCap : 2;
  const enforceCurfew = habit.enforceCurfew !== false;
  const substituteTip = habit.substituteTip?.trim() || 'Cacao';

  const currentCount = log?.count ?? 0;
  const remainingCupsToday = Math.max(0, dailyCap - currentCount);
  const lastLoggedTimeStr =
    currentCount > 0 && log?.timestamp ? formatTimestampToTime(log.timestamp) : null;

  // Determine if current time is past curfew (between curfew and wake time)
  const isPastCurfew = enforceCurfew && (nowMins >= curfewMins || nowMins < wakeMins);

  if (isPastCurfew) {
    return {
      state: 'curfew',
      canDrinkNow: false,
      isPastCurfew: true,
      curfewTimeStr,
      firstWindowStr,
      nextEligibleTimeStr: firstWindowStr,
      remainingCooldownMinutes: 0,
      remainingCupsToday,
      dailyCap,
      substituteTip,
      lastLoggedTimeStr
    };
  }

  if (currentCount >= dailyCap) {
    return {
      state: 'daily_cap_reached',
      canDrinkNow: false,
      isPastCurfew: false,
      curfewTimeStr,
      firstWindowStr,
      nextEligibleTimeStr: null,
      remainingCooldownMinutes: 0,
      remainingCupsToday: 0,
      dailyCap,
      substituteTip,
      lastLoggedTimeStr
    };
  }

  // Check dose spacing interval if at least 1 cup was logged today
  if (currentCount > 0 && log?.timestamp) {
    const nextEligibleMs = log.timestamp + intervalHours * 3600 * 1000;
    const diffMs = nextEligibleMs - now.getTime();
    if (diffMs > 0) {
      const remainingCooldownMinutes = Math.ceil(diffMs / 60000);
      const nextEligibleTimeStr = formatTimestampToTime(nextEligibleMs);
      return {
        state: 'cooldown',
        canDrinkNow: false,
        isPastCurfew: false,
        curfewTimeStr,
        firstWindowStr,
        nextEligibleTimeStr,
        remainingCooldownMinutes,
        remainingCupsToday,
        dailyCap,
        substituteTip,
        lastLoggedTimeStr
      };
    }
  }

  // Check early morning cortisol/adenosine delay before 1st cup
  if (currentCount === 0 && nowMins >= wakeMins && nowMins < firstWindowMins) {
    const remainingCooldownMinutes = firstWindowMins - nowMins;
    return {
      state: 'first_delay',
      canDrinkNow: false,
      isPastCurfew: false,
      curfewTimeStr,
      firstWindowStr,
      nextEligibleTimeStr: firstWindowStr,
      remainingCooldownMinutes,
      remainingCupsToday,
      dailyCap,
      substituteTip,
      lastLoggedTimeStr
    };
  }

  return {
    state: 'ready',
    canDrinkNow: true,
    isPastCurfew: false,
    curfewTimeStr,
    firstWindowStr,
    nextEligibleTimeStr: null,
    remainingCooldownMinutes: 0,
    remainingCupsToday,
    dailyCap,
    substituteTip,
    lastLoggedTimeStr
  };
}
