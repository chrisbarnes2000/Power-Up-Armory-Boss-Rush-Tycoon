import React from 'react';
import { AlertTriangle, ShieldAlert, Heart, Zap, Check, X } from 'lucide-react';

export interface StatWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemEmoji: string;
  currentDefense: number;
  newDefense: number;
  currentMaxHP: number;
  newMaxHP: number;
  actionType?: 'purchase' | 'redemption';
}

/**
  * StatWarningModal - Prompts players when a pack purchase or code redemption 
  * causes extreme stat offsets (e.g. Defense < 0 or Max HP dropping below 50).
  */
export const StatWarningModal: React.FC<StatWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemEmoji,
  currentDefense,
  newDefense,
  currentMaxHP,
  newMaxHP,
  actionType = 'purchase'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-linear-to-b from-[#1c1220] via-[#141829] to-[#0c101d] border-2 border-amber-500/60 rounded-2xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] relative text-white space-y-5 overflow-hidden">
        
        {/* Top Glow Background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Title */}
        <div className="flex items-center gap-3 border-b border-amber-500/30 pb-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <AlertTriangle className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h3 className="font-mono text-base font-black text-amber-300 uppercase tracking-wider">
              EXTREME STAT OFFSET ALERT
            </h3>
            <p className="text-xs text-amber-200/80">
              Glass Cannon Build Threshold Reached
            </p>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close warning modal"
            className="ml-auto text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Body */}
        <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
          <p>
            {actionType === 'redemption' ? 'Redeeming' : 'Purchasing'} <span className="font-bold text-white">{itemEmoji} {itemName}</span> will significantly reduce your champion's defensive resilience in exchange for heavy damage!
          </p>

          {/* Stat Comparison Card */}
          <div className="bg-black/50 border border-amber-500/30 rounded-xl p-3.5 space-y-2.5 font-mono">
            {/* Defense Stat */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" /> Defense:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">{currentDefense} DEF</span>
                <span className="text-slate-500">➔</span>
                <span className={`font-black ${newDefense < 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}`}>
                  {newDefense} DEF {newDefense < 0 ? '⚠️' : ''}
                </span>
              </div>
            </div>

            {/* Max HP Stat */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-red-400" /> Max Health:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">{currentMaxHP} HP</span>
                <span className="text-slate-500">➔</span>
                <span className={`font-black ${newMaxHP <= 30 ? 'text-amber-400 font-bold' : 'text-emerald-400'}`}>
                  {newMaxHP} HP {newMaxHP <= 10 ? '(10 HP Floor Active)' : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 space-y-1">
            <span className="font-bold flex items-center gap-1 text-amber-300">
              💡 Combat Strategy Tip:
            </span>
            <p>
              Negative defense makes you fragile, but you can counterbalance stats anytime by equipping <strong>Magnetite Shield 🧲</strong>, <strong>Titan Armor 💪</strong>, or acquiring <strong>Max HP Upgrades</strong>!
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-linear-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-amber-500/20 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Confirm & Equip
          </button>
        </div>

      </div>
    </div>
  );
};
