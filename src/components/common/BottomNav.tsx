import React from 'react';
import { CheckCircle2, Clock, Wind, BarChart3, Settings } from 'lucide-react';

export type NavTab = 'habits' | 'tasks' | 'breathing' | 'analytics' | 'settings';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'habits' as NavTab, label: 'Habits', icon: CheckCircle2 },
    { id: 'tasks' as NavTab, label: 'Timeline', icon: Clock },
    { id: 'breathing' as NavTab, label: 'Breathe', icon: Wind },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0b0714]/95 backdrop-blur-lg border-t border-purple-900/40 bottom-nav-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 px-1 pt-1.5 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-purple-400 font-medium scale-105'
                  : 'text-purple-300/60 hover:text-purple-100 active:scale-95'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-purple-500/15' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
