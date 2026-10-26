import React, { useState } from 'react';
import { Plus, Sun, Sunset, Moon, Sparkles, SlidersHorizontal } from 'lucide-react';
import type { HabitDifficulty, HabitType, TimeOfDay } from '../../types';

interface HabitQuickAddProps {
  onAdd: (data: {
    title: string;
    type: HabitType;
    timeOfDay: TimeOfDay;
    difficulty: HabitDifficulty;
    scheduledTime?: string;
  }) => Promise<void>;
  onOpenAdvanced: () => void;
}

export const HabitQuickAdd: React.FC<HabitQuickAddProps> = ({ onAdd, onOpenAdvanced }) => {
  const [title, setTitle] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [difficulty, setDifficulty] = useState<HabitDifficulty>('easy');
  const [type, setType] = useState<HabitType>('daily');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAdd({
        title: title.trim(),
        type,
        timeOfDay,
        difficulty
      });
      setTitle('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeOptions: { id: TimeOfDay; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'morning', label: 'Morn', icon: Sun },
    { id: 'afternoon', label: 'Noon', icon: Sunset },
    { id: 'evening', label: 'Eve', icon: Moon },
    { id: 'anytime', label: 'All', icon: Sparkles },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#160e29]/90 border border-purple-900/50 rounded-2xl p-3 shadow-md shadow-black/30 flex flex-col gap-2.5"
    >
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Quick add habit (e.g., Morning 10-min meditation)..."
          className="flex-1 bg-[#10091d]/90 border border-purple-900/50 rounded-xl px-3.5 py-2 text-sm text-purple-100 placeholder:text-purple-400/50 focus:outline-none focus:border-purple-500/70 focus:ring-1 focus:ring-purple-500/50 transition"
        />
        <button
          type="submit"
          disabled={!title.trim() || isSubmitting}
          className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-purple-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {/* Inline Quick Filters */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5 text-xs">
        {/* Time of Day selection */}
        <div className="flex items-center bg-[#10091d]/70 p-0.5 rounded-lg border border-purple-900/50">
          {timeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = timeOfDay === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTimeOfDay(opt.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md transition text-[11px] cursor-pointer ${
                  isSelected
                    ? 'bg-purple-500/25 text-purple-300 font-semibold'
                    : 'text-purple-300/60 hover:text-purple-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Difficulty & Type Controls */}
        <div className="flex items-center gap-1.5">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as HabitDifficulty)}
            className="bg-[#10091d]/90 border border-purple-900/50 text-purple-200 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="easy">Easy (+10 XP)</option>
            <option value="medium">Medium (+20 XP)</option>
            <option value="hard">Hard (+35 XP)</option>
          </select>

          <button
            type="button"
            onClick={() => setType(type === 'daily' ? 'positive_negative' : 'daily')}
            className={`px-2 py-1 rounded-lg border text-[11px] font-medium transition cursor-pointer ${
              type === 'daily'
                ? 'bg-purple-950/70 border-purple-800/60 text-purple-300'
                : 'bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-300'
            }`}
          >
            {type === 'daily' ? 'Daily' : '+ / - Counter'}
          </button>

          <button
            type="button"
            onClick={onOpenAdvanced}
            title="More Options"
            className="p-1 text-purple-300/70 hover:text-purple-100 transition rounded-lg hover:bg-purple-900/30 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </form>
  );
};
