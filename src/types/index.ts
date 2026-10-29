export type HabitType = "daily" | "positive_negative";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "anytime";
export type HabitDifficulty = "easy" | "medium" | "hard";

export interface Habit {
  id?: number;
  title: string;
  type: HabitType;
  timeOfDay: TimeOfDay;
  scheduledTime?: string; // HH:mm format (optional)
  daysOfWeek?: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat (defaults to everyday [0, 1, 2, 3, 4, 5, 6])
  streak: number;
  bestStreak: number;
  difficulty: HabitDifficulty;
  createdAt: string; // ISO String
  archived: boolean;
  // Smart Pacing & Circadian Curfew (for positive_negative counter habits like Coffee / Latte)
  enablePacing?: boolean;
  intervalHours?: number; // Minimum hours between doses (e.g. 3.5)
  dailyCap?: number; // Maximum recommended daily count (e.g. 2)
  enforceCurfew?: boolean; // Enforce 10h pre-bedtime cutoff
  curfewTime?: string; // Optional manual curfew override HH:mm (e.g. "12:00")
  substituteTip?: string; // Recommended alternative after curfew/cap (e.g. "Cacao")
}

export interface HabitLog {
  id?: number;
  habitId: number;
  date: string; // YYYY-MM-DD
  count: number; // for positive_negative: net or positive count
  xpEarned: number;
  timestamp: number; // Date.now()
}

export interface BreathingLog {
  id?: number;
  exerciseId: string;
  durationSeconds: number;
  completedAt: string; // ISO String
}

export interface UserProfile {
  id?: number;
  level: number;
  xp: number;
  gold: number;
  streakFreezes: number;
  defaultBreathingId: string;
  preferredSessionMinutes: number;
  theme: "dark" | "light";
  language?: "en" | "lt";
  wakeTime?: string; // HH:mm format, default "06:00"
  targetBedtime?: string; // HH:mm format, default "22:00"
}

export type BreathingExerciseId = "box" | "relax_478" | "wim_hof" | "coherent_55" | "physio_sigh";

export interface BreathingStandard {
  id: BreathingExerciseId;
  name: string;
  tagline: string;
  description: string;
  defaultDurationMinutes: number;
  benefits: string[];
}

export interface DatabaseBackup {
  version: number;
  exportDate: string;
  userProfile: UserProfile[];
  habits: Habit[];
  habitLogs: HabitLog[];
  tasks?: unknown[];
  breathingLogs: BreathingLog[];
}
