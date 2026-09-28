import React, { useState } from 'react';
import { Users, Copy, Check, Share2, Sparkles, Shield, Gift, AlertCircle, ArrowRight } from 'lucide-react';
import { GameState, UserProfile } from '../../types';
import { CoinIcon } from '../CoinIcon';
import { trackSquadInvite } from '../../lib/analytics';

interface SquadRecruitSectionProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  userProfile: UserProfile | null;
  onSaveState?: (state: GameState) => void;
  onRedeemInviteCode: (code: string) => { success: boolean; message: string };
}

export const SquadRecruitSection: React.FC<SquadRecruitSectionProps> = ({
  gameState,
  setGameState,
  userProfile,
  onRedeemInviteCode
}) => {
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Generate or retrieve the player's personal invite code
  const myInviteCode = 
    gameState.inviteCode || 
    userProfile?.inviteCode || 
    `ARMORY-${(userProfile?.userId || gameState.playerName || 'CHAMP').replace(/[^A-Za-z0-9]/g, '').slice(0, 5).toUpperCase() || 'HERO7'}`;

  const recruitsCount = gameState.squadRecruitsCount || userProfile?.squadRecruitsCount || 0;
  const hasBeenInvited = !!gameState.invitedByCode || !!userProfile?.invitedByCode;

  const getInviteUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://rapprt.space';
    return `${origin}/?invite=${myInviteCode}&utm_source=squad_invite&utm_medium=p2p_share&utm_campaign=squad_recruitment&ref=${myInviteCode}`;
  };

  const handleCopyCode = async () => {
    const inviteUrl = getInviteUrl();
    try {
      await navigator.clipboard.writeText(myInviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }

    trackSquadInvite('shared', myInviteCode, {
      method: 'clipboard',
      invite_url: inviteUrl
    });
  };

  const handleShareInvite = async () => {
    const inviteUrl = getInviteUrl();
    const shareText = `⚔️ Join my Raid Squad on Power-Up Armory! Use my invite code [${myInviteCode}] to claim +3,000 Coins & +150 Gems bonus!`;

    trackSquadInvite('shared', myInviteCode, {
      method: 'native_share',
      invite_url: inviteUrl
    });

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Power-Up Armory Raid Squad Invite',
          text: shareText,
          url: inviteUrl
        });
      } catch (err) {
        console.log('Share dismissed:', err);
      }
    } else {
      handleCopyCode();
    }
  };

  const handleSubmitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    const res = onRedeemInviteCode(inputCode.trim());
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
      setInputCode('');
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
    setTimeout(() => setStatusMessage(null), 6000);
  };

  return (
    <div className="mt-5 bg-linear-to-b from-[#11192e] via-[#0d1424] to-[#080d1a] border border-cyan-500/30 rounded-2xl p-3.5 sm:p-4.5 space-y-3.5 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h3 className="font-mono text-xs text-cyan-300 font-extrabold uppercase tracking-widest">
            SQUAD RECRUITMENT & CO-OP INVITES
          </h3>
        </div>
        <span className="text-[9px] font-mono font-black text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
          Squad Tier: {Math.floor(recruitsCount / 3) + 1}
        </span>
      </div>

      <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-sans">
        Recruit fellow champions with your unique invite code. Both you and your recruit receive a <strong className="text-yellow-400 font-mono">+3,000 Coins</strong> and <strong className="text-sky-300 font-mono">+150 Gems</strong> squad bonus!
      </p>

      {/* 2-Column Grid: Your Invite Code & Redeem Friend's Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        
        {/* Card 1: Your Personal Invite Code */}
        <div className="bg-[#080e1d] border border-cyan-500/30 rounded-xl p-3 flex flex-col justify-between space-y-2.5">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <span>🛡️</span> Your Squad Invite Code:
            </span>
            <div className="mt-1.5 flex items-center justify-between bg-black/60 border border-cyan-500/40 rounded-lg p-2">
              <span className="font-mono text-sm sm:text-base font-black text-cyan-300 tracking-widest">
                {myInviteCode}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded text-[10px] font-mono font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Copy Invite Code"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareInvite}
                  className="p-1 bg-amber-950/80 hover:bg-amber-900/80 border border-amber-500/40 text-amber-300 rounded text-[10px] transition cursor-pointer"
                  title="Share Invite"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
            <span>Champions Recruited:</span>
            <span className="text-white font-bold font-mono">👥 {recruitsCount}</span>
          </div>
        </div>

        {/* Card 2: Redeem Friend's Code */}
        <div className="bg-[#080e1d] border border-indigo-500/30 rounded-xl p-3 flex flex-col justify-between space-y-2.5">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <span>🎁</span> Redeem Squad Invite Code:
            </span>

            {hasBeenInvited ? (
              <div className="mt-2 p-2 bg-emerald-950/40 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-[10px] font-mono text-emerald-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Squad Bonus Claimed! Recruited by: <strong className="text-white">{gameState.invitedByCode || userProfile?.invitedByCode}</strong></span>
              </div>
            ) : (
              <form onSubmit={handleSubmitCode} className="mt-1.5 flex gap-1.5">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="E.G. ARMORY-HERO"
                  className="flex-1 bg-black/60 border border-indigo-500/40 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 uppercase"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-linear-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-mono font-bold text-xs rounded-lg transition cursor-pointer shadow-md shadow-indigo-600/20 active:scale-95 uppercase tracking-wider shrink-0"
                >
                  Join
                </button>
              </form>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
            <span>One-Time Bonus:</span>
            <span className="text-yellow-400 font-bold font-mono">+3,000 Coins / +150 Gems</span>
          </div>
        </div>

      </div>

      {/* Status Feedback Message */}
      {statusMessage && (
        <div className={`p-2 rounded-lg text-xs font-mono flex items-center gap-2 animate-fadeIn ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300' 
            : 'bg-red-950/80 border border-red-500/40 text-red-300'
        }`}>
          {statusMessage.type === 'success' ? <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Future Roadmap / Co-Op Horde Teaser */}
      <div className="bg-linear-to-r from-cyan-950/20 via-indigo-950/30 to-purple-950/20 border border-cyan-500/20 rounded-xl p-2.5 flex items-start gap-2">
        <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-[10px] sm:text-[11px] font-mono leading-relaxed text-slate-300">
          <strong className="text-cyan-300 uppercase">Upcoming Co-Op Horde Raids:</strong> Your recruited squad will band together as a unified assault team to battle massive Horde waves and multi-champion World Bosses!
        </div>
      </div>

    </div>
  );
};
