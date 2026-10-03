import React from 'react';
import { GameState } from '../../types';
import { CoinIcon } from '../CoinIcon';
import { triggerParticleBurst } from '../common/ParticleFX';
import { getCurrentReviveCost as getCurrentReviveCostEngine } from '../../utils/combatEngine';

export interface PreFightCoinShopProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  saveState: (state: GameState) => void;
  addLog: (message: string, className?: string) => void;
  className?: string;
  compact?: boolean;
  livePlayerHP?: number;
  livePlayerMaxHP?: number;
  onUseHealthPack?: () => void;
  isFighting?: boolean;
  getCurrentReviveCost?: () => number;
  onBuyCombatHealthTonic?: () => void;
  totalAttack?: number;
  totalDefense?: number;
  totalSpeed?: number;
  powerScore?: number;
}

export const PreFightCoinShop: React.FC<PreFightCoinShopProps> = ({
  gameState,
  setGameState,
  saveState,
  addLog,
  className = '',
  compact = false,
  livePlayerHP,
  livePlayerMaxHP = 100,
  onUseHealthPack,
  isFighting = false,
  getCurrentReviveCost,
  onBuyCombatHealthTonic,
  totalAttack,
  totalDefense,
  totalSpeed,
  powerScore
}) => {
  const permLimit = gameState.balanceConfig?.permUpgradeLimitPerFight ?? 3;
  const hpCount = gameState.hpUpgradesInCurrentFightCount || 0;
  const dmgCount = gameState.dmgUpgradesInCurrentFightCount || 0;
  const isHpMaxed = hpCount >= permLimit;
  const isDmgMaxed = dmgCount >= permLimit;

  const reviveCost = getCurrentReviveCost ? getCurrentReviveCost() : getCurrentReviveCostEngine(gameState);
  const quarterHP = Math.max(1, Math.floor(livePlayerMaxHP / 4));
  const isInjured = livePlayerHP !== undefined && livePlayerHP < livePlayerMaxHP;
  const isDead = !!gameState.isDead || (livePlayerHP !== undefined && livePlayerHP <= 0);

  const handleBuyHp = () => {
    if (isFighting) {
      addLog(`🔒 Pre-fight HP Shields cannot be bought during an active battle encounter!`, 'log-defeat');
      return;
    }
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
      triggerParticleBurst('purchase_coin');
      addLog(`💖 Purchased HP Shield (+25 Max HP Permanent)! (${hpCount + 1}/${permLimit} used this round)`, 'log-heal');
    } else {
      addLog(`❌ Not enough coins! HP Shield costs 250 Coins.`, 'log-defeat');
    }
  };

  const handleBuyDmg = () => {
    if (isFighting) {
      addLog(`🔒 Pre-fight Combat Tonics cannot be bought during an active battle encounter!`, 'log-defeat');
      return;
    }
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
      triggerParticleBurst('purchase_coin');
      addLog(`⚔️ Purchased Combat Tonic (+5% DMG Permanent)! (${dmgCount + 1}/${permLimit} used this round)`, 'log-buff');
    } else {
      addLog(`❌ Not enough coins! Combat Tonic costs 300 Coins.`, 'log-defeat');
    }
  };

  const handleInternalBuyTonic = () => {
    if (onBuyCombatHealthTonic) {
      onBuyCombatHealthTonic();
      return;
    }
    if (gameState.coins < reviveCost) {
      addLog(`❌ Not enough coins! Minor Vitality Tonic costs ${reviveCost} Coins.`, 'log-defeat');
      return;
    }
    if (isDead) {
      addLog(`💀 Champion is fallen! Revive your champion with Coins or a Revive Pack.`, 'log-defeat');
      return;
    }
    if (livePlayerHP !== undefined && livePlayerHP >= livePlayerMaxHP) {
      addLog(`✨ Vitality is already at 100% full capacity (${livePlayerHP}/${livePlayerMaxHP} HP)!`, 'log-buff');
      return;
    }

    setGameState(prev => {
      const next = {
        ...prev,
        coins: prev.coins - reviveCost
      };
      saveState(next);
      return next;
    });

    triggerParticleBurst('rebirth');
    addLog(`🧪 Drank Minor Vitality Tonic! Restored +${quarterHP} HP (1/4 Max Health) for ${reviveCost} Coins!`, 'log-heal');
  };

  return (
    <div className={`bg-[#0e1628] border ${isFighting ? 'border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'border-[#1a2540]'} ${compact ? 'rounded-xl p-2' : 'rounded-2xl p-4'} flex flex-col ${className}`}>
      {/* Header */}
      <div className={`flex items-center justify-between border-b border-white/5 ${compact ? 'pb-1.5 mb-1.5' : 'pb-2 mb-2'}`}>
        <h3 className={`font-mono ${compact ? 'text-[9.5px]' : 'text-xs'} ${isFighting ? 'text-amber-300' : 'text-[#f5e56b]'} uppercase font-bold tracking-wider flex items-center gap-1`}>
          <span>{isFighting ? '🧪 IN-BATTLE RESTORATIVES' : '⚡ PRE-FIGHT COIN SHOP'}</span>
        </h3>
        <span className={`font-mono ${isFighting ? 'text-amber-300 bg-amber-950/80 border-amber-500/40' : 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40'} border ${compact ? 'text-[8.5px] px-1.5 py-0.2' : 'text-[10px] px-2 py-0.5'} rounded-full font-bold`}>
          {isFighting ? '⚔️ Combat Active' : `Limit: ${permLimit}/Fight`}
        </span>
      </div>

      {/* Description */}
      {!compact && (
        <p className="text-xs text-slate-300 mb-3 leading-relaxed">
          {isFighting
            ? `Permanent buffs are locked during combat. Drink a Minor Vitality Tonic for the cost of a revive (${reviveCost} Coins) to restore 1/4 max health (+${quarterHP} HP)!`
            : `Upgrade your max health or permanent combat boosts using Gold (Max ${permLimit} of each per fight)!`}
        </p>
      )}

      {/* When Fighting: Show Mid-Combat Restorative Tonic */}
      {isFighting ? (
        <div className="space-y-2">
          {/* Minor Vitality Tonic (1/4 Max HP for Revive Cost) */}
          <button
            type="button"
            onClick={handleInternalBuyTonic}
            disabled={isDead || !isInjured || gameState.coins < reviveCost}
            className={`w-full flex items-center justify-between transition text-left ${
              compact ? 'p-1.5 rounded-lg text-[10px]' : 'p-2.5 rounded-xl text-xs'
            } border ${
              isDead || !isInjured || gameState.coins < reviveCost
                ? 'bg-[#121824]/60 border-slate-700/50 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-950/80 to-[#191e30] hover:from-amber-900/90 hover:to-[#222a42] border-amber-500/50 text-amber-200 cursor-pointer active:scale-95 shadow-sm'
            }`}
            title={`Restores 1/4 Max HP (+${quarterHP} HP) for ${reviveCost} Coins (Revive Cost)`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className="truncate">🧪 Minor Vitality Tonic (+{quarterHP} HP)</span>
              <span className="text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/30 px-1 py-0.2 rounded shrink-0">
                1/4 Max HP
              </span>
            </div>
            <span className={`font-mono text-[#f5e56b] font-extrabold bg-[#0a0f1d] ${compact ? 'px-1.5 py-0.5' : 'px-2 py-0.5'} rounded border border-[#f5e56b]/20 flex items-center gap-0.5 shrink-0`}>
              <span>{reviveCost}</span>
              <CoinIcon className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
            </span>
          </button>

          {/* Quick Health Pack Action inside Combat */}
          {onUseHealthPack && livePlayerHP !== undefined && livePlayerHP < livePlayerMaxHP && (gameState.revivePacks || 0) > 0 && (
            <button
              type="button"
              onClick={onUseHealthPack}
              className={`w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black ${
                compact ? 'text-[9.5px] py-1 px-2 rounded-lg' : 'text-xs py-2 px-3 rounded-xl'
              } border border-emerald-400 flex items-center justify-between shadow-md active:scale-95 transition cursor-pointer animate-pulse`}
            >
              <span className="flex items-center gap-1.5">
                <span>🩹</span>
                <span>Use Health Pack ({gameState.revivePacks || 0} Left)</span>
              </span>
              <span className="bg-black/30 text-emerald-200 px-1.5 py-0.2 rounded text-[9px] font-bold">
                100% Full HP
              </span>
            </button>
          )}

          {/* Locked Pre-fight Upgrades Indicator */}
          <div className={`bg-black/40 border border-white/5 rounded-xl ${compact ? 'p-1.5 text-[8.5px]' : 'p-2 text-[10px]'} text-slate-400 font-mono text-center flex items-center justify-center gap-1`}>
            <span>🔒</span>
            <span>Permanent pre-fight shields locked during active combat.</span>
          </div>
        </div>
      ) : (
        /* When NOT Fighting: Standard Pre-Fight Coin Shop */
        <div className="space-y-2">
          <div className={compact ? "grid grid-cols-2 gap-2" : "space-y-2"}>
            <button
              type="button"
              onClick={handleBuyHp}
              disabled={isHpMaxed}
              className={`w-full flex items-center justify-between transition text-left ${
                compact ? 'p-1.5 rounded-lg text-[10px]' : 'p-2.5 rounded-xl text-xs'
              } border ${
                isHpMaxed
                  ? 'bg-[#121824]/60 border-slate-700/50 text-slate-500 cursor-not-allowed'
                  : 'bg-[#141c30] hover:bg-[#1a2a4c] border-[#2a4060] text-slate-200 cursor-pointer active:scale-95'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="truncate">💖 Max HP (+25)</span>
                <span
                  className={`font-mono px-1 py-0.1 rounded font-bold ${
                    compact ? 'text-[8px]' : 'text-[10px]'
                  } ${
                    isHpMaxed
                      ? 'bg-red-950/80 text-red-300 border border-red-500/40'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {hpCount}/{permLimit}
                </span>
              </div>
              <span className={`font-mono text-[#f5e56b] font-extrabold bg-[#0a0f1d] ${compact ? 'px-1 py-0.5' : 'px-2 py-0.5'} rounded border border-[#f5e56b]/20 flex items-center gap-0.5 shrink-0`}>
                <span>250</span>
                <CoinIcon className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
              </span>
            </button>

            <button
              type="button"
              onClick={handleBuyDmg}
              disabled={isDmgMaxed}
              className={`w-full flex items-center justify-between transition text-left ${
                compact ? 'p-1.5 rounded-lg text-[10px]' : 'p-2.5 rounded-xl text-xs'
              } border ${
                isDmgMaxed
                  ? 'bg-[#121824]/60 border-slate-700/50 text-slate-500 cursor-not-allowed'
                  : 'bg-[#141c30] hover:bg-[#1a2a4c] border-[#2a4060] text-slate-200 cursor-pointer active:scale-95'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="truncate">🔥 Tonic (+5%)</span>
                <span
                  className={`font-mono px-1 py-0.1 rounded font-bold ${
                    compact ? 'text-[8px]' : 'text-[10px]'
                  } ${
                    isDmgMaxed
                      ? 'bg-red-950/80 text-red-300 border border-red-500/40'
                      : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {dmgCount}/{permLimit}
                </span>
              </div>
              <span className={`font-mono text-[#f5e56b] font-extrabold bg-[#0a0f1d] ${compact ? 'px-1 py-0.5' : 'px-2 py-0.5'} rounded border border-[#f5e56b]/20 flex items-center gap-0.5 shrink-0`}>
                <span>300</span>
                <CoinIcon className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
              </span>
            </button>
          </div>

          {/* If Injured Out of Combat: Offer Minor Vitality Tonic Option */}
          {isInjured && !isDead && (
            <button
              type="button"
              onClick={handleInternalBuyTonic}
              disabled={gameState.coins < reviveCost}
              className={`w-full ${compact ? 'col-span-2' : ''} flex items-center justify-between transition text-left ${
                compact ? 'p-1.5 rounded-lg text-[10px]' : 'p-2.5 rounded-xl text-xs'
              } border ${
                gameState.coins < reviveCost
                  ? 'bg-[#121824]/60 border-slate-700/50 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-950/80 to-[#191e30] hover:from-amber-900/90 hover:to-[#222a42] border-amber-500/50 text-amber-200 cursor-pointer active:scale-95 shadow-sm'
              }`}
              title={`Restores 1/4 Max HP (+${quarterHP} HP) for ${reviveCost} Coins`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="truncate">🧪 Minor Vitality Tonic (+{quarterHP} HP)</span>
                <span className="text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/30 px-1 py-0.2 rounded shrink-0">
                  1/4 Max HP
                </span>
              </div>
              <span className={`font-mono text-[#f5e56b] font-extrabold bg-[#0a0f1d] ${compact ? 'px-1.5 py-0.5' : 'px-2 py-0.5'} rounded border border-[#f5e56b]/20 flex items-center gap-0.5 shrink-0`}>
                <span>{reviveCost}</span>
                <CoinIcon className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
              </span>
            </button>
          )}

          {/* Out-of-combat Health Pack Option */}
          {onUseHealthPack && isInjured && (gameState.revivePacks || 0) > 0 && (
            <div className={`pt-1.5 mt-1 border-t border-white/10 ${compact ? 'col-span-2' : ''}`}>
              <button
                type="button"
                onClick={onUseHealthPack}
                className={`w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black ${
                  compact ? 'text-[9.5px] py-1 px-2 rounded-lg' : 'text-xs py-2 px-3 rounded-xl'
                } border border-emerald-400 flex items-center justify-between shadow-md active:scale-95 transition cursor-pointer animate-pulse`}
              >
                <span className="flex items-center gap-1.5">
                  <span>🩹</span>
                  <span>Use Health Pack ({gameState.revivePacks || 0} Owned)</span>
                </span>
                <span className="bg-black/30 text-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                  Restore 100% HP
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Permanent Boost Tally */}
      <div className={`flex gap-1.5 justify-between border-t border-white/5 ${compact ? 'pt-1 mt-1.5 text-[9px]' : 'pt-2 mt-3 text-xs'} font-mono text-slate-400`}>
        <span>HP Bonus: <strong className="text-emerald-400">+{gameState.maxHpBonus || 0} HP</strong></span>
        <span>DMG Boost: <strong className="text-amber-400">+{gameState.damageBonusPercent || 0}%</strong></span>
      </div>
    </div>
  );
};

