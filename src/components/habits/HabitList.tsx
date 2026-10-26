import React, { useState } from 'react';
import { Sun, Sunset, Moon, Sparkles, Filter, CheckCircle } from 'lucide-react';
import type { Habit, HabitDifficulty, HabitType, TimeOfDay } from '../../types';
import { HabitQuickAdd } from './HabitQuickAdd';
import { HabitCard } from './HabitCard';
import { HabitFormModal } from './HabitFormModal';
import { useHabits } from '../../hooks/useHabits';

export const HabitList: React.FC = () => {
  const { habits, todayLogsMap, toggleDailyHabit, logHabitCounter, createHabit, updateHabit, deleteHabit } = useHabits();
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const filterTabs = [
    { id: 'all', label: 'All Habits', icon: Filter },
    { id: 'morning', label: 'Morning', icon: Sun },
    { id: 'afternoon', label: 'Afternoon', icon: Sunset },
    { id: 'evening', label: 'Evening', icon: Moon },
    { id: 'anytime', label: 'Anytime', icon: Sparkles },
  ];

  const filteredHabits = habits.filter((habit) => {
    if (selectedTimeFilter === 'all') return true;
    return habit.timeOfDay === selectedTimeFilter;
  });

  const dailyHabits = habits.filter((h) => h.type === 'daily');
  const completedDailyCount = dailyHabits.filter((h) => {
    const log = h.id ? todayLogsMap.get(h.id) : undefined;
    return log && log.count > 0;
  }).length;

  const completionPct = dailyHabits.length > 0
    ? Math.round((completedDailyCount / dailyHabits.length) * 100)
    : 0;

  const handleOpenEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (data: {
    title: string;
    type: HabitType;
    timeOfDay: TimeOfDay;
    scheduledTime?: string;
    difficulty: HabitDifficulty;
  }) => {
    if (editingHabit && editingHabit.id) {
      await updateHabit(editingHabit.id, data);
    } else {
      await createHabit(data);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto px-4 pt-3 pb-8">
      {/* Daily Completion Header Summary */}
      <div className="bg-gradient-to-r from-[#170f2b] via-[#140d26] to-purple-950/50 border border-purple-900/40 rounded-3xl p-4 flex flex-col gap-2.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-purple-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">Today's Habits</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
            {completedDailyCount} / {dailyHabits.length} Done ({completionPct}%)
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full bg-purple-950/60 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-fuchsia-400 rounded-full transition-all duration-300"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* Inline Quick Add */}
      <HabitQuickAdd
        onAdd={async (data) => {
          await createHabit(data);
        }}
        onOpenAdvanced={() => {
          setEditingHabit(null);
          setIsModalOpen(true);
        }}
      />

      {/* Time-of-day Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedTimeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTimeFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                isSelected
                  ? 'bg-purple-500 text-white font-bold shadow-md shadow-purple-500/25'
                  : 'bg-[#160e29]/90 text-purple-300/70 hover:text-purple-100 border border-purple-900/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Habit Cards */}
      <div className="flex flex-col gap-2.5">
        {filteredHabits.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-[#160e29]/40 border border-purple-900/40 flex flex-col items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-400/40" />
            <p className="text-sm font-semibold text-purple-200">No habits in this category yet</p>
            <p className="text-xs text-purple-400/60 max-w-xs">
              Use the quick-add bar above to create a new habit in seconds.
            </p>
          </div>
        ) : (
          filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              log={habit.id ? todayLogsMap.get(habit.id) : undefined}
              onToggleDaily={toggleDailyHabit}
              onCounter={logHabitCounter}
              onEdit={handleOpenEdit}
              onDelete={deleteHabit}
            />
          ))
        )}
      </div>

      {/* Advanced Habit Modal */}
      <HabitFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveModal}
        initialHabit={editingHabit}
      />
    </div>
  );
};
