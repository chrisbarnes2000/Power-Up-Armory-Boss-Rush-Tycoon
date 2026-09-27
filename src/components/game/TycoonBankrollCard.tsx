import React, { useEffect, useRef } from 'react';
import { CoinIcon } from '../CoinIcon';
import { LightningIcon } from '../LightningIcon';

export interface TycoonBankrollCardProps {
  coins: number;
  gems: number;
  passiveYield: number; // in units per millisecond (divide by 1000 for /s)
  totalBossesDefeated: number;
  attack: number;
  defense: number;
  speed: number;
  powerScore: number;
  isDead: boolean;
  isFighting?: boolean;
  livePlayerHP?: number;
  livePlayerMaxHP?: number;
  maxHpBonus?: number;
}

/**
 * TycoonBankrollCard - Real-time statbar fixed to screen bottom
 * Dynamically computes footer collision and raises smoothly above #app-global-footer
 */
export const TycoonBankrollCard: React.FC<TycoonBankrollCardProps> = ({
  coins,
  gems,
  passiveYield,
  totalBossesDefeated,
  attack,
  defense,
  speed,
  powerScore,
  isDead,
  isFighting = false,
  livePlayerHP = 100,
  livePlayerMaxHP = 100,
  maxHpBonus = 0
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let rafId: number | null = null;

    const updatePosition = () => {
      if (!cardRef.current) return;
      const footer = document.getElementById('app-global-footer');
      if (!footer) {
        cardRef.current.style.bottom = '0px';
        return;
      }

      const footerRect = footer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // If top of footer enters viewport from bottom:
      if (footerRect.top < viewportHeight) {
        const overlap = Math.max(0, Math.round(viewportHeight - footerRect.top));
        cardRef.current.style.bottom = `${overlap}px`;
      } else {
        cardRef.current.style.bottom = '0px';
      }
    };

    const handleScrollOrResize = () => {
      // Execute immediately synchronously to avoid 1-frame scroll stutter
      updatePosition();
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    updatePosition();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, []);

  const normalHP = 100 + defense + maxHpBonus;

  // Compact number formatting for constrained single-line mobile rendering
  const formatCompact = (num: number): string => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 10_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    return Math.floor(num).toLocaleString();
  };

  const formatYield = (yieldPerMs: number): string => {
    const perSec = yieldPerMs / 1000;
    if (perSec >= 10_000) return `+${formatCompact(perSec)}/s`;
    if (perSec >= 100) return `+${Math.round(perSec)}/s`;
    if (perSec >= 1) return `+${perSec.toFixed(1).replace(/\.0$/, '')}/s`;
    if (perSec > 0) return `+${perSec.toFixed(1)}/s`;
    return '+0/s';
  };

  return (
    <div 
      ref={cardRef}
      id="tycoon-bankroll-card" 
      className="fixed left-0 right-0 z-40 bg-linear-to-r from-[#1a2540]/99 via-[#131d33]/99 to-[#0f182a]/99 backdrop-blur-2xl border-t border-[#2a4060] px-2.5 sm:px-6 md:px-8 py-1.5 sm:py-2 shadow-[0_-10px_40px_rgba(0,0,0,0.95)] w-full pointer-events-auto will-change-[bottom]"
      style={{ bottom: '0px' }}
    >
      <div className="max-w-[1720px] 2xl:max-w-[1880px] mx-auto flex flex-col gap-1 box-border">
        {/* Layer 1: Global Currency & Milestones (Strict Single Line) */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 border-b border-white/10 pb-1 w-full">
          <span className="font-mono text-[11px] sm:text-xs text-[#7ae0ff] font-extrabold uppercase tracking-widest flex items-center gap-1 shrink-0">
            <span className="text-sm sm:text-base leading-none">🏆</span> <span className="hidden xs:inline">PORTAL</span>
          </span>
          
          <div className="flex items-center gap-1 sm:gap-1.5 justify-end ml-auto shrink-0">
            {/* Coins */}
            <div
              tabIndex={0}
              role="button"
              data-tooltip={`Gold Coins: ${Math.floor(coins).toLocaleString()} Gold`}
              className="bg-[#141c30] hover:bg-[#1a2642] active:scale-95 px-2 sm:px-2.5 py-0.5 rounded-full border border-[#2a4060] text-[11px] sm:text-xs flex items-center gap-1 shadow-inner cursor-pointer transition select-none" 
            >
              <CoinIcon className="w-3.5 h-3.5 drop-shadow shrink-0" />
              <span className="font-mono text-[#f5e56b] font-extrabold">{formatCompact(coins)}</span>
            </div>

            {/* Gems */}
            <div
              tabIndex={0}
              role="button"
              data-tooltip={`Gems: ${Math.floor(gems || 0).toLocaleString()} Gems`}
              className="bg-[#141c30] hover:bg-[#1a2642] active:scale-95 px-2 sm:px-2.5 py-0.5 rounded-full border border-[#2a4060] text-[11px] sm:text-xs flex items-center gap-1 shadow-inner cursor-pointer transition select-none" 
            >
              <span className="text-xs sm:text-sm leading-none shrink-0">💎</span>
              <span className="font-mono text-[#cb9df2] font-extrabold">{formatCompact(gems || 0)}</span>
            </div>

            {/* Yield */}
            <div
              tabIndex={0}
              role="button"
              data-tooltip={`Passive Yield: +${(passiveYield / 1000).toFixed(3)} gold/sec`}
              className="bg-[#141c30] hover:bg-[#1a2642] active:scale-95 px-2 sm:px-2.5 py-0.5 rounded-full border border-[#2a4060] text-[11px] sm:text-xs flex items-center gap-1 shadow-inner cursor-pointer transition select-none" 
            >
              <span className="text-xs sm:text-sm leading-none shrink-0">⏱️</span>
              <span className="font-mono text-green-400 font-extrabold">{formatYield(passiveYield)}</span>
            </div>

            {/* Bosses Defeated */}
            <div
              tabIndex={0}
              role="button"
              data-tooltip={`Bosses Defeated: ${totalBossesDefeated} Bosses Vanquished`}
              className="bg-[#141c30] hover:bg-[#1a2642] active:scale-95 px-2 sm:px-2.5 py-0.5 rounded-full border border-[#2a4060] text-[11px] sm:text-xs flex items-center gap-1 shadow-inner cursor-pointer transition select-none" 
            >
              <span className="text-xs sm:text-sm leading-none shrink-0">💀</span>
              <span className="font-mono text-red-400 font-extrabold">{totalBossesDefeated}</span>
            </div>
          </div>
        </div>

        {/* Layer 2: Player Combat Attributes (Strict Single Line) */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 w-full">
          <span className="font-mono text-[11px] sm:text-xs text-amber-400 font-extrabold uppercase tracking-widest flex items-center gap-1 shrink-0">
            <LightningIcon className="w-4 h-4 drop-shadow-md text-amber-400 shrink-0" />
            <span className="hidden xs:inline">STATS</span>
          </span>

          <div className="flex items-center gap-1 sm:gap-1.5 justify-end ml-auto shrink-0">
            {/* ATK */}
            <div
              tabIndex={0}
              role="button"
              data-tooltip={`Attack Damage: ${attack} ATK`}
              className="bg-[#121c33] hover:bg-[#1a2948] active:scale-95 px-2 sm:px-2.5 py-0.5 rounded-full border border-red-500/30 text-[11px] sm:text-xs flex items-center gap-1 shadow-sm hover:border-red-400/60 transition cursor-pointer select-none" 
            >
              <span className="text-xs leading-none shrink-0">⚔️</span>
              <span className="font-mono text-red-300 font-extrabold">{formatCompact(attack)}</span>
            </div>

            {/* DEF */}
            <div
              tabIndex={0}
              role="button"
              data-tooltip={`Defense Rating: ${defense} DEF`}
              className="bg-[#121c33] hover:bg-[#1a2948] active:scale-95 px-2 sm:px-2.5 py-0.5 rounded-full border border-blue-500/30 text-[11px] sm:text-xs flex items-center gap-1 shadow-sm hover:border-blue-400/60 transition cursor-pointer select-none" 
            >
              <span className="text-xs leading-none shrink-0">🛡️</span>
              <span className="font-mono text-blue-300 font-extrabold">{formatCompact(defense)}</span>
            </div>

            {/* HP */}
            <div
              tabIndex={0}
              role="button"
              data-tooltip={isDead ? "Player Fallen: Revive in Lore Book or Store" : `Health Points: ${isFighting ? `${livePlayerHP}/${livePlayerMaxHP}` : normalHP} HP`}
              className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs flex items-center gap-1 shadow-sm transition active:scale-95 cursor-pointer select-none ${
                isDead || (isFighting && livePlayerHP <= 0)
                  ? 'bg-red-950/80 border-2 border-red-500 text-red-200 animate-pulse'
                  : 'bg-[#121c33] hover:bg-[#1a2948] border border-emerald-500/30 text-emerald-300 hover:border-emerald-400/60'
              }`} 
            >
              <span className="text-xs leading-none shrink-0">{isDead || (isFighting && livePlayerHP <= 0) ? '💀' : '❤️'}</span>
              <span className={`font-mono font-extrabold ${
                isDead || (isFighting && livePlayerHP <= 0) ? 'text-red-300' : 'text-emerald-300'
              }`}>
                {isDead ? '0 (DEAD)' : isFighting ? `${livePlayerHP}/${livePlayerMaxHP}` : `${formatCompact(normalHP)}`}
              </span>
            </div>

            {/* SPD */}
            <div
              tabIndex={0}
              role="button"
              data-tooltip={`Combat Speed: ${speed} SPD`}
              className="bg-[#121c33] hover:bg-[#1a2948] active:scale-95 px-2 sm:px-2.5 py-0.5 rounded-full border border-amber-500/30 text-[11px] sm:text-xs flex items-center gap-1 shadow-sm hover:border-amber-400/60 transition cursor-pointer select-none" 
            >
              <span className="text-xs leading-none shrink-0">⚡</span>
              <span className="font-mono text-amber-300 font-extrabold">{speed}</span>
            </div>

            {/* PS */}
            <div
              tabIndex={0}
              role="button"
              data-tooltip={`Power Score: ${powerScore} Overall Score`}
              className="bg-[#121c33] hover:bg-[#1a2948] active:scale-95 px-2 sm:px-2.5 py-0.5 rounded-full border border-cyan-500/30 text-[11px] sm:text-xs flex items-center gap-1 shadow-sm hover:border-cyan-400/60 transition cursor-pointer select-none" 
            >
              <span className="text-xs leading-none shrink-0">✨</span>
              <span className="font-mono text-cyan-300 font-extrabold">{formatCompact(powerScore)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
