import React, { useState, useMemo, useEffect } from 'react';
import { X, Share2, Copy, Check, Download, ExternalLink, Sparkles, Shield, Crown, Swords, Users, RefreshCw } from 'lucide-react';
import { GameState, UserProfile } from '../../types';
import { generateShareCardSvg, ShareCardParams } from '../../utils/dynamicShareSvg';
import { buildDeepShareUrl, buildDynamicSvgUrl, downloadShareCardSvg, getShareText, shareSvgAsFile, BuildShareUrlOptions } from '../../utils/shareLinkBuilder';
import { trackLeaderboardShare } from '../../lib/analytics';
import { getTotalAttack, getTotalDefense, getTotalSpeed, getPowerScore } from '../../utils/combatEngine';

export interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  userProfile?: UserProfile | null;
  defaultView?: 'champion' | 'boss' | 'squad';
  bossData?: {
    name: string;
    emoji: string;
  };
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  gameState,
  userProfile,
  defaultView = 'champion',
  bossData
}) => {
  const [activeView, setActiveView] = useState<'champion' | 'boss' | 'squad'>(defaultView);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSvgUrl, setCopiedSvgUrl] = useState(false);
  const [copiedBase64, setCopiedBase64] = useState(false);

  // Sync default view when opened
  useEffect(() => {
    if (isOpen) {
      setActiveView(defaultView);
    }
  }, [isOpen, defaultView]);

  // Compute live champion attributes
  const playerName = userProfile?.displayName || gameState.playerName || 'Hero';
  const playerTitle = userProfile?.title || 'Grand Champion';
  const playerAvatar = userProfile?.avatar || '⚔️';
  const myInviteCode = 
    gameState.inviteCode || 
    userProfile?.inviteCode || 
    `ARMORY-${(userProfile?.userId || gameState.playerName || 'CHAMP').replace(/[^A-Za-z0-9]/g, '').slice(0, 5).toUpperCase() || 'HERO7'}`;

  // Slain boss counts & live combat metrics
  const bossesDefeated = gameState.totalBossesDefeated || 0;
  const totalBosses = 15;
  const attack = getTotalAttack(gameState);
  const defense = getTotalDefense(gameState);
  const speed = getTotalSpeed(gameState);
  const powerScore = getPowerScore(gameState);

  // Build card options
  const shareOptions: BuildShareUrlOptions = useMemo(() => ({
    view: activeView,
    player: playerName,
    title: playerTitle,
    avatar: playerAvatar,
    powerScore,
    bossesDefeated,
    totalBosses,
    attack,
    defense,
    speed,
    coins: gameState.coins || 0,
    gems: gameState.gems || 0,
    inviteCode: myInviteCode,
    bossName: bossData?.name || 'Ignis the Molten Overlord',
    bossEmoji: bossData?.emoji || '🔥'
  }), [activeView, playerName, playerTitle, playerAvatar, powerScore, bossesDefeated, totalBosses, attack, defense, speed, gameState.coins, gameState.gems, myInviteCode, bossData]);

  // Generate SVG string
  const svgParams: ShareCardParams = useMemo(() => ({
    view: activeView,
    name: playerName,
    title: playerTitle,
    avatar: playerAvatar,
    powerScore,
    bossesDefeated,
    totalBosses,
    attack,
    defense,
    speed,
    coins: gameState.coins || 0,
    gems: gameState.gems || 0,
    inviteCode: myInviteCode,
    bossName: bossData?.name || 'Ignis the Molten Overlord',
    bossEmoji: bossData?.emoji || '🔥'
  }), [activeView, playerName, playerTitle, playerAvatar, powerScore, bossesDefeated, totalBosses, attack, defense, speed, gameState.coins, gameState.gems, myInviteCode, bossData]);

  const rawSvg = useMemo(() => generateShareCardSvg(svgParams), [svgParams]);
  const deepShareUrl = useMemo(() => buildDeepShareUrl(shareOptions), [shareOptions]);
  const dynamicSvgUrl = useMemo(() => buildDynamicSvgUrl(shareOptions), [shareOptions]);
  const shareMessage = useMemo(() => getShareText(shareOptions), [shareOptions]);

  if (!isOpen) return null;

  const handleCopyDeepLink = async () => {
    try {
      await navigator.clipboard.writeText(deepShareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      trackLeaderboardShare('clipboard_deep_link', { view: activeView, url: deepShareUrl });
    } catch {}
  };

  const handleCopySvgUrl = async () => {
    try {
      await navigator.clipboard.writeText(dynamicSvgUrl);
      setCopiedSvgUrl(true);
      setTimeout(() => setCopiedSvgUrl(false), 2500);
      trackLeaderboardShare('clipboard_svg_url', { view: activeView, svg_url: dynamicSvgUrl });
    } catch {}
  };

  const handleCopyBase64 = async () => {
    try {
      const base64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(rawSvg)))}`;
      await navigator.clipboard.writeText(base64);
      setCopiedBase64(true);
      setTimeout(() => setCopiedBase64(false), 2500);
      trackLeaderboardShare('clipboard_base64', { view: activeView });
    } catch {}
  };

  const handleDownloadSvg = () => {
    const filename = `${activeView}-${playerName.toLowerCase().replace(/[^a-z0-9]/g, '_')}-share-card.svg`;
    downloadShareCardSvg(svgParams, filename);
    trackLeaderboardShare('download_svg', { view: activeView, filename });
  };

  const handleNativeShare = async () => {
    trackLeaderboardShare('native_web_share_start', { view: activeView });
    const filename = `powerup-${activeView}.svg`;
    
    // Attempt to share the actual image file first (best for previews)
    const sharedAsFile = await shareSvgAsFile(svgParams, filename);
    
    if (!sharedAsFile && navigator.share) {
      // Fallback to sharing the text and link
      try {
        await navigator.share({
          title: `Power-Up Armory · ${playerName}'s ${activeView === 'boss' ? 'Boss Conquest' : activeView === 'squad' ? 'Squad Invite' : 'Champion Codex'}`,
          text: shareMessage,
          url: deepShareUrl
        });
      } catch {}
    } else if (!sharedAsFile) {
      handleCopyDeepLink();
    }
  };

  const handleTwitterShare = () => {
    trackLeaderboardShare('twitter_x', { view: activeView, url: deepShareUrl });
    const tweetText = encodeURIComponent(`${shareMessage}\n\n`);
    const tweetUrl = encodeURIComponent(deepShareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl bg-gradient-to-b from-[#131b2e] via-[#0c1322] to-[#070b14] border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.25)] relative text-slate-200 space-y-5 my-auto max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-xl shadow-lg">
              ✨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-base sm:text-lg font-black text-white tracking-wider">
                  DYNAMIC VECTOR SHARE CARD STUDIO
                </h3>
                <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30 uppercase">
                  SVG 1200x630
                </span>
              </div>
              <p className="text-[11px] text-cyan-400/80 font-mono">
                Deep-tagged link &amp; real-time vectorized social preview generator
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Private Build Disclaimer */}
        <div className="bg-amber-950/30 border border-amber-500/20 rounded-xl p-3 flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-[10px] sm:text-[11px] text-amber-200/80 leading-relaxed font-mono">
            <strong className="text-amber-400 uppercase">Privacy Notice:</strong> Social platforms (iMessage, Slack) cannot see link previews on private dev/preview builds. 
            Use <strong className="text-white">"Share to Device"</strong> or <strong className="text-white">"Download .SVG"</strong> to send the actual image file for a high-quality visual preview.
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs">
          <button
            onClick={() => setActiveView('champion')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer border ${
              activeView === 'champion'
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                : 'bg-black/40 text-slate-400 border-white/5 hover:text-white hover:bg-black/60'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>👑 Champion Codex</span>
          </button>

          <button
            onClick={() => setActiveView('boss')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer border ${
              activeView === 'boss'
                ? 'bg-red-600 text-white border-red-400 shadow-md shadow-red-600/30'
                : 'bg-black/40 text-slate-400 border-white/5 hover:text-white hover:bg-black/60'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>⚔️ Boss Vanquish</span>
          </button>

          <button
            onClick={() => setActiveView('squad')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer border ${
              activeView === 'squad'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                : 'bg-black/40 text-slate-400 border-white/5 hover:text-white hover:bg-black/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>👥 Squad Invite</span>
          </button>
        </div>

        {/* Real-time Dynamic SVG Preview Canvas */}
        <div className="bg-black/60 border border-cyan-500/30 rounded-2xl p-2.5 sm:p-3 relative overflow-hidden shadow-inner group">
          <div className="w-full aspect-[1200/630] rounded-xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center bg-[#0a0e1a]">
            <div 
              className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
              dangerouslySetInnerHTML={{ __html: rawSvg }}
            />
          </div>

          <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-cyan-500/40 text-[10px] font-mono text-cyan-300 pointer-events-none">
            Vector SVG Live Preview
          </div>
        </div>

        {/* Multi-Channel Action Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 font-mono text-xs">
          {/* 1. Share Image File (Now primary for visual impact) */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="h-11 bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Image File</span>
          </button>

          {/* 2. Download SVG File */}
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="h-11 bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download .SVG</span>
          </button>

          {/* 3. Copy Deep Link */}
          <button
            type="button"
            onClick={handleCopyDeepLink}
            className="h-11 bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Portal Link'}</span>
          </button>

          {/* 4. Copy Base64 (Fallback) */}
          <button
            type="button"
            onClick={handleCopyBase64}
            className="h-11 bg-amber-950/80 hover:bg-amber-900/80 border border-amber-500/40 text-amber-200 font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            title="Copies image data URI for direct pasting"
          >
            {copiedBase64 ? <Check className="w-4 h-4 text-emerald-300" /> : <RefreshCw className="w-4 h-4" />}
            <span>{copiedBase64 ? 'Image Data Copied!' : 'Copy Image Code'}</span>
          </button>
        </div>

        {/* Deep Tagging Breakdown Drawer */}
        <div className="bg-[#090e1a] border border-cyan-500/20 rounded-2xl p-3.5 space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>🏷️</span> Embedded Deep Tags &amp; Parameters:
            </span>
            <button
              onClick={handleTwitterShare}
              className="text-[10px] text-sky-400 hover:text-sky-300 underline flex items-center gap-1 cursor-pointer"
            >
              <span>Post to X / Twitter</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-black/60 rounded-xl p-2.5 text-[11px] text-slate-400 break-all border border-white/5 space-y-1">
            <div className="text-cyan-300">
              <strong>URL:</strong> <span className="text-slate-300">{deepShareUrl}</span>
            </div>
            <div className="text-amber-300">
              <strong>Dynamic SVG:</strong> <span className="text-slate-300">{dynamicSvgUrl}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
