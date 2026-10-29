import React, { useState, useEffect } from 'react';
import { X, Coffee } from 'lucide-react';
import type { Habit, HabitDifficulty, HabitType, TimeOfDay } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { DAYS_OF_WEEK } from '../../utils/dates';

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: {
    title: string;
    type: HabitType;
    timeOfDay: TimeOfDay;
    scheduledTime?: string;
    daysOfWeek?: number[];
    difficulty: HabitDifficulty;
    enablePacing?: boolean;
    intervalHours?: number;
    dailyCap?: number;
    enforceCurfew?: boolean;
    substituteTip?: string;
  }) => Promise<void>;
  initialHabit?: Habit | null;
}

export const HabitFormModal: React.FC<HabitFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialHabit
}) => {
  const { t, language } = useTranslation();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<HabitType>('daily');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [scheduledTime, setScheduledTime] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [difficulty, setDifficulty] = useState<HabitDifficulty>('easy');
  const [enablePacing, setEnablePacing] = useState(false);
  const [intervalHours, setIntervalHours] = useState<number>(3.5);
  const [dailyCap, setDailyCap] = useState<number>(2);
  const [enforceCurfew, setEnforceCurfew] = useState(true);
  const [substituteTip, setSubstituteTip] = useState('Cacao');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialHabit) {
      setTitle(initialHabit.title);
      setType(initialHabit.type);
      setTimeOfDay(initialHabit.timeOfDay);
      setScheduledTime(initialHabit.scheduledTime || '');
      setDaysOfWeek(
        initialHabit.daysOfWeek && initialHabit.daysOfWeek.length > 0
          ? initialHabit.daysOfWeek
          : [0, 1, 2, 3, 4, 5, 6]
      );
      setDifficulty(initialHabit.difficulty);
      setEnablePacing(!!initialHabit.enablePacing);
      setIntervalHours(initialHabit.intervalHours ?? 3.5);
      setDailyCap(initialHabit.dailyCap ?? 2);
      setEnforceCurfew(initialHabit.enforceCurfew !== false);
      setSubstituteTip(initialHabit.substituteTip || 'Cacao');
    } else {
      setTitle('');
      setType('daily');
      setTimeOfDay('morning');
      setScheduledTime('');
      setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
      setDifficulty('easy');
      setEnablePacing(false);
      setIntervalHours(3.5);
      setDailyCap(2);
      setEnforceCurfew(true);
      setSubstituteTip('Cacao');
    }
  }, [initialHabit, isOpen]);

  if (!isOpen) return null;

  const handleApplyCoffeePreset = () => {
    if (!title.trim()) {
      setTitle(t.habits.coffeePresetDefaultTitle);
    }
    setType('positive_negative');
    setTimeOfDay('morning');
    setScheduledTime('07:30');
    setDaysOfWeek([1, 2, 3, 4, 5]);
    setDifficulty('medium');
    setEnablePacing(true);
    setIntervalHours(3.5);
    setDailyCap(2);
    setEnforceCurfew(true);
    setSubstituteTip('Cacao');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || saving) return;

    setSaving(true);
    try {
      const isCounter = type === 'positive_negative';
      await onSave({
        title: title.trim(),
        type,
        timeOfDay,
        scheduledTime: scheduledTime.trim() || undefined,
        daysOfWeek: daysOfWeek.length > 0 ? daysOfWeek : [0, 1, 2, 3, 4, 5, 6],
        difficulty,
        enablePacing: isCounter ? enablePacing : false,
        intervalHours: isCounter && enablePacing ? Number(intervalHours) || 3.5 : undefined,
        dailyCap: isCounter && enablePacing ? Number(dailyCap) || 2 : undefined,
        enforceCurfew: isCounter && enablePacing ? enforceCurfew : undefined,
        substituteTip: isCounter && enablePacing ? substituteTip.trim() || 'Cacao' : undefined
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-4 sm:p-5 shadow-2xl flex flex-col max-h-[85dvh] overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 shrink-0">
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
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 pt-2.5">
          {/* Scrollable inputs container */}
          <div className="overflow-y-auto flex-1 flex flex-col gap-3 pr-0.5">
            {/* One-tap Coffee / Latte Pacer Preset */}
            <button
              type="button"
              onClick={handleApplyCoffeePreset}
              className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-98"
            >
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.habits.coffeePresetBtn}</span>
            </button>

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

            {/* Smart Pacing & Curfew configuration for +/- counter habits */}
            {type === 'positive_negative' && (
              <div className="bg-slate-950/80 border border-amber-500/25 rounded-2xl p-3 flex flex-col gap-2.5">
                <label className="flex items-center justify-between gap-2 cursor-pointer">
                  <div className="flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300">
                      {t.habits.pacingSectionTitle}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enablePacing}
                    onChange={(e) => setEnablePacing(e.target.checked)}
                    className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                  />
                </label>

                {enablePacing && (
                  <div className="flex flex-col gap-2.5 pt-1 border-t border-slate-800/80">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                          {t.habits.pacingIntervalHours}
                        </label>
                        <input
                          type="number"
                          step="0.25"
                          min="0.5"
                          max="12"
                          value={intervalHours}
                          onChange={(e) => setIntervalHours(parseFloat(e.target.value) || 3.5)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                          {t.habits.pacingDailyCap}
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="1"
                          max="10"
                          value={dailyCap}
                          onChange={(e) => setDailyCap(parseInt(e.target.value, 10) || 2)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 items-center">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                          {t.habits.pacingSubstituteTip}
                        </label>
                        <input
                          type="text"
                          value={substituteTip}
                          onChange={(e) => setSubstituteTip(e.target.value)}
                          placeholder={t.habits.pacingSubstitutePlaceholder}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <label className="flex items-center gap-2 pt-4 cursor-pointer text-[11px] text-slate-300 font-medium">
                        <input
                          type="checkbox"
                          checked={enforceCurfew}
                          onChange={(e) => setEnforceCurfew(e.target.checked)}
                          className="w-3.5 h-3.5 accent-amber-400 rounded cursor-pointer"
                        />
                        <span>{t.habits.pacingEnforceCurfew}</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="min-w-0">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 truncate">
                  {t.habits.modalTimeOfDay}
                </label>
                <select
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
                  className="w-full min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer truncate"
                >
                  <option value="morning">{t.habits.morning}</option>
                  <option value="afternoon">{t.habits.afternoon}</option>
                  <option value="evening">{t.habits.evening}</option>
                  <option value="anytime">{t.habits.anytime}</option>
                </select>
              </div>

              <div className="min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-slate-300 truncate">
                    {t.habits.modalScheduledTime}
                  </label>
                  {scheduledTime && (
                    <button
                      type="button"
                      onClick={() => setScheduledTime('')}
                      className="text-[10px] text-slate-400 hover:text-rose-400 cursor-pointer flex items-center gap-0.5"
                    >
                      <X className="w-3 h-3" />
                      <span>{language === 'lt' ? 'Išvalyti' : 'Clear'}</span>
                    </button>
                  )}
                </div>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full min-w-0 max-w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 box-border cursor-pointer appearance-none [&::-webkit-date-and-time-value]:text-left [&::-webkit-date-and-time-value]:min-h-[1.25em]"
                />
              </div>
            </div>

            {/* Days of the Week Selection */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-2.5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-300">
                  {t.habits.modalDaysOfWeek}
                </label>

                {/* Preset Filters */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDaysOfWeek([0, 1, 2, 3, 4, 5, 6])}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition cursor-pointer ${
                      daysOfWeek.length === 7
                        ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    {t.habits.daysEveryday}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDaysOfWeek([1, 2, 3, 4, 5])}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition cursor-pointer ${
                      daysOfWeek.length === 5 && [1, 2, 3, 4, 5].every((d) => daysOfWeek.includes(d))
                        ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    {t.habits.daysWeekdays}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDaysOfWeek([6, 0])}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition cursor-pointer ${
                      daysOfWeek.length === 2 && [6, 0].every((d) => daysOfWeek.includes(d))
                        ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    {t.habits.daysWeekends}
                  </button>
                </div>
              </div>

              {/* Day chips */}
              <div className="grid grid-cols-7 gap-1">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = daysOfWeek.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          if (daysOfWeek.length > 1) {
                            setDaysOfWeek(daysOfWeek.filter((d) => d !== day.id));
                          }
                        } else {
                          setDaysOfWeek([...daysOfWeek, day.id]);
                        }
                      }}
                      className={`h-8 rounded-xl text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-b from-cyan-400 to-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/30'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                      title={language === 'lt' ? day.fullLt : day.fullEn}
                    >
                      {language === 'lt' ? day.shortLt : day.shortEn}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
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
