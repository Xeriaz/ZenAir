import React, { useState, useEffect, useRef } from 'react';
import { Star, Play, Pause, RotateCcw, CheckCircle, Sparkles, Info, ChevronDown } from 'lucide-react';
import { BREATHING_STANDARDS } from '../../utils/breathingData';
import type { BreathingExerciseId } from '../../types';
import { useGamification } from '../../hooks/useGamification';
import { db } from '../../db/db';

export const BreathingView: React.FC = () => {
  const { profile, updatePreferences } = useGamification();

  const [selectedId, setSelectedId] = useState<BreathingExerciseId>('box');
  const [sessionMinutes, setSessionMinutes] = useState<number>(3);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(4);
  const [totalSecondsLeft, setTotalSecondsLeft] = useState<number>(180);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState<boolean>(false);

  // Wim Hof specific states
  const [wimCycle, setWimCycle] = useState<number>(1);
  const [wimState, setWimState] = useState<'breathing' | 'retention' | 'recovery'>('breathing');
  const [retentionSeconds, setRetentionSeconds] = useState<number>(0);

  // Load default from user profile
  useEffect(() => {
    if (profile.defaultBreathingId && profile.defaultBreathingId in BREATHING_STANDARDS) {
      setSelectedId(profile.defaultBreathingId as BreathingExerciseId);
    }
    if (profile.preferredSessionMinutes) {
      setSessionMinutes(profile.preferredSessionMinutes);
      setTotalSecondsLeft(profile.preferredSessionMinutes * 60);
    }
  }, [profile.defaultBreathingId, profile.preferredSessionMinutes]);

  const currentStandard = BREATHING_STANDARDS[selectedId];
  const isWimHof = selectedId === 'wim_hof';

  // Current step in regular flow
  const currentStep = currentStandard.steps[stepIndex] || currentStandard.steps[0];

  // Favorite toggle
  const isFavorite = profile.defaultBreathingId === selectedId;
  const toggleFavorite = async () => {
    await updatePreferences({ defaultBreathingId: selectedId });
  };

  const resetSession = () => {
    setIsActive(false);
    setStepIndex(0);
    setPhaseSecondsLeft(currentStandard.steps[0]?.durationSeconds || 4);
    setTotalSecondsLeft(sessionMinutes * 60);
    setWimCycle(1);
    setWimState('breathing');
    setRetentionSeconds(0);
  };

  // Change duration
  const handleSelectDuration = async (mins: number) => {
    setSessionMinutes(mins);
    setTotalSecondsLeft(mins * 60);
    setIsActive(false);
    resetSession();
    await updatePreferences({ preferredSessionMinutes: mins });
  };

  // Select standard
  const handleSelectStandard = (id: BreathingExerciseId) => {
    setSelectedId(id);
    setIsActive(false);
    resetSession();
  };

  // Main Phase Runner
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      // Handle Wim Hof Method Custom Flow
      if (isWimHof) {
        if (wimState === 'breathing') {
          setPhaseSecondsLeft((prev) => {
            if (prev <= 1) {
              setStepIndex((curStep) => {
                const nextStep = curStep === 0 ? 1 : 0;
                if (nextStep === 0) {
                  setWimCycle((c) => {
                    if (c >= 30) {
                      setWimState('retention');
                      setRetentionSeconds(0);
                      return 30;
                    }
                    return c + 1;
                  });
                }
                return nextStep;
              });
              return currentStandard.steps[stepIndex === 0 ? 1 : 0].durationSeconds;
            }
            return prev - 1;
          });
        } else if (wimState === 'retention') {
          setRetentionSeconds((s) => s + 1);
        } else if (wimState === 'recovery') {
          setPhaseSecondsLeft((prev) => {
            if (prev <= 1) {
              completeSession();
              return 0;
            }
            return prev - 1;
          });
        }
        return;
      }

      // Standard flows
      setTotalSecondsLeft((total) => {
        if (total <= 1) {
          completeSession();
          return 0;
        }
        return total - 1;
      });

      setPhaseSecondsLeft((prev) => {
        if (prev <= 1) {
          const nextIndex = (stepIndex + 1) % currentStandard.steps.length;
          setStepIndex(nextIndex);
          return currentStandard.steps[nextIndex].durationSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isWimHof, wimState, stepIndex, currentStandard, sessionMinutes]);

  const completeSession = async () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const durationDone = sessionMinutes * 60 - totalSecondsLeft;
    await db.breathingLogs.add({
      exerciseId: selectedId,
      durationSeconds: Math.max(30, durationDone),
      completedAt: new Date().toISOString()
    });

    setIsCompletedModalOpen(true);
  };

  const endRetentionHold = () => {
    setWimState('recovery');
    setPhaseSecondsLeft(15);
  };

  // Determine current active animation class and CSS vars
  let animationClass = 'animate-breathe-hold';
  let cueText = currentStep.cue;
  let phaseName = currentStep.name;
  let scaleStart = currentStep.scaleStart;
  let scaleEnd = currentStep.scaleEnd;
  let phaseDuration = currentStep.durationSeconds;

  if (isWimHof) {
    if (wimState === 'breathing') {
      phaseName = `Cycle ${wimCycle}/30`;
      cueText = stepIndex === 0 ? 'Power Inhale' : 'Let It Go';
      animationClass = stepIndex === 0 ? 'animate-breathe-expand' : 'animate-breathe-contract';
      scaleStart = stepIndex === 0 ? 1.0 : 1.6;
      scaleEnd = stepIndex === 0 ? 1.6 : 1.1;
      phaseDuration = stepIndex === 0 ? 2 : 1.5;
    } else if (wimState === 'retention') {
      phaseName = 'Retention Hold';
      cueText = 'Hold on Empty — Relax';
      animationClass = 'animate-breathe-hold';
      scaleStart = 1.0;
      scaleEnd = 1.0;
    } else if (wimState === 'recovery') {
      phaseName = 'Recovery Hold';
      cueText = 'Inhale Full & Hold 15s';
      animationClass = 'animate-breathe-hold';
      scaleStart = 1.6;
      scaleEnd = 1.6;
    }
  } else {
    if (currentStep.type === 'inhale' || currentStep.type === 'inhale_topup') {
      animationClass = 'animate-breathe-expand';
    } else if (currentStep.type === 'exhale') {
      animationClass = 'animate-breathe-contract';
    } else {
      animationClass = 'animate-breathe-hold';
    }
  }

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto px-4 pt-3 pb-8">
      {/* Exercise Selection Dropdown (Select Input) */}
      <div className="relative w-full">
        <label htmlFor="breathing-select" className="sr-only">
          Select Breathing Method
        </label>
        <select
          id="breathing-select"
          value={selectedId}
          onChange={(e) => handleSelectStandard(e.target.value as BreathingExerciseId)}
          className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 cursor-pointer shadow-sm appearance-none pr-10"
        >
          {(Object.keys(BREATHING_STANDARDS) as BreathingExerciseId[]).map((id) => {
            const standard = BREATHING_STANDARDS[id];
            return (
              <option key={id} value={id} className="bg-slate-900 text-slate-200">
                {standard.name} — {standard.tagline}
              </option>
            );
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {/* Main Interactive Visual Pacer Card */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-5 flex flex-col items-center justify-between gap-6 shadow-xl relative overflow-hidden min-h-[440px]">
        {/* Top Info Bar */}
        <div className="w-full flex items-center justify-between z-10">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">{currentStandard.name}</h2>
              <button
                onClick={toggleFavorite}
                title={isFavorite ? 'Default Preferred Protocol' : 'Star as default'}
                className="text-amber-400 transition hover:scale-110 cursor-pointer"
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : 'opacity-40'}`} />
              </button>
            </div>
            <p className="text-[11px] text-cyan-400 font-medium">{currentStandard.tagline}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700/60">
              {isWimHof && wimState === 'retention'
                ? `Hold: ${retentionSeconds}s`
                : formatTimer(totalSecondsLeft)}
            </span>
          </div>
        </div>

        {/* The 60fps Circular Visual Guide */}
        <div className="relative flex items-center justify-center my-auto py-6">
          {/* Animated Glow Rings */}
          <div
            className={`absolute w-44 h-44 rounded-full border border-cyan-500/20 pointer-events-none ${
              isActive ? 'animate-breathe-ripple' : ''
            }`}
          />

          {/* Central Pacer Circle with CSS variables */}
          <div
            key={`${selectedId}-${stepIndex}-${wimState}`}
            style={
              {
                '--phase-duration': `${phaseDuration}s`,
                '--scale-start': scaleStart,
                '--scale-end': scaleEnd,
                '--scale-hold': scaleStart
              } as React.CSSProperties
            }
            className={`w-48 h-48 rounded-full flex flex-col items-center justify-center p-4 text-center shadow-2xl transition-all duration-300 ${
              isActive
                ? `${animationClass} bg-gradient-to-tr from-cyan-600/30 via-indigo-600/30 to-purple-600/30 border-2 border-cyan-400/80 shadow-cyan-500/30 ring-4 ring-cyan-500/10`
                : 'bg-slate-900 border-2 border-slate-700/60 opacity-80'
            }`}
          >
            <span className="text-xs uppercase tracking-wider font-extrabold text-cyan-400 mb-1">
              {phaseName}
            </span>
            <span className="text-sm font-bold text-white px-2 leading-tight">
              {cueText}
            </span>
            <span className="text-2xl font-black text-cyan-300 mt-1">
              {isWimHof && wimState === 'retention'
                ? `${retentionSeconds}s`
                : `${phaseSecondsLeft}s`}
            </span>
          </div>
        </div>

        {/* Wim Hof Retention Hold Button */}
        {isWimHof && isActive && wimState === 'retention' && (
          <div className="w-full flex justify-center z-10 animate-bounce">
            <button
              onClick={endRetentionHold}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/30 transition cursor-pointer"
            >
              Inhale & End Retention
            </button>
          </div>
        )}

        {/* Bottom Duration Pills & Controls */}
        <div className="w-full flex flex-col items-center gap-3 z-10">
          {!isActive && !isWimHof && (
            <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              {[1, 3, 5, 10].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSelectDuration(mins)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    sessionMinutes === mins
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          )}

          {/* Action Buttons: Play/Pause/Reset */}
          <div className="flex items-center gap-4">
            <button
              onClick={resetSession}
              title="Reset"
              className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition active:scale-95 cursor-pointer border border-slate-700/60"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsActive(!isActive)}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm flex items-center gap-2 shadow-xl shadow-cyan-500/25 transition active:scale-95 cursor-pointer"
            >
              {isActive ? (
                <>
                  <Pause className="w-5 h-5 fill-white" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" />
                  <span>{totalSecondsLeft < sessionMinutes * 60 ? 'Resume' : 'Begin Pacer'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Protocol Benefits & Description Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 flex flex-col gap-2.5 shadow-sm">
        <div className="flex items-center gap-2 text-cyan-400">
          <Info className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            About {currentStandard.name}
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {currentStandard.description}
        </p>
        <div className="flex flex-col gap-1.5 pt-1">
          {currentStandard.benefits.map((b, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
              <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Completion Modal */}
      {isCompletedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 w-full max-w-sm text-center flex flex-col items-center gap-3 shadow-2xl shadow-cyan-500/20">
            <div className="w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h3 className="text-base font-bold text-white">Session Completed!</h3>
            <p className="text-xs text-slate-300">
              You downregulated your nervous system and enhanced heart-rate coherence.
            </p>

            <button
              onClick={() => {
                setIsCompletedModalOpen(false);
                resetSession();
              }}
              className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              Continue Journey
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
