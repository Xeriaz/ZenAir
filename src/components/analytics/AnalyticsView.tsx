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
import { BarChart3, PieChart as PieIcon, Flame, Calendar, Award, Wind } from 'lucide-react';
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

  const breathingLogs = useLiveQuery(async () => {
    return await db.breathingLogs.toArray();
  }, []);

  const activeHabits = habits ?? [];
  const allLogs = habitLogs ?? [];
  const allBreathing = breathingLogs ?? [];

  // Group logs by date
  const logsByDate = new Map<string, { count: number; xp: number }>();
  allLogs.forEach((log) => {
    const existing = logsByDate.get(log.date) || { count: 0, xp: 0 };
    logsByDate.set(log.date, {
      count: existing.count + (log.count > 0 ? 1 : 0),
      xp: existing.xp + (log.xpEarned || 0)
    });
  });

  // Calculate 7-day or 30-day chart data
  const dayCount = timeRange === '7' ? 7 : 30;
  const recentDateStrings = getLastNDaysDateStrings(dayCount);
  const totalDailyHabits = activeHabits.filter(h => h.type === 'daily').length || 1;

  const chartData = recentDateStrings.map((dateStr) => {
    const data = logsByDate.get(dateStr) || { count: 0, xp: 0 };
    const completionRate = Math.min(100, Math.round((data.count / totalDailyHabits) * 100));
    return {
      date: dateStr.slice(5), // MM-DD
      fullDate: dateStr,
      completionRate,
      xp: data.xp,
      completedHabits: data.count
    };
  });

  // Time-of-day distribution with rich purple / violet palette
  const timeDistribution = [
    { name: 'Morning', count: 0, color: '#c084fc' },
    { name: 'Afternoon', count: 0, color: '#a855f7' },
    { name: 'Evening', count: 0, color: '#7e22ce' },
    { name: 'Anytime', count: 0, color: '#e879f9' }
  ];

  activeHabits.forEach((h) => {
    const item = timeDistribution.find((t) => t.name.toLowerCase() === h.timeOfDay);
    if (item) item.count += 1;
  });

  // Difficulty radar data
  const difficultyData = [
    { level: 'Easy', count: activeHabits.filter(h => h.difficulty === 'easy').length },
    { level: 'Medium', count: activeHabits.filter(h => h.difficulty === 'medium').length },
    { level: 'Hard', count: activeHabits.filter(h => h.difficulty === 'hard').length },
  ];

  // 90-Day Heatmap calculations
  const heatmapDates = get90DayGridDates();
  const getIntensityClass = (dateStr: string) => {
    const data = logsByDate.get(dateStr);
    if (!data || data.count === 0) return 'bg-purple-950/40 border-purple-900/30';
    if (data.count === 1) return 'bg-purple-950 border-purple-800 text-purple-300';
    if (data.count === 2) return 'bg-purple-700/80 border-purple-600 text-white';
    if (data.count >= 3) return 'bg-purple-400 border-purple-300 text-purple-950 font-bold';
    return 'bg-purple-950/40';
  };

  // High-level metrics
  const totalCompletedHabits = allLogs.reduce((acc, log) => acc + (log.count > 0 ? 1 : 0), 0);
  const totalXpEarned = allLogs.reduce((acc, log) => acc + (log.xpEarned || 0), 0);
  const totalBreathingMinutes = Math.round(
    allBreathing.reduce((acc, b) => acc + b.durationSeconds, 0) / 60
  );

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto px-4 pt-3 pb-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#160e29]/90 border border-purple-900/40 rounded-2xl p-3 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-1.5 text-purple-300/70 text-[11px] font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Habits Done</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">{totalCompletedHabits}</span>
        </div>

        <div className="bg-[#160e29]/90 border border-purple-900/40 rounded-2xl p-3 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-1.5 text-purple-300/70 text-[11px] font-medium">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span>Total XP</span>
          </div>
          <span className="text-xl font-bold text-purple-300 tracking-tight">{totalXpEarned}</span>
        </div>

        <div className="bg-[#160e29]/90 border border-purple-900/40 rounded-2xl p-3 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-1.5 text-purple-300/70 text-[11px] font-medium">
            <Wind className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Calm Time</span>
          </div>
          <span className="text-xl font-bold text-fuchsia-300 tracking-tight">{totalBreathingMinutes}m</span>
        </div>
      </div>

      {/* Completion & XP Diagram */}
      <div className="bg-[#160e29]/90 border border-purple-900/40 rounded-3xl p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Consistency & Completion</h3>
          </div>

          <div className="flex items-center bg-[#10091d] p-0.5 rounded-lg border border-purple-900/50">
            <button
              onClick={() => setTimeRange('7')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition cursor-pointer ${
                timeRange === '7'
                  ? 'bg-purple-500 text-white font-bold'
                  : 'text-purple-300/60 hover:text-purple-100'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition cursor-pointer ${
                timeRange === '30'
                  ? 'bg-purple-500 text-white font-bold'
                  : 'text-purple-300/60 hover:text-purple-100'
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
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#9333ea" fontSize={10} tickLine={false} />
              <YAxis stroke="#9333ea" fontSize={10} tickLine={false} domain={[0, 100]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#18102d] border border-purple-800/70 p-2.5 rounded-xl shadow-xl text-xs flex flex-col gap-1">
                        <span className="font-semibold text-purple-100">{formatReadableDate(data.fullDate)}</span>
                        <span className="text-purple-400 font-medium">Completion: {data.completionRate}%</span>
                        <span className="text-fuchsia-300">XP Earned: {data.xp}</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="completionRate"
                stroke="#c084fc"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#purpleGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution Diagrams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Time of Day Balance */}
        <div className="bg-[#160e29]/90 border border-purple-900/40 rounded-3xl p-4 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-purple-400" />
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
          <div className="grid grid-cols-2 gap-2 text-[11px] text-purple-200 pt-1">
            {timeDistribution.map((t) => (
              <div key={t.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                <span>{t.name}: <strong>{t.count}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Breakdown Radar */}
        <div className="bg-[#160e29]/90 border border-purple-900/40 rounded-3xl p-4 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Difficulty Balance</h3>
          </div>
          <div className="h-40 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={difficultyData}>
                <PolarGrid stroke="#3b255e" />
                <PolarAngleAxis dataKey="level" stroke="#c4b5fd" fontSize={11} />
                <PolarRadiusAxis stroke="#6b21a8" fontSize={9} />
                <Radar name="Count" dataKey="count" stroke="#a855f7" fill="#a855f7" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 90-Day Consistency Heatmap */}
      <div className="bg-[#160e29]/90 border border-purple-900/40 rounded-3xl p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">90-Day Consistency Grid</h3>
          </div>
          <span className="text-[11px] text-purple-300/70">Past 3 Months</span>
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
        <div className="flex items-center justify-end gap-1.5 text-[11px] text-purple-300/70">
          <span>Less</span>
          <span className="w-3 h-3 rounded-sm bg-purple-950/40 border border-purple-900/30" />
          <span className="w-3 h-3 rounded-sm bg-purple-950 border border-purple-800" />
          <span className="w-3 h-3 rounded-sm bg-purple-700/80 border border-purple-600" />
          <span className="w-3 h-3 rounded-sm bg-purple-400 border border-purple-300" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
