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
  // Built-in challenger base entries if leaderboard has few entries
  const fallbackChallengers: LeaderboardEntry[] = [
    {
      userId: 'challenger-1',
      name: 'ZeusBlade',
      score: 3850,
      bosses: 18,
      coins: 145000,
      gems: 850,
      maxDamage: 1250,
      totalDodges: 48,
      totalSpecials: 32,
      totalDeaths: 12,
      avatar: '⚡',
      title: 'Grand Champion'
    },
    {
      userId: 'challenger-2',
      name: 'ConcentratedFocus',
      score: 3100,
      bosses: 14,
      coins: 98000,
      gems: 620,
      maxDamage: 980,
      totalDodges: 62,
      totalSpecials: 28,
      totalDeaths: 8,
      avatar: '🔮',
      title: 'Arcane Adept'
    },
    {
      userId: 'challenger-3',
      name: 'ShadowWraith',
      score: 2450,
      bosses: 9,
      coins: 54000,
      gems: 410,
      maxDamage: 720,
      totalDodges: 85,
      totalSpecials: 19,
      totalDeaths: 22,
      avatar: '🐉',
      title: 'Void Stalker'
    },
    {
      userId: 'challenger-4',
      name: 'IroncladVanguard',
      score: 1850,
      bosses: 6,
      coins: 28000,
      gems: 240,
      maxDamage: 540,
      totalDodges: 24,
      totalSpecials: 14,
      totalDeaths: 35,
      avatar: '🛡️',
      title: 'Ironclad Sentinel'
    },
    {
      userId: 'challenger-5',
      name: 'PhoenixRebirth',
      score: 1250,
      bosses: 4,
      coins: 14000,
      gems: 150,
      maxDamage: 380,
      totalDodges: 18,
      totalSpecials: 11,
      totalDeaths: 15,
      avatar: '🔥',
      title: 'Flame Adept'
    }
  ];

  // Merge cloud entries with fallbacks (avoiding duplicate userIds)
  const entriesMap = new Map<string, LeaderboardEntry>();
  
  fallbackChallengers.forEach(e => entriesMap.set(e.userId || e.name, e));
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
    <div className="bg-[#0e1628] border border-[#1a2540] rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
      <div className="border-b border-white/5 pb-2.5 flex items-center justify-between">
        <h3 className="text-xs uppercase font-mono font-bold text-slate-400">
          Rankings sorted by <span className="text-cyan-400 font-black uppercase">{activeCategory.replace('_', ' ')}</span>
        </h3>
        <span className="text-[11px] font-mono text-slate-500">
          {sortedEntries.length} Active Contenders
        </span>
      </div>

      <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
        {sortedEntries.map((entry, idx) => {
          const isMe = (currentUser && entry.userId === currentUser.uid) || entry.userId === 'local-player';
          const rank = idx + 1;
          const isTop3 = rank <= 3;
          const rankBadge = rank === 1 ? '🥇 1st' : rank === 2 ? '🥈 2nd' : rank === 3 ? '🥉 3rd' : `#${rank}`;

          return (
            <div
              key={entry.userId || `${entry.name}-${idx}`}
              className={`flex items-center justify-between p-3 rounded-xl border transition ${
                isMe
                  ? 'bg-blue-950/60 border-blue-500/50 shadow-md ring-1 ring-blue-400/30'
                  : isTop3
                  ? 'bg-[#131f38] border-amber-500/20 hover:border-amber-500/40'
                  : 'bg-white/5 border-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`font-mono text-xs font-black px-2 py-1 rounded-lg shrink-0 ${
                    rank === 1
                      ? 'bg-amber-400 text-black shadow-sm'
                      : rank === 2
                      ? 'bg-slate-300 text-black'
                      : rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-black/40 text-slate-400'
                  }`}
                >
                  {rankBadge}
                </span>

                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg shrink-0">{entry.avatar || '🛡️'}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-white truncate">
                        {entry.name}
                      </span>
                      {isMe && (
                        <span className="text-[9px] bg-blue-500 text-white font-black px-1.5 py-0.2 rounded font-mono">
                          YOU
                        </span>
                      )}
                    </div>
                    {entry.title && (
                      <span className="text-[10px] text-slate-400 block truncate font-sans">
                        {entry.title}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 pl-2">
                <span className="font-mono text-xs sm:text-sm font-black text-amber-300 block">
                  {getMetricLabel(entry)}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block">
                  K/D: {entry.bosses || 0}W / {entry.totalDeaths || 0}L
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
