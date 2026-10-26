import React, { useState } from 'react';
import { Check, Flame, Plus, Minus, MoreVertical, Edit2, Trash2, Sun, Sunset, Moon, Sparkles } from 'lucide-react';
import type { Habit, HabitLog } from '../../types';

interface HabitCardProps {
  habit: Habit;
  log?: HabitLog;
  onToggleDaily: (habitId: number) => Promise<{ completed: boolean; leveledUp: boolean }>;
  onCounter: (habitId: number, isPositive: boolean) => Promise<{ count: number; leveledUp: boolean }>;
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
    if (!habit.id) return;
    setAnimating(true);
    await onToggleDaily(habit.id);
    setTimeout(() => setAnimating(false), 300);
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
      className={`relative group bg-[#160e29]/90 border transition-all duration-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm ${
        isCompleted
          ? 'border-emerald-500/40 bg-[#160e29]/50'
          : 'border-purple-900/40 hover:border-purple-700/60 hover:bg-[#1a1130]'
      }`}
    >
      {/* Left section: Checkbox or Counter & Title */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {habit.type === 'daily' ? (
          <button
            onClick={handleToggle}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer ${
              animating ? 'scale-115' : 'active:scale-95'
            } ${
              isCompleted
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/30'
                : 'bg-[#10091d] border-2 border-purple-800/60 hover:border-purple-400 text-transparent'
            }`}
          >
            <Check className={`w-5 h-5 stroke-[3px] transition-transform ${isCompleted ? 'scale-100' : 'scale-50'}`} />
          </button>
        ) : (
          <div className="flex items-center gap-1.5 shrink-0 bg-[#10091d]/80 p-1 rounded-xl border border-purple-900/50">
            <button
              onClick={() => handleCount(false)}
              title="Deduct XP"
              className="w-7 h-7 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 flex items-center justify-center transition active:scale-90 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center font-bold text-xs text-purple-100">{count}</span>
            <button
              onClick={() => handleCount(true)}
              title="Earn XP"
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
                isCompleted ? 'text-purple-400/50 line-through' : 'text-purple-100'
              }`}
            >
              {habit.title}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px]">
            {/* Time of day pill */}
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-950/60 text-purple-300/80 capitalize">
              <TimeIcon className="w-2.5 h-2.5" />
              {habit.scheduledTime ? `${habit.timeOfDay} \u2022 ${habit.scheduledTime}` : habit.timeOfDay}
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
          className="p-1.5 text-purple-300/70 hover:text-purple-100 rounded-lg hover:bg-purple-900/30 transition cursor-pointer"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-8 z-50 w-32 bg-[#18102d] border border-purple-800/80 rounded-xl shadow-xl shadow-black/60 py-1 flex flex-col text-xs">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit(habit);
                }}
                className="flex items-center gap-2 px-3 py-2 text-purple-200 hover:bg-purple-900/40 transition text-left cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-purple-400" />
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
