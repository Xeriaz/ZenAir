import React, { useState, useEffect } from 'react';
import { Check, Flame, Plus, Minus, MoreVertical, Edit2, Trash2, Sun, Sunset, Moon, Sparkles, Calendar, Coffee, Clock, ShieldAlert } from 'lucide-react';
import type { Habit, HabitLog, UserProfile } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { formatDaysOfWeek, isHabitScheduledForToday } from '../../utils/dates';
import { computeCaffeinePacing, formatDurationMinutes } from '../../utils/caffeineTiming';

interface HabitCardProps {
  habit: Habit;
  log?: HabitLog;
  userProfile?: Pick<UserProfile, 'wakeTime' | 'targetBedtime'>;
  onToggleDaily: (habitId: number) => Promise<{ completed: boolean } | void>;
  onCounter: (habitId: number, isPositive: boolean) => Promise<{ count: number } | void>;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: number) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  log,
  userProfile,
  onToggleDaily,
  onCounter,
  onEdit,
  onDelete
}) => {
  const { t, language } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());

  const isPacingEnabled = habit.type === 'positive_negative' && !!habit.enablePacing;

  useEffect(() => {
    if (!isPacingEnabled) return;
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, [isPacingEnabled]);

  const isCompleted =
    habit.type === 'daily'
      ? !!log && log.count > 0
      : isPacingEnabled
        ? !!log && log.count > 0 && log.count <= (habit.dailyCap ?? 2)
        : !!log && log.count > 0;
  const count = log?.count ?? 0;

  const pacingStatus = isPacingEnabled
    ? computeCaffeinePacing(habit, log, userProfile, now)
    : null;

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
    setNow(new Date());
  };

  const difficultyColors = {
    easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
    hard: 'text-rose-400 bg-rose-500/10 border-rose-500/25'
  };

  const difficultyLabels = {
    easy: t.habits.difficultyEasy,
    medium: t.habits.difficultyMedium,
    hard: t.habits.difficultyHard
  };

  const timeLabels = {
    morning: t.habits.morning,
    afternoon: t.habits.afternoon,
    evening: t.habits.evening,
    anytime: t.habits.anytime
  };

  const timeIcons = {
    morning: Sun,
    afternoon: Sunset,
    evening: Moon,
    anytime: Sparkles
  };

  const TimeIcon = timeIcons[habit.timeOfDay] || Sparkles;

  const formatStreak = (streak: number) => {
    if (language === 'lt') {
      return `${streak} d.`;
    }
    return `${streak} ${streak === 1 ? 'day' : 'days'}`;
  };

  return (
    <div
      className={`relative group bg-slate-900/80 border transition-all duration-200 rounded-2xl p-3.5 flex flex-col gap-2.5 shadow-sm ${
        isCompleted
          ? 'border-emerald-500/40 bg-slate-900/40'
          : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
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
              <span className="w-6 text-center font-bold text-xs text-slate-200">
                {isPacingEnabled && habit.dailyCap ? `${count}/${habit.dailyCap}` : count}
              </span>
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
                  habit.type === 'daily' && isCompleted ? 'text-slate-400 line-through' : 'text-slate-100'
                }`}
              >
                {habit.title}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px]">
              {/* Time of day pill */}
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-800/80 text-slate-400 capitalize">
                <TimeIcon className="w-2.5 h-2.5" />
                {habit.scheduledTime ? `${timeLabels[habit.timeOfDay]} • ${habit.scheduledTime}` : timeLabels[habit.timeOfDay]}
              </span>

              {/* Days of week pill */}
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-800/80 text-cyan-300 font-medium border border-cyan-500/20">
                <Calendar className="w-2.5 h-2.5 text-cyan-400" />
                {formatDaysOfWeek(habit.daysOfWeek, language)}
              </span>

              {/* Rest day indicator if not scheduled for today */}
              {!isHabitScheduledForToday(habit.daysOfWeek) && (
                <span className="px-1.5 py-0.5 rounded-md bg-slate-800/60 text-slate-400 font-medium">
                  {t.habits.restDay}
                </span>
              )}

              {/* Difficulty badge */}
              <span className={`px-1.5 py-0.5 rounded-md border font-medium capitalize ${difficultyColors[habit.difficulty]}`}>
                {difficultyLabels[habit.difficulty]}
              </span>

              {/* Streak count */}
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                <Flame className="w-3 h-3 fill-amber-400/20" />
                {formatStreak(habit.streak)}
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
                  <span>{t.common.edit}</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    if (window.confirm(t.habits.deleteConfirm)) {
                      if (habit.id) onDelete(habit.id);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 transition text-left cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.common.delete}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Smart Caffeine Pacing & Curfew Status Bar */}
      {pacingStatus && (
        <div
          data-testid="caffeine-pacing-banner"
          className={`px-3 py-2 rounded-xl border text-[11px] flex flex-wrap items-center justify-between gap-2 transition-colors ${
            pacingStatus.state === 'ready'
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
              : pacingStatus.state === 'cooldown' || pacingStatus.state === 'first_delay'
                ? 'bg-cyan-500/10 border-cyan-500/25 text-cyan-300'
                : 'bg-amber-500/10 border-amber-500/25 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {pacingStatus.state === 'ready' ? (
              <Coffee className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : pacingStatus.state === 'cooldown' || pacingStatus.state === 'first_delay' ? (
              <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}

            {pacingStatus.state === 'ready' && (
              <span>
                <strong>{t.habits.pacingWindowOpen}</strong> ({t.habits.pacingUntilCurfew} {pacingStatus.curfewTimeStr})
              </span>
            )}

            {pacingStatus.state === 'first_delay' && (
              <span>
                {t.habits.pacingFirstDelay} <strong>{pacingStatus.firstWindowStr}</strong> ({t.habits.pacingWait}{' '}
                {formatDurationMinutes(pacingStatus.remainingCooldownMinutes)})
              </span>
            )}

            {pacingStatus.state === 'cooldown' && (
              <span>
                {t.habits.pacingNextWindow} <strong>{pacingStatus.nextEligibleTimeStr}</strong> ({t.habits.pacingWait}{' '}
                {formatDurationMinutes(pacingStatus.remainingCooldownMinutes)})
              </span>
            )}

            {pacingStatus.state === 'curfew' && (
              <span>
                <strong>{t.habits.pacingCurfewActive}</strong> ({pacingStatus.curfewTimeStr})
              </span>
            )}

            {pacingStatus.state === 'daily_cap_reached' && (
              <span>
                <strong>{t.habits.pacingCapReached}</strong> ({count}/{pacingStatus.dailyCap})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 font-semibold">
            {pacingStatus.lastLoggedTimeStr && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950/60 text-slate-300 font-normal">
                {t.habits.pacingLastCup} {pacingStatus.lastLoggedTimeStr}
              </span>
            )}

            {pacingStatus.state === 'curfew' || pacingStatus.state === 'daily_cap_reached' ? (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-200">
                ☕ {t.habits.pacingSwapTo} {pacingStatus.substituteTip}
              </span>
            ) : (
              <span className="text-[10px] opacity-90">
                {pacingStatus.remainingCupsToday} {t.habits.pacingCupsLeft}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
