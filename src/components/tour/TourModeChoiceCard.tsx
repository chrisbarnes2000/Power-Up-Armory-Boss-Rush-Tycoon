import React from 'react';
import { Sparkles, Zap, ScrollText, SkipForward, Gift, CheckCircle } from 'lucide-react';
import { TOUR_BONUSES } from '../../data/tourSteps';

interface TourModeChoiceCardProps {
  completedTours?: { short?: boolean; full?: boolean };
  onSelectMode: (mode: 'short' | 'full') => void;
  onClose: () => void;
}

export const TourModeChoiceCard: React.FC<TourModeChoiceCardProps> = ({
  completedTours,
  onSelectMode,
  onClose
}) => {
  const shortClaimed = completedTours?.short === true;
  const fullClaimed = completedTours?.full === true;

  return (
    <div className="space-y-4 my-1">
      {/* Header & Title */}
      <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-amber-500/20 to-amber-700/30 border border-amber-500/40 flex items-center justify-center text-xl shadow-inner shrink-0">
            🧭
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <span>Power-Up Armory System Tour</span>
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            </h3>
            <p className="text-xs text-amber-300/90 font-mono">
              Interactive Walkthrough & Onboarding Bonuses
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Skip Tour"
          className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition active:scale-95 cursor-pointer shrink-0"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Description */}
      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
        Welcome, Champion! Complete onboarding walkthroughs to earn one-time gold coin and gem bounties:
      </p>

      {/* Tour Mode Cards Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Option 1: ⚡ Express Tour */}
        <button
          onClick={() => onSelectMode('short')}
          className="group text-left bg-linear-to-br from-[#121e36] to-[#182745] hover:from-[#182b4a] hover:to-[#22385c] border border-amber-500/30 hover:border-amber-400 p-3.5 sm:p-4 rounded-2xl transition-all duration-200 active:scale-98 cursor-pointer shadow-lg flex flex-col justify-between gap-2"
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-amber-500/30 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>5 Key Highlights</span>
            </span>
            <span className="text-lg group-hover:scale-110 transition-transform">⚡</span>
          </div>

          <div>
            <h4 className="font-extrabold text-sm text-amber-200 font-mono group-hover:text-amber-300 transition-colors">
              ⚡ Express Tour (5 Steps)
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-1 leading-normal font-sans">
              Rapid 60-second summary covering Store Voucher Keys, Tycoon Mining, Boss Rush Battles, and Global Ranks.
            </p>
          </div>

          {/* Reward Badge Indicator */}
          <div className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono flex items-center justify-between gap-1.5 mt-1 ${
            shortClaimed 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
              : 'bg-amber-950/50 border-amber-500/40 text-amber-200 animate-pulse'
          }`}>
            <div className="flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 shrink-0" />
              <span>{TOUR_BONUSES.short.label}</span>
            </div>
            {shortClaimed ? (
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 shrink-0">
                <CheckCircle className="w-3 h-3" /> Claimed
              </span>
            ) : (
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider shrink-0">
                Bonus Ready
              </span>
            )}
          </div>

          <div className="text-[10px] text-amber-400/80 font-mono font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform pt-1">
            <span>{shortClaimed ? 'Retake Express Tour' : 'Launch Express Tour'}</span>
            <span>→</span>
          </div>
        </button>

        {/* Option 2: 📜 Full Grand Tour */}
        <button
          onClick={() => onSelectMode('full')}
          className="group text-left bg-linear-to-br from-[#121e36] to-[#182745] hover:from-[#182b4a] hover:to-[#22385c] border border-blue-500/30 hover:border-blue-400 p-3.5 sm:p-4 rounded-2xl transition-all duration-200 active:scale-98 cursor-pointer shadow-lg flex flex-col justify-between gap-2"
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-blue-500/30 flex items-center gap-1">
              <ScrollText className="w-3 h-3 text-blue-400" />
              <span>20 Deep Dive Steps</span>
            </span>
            <span className="text-lg group-hover:scale-110 transition-transform">📜</span>
          </div>

          <div>
            <h4 className="font-extrabold text-sm text-blue-200 font-mono group-hover:text-blue-300 transition-colors">
              📜 Grand Tour (20 Steps)
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-1 leading-normal font-sans">
              Comprehensive deep dive through Lore Archives, Bestiary Dossiers, Cart Receipts, Mining Combos, and Telemetry.
            </p>
          </div>

          {/* Reward Badge Indicator */}
          <div className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono flex items-center justify-between gap-1.5 mt-1 ${
            fullClaimed 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
              : 'bg-blue-950/50 border-blue-500/40 text-blue-200 animate-pulse'
          }`}>
            <div className="flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 shrink-0" />
              <span>{TOUR_BONUSES.full.label}</span>
            </div>
            {fullClaimed ? (
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 shrink-0">
                <CheckCircle className="w-3 h-3" /> Claimed
              </span>
            ) : (
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider shrink-0">
                Master Bonus
              </span>
            )}
          </div>

          <div className="text-[10px] text-blue-400/80 font-mono font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform pt-1">
            <span>{fullClaimed ? 'Retake Grand Tour' : 'Launch Grand Tour'}</span>
            <span>→</span>
          </div>
        </button>
      </div>

      {/* Footer Skip Action */}
      <div className="flex justify-end pt-1">
        <button
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-slate-200 underline font-mono transition cursor-pointer"
        >
          Skip Tour & Explore Directly
        </button>
      </div>
    </div>
  );
};
