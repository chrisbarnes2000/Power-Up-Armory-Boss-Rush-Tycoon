import React from 'react';
import { BookOpen, Sparkles, RefreshCw, Shield, Crown, Share2 } from 'lucide-react';

export type SeasonMode = 'monthly' | 'yearly' | 'alltime';

export interface LeaderboardSeasonHeaderProps {
  seasonMode: SeasonMode;
  onSeasonChange: (mode: SeasonMode) => void;
  currentUser?: any;
  onSyncLeaderboard?: () => Promise<void>;
  isSyncingLeaderboard?: boolean;
  onOpenAccount?: () => void;
  powerScore: number;
  onOpenLoreBook?: () => void;
  onOpenShareCard?: () => void;
}

export const LeaderboardSeasonHeader: React.FC<LeaderboardSeasonHeaderProps> = ({
  seasonMode,
  onSeasonChange,
  currentUser,
  onSyncLeaderboard,
  isSyncingLeaderboard = false,
  onOpenAccount,
  powerScore,
  onOpenLoreBook,
  onOpenShareCard
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
    <div className="bg-gradient-to-r from-[#16120c] via-[#121c2e] to-[#0d1626] border border-amber-500/35 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(251,191,36,0.25)] relative overflow-hidden">
      {/* Ancient ambient glows */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 relative z-10">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-900 border border-amber-400/40 flex items-center justify-center text-xl shadow-lg shrink-0">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 tracking-wider">
                  HALL OF CHAMPIONS · ETERNAL CODEX
                </h2>
                <span className="text-[10px] bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Cloud Synchronized</span>
                </span>
              </div>
              <p className="text-xs text-amber-200/70 font-mono tracking-wide mt-0.5">
                SEASONAL ASCENSION · HEROIC LEADERBOARDS · TITAN BOUNTIES
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-300 mt-2.5 flex items-center gap-2.5 flex-wrap font-mono bg-black/30 px-3 py-1.5 rounded-xl border border-white/5 w-fit">
            {seasonMode === 'monthly' && (
              <>
                <span className="text-amber-300 font-bold flex items-center gap-1">
                  <span>📅</span>
                  <span>{currentMonthName} {currentYear} Horizon</span>
                </span>
                <span className="text-amber-500/40">·</span>
                <span className="text-cyan-300 font-bold flex items-center gap-1">
                  <span>⏳</span>
                  <span>{daysLeftInMonth} Days Remaining</span>
                </span>
                <span className="text-amber-500/40">·</span>
                <span className="text-emerald-300 font-bold flex items-center gap-1">
                  <span>🎁</span>
                  <span>225,000 🪙 + 4,500 💎 Prize Pool</span>
                </span>
              </>
            )}
            {seasonMode === 'yearly' && (
              <>
                <span className="text-amber-300 font-bold flex items-center gap-1">
                  <span>👑</span>
                  <span>{currentYear} Grand Championship</span>
                </span>
                <span className="text-amber-500/40">·</span>
                <span className="text-purple-300 font-bold flex items-center gap-1">
                  <span>🌟</span>
                  <span>Annual Sovereign Titles</span>
                </span>
                <span className="text-amber-500/40">·</span>
                <span className="text-emerald-300 font-bold flex items-center gap-1">
                  <span>🎁</span>
                  <span>350,000 🪙 + 7,500 💎 Prize Pool</span>
                </span>
              </>
            )}
            {seasonMode === 'alltime' && (
              <>
                <span className="text-yellow-300 font-bold flex items-center gap-1">
                  <span>🏛️</span>
                  <span>Eternal Sovereign Legends</span>
                </span>
                <span className="text-amber-500/40">·</span>
                <span className="text-slate-300">Immortal Realm Records & High Scores</span>
              </>
            )}
          </div>
        </div>

        {/* Season Horizon Timeframe Switcher & Cloud Sync Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Season Mode Switcher Tabs */}
          <div className="flex bg-[#0a0f1d] p-1.5 border border-amber-500/30 rounded-2xl text-xs font-mono font-bold shadow-inner">
            <button
              type="button"
              onClick={() => onSeasonChange('monthly')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 select-none ${
                seasonMode === 'monthly'
                  ? 'bg-gradient-to-r from-blue-700 to-cyan-600 text-white shadow-md border border-cyan-400/40 font-black scale-102'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>📅</span>
              <span>Monthly</span>
            </button>
            <button
              type="button"
              onClick={() => onSeasonChange('yearly')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 select-none ${
                seasonMode === 'yearly'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-amber-50 shadow-md border border-amber-300/40 font-black scale-102'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>👑</span>
              <span>Yearly</span>
            </button>
            <button
              type="button"
              onClick={() => onSeasonChange('alltime')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 select-none ${
                seasonMode === 'alltime'
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md border border-purple-400/40 font-black scale-102'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>🏛️</span>
              <span>All-Time</span>
            </button>
          </div>

          {/* Lore Book Codex Quick Link */}
          {onOpenLoreBook && (
            <button
              type="button"
              onClick={() => onOpenLoreBook && onOpenLoreBook()}
              className="text-xs bg-gradient-to-r from-amber-950/80 to-[#1e150a] hover:from-amber-900/90 hover:to-[#2b1e0f] border border-amber-500/40 text-amber-200 font-bold px-3.5 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
              title="Open Seasonal Ranks Lore & Codex Summary"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Season Lore</span>
            </button>
          )}

          {/* Dynamic Vector Share Card Studio */}
          {onOpenShareCard && (
            <button
              type="button"
              onClick={onOpenShareCard}
              className="text-xs bg-gradient-to-r from-cyan-950/80 to-[#0e1c2b] hover:from-cyan-900/90 hover:to-[#14283d] border border-cyan-500/40 text-cyan-200 font-bold px-3.5 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
              title="Open Dynamic Vector Share Card Studio"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Share Card</span>
            </button>
          )}

          {/* Sync / Sign-in Action */}
          {currentUser ? (
            <button
              type="button"
              onClick={() => onSyncLeaderboard && onSyncLeaderboard()}
              disabled={isSyncingLeaderboard}
              className="text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 border border-emerald-400/30"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLeaderboard ? 'animate-spin' : ''}`} />
              <span>{isSyncingLeaderboard ? 'Synchronizing...' : 'Sync Score'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAccount}
              className="text-xs bg-gradient-to-r from-blue-900/60 to-cyan-900/60 hover:from-blue-800/80 hover:to-cyan-800/80 border border-cyan-400/40 text-cyan-200 font-extrabold px-3.5 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sign In to Rank ({powerScore.toLocaleString()} PS)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
