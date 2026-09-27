import React from 'react';

export type SeasonMode = 'monthly' | 'yearly' | 'alltime';

export interface LeaderboardSeasonHeaderProps {
  seasonMode: SeasonMode;
  onSeasonChange: (mode: SeasonMode) => void;
  currentUser?: any;
  onSyncLeaderboard?: () => Promise<void>;
  isSyncingLeaderboard?: boolean;
  onOpenAccount?: () => void;
  powerScore: number;
}

export const LeaderboardSeasonHeader: React.FC<LeaderboardSeasonHeaderProps> = ({
  seasonMode,
  onSeasonChange,
  currentUser,
  onSyncLeaderboard,
  isSyncingLeaderboard = false,
  onOpenAccount,
  powerScore
}) => {
  const now = new Date();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthName = monthNames[now.getMonth()];
  const currentYear = now.getFullYear();

  // Days remaining in current month
  const daysInMonth = new Date(currentYear, now.getMonth() + 1, 0).getDate();
  const daysLeftInMonth = Math.max(1, daysInMonth - now.getDate());

  return (
    <div className="bg-gradient-to-r from-[#0d172c] via-[#101e38] to-[#0a1224] border border-[#203354] rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl">🏆</span>
            <h2 className="text-base sm:text-lg font-black font-mono text-white tracking-wide flex items-center gap-2">
              <span>LEADERBOARD & SEASONAL REWARDS</span>
              <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-sans font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Cloud Live</span>
              </span>
            </h2>
          </div>

          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap font-mono">
            {seasonMode === 'monthly' && (
              <>
                <span className="text-cyan-400 font-bold">📅 {currentMonthName} {currentYear} Season</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400 font-bold">⏳ {daysLeftInMonth} Days Remaining</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-bold">🎁 225k Gold + 4,500 Gems Prize Pool</span>
              </>
            )}
            {seasonMode === 'yearly' && (
              <>
                <span className="text-amber-400 font-bold">👑 {currentYear} Grand Championship</span>
                <span className="text-slate-600">•</span>
                <span className="text-purple-400 font-bold">🌟 Annual Sovereign Titles</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-bold">🎁 350k Gold + 7,500 Gems Prize Pool</span>
              </>
            )}
            {seasonMode === 'alltime' && (
              <>
                <span className="text-yellow-400 font-bold">🏛️ Eternal Hall of Champions</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300">Lifetime Armory Records</span>
              </>
            )}
          </p>
        </div>

        {/* Season Timeframe Switcher & Cloud Sync Trigger */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex bg-[#0b1322] p-1 border border-[#203354] rounded-xl text-xs font-mono font-bold shadow-inner">
            <button
              type="button"
              onClick={() => onSeasonChange('monthly')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                seasonMode === 'monthly'
                  ? 'bg-blue-600 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>📅</span>
              <span>Monthly</span>
            </button>
            <button
              type="button"
              onClick={() => onSeasonChange('yearly')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                seasonMode === 'yearly'
                  ? 'bg-amber-600 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>👑</span>
              <span>Yearly</span>
            </button>
            <button
              type="button"
              onClick={() => onSeasonChange('alltime')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                seasonMode === 'alltime'
                  ? 'bg-purple-600 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🏛️</span>
              <span>All-Time</span>
            </button>
          </div>

          {currentUser ? (
            <button
              type="button"
              onClick={() => onSyncLeaderboard && onSyncLeaderboard()}
              disabled={isSyncingLeaderboard}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <span className={isSyncingLeaderboard ? 'animate-spin inline-block' : ''}>🔄</span>
              <span>{isSyncingLeaderboard ? 'Syncing...' : 'Sync Score'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAccount}
              className="text-xs bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-blue-300 font-extrabold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <span>🔑</span>
              <span>Sign In to Rank ({powerScore} PS)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
