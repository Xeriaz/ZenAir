import {
  format,
  subDays,
  parseISO,
  isToday,
  isYesterday,
  startOfDay,
  eachDayOfInterval,
  startOfWeek
} from 'date-fns';
import { lt as ltLocale } from 'date-fns/locale';

export interface DayOfWeekOption {
  id: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  key: string;
  shortEn: string;
  shortLt: string;
  fullEn: string;
  fullLt: string;
}

export const DAYS_OF_WEEK: DayOfWeekOption[] = [
  { id: 1, key: 'mon', shortEn: 'Mon', shortLt: 'Pr', fullEn: 'Monday', fullLt: 'Pirmadienis' },
  { id: 2, key: 'tue', shortEn: 'Tue', shortLt: 'An', fullEn: 'Tuesday', fullLt: 'Antradienis' },
  { id: 3, key: 'wed', shortEn: 'Wed', shortLt: 'Tr', fullEn: 'Wednesday', fullLt: 'Trečiadienis' },
  { id: 4, key: 'thu', shortEn: 'Thu', shortLt: 'Kt', fullEn: 'Thursday', fullLt: 'Ketvirtadienis' },
  { id: 5, key: 'fri', shortEn: 'Fri', shortLt: 'Pn', fullEn: 'Friday', fullLt: 'Penktadienis' },
  { id: 6, key: 'sat', shortEn: 'Sat', shortLt: 'Št', fullEn: 'Saturday', fullLt: 'Šeštadienis' },
  { id: 0, key: 'sun', shortEn: 'Sun', shortLt: 'Sk', fullEn: 'Sunday', fullLt: 'Sekmadienis' },
];

export function formatDaysOfWeek(days?: number[], language: 'en' | 'lt' = 'en'): string {
  if (!days || days.length === 0 || days.length === 7) {
    return language === 'lt' ? 'Kasdien' : 'Every day';
  }
  const set = new Set(days);
  const isWeekdays = days.length === 5 && [1, 2, 3, 4, 5].every((d) => set.has(d));
  if (isWeekdays) {
    return language === 'lt' ? 'Darbo d.' : 'Weekdays';
  }
  const isWeekends = days.length === 2 && [0, 6].every((d) => set.has(d));
  if (isWeekends) {
    return language === 'lt' ? 'Savaitgaliai' : 'Weekends';
  }

  // Sort according to week order: 1, 2, 3, 4, 5, 6, 0
  const order = [1, 2, 3, 4, 5, 6, 0];
  const sorted = [...days].sort((a, b) => order.indexOf(a) - order.indexOf(b));

  const labelsLt: Record<number, string> = { 1: 'Pr', 2: 'An', 3: 'Tr', 4: 'Kt', 5: 'Pn', 6: 'Št', 0: 'Sk' };
  const labelsEn: Record<number, string> = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 0: 'Sun' };
  const labels = language === 'lt' ? labelsLt : labelsEn;

  return sorted.map((d) => labels[d] || String(d)).join(', ');
}

export function isHabitScheduledForToday(daysOfWeek?: number[], date: Date = new Date()): boolean {
  if (!daysOfWeek || daysOfWeek.length === 0) return true;
  return daysOfWeek.includes(date.getDay());
}

export function isHabitScheduledForDate(daysOfWeek?: number[], dateStr?: string): boolean {
  if (!daysOfWeek || daysOfWeek.length === 0) return true;
  const date = dateStr ? parseISO(dateStr) : new Date();
  return daysOfWeek.includes(date.getDay());
}

export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getYesterdayDateString(): string {
  return format(subDays(new Date(), 1), 'yyyy-MM-dd');
}

export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatReadableDate(dateStr: string, language: 'en' | 'lt' = 'en'): string {
  try {
    const d = parseISO(dateStr);
    if (isToday(d)) return language === 'lt' ? 'Šiandien' : 'Today';
    if (isYesterday(d)) return language === 'lt' ? 'Vakar' : 'Yesterday';
    return format(d, language === 'lt' ? 'MMM d, EEE' : 'EEE, MMM d', {
      locale: language === 'lt' ? ltLocale : undefined
    });
  } catch {
    return dateStr;
  }
}

export function getLastNDaysDateStrings(count: number): string[] {
  const result: string[] = [];
  const today = startOfDay(new Date());
  for (let i = count - 1; i >= 0; i--) {
    result.push(format(subDays(today, i), 'yyyy-MM-dd'));
  }
  return result;
}

export function get90DayGridDates(): { dateStr: string; dayOfWeek: number; month: string }[] {
  const today = startOfDay(new Date());
  const rawStartDate = subDays(today, 89);
  // Pad back to Sunday so that Row 0 is consistently Sunday in a 7-row CSS grid
  const startDate = startOfWeek(rawStartDate, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: startDate, end: today });

  return days.map((d) => ({
    dateStr: format(d, 'yyyy-MM-dd'),
    dayOfWeek: d.getDay(),
    month: format(d, 'MMM')
  }));
}

/**
 * Calculates current consecutive day streak from a list of date strings (YYYY-MM-DD).
 * Streak is active if logged today, or logged yesterday (waiting for today).
 * If neither today nor yesterday was logged, streak is 0.
 */
export function calculateStreakFromDates(
  loggedDates: string[],
  todayStr: string = getTodayDateString(),
  yesterdayStr: string = getYesterdayDateString()
): number {
  if (!loggedDates || loggedDates.length === 0) return 0;
  const dateSet = new Set(loggedDates);

  const checkDateStr = dateSet.has(todayStr)
    ? todayStr
    : dateSet.has(yesterdayStr)
    ? yesterdayStr
    : null;

  if (!checkDateStr) return 0;

  let streak = 0;
  let cur = parseISO(checkDateStr);
  while (dateSet.has(format(cur, 'yyyy-MM-dd'))) {
    streak++;
    cur = subDays(cur, 1);
  }
  return streak;
}
