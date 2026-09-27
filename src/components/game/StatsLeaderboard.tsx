import React, { useState } from 'react';
import { GameState, LeaderboardEntry, UserProfile } from '../../types';
import { BOSSES } from '../../data';
import { CoinIcon } from '../CoinIcon';
import { User as FirebaseUser } from 'firebase/auth';

export interface StatsLeaderboardProps {
  gameState: GameState;
  currentUser?: FirebaseUser | null;
  userProfile?: UserProfile | null;
  cloudLeaderboard?: LeaderboardEntry[];
  onOpenAccount?: () => void;
  onSyncLeaderboard?: () => Promise<void>;
  isSyncingLeaderboard?: boolean;
  totalAttack: number;
  totalDefense: number;
  totalSpeed: number;
  powerScore: number;
}

export const StatsLeaderboard: React.FC<StatsLeaderboardProps> = ({
  gameState,
  currentUser,
  userProfile,
  cloudLeaderboard = [],
  onOpenAccount,
  onSyncLeaderboard,
  isSyncingLeaderboard = false,
  totalAttack,
  totalDefense,
  totalSpeed,
  powerScore
}) => {
  const [leaderboardSortBy, setLeaderboardSortBy] = useState<'score' | 'bosses' | 'coins'>('score');

  return (
    <div className="space-y-6 max-w-[950px] mx-auto">
      {/* Top Stats Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* HERO ATTRIBUTES BLOCK */}
        <div id="stats-power-score-card" className="bg-[#0e1628] border border-[#1a2540] rounded-2xl p-5.5 flex flex-col justify-between">
          <div>
            <h3 className="font-mono text-sm text-[#7ae0ff] uppercase font-bold tracking-wider mb-3.5 border-b border-white/5 pb-2.5 flex items-center gap-1.5">
              📊 HERO CHARACTER ATTRIBUTES
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#141c30] p-3 rounded-xl border border-[#2a4060]/30 flex flex-col">
                <span className="text-xs text-slate-400 block uppercase font-bold">🗡️ Total Attack</span>
                <span className="font-mono text-sm text-[#f5e56b] font-black mt-1">+{totalAttack} ATK</span>
                <span className="text-xs text-slate-500 block leading-tight mt-1">Base + {gameState.damageBonusPercent || 0}% Tonic</span>
              </div>
              <div className="bg-[#141c30] p-3 rounded-xl border border-[#2a4060]/30 flex flex-col">
                <span className="text-xs text-slate-400 block uppercase font-bold">🛡️ Armor / Defense</span>
                <span className="font-mono text-sm text-[#7ae0ff] font-black mt-1">+{totalDefense} DEF</span>
                <span className="text-xs text-slate-500 block leading-tight mt-1">Reduces boss strike dmg</span>
              </div>
              <div className="bg-[#141c30] p-3 rounded-xl border border-[#2a4060]/30 flex flex-col">
                <span className="text-xs text-slate-400 block uppercase font-bold">💖 Total Max HP</span>
                <span className="font-mono text-sm text-red-400 font-black mt-1">{100 + totalDefense + (gameState.maxHpBonus || 0)} HP</span>
                <span className="text-xs text-slate-500 block leading-tight mt-1">Base + {gameState.maxHpBonus || 0} Shield</span>
              </div>
              <div className="bg-[#141c30] p-3 rounded-xl border border-[#2a4060]/30 flex flex-col">
                <span className="text-xs text-slate-400 block uppercase font-bold">💨 Speed Rating</span>
                <span className="font-mono text-sm text-[#cb9df2] font-black mt-1">+{totalSpeed} SPD</span>
                <span className="text-xs text-slate-500 block leading-tight mt-1">Base 10 + Powerup boost</span>
              </div>
            </div>
          </div>

          <div className="bg-black/35 border border-white/5 rounded-xl p-3 mt-4 text-xs font-mono text-slate-300 space-y-1">
            <div className="flex justify-between"><span>👑 Player Name:</span> <span className="font-bold text-white">{gameState.playerName || 'Hero'}</span></div>
            <div className="flex justify-between"><span>🛡️ Total Power Score:</span> <span className="font-bold text-[#f5e56b]">{powerScore} PS</span></div>
            <div className="flex justify-between"><span>💰 Gold Balance:</span> <span className="font-bold text-yellow-400">{Math.floor(gameState.coins)} 🪙</span></div>
          </div>
        </div>

        {/* BOSS KILL/DEATH HISTORY LEDGER */}
        <div id="stats-telemetry-card" className="bg-[#0e1628] border border-[#1a2540] rounded-2xl p-5.5">
          <h3 className="font-mono text-sm text-red-400 uppercase font-bold tracking-wider mb-3.5 border-b border-white/5 pb-2.5 flex items-center gap-1.5">
            🏆 BOSS KILL/DEATH HISTORY
          </h3>
          
          <div className="space-y-2 max-h-[225px] overflow-y-auto pr-1">
            {BOSSES.map(boss => {
              const kills = gameState.bossKillStats?.[boss.id] || 0;
              const deaths = gameState.bossDeathStats?.[boss.id] || 0;
              return (
                <div key={boss.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-2">
                    <span className="text-lg">{boss.emoji}</span>
                    <span className="font-bold truncate max-w-[140px]">{boss.id}</span>
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-[#142a20] text-[#6affaa] px-2 py-1 rounded border border-[#3a8a5a]/20 font-bold">⚔️ {kills} KILLS</span>
                    <span className="bg-red-950/40 text-red-400 px-2 py-1 rounded border border-red-500/10 font-bold">💀 {deaths} DEATHS</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* HALL OF CHAMPIONS LEADERBOARD */}
      <div id="stats-leaderboard-card" className="bg-[#0e1628] border border-[#1a2540] rounded-2xl p-5.5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3 mb-4">
          <div>
            <h3 className="text-[#f5e56b] font-mono text-sm uppercase tracking-wider font-extrabold flex items-center gap-2">
              <span>👑 HALL OF CHAMPIONS LEADERBOARD</span>
              <span className="text-xs bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-sans font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Cloud Live</span>
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time global rankings powered by Firebase Firestore.
            </p>
          </div>

          {/* Leaderboard Actions & Sort Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-[#141c30] p-1 border border-[#2a4060] rounded-xl text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => setLeaderboardSortBy('score')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${leaderboardSortBy === 'score' ? 'bg-[#2a4060] text-[#f5e56b]' : 'text-slate-400 hover:text-white'}`}
              >
                ⚡ Power
              </button>
              <button
                type="button"
                onClick={() => setLeaderboardSortBy('bosses')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${leaderboardSortBy === 'bosses' ? 'bg-[#2a4060] text-red-400' : 'text-slate-400 hover:text-white'}`}
              >
                ⚔️ Bosses
              </button>
              <button
                type="button"
                onClick={() => setLeaderboardSortBy('coins')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${leaderboardSortBy === 'coins' ? 'bg-[#2a4060] text-yellow-400' : 'text-slate-400 hover:text-white'}`}
              >
                🪙 Gold
              </button>
            </div>

            {currentUser ? (
              <button
                type="button"
                onClick={() => onSyncLeaderboard && onSyncLeaderboard()}
                disabled={isSyncingLeaderboard}
                className="text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span className={isSyncingLeaderboard ? 'animate-spin inline-block' : ''}>🔄</span>
                <span>{isSyncingLeaderboard ? 'Syncing...' : 'Sync Score'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAccount}
                className="text-xs bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-blue-300 font-extrabold px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <span>🔑</span>
                <span>Sign In to Rank</span>
              </button>
            )}
          </div>
        </div>

        {/* Guest prompt banner if not logged in */}
        {!currentUser && (
          <div className="mb-4 bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/30 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <span className="text-xs text-slate-300">
                Sign in with <strong className="text-white">Email</strong> or <strong className="text-white">Google</strong> to bind your base account and submit your score of <strong className="text-[#f5e56b]">{powerScore} PS</strong>!
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenAccount}
              className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap shadow-xs"
            >
              Connect Account
            </button>
          </div>
        )}
        
        {/* Leaderboard Entries List */}
        <div className="space-y-2">
          {(() => {
            // Fallback challengers if Firestore is currently empty or loading
            const defaultChallengers: LeaderboardEntry[] = [
              { userId: 'challenger-1', name: 'ZeusBlade', score: 3250, bosses: 7, coins: 50000, avatar: '⚡', title: 'Grand Champion' },
              { userId: 'challenger-2', name: 'ConcentratedFocus', score: 2850, bosses: 5, coins: 34500, avatar: '🔮', title: 'Arcane Adept' },
              { userId: 'challenger-3', name: 'ShadowWraith', score: 2100, bosses: 4, coins: 12000, avatar: '🐉', title: 'Void Stalker' },
              { userId: 'challenger-4', name: 'LichBuster', score: 1450, bosses: 3, coins: 6400, avatar: '🛡️', title: 'Ironclad Sentinel' }
            ];

            // Merge cloud entries with current user entry
            const list: (LeaderboardEntry & { isCurrentPlayer?: boolean })[] = [...(cloudLeaderboard.length > 0 ? cloudLeaderboard : defaultChallengers)];

            // If user is logged in or active, ensure their entry is present in the list
            const currentPlayerName = userProfile?.displayName || currentUser?.displayName || gameState.playerName || 'Hero';
            const currentPlayerAvatar = userProfile?.avatar || '⚔️';
            const currentPlayerTitle = userProfile?.title || 'Grand Champion';
            const currentScore = powerScore;
            const currentBosses = gameState.totalBossesDefeated;
            const currentCoins = Math.floor(gameState.coins);

            const existingIndex = list.findIndex(e => (currentUser && e.userId === currentUser.uid) || (!currentUser && e.name.toLowerCase().includes(currentPlayerName.toLowerCase())));

            if (existingIndex >= 0) {
              list[existingIndex] = {
                ...list[existingIndex],
                name: currentPlayerName,
                avatar: currentPlayerAvatar,
                title: currentPlayerTitle,
                score: Math.max(list[existingIndex].score, currentScore),
                bosses: Math.max(list[existingIndex].bosses, currentBosses),
                coins: Math.max(list[existingIndex].coins, currentCoins),
                isCurrentPlayer: true
              };
            } else {
              list.push({
                userId: currentUser?.uid || 'guest-current',
                name: currentPlayerName,
                avatar: currentPlayerAvatar,
                title: currentPlayerTitle,
                score: currentScore,
                bosses: currentBosses,
                coins: currentCoins,
                isCurrentPlayer: true
              });
            }

            // Sort list based on active filter
            list.sort((a, b) => {
              if (leaderboardSortBy === 'bosses') return b.bosses - a.bosses;
              if (leaderboardSortBy === 'coins') return b.coins - a.coins;
              return b.score - a.score;
            });

            return list.map((entry, index) => {
              let medal = `#${index + 1}`;
              let medalClass = 'text-slate-400 font-mono text-xs';
              if (index === 0) { medal = '🥇'; medalClass = 'text-yellow-400 text-xl'; }
              else if (index === 1) { medal = '🥈'; medalClass = 'text-slate-300 text-xl'; }
              else if (index === 2) { medal = '🥉'; medalClass = 'text-amber-600 text-xl'; }

              const isYou = entry.isCurrentPlayer;

              return (
                <div 
                  key={entry.userId || `${entry.name}-${index}`} 
                  className={`flex items-center justify-between p-3 sm:p-3.5 rounded-xl border transition ${
                    isYou 
                      ? 'bg-blue-600/15 border-blue-500/40 shadow-sm shadow-blue-500/10' 
                      : 'bg-white/5 border-white/5 hover:bg-white/8'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                    <span className={`w-8 sm:w-10 text-center shrink-0 ${medalClass}`}>{medal}</span>
                    <span className="text-xl sm:text-2xl shrink-0">{entry.avatar || '⚔️'}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-xs sm:text-sm font-extrabold truncate ${isYou ? 'text-blue-300' : 'text-slate-200'}`}>
                          {entry.name}
                        </span>
                        {isYou && (
                          <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.5 rounded font-bold">
                            You
                          </span>
                        )}
                        {entry.title && (
                          <span className="text-xs bg-white/5 text-slate-400 border border-white/10 px-1.5 py-0.5 rounded hidden md:inline font-mono">
                            {entry.title}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                        <span className="flex items-center gap-1">
                          <CoinIcon className="w-3.5 h-3.5" />
                          <span>{entry.coins.toLocaleString()} gold</span>
                        </span>
                        {entry.updatedAt && (
                          <span className="text-slate-500 hidden sm:inline">• synced</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-5 text-xs font-mono font-bold shrink-0">
                    <span className="text-slate-300 flex items-center gap-1">
                      <span className="text-red-400">⚔️</span>
                      <span>{entry.bosses}</span>
                      <span className="text-slate-500 hidden sm:inline">bosses</span>
                    </span>
                    <div className="bg-[#141c30] px-2.5 py-1 rounded-lg border border-[#2a4060]/40 text-right">
                      <span className="text-[#f5e56b] block text-xs sm:text-sm font-black">{entry.score.toLocaleString()} PS</span>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};
