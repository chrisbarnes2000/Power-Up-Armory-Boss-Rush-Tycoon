import React from 'react';
import { GameState, SeasonalRewardTier } from '../../../types';
import { MONTHLY_REWARDS, YEARLY_REWARDS } from '../../../data/seasonalRewards';
import { SeasonMode } from './LeaderboardSeasonHeader';
import { triggerParticleBurst } from '../../common/ParticleFX';

export interface SeasonalRewardClaimStationProps {
  gameState: GameState;
  seasonMode: SeasonMode;
  onClaimReward: (reward: SeasonalRewardTier) => void;
}

export const SeasonalRewardClaimStation: React.FC<SeasonalRewardClaimStationProps> = ({
  gameState,
  seasonMode,
  onClaimReward
}) => {
  const rewardsList = seasonMode === 'yearly' ? YEARLY_REWARDS : MONTHLY_REWARDS;

  // Helper to compute player's current value for a given category
  const getCurrentMetricValue = (category: SeasonalRewardTier['category']): number => {
    switch (category) {
      case 'kills':
        return gameState.totalBossesDefeated || 0;
      case 'deaths':
        return gameState.totalDeaths || (
          Object.values(gameState.bossDeathStats || {}).reduce<number>((a, b) => a + (Number(b) || 0), 0)
        );
      case 'max_damage':
        return gameState.maxDamage || 0;
      case 'dodges':
        return gameState.totalDodges || 0;
      case 'specials':
        return gameState.totalSpecials || 0;
      case 'gold':
        return gameState.totalGoldEarned || gameState.coins || 0;
      case 'gems':
        return gameState.totalGemsEarned || gameState.gems || 0;
      case 'overall_power':
        return gameState.powerScore || 0;
      default:
        return 0;
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#141b2c] via-[#0f1726] to-[#0c121e] border border-amber-500/25 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.7)] space-y-5">
      <div className="border-b border-amber-500/20 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎁</span>
          <div>
            <h3 className="font-mono text-xs sm:text-sm text-amber-300 uppercase font-bold tracking-wider flex items-center gap-2">
              <span>{seasonMode === 'yearly' ? 'ANNUAL GRAND CHAMPIONSHIP' : 'MONTHLY SEASON'} BOUNTY SANCTUARY</span>
              <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold">
                Instant Payouts
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Achieve celestial combat milestones to claim massive gold caches, starlight gems, and ascended titles.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rewardsList.map(tier => {
          const currentVal = getCurrentMetricValue(tier.category);
          const isEligible = currentVal >= tier.minRequirement;
          const isClaimed = !!gameState.claimedSeasonalRewards?.[tier.id];
          const progressPercent = Math.min(100, Math.floor((currentVal / tier.minRequirement) * 100));

          return (
            <div
              key={tier.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isClaimed
                  ? 'bg-[#0f1624]/60 border-white/5 opacity-75'
                  : isEligible
                  ? 'bg-gradient-to-r from-amber-950/50 via-[#18233a] to-[#141c2c] border-amber-400/60 shadow-lg ring-1 ring-amber-400/30'
                  : 'bg-[#101828]/90 border-amber-500/20 hover:border-amber-500/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl p-1.5 bg-black/40 rounded-xl border border-white/5 shrink-0">{tier.badgeEmoji}</span>
                    <div className="min-w-0">
                      <h4 className="font-mono text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
                        <span className="truncate">{tier.title}</span>
                      </h4>
                      {tier.titleReward && (
                        <span className="text-[10px] text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-500/30 font-mono inline-block mt-0.5">
                          Title: "{tier.titleReward}"
                        </span>
                      )}
                      <p className="text-xs text-slate-300 font-mono mt-1 leading-snug">{tier.criteriaText}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-black text-yellow-400 block tabular-nums">+{tier.coinsReward.toLocaleString()} 🪙</span>
                    <span className="font-mono text-xs font-black text-cyan-300 block tabular-nums">+{tier.gemsReward.toLocaleString()} 💎</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3.5 pt-2.5 border-t border-white/5">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>Progress: {currentVal.toLocaleString()} / {tier.minRequirement.toLocaleString()}</span>
                    <span className="text-amber-300 font-bold">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isEligible ? 'bg-gradient-to-r from-emerald-500 to-amber-400' : 'bg-gradient-to-r from-blue-600 to-cyan-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  {isClaimed ? 'Claimed for this period' : isEligible ? 'Target unlocked!' : 'Keep battling to unlock'}
                </span>

                {isClaimed ? (
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/70 px-3 py-1 rounded-xl border border-emerald-500/30">
                    <span>✅</span>
                    <span>Claimed</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={!isEligible}
                    onClick={() => {
                      triggerParticleBurst('purchase');
                      onClaimReward(tier);
                    }}
                    className={`text-xs font-mono font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                      isEligible
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black shadow-lg shadow-amber-900/40 font-black animate-pulse active:scale-95'
                        : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    <span>🎁</span>
                    <span>{isEligible ? 'Claim Bounty' : 'Locked'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
