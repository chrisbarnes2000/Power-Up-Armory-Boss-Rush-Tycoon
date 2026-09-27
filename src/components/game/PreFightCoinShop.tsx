import React from 'react';
import { GameState } from '../../types';
import { CoinIcon } from '../CoinIcon';

interface PreFightCoinShopProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  saveState: (state: GameState) => void;
  addLog: (message: string, className: string) => void;
  className?: string;
  compact?: boolean;
}

export const PreFightCoinShop: React.FC<PreFightCoinShopProps> = ({
  gameState,
  setGameState,
  saveState,
  addLog,
  className = '',
  compact = false
}) => {
  const permLimit = gameState.balanceConfig?.permUpgradeLimitPerFight ?? 3;
  const hpCount = gameState.hpUpgradesInCurrentFightCount || 0;
  const dmgCount = gameState.dmgUpgradesInCurrentFightCount || 0;
  const isHpMaxed = hpCount >= permLimit;
  const isDmgMaxed = dmgCount >= permLimit;

  const handleBuyHp = () => {
    if (isHpMaxed) {
      addLog(`⚠️ Limit reached! Max ${permLimit} HP Shields allowed between fights. Challenge a boss to reset!`, 'log-defeat');
      return;
    }
    if (gameState.coins >= 250) {
      setGameState(prev => {
        const next = {
          ...prev,
          coins: prev.coins - 250,
          maxHpBonus: (prev.maxHpBonus || 0) + 25,
          hpUpgradesInCurrentFightCount: (prev.hpUpgradesInCurrentFightCount || 0) + 1
        };
        saveState(next);
        return next;
      });
      addLog(`💖 Purchased HP Shield (+25 Max HP Permanent)! (${hpCount + 1}/${permLimit} used this round)`, 'log-heal');
    } else {
      addLog(`❌ Not enough coins! HP Shield costs 250 Coins.`, 'log-defeat');
    }
  };

  const handleBuyDmg = () => {
    if (isDmgMaxed) {
      addLog(`⚠️ Limit reached! Max ${permLimit} Combat Tonics allowed between fights. Challenge a boss to reset!`, 'log-defeat');
      return;
    }
    if (gameState.coins >= 300) {
      setGameState(prev => {
        const next = {
          ...prev,
          coins: prev.coins - 300,
          damageBonusPercent: (prev.damageBonusPercent || 0) + 5,
          dmgUpgradesInCurrentFightCount: (prev.dmgUpgradesInCurrentFightCount || 0) + 1
        };
        saveState(next);
        return next;
      });
      addLog(`⚔️ Purchased Combat Tonic (+5% DMG Permanent)! (${dmgCount + 1}/${permLimit} used this round)`, 'log-buff');
    } else {
      addLog(`❌ Not enough coins! Combat Tonic costs 300 Coins.`, 'log-defeat');
    }
  };

  return (
    <div className={`bg-[#0e1628] border border-[#1a2540] rounded-2xl p-4 flex flex-col ${className}`}>
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
        <h3 className="font-mono text-xs text-[#f5e56b] uppercase font-bold tracking-wider flex items-center gap-1.5">
          ⚡ PRE-FIGHT COIN SHOP
        </h3>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
          Limit: {permLimit}/Fight
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-3 leading-relaxed">
        Upgrade your max health or permanent combat boosts using Gold (Max {permLimit} of each per fight)!
      </p>

      <div className={compact ? "grid grid-cols-1 sm:grid-cols-2 gap-2" : "space-y-2"}>
        <button
          type="button"
          onClick={handleBuyHp}
          disabled={isHpMaxed}
          className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition text-left text-xs ${
            isHpMaxed
              ? 'bg-[#121824]/60 border-slate-700/50 text-slate-500 cursor-not-allowed'
              : 'bg-[#141c30] hover:bg-[#1a2a4c] border-[#2a4060] text-slate-200 cursor-pointer active:scale-95'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>💖 Max HP Shield (+25 HP)</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                isHpMaxed
                  ? 'bg-red-950/80 text-red-300 border border-red-500/40'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {hpCount}/{permLimit} {isHpMaxed ? 'MAX' : ''}
            </span>
          </div>
          <span className="font-mono text-[#f5e56b] font-extrabold bg-[#0a0f1d] px-2 py-0.5 rounded border border-[#f5e56b]/20 flex items-center gap-1">
            <span>250</span>
            <CoinIcon className="w-3.5 h-3.5" />
          </span>
        </button>

        <button
          type="button"
          onClick={handleBuyDmg}
          disabled={isDmgMaxed}
          className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition text-left text-xs ${
            isDmgMaxed
              ? 'bg-[#121824]/60 border-slate-700/50 text-slate-500 cursor-not-allowed'
              : 'bg-[#141c30] hover:bg-[#1a2a4c] border-[#2a4060] text-slate-200 cursor-pointer active:scale-95'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>🔥 Combat Tonic (+5% DMG)</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                isDmgMaxed
                  ? 'bg-red-950/80 text-red-300 border border-red-500/40'
                  : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
              }`}
            >
              {dmgCount}/{permLimit} {isDmgMaxed ? 'MAX' : ''}
            </span>
          </div>
          <span className="font-mono text-[#f5e56b] font-extrabold bg-[#0a0f1d] px-2 py-0.5 rounded border border-[#f5e56b]/20 flex items-center gap-1">
            <span>300</span>
            <CoinIcon className="w-3.5 h-3.5" />
          </span>
        </button>
      </div>

      <div className="flex gap-2 justify-between border-t border-white/5 pt-2 mt-3 text-xs font-mono text-slate-400">
        <span>Current HP Bonus: <strong className="text-emerald-400">+{gameState.maxHpBonus || 0} HP</strong></span>
        <span>Current DMG Bonus: <strong className="text-amber-400">+{gameState.damageBonusPercent || 0}%</strong></span>
      </div>
    </div>
  );
};
