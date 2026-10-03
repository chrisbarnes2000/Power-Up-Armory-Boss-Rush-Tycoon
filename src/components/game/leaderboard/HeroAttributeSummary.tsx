import React, { useState } from 'react';
import { Share2, Check, Copy, ExternalLink, Sparkles, Send } from 'lucide-react';
import { GameState } from '../../../types';
import { trackLeaderboardShare } from '../../../lib/analytics';

export interface HeroAttributeSummaryProps {
  gameState: GameState;
  totalAttack: number;
  totalDefense: number;
  totalSpeed: number;
  powerScore: number;
}

export const HeroAttributeSummary: React.FC<HeroAttributeSummaryProps> = ({
  gameState,
  totalAttack,
  totalDefense,
  totalSpeed,
  powerScore
}) => {
  const [copied, setCopied] = useState(false);
  const maxDamage = gameState.maxDamage || 0;
  const totalDodges = gameState.totalDodges || 0;
  const totalSpecials = gameState.totalSpecials || 0;
  const totalDeaths = gameState.totalDeaths || (
    Object.values(gameState.bossDeathStats || {}).reduce<number>((acc, curr) => acc + (Number(curr) || 0), 0)
  );
  const totalKills = gameState.totalBossesDefeated || 0;
  const kdRatio = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : totalKills.toFixed(1);

  const championName = gameState.playerName || 'Grand Champion';
  const squadCode = gameState.inviteCode || `ARMORY-${championName.replace(/[^A-Za-z0-9]/g, '').slice(0, 5).toUpperCase() || 'HERO7'}`;

  // Generate UTM-tagged share URLs
  const getBragUrl = (platform: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://rapprt.space';
    return `${origin}/?utm_source=${platform}&utm_medium=social_brag&utm_campaign=leaderboard_stats&ref=${squadCode}&view=game`;
  };

  const getBragText = () => {
    return `⚔️ ${championName} reached ${powerScore.toLocaleString()} Power Score in Power-Up Armory Boss Rush! Slayed ${totalKills} bosses with a ${maxDamage.toLocaleString()} DMG peak crit (K/D: ${kdRatio}). Can you conquer the gauntlet? #PowerUpArmory #RapportVerse`;
  };

  const handleNativeShare = async () => {
    const shareUrl = getBragUrl('native_share');
    const bragText = getBragText();

    trackLeaderboardShare('native_share', {
      power_score: powerScore,
      total_kills: totalKills,
      max_damage: maxDamage,
      share_url: shareUrl
    });

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${championName}'s Combat Record · Power-Up Armory`,
          text: bragText,
          url: shareUrl
        });
      } catch (err) {
        console.log('Share dismissed:', err);
      }
    } else {
      handleCopyBragCard();
    }
  };

  const handleCopyBragCard = () => {
    const shareUrl = getBragUrl('clipboard');
    const cardText = `╔════════════════════════════════════════╗
  ⚔️ POWER-UP ARMORY COMBAT RECORD ⚔️
  👑 Champion: ${championName}
  ⚡ Power Score: ${powerScore.toLocaleString()} PS
  🏆 Bosses Defeated: ${totalKills} | Deaths: ${totalDeaths} (K/D: ${kdRatio})
  💥 Peak Critical Strike: ${maxDamage.toLocaleString()} DMG
  💨 Attacks Dodged: ${totalDodges} | ✨ Specials Cast: ${totalSpecials}
  🛡️ Squad Invite: ${squadCode} (+3,000 Gold / +150 Gems)
  🎮 Challenge My Record: ${shareUrl}
╚════════════════════════════════════════╝`;

    navigator.clipboard.writeText(cardText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    trackLeaderboardShare('clipboard', {
      power_score: powerScore,
      total_kills: totalKills,
      max_damage: maxDamage,
      share_url: shareUrl
    });
  };

  const handleSocialClick = (platform: 'twitter' | 'bluesky' | 'reddit') => {
    const shareUrl = getBragUrl(platform);
    const text = getBragText();
    let target = '';

    if (platform === 'twitter') {
      target = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    } else if (platform === 'bluesky') {
      target = `https://bsky.app/intent/compose?text=${encodeURIComponent(`${text} ${shareUrl}`)}`;
    } else if (platform === 'reddit') {
      target = `https://www.reddit.com/submit?title=${encodeURIComponent(`[Power-Up Armory] ${championName} hit ${powerScore} PS with ${totalKills} boss victories!`)}&url=${encodeURIComponent(shareUrl)}`;
    }

    trackLeaderboardShare(platform, {
      power_score: powerScore,
      total_kills: totalKills,
      max_damage: maxDamage,
      share_url: shareUrl
    });

    if (typeof window !== 'undefined') {
      window.open(target, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#141b2c] via-[#0f1726] to-[#0c121e] border border-amber-500/25 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.7)] flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-500/20 pb-3 mb-4 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <h3 className="font-mono text-sm text-amber-300 uppercase font-bold tracking-wider flex items-center gap-2">
              <span>HEROIC COMBAT TELEMETRY & CODEX VITAE</span>
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Battle Ratio:</span>
            <span className="bg-black/40 border border-white/10 px-2.5 py-1 rounded-lg text-white font-bold">
              K/D: <strong className="text-amber-300">{kdRatio}</strong>
            </span>
          </div>
        </div>

        {/* 6 Responsive Grid Metrics (2 cols mobile, 3 tablet, 6 on wide desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          <div className="bg-[#121929]/90 hover:bg-[#162035] p-3 rounded-xl border border-amber-500/15 transition flex flex-col justify-between shadow-xs">
            <span className="text-[11px] text-amber-200/70 block uppercase font-bold flex items-center gap-1">
              <span>🗡️</span>
              <span>Total Attack</span>
            </span>
            <span className="font-mono text-base text-[#f5e56b] font-black my-1 tabular-nums">+{totalAttack.toLocaleString()} ATK</span>
            <span className="text-[10px] text-slate-400 block leading-tight font-mono">+{gameState.damageBonusPercent || 0}% Tonic Boost</span>
          </div>

          <div className="bg-[#121929]/90 hover:bg-[#162035] p-3 rounded-xl border border-amber-500/15 transition flex flex-col justify-between shadow-xs">
            <span className="text-[11px] text-cyan-200/70 block uppercase font-bold flex items-center gap-1">
              <span>🛡️</span>
              <span>Armor & Def</span>
            </span>
            <span className="font-mono text-base text-[#7ae0ff] font-black my-1 tabular-nums">+{totalDefense.toLocaleString()} DEF</span>
            <span className="text-[10px] text-slate-400 block leading-tight font-mono">Direct mitigation</span>
          </div>

          <div className="bg-[#121929]/90 hover:bg-[#162035] p-3 rounded-xl border border-amber-500/15 transition flex flex-col justify-between shadow-xs">
            <span className="text-[11px] text-red-200/70 block uppercase font-bold flex items-center gap-1">
              <span>💖</span>
              <span>Max Vitality</span>
            </span>
            <span className="font-mono text-base text-red-400 font-black my-1 tabular-nums">{(100 + totalDefense + (gameState.maxHpBonus || 0)).toLocaleString()} HP</span>
            <span className="text-[10px] text-slate-400 block leading-tight font-mono">+{gameState.maxHpBonus || 0} Shield HP</span>
          </div>

          <div className="bg-[#121929]/90 hover:bg-[#162035] p-3 rounded-xl border border-amber-500/15 transition flex flex-col justify-between shadow-xs">
            <span className="text-[11px] text-orange-200/70 block uppercase font-bold flex items-center gap-1">
              <span>💥</span>
              <span>Peak Crit</span>
            </span>
            <span className="font-mono text-base text-orange-400 font-black my-1 tabular-nums">{maxDamage.toLocaleString()} DMG</span>
            <span className="text-[10px] text-slate-400 block leading-tight font-mono">Single-hit peak</span>
          </div>

          <div className="bg-[#121929]/90 hover:bg-[#162035] p-3 rounded-xl border border-amber-500/15 transition flex flex-col justify-between shadow-xs">
            <span className="text-[11px] text-purple-200/70 block uppercase font-bold flex items-center gap-1">
              <span>💨</span>
              <span>Evasions</span>
            </span>
            <span className="font-mono text-base text-[#cb9df2] font-black my-1 tabular-nums">{totalDodges.toLocaleString()} Dodges</span>
            <span className="text-[10px] text-slate-400 block leading-tight font-mono">Agility dodges</span>
          </div>

          <div className="bg-[#121929]/90 hover:bg-[#162035] p-3 rounded-xl border border-amber-500/15 transition flex flex-col justify-between shadow-xs">
            <span className="text-[11px] text-emerald-200/70 block uppercase font-bold flex items-center gap-1">
              <span>✨</span>
              <span>Artifact Procs</span>
            </span>
            <span className="font-mono text-base text-emerald-300 font-black my-1 tabular-nums">{totalSpecials.toLocaleString()} Specials</span>
            <span className="text-[10px] text-slate-400 block leading-tight font-mono">Arcane triggers</span>
          </div>
        </div>
      </div>

      {/* Champion Dossier Strip */}
      <div className="bg-black/40 border border-amber-500/20 rounded-xl sm:rounded-2xl p-3.5 mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
        <div className="flex items-center justify-between sm:justify-start gap-2 bg-[#0c121e]/80 p-2 rounded-lg border border-white/5">
          <span className="text-slate-400">👑 Champion:</span>
          <span className="font-bold text-white truncate">{championName}</span>
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-2 bg-[#0c121e]/80 p-2 rounded-lg border border-white/5">
          <span className="text-slate-400">⚡ Power Score:</span>
          <span className="font-black text-[#f5e56b]">{powerScore.toLocaleString()} PS</span>
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-2 bg-[#0c121e]/80 p-2 rounded-lg border border-white/5">
          <span className="text-slate-400">⚔️ Gauntlet Record:</span>
          <span className="font-bold text-slate-200">
            <span className="text-emerald-400">{totalKills} W</span> / <span className="text-red-400">{totalDeaths} L</span>
          </span>
        </div>
      </div>

      {/* Social Brag & Deep Link Sharing Station */}
      <div className="mt-4 pt-3.5 border-t border-amber-500/20 bg-gradient-to-r from-[#17130a]/60 via-[#101b2e]/60 to-[#0e1628]/60 rounded-xl sm:rounded-2xl p-3.5 border border-[#203354]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1.5">
          <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            <span>BRAG ON SOCIALS & INVITE SQUAD INITIATES</span>
          </span>
          <span className="text-[10px] font-mono text-amber-200/70 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30 w-fit">
            Invite Code: <strong className="text-white">{squadCode}</strong>
          </span>
        </div>

        <p className="text-xs text-slate-300 mb-3 leading-tight font-sans">
          Inscribe your combat triumph to external realms with instant deep link attribution and recruit reward bonuses.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {/* Native Share (Web Share API) */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex-1 min-w-[130px] py-2 px-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-amber-900/30 active:scale-95 border border-amber-400/30"
            title="Share via Native Device Sheet"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Record</span>
          </button>

          {/* Copy Formatted Brag Card */}
          <button
            type="button"
            onClick={handleCopyBragCard}
            className="py-2 px-3 bg-[#162035] hover:bg-[#1e2c4a] border border-amber-500/30 text-amber-200 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-sm"
            title="Copy ASCII Combat Card to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copied ? 'Copied!' : 'Copy Card'}</span>
          </button>

          {/* Twitter / X */}
          <button
            type="button"
            onClick={() => handleSocialClick('twitter')}
            className="py-2 px-3 bg-[#0a0f1d] hover:bg-[#15203b] border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-sm"
            title="Post to X / Twitter"
          >
            <span className="font-sans font-black">𝕏</span>
            <span className="hidden sm:inline">Post</span>
          </button>

          {/* Bluesky */}
          <button
            type="button"
            onClick={() => handleSocialClick('bluesky')}
            className="py-2 px-3 bg-[#0c1833] hover:bg-[#162954] border border-blue-500/40 text-blue-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-sm"
            title="Post to Bluesky"
          >
            <span>🦋</span>
            <span className="hidden sm:inline">Bluesky</span>
          </button>

          {/* Reddit */}
          <button
            type="button"
            onClick={() => handleSocialClick('reddit')}
            className="py-2 px-3 bg-[#1f1008] hover:bg-[#331c0e] border border-orange-500/40 text-orange-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-sm"
            title="Post to Reddit"
          >
            <span>👽</span>
            <span className="hidden sm:inline">Reddit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
