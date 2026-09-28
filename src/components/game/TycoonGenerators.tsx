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
  getPowerupData
}) => {
  // Track failed attempts per item action: format `upgrade-${ps.id}` or `buy-${ps.id}`
  const [failedAttempts, setFailedAttempts] = useState<Record<string, number>>({});
  
  // Track toasts
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'coins' | 'gems' }[]>([]);

  // Show a toast message and automatically dismiss it after 4 seconds
  const triggerToast = (message: string, type: 'coins' | 'gems') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
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
    <div className="space-y-8 relative">
      {/* Dynamic Toast Notifications Overlays */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-2xl flex items-center gap-3 animate-bounce transition-all duration-300 ${
              toast.type === 'coins'
                ? 'bg-[#1e1515] border-red-500/40 text-red-200'
                : 'bg-[#151724] border-purple-500/40 text-purple-200'
            }`}
          >
            <span className="text-lg">{toast.type === 'coins' ? '🪙' : '💎'}</span>
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

      {/* MANUAL MINING & ACTIVE ORE CLICKER */}
      <div id="tycoon-mine-container" className="bg-linear-to-r from-[#142038] via-[#1a2b4c] to-[#121c32] border border-[#2a4570] rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-yellow-400">
            <span className="text-2xl">⛏️</span>
            <h3 className="font-mono text-sm uppercase font-black tracking-wider">ASTRAL GOLD FORGE & CORE MINING</h3>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed max-w-[500px]">
            Channel celestial energy into the Astral Ore Core! Tap or click rapidly to extract raw gold with combo multipliers up to <strong className="text-amber-300">10x</strong>.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {miningCombo > 1 && (
            <span className="font-mono text-xs font-black text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2.5 py-1 rounded-full animate-bounce">
              🔥 {miningCombo}x Combo!
            </span>
          )}
          <button
            onClick={onMineGoldCore}
            aria-label="Mine Gold Core"
            className="relative px-6 py-3.5 bg-linear-to-b from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-mono font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.35)] active:scale-95 transition cursor-pointer flex items-center gap-2 border border-yellow-300/60"
          >
            <CoinIcon className="w-5 h-5 drop-shadow" />
            <span>Mine Gold Core</span>
            {recentMineGain !== null && (
              <span className="absolute -top-3 right-2 text-xs font-black text-green-300 bg-black/80 px-2 py-0.5 rounded-full border border-green-500/40 animate-ping pointer-events-none">
                +{recentMineGain}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* CATEGORIZED GENERATOR MATRIX */}
      {GENERATOR_CATEGORIES.map(category => (
        <div key={category.name} className="space-y-4">
          <h3 className="font-mono text-xs text-slate-300 uppercase font-extrabold tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
            <span>{category.icon}</span>
            <span className={category.color}>{category.name}</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                  className="relative overflow-visible bg-linear-to-b from-[#1a2440] to-[#111a2e] border border-[#2a3d60] rounded-2xl p-4.5 shadow-lg flex flex-col justify-between hover:border-blue-500/40 transition"
                >
                  <div>
                    <div 
                      tabIndex={0}
                      role="button"
                      data-tooltip={itemTooltipText}
                      className="flex items-center justify-between gap-2 mb-2.5 cursor-help group/header select-none outline-none focus:ring-1 focus:ring-blue-400 rounded-lg p-0.5"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-3xl shrink-0">{data.emoji}</span>
                        <span className="text-sm font-extrabold text-[#d0e0ff] truncate group-hover/header:text-[#7ae0ff] transition-colors">
                          {ps.owned ? ps.id : '🔒 Locked'}
                        </span>
                      </div>
                      <span className="text-slate-400 group-hover/header:text-amber-300 text-xs shrink-0 font-bold px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10" title="Inspect Item">
                        ⓘ
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1.5 mb-4">
                      <div className="flex justify-between"><span>⚔️ ATK:</span> <span className="text-[#f5e56b] font-bold">{data.attack}</span></div>
                      <div className="flex justify-between"><span>🛡️ DEF:</span> <span className="text-[#f5e56b] font-bold">{data.defense}</span></div>
                      <div className="flex justify-between"><span>💨 SPD:</span> <span className="text-[#f5e56b] font-bold">{data.speed}</span></div>
                      <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1.5 font-mono text-xs items-center">
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
                            <span>MAX LEVEL</span>
                          ) : (failedAttempts[`upgrade-${ps.id}`] || 0) >= 3 ? (
                            <span className="text-red-400 font-extrabold uppercase tracking-wide">BLOCKED (3 FAILS)</span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <span>Lv. Up ({nextUpgradeCost}</span>
                              <CoinIcon className="w-3.5 h-3.5 inline-block drop-shadow" />
                              <span>)</span>
                            </span>
                          )}
                        </button>
                        <button 
                          disabled={(failedAttempts[`buy-${ps.id}`] || 0) >= 3}
                          onClick={() => handleBuyClick(ps.id, data.id, data.emoji, nextBuyCostGems)}
                          className="w-full text-xs py-2 rounded-lg bg-orange-600 hover:bg-orange-500 font-bold text-white transition disabled:opacity-30 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {(failedAttempts[`buy-${ps.id}`] || 0) >= 3 ? (
                            <span className="text-slate-500 font-extrabold uppercase tracking-wide">BLOCKED (3 FAILS)</span>
                          ) : (
                            <span>+1 Copy (${nextBuyCostGems} 💎)</span>
                          )}
                        </button>
                        <div className="text-xs text-center text-slate-300 font-bold">x{ps.quantity} Owned • Level {ps.level}</div>
                      </>
                    ) : (
                      <button 
                        disabled={(failedAttempts[`buy-${ps.id}`] || 0) >= 3}
                        onClick={() => handleBuyClick(ps.id, data.id, data.emoji, unlockCostGems)}
                        className="w-full text-xs py-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-500 font-bold text-[#cb9df2] transition disabled:opacity-30 disabled:text-slate-500 disabled:border-slate-800 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {(failedAttempts[`buy-${ps.id}`] || 0) >= 3 ? (
                          <span className="text-slate-500 font-extrabold uppercase tracking-wide">BLOCKED (3 FAILS)</span>
                        ) : (
                          <span>Unlock (${unlockCostGems} 💎)</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
