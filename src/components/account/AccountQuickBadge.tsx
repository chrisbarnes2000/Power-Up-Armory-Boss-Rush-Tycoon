import React from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile, GameState } from '../../types';
import { LogOut, RefreshCw, Trophy, CheckCircle } from 'lucide-react';

interface AccountQuickBadgeProps {
  currentUser: FirebaseUser;
  userProfile: UserProfile | null;
  gameState: GameState;
  selectedAvatar: string;
  isEditMode: boolean;
  isAdminUser: boolean;
  syncingScore: boolean;
  loading: boolean;
  onEditToggle: () => void;
  onManualSync: () => void;
  onSignOut: () => void;
}

export const AccountQuickBadge: React.FC<AccountQuickBadgeProps> = ({
  currentUser,
  userProfile,
  gameState,
  selectedAvatar,
  isEditMode,
  isAdminUser,
  syncingScore,
  loading,
  onEditToggle,
  onManualSync,
  onSignOut
}) => {
  return (
    <div className="bg-[#141f35] border border-[#2a4060] rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{selectedAvatar}</span>
        <div>
          <div className="font-extrabold text-white text-base flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span>{userProfile?.displayName || currentUser.displayName || gameState.playerName}</span>
            <span className="text-[10px] sm:text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-mono shrink-0">
              {userProfile?.title || 'Grand Champion'}
            </span>
            {!isEditMode && (
              <button
                type="button"
                onClick={onEditToggle}
                className="text-[10px] sm:text-xs bg-blue-600/20 hover:bg-blue-600/40 border border-blue-400/30 text-blue-300 px-2.5 py-0.5 rounded-full font-bold transition cursor-pointer flex items-center gap-1 shadow-xs ml-1 shrink-0"
                title="Edit display name, avatar, and title"
              >
                <span>✏️</span>
                <span>Edit</span>
              </button>
            )}
          </div>
          <div className="text-xs text-slate-400 font-mono flex flex-wrap items-center gap-2 mt-0.5">
            <span>{currentUser.email}</span>
            {currentUser.emailVerified && (
              <span className="text-emerald-400 text-[10px] sm:text-xs flex items-center gap-0.5">
                <CheckCircle className="w-3 h-3 inline" /> Verified
              </span>
            )}
            {isAdminUser && (
              <span className="text-red-300 bg-red-950/60 border border-red-500/40 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                <span>🛡️</span> Admin
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Account Cloud Actions (Leaderboard Sync & Sign Out) */}
      <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto items-stretch md:items-end shrink-0">
        <button
          type="button"
          onClick={onManualSync}
          disabled={syncingScore}
          className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 font-mono font-extrabold text-[11px] sm:text-xs rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm shrink-0"
          title="Update your live Power Score and stats to the Hall of Champions"
        >
          {syncingScore ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trophy className="w-3.5 h-3.5" />}
          <span>Sync Leaderboard</span>
        </button>

        <button
          type="button"
          onClick={onSignOut}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/70 border border-red-500/20 px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
