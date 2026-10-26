import React, { useState } from 'react';
import { Clock, Plus, Check, Trash2, Calendar, Sparkles } from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { getTodayDateString, formatReadableDate } from '../../utils/dates';

export const TaskTimeline: React.FC = () => {
  const { tasks, toggleTask, createTask, deleteTask } = useTasks();
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = getTodayDateString();
  const readableToday = formatReadableDate(todayStr);

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
      <div className="bg-gradient-to-r from-[#170f2b] via-purple-950/40 to-[#170f2b] border border-purple-900/40 rounded-3xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">{readableToday}</h2>
            <p className="text-xs text-purple-300/70">Time-Blocked Schedule & Focus Blocks</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30">
          {completedCount} / {tasks.length} Completed
        </span>
      </div>

      {/* Inline Quick Add Task */}
      <form
        onSubmit={handleAddTask}
        className="bg-[#160e29]/90 border border-purple-900/50 rounded-2xl p-3 shadow-md shadow-black/30 flex flex-col gap-2.5"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Plan a time-blocked task (e.g. Deep Work Sprint)..."
            className="flex-1 bg-[#10091d]/90 border border-purple-900/50 rounded-xl px-3.5 py-2 text-sm text-purple-100 placeholder:text-purple-400/50 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!title.trim() || isSubmitting}
            className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-purple-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Block</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-[#10091d]/70 border border-purple-900/50 rounded-lg px-2.5 py-1">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-purple-300/70 text-[11px]">Start:</span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="bg-transparent text-purple-200 text-xs focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#10091d]/70 border border-purple-900/50 rounded-lg px-2.5 py-1">
            <span className="text-purple-300/70 text-[11px]">Duration:</span>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="bg-transparent text-purple-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="15" className="bg-[#160e29]">15 min</option>
              <option value="30" className="bg-[#160e29]">30 min</option>
              <option value="45" className="bg-[#160e29]">45 min</option>
              <option value="60" className="bg-[#160e29]">60 min</option>
              <option value="90" className="bg-[#160e29]">90 min</option>
              <option value="120" className="bg-[#160e29]">2 hours</option>
            </select>
          </div>
        </div>
      </form>

      {/* Timeline List */}
      <div className="relative pl-6 flex flex-col gap-3 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-purple-900/50">
        {tasks.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-[#160e29]/40 border border-purple-900/40 flex flex-col items-center justify-center gap-2 -ml-6">
            <Sparkles className="w-8 h-8 text-purple-400/40" />
            <p className="text-sm font-semibold text-purple-200">No time blocks scheduled for today</p>
            <p className="text-xs text-purple-400/60 max-w-xs">
              Add your first task block above to structure your day with intention.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`relative flex items-center justify-between gap-3 bg-[#160e29]/90 border p-3 rounded-2xl transition shadow-sm ${
                task.completed
                  ? 'border-emerald-500/30 bg-[#160e29]/40 text-purple-300/60'
                  : 'border-purple-900/40 hover:border-purple-700/60 text-purple-100'
              }`}
            >
              {/* Timeline dot */}
              <div
                className={`absolute -left-[23px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 transition ${
                  task.completed
                    ? 'bg-emerald-400 border-emerald-300 ring-2 ring-emerald-500/20'
                    : 'bg-[#160e29] border-purple-400'
                }`}
              />

              {/* Task Details */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  onClick={() => task.id && toggleTask(task.id)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition shrink-0 cursor-pointer ${
                    task.completed
                      ? 'bg-emerald-500 text-slate-950'
                      : 'border-2 border-purple-800/60 hover:border-purple-400 text-transparent'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3px]" />
                </button>

                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-sm font-medium truncate ${
                      task.completed ? 'line-through text-purple-400/50' : 'text-purple-100'
                    }`}
                  >
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-purple-300/70">
                    <span className="text-purple-400 font-semibold">{task.startTime}</span>
                    <span>•</span>
                    <span>{task.durationMinutes} mins</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-medium">+15 XP</span>
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => task.id && deleteTask(task.id)}
                className="p-1.5 text-purple-400/60 hover:text-rose-400 rounded-lg hover:bg-purple-900/30 transition cursor-pointer"
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
