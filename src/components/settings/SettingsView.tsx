import React, { useState, useRef } from 'react';
import { Download, Upload, Database, Check, AlertCircle, RefreshCw, Smartphone, Sparkles, Trash2, Lock, X, Globe, Vibrate } from 'lucide-react';
import { useGamification } from '../../hooks/useGamification';
import { isVibrationSupported, triggerVibration, HAPTIC_PATTERNS } from '../../utils/haptics';
import { downloadDatabaseBackup, importDatabaseFromJson, db, INITIAL_HABITS, resetAllDatabaseData } from '../../db/db';
import { generate50DaysDemoData } from '../../db/seedData';
import type { Habit } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';

export const SettingsView: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const { profile, updatePreferences } = useGamification();
  const vibrationEnabled = profile.vibrationEnabled !== false;
  const hasVibrationSupport = isVibrationSupported();

  const handleToggleVibration = async (enabled: boolean) => {
    await updatePreferences({ vibrationEnabled: enabled });
    if (enabled) {
      triggerVibration(HAPTIC_PATTERNS.testPulse);
    }
  };

  const handleTestVibration = () => {
    if (hasVibrationSupport) {
      triggerVibration(HAPTIC_PATTERNS.testPulse);
      setStatusMessage({ text: t.settings.vibrationTestSuccess });
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage({ text: t.settings.vibrationUnsupported, isError: true });
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadDatabaseBackup();
      setStatusMessage({ text: t.settings.exportSuccess });
    } catch {
      setStatusMessage({ text: t.settings.exportError, isError: true });
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
        setStatusMessage({ text: t.settings.importSuccess });
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t.settings.invalidBackupFile;
        setStatusMessage({ text: `${t.settings.importError} ${msg}`, isError: true });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleResetAllData = async () => {
    if (window.confirm(t.settings.resetConfirm)) {
      setIsResetting(true);
      try {
        await resetAllDatabaseData();
        setStatusMessage({ text: t.settings.resetSuccess });
        setTimeout(() => setStatusMessage(null), 3500);
      } catch (err) {
        console.error('Failed to reset all data:', err);
        setStatusMessage({ text: t.settings.resetError, isError: true });
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleConfirmPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput !== 'test') {
      setPasswordError(t.settings.incorrectPasswordError);
      return;
    }

    setIsPasswordModalOpen(false);
    setPasswordInput('');
    setPasswordError(null);

    setIsGenerating(true);
    try {
      await generate50DaysDemoData();
      setStatusMessage({ text: t.settings.generateDemoSuccess });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch {
      setStatusMessage({ text: t.settings.generateDemoError, isError: true });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadSampleHabits = async () => {
    if (window.confirm(t.settings.loadSampleConfirm)) {
      await db.habits.bulkAdd(INITIAL_HABITS as Habit[]);
      setStatusMessage({ text: t.settings.loadSampleSuccess });
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

      {/* Language Selection */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">{t.settings.languageTitle}</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {t.settings.languageDesc}
        </p>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => setLanguage('en')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-semibold text-xs border transition cursor-pointer ${
              language === 'en'
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700/80'
            }`}
          >
            <span>🇬🇧 {t.settings.english}</span>
          </button>

          <button
            onClick={() => setLanguage('lt')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-semibold text-xs border transition cursor-pointer ${
              language === 'lt'
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700/80'
            }`}
          >
            <span>🇱🇹 {t.settings.lithuanian}</span>
          </button>
        </div>
      </div>

      {/* Haptics & Vibration Settings */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Vibrate className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">{t.settings.vibrationTitle}</h3>
          </div>
          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={vibrationEnabled}
            onClick={() => handleToggleVibration(!vibrationEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              vibrationEnabled ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                vibrationEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {t.settings.vibrationDesc}
        </p>

        {/* Device support banner */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px]">
          {hasVibrationSupport ? (
            <span className="text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              {t.settings.vibrationSupported}
            </span>
          ) : (
            <span className="text-amber-400/90 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              {t.settings.vibrationUnsupported}
            </span>
          )}
        </div>

        {/* Test vibration button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleTestVibration}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700/80 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Vibrate className="w-4 h-4 text-cyan-400" />
            <span>{t.settings.vibrationTestBtn}</span>
          </button>
        </div>
      </div>

      {/* Local Data Backup & Restore */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">{t.settings.backupTitle}</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {t.settings.backupDesc}
        </p>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700/80 active:scale-95 transition cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>{isExporting ? t.settings.exporting : t.settings.exportJson}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700/80 active:scale-95 transition cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>{isImporting ? t.settings.importing : t.settings.importJson}</span>
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

      {/* Reset All Data (Danger Zone) */}
      <div className="bg-slate-900/90 border border-rose-900/40 rounded-3xl p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-rose-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">{t.settings.resetTitle}</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {t.settings.resetDesc}
        </p>

        <button
          onClick={handleResetAllData}
          disabled={isResetting}
          className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4 text-rose-400" />
          <span>{isResetting ? t.settings.resetting : t.settings.resetBtn}</span>
        </button>
      </div>

      {/* Sample & Demo Data */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">{t.settings.sampleDemoTitle}</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {t.settings.sampleDemoDesc}
        </p>

        <button
          onClick={() => {
            setPasswordInput('');
            setPasswordError(null);
            setIsPasswordModalOpen(true);
          }}
          disabled={isGenerating}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 border border-cyan-500/40 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{isGenerating ? t.settings.generating : t.settings.generateDemoBtn}</span>
        </button>

        <button
          onClick={handleLoadSampleHabits}
          className="w-full py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold transition cursor-pointer text-center"
        >
          {t.settings.loadSampleHabitsBtn}
        </button>
      </div>

      {/* Password Confirmation Modal for Demo Data */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-sm font-bold text-white">{t.settings.securityModalTitle}</h3>
              </div>
              <button
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordInput('');
                  setPasswordError(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {t.settings.securityModalDesc}
            </p>

            <form onSubmit={handleConfirmPasswordSubmit} className="flex flex-col gap-3">
              <div>
                <input
                  type="password"
                  autoFocus
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(null);
                  }}
                  placeholder={t.settings.enterPasswordPlaceholder}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
                {passwordError && (
                  <p className="text-[11px] text-rose-400 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPasswordInput('');
                    setPasswordError(null);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition cursor-pointer shadow-md shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
                >
                  {isGenerating ? t.settings.generating : t.common.confirm}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* App Architecture Footnote */}
      <div className="text-center py-4 flex flex-col items-center gap-1 text-[11px] text-slate-500">
        <div className="flex items-center gap-1 font-semibold text-slate-400">
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t.settings.appArchitecture}</span>
        </div>
        <span>React 19 • TypeScript • Dexie.js • Tailwind CSS v4 • Recharts</span>
      </div>
    </div>
  );
};
