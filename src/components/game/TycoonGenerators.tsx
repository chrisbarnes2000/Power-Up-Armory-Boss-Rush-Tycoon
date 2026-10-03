import React, { useState } from 'react';
import { CoinIcon } from '../CoinIcon';
import { GameState, PowerUp } from '../../types';

export interface TycoonGeneratorsProps {
  gameState: GameState;
  onMineGoldCore: () => void;
  miningCombo: number;
  recentMineGain: number | null;
  onUpgradePowerupLevel: (id: string) => void;
  onBuyPowerupInGame: (id: string) => void;
  getPowerupData: (id: string) => PowerUp | undefined;
  onReviveWithCoins?: () => void;
  onReviveWithPack?: () => void;
  getCurrentReviveCost?: () => number;
  livePlayerHP?: number;
  livePlayerMaxHP?: number;
  totalAttack?: number;
  totalDefense?: number;
  totalSpeed?: number;
  powerScore?: number;
  passiveYield?: number;
  onBuyRevivePacks?: (count: number, currency: 'coins' | 'gems', cost: number) => void;
}

interface CategoryDefinition {
  name: string;
  icon: string;
  color: string;
  items: string[];
}

const GENERATOR_CATEGORIES: CategoryDefinition[] = [
  {
    name: 'Weapons Class',
    icon: '⚔️',
    color: 'text-rose-400',
    items: ['Focus Blade', 'Rage Axe', 'Speed Dagger', 'Shield Breaker', 'Wing Charm', '???.???']
  },
  {
    name: 'Defense Safeguards',
    icon: '🛡️',
    color: 'text-sky-400',
    items: ['Magnetite Shield', 'Cloak of Shadows', 'Titan Armor']
  },
  {
    name: 'Utility Systems',
    icon: '✨',
    color: 'text-emerald-400',
    items: ['Laser Lens', 'Phantom Dust', 'Dragon Scale']
  },
  {
    name: 'Mystic Arts',
    icon: '🌀',
    color: 'text-[#cb9df2]',
    items: ['Phoenix Feather', 'Void Orb', 'Star Fragment']
  }
];

const RARITY_COLORS: Record<string, string> = {
  'Common': '#8a9aaa',
  'Uncommon': '#6aaa8a',
  'Rare': '#4a8ad0',
  'Epic': '#aa6ad0',
  'Legendary': '#f5a040',
  'Mythic': '#f04080',
  '??': '#6a6a7a'
};

/**
 * TycoonGenerators - Mining Core clicker with combo bonus + categorized powerup generator matrix
 */
export const TycoonGenerators: React.FC<TycoonGeneratorsProps> = ({
  gameState,
  onMineGoldCore,
  miningCombo,
  recentMineGain,
  onUpgradePowerupLevel,
  onBuyPowerupInGame,
  getPowerupData,
  onReviveWithCoins,
  onReviveWithPack,
  getCurrentReviveCost,
  livePlayerHP,
  livePlayerMaxHP = 100,
  totalAttack = 10,
  totalDefense = 5,
  totalSpeed = 10,
  powerScore = 29,
  passiveYield = 0,
  onBuyRevivePacks
}) => {
  // Track failed attempts per item action: format `upgrade-${ps.id}` or `buy-${ps.id}`
  const [failedAttempts, setFailedAttempts] = useState<Record<string, number>>({});
  
  // Track toasts
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'coins' | 'gems' | 'death' }[]>([]);

  const isDead = gameState.isDead || (livePlayerHP !== undefined && livePlayerHP <= 0);

  // Show a toast message and automatically dismiss it after 4 seconds
  const triggerToast = (message: string, type: 'coins' | 'gems' | 'death') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const handleMineClick = () => {
    if (isDead) {
      triggerToast('💀 Champion Defeated! You cannot mine while fallen. Use a Revive Pack or Coins to restore your vitality!', 'death');
      onMineGoldCore();
      return;
    }
    onMineGoldCore();
  };

  const handleBuyPacksAction = (count: number, currency: 'coins' | 'gems', cost: number) => {
    if (onBuyRevivePacks) {
      onBuyRevivePacks(count, currency, cost);
    }
  };

  const handleUpgradeClick = (id: string, name: string, emoji: string, cost: number) => {
    const key = `upgrade-${id}`;
    const attempts = failedAttempts[key] || 0;
    
    if (attempts >= 3) {
      triggerToast(`⚠️ Button disabled! Maximum failed upgrade attempts (3) reached for ${emoji} ${name}.`, 'coins');
      return;
    }

    if (gameState.coins < cost) {
      const nextAttempts = attempts + 1;
      setFailedAttempts(prev => ({ ...prev, [key]: nextAttempts }));
      triggerToast(`❌ Insufficient Coins! ${emoji} ${name} Level Up costs ${cost} Coins. (Attempt ${nextAttempts}/3)`, 'coins');
      return;
    }

    // Success! Clear attempts if any, then run action
    if (attempts > 0) {
      setFailedAttempts(prev => ({ ...prev, [key]: 0 }));
    }
    onUpgradePowerupLevel(id);
  };

  const handleBuyClick = (id: string, name: string, emoji: string, cost: number) => {
    const key = `buy-${id}`;
    const attempts = failedAttempts[key] || 0;
    
    if (attempts >= 3) {
      triggerToast(`⚠️ Button disabled! Maximum failed purchase attempts (3) reached for ${emoji} ${name}.`, 'gems');
      return;
    }

    if ((gameState.gems || 0) < cost) {
      const nextAttempts = attempts + 1;
      setFailedAttempts(prev => ({ ...prev, [key]: nextAttempts }));
      triggerToast(`❌ Insufficient Gems! ${emoji} ${name} costs ${cost} Gems 💎. (Attempt ${nextAttempts}/3)`, 'gems');
      return;
    }

    // Success! Clear attempts if any, then run action
    if (attempts > 0) {
      setFailedAttempts(prev => ({ ...prev, [key]: 0 }));
    }
    onBuyPowerupInGame(id);
  };

  return (
    <div className="space-y-6 sm:space-y-8 relative">
      {/* Dynamic Toast Notifications Overlays */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-2xl flex items-center gap-3 animate-bounce transition-all duration-300 ${
              toast.type === 'death'
                ? 'bg-[#260e14] border-red-500 text-red-100 ring-2 ring-red-500/50 shadow-red-950/80'
                : toast.type === 'coins'
                ? 'bg-[#1e1515] border-red-500/40 text-red-200'
                : 'bg-[#151724] border-purple-500/40 text-purple-200'
            }`}
          >
            <span className="text-xl">{toast.type === 'death' ? '💀' : toast.type === 'coins' ? '🪙' : '💎'}</span>
            <div className="flex-1 text-xs font-semibold leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-white/40 hover:text-white transition ml-auto text-sm shrink-0 font-bold p-1 hover:bg-white/10 rounded cursor-pointer"
              title="Close notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* PROMINENT HERO BANKROLL & COMBAT ATTRIBUTES INTEL BAR */}
      <div className="bg-gradient-to-r from-[#0c1322] via-[#0f1a30] to-[#0a101d] border-2 border-cyan-500/40 rounded-2xl p-4 sm:p-5 shadow-[0_0_25px_rgba(14,165,233,0.15),inset_0_1px_2px_rgba(255,255,255,0.08)] flex flex-col gap-3">
        {/* Row 1: Live Bankroll Reserves */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">💰</span>
            <div>
              <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-widest font-black block">LIVE BANKROLL RESERVES</span>
              <span className="text-xs font-bold text-slate-300 font-mono">Astral Gold Reserves & Dispensary Funds</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Coins */}
            <div className="bg-[#141c30] border border-[#2a4060] px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
              <CoinIcon className="w-4 h-4 drop-shadow" />
              <div className="font-mono">
                <span className="text-[9px] text-slate-400 block -mb-0.5 font-normal">Gold Coins</span>
                <span className="text-xs sm:text-sm font-black text-[#f5e56b]">{Math.floor(gameState.coins).toLocaleString()}</span>
              </div>
            </div>

            {/* Gems */}
            <div className="bg-[#141c30] border border-[#2a4060] px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
              <span className="text-base leading-none">💎</span>
              <div className="font-mono">
                <span className="text-[9px] text-slate-400 block -mb-0.5 font-normal">Gems</span>
                <span className="text-xs sm:text-sm font-black text-[#cb9df2]">{Math.floor(gameState.gems || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Revive Packs */}
            <div className="bg-[#141c30] border border-emerald-500/30 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
              <span className="text-base leading-none">🩹</span>
              <div className="font-mono">
                <span className="text-[9px] text-slate-400 block -mb-0.5 font-normal">Revives</span>
                <span className="text-xs sm:text-sm font-black text-emerald-300">{gameState.revivePacks || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Hero Combat Attributes (ATK, DEF, Health, Speed, Power Score) */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚔️</span>
            <div>
              <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest font-black block">CHAMPION VITALITY & ATTRIBUTES</span>
              <span className="text-[11px] text-slate-400 font-mono">Equipped Armory Ratings</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Health / HP */}
            <div className={`px-3 py-1 rounded-xl border flex items-center gap-1.5 shadow-sm font-mono ${
              isDead ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse' : 'bg-[#141c30] border-emerald-500/40 text-emerald-300'
            }`}>
              <span className="text-sm leading-none">{isDead ? '💀' : '❤️'}</span>
              <div>
                <span className="text-[9px] text-slate-400 block -mb-0.5 font-normal">Health</span>
                <span className="text-xs sm:text-sm font-black">{isDead ? '0 HP (DEAD)' : `${livePlayerHP ?? 100}/${livePlayerMaxHP ?? 100} HP`}</span>
              </div>
            </div>

            {/* ATK */}
            <div className="bg-[#141c30] border border-red-500/40 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm font-mono">
              <span className="text-sm leading-none">⚔️</span>
              <div>
                <span className="text-[9px] text-slate-400 block -mb-0.5 font-normal">Attack</span>
                <span className="text-xs sm:text-sm font-black text-red-300">{totalAttack} ATK</span>
              </div>
            </div>

            {/* DEF */}
            <div className={`px-3 py-1 rounded-xl border flex items-center gap-1.5 shadow-sm font-mono ${
              totalDefense < 0 ? 'bg-amber-950/80 border-amber-500/60 text-amber-300' : 'bg-[#141c30] border-blue-500/40 text-blue-300'
            }`}>
              <span className="text-sm leading-none">{totalDefense < 0 ? '⚠️' : '🛡️'}</span>
              <div>
                <span className="text-[9px] text-slate-400 block -mb-0.5 font-normal">Defense / Armor</span>
                <span className="text-xs sm:text-sm font-black">{totalDefense} DEF</span>
              </div>
            </div>

            {/* SPD */}
            <div className="bg-[#141c30] border border-amber-500/40 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm font-mono">
              <span className="text-sm leading-none">⚡</span>
              <div>
                <span className="text-[9px] text-slate-400 block -mb-0.5 font-normal">Speed</span>
                <span className="text-xs sm:text-sm font-black text-amber-300">{totalSpeed} SPD</span>
              </div>
            </div>

            {/* Power Score */}
            <div className="bg-gradient-to-r from-cyan-950/80 to-[#142340] border border-cyan-400/50 px-3.5 py-1 rounded-xl flex items-center gap-1.5 shadow-md font-mono">
              <span className="text-sm leading-none">✨</span>
              <div>
                <span className="text-[9px] text-cyan-300 block -mb-0.5 font-bold">Power Score</span>
                <span className="text-xs sm:text-sm font-black text-[#7ae0ff]">{powerScore} PS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FALLEN CHAMPION REVIVE ACTION BANNER & REVIVE PACK HUB */}
      {isDead && (
        <div id="tycoon-revive-alert" className="bg-linear-to-r from-red-950/95 via-[#240e18] to-[#150a16] border-2 border-red-500 rounded-3xl p-4 sm:p-6 shadow-[0_0_35px_rgba(239,68,68,0.45)] flex flex-col md:flex-row items-center justify-between gap-5 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-3xl shrink-0 shadow-inner">
              💀
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-400 bg-red-950/90 px-2.5 py-0.5 rounded-full border border-red-500/40">
                  MINING DISABLED · HERO FALLEN
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  Revive Packs: <strong className="text-emerald-300 font-black">{gameState.revivePacks || 0}</strong>
                </span>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-black text-white font-mono uppercase mt-1">
                Revive Champion to Resume Mining
              </h3>
              <p className="text-xs text-red-200/80 leading-relaxed max-w-xl">
                Your vitality was reduced to 0 HP in combat. Use an alchemical Revive Pack or spend coins to restore full HP and reactivate the gold forge!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 w-full md:w-auto">
            {onReviveWithPack && (
              <button
                type="button"
                onClick={onReviveWithPack}
                disabled={(gameState.revivePacks || 0) <= 0}
                className={`flex-1 md:flex-none px-4 py-3 rounded-2xl font-mono text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
                  (gameState.revivePacks || 0) > 0
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 border border-emerald-400 active:scale-95 ring-2 ring-emerald-400/40'
                    : 'bg-slate-800/80 text-slate-500 border border-white/5 cursor-not-allowed'
                }`}
                title="Use 1 Revive Pack to instantly revive with full HP without coin cost scaling"
              >
                <span>🩹 Use Revive Pack</span>
                <span className="bg-black/40 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  x{gameState.revivePacks || 0}
                </span>
              </button>
            )}

            {onReviveWithCoins && getCurrentReviveCost && (
              <button
                type="button"
                onClick={onReviveWithCoins}
                className="flex-1 md:flex-none px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 border border-amber-300"
                title="Pay coins to revive champion with 100% HP"
              >
                <span>⚡ Revive</span>
                <span className="bg-slate-950/20 px-2 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1">
                  <span>{getCurrentReviveCost()}</span>
                  <CoinIcon className="w-3.5 h-3.5 drop-shadow" />
                </span>
              </button>
            )}

            {(gameState.revivePacks || 0) <= 0 && onBuyRevivePacks && (
              <button
                type="button"
                onClick={() => handleBuyPacksAction(1, 'coins', 150)}
                className="flex-1 md:flex-none px-3.5 py-3 rounded-2xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/50 font-mono text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                title="Purchase 1 Revive Pack for 150 Coins"
              >
                <span>🛒 Buy Pack (150🪙)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* MANUAL MINING & ACTIVE ORE CLICKER */}
      <div id="tycoon-mine-container" className={`bg-linear-to-r ${isDead ? 'from-[#1a1215] via-[#20141a] to-[#161016] border-red-500/50' : 'from-[#142038] via-[#1a2b4c] to-[#121c32] border-[#2a4570]'} border rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden transition-all duration-300`}>
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-2xl sm:text-3xl">{isDead ? '💀' : '⛏️'}</span>
            <h3 className={`font-mono text-base sm:text-lg md:text-xl uppercase font-black tracking-wide ${isDead ? 'text-red-400' : 'text-yellow-400'}`}>
              {isDead ? 'ASTRAL GOLD FORGE (DEFEATED)' : 'ASTRAL GOLD FORGE & CORE MINING'}
            </h3>
            {/* Revive Pack Inventory Status on Mining Console */}
            <div className="ml-auto sm:ml-2 flex items-center gap-1.5 bg-[#0f172a]/90 border border-white/10 px-3 py-1 rounded-xl text-xs font-mono text-slate-300 shadow-inner">
              <span>🩹 Revive Packs:</span>
              <strong className={`font-black ${(gameState.revivePacks || 0) > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                {gameState.revivePacks || 0}
              </strong>
              {onReviveWithPack && (gameState.revivePacks || 0) > 0 && !isDead && (livePlayerHP === undefined || livePlayerHP < 300) && (
                <button
                  type="button"
                  onClick={onReviveWithPack}
                  className="ml-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-lg border border-emerald-400 transition cursor-pointer active:scale-95 shadow animate-pulse"
                  title="Consume 1 Health Pack to restore HP to 100% full health"
                >
                  🩹 Heal Full HP
                </button>
              )}
            </div>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-[560px]">
            {isDead 
              ? 'Your champion is fallen! Mining is suspended until your vital HP is restored with a Revive Pack 🩹 or Coins 🪙.' 
              : 'Channel celestial energy into the Astral Ore Core! Tap rapidly to extract gold with combo multipliers up to 10x. Core veins randomly drop bonus Revive Packs 🩹!'}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {!isDead && miningCombo > 1 && (
            <span className="font-mono text-xs font-black text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2.5 py-1 rounded-full animate-bounce">
              🔥 {miningCombo}x Combo!
            </span>
          )}
          <button
            onClick={handleMineClick}
            aria-label="Mine Gold Core"
            className={`relative px-6 py-3.5 sm:px-7 sm:py-4 font-mono font-black text-sm uppercase tracking-wider rounded-2xl active:scale-95 transition cursor-pointer flex items-center gap-2 border shadow-lg ${
              isDead
                ? 'bg-linear-to-b from-red-950 to-slate-900 text-red-300 border-red-500/40 opacity-90 hover:opacity-100 hover:border-red-400'
                : 'bg-linear-to-b from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 border-yellow-300/60 shadow-[0_0_25px_rgba(245,158,11,0.35)]'
            }`}
          >
            {isDead ? <span className="text-base">💀</span> : <CoinIcon className="w-5 h-5 drop-shadow" />}
            <span>{isDead ? 'Mining Fallen' : 'Mine Gold Core'}</span>
            {!isDead && recentMineGain !== null && (
              <span className="absolute -top-3 right-2 text-xs font-black text-green-300 bg-black/80 px-2 py-0.5 rounded-full border border-green-500/40 animate-ping pointer-events-none">
                +{recentMineGain}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TYCOON REVIVE PACK EMERGENCY DISPENSARY */}
      <div className="bg-linear-to-r from-[#0d1c28] via-[#0f2430] to-[#0a1820] border border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-2.5">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <span className="text-2xl">🩹</span>
            <div>
              <h3 className="font-mono text-sm sm:text-base md:text-lg uppercase font-black tracking-wider text-emerald-300">
                ALCHEMICAL EMERGENCY DISPENSARY
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300">
                Replenish field-ready Revive Packs to recover full vitality on demand without escalating coin death penalties.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-black/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-mono text-xs self-start sm:self-auto">
            <span className="text-slate-400">Inventory:</span>
            <strong className="text-emerald-300 font-black text-sm">
              {gameState.revivePacks || 0} Available
            </strong>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Bundle 1: Single Pack */}
          <div className="bg-[#0b141f] border border-emerald-500/20 rounded-xl p-3.5 flex flex-col justify-between space-y-3 hover:border-emerald-500/50 transition">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-white uppercase">Single Revive Pack</span>
                <span className="text-base">🩹</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Instant field resuscitation (100% HP).</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleBuyPacksAction(1, 'coins', 150)}
                disabled={gameState.coins < 150}
                className="flex-1 py-2 px-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 text-xs font-mono font-bold flex items-center justify-center gap-1 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>150</span>
                <CoinIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleBuyPacksAction(1, 'gems', 10)}
                disabled={(gameState.gems || 0) < 10}
                className="flex-1 py-2 px-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-xs font-mono font-bold flex items-center justify-center gap-1 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>10 💎</span>
              </button>
            </div>
          </div>

          {/* Bundle 2: 3-Pack Bundle */}
          <div className="bg-[#0b141f] border border-emerald-500/30 rounded-xl p-3.5 flex flex-col justify-between space-y-3 relative hover:border-emerald-500/60 transition shadow-md">
            <span className="absolute -top-2 right-3 text-[9px] font-mono font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full border border-emerald-300">
              POPULAR
            </span>
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-emerald-300 uppercase">3x Tactical Bundle</span>
                <span className="text-base">🩹🩹🩹</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Save 50 coins vs individual price.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleBuyPacksAction(3, 'coins', 400)}
                disabled={gameState.coins < 400}
                className="flex-1 py-2 px-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 text-xs font-mono font-bold flex items-center justify-center gap-1 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>400</span>
                <CoinIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleBuyPacksAction(3, 'gems', 25)}
                disabled={(gameState.gems || 0) < 25}
                className="flex-1 py-2 px-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-xs font-mono font-bold flex items-center justify-center gap-1 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>25 💎</span>
              </button>
            </div>
          </div>

          {/* Bundle 3: 10-Pack War Chest */}
          <div className="bg-[#0b141f] border border-amber-500/30 rounded-xl p-3.5 flex flex-col justify-between space-y-3 relative hover:border-amber-500/60 transition shadow-md">
            <span className="absolute -top-2 right-3 text-[9px] font-mono font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full border border-yellow-200 font-bold">
              BEST VALUE
            </span>
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-amber-300 uppercase">10x War Chest Crate</span>
                <span className="text-base">📦</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Bulk expedition supply (Save 300 coins).</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleBuyPacksAction(10, 'coins', 1200)}
                disabled={gameState.coins < 1200}
                className="flex-1 py-2 px-2 rounded-lg bg-yellow-500/25 hover:bg-yellow-500/35 text-yellow-200 border border-yellow-400/50 text-xs font-mono font-bold flex items-center justify-center gap-1 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>1,200</span>
                <CoinIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleBuyPacksAction(10, 'gems', 75)}
                disabled={(gameState.gems || 0) < 75}
                className="flex-1 py-2 px-2 rounded-lg bg-purple-500/25 hover:bg-purple-500/35 text-purple-200 border border-purple-400/50 text-xs font-mono font-bold flex items-center justify-center gap-1 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>75 💎</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORIZED GENERATOR MATRIX WITH BALANCED EVEN ROW GRIDS */}
      {GENERATOR_CATEGORIES.map(category => {
        const isWeapons = category.name === 'Weapons Class';
        const gridClasses = isWeapons
          ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4'
          : 'grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4';

        return (
          <div key={category.name} className="space-y-4">
            <h3 className="font-mono text-sm sm:text-base md:text-lg text-slate-200 uppercase font-black tracking-wider flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl">{category.icon}</span>
                <span className={category.color}>{category.name}</span>
              </div>
              <span className="text-[10px] sm:text-xs text-slate-400 font-mono font-bold bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                {category.items.length} Artifacts
              </span>
            </h3>

            <div className={gridClasses}>
              {category.items.map(itemId => {
                const ps = gameState.powerups.find(p => p.id === itemId);
                if (!ps) return null;
                const data = getPowerupData(ps.id);
                if (!data) return null;
                
                const currentRate = ps.owned ? (data.baseRate * ps.quantity * (1 + (ps.level - 1) * 0.5)) : 0;
                const nextUpgradeCost = Math.floor(data.upgradeCost * ps.level * 1.5);
                const nextBuyCostGems = Math.max(15, Math.floor(((data.upgradeCost * (1 + (ps.quantity * 0.25))) / 10) * 3));
                const unlockCostGems = Math.max(15, Math.floor((data.upgradeCost / 10) * 3));
                const itemTooltipText = `✦ ${data.id} [${data.rarity}]\n"${data.description}"\n✨ Effect: ${data.effect}${data.special ? `\n⚡ Special: ${data.special}` : ''}`;

                return (
                  <div 
                    key={ps.id} 
                    className="relative overflow-visible bg-linear-to-b from-[#1a2440] to-[#111a2e] border border-[#2a3d60] rounded-2xl p-4 shadow-lg flex flex-col justify-between hover:border-blue-500/40 transition"
                  >
                    <div>
                      <div 
                        tabIndex={0}
                        role="button"
                        data-tooltip={itemTooltipText}
                        className="flex items-center justify-between gap-2 mb-2.5 cursor-help group/header select-none outline-none focus:ring-1 focus:ring-blue-400 rounded-lg p-0.5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-2xl sm:text-3xl shrink-0">{data.emoji}</span>
                          <span className="text-xs sm:text-sm font-extrabold text-[#d0e0ff] truncate group-hover/header:text-[#7ae0ff] transition-colors">
                            {ps.owned ? ps.id : '🔒 Locked'}
                          </span>
                        </div>
                        <span className="text-slate-400 group-hover/header:text-amber-300 text-xs shrink-0 font-bold px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10" title="Inspect Item">
                          ⓘ
                        </span>
                      </div>

                      <div className="text-[11px] sm:text-xs text-slate-300 space-y-1.5 mb-3.5">
                        <div className="flex justify-between"><span>⚔️ ATK:</span> <span className="text-[#f5e56b] font-bold">{data.attack}</span></div>
                        <div className="flex justify-between"><span>🛡️ DEF:</span> <span className="text-[#f5e56b] font-bold">{data.defense}</span></div>
                        <div className="flex justify-between"><span>💨 SPD:</span> <span className="text-[#f5e56b] font-bold">{data.speed}</span></div>
                        <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1.5 font-mono text-[11px] sm:text-xs items-center">
                          <span className="flex items-center gap-1">
                            <CoinIcon className="w-3.5 h-3.5 drop-shadow" />
                            <span>Rate:</span>
                          </span>
                          <span className="text-green-400">+{currentRate.toFixed(1)}/s</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {ps.owned ? (
                        <>
                          <button 
                            disabled={ps.level >= data.maxLevel || (failedAttempts[`upgrade-${ps.id}`] || 0) >= 3}
                            onClick={() => handleUpgradeClick(ps.id, data.id, data.emoji, nextUpgradeCost)}
                            className="w-full text-xs py-2 rounded-lg border border-[#2a4060] bg-black/40 text-[#aac0e0] font-bold hover:bg-[#2a4060] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                          >
                            {ps.level >= data.maxLevel ? (
                              '⭐ Max Level'
                            ) : (
                              <>
                                <span>Lv.{ps.level + 1}</span>
                                <span className="flex items-center text-[#f5e56b]">({nextUpgradeCost} <CoinIcon className="w-3 h-3 ml-0.5" />)</span>
                              </>
                            )}
                          </button>
                          
                          <button 
                            disabled={(failedAttempts[`buy-${ps.id}`] || 0) >= 3}
                            onClick={() => handleBuyClick(ps.id, data.id, data.emoji, nextBuyCostGems)}
                            className="w-full text-xs py-1.5 rounded-lg border border-purple-500/30 bg-purple-950/30 text-purple-200 font-semibold hover:bg-purple-900/50 transition cursor-pointer flex items-center justify-center gap-1 shadow-sm active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <span>+1 Unit</span>
                            <span className="text-purple-300 font-mono">({nextBuyCostGems} 💎)</span>
                          </button>
                        </>
                      ) : (
                        <button 
                          disabled={(failedAttempts[`buy-${ps.id}`] || 0) >= 3}
                          onClick={() => handleBuyClick(ps.id, data.id, data.emoji, unlockCostGems)}
                          className="w-full text-xs py-2.5 rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <span>🔓 Unlock</span>
                          <span className="text-cyan-200 font-mono">({unlockCostGems} 💎)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
