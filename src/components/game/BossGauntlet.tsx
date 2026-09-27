import React from 'react';
import { CoinIcon } from '../CoinIcon';
import { GameState, Boss, GameBossState, BattleLogEntry } from '../../types';
import { BOSSES } from '../../data';
import { PreFightCoinShop } from './PreFightCoinShop';

export interface BossGauntletProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  saveState: (newState: GameState) => void;
  addLog: (message: string, className?: string) => void;
  isFighting: boolean;
  activeBossId: string | null;
  onFightBoss: (bossId: string) => void;
  onReviveWithCoins: () => void;
  onReviveWithPack: () => void;
  getCurrentReviveCost: () => number;
  getBossData: (id: string) => Boss | undefined;
  getBossState: (id: string) => GameBossState | undefined;
  getBossPowerReq: (id: string) => number;
  getBossHP: (id: string) => number;
  getBossAttack: (id: string) => number;
  powerScore: number;
  livePlayerHP: number;
  livePlayerMaxHP: number;
  liveBossHP: number;
  liveBossMaxHP: number;
  battleLogs: BattleLogEntry[];
  logContainerRef: React.RefObject<HTMLDivElement | null>;
  getLogColorStyling: (log: { message: string; className: string }) => string;
  onOpenLoreBook?: () => void;
  onOpenBattleModal: () => void;
  showTimestamps?: boolean;
  onToggleTimestamps?: () => void;
  persistLogs?: boolean;
  onTogglePersistLogs?: () => void;
  onClearLogs?: () => void;
}

/**
 * BossGauntlet - Arena combat view containing boss roster, combat logging feed, revive actions & pre-fight buffs
 */
export const BossGauntlet: React.FC<BossGauntletProps> = ({
  gameState,
  setGameState,
  saveState,
  addLog,
  isFighting,
  activeBossId,
  onFightBoss,
  onReviveWithCoins,
  onReviveWithPack,
  getCurrentReviveCost,
  getBossData,
  getBossState,
  getBossPowerReq,
  getBossHP,
  getBossAttack,
  powerScore,
  livePlayerHP,
  livePlayerMaxHP,
  liveBossHP,
  liveBossMaxHP,
  battleLogs,
  logContainerRef,
  getLogColorStyling,
  onOpenLoreBook,
  onOpenBattleModal,
  showTimestamps = true,
  onToggleTimestamps,
  persistLogs = true,
  onTogglePersistLogs,
  onClearLogs
}) => {
  return (
    <div id="boss-battle-arena" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Global Champion Fallen Alert Banner */}
      {gameState.isDead && (
        <div className="col-span-1 lg:col-span-12 bg-linear-to-r from-red-950/90 via-red-900/80 to-amber-950/90 border-2 border-red-500 rounded-2xl p-4 sm:p-5 shadow-[0_0_30px_rgba(239,68,68,0.4)] flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3 text-center md:text-left">
            <span className="text-3xl sm:text-4xl">💀</span>
            <div>
              <h3 className="font-mono text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2 justify-center md:justify-start">
                <span>CHAMPION FALLEN IN BATTLE</span>
                <span className="bg-red-950 text-red-300 border border-red-400/50 text-[10px] px-2 py-0.5 rounded-full font-bold">0 HP</span>
              </h3>
              <p className="text-xs text-red-200 mt-0.5">
                Combat abilities are locked. Revive your hero below using Gold Coins or a Revive Pack to resume arena battles.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0 justify-center">
            <button
              type="button"
              onClick={onReviveWithCoins}
              className="flex-1 md:flex-initial py-2.5 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black uppercase text-xs tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 active:scale-95"
            >
              <span>⚡ Revive Now</span>
              <span className="font-mono bg-slate-950/20 px-2 py-0.5 rounded text-[11px] font-extrabold flex items-center gap-1">
                <span>{getCurrentReviveCost()}</span>
                <CoinIcon className="w-3.5 h-3.5 drop-shadow" />
              </span>
            </button>

            <button
              type="button"
              onClick={onReviveWithPack}
              disabled={(gameState.revivePacks || 0) <= 0}
              className="flex-1 md:flex-initial py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black uppercase text-xs tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              <span>🩹 Use Pack</span>
              <span className="font-mono bg-black/30 px-2 py-0.5 rounded text-[11px] font-extrabold text-emerald-200">
                {gameState.revivePacks || 0} Left
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Quick Action Banner */}
      <div className="lg:hidden col-span-1 bg-linear-to-r from-red-950/70 via-[#10192e] to-amber-950/70 border-2 border-red-500/50 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2.5 text-xs">
          <span className="text-2xl animate-pulse">⚡</span>
          <div>
            <div className="font-extrabold text-white text-xs sm:text-sm">Pre-Fight Shop & Live Arena</div>
            <div className="text-[10px] text-amber-300 font-mono">Buy HP/DMG boosts & view live simulation</div>
          </div>
        </div>
        <button
          onClick={onOpenBattleModal}
          className="px-3.5 py-2 rounded-xl bg-linear-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-mono text-xs font-black uppercase tracking-wider shrink-0 cursor-pointer shadow-md shadow-red-600/30 flex items-center gap-1.5 active:scale-95 transition"
        >
          <span>Arena Modal</span>
          <span>⚔️</span>
        </button>
      </div>

      {/* Boss Roster Grid */}
      <div id="boss-roster-selector" className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {BOSSES.map(boss => {
          const bs = getBossState(boss.id);
          const req = getBossPowerReq(boss.id);
          const hp = getBossHP(boss.id);
          const atk = getBossAttack(boss.id);

          let tag = 'Locked';
          let tagClass = 'bg-[#141c30] text-slate-400 border border-[#2a4060]';
          if (gameState.isDead) {
            tag = 'Hero Fallen';
            tagClass = 'bg-red-950/80 text-red-300 border border-red-500/50 animate-pulse';
          } else if (bs?.defeated) {
            const sLeft = bs.respawnTime !== undefined ? bs.respawnTime : 15;
            tag = `Respawning ${sLeft}s`;
            tagClass = 'bg-amber-950/60 text-amber-300 border border-amber-500/30';
          } else if (powerScore >= req) {
            tag = 'Ready';
            tagClass = 'bg-[#142a20] text-[#6affaa] border border-[#3a8a5a]';
          }

          return (
            <div 
              key={boss.id} 
              className={`bg-linear-to-b from-[#1a2440] to-[#111a2e] border rounded-2xl p-4.5 flex flex-col justify-between transition-all ${
                gameState.isDead ? 'border-red-500/30 opacity-85' : 'border-[#2a3d60] hover:border-red-500/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{boss.emoji}</span>
                    <span className="font-extrabold text-base text-white">{boss.id}</span>
                  </div>
                  <span className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full ${tagClass}`}>{tag}</span>
                </div>

                <div className="text-xs text-slate-300 space-y-1.5 mb-4 font-mono">
                  <div className="flex justify-between"><span>❤️ HP:</span> <span className="text-red-400 font-bold">{hp}</span></div>
                  <div className="flex justify-between"><span>⚔️ ATK:</span> <span className="text-red-400 font-bold">{atk}</span></div>
                  <div className="flex justify-between"><span>🎯 Power Req:</span> <span className="text-[#7ae0ff] font-bold">{req} PS</span></div>
                  <div className="text-xs text-slate-400 italic mt-1.5 pb-1.5 border-t border-white/5 pt-1.5">✦ {boss.special}</div>
                </div>
              </div>

              {gameState.isDead ? (
                <button
                  type="button"
                  onClick={onReviveWithCoins}
                  className="w-full py-3 rounded-xl text-xs md:text-sm uppercase font-black tracking-wider bg-linear-to-r from-red-950 via-amber-950 to-red-950 hover:from-amber-600 hover:to-yellow-500 text-amber-200 hover:text-slate-950 border border-amber-500/60 shadow-md shadow-red-950/50 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 group"
                >
                  <span className="text-base group-hover:animate-bounce">💀</span>
                  <span className="flex items-center gap-1.5">
                    <span>REVIVE HERO ({getCurrentReviveCost()}</span>
                    <CoinIcon className="w-4 h-4 inline-block drop-shadow" />
                    <span>)</span>
                  </span>
                </button>
              ) : (
                <button
                  disabled={bs?.defeated || powerScore < req || isFighting}
                  onClick={() => onFightBoss(boss.id)}
                  className="w-full py-3 rounded-xl text-xs md:text-sm uppercase font-black tracking-wider bg-red-900/40 hover:bg-red-700/60 border border-red-500/40 text-[#ff6a6a] disabled:opacity-30 transition cursor-pointer"
                >
                  {bs?.defeated ? `Respawning in ${bs.respawnTime !== undefined ? bs.respawnTime : 15}s` : isFighting ? 'Fighting...' : 'FIGHT'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Battle Logging & Side Controls */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        
        {/* PRE-FIGHT COIN BOOSTS STORE */}
        <PreFightCoinShop
          gameState={gameState}
          setGameState={setGameState}
          saveState={saveState}
          addLog={addLog}
        />

        {/* BATTLE RECORD CONTAINER */}
        <div id="boss-combat-log" className="bg-[#0e1628] border border-[#1a2540] rounded-2xl p-4 flex flex-col justify-between h-[380px]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-xs text-[#f5e56b] uppercase font-bold tracking-wider">⚔️ BATTLE RECORD</h3>
              <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/10 hidden xs:inline">Newest First</span>
            </div>

            {/* Log Preferences & Quick Actions */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {onToggleTimestamps && (
                <button
                  type="button"
                  onClick={onToggleTimestamps}
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                    showTimestamps
                      ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40 shadow-xs'
                      : 'bg-[#141f35] text-slate-400 border-[#2a4060] hover:text-white'
                  }`}
                  title={showTimestamps ? "Hide Log Timestamps" : "Show Log Timestamps"}
                >
                  <span>⏱️</span>
                  <span>{showTimestamps ? 'Time ON' : 'Time OFF'}</span>
                </button>
              )}

              {onTogglePersistLogs && (
                <button
                  type="button"
                  onClick={onTogglePersistLogs}
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                    persistLogs
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-xs'
                      : 'bg-[#141f35] text-slate-400 border-[#2a4060] hover:text-white'
                  }`}
                  title={persistLogs ? "Saving Logs in LocalStorage (Click to disable)" : "Save Logs in LocalStorage (Click to enable)"}
                >
                  <span>💾</span>
                  <span>{persistLogs ? 'Saved' : 'Volatile'}</span>
                </button>
              )}

              {onClearLogs && (
                <button
                  type="button"
                  onClick={onClearLogs}
                  className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 transition cursor-pointer"
                  title="Clear Battle Logs"
                >
                  🧹
                </button>
              )}

              {onOpenLoreBook && (
                <button
                  type="button"
                  onClick={onOpenLoreBook}
                  className="text-xs font-mono font-bold text-[#7ae0ff] hover:text-white bg-[#141f35] hover:bg-[#1a2b4d] border border-[#2a4060] px-2 py-0.5 rounded-lg transition cursor-pointer flex items-center gap-1"
                >
                  <span>📖</span>
                  <span className="hidden sm:inline">Lore</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Dynamic live combat health bars */}
          {isFighting && activeBossId && (
            <div className="bg-[#141c30]/80 border border-red-500/30 rounded-xl p-1.5 sm:p-2 md:p-3 mb-3 flex flex-row items-center gap-1.5 sm:gap-2 md:gap-4 justify-between select-none">
              
              {/* Player Side */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center text-[8.5px] sm:text-[10px] md:text-xs font-mono mb-0.5 sm:mb-1 gap-1">
                  <span className={`font-black uppercase truncate ${gameState.isDead || livePlayerHP <= 0 ? 'text-red-400' : 'text-emerald-400'} flex items-center gap-0.5`}>
                    <span className="text-[9px] sm:text-xs shrink-0">{gameState.isDead || livePlayerHP <= 0 ? '💀' : '🛡️'}</span>
                    <span className="truncate max-w-[40px] sm:max-w-[90px]">{gameState.playerName || 'Hero'}</span>
                  </span>
                  <span className={`font-bold shrink-0 ${gameState.isDead || livePlayerHP <= 0 ? 'text-red-400 animate-pulse' : 'text-emerald-300'}`}>
                    {livePlayerHP} HP
                  </span>
                </div>
                <div className={`w-full bg-black/40 h-1 sm:h-1.5 md:h-2 rounded-full overflow-hidden border ${gameState.isDead || livePlayerHP <= 0 ? 'border-red-500/40' : 'border-white/5'}`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      gameState.isDead || livePlayerHP <= 0 
                        ? 'bg-red-700' 
                        : livePlayerHP < livePlayerMaxHP * 0.25 
                          ? 'bg-linear-to-r from-red-600 to-amber-500' 
                          : 'bg-linear-to-r from-emerald-600 to-emerald-400'
                    }`}
                    style={{ width: `${Math.max(0, Math.min(100, (livePlayerHP / livePlayerMaxHP) * 100))}%` }}
                  />
                </div>
              </div>

              {/* VS Badge */}
              <div className="shrink-0 flex items-center justify-center bg-red-950/80 border border-red-500/50 rounded-full px-1 py-[1px] sm:px-1.5 md:px-2 md:py-0.5 text-[7px] sm:text-[8px] md:text-[10px] font-black text-red-400 uppercase tracking-widest font-mono select-none">
                VS
              </div>

              {/* Boss Side */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center text-[8.5px] sm:text-[10px] md:text-xs font-mono mb-0.5 sm:mb-1 gap-1">
                  <span className="text-red-400 font-bold uppercase truncate flex items-center gap-0.5">
                    <span className="text-[9px] sm:text-xs shrink-0">👾</span>
                    <span className="truncate max-w-[40px] sm:max-w-[90px]">{getBossData(activeBossId)?.id || activeBossId}</span>
                  </span>
                  <span className="font-bold text-red-300 shrink-0">{liveBossHP} HP</span>
                </div>
                <div className="w-full bg-black/40 h-1 sm:h-1.5 md:h-2 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="bg-linear-to-r from-red-600 to-orange-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, (liveBossHP / liveBossMaxHP) * 100))}%` }}
                  />
                </div>
              </div>

            </div>
          )}

          {/* Scrolling Logs */}
          <div ref={logContainerRef} className="flex-1 overflow-y-auto space-y-1.5 mb-3 pr-1 font-mono text-xs md:text-sm leading-relaxed">
            {battleLogs.map((log, index) => (
              <div key={index} className={`transition-all flex items-start gap-1.5 ${getLogColorStyling(log)}`}>
                {showTimestamps && log.timestamp && (
                  <span className="text-[10px] text-slate-500 shrink-0 font-mono select-none pt-0.5 font-normal">
                    [{log.timestamp}]
                  </span>
                )}
                <span className="flex-1">{log.message}</span>
              </div>
            ))}
          </div>

          {/* Revive Action Options (Coin Scaling vs 1x Revive Pack) */}
          {(gameState.isDead || livePlayerHP < 20) && (
            <div className={`rounded-xl p-3.5 mt-2 space-y-2.5 animate-fadeIn border-2 ${
              gameState.isDead 
                ? 'bg-linear-to-b from-red-950/90 to-[#190e18] border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.35)]' 
                : 'bg-[#141220] border-amber-500/40'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className={`font-extrabold flex items-center gap-1.5 ${gameState.isDead ? 'text-red-300' : 'text-amber-300'}`}>
                  <span className="text-base animate-bounce">💀</span>
                  <span>{gameState.isDead ? 'CHAMPION DEFEATED (0 HP)' : 'CRITICAL HEALTH'}</span>
                </span>
                <span className="text-slate-400 text-[11px]">
                  Revives: <strong className="text-white font-bold">{gameState.reviveCount || 0}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onReviveWithCoins}
                  className="py-2.5 px-3 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black uppercase text-xs tracking-wider transition cursor-pointer flex items-center justify-between shadow-md active:scale-95"
                  title="Pay coins to revive champion with full HP"
                >
                  <span className="flex items-center gap-1">⚡ Revive</span>
                  <span className="font-mono bg-slate-950/20 px-2 py-0.5 rounded text-[11px] font-extrabold flex items-center gap-1">
                    <span>{getCurrentReviveCost()}</span>
                    <CoinIcon className="w-3.5 h-3.5 drop-shadow" />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onReviveWithPack}
                  disabled={(gameState.revivePacks || 0) <= 0}
                  className="py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black uppercase text-xs tracking-wider transition cursor-pointer flex items-center justify-between shadow-md active:scale-95"
                  title="Use 1x Revive Pack to bypass coin scaling cost"
                >
                  <span className="flex items-center gap-1">🩹 Use Pack</span>
                  <span className="font-mono bg-black/30 px-2 py-0.5 rounded text-[11px] font-extrabold text-emerald-200">
                    {gameState.revivePacks || 0} Left
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
