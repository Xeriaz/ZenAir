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

export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getYesterdayDateString(): string {
  return format(subDays(new Date(), 1), 'yyyy-MM-dd');
}

export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatReadableDate(dateStr: string): string {
  try {
    const d = parseISO(dateStr);
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'EEE, MMM d');
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
