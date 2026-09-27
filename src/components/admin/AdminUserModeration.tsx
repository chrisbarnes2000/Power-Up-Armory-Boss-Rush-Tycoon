import React from 'react';
import { LeaderboardEntry } from '../../types';

interface AdminUserModerationProps {
  playerList: LeaderboardEntry[];
  loadingPlayers: boolean;
  playerSearch: string;
  setPlayerSearch: (term: string) => void;
  fetchPlayers: () => Promise<void>;
  wipeNotice: string | null;
  setWipeNotice: (notice: string | null) => void;
  confirmWipeUser: { userId: string; action: 'leaderboard' | 'account'; name: string } | null;
  setConfirmWipeUser: (user: { userId: string; action: 'leaderboard' | 'account'; name: string } | null) => void;
  handleWipeFromLeaderboard: (userId: string, name: string) => Promise<void>;
  handleResetAccountStats: (userId: string, name: string) => Promise<void>;
  onOpenConfirmWipe: () => void;
  userStoreStatuses?: { [userId: string]: boolean };
  onToggleArmoryStore?: (userId: string) => Promise<void>;
}

export default function AdminUserModeration({
  playerList,
  loadingPlayers,
  playerSearch,
  setPlayerSearch,
  fetchPlayers,
  wipeNotice,
  setWipeNotice,
  confirmWipeUser,
  setConfirmWipeUser,
  handleWipeFromLeaderboard,
  handleResetAccountStats,
  onOpenConfirmWipe,
  userStoreStatuses = {},
  onToggleArmoryStore
}: AdminUserModerationProps) {
  const filteredPlayers = playerList.filter(p => {
    const q = playerSearch.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.userId && p.userId.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-linear-to-b from-red-950/30 via-[#14121e] to-[#0d0f18] border border-red-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base text-red-400">⚠️</span>
            <h3 className="font-mono text-xs text-red-400 font-extrabold uppercase tracking-widest">
              USER & LEADERBOARD PURGE MANAGEMENT
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Search and wipe requested usernames from the global Hall of Champions leaderboard, or reset player cloud stats upon user request.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenConfirmWipe}
          className="px-4 py-2 bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-500/40 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer shrink-0 shadow-sm"
          title="Wipe local device character state"
        >
          <span>🗑️</span>
          <span>Reset Local Device</span>
        </button>
      </div>

      {/* Notification alert */}
      {wipeNotice && (
        <div className="px-3.5 py-2 rounded-xl bg-red-950/70 border border-red-500/40 text-xs text-red-200 font-mono flex items-center justify-between shadow-md">
          <span>🛡️ {wipeNotice}</span>
          <button onClick={() => setWipeNotice(null)} className="text-slate-400 hover:text-white px-1 cursor-pointer">✕</button>
        </div>
      )}

      {/* Search filter and refresh */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Filter player username, title, or UID..."
            value={playerSearch}
            onChange={(e) => setPlayerSearch(e.target.value)}
            className="w-full bg-[#0c101c] text-xs text-slate-200 border border-[#2a4060] rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:border-red-500/60 font-mono placeholder:text-slate-500"
          />
          {playerSearch && (
            <button 
              onClick={() => setPlayerSearch('')} 
              className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={fetchPlayers}
          disabled={loadingPlayers}
          className="px-3.5 py-2 bg-[#172238] hover:bg-[#203050] text-slate-200 border border-[#2a4060] rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 shrink-0"
        >
          <span className={loadingPlayers ? 'animate-spin' : ''}>🔄</span>
          <span>Refresh ({filteredPlayers.length})</span>
        </button>
      </div>

      {/* List of accounts to wipe or reset */}
      {filteredPlayers.length === 0 ? (
        <div className="bg-black/30 border border-white/5 rounded-xl p-6 text-center text-slate-400 text-xs font-mono">
          {playerList.length === 0 ? 'No players currently recorded on the Hall of Champions leaderboard.' : 'No users match your search query.'}
        </div>
      ) : (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {filteredPlayers.map((player) => (
            <div
              key={player.userId}
              className="bg-black/40 border border-white/10 hover:border-red-500/30 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">{player.avatar || '⚔️'}</span>
                  <span className="font-mono text-xs font-bold text-white">{player.name}</span>
                  {player.title && (
                    <span className="text-[10px] sm:text-xs text-amber-300/80 bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                      {player.title}
                    </span>
                  )}
                  <span className="text-[10px] sm:text-xs text-slate-500 font-mono">UID: {player.userId.slice(0, 8)}...</span>
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 font-mono flex flex-wrap gap-x-3">
                  <span>Score: <strong className="text-emerald-400">{player.score?.toLocaleString() ?? 0}</strong></span>
                  <span>Bosses: <strong className="text-blue-400">{player.bosses ?? 0}</strong></span>
                  <span>Coins: <strong className="text-yellow-400">{player.coins?.toLocaleString() ?? 0}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {confirmWipeUser?.userId === player.userId ? (
                  <div className="flex items-center gap-1.5 bg-red-950/90 border border-red-500/50 rounded-lg p-1 animate-fadeIn">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirmWipeUser.action === 'leaderboard') {
                          handleWipeFromLeaderboard(player.userId, player.name);
                        } else {
                          handleResetAccountStats(player.userId, player.name);
                        }
                      }}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold rounded transition cursor-pointer shadow-sm"
                    >
                      Confirm {confirmWipeUser.action === 'leaderboard' ? 'Wipe' : 'Reset'}?
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmWipeUser(null)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded transition cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onToggleArmoryStore?.(player.userId)}
                      className={`px-2.5 py-1.5 border rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                        userStoreStatuses[player.userId]
                          ? 'bg-emerald-950/60 hover:bg-emerald-900/60 border-emerald-500/40 text-emerald-300 hover:text-emerald-200'
                          : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-700/40 text-slate-400 hover:text-slate-300'
                      }`}
                      title={userStoreStatuses[player.userId] ? 'Armory Store is ENABLED for this user. Click to disable.' : 'Armory Store is DISABLED for this user. Click to enable.'}
                    >
                      🛒 {userStoreStatuses[player.userId] ? 'Armory: ON' : 'Armory: OFF'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmWipeUser({ userId: player.userId, action: 'leaderboard', name: player.name })}
                      className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white border border-red-500/30 rounded-lg text-xs font-mono font-bold transition cursor-pointer"
                      title="Remove from Leaderboard rankings"
                    >
                      Wipe Rank
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmWipeUser({ userId: player.userId, action: 'account', name: player.name })}
                      className="px-2.5 py-1.5 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 hover:text-white border border-amber-500/30 rounded-lg text-xs font-mono font-bold transition cursor-pointer"
                      title="Reset powerScore, bosses, and coins to 0"
                    >
                      Reset Stats
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
