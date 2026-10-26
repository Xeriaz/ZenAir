import React, { useState } from 'react';
import { Coins, ShieldCheck, Plus, Sparkles, Award } from 'lucide-react';
import { useGamification } from '../../hooks/useGamification';
import { STREAK_FREEZE_PRICE } from '../../utils/gamification';

interface HeaderProps {
  onLevelUpDismiss?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { profile, xpRequired, progressPercent, buyStreakFreeze } = useGamification();
  const [freezeMessage, setFreezeMessage] = useState<string | null>(null);

  const handleBuyFreeze = async () => {
    if (profile.gold < STREAK_FREEZE_PRICE) {
      setFreezeMessage(`Need ${STREAK_FREEZE_PRICE} Gold (Have ${profile.gold})`);
      setTimeout(() => setFreezeMessage(null), 3000);
      return;
    }
    const success = await buyStreakFreeze();
    if (success) {
      setFreezeMessage('Streak Freeze Acquired!');
      setTimeout(() => setFreezeMessage(null), 3000);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0b0714] border-b border-purple-900/40 px-4 header-safe pb-3">
      <div className="max-w-2xl mx-auto flex flex-col gap-2">
        {/* Top row: Brand & Currencies */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-white">ZenAir</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                  Lv. {profile.level}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-2">
            {/* Gold */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{profile.gold}</span>
            </div>

            {/* Streak Freeze Token */}
            <button
              onClick={handleBuyFreeze}
              title={`Streak Freezes: ${profile.streakFreezes}. Tap to buy for ${STREAK_FREEZE_PRICE}g`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 active:scale-95 transition border border-purple-500/30 text-purple-300 text-xs font-semibold cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>{profile.streakFreezes}</span>
              <Plus className="w-2.5 h-2.5 opacity-60 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Freeze purchase notification */}
        {freezeMessage && (
          <div className="text-[11px] text-center text-purple-200 bg-purple-950/70 border border-purple-800/70 rounded-md py-1 animate-pulse">
            {freezeMessage}
          </div>
        )}

        {/* Second row: XP Progress Bar */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-[11px] text-purple-300/70 font-medium">
            <span className="flex items-center gap-1">
              <Award className="w-3 h-3 text-purple-400" />
              Experience
            </span>
            <span>
              <strong className="text-purple-100">{profile.xp}</strong> / {xpRequired} XP
              <span className="text-purple-400 ml-1.5">({progressPercent}%)</span>
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-purple-950/60 overflow-hidden relative border border-purple-900/40">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-violet-400 rounded-full transition-all duration-500 ease-out shadow-sm shadow-purple-500/50"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
