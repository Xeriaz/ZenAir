import React, { useState, useRef } from 'react';
import { Download, Upload, ShieldCheck, Database, Check, AlertCircle, RefreshCw, Smartphone, Sparkles } from 'lucide-react';
import { downloadDatabaseBackup, importDatabaseFromJson, db, initializeDatabase } from '../../db/db';
import { generate50DaysDemoData } from '../../db/seedData';
import { useGamification } from '../../hooks/useGamification';
import { STREAK_FREEZE_PRICE } from '../../utils/gamification';

export const SettingsView: React.FC = () => {
  const { profile, buyStreakFreeze } = useGamification();
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadDatabaseBackup();
      setStatusMessage({ text: 'Database exported successfully as JSON!' });
    } catch {
      setStatusMessage({ text: 'Failed to export database.', isError: true });
    } finally {
      setIsExporting(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        await importDatabaseFromJson(content);
        setStatusMessage({ text: 'Data restored successfully! Refreshing UI...' });
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Invalid backup JSON file';
        setStatusMessage({ text: `Import failed: ${msg}`, isError: true });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleBuyFreeze = async () => {
    if (profile.gold < STREAK_FREEZE_PRICE) {
      setStatusMessage({ text: `Not enough Gold. Need ${STREAK_FREEZE_PRICE}g, you have ${profile.gold}g.`, isError: true });
      setTimeout(() => setStatusMessage(null), 4000);
      return;
    }
    const success = await buyStreakFreeze();
    if (success) {
      setStatusMessage({ text: 'Acquired 1 Streak Freeze Token!' });
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleGenerate50DaysData = async () => {
    setIsGenerating(true);
    try {
      await generate50DaysDemoData();
      setStatusMessage({ text: 'Generated ~50 days of tracking data & analytics history!' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch {
      setStatusMessage({ text: 'Failed to generate demo data.', isError: true });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetDefaults = async () => {
    if (window.confirm('Reset habits to recommended defaults? This keeps your XP and level.')) {
      await db.habits.clear();
      await initializeDatabase();
      setStatusMessage({ text: 'Recommended habits re-initialized!' });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto px-4 pt-3 pb-8">
      {/* Status banner */}
      {statusMessage && (
        <div
          className={`flex items-center gap-2 p-3 rounded-2xl text-xs font-semibold ${
            statusMessage.isError
              ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
          }`}
        >
          {statusMessage.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Gamification Shop: Streak Freezes */}
      <div className="bg-[#160e29]/90 border border-purple-900/40 rounded-3xl p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">Streak Forgiveness Shop</h3>
        </div>
        <p className="text-xs text-purple-300/70 leading-relaxed">
          Life happens! A Streak Freeze token automatically preserves your active streaks if you miss a single day.
        </p>

        <div className="flex items-center justify-between bg-[#10091d]/80 p-3 rounded-2xl border border-purple-900/50">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-purple-200">Current Token Balance</span>
            <span className="text-xs text-purple-400 font-bold">{profile.streakFreezes} Freezes Available</span>
          </div>

          <button
            onClick={handleBuyFreeze}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 active:scale-95 transition cursor-pointer"
          >
            Buy for {STREAK_FREEZE_PRICE}g
          </button>
        </div>
      </div>

      {/* Local Data Backup & Restore */}
      <div className="bg-[#160e29]/90 border border-purple-900/40 rounded-3xl p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">Local Backup & Restore (JSON)</h3>
        </div>
        <p className="text-xs text-purple-300/70 leading-relaxed">
          ZenAir operates 100% client-side with IndexedDB. Export a local JSON backup anytime so you never lose your progress even if Safari or iOS storage purges.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-purple-950/70 hover:bg-purple-900/50 text-purple-200 font-semibold text-xs border border-purple-800/50 active:scale-95 transition cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>{isExporting ? 'Exporting...' : 'Export JSON'}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-purple-950/70 hover:bg-purple-900/50 text-purple-200 font-semibold text-xs border border-purple-800/50 active:scale-95 transition cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-4 h-4 text-violet-400" />
            <span>{isImporting ? 'Importing...' : 'Import JSON'}</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Defaults & Maintenance */}
      <div className="bg-[#160e29]/90 border border-purple-900/40 rounded-3xl p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-purple-400/80" />
          <h3 className="text-sm font-bold text-white tracking-tight">Maintenance & Demo Data</h3>
        </div>

        <button
          onClick={handleGenerate50DaysData}
          disabled={isGenerating}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-violet-500/20 hover:from-purple-500/30 hover:to-violet-500/30 border border-purple-500/40 text-purple-300 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>{isGenerating ? 'Generating...' : 'Generate ~50 Days Tracking Data'}</span>
        </button>

        <button
          onClick={handleResetDefaults}
          className="w-full py-2.5 rounded-xl bg-[#10091d] border border-purple-900/50 hover:border-purple-700/60 text-purple-300/80 hover:text-purple-100 text-xs font-semibold transition cursor-pointer text-center"
        >
          Re-seed Default Sample Habits
        </button>
      </div>

      {/* App Architecture Footnote */}
      <div className="text-center py-4 flex flex-col items-center gap-1 text-[11px] text-purple-400/60">
        <div className="flex items-center gap-1 font-semibold text-purple-300/80">
          <Smartphone className="w-3.5 h-3.5 text-purple-400" />
          <span>ZenAir PWA • Local-First Architecture</span>
        </div>
        <span>React 19 • TypeScript • Dexie.js • Tailwind CSS v4 • Recharts</span>
      </div>
    </div>
  );
};
