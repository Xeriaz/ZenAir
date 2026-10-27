import React from "react";
import { CheckCircle2, Wind, BarChart3, Settings } from "lucide-react";
import { useTranslation } from "../../i18n/LanguageContext";

export type NavTab = "habits" | "breathing" | "analytics" | "settings";

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const { t } = useTranslation();

  const tabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "habits", label: t.nav.habits, icon: CheckCircle2 },
    { id: "breathing", label: t.nav.breathing, icon: Wind },
    { id: "analytics", label: t.nav.analytics, icon: BarChart3 },
    { id: "settings", label: t.nav.settings, icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-lg border-t border-slate-800/80 bottom-nav-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 px-1 pt-1.5 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "text-cyan-400 font-medium scale-105"
                  : "text-slate-400 hover:text-slate-200 active:scale-95"
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? "bg-cyan-500/15" : "bg-transparent"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`} />
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
