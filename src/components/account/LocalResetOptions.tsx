import React from 'react';
import { DEFAULT_HERO_BASELINE } from '../../data';

interface LocalResetOptionsProps {
  confirmLocalWipe: 'zero' | 'standard' | null;
  setConfirmLocalWipe: (mode: 'zero' | 'standard' | null) => void;
  onLocalWipe: (mode: 'zero' | 'standard') => void;
}

export const LocalResetOptions: React.FC<LocalResetOptionsProps> = ({
  confirmLocalWipe,
  setConfirmLocalWipe,
  onLocalWipe
}) => {
  return (
    <div className="mt-5 bg-linear-to-b from-red-950/25 to-slate-900/40 border border-red-500/25 rounded-2xl p-3 sm:p-3.5 space-y-2.5">
      <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-red-400 text-xs">⚠️</span>
            <h3 className="font-mono text-[11px] sm:text-xs text-red-400 font-extrabold uppercase tracking-widest">
              CHARACTER PROGRESS & WIPE PRESETS
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
            Choose a 1-click clean-slate preset to wipe equipment, power-ups, and battle history:
          </p>
        </div>
      </div>

      {/* 1-Click Preset Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
        {/* PRESET 1: ABSOLUTE ZERO */}
        <div className="bg-slate-950/40 border border-red-500/20 hover:border-red-500/40 rounded-xl p-3 flex flex-col justify-between h-full transition min-h-0">
          <div className="space-y-1.5">
            <div className="flex flex-row items-center justify-between gap-1.5 border-b border-white/5 pb-1.5">
              <span className="font-mono text-[11px] font-black text-red-400 flex items-center gap-1 truncate">
                <span>⚡</span> <span className="truncate">Absolute Zero Slate</span>
              </span>
              <span className="text-[9px] font-mono font-bold bg-red-950/80 border border-red-500/30 text-red-300 px-1.5 py-0.2 rounded shrink-0">
                0 PS · 0 DEF
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal font-sans">
              Raw clean slate: 0 ATK, 0 DEF (0 Armor), 0 SPD, 0 Coins, 0 Gems & 0 Nanite Revives.
            </p>
          </div>
          <div className="mt-2.5">
            {confirmLocalWipe === 'zero' ? (
              <div className="flex items-center gap-1.5 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => onLocalWipe('zero')}
                  className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-black rounded-lg transition cursor-pointer shadow-md shadow-red-600/20"
                >
                  Confirm 0 PS Wipe?
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmLocalWipe(null)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-lg transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmLocalWipe('zero')}
                className="w-full py-2 bg-red-950/40 hover:bg-red-900/60 text-red-200 border border-red-500/30 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🗑️</span>
                <span>Wipe to 0 PS (Raw Zero)</span>
              </button>
            )}
          </div>
        </div>

        {/* PRESET 2: STANDARD STARTER */}
        <div className="bg-slate-950/40 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl p-3 flex flex-col justify-between h-full transition min-h-0">
          <div className="space-y-1.5">
            <div className="flex flex-row items-center justify-between gap-1.5 border-b border-white/5 pb-1.5">
              <span className="font-mono text-[11px] font-black text-emerald-400 flex items-center gap-1 truncate">
                <span>🎮</span> <span className="truncate">Standard Starter Pack</span>
              </span>
              <span className="text-[9px] font-mono font-bold bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded shrink-0">
                {DEFAULT_HERO_BASELINE.starter.powerScore} PS · {DEFAULT_HERO_BASELINE.starter.baseDefense} DEF
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal font-sans">
              Fresh game start: 2,000 Coins, 500 Gems, 2 Revives & 10 ATK / {DEFAULT_HERO_BASELINE.starter.baseDefense} DEF / 10 SPD.
            </p>
          </div>

          <div className="mt-2.5">
            {confirmLocalWipe === 'standard' ? (
              <div className="flex items-center gap-1.5 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => onLocalWipe('standard')}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-black rounded-lg transition cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  Confirm Starter Reset?
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmLocalWipe(null)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-lg transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmLocalWipe('standard')}
                className="w-full py-2 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-200 border border-emerald-500/30 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🔄</span>
                <span>Restore Starter Pack ({DEFAULT_HERO_BASELINE.starter.powerScore} PS)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
