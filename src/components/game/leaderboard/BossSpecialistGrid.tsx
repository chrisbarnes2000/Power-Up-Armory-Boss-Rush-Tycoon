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
    <div className="space-y-4">
      <div className="bg-[#0e1628] border border-[#1a2540] rounded-2xl p-4 sm:p-5">
        <div className="border-b border-white/5 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-mono text-sm text-[#f5e56b] uppercase font-bold tracking-wide flex items-center gap-2">
              <span>👹 INDIVIDUAL BOSS SPECIALISTS & BOUNTIES</span>
              <span className="text-[10px] bg-amber-950/60 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                Monthly & Yearly Targets
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Top Executioner (Most Kills) and Undying Challenger (Most Deaths/Perseverance) tracked per boss.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
                className="bg-[#121c32] border border-[#203354] hover:border-blue-500/40 rounded-xl p-3.5 transition flex flex-col justify-between"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{boss.emoji}</span>
                    <div>
                      <h4 className="font-mono text-sm font-bold text-white leading-tight">{boss.id}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">Base HP: {boss.baseHP} • Reward: {boss.reward} 🪙</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">Your Record</span>
                    <span className="text-xs font-mono font-bold">
                      <span className="text-emerald-400">{myKills} K</span> / <span className="text-red-400">{myDeaths} D</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {/* Top Executioner */}
                  <div className="bg-[#182846] p-2 rounded-lg border border-emerald-500/20 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold mb-1">
                      <span>👑 TOP EXECUTIONER</span>
                      <span>⚔️ {topKiller.kills}</span>
                    </div>
                    <div className="truncate text-slate-200 font-bold flex items-center gap-1">
                      <span>{topKiller.avatar}</span>
                      <span className="truncate">{topKiller.name}</span>
                    </div>
                    <span className="text-[9px] text-emerald-300/80 mt-1 block">+15k Gold Bounty</span>
                  </div>

                  {/* Undying Challenger */}
                  <div className="bg-[#182846] p-2 rounded-lg border border-red-500/20 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[10px] text-red-400 font-bold mb-1">
                      <span>💀 MOST DEATHS</span>
                      <span>💀 {mostDeaths.deaths}</span>
                    </div>
                    <div className="truncate text-slate-200 font-bold flex items-center gap-1">
                      <span>{mostDeaths.avatar}</span>
                      <span className="truncate">{mostDeaths.name}</span>
                    </div>
                    <span className="text-[9px] text-red-300/80 mt-1 block">+15k Resilience Prize</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
