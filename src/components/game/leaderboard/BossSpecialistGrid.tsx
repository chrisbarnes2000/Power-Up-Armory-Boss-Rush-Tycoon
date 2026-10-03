import React from 'react';
import { LeaderboardEntry, GameState } from '../../../types';
import { BOSSES } from '../../../data';

export interface BossSpecialistGridProps {
  cloudLeaderboard: LeaderboardEntry[];
  gameState: GameState;
}

export const BossSpecialistGrid: React.FC<BossSpecialistGridProps> = ({
  cloudLeaderboard,
  gameState
}) => {
  // Compute top killer and most deaths per boss across leaderboard entries + local player
  const allEntries: LeaderboardEntry[] = [
    ...cloudLeaderboard,
    {
      userId: 'local-hero',
      name: gameState.playerName || 'You',
      score: gameState.powerScore || 0,
      bosses: gameState.totalBossesDefeated || 0,
      coins: gameState.coins || 0,
      bossKillStats: gameState.bossKillStats || {},
      bossDeathStats: gameState.bossDeathStats || {},
      avatar: '🛡️',
      title: 'Current Player'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-[#141b2c] via-[#0f1726] to-[#0c121e] border border-amber-500/25 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.7)] space-y-5">
      <div className="border-b border-amber-500/20 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">👹</span>
          <div>
            <h3 className="font-mono text-xs sm:text-sm text-amber-300 uppercase font-bold tracking-wider flex items-center gap-2">
              <span>8 WORLD TITAN SPECIALISTS & BOUNTIES</span>
              <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                Codex Ledger
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Top Executioners (Fatal Blows) and Undying Challengers (Perseverance) chronicled across the gauntlet.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
        {BOSSES.map(boss => {
          // Find top executioner (most kills for this boss)
          let topKiller: { name: string; kills: number; avatar?: string } = { name: 'None Yet', kills: 0, avatar: '⚔️' };
          let mostDeaths: { name: string; deaths: number; avatar?: string } = { name: 'None Yet', deaths: 0, avatar: '💀' };

          allEntries.forEach(entry => {
            const k = entry.bossKillStats?.[boss.id] || 0;
            const d = entry.bossDeathStats?.[boss.id] || 0;

            if (k > topKiller.kills) {
              topKiller = { name: entry.name, kills: k, avatar: entry.avatar || '👑' };
            }
            if (d > mostDeaths.deaths) {
              mostDeaths = { name: entry.name, deaths: d, avatar: entry.avatar || '💀' };
            }
          });

          const myKills = gameState.bossKillStats?.[boss.id] || 0;
          const myDeaths = gameState.bossDeathStats?.[boss.id] || 0;

          return (
            <div 
              key={boss.id} 
              className="bg-[#101828]/90 border border-amber-500/20 hover:border-amber-400/50 rounded-2xl p-3.5 sm:p-4 transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md group"
            >
              <div className="border-b border-white/5 pb-2.5 mb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl p-1.5 bg-black/40 rounded-xl border border-white/5 shrink-0">{boss.emoji}</span>
                    <div className="min-w-0">
                      <h4 className="font-mono text-xs sm:text-sm font-bold text-white truncate group-hover:text-amber-200 transition-colors">
                        {boss.id}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono block truncate">
                        HP: {boss.baseHP.toLocaleString()} · Reward: {boss.reward.toLocaleString()} 🪙
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-[10px] text-slate-400">Your Combat Record:</span>
                  <span className="font-bold">
                    <span className="text-emerald-400">{myKills} Kills</span> · <span className="text-red-400">{myDeaths} Deaths</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {/* Top Executioner */}
                <div className="bg-[#142035] p-2.5 rounded-xl border border-emerald-500/30 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold mb-1">
                    <span>👑 EXECUTIONER</span>
                    <span>⚔️ {topKiller.kills}</span>
                  </div>
                  <div className="truncate text-slate-200 font-bold flex items-center gap-1 text-[11px]">
                    <span>{topKiller.avatar}</span>
                    <span className="truncate">{topKiller.name}</span>
                  </div>
                  <span className="text-[9px] text-emerald-300/80 mt-1 block font-mono font-semibold">+15k Gold</span>
                </div>

                {/* Undying Challenger */}
                <div className="bg-[#142035] p-2.5 rounded-xl border border-red-500/30 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] text-red-400 font-bold mb-1">
                    <span>💀 UNDYING</span>
                    <span>💀 {mostDeaths.deaths}</span>
                  </div>
                  <div className="truncate text-slate-200 font-bold flex items-center gap-1 text-[11px]">
                    <span>{mostDeaths.avatar}</span>
                    <span className="truncate">{mostDeaths.name}</span>
                  </div>
                  <span className="text-[9px] text-red-300/80 mt-1 block font-mono font-semibold">+15k Prize</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
