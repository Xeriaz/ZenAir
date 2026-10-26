import { format, subDays, parseISO, isToday, isYesterday, startOfDay, eachDayOfInterval } from 'date-fns';

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
  const startDate = subDays(today, 89);
  const days = eachDayOfInterval({ start: startDate, end: today });
  
  return days.map(d => ({
    dateStr: format(d, 'yyyy-MM-dd'),
    dayOfWeek: d.getDay(),
    month: format(d, 'MMM')
  }));
}
