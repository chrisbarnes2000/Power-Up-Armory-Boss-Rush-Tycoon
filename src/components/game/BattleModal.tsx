import React, { useRef, useEffect } from 'react';
import { CoinIcon } from '../CoinIcon';
import { GameState, UserProfile, BattleLogEntry } from '../../types';
import { BOSSES } from '../../data';
import { PreFightCoinShop } from './PreFightCoinShop';

export interface BattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  userProfile?: UserProfile | null;
  activeBossId: string | null;
  isFighting: boolean;
  livePlayerHP: number;
  livePlayerMaxHP: number;
  liveBossHP: number;
  liveBossMaxHP: number;
  totalAttack: number;
  totalDefense: number;
  bossHP: number;
  battleLogs: BattleLogEntry[];
  getLogColorStyling: (log: { message: string; className: string }) => string;
  addLog: (message: string, className?: string) => void;
  saveState: (newState: GameState) => void;
  handleReviveWithCoins: () => void;
  handleReviveWithPack: () => void;
  getCurrentReviveCost: () => number;
  showTimestamps?: boolean;
  onToggleTimestamps?: () => void;
  persistLogs?: boolean;
  onTogglePersistLogs?: () => void;
  onFightBoss: (bossId: string) => void;
  powerScore: number;
}

export const BattleModal: React.FC<BattleModalProps> = ({
  isOpen,
  onClose,
  gameState,
  setGameState,
  userProfile,
  activeBossId,
  isFighting,
  livePlayerHP,
  livePlayerMaxHP,
  liveBossHP,
  liveBossMaxHP,
  totalAttack,
  totalDefense,
  bossHP,
  battleLogs,
  getLogColorStyling,
  addLog,
  saveState,
  handleReviveWithCoins,
  handleReviveWithPack,
  getCurrentReviveCost,
  showTimestamps = true,
  onToggleTimestamps,
  persistLogs = true,
  onTogglePersistLogs,
  onFightBoss,
  powerScore
}) => {
  const modalLogRef = useRef<HTMLDivElement>(null);
  const [cycledIndex, setCycledIndex] = React.useState(0);

  const getBossPowerReq = (bossId: string) => {
    const boss = BOSSES.find(b => b.id === bossId);
    if (!boss) return 0;
    const scale = 1 + (gameState.totalBossesDefeated * 0.02);
    return Math.floor(boss.powerReq * scale);
  };

  const getBossHP = (bossId: string) => {
    const boss = BOSSES.find(b => b.id === bossId);
    if (!boss) return 0;
    const scale = 1 + (gameState.totalBossesDefeated * 0.05);
    return Math.floor(boss.baseHP * scale);
  };

  const getBossAttack = (bossId: string) => {
    const boss = BOSSES.find(b => b.id === bossId);
    if (!boss) return 0;
    const scale = 1 + (gameState.totalBossesDefeated * 0.03);
    return Math.floor(boss.baseAttack * scale);
  };

  const readyBosses = BOSSES.filter(boss => {
    const bs = gameState.bosses.find(b => b.id === boss.id);
    const req = getBossPowerReq(boss.id);
    return !gameState.isDead && !bs?.defeated && powerScore >= req;
  });

  const activeCycledBoss = readyBosses.length > 0 
    ? readyBosses[((cycledIndex % readyBosses.length) + readyBosses.length) % readyBosses.length] 
    : null;

  useEffect(() => {
    if (isOpen && modalLogRef.current) {
      modalLogRef.current.scrollTop = 0;
    }
  }, [isOpen, battleLogs]);

  if (!isOpen) return null;

  const currentBoss = BOSSES.find(b => b.id === activeBossId);

  return (
    <div className="fixed inset-0 z-modal bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 pb-20 sm:pb-24 animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#0c1322] border-2 border-red-500/50 rounded-3xl shadow-[0_0_60px_rgba(239,68,68,0.3)] p-4 sm:p-6 flex flex-col gap-4 text-slate-200 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl animate-pulse">⚔️</span>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <span>Arena Combat Simulation</span>
                {isFighting && <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {activeBossId ? `Target: ${activeBossId}` : 'Pre-Fight Readiness & Combat Arena'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer text-base font-bold"
            title="Close Arena Modal"
          >
            ✕
          </button>
        </div>

        {/* Duel Stage Visualization */}
        {activeBossId ? (
          <div className="bg-linear-to-b from-[#1c0f2b] via-[#121c30] to-[#0c1322] border-2 border-red-500/50 rounded-2xl p-2.5 sm:p-5 md:p-6 flex flex-row items-center justify-between gap-2 sm:gap-5 relative overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.15)]">
            {/* Hero / Player Fighter Card */}
            <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2 flex-1 min-w-0">
              <span className={`text-3xl sm:text-5xl md:text-7xl filter drop-shadow-[0_3px_10px_rgba(0,0,0,0.6)] transition-all ${gameState.isDead || livePlayerHP <= 0 ? 'grayscale filter' : isFighting ? 'animate-bounce' : ''}`}>
                {gameState.isDead || livePlayerHP <= 0 ? '🪦' : (userProfile?.avatar || '⚔️')}
              </span>
              <div className={`font-black text-xs sm:text-lg md:text-xl font-mono flex items-center gap-0.5 sm:gap-1 truncate max-w-full ${gameState.isDead || livePlayerHP <= 0 ? 'text-red-400' : 'text-emerald-300'}`}>
                <span className="truncate">{gameState.playerName || 'Hero'}</span>
                {(gameState.isDead || livePlayerHP <= 0) && (
                  <span className="text-[8px] sm:text-[10px] bg-red-950 text-red-300 border border-red-500/40 px-1 py-0.2 rounded font-extrabold shrink-0">DEAD</span>
                )}
              </div>
              <div className="text-[9px] sm:text-xs md:text-sm font-bold text-slate-300 font-mono bg-black/30 border border-white/5 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg truncate max-w-full">
                ATK {totalAttack} • DEF {totalDefense}
              </div>
              {/* Player HP Bar */}
              <div className={`w-full max-w-[100px] sm:max-w-[210px] bg-black/60 h-2 sm:h-4 md:h-5 rounded-full overflow-hidden border p-0.5 ${
                gameState.isDead || livePlayerHP <= 0 ? 'border-red-500/40' : 'border-emerald-500/40'
              }`}>
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    gameState.isDead || livePlayerHP <= 0 
                      ? 'bg-red-700' 
                      : livePlayerHP < livePlayerMaxHP * 0.25 
                        ? 'bg-linear-to-r from-red-600 to-amber-500' 
                        : 'bg-linear-to-r from-emerald-500 to-emerald-300'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, (livePlayerHP / livePlayerMaxHP) * 100))}%` }}
                />
              </div>
              <span className={`text-[10px] sm:text-sm md:text-base font-mono font-black ${gameState.isDead || livePlayerHP <= 0 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                {livePlayerHP} HP
              </span>
            </div>

            {/* VS Dynamic Indicator */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <span className="text-sm sm:text-3xl md:text-5xl font-black font-mono text-red-500 animate-pulse bg-red-950/80 border-2 border-red-500/60 px-2 py-1 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.3)]">VS</span>
              <span className="text-[8px] sm:text-xs text-red-400 font-mono mt-1 sm:mt-2 uppercase tracking-wider font-extrabold bg-red-950/40 border border-red-500/20 px-1 py-0.2 sm:px-2 sm:py-0.5 rounded">
                DUEL
              </span>
            </div>

            {/* Boss Fighter Card */}
            <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2 flex-1 min-w-0">
              <span className={`text-3xl sm:text-5xl md:text-7xl filter drop-shadow-[0_3px_10px_rgba(0,0,0,0.6)] transition-all ${isFighting ? 'animate-pulse' : ''}`}>{currentBoss?.emoji || '👹'}</span>
              <div className="font-black text-xs sm:text-lg md:text-xl text-red-400 font-mono truncate max-w-full">{activeBossId}</div>
              <div className="text-[9px] sm:text-xs md:text-sm font-bold text-slate-300 font-mono bg-black/30 border border-white/5 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg truncate max-w-full">
                Power: {getBossPowerReq(activeBossId)} PS
              </div>
              {/* Boss HP Bar */}
              <div className="w-full max-w-[100px] sm:max-w-[210px] bg-black/60 h-2 sm:h-4 md:h-5 rounded-full overflow-hidden border border-red-500/40 p-0.5">
                <div 
                  className="bg-linear-to-r from-red-600 to-orange-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, (liveBossHP / liveBossMaxHP) * 100))}%` }}
                />
              </div>
              <span className="text-[10px] sm:text-sm md:text-base font-mono font-black text-red-400">{liveBossHP} HP</span>
            </div>
          </div>
        ) : (
          <div className="bg-[#141d30] border border-[#2a4060] rounded-2xl p-4 sm:p-5 text-center shadow-lg">
            <span className="text-3xl sm:text-4xl block mb-2 animate-bounce">🎯</span>
            <p className="text-xs sm:text-sm font-bold text-slate-200">Select any arena boss from the roster or cycle using the deck below to trigger a live animated duel simulation!</p>
          </div>
        )}

        {/* Dynamic Boss Battle Cycling Controller inside Combat Modal */}
        {readyBosses.length > 0 && activeCycledBoss ? (
          <div className="bg-linear-to-b from-[#111625] via-[#152035] to-[#0c101c] border-2 border-amber-500/40 rounded-2xl p-3 shadow-[0_0_15px_rgba(245,158,11,0.15)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-bounce">⚡</span>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono text-[9px] font-black text-amber-300 uppercase tracking-widest bg-amber-950/70 border border-amber-500/30 px-1.5 py-0.2 rounded-full">
                    🔥 {readyBosses.length} Ready
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Target: <strong className="text-white">{((cycledIndex % readyBosses.length) + readyBosses.length) % readyBosses.length + 1}</strong> of {readyBosses.length}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 font-mono">
                  Assault: <strong className="text-[#ffd666]">{activeCycledBoss.emoji} {activeCycledBoss.id}</strong> (HP: {getBossHP(activeCycledBoss.id)}, ATK: {getBossAttack(activeCycledBoss.id)})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setCycledIndex(prev => prev - 1)}
                className="px-2.5 py-1.5 bg-[#172238] hover:bg-[#203050] text-amber-400 hover:text-white border border-[#2a4060] rounded-lg text-[10px] font-mono font-bold transition cursor-pointer flex-1 sm:flex-initial"
              >
                ◀ Prev
              </button>
              <button
                type="button"
                onClick={() => onFightBoss(activeCycledBoss.id)}
                disabled={isFighting}
                className="px-4 py-2 bg-linear-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 font-mono text-[10px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer flex-2 sm:flex-initial flex items-center justify-center gap-1.5 shadow active:scale-95 text-center"
              >
                <span>⚔️ FIGHT NEXT</span>
              </button>
              <button
                type="button"
                onClick={() => setCycledIndex(prev => prev + 1)}
                className="px-2.5 py-1.5 bg-[#172238] hover:bg-[#203050] text-amber-400 hover:text-white border border-[#2a4060] rounded-lg text-[10px] font-mono font-bold transition cursor-pointer flex-1 sm:flex-initial"
              >
                Next ▶
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-linear-to-b from-[#111625] via-[#1b1c2e] to-[#0c101c] border border-dashed border-[#2a4060]/50 rounded-2xl p-3 text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2">
              <span className="text-xl filter drop-shadow mt-0.5">🔒</span>
              <div>
                <h4 className="font-mono text-[10px] text-[#ffd666] uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <span>BOSS CYCLING DECK</span>
                  <span className="bg-[#1e2a4a] text-blue-300 border border-blue-500/20 text-[8px] px-1 py-0.2 rounded font-sans tracking-widest font-bold">LOCKED</span>
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal font-mono">
                  {gameState.isDead ? (
                    <span>Champion is fallen. Revive below to enable active boss cycling!</span>
                  ) : (
                    <span>
                      Need <strong className="text-blue-300">50 PS</strong> to unlock cycling (Current: {powerScore} PS). Buy items in Shop to boost attributes!
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Pre-Fight Coin Boosts inside Modal */}
        <PreFightCoinShop
          gameState={gameState}
          setGameState={setGameState}
          saveState={saveState}
          addLog={addLog}
          compact
        />

        {/* Live Scrolling Battle Feed in Modal */}
        <div ref={modalLogRef} className="bg-[#080d18] border border-white/10 rounded-2xl p-3.5 h-44 overflow-y-auto space-y-1.5 font-mono text-xs shadow-inner">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Live Combat Log Feed:</span>
            <div className="flex items-center gap-1.5">
              {onToggleTimestamps && (
                <button
                  type="button"
                  onClick={onToggleTimestamps}
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded border transition cursor-pointer ${
                    showTimestamps
                      ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
                      : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
                  title={showTimestamps ? "Hide Log Timestamps" : "Show Log Timestamps"}
                >
                  ⏱️ {showTimestamps ? 'Time ON' : 'Time OFF'}
                </button>
              )}
              <span className="text-[9px] text-slate-400 font-mono bg-white/5 px-1.5 py-0.2 rounded border border-white/10">Newest First</span>
            </div>
          </div>
          {battleLogs.map((log, index) => (
            <div key={index} className={`transition-all flex items-start gap-1.5 ${getLogColorStyling(log)}`}>
              {showTimestamps && log.timestamp && (
                <span className="text-[9px] text-slate-500 shrink-0 font-mono select-none pt-0.5 font-normal">
                  [{log.timestamp}]
                </span>
              )}
              <span className="flex-1">{log.message}</span>
            </div>
          ))}
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
          {(gameState.isDead || livePlayerHP < 20) && (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleReviveWithCoins}
                className="px-3.5 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black uppercase text-xs tracking-wider cursor-pointer transition shadow-md shadow-yellow-500/20 active:scale-95 flex items-center gap-1.5"
              >
                <span>⚡ Revive ({getCurrentReviveCost()}</span>
                <CoinIcon className="w-3.5 h-3.5 drop-shadow" />
                <span>)</span>
              </button>
              <button 
                onClick={handleReviveWithPack}
                disabled={(gameState.revivePacks || 0) <= 0}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black uppercase text-xs tracking-wider cursor-pointer transition shadow-md shadow-emerald-600/20 active:scale-95 flex items-center gap-1.5"
              >
                <span>🩹 Pack ({gameState.revivePacks || 0} Left)</span>
              </button>
            </div>
          )}
          
          <button
            onClick={onClose}
            className="ml-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Close Arena
          </button>
        </div>

      </div>
    </div>
  );
};
