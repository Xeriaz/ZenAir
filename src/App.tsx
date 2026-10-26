import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Header } from './components/common/Header';
import { BottomNav, type NavTab } from './components/common/BottomNav';
import { HabitList } from './components/habits/HabitList';
import { TaskTimeline } from './components/tasks/TaskTimeline';
import { initializeDatabase } from './db/db';

const BreathingView = lazy(() =>
  import('./components/breathing/BreathingView').then((m) => ({ default: m.BreathingView }))
);
const AnalyticsView = lazy(() =>
  import('./components/analytics/AnalyticsView').then((m) => ({ default: m.AnalyticsView }))
);
const SettingsView = lazy(() =>
  import('./components/settings/SettingsView').then((m) => ({ default: m.SettingsView }))
);

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('habits');
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    initializeDatabase()
      .then(() => setIsDbReady(true))
      .catch((err) => {
        console.error('Failed to initialize database:', err);
        setIsDbReady(true);
      });
  }, []);

  if (!isDbReady) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>Awakening ZenAir...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans pb-safe">
      {/* Brand Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {currentTab === 'habits' && <HabitList />}
        {currentTab === 'tasks' && <TaskTimeline />}
        {currentTab === 'breathing' && (
          <Suspense fallback={<div className="text-center py-24 text-xs text-slate-500">Loading Breathing Guide...</div>}>
            <BreathingView />
          </Suspense>
        )}
        {currentTab === 'analytics' && (
          <Suspense fallback={<div className="text-center py-24 text-xs text-slate-500">Loading Analytics...</div>}>
            <AnalyticsView />
          </Suspense>
        )}
        {currentTab === 'settings' && (
          <Suspense fallback={<div className="text-center py-24 text-xs text-slate-500">Loading Settings...</div>}>
            <SettingsView />
          </Suspense>
        )}
      </main>

      {/* iOS Safe Area Compliant Bottom Navigation */}
      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
};

export default App;
