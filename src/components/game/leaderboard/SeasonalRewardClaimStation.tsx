import React from 'react';
import { GameState, SeasonalRewardTier } from '../../../types';
import { MONTHLY_REWARDS, YEARLY_REWARDS } from '../../../data/seasonalRewards';
import { SeasonMode } from './LeaderboardSeasonHeader';

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
    <div className="bg-[#0e1628] border border-[#1a2540] rounded-2xl p-4 sm:p-5 space-y-4">
      <div className="border-b border-white/5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-mono text-sm text-[#f5e56b] uppercase font-bold tracking-wide flex items-center gap-2">
            <span>🎁 {seasonMode === 'yearly' ? 'YEARLY CHAMPIONSHIP' : 'MONTHLY SEASON'} PRIZE REWARDS</span>
            <span className="text-[10px] bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              Instant Payouts
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Reach target combat metrics and milestones to claim bonus gold, gems, and exclusive player titles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {rewardsList.map(tier => {
          const currentVal = getCurrentMetricValue(tier.category);
          const isEligible = currentVal >= tier.minRequirement;
          const isClaimed = !!gameState.claimedSeasonalRewards?.[tier.id];
          const progressPercent = Math.min(100, Math.floor((currentVal / tier.minRequirement) * 100));

          return (
            <div
              key={tier.id}
              className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
                isClaimed
                  ? 'bg-[#101b30]/60 border-white/5 opacity-80'
                  : isEligible
                  ? 'bg-gradient-to-r from-amber-950/40 via-blue-950/40 to-[#121f3a] border-amber-500/40 shadow-md'
                  : 'bg-[#121c32] border-[#203354]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{tier.badgeEmoji}</span>
                    <div>
                      <h4 className="font-mono text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{tier.title}</span>
                        {tier.titleReward && (
                          <span className="text-[10px] text-amber-300 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-500/30 font-sans">
                            Title: "{tier.titleReward}"
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-300 font-mono mt-0.5">{tier.criteriaText}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold text-yellow-400 block">+{tier.coinsReward.toLocaleString()} 🪙</span>
                    <span className="font-mono text-xs font-bold text-cyan-300 block">+{tier.gemsReward.toLocaleString()} 💎</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>Progress: {currentVal.toLocaleString()} / {tier.minRequirement.toLocaleString()}</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isEligible ? 'bg-gradient-to-r from-emerald-500 to-amber-400' : 'bg-blue-600'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  {isClaimed ? 'Claimed for this period' : isEligible ? 'Target unlocked!' : 'Keep battling to unlock'}
                </span>

                {isClaimed ? (
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    <span>✅</span>
                    <span>Claimed</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={!isEligible}
                    onClick={() => onClaimReward(tier)}
                    className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                      isEligible
                        ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-md font-black animate-bounce'
                        : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    <span>🎁</span>
                    <span>{isEligible ? 'Claim Prize' : 'Locked'}</span>
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
