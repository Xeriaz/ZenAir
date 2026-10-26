import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { BottomNav, type NavTab } from './components/common/BottomNav';
import { HabitList } from './components/habits/HabitList';
import { TaskTimeline } from './components/tasks/TaskTimeline';
import { BreathingView } from './components/breathing/BreathingView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';
import { initializeDatabase } from './db/db';

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
      <div className="min-h-screen bg-[#0b0714] flex items-center justify-center text-purple-300/70 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          <span>Awakening ZenAir...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0714] text-purple-100 flex flex-col font-sans pb-safe">
      {/* Gamification Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {currentTab === 'habits' && <HabitList />}
        {currentTab === 'tasks' && <TaskTimeline />}
        {currentTab === 'breathing' && <BreathingView />}
        {currentTab === 'analytics' && <AnalyticsView />}
        {currentTab === 'settings' && <SettingsView />}
      </main>

      {/* iOS Safe Area Compliant Bottom Navigation */}
      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
};

export default App;
