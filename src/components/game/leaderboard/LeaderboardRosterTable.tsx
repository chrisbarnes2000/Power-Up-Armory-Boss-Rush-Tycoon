import React from 'react';
import { LeaderboardEntry, GameState } from '../../../types';
import { LeaderboardCategory } from './LeaderboardCategoryNav';

export interface LeaderboardRosterTableProps {
  cloudLeaderboard: LeaderboardEntry[];
  gameState: GameState;
  activeCategory: LeaderboardCategory;
  currentUser?: any;
}

export const LeaderboardRosterTable: React.FC<LeaderboardRosterTableProps> = ({
  cloudLeaderboard,
  gameState,
  activeCategory,
  currentUser
}) => {
  // Merge cloud entries with fallbacks (avoiding duplicate userIds)
  const entriesMap = new Map<string, LeaderboardEntry>();
  
  cloudLeaderboard.forEach(e => entriesMap.set(e.userId || e.name, e));

  // Ensure current user is in the list
  const currentTotalDeaths = gameState.totalDeaths || (
    Object.values(gameState.bossDeathStats || {}).reduce<number>((a, b) => a + (Number(b) || 0), 0)
  );

  const localUserEntry: LeaderboardEntry = {
    userId: currentUser?.uid || 'local-player',
    name: gameState.playerName || 'You',
    score: gameState.powerScore || 0,
    bosses: gameState.totalBossesDefeated || 0,
    coins: gameState.coins || 0,
    gems: gameState.gems || 0,
    maxDamage: gameState.maxDamage || 0,
    totalDodges: gameState.totalDodges || 0,
    totalSpecials: gameState.totalSpecials || 0,
    totalDeaths: currentTotalDeaths,
    avatar: '🛡️',
    title: 'Champion'
  };

  entriesMap.set(localUserEntry.userId || 'local-player', localUserEntry);

  const allEntries = Array.from(entriesMap.values());

  // Sort comparator based on activeCategory
  const getMetricValue = (entry: LeaderboardEntry): number => {
    switch (activeCategory) {
      case 'power':
        return entry.score || 0;
      case 'kills':
        return entry.bosses || entry.totalKills || 0;
      case 'deaths':
        return entry.totalDeaths || 0;
      case 'max_damage':
        return entry.maxDamage || 0;
      case 'dodges':
        return entry.totalDodges || 0;
      case 'specials':
        return entry.totalSpecials || 0;
      case 'gold':
        return entry.totalGoldEarned || entry.coins || 0;
      case 'gems':
        return entry.totalGemsEarned || entry.gems || 0;
      default:
        return entry.score || 0;
    }
  };

  const sortedEntries = allEntries.sort((a, b) => getMetricValue(b) - getMetricValue(a));

  const getMetricLabel = (entry: LeaderboardEntry): string => {
    const val = getMetricValue(entry);
    switch (activeCategory) {
      case 'power':
        return `${val.toLocaleString()} PS`;
      case 'kills':
        return `${val} Kills`;
      case 'deaths':
        return `${val} Deaths`;
      case 'max_damage':
        return `${val} DMG`;
      case 'dodges':
        return `${val} Dodges`;
      case 'specials':
        return `${val} Specials`;
      case 'gold':
        return `${val.toLocaleString()} 🪙`;
      case 'gems':
        return `${val.toLocaleString()} 💎`;
      default:
        return `${val.toLocaleString()}`;
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#141b2c] via-[#0f1726] to-[#0c121e] border border-amber-500/25 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.7)] space-y-4">
      <div className="border-b border-amber-500/20 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏆</span>
          <div>
            <h3 className="text-xs uppercase font-mono font-bold text-amber-300 tracking-wider flex items-center gap-1.5">
              <span>CODEX ROSTER · SORTED BY</span>
              <span className="text-white font-black bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-500/30">
                {activeCategory.replace('_', ' ').toUpperCase()}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Verified realm contenders competing in the active seasonal horizon.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-amber-200/80 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 font-bold">
            {sortedEntries.length} Active Contenders
          </span>
        </div>
      </div>

      <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1 scrollbar-thin">
        {sortedEntries.map((entry, idx) => {
          const isMe = (currentUser && entry.userId === currentUser.uid) || entry.userId === 'local-player';
          const rank = idx + 1;
          const isTop3 = rank <= 3;
          const rankBadge = rank === 1 ? '🥇 1st' : rank === 2 ? '🥈 2nd' : rank === 3 ? '🥉 3rd' : `#${rank}`;
          const rankTitle = rank === 1 ? 'Sovereign Champion' : rank === 2 ? 'Grand Archon' : rank === 3 ? 'Astral Sentinel' : entry.title || 'Warrior';

          return (
            <div
              key={entry.userId || `${entry.name}-${idx}`}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200 gap-3 sm:gap-4 ${
                isMe
                  ? 'bg-gradient-to-r from-amber-950/40 via-blue-950/50 to-[#121c32] border-amber-400/60 shadow-lg ring-1 ring-amber-400/40'
                  : isTop3
                  ? 'bg-[#121a2c]/90 border-amber-500/30 hover:border-amber-400/60 hover:bg-[#16223a]'
                  : 'bg-[#0e1524]/80 border-white/5 hover:border-amber-500/20 hover:bg-[#121b2e]'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className={`font-mono text-xs font-black px-2.5 py-1.5 rounded-xl shrink-0 text-center min-w-[54px] shadow-sm select-none ${
                    rank === 1
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-black shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                      : rank === 2
                      ? 'bg-gradient-to-r from-slate-200 to-slate-400 text-black'
                      : rank === 3
                      ? 'bg-gradient-to-r from-amber-700 to-amber-800 text-amber-100 border border-amber-500/40'
                      : 'bg-black/50 text-slate-400 border border-white/5'
                  }`}
                >
                  {rankBadge}
                </span>

                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl shrink-0 p-1.5 bg-black/40 rounded-xl border border-white/5">{entry.avatar || '🛡️'}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-white truncate">
                        {entry.name}
                      </span>
                      {isMe && (
                        <span className="text-[10px] bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black px-2 py-0.5 rounded-full font-mono shadow-xs">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-amber-200/60 font-mono mt-0.5 truncate">
                      <span>{rankTitle}</span>
                      {entry.score ? (
                        <>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-400 font-mono">{entry.score.toLocaleString()} PS</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                <div className="hidden md:block text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">Gauntlet Record</span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    <span className="text-emerald-400">{entry.bosses || 0} Wins</span> · <span className="text-red-400">{entry.totalDeaths || 0} Deaths</span>
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-sm sm:text-base font-black text-amber-300 block tabular-nums">
                    {getMetricLabel(entry)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block sm:hidden">
                    K/D: {entry.bosses || 0}W / {entry.totalDeaths || 0}L
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
