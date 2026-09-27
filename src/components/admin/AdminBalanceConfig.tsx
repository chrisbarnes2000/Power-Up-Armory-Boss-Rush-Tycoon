import React from 'react';
import { DEFAULT_BALANCE_CONFIG, DEFAULT_HERO_BASELINE, POWERUPS } from '../../data';
import { GameState, GameBalanceConfig } from '../../types';

interface AdminBalanceConfigProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  saveState: (state: GameState) => void;
}

export default function AdminBalanceConfig({
  gameState,
  setGameState,
  saveState
}: AdminBalanceConfigProps) {
  const currentConfig: GameBalanceConfig = gameState.balanceConfig || DEFAULT_BALANCE_CONFIG;

  const updateConfig = (key: keyof GameBalanceConfig, value: number) => {
    const nextConfig = { ...currentConfig, [key]: value };
    setGameState(prev => {
      const next = { ...prev, balanceConfig: nextConfig };
      saveState(next);
      return next;
    });
  };

  return (
    <div 
      id="admin-game-balance-section"
      className="bg-linear-to-b from-[#181f19] via-[#0d1612] to-[#070e0a] border border-emerald-500/40 rounded-2xl p-5 space-y-4 shadow-xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h3 className="font-mono text-xs sm:text-sm text-emerald-400 font-extrabold uppercase tracking-widest">
              GAME BALANCE, DEATH & BOSS DROP CONFIGURATION
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Real-time game mechanics tuner: Adjust player revival costs, revive pack allowances, and gold/diamond boss drop rates.
          </p>
        </div>

        {/* Status Chip */}
        <div className="flex items-center gap-2 font-mono text-xs shrink-0">
          <span className={`px-2.5 py-1 rounded-lg border font-bold ${
            gameState.isDead
              ? 'bg-red-950/80 text-red-300 border-red-500/40 animate-pulse'
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
          }`}>
            {gameState.isDead ? '💀 Fallen (Requires Revive)' : '⚔️ Champion Alive'}
          </span>
        </div>
      </div>

      {/* Sandbox Isolation Helper Banner */}
      <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-200 leading-relaxed flex items-start gap-2.5">
        <span className="text-base">💡</span>
        <div>
          <strong className="text-white block mb-0.5 font-mono text-[11px] uppercase tracking-wider">State Isolation Sandbox:</strong>
          These balance variables apply exclusively to your private, active game state simulation. Adjustments are saved to your browser's local storage and synced to your private Firestore player profile (if authenticated). Other players' sessions, limits, or drop tables remain fully unaffected, ensuring zero cross-session contamination.
        </div>
      </div>

      {/* BALANCE CONFIGURATION GRID */}
      <div className="space-y-4">
        {/* HERO BASE ATTRIBUTES & POWER SCORE BASELINE CONFIG */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
            <h4 className="font-mono text-xs text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-2">
              <span>🗡️</span> BASE HERO ATTRIBUTES & POWER SCORE BASELINE
            </h4>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setGameState(prev => {
                    const next = { 
                      ...prev, 
                      baseAttack: DEFAULT_HERO_BASELINE.starter.baseAttack, 
                      baseDefense: DEFAULT_HERO_BASELINE.starter.baseDefense, 
                      baseSpeed: DEFAULT_HERO_BASELINE.starter.baseSpeed 
                    };
                    saveState(next);
                    return next;
                  });
                }}
                className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 text-[11px] font-mono font-bold rounded transition cursor-pointer"
              >
                🎮 Standard Starter ({DEFAULT_HERO_BASELINE.starter.powerScore} PS / {DEFAULT_HERO_BASELINE.starter.baseDefense} DEF)
              </button>

              <button
                type="button"
                onClick={() => {
                  setGameState(prev => {
                    const next = { 
                      ...prev, 
                      baseAttack: DEFAULT_HERO_BASELINE.absoluteZero.baseAttack, 
                      baseDefense: DEFAULT_HERO_BASELINE.absoluteZero.baseDefense, 
                      baseSpeed: DEFAULT_HERO_BASELINE.absoluteZero.baseSpeed 
                    };
                    saveState(next);
                    return next;
                  });
                }}
                className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 text-[11px] font-mono font-bold rounded transition cursor-pointer"
              >
                ⚡ Absolute Zero ({DEFAULT_HERO_BASELINE.absoluteZero.powerScore} PS / {DEFAULT_HERO_BASELINE.absoluteZero.baseDefense} DEF)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Base Attack:</span>
                <strong className="text-red-400">{gameState.baseAttack ?? 10} ATK</strong>
              </div>
              <input
                type="number"
                min="0"
                max="1000"
                value={gameState.baseAttack ?? 10}
                onChange={(e) => {
                  const val = Math.max(0, parseInt(e.target.value) || 0);
                  setGameState(prev => {
                    const next = { ...prev, baseAttack: val };
                    saveState(next);
                    return next;
                  });
                }}
                className="w-full bg-[#0a101d] border border-[#2a4060] rounded px-2.5 py-1 text-xs text-white font-bold font-mono"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Base Defense / Armor:</span>
                <strong className="text-blue-400">{gameState.baseDefense ?? 5} DEF</strong>
              </div>
              <input
                type="number"
                min="0"
                max="1000"
                value={gameState.baseDefense ?? 5}
                onChange={(e) => {
                  const val = Math.max(0, parseInt(e.target.value) || 0);
                  setGameState(prev => {
                    const next = { ...prev, baseDefense: val };
                    saveState(next);
                    return next;
                  });
                }}
                className="w-full bg-[#0a101d] border border-[#2a4060] rounded px-2.5 py-1 text-xs text-white font-bold font-mono"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Base Speed:</span>
                <strong className="text-amber-400">{gameState.baseSpeed ?? 10} SPD</strong>
              </div>
              <input
                type="number"
                min="0"
                max="1000"
                value={gameState.baseSpeed ?? 10}
                onChange={(e) => {
                  const val = Math.max(0, parseInt(e.target.value) || 0);
                  setGameState(prev => {
                    const next = { ...prev, baseSpeed: val };
                    saveState(next);
                    return next;
                  });
                }}
                className="w-full bg-[#0a101d] border border-[#2a4060] rounded px-2.5 py-1 text-xs text-white font-bold font-mono"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">
              Formula: <span className="text-slate-300">ATK × 1.5 + DEF × 1.2 + SPD × 0.8</span>
            </span>
            <span className="text-slate-300">
              Baseline Power Score:{' '}
              <strong className="text-cyan-300 font-bold">
                {Math.floor(((gameState.baseAttack ?? 10) * 1.5) + ((gameState.baseDefense ?? 5) * 1.2) + ((gameState.baseSpeed ?? 10) * 0.8))} PS
              </strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* REVIVE MECHANICS CONFIG */}
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
            <h4 className="font-mono text-xs text-amber-300 font-bold uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
              <span>⚡</span> REVIVAL & COST SCALING
            </h4>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Base Revive Cost:</span>
                  <strong className="text-yellow-400">{currentConfig.baseReviveCost} Coins</strong>
                </div>
                <input
                  type="range"
                  min="25"
                  max="500"
                  step="25"
                  value={currentConfig.baseReviveCost}
                  onChange={(e) => updateConfig('baseReviveCost', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Revive Cost Scaling Multiplier:</span>
                  <strong className="text-amber-400">{currentConfig.reviveCostMultiplier}x per death</strong>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="3.0"
                  step="0.1"
                  value={currentConfig.reviveCostMultiplier}
                  onChange={(e) => updateConfig('reviveCostMultiplier', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Total Death Count: <strong className="text-white">{gameState.reviveCount || 0}</strong></span>
                <span className="text-slate-400">Next Coin Revive Cost: <strong className="text-yellow-300">{Math.floor(currentConfig.baseReviveCost * Math.pow(currentConfig.reviveCostMultiplier, gameState.reviveCount || 0))} Coins</strong></span>
              </div>

              <div className="pt-2 border-t border-white/5">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Perm Upgrades Limit Per Fight:</span>
                  <strong className="text-emerald-400">{currentConfig.permUpgradeLimitPerFight ?? 3} each</strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={currentConfig.permUpgradeLimitPerFight ?? 3}
                  onChange={(e) => updateConfig('permUpgradeLimitPerFight', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Max purchases of each permanent boost (HP Shield / Combat Tonic) allowed between boss fights.
                </p>
              </div>
            </div>
          </div>

          {/* BOSS DROPS CONFIG */}
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
            <h4 className="font-mono text-xs text-[#7ae0ff] font-bold uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
              <span>💎</span> BOSS GOLD & DIAMOND DROPS
            </h4>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Gold Drop Chance:</span>
                  <strong className="text-yellow-400">{currentConfig.goldDropChance}%</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={currentConfig.goldDropChance}
                  onChange={(e) => updateConfig('goldDropChance', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Gem/Diamond Drop Chance:</span>
                  <strong className="text-cyan-400">{currentConfig.gemDropChance}%</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={currentConfig.gemDropChance}
                  onChange={(e) => updateConfig('gemDropChance', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Gold Multiplier</span>
                  <input
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={currentConfig.goldMultiplier}
                    onChange={(e) => updateConfig('goldMultiplier', Math.max(0.1, Number(e.target.value)))}
                    className="w-full bg-[#101828] border border-[#2a4060] rounded px-2 py-1 text-xs font-bold text-yellow-300 font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Gem Multiplier</span>
                  <input
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={currentConfig.gemMultiplier}
                    onChange={(e) => updateConfig('gemMultiplier', Math.max(0.1, Number(e.target.value)))}
                    className="w-full bg-[#101828] border border-[#2a4060] rounded px-2 py-1 text-xs font-bold text-cyan-300 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Reset Defaults button */}
        <div className="flex items-center justify-end pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={() => {
              setGameState(prev => {
                const next = { ...prev, balanceConfig: DEFAULT_BALANCE_CONFIG };
                saveState(next);
                return next;
              });
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
          >
            ⚙️ Reset Balance Defaults
          </button>
        </div>

      </div>
    </div>
  );
}
