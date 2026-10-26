import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Habit, HabitDifficulty, HabitType, TimeOfDay } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: {
    title: string;
    type: HabitType;
    timeOfDay: TimeOfDay;
    scheduledTime?: string;
    difficulty: HabitDifficulty;
  }) => Promise<void>;
  initialHabit?: Habit | null;
}

export const HabitFormModal: React.FC<HabitFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialHabit
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<HabitType>('daily');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [scheduledTime, setScheduledTime] = useState('');
  const [difficulty, setDifficulty] = useState<HabitDifficulty>('easy');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialHabit) {
      setTitle(initialHabit.title);
      setType(initialHabit.type);
      setTimeOfDay(initialHabit.timeOfDay);
      setScheduledTime(initialHabit.scheduledTime || '');
      setDifficulty(initialHabit.difficulty);
    } else {
      setTitle('');
      setType('daily');
      setTimeOfDay('morning');
      setScheduledTime('');
      setDifficulty('easy');
    }
  }, [initialHabit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || saving) return;

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        type,
        timeOfDay,
        scheduledTime: scheduledTime.trim() || undefined,
        difficulty
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-4 sm:p-5 shadow-2xl flex flex-col max-h-[88dvh] overflow-hidden">
        {/* Mobile drag handle */}
        <div className="w-10 h-1 bg-slate-700/80 rounded-full mx-auto mb-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
          <h3 className="text-base font-bold text-white">
            {initialHabit ? t.habits.modalEditTitle : t.habits.modalNewTitle}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 pt-2">
          {/* Scrollable inputs container */}
          <div className="overflow-y-auto flex-1 flex flex-col gap-3 pr-0.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                {t.habits.modalHabitTitle}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.habits.modalPlaceholder}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="min-w-0">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 truncate">
                  {t.habits.modalType}
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as HabitType)}
                  className="w-full min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer truncate"
                >
                  <option value="daily">{t.habits.modalTypeDaily}</option>
                  <option value="positive_negative">{t.habits.modalTypeCounter}</option>
                </select>
              </div>

              <div className="min-w-0">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 truncate">
                  {t.habits.modalDifficulty}
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as HabitDifficulty)}
                  className="w-full min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer truncate"
                >
                  <option value="easy">{t.habits.difficultyEasy}</option>
                  <option value="medium">{t.habits.difficultyMedium}</option>
                  <option value="hard">{t.habits.difficultyHard}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="min-w-0">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 truncate">
                  {t.habits.modalTimeOfDay}
                </label>
                <select
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
                  className="w-full min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer truncate"
                >
                  <option value="morning">{t.habits.morning}</option>
                  <option value="afternoon">{t.habits.afternoon}</option>
                  <option value="evening">{t.habits.evening}</option>
                  <option value="anytime">{t.habits.anytime}</option>
                </select>
              </div>

              <div className="min-w-0">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 truncate">
                  {t.habits.modalScheduledTime}
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 box-border cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Sticky footer with Safe Area padding */}
          <div className="flex items-center justify-end gap-2 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition cursor-pointer"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              {saving ? t.habits.modalSaving : t.common.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
