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
    <div className="bg-[#0e1628] border border-[#1a2540] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
      <div>
        <h3 className="font-mono text-sm text-[#7ae0ff] uppercase font-bold tracking-wider mb-3.5 border-b border-white/5 pb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">📊 HERO COMBAT TELEMETRY</span>
          <span className="text-xs text-slate-400 font-normal">K/D: <strong className="text-white">{kdRatio}</strong></span>
        </h3>

        {/* 6 Grid Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="bg-[#141c30] p-2.5 rounded-xl border border-[#2a4060]/30 flex flex-col">
            <span className="text-[11px] text-slate-400 block uppercase font-bold">🗡️ Total Attack</span>
            <span className="font-mono text-sm text-[#f5e56b] font-black mt-0.5">+{totalAttack} ATK</span>
            <span className="text-[10px] text-slate-500 block leading-tight">+{gameState.damageBonusPercent || 0}% Tonic</span>
          </div>

          <div className="bg-[#141c30] p-2.5 rounded-xl border border-[#2a4060]/30 flex flex-col">
            <span className="text-[11px] text-slate-400 block uppercase font-bold">🛡️ Armor / Defense</span>
            <span className="font-mono text-sm text-[#7ae0ff] font-black mt-0.5">+{totalDefense} DEF</span>
            <span className="text-[10px] text-slate-500 block leading-tight">Damage mitigation</span>
          </div>

          <div className="bg-[#141c30] p-2.5 rounded-xl border border-[#2a4060]/30 flex flex-col">
            <span className="text-[11px] text-slate-400 block uppercase font-bold">💖 Total Max HP</span>
            <span className="font-mono text-sm text-red-400 font-black mt-0.5">{100 + totalDefense + (gameState.maxHpBonus || 0)} HP</span>
            <span className="text-[10px] text-slate-500 block leading-tight">+{gameState.maxHpBonus || 0} Shield</span>
          </div>

          <div className="bg-[#141c30] p-2.5 rounded-xl border border-[#2a4060]/30 flex flex-col">
            <span className="text-[11px] text-slate-400 block uppercase font-bold">💥 Max Damage</span>
            <span className="font-mono text-sm text-orange-400 font-black mt-0.5">{maxDamage} DMG</span>
            <span className="text-[10px] text-slate-500 block leading-tight">Single-hit crit peak</span>
          </div>

          <div className="bg-[#141c30] p-2.5 rounded-xl border border-[#2a4060]/30 flex flex-col">
            <span className="text-[11px] text-slate-400 block uppercase font-bold">💨 Attacks Dodged</span>
            <span className="font-mono text-sm text-[#cb9df2] font-black mt-0.5">{totalDodges} Evasions</span>
            <span className="text-[10px] text-slate-500 block leading-tight">SPD + agility rate</span>
          </div>

          <div className="bg-[#141c30] p-2.5 rounded-xl border border-[#2a4060]/30 flex flex-col">
            <span className="text-[11px] text-slate-400 block uppercase font-bold">✨ Specials Cast</span>
            <span className="font-mono text-sm text-cyan-300 font-black mt-0.5">{totalSpecials} Powers</span>
            <span className="text-[10px] text-slate-500 block leading-tight">Artifact activations</span>
          </div>
        </div>
      </div>

      <div className="bg-black/35 border border-white/5 rounded-xl p-3 mt-3 text-xs font-mono text-slate-300 space-y-1">
        <div className="flex justify-between"><span>👑 Champion Name:</span> <span className="font-bold text-white">{gameState.playerName || 'Hero'}</span></div>
        <div className="flex justify-between"><span>⚡ Total Power Score:</span> <span className="font-bold text-[#f5e56b]">{powerScore} PS</span></div>
        <div className="flex justify-between">
          <span>⚔️ Kills vs Deaths:</span> 
          <span className="font-bold text-slate-200">
            <span className="text-emerald-400">{totalKills} W</span> / <span className="text-red-400">{totalDeaths} L</span>
          </span>
        </div>
      </div>

      {/* Social Brag & Deep Link Sharing Station */}
      <div className="mt-4 pt-3 border-t border-cyan-500/20 bg-linear-to-r from-cyan-950/20 via-blue-950/20 to-indigo-950/20 rounded-xl p-3 border border-[#203354]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            <span>BRAG ON SOCIALS & CHALLENGE SQUADS</span>
          </span>
          <span className="text-[9px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-white/5">
            UTM Tagged
          </span>
        </div>

        <p className="text-[10px] text-slate-400 mb-2.5 leading-tight font-sans">
          Share your combat record with automatic deep link attribution & your <strong className="text-white font-mono">{squadCode}</strong> squad recruit bonus.
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Native Share (Web Share API) */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex-1 min-w-[120px] py-1.5 px-2.5 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-cyan-600/20 active:scale-95"
            title="Share via Native Device Sheet"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Record</span>
          </button>

          {/* Copy Formatted Brag Card */}
          <button
            type="button"
            onClick={handleCopyBragCard}
            className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition cursor-pointer active:scale-95"
            title="Copy ASCII Combat Card to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Card'}</span>
          </button>

          {/* Twitter / X */}
          <button
            type="button"
            onClick={() => handleSocialClick('twitter')}
            className="py-1.5 px-2 bg-[#0a0f1d] hover:bg-[#15203b] border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition cursor-pointer active:scale-95"
            title="Post to X / Twitter"
          >
            <span className="font-sans font-black">𝕏</span>
            <span className="hidden sm:inline">Post</span>
          </button>

          {/* Bluesky */}
          <button
            type="button"
            onClick={() => handleSocialClick('bluesky')}
            className="py-1.5 px-2 bg-[#0c1833] hover:bg-[#162954] border border-blue-500/40 text-blue-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition cursor-pointer active:scale-95"
            title="Post to Bluesky"
          >
            <span>🦋</span>
            <span className="hidden sm:inline">Bluesky</span>
          </button>

          {/* Reddit */}
          <button
            type="button"
            onClick={() => handleSocialClick('reddit')}
            className="py-1.5 px-2 bg-[#1f1008] hover:bg-[#331c0e] border border-orange-500/40 text-orange-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition cursor-pointer active:scale-95"
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
