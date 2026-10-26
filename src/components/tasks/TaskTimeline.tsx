import React, { useState } from 'react';
import { Clock, Plus, Check, Trash2, Calendar, Sparkles } from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { getTodayDateString, formatReadableDate } from '../../utils/dates';
import { useTranslation } from '../../i18n/LanguageContext';

export const TaskTimeline: React.FC = () => {
  const { t, language } = useTranslation();
  const { tasks, toggleTask, createTask, deleteTask } = useTasks();
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = getTodayDateString();
  const readableToday = formatReadableDate(todayStr, language);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createTask({
        title: title.trim(),
        startTime,
        durationMinutes: parseInt(duration, 10) || 30
      });
      setTitle('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto px-4 pt-3 pb-8">
      {/* Date Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">{readableToday}</h2>
            <p className="text-xs text-slate-400">{t.tasks.title}</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
          {t.tasks.completedBlocks.replace('{completed}', String(completedCount)).replace('{total}', String(tasks.length))}
        </span>
      </div>

      {/* Inline Quick Add Task */}
      <form
        onSubmit={handleAddTask}
        className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-md shadow-black/20 flex flex-col gap-2.5"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.tasks.addPlaceholder}
            className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={!title.trim() || isSubmitting}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.tasks.blockBtn}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 text-[11px]">{t.tasks.startLabel}</span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1">
            <span className="text-slate-400 text-[11px]">{t.tasks.durationLabel}</span>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="15" className="bg-slate-900">{t.tasks.min15}</option>
              <option value="30" className="bg-slate-900">{t.tasks.min30}</option>
              <option value="45" className="bg-slate-900">{t.tasks.min45}</option>
              <option value="60" className="bg-slate-900">{t.tasks.min60}</option>
              <option value="90" className="bg-slate-900">{t.tasks.min90}</option>
              <option value="120" className="bg-slate-900">{t.tasks.min120}</option>
            </select>
          </div>
        </div>
      </form>

      {/* Timeline List */}
      <div className="relative pl-6 flex flex-col gap-3 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
        {tasks.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-slate-900/40 border border-slate-800/80 flex flex-col items-center justify-center gap-2 -ml-6">
            <Sparkles className="w-8 h-8 text-cyan-400/40" />
            <p className="text-sm font-semibold text-slate-300">{t.tasks.noTasksTitle}</p>
            <p className="text-xs text-slate-500 max-w-xs">
              {t.tasks.noTasksDesc}
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`relative flex items-center justify-between gap-3 bg-slate-900/80 border p-3 rounded-2xl transition shadow-sm ${
                task.completed
                  ? 'border-emerald-500/30 bg-slate-900/40 text-slate-400'
                  : 'border-slate-800 hover:border-slate-700 text-slate-100'
              }`}
            >
              {/* Timeline dot */}
              <div
                className={`absolute -left-[23px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 transition ${
                  task.completed
                    ? 'bg-emerald-400 border-emerald-300 ring-2 ring-emerald-500/20'
                    : 'bg-slate-900 border-cyan-400'
                }`}
              />

              {/* Task Details */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  onClick={() => task.id && toggleTask(task.id)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition shrink-0 cursor-pointer ${
                    task.completed
                      ? 'bg-emerald-500 text-slate-950'
                      : 'border-2 border-slate-700 hover:border-cyan-400 text-transparent'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3px]" />
                </button>

                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-sm font-medium truncate ${
                      task.completed ? 'line-through text-slate-500' : 'text-slate-100'
                    }`}
                  >
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="text-cyan-400 font-semibold">{task.startTime}</span>
                    <span>•</span>
                    <span>{task.durationMinutes} min</span>
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => {
                  if (window.confirm(t.tasks.deleteConfirm)) {
                    if (task.id) deleteTask(task.id);
                  }
                }}
                className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
