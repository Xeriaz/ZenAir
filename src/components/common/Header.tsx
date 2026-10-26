import React, { useState } from 'react';
import { Coins, ShieldCheck, Plus, Sparkles } from 'lucide-react';
import { useGamification } from '../../hooks/useGamification';
import { STREAK_FREEZE_PRICE } from '../../utils/gamification';

export const Header: React.FC = () => {
  const { profile, buyStreakFreeze } = useGamification();
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
    <header className="sticky top-0 z-30 bg-[#090d16] border-b border-slate-800/80 px-4 header-safe pb-3">
      <div className="max-w-2xl mx-auto flex flex-col gap-2">
        {/* Top row: Brand & Currencies */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-white">ZenAir</span>
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
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 active:scale-95 transition border border-blue-500/25 text-blue-300 text-xs font-semibold cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>{profile.streakFreezes}</span>
              <Plus className="w-2.5 h-2.5 opacity-60 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Freeze purchase notification */}
        {freezeMessage && (
          <div className="text-[11px] text-center text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 rounded-md py-1 animate-pulse">
            {freezeMessage}
          </div>
        )}
      </div>
    </header>
  );
};
