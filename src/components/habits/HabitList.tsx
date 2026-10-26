import React, { useState } from 'react';
import { Sun, Sunset, Moon, Sparkles, Filter, CheckCircle } from 'lucide-react';
import type { Habit, HabitDifficulty, HabitType, TimeOfDay } from '../../types';
import { HabitQuickAdd } from './HabitQuickAdd';
import { HabitCard } from './HabitCard';
import { HabitFormModal } from './HabitFormModal';
import { useHabits } from '../../hooks/useHabits';
import { useTranslation } from '../../i18n/LanguageContext';

export const HabitList: React.FC = () => {
  const { t } = useTranslation();
  const { habits, todayLogsMap, toggleDailyHabit, logHabitCounter, createHabit, updateHabit, deleteHabit } = useHabits();
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const filterTabs = [
    { id: 'all', label: t.habits.all, icon: Filter },
    { id: 'morning', label: t.habits.morning, icon: Sun },
    { id: 'afternoon', label: t.habits.afternoon, icon: Sunset },
    { id: 'evening', label: t.habits.evening, icon: Moon },
    { id: 'anytime', label: t.habits.anytime, icon: Sparkles },
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
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-4 flex flex-col gap-2.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">{t.habits.todayHabits}</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            {completedDailyCount} / {dailyHabits.length} {t.habits.done} ({completionPct}%)
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-300"
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
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
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
          <div className="text-center py-12 px-4 rounded-3xl bg-slate-900/40 border border-slate-800/80 flex flex-col items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-cyan-400/40" />
            <p className="text-sm font-semibold text-slate-300">{t.habits.noHabitsTitle}</p>
            <p className="text-xs text-slate-500 max-w-xs">
              {t.habits.noHabitsDesc}
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

      {/* Advanced Custom Modal */}
      <HabitFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialHabit={editingHabit}
      />
    </div>
  );
};
