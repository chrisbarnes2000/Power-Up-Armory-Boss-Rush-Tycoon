import React, { useRef, useEffect } from 'react';
import { CoinIcon } from '../CoinIcon';
import { GameState, UserProfile, BattleLogEntry } from '../../types';
import { BOSSES } from '../../data';

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
  onTogglePersistLogs
}) => {
  if (!isOpen) return null;

  const currentBoss = BOSSES.find(b => b.id === activeBossId);
  const modalLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalLogRef.current) {
      modalLogRef.current.scrollTop = 0;
    }
  }, [battleLogs]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
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
          <div className="bg-linear-to-b from-[#1c0f2b] via-[#121c30] to-[#0c1322] border border-red-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden shadow-inner">
            {/* Hero / Player Fighter Card */}
            <div className="flex flex-col items-center text-center space-y-1.5 flex-1">
              <span className={`text-4xl sm:text-5xl ${gameState.isDead || livePlayerHP <= 0 ? 'grayscale filter' : isFighting ? 'animate-bounce' : ''}`}>
                {gameState.isDead || livePlayerHP <= 0 ? '🪦' : (userProfile?.avatar || '⚔️')}
              </span>
              <div className={`font-extrabold text-sm font-mono flex items-center gap-1 ${gameState.isDead || livePlayerHP <= 0 ? 'text-red-400' : 'text-emerald-300'}`}>
                <span>{gameState.playerName || 'Champion'}</span>
                {(gameState.isDead || livePlayerHP <= 0) && (
                  <span className="text-[10px] bg-red-950 text-red-300 border border-red-500/40 px-1.5 py-0.2 rounded font-extrabold">DECEASED</span>
                )}
              </div>
              <div className="text-xs font-bold text-slate-400 font-mono">ATK {totalAttack} • DEF {totalDefense}</div>
              {/* Player HP Bar */}
              <div className={`w-full max-w-[180px] bg-black/60 h-3 rounded-full overflow-hidden border p-0.5 ${
                gameState.isDead || livePlayerHP <= 0 ? 'border-red-500/50' : 'border-emerald-500/40'
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
              <span className={`text-xs font-mono font-bold ${gameState.isDead || livePlayerHP <= 0 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                {livePlayerHP} / {livePlayerMaxHP} HP
              </span>
            </div>

            {/* VS Dynamic Indicator */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <span className="text-2xl font-black font-mono text-red-500 animate-pulse bg-red-950/70 border border-red-500/40 px-3.5 py-1 rounded-xl shadow-lg shadow-red-950/50">VS</span>
              <span className="text-[10px] text-slate-300 font-mono mt-1 uppercase tracking-wider font-extrabold">
                {isFighting ? '⚔️ DUEL ACTIVE' : 'PRE-FIGHT READY'}
              </span>
            </div>

            {/* Boss Fighter Card */}
            <div className="flex flex-col items-center text-center space-y-1.5 flex-1">
              <span className={`text-4xl sm:text-5xl ${isFighting ? 'animate-pulse' : ''}`}>{currentBoss?.emoji || '👹'}</span>
              <div className="font-extrabold text-sm text-red-400 font-mono">{activeBossId}</div>
              <div className="text-xs font-bold text-slate-400 font-mono">Boss HP: {bossHP}</div>
              {/* Boss HP Bar */}
              <div className="w-full max-w-[180px] bg-black/60 h-3 rounded-full overflow-hidden border border-red-500/40 p-0.5">
                <div 
                  className="bg-linear-to-r from-red-600 to-orange-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, (liveBossHP / liveBossMaxHP) * 100))}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-red-400">{liveBossHP} / {liveBossMaxHP} HP</span>
            </div>
          </div>
        ) : (
          <div className="bg-[#141d30] border border-[#2a4060] rounded-2xl p-4 text-center">
            <span className="text-3xl block mb-2">🎯</span>
            <p className="text-xs font-bold text-slate-300">Select any arena boss from the roster to trigger a live animated duel simulation!</p>
          </div>
        )}

        {/* Quick Pre-Fight Coin Boosts inside Modal */}
        <div className="bg-[#141d30] border border-[#2a4060] rounded-2xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-[#f5e56b] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <span>⚡</span>
              <span>PRE-FIGHT GOLD BOOST SHOP</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400 font-bold flex items-center gap-1">
              <span>Gold Balance:</span>
              <span className="text-[#f5e56b]">{Math.floor(gameState.coins).toLocaleString()}</span>
              <CoinIcon className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (gameState.coins >= 250) {
                  setGameState(prev => {
                    const next = { ...prev, coins: prev.coins - 250, maxHpBonus: (prev.maxHpBonus || 0) + 25 };
                    saveState(next);
                    return next;
                  });
                  addLog(`💖 Purchased HP Shield (+25 Max HP Permanent)!`, 'log-heal');
                } else {
                  addLog(`❌ Need 250 Coins for HP Shield.`, 'log-defeat');
                }
              }}
              className="px-3.5 py-2.5 rounded-xl bg-[#1c2944] hover:bg-[#25375c] border border-[#2a4060] text-xs font-bold text-slate-200 flex items-center justify-between transition cursor-pointer active:scale-95"
            >
              <span className="flex items-center gap-1">💖 Max HP Shield (+25 HP)</span>
              <span className="text-[#f5e56b] font-mono font-extrabold bg-[#0a0f1d] px-2 py-0.5 rounded border border-[#f5e56b]/20 flex items-center gap-1">
                <span>250</span>
                <CoinIcon className="w-3.5 h-3.5" />
              </span>
            </button>

            <button
              onClick={() => {
                if (gameState.coins >= 300) {
                  setGameState(prev => {
                    const next = { ...prev, coins: prev.coins - 300, damageBonusPercent: (prev.damageBonusPercent || 0) + 5 };
                    saveState(next);
                    return next;
                  });
                  addLog(`⚔️ Purchased Combat Tonic (+5% DMG Permanent)!`, 'log-buff');
                } else {
                  addLog(`❌ Need 300 Coins for Combat Tonic.`, 'log-defeat');
                }
              }}
              className="px-3.5 py-2.5 rounded-xl bg-[#1c2944] hover:bg-[#25375c] border border-[#2a4060] text-xs font-bold text-slate-200 flex items-center justify-between transition cursor-pointer active:scale-95"
            >
              <span className="flex items-center gap-1">🔥 Combat Tonic (+5% DMG)</span>
              <span className="text-[#f5e56b] font-mono font-extrabold bg-[#0a0f1d] px-2 py-0.5 rounded border border-[#f5e56b]/20 flex items-center gap-1">
                <span>300</span>
                <CoinIcon className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>
        </div>

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
