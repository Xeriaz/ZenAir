import React, { useState } from 'react';
import { Check, Flame, Plus, Minus, MoreVertical, Edit2, Trash2, Sun, Sunset, Moon, Sparkles } from 'lucide-react';
import type { Habit, HabitLog } from '../../types';

interface HabitCardProps {
  habit: Habit;
  log?: HabitLog;
  onToggleDaily: (habitId: number) => Promise<{ completed: boolean } | void>;
  onCounter: (habitId: number, isPositive: boolean) => Promise<{ count: number } | void>;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: number) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  log,
  onToggleDaily,
  onCounter,
  onEdit,
  onDelete
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [animating, setAnimating] = useState(false);

  const isCompleted = !!log && log.count > 0;
  const count = log?.count ?? 0;

  const handleToggle = async () => {
    if (!habit.id || animating) return;
    setAnimating(true);
    try {
      await onToggleDaily(habit.id);
    } finally {
      setTimeout(() => setAnimating(false), 250);
    }
  };

  const handleCount = async (isPositive: boolean) => {
    if (!habit.id) return;
    await onCounter(habit.id, isPositive);
  };

  const difficultyColors = {
    easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
    hard: 'text-rose-400 bg-rose-500/10 border-rose-500/25'
  };

  const timeIcons = {
    morning: Sun,
    afternoon: Sunset,
    evening: Moon,
    anytime: Sparkles
  };
  const TimeIcon = timeIcons[habit.timeOfDay] || Sparkles;

  return (
    <div
      className={`relative group bg-slate-900/80 border transition-all duration-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm ${
        isCompleted
          ? 'border-emerald-500/40 bg-slate-900/40'
          : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900'
      }`}
    >
      {/* Left section: Checkbox or Counter & Title */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {habit.type === 'daily' ? (
          <button
            onClick={handleToggle}
            disabled={animating}
            aria-label={`Toggle ${habit.title}`}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer disabled:cursor-not-allowed ${
              animating ? 'scale-115 opacity-80' : 'active:scale-95'
            } ${
              isCompleted
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/30'
                : 'bg-slate-950/80 border-2 border-slate-700 hover:border-cyan-400 text-transparent'
            }`}
          >
            <Check className={`w-5 h-5 stroke-[3px] transition-transform ${isCompleted ? 'scale-100' : 'scale-50'}`} />
          </button>
        ) : (
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => handleCount(false)}
              title="Decrease count"
              className="w-7 h-7 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 flex items-center justify-center transition active:scale-90 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center font-bold text-xs text-slate-200">{count}</span>
            <button
              onClick={() => handleCount(true)}
              title="Increase count"
              className="w-7 h-7 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 flex items-center justify-center transition active:scale-90 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Title and metadata */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-semibold truncate transition-colors ${
                isCompleted ? 'text-slate-400 line-through' : 'text-slate-100'
              }`}
            >
              {habit.title}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px]">
            {/* Time of day pill */}
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-800/80 text-slate-400 capitalize">
              <TimeIcon className="w-2.5 h-2.5" />
              {habit.scheduledTime ? `${habit.timeOfDay} • ${habit.scheduledTime}` : habit.timeOfDay}
            </span>

            {/* Difficulty badge */}
            <span className={`px-1.5 py-0.5 rounded-md border font-medium capitalize ${difficultyColors[habit.difficulty]}`}>
              {habit.difficulty}
            </span>

            {/* Streak count */}
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
              <Flame className="w-3 h-3 fill-amber-400/20" />
              {habit.streak} {habit.streak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>
      </div>

      {/* Right section: Options menu */}
      <div className="relative shrink-0">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition cursor-pointer"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-8 z-50 w-32 bg-slate-900 border border-slate-700/80 rounded-xl shadow-xl shadow-black/50 py-1 flex flex-col text-xs">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit(habit);
                }}
                className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-slate-800 transition text-left cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  if (habit.id) onDelete(habit.id);
                }}
                className="flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 transition text-left cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
