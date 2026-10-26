export type HabitType = 'daily' | 'positive_negative';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';
export type HabitDifficulty = 'easy' | 'medium' | 'hard';

export interface Habit {
  id?: number;
  title: string;
  type: HabitType;
  timeOfDay: TimeOfDay;
  scheduledTime?: string; // HH:mm format (optional)
  streak: number;
  bestStreak: number;
  difficulty: HabitDifficulty;
  createdAt: string; // ISO String
  archived: boolean;
}

export interface HabitLog {
  id?: number;
  habitId: number;
  date: string; // YYYY-MM-DD
  count: number; // for positive_negative: net or positive count
  xpEarned: number;
  timestamp: number; // Date.now()
}

export interface TaskItem {
  id?: number;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm format
  durationMinutes: number;
  completed: boolean;
  createdAt: string; // ISO String
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
  theme: 'dark' | 'light';
}

export type BreathingExerciseId = 'box' | 'relax_478' | 'wim_hof' | 'coherent_55' | 'physio_sigh';

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
  tasks: TaskItem[];
  breathingLogs: BreathingLog[];
}
