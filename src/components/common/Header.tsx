import React from 'react';
import { Sparkles, Globe } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';

export const Header: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  return (
    <header className="sticky top-0 z-30 bg-[#090d16] border-b border-slate-800/80 px-4 header-safe pb-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white">ZenAir</span>
          </div>
        </div>

        {/* Quick Language Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl p-1 text-[11px] font-semibold shadow-inner">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-1" />
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
              language === 'en'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('lt')}
            className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
              language === 'lt'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            LT
          </button>
        </div>
      </div>
    </header>
  );
};
