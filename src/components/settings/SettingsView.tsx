import React, { useState, useRef } from 'react';
import { Download, Upload, Database, Check, AlertCircle, RefreshCw, Smartphone, Sparkles } from 'lucide-react';
import { downloadDatabaseBackup, importDatabaseFromJson, db, initializeDatabase } from '../../db/db';
import { generate50DaysDemoData } from '../../db/seedData';

export const SettingsView: React.FC = () => {
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
    if (window.confirm('Reset habits to recommended defaults? Your streak stats and history will be kept.')) {
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

      {/* Local Data Backup & Restore */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">Local Backup & Restore (JSON)</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          ZenAir operates 100% client-side with IndexedDB. Export a local JSON backup anytime so you never lose your progress even if Safari or iOS storage purges.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700/80 active:scale-95 transition cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>{isExporting ? 'Exporting...' : 'Export JSON'}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700/80 active:scale-95 transition cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
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
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">Maintenance & Demo Data</h3>
        </div>

        <button
          onClick={handleGenerate50DaysData}
          disabled={isGenerating}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 border border-cyan-500/40 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{isGenerating ? 'Generating...' : 'Generate ~50 Days Tracking Data'}</span>
        </button>

        <button
          onClick={handleResetDefaults}
          className="w-full py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold transition cursor-pointer text-center"
        >
          Re-seed Default Sample Habits
        </button>
      </div>

      {/* App Architecture Footnote */}
      <div className="text-center py-4 flex flex-col items-center gap-1 text-[11px] text-slate-500">
        <div className="flex items-center gap-1 font-semibold text-slate-400">
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span>ZenAir PWA • Local-First Architecture</span>
        </div>
        <span>React 19 • TypeScript • Dexie.js • Tailwind CSS v4 • Recharts</span>
      </div>
    </div>
  );
};
