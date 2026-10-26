import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, PieChart as PieIcon, Flame, Calendar, Award, Wind, CheckCircle2 } from 'lucide-react';
import { db } from '../../db/db';
import { getLastNDaysDateStrings, get90DayGridDates, formatReadableDate } from '../../utils/dates';

export const AnalyticsView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7' | '30'>('7');

  const habits = useLiveQuery(async () => {
    return await db.habits.filter(h => !h.archived).toArray();
  }, []);

  const habitLogs = useLiveQuery(async () => {
    return await db.habitLogs.toArray();
  }, []);

  const tasks = useLiveQuery(async () => {
    return await db.tasks.toArray();
  }, []);

  const breathingLogs = useLiveQuery(async () => {
    return await db.breathingLogs.toArray();
  }, []);

  const activeHabits = habits ?? [];
  const allLogs = habitLogs ?? [];
  const allTasks = tasks ?? [];
  const allBreathing = breathingLogs ?? [];

  // Group logs by date
  const logsByDate = new Map<string, { count: number }>();
  allLogs.forEach((log) => {
    const existing = logsByDate.get(log.date) || { count: 0 };
    logsByDate.set(log.date, {
      count: existing.count + (log.count > 0 ? 1 : 0)
    });
  });

  // Calculate 7-day or 30-day chart data
  const dayCount = timeRange === '7' ? 7 : 30;
  const recentDateStrings = getLastNDaysDateStrings(dayCount);
  const totalDailyHabits = activeHabits.filter(h => h.type === 'daily').length || 1;

  const chartData = recentDateStrings.map((dateStr) => {
    const data = logsByDate.get(dateStr) || { count: 0 };
    const completionRate = Math.min(100, Math.round((data.count / totalDailyHabits) * 100));
    return {
      date: dateStr.slice(5), // MM-DD
      fullDate: dateStr,
      completionRate,
      completedHabits: data.count
    };
  });

  // Habit distribution by time of day
  const timeDistribution = [
    { name: 'Morning', count: 0, color: '#38bdf8' },
    { name: 'Afternoon', count: 0, color: '#818cf8' },
    { name: 'Evening', count: 0, color: '#c084fc' },
    { name: 'Anytime', count: 0, color: '#34d399' }
  ];

  activeHabits.forEach((h) => {
    const item = timeDistribution.find((t) => t.name.toLowerCase() === h.timeOfDay);
    if (item) item.count += 1;
  });

  // Difficulty radar data
  const difficultyData = [
    { difficulty: 'Easy', count: activeHabits.filter(h => h.difficulty === 'easy').length, color: '#34d399' },
    { difficulty: 'Medium', count: activeHabits.filter(h => h.difficulty === 'medium').length, color: '#fbbf24' },
    { difficulty: 'Hard', count: activeHabits.filter(h => h.difficulty === 'hard').length, color: '#f87171' },
  ];

  // 90-Day Heatmap calculations
  const heatmapDates = get90DayGridDates();
  const getIntensityClass = (dateStr: string) => {
    const data = logsByDate.get(dateStr);
    if (!data || data.count === 0) return 'bg-slate-800/60 border-slate-700/30';
    if (data.count === 1) return 'bg-cyan-950 border-cyan-800 text-cyan-400';
    if (data.count === 2) return 'bg-cyan-700/80 border-cyan-600 text-white';
    if (data.count >= 3) return 'bg-cyan-400 border-cyan-300 text-slate-950 font-bold';
    return 'bg-slate-800/60';
  };

  // High-level metrics
  const totalCompletedHabits = allLogs.reduce((acc, log) => acc + (log.count > 0 ? 1 : 0), 0);
  const totalCompletedTasks = allTasks.filter(t => t.completed).length;
  const totalBreathingMinutes = Math.round(
    allBreathing.reduce((acc, b) => acc + b.durationSeconds, 0) / 60
  );

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto px-4 pt-3 pb-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Habits Done</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">{totalCompletedHabits}</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tasks Done</span>
          </div>
          <span className="text-xl font-bold text-cyan-300 tracking-tight">{totalCompletedTasks}</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
            <Wind className="w-3.5 h-3.5 text-indigo-400" />
            <span>Calm Time</span>
          </div>
          <span className="text-xl font-bold text-indigo-300 tracking-tight">{totalBreathingMinutes}m</span>
        </div>
      </div>

      {/* Completion Diagram */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Consistency & Completion</h3>
          </div>

          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setTimeRange('7')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition cursor-pointer ${
                timeRange === '7'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition cursor-pointer ${
                timeRange === '30'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        <div className="h-48 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 100]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs flex flex-col gap-1">
                        <span className="font-semibold text-slate-200">{formatReadableDate(data.fullDate)}</span>
                        <span className="text-cyan-400 font-medium">Completion: {data.completionRate}%</span>
                        <span className="text-indigo-300">Habits Done: {data.completedHabits}</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="completionRate"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#cyanGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution Diagrams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Time of Day Balance */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Time-of-Day Habits</h3>
          </div>
          <div className="h-40 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={timeDistribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={56}
                  paddingAngle={5}
                >
                  {timeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
            {timeDistribution.map((t) => (
              <div key={t.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                <span>{t.name}: <strong>{t.count}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Breakdown Radar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Difficulty Balance</h3>
          </div>
          <div className="h-40 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={difficultyData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="difficulty" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar name="Count" dataKey="count" stroke="#818cf8" fill="#818cf8" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-300 pt-1 text-center">
            {difficultyData.map((d) => (
              <div key={d.difficulty} className="flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span>{d.difficulty}: <strong>{d.count}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 90-Day Consistency Heatmap */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">90-Day Consistency Grid</h3>
          </div>
          <span className="text-[11px] text-slate-400">Past 3 Months</span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
            {heatmapDates.map((item) => (
              <div
                key={item.dateStr}
                title={`${formatReadableDate(item.dateStr)}: ${logsByDate.get(item.dateStr)?.count || 0} completed`}
                className={`w-3.5 h-3.5 rounded-sm border transition-colors cursor-pointer ${getIntensityClass(
                  item.dateStr
                )}`}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1.5 text-[11px] text-slate-400">
          <span>Less</span>
          <span className="w-3 h-3 rounded-sm bg-slate-800 border border-slate-700/50" />
          <span className="w-3 h-3 rounded-sm bg-cyan-950 border border-cyan-800" />
          <span className="w-3 h-3 rounded-sm bg-cyan-700/80 border border-cyan-600" />
          <span className="w-3 h-3 rounded-sm bg-cyan-400 border border-cyan-300" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
