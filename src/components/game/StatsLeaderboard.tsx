import React, { useState } from 'react';
import { GameState, LeaderboardEntry, UserProfile, SeasonalRewardTier } from '../../types';
import { User as FirebaseUser } from 'firebase/auth';
import { trackEvent } from '../../lib/analytics';

// Modular Leaderboard Subcomponents
import { LeaderboardSeasonHeader, SeasonMode } from './leaderboard/LeaderboardSeasonHeader';
import { LeaderboardCategoryNav, LeaderboardCategory } from './leaderboard/LeaderboardCategoryNav';
import { HeroAttributeSummary } from './leaderboard/HeroAttributeSummary';
import { LeaderboardRosterTable } from './leaderboard/LeaderboardRosterTable';
import { BossSpecialistGrid } from './leaderboard/BossSpecialistGrid';
import { SeasonalRewardClaimStation } from './leaderboard/SeasonalRewardClaimStation';
import { MONTHLY_REWARDS, YEARLY_REWARDS } from '../../data/seasonalRewards';

export interface StatsLeaderboardProps {
  gameState: GameState;
  setGameState?: React.Dispatch<React.SetStateAction<GameState>>;
  currentUser?: FirebaseUser | null;
  userProfile?: UserProfile | null;
  cloudLeaderboard?: LeaderboardEntry[];
  onOpenAccount?: () => void;
  onSyncLeaderboard?: () => Promise<void>;
  isSyncingLeaderboard?: boolean;
  totalAttack: number;
  totalDefense: number;
  totalSpeed: number;
  powerScore: number;
  onClaimReward?: (reward: SeasonalRewardTier) => void;
}

export const StatsLeaderboard: React.FC<StatsLeaderboardProps> = ({
  gameState,
  setGameState,
  currentUser,
  userProfile,
  cloudLeaderboard = [],
  onOpenAccount,
  onSyncLeaderboard,
  isSyncingLeaderboard = false,
  totalAttack,
  totalDefense,
  totalSpeed,
  powerScore,
  onClaimReward
}) => {
  const [seasonMode, setSeasonMode] = useState<SeasonMode>('monthly');
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>('power');

  // Compute number of unclaimed rewards
  const allRewards = [...MONTHLY_REWARDS, ...YEARLY_REWARDS];
  const unclaimedCount = allRewards.filter(reward => {
    const isClaimed = !!gameState.claimedSeasonalRewards?.[reward.id];
    if (isClaimed) return false;

    let userVal = 0;
    switch (reward.category) {
      case 'kills':
        userVal = gameState.totalBossesDefeated || 0;
        break;
      case 'deaths':
        userVal = gameState.totalDeaths || (
          Object.values(gameState.bossDeathStats || {}).reduce<number>((a, b) => a + (Number(b) || 0), 0)
        );
        break;
      case 'max_damage':
        userVal = gameState.maxDamage || 0;
        break;
      case 'dodges':
        userVal = gameState.totalDodges || 0;
        break;
      case 'specials':
        userVal = gameState.totalSpecials || 0;
        break;
      case 'gold':
        userVal = gameState.totalGoldEarned || gameState.coins || 0;
        break;
      case 'gems':
        userVal = gameState.totalGemsEarned || gameState.gems || 0;
        break;
      case 'overall_power':
        userVal = gameState.powerScore || 0;
        break;
    }
    return userVal >= reward.minRequirement;
  }).length;

  const handleClaimReward = (tier: SeasonalRewardTier) => {
    trackEvent('seasonal_reward_claimed', {
      reward_id: tier.id,
      reward_title: tier.title,
      category: tier.category,
      coins: tier.coinsReward,
      gems: tier.gemsReward
    });

    if (onClaimReward) {
      onClaimReward(tier);
      return;
    }

    if (setGameState) {
      setGameState(prev => {
        const next = {
          ...prev,
          coins: prev.coins + tier.coinsReward,
          gems: (prev.gems || 0) + tier.gemsReward,
          claimedSeasonalRewards: {
            ...(prev.claimedSeasonalRewards || {}),
            [tier.id]: true
          },
          battleLog: [
            {
              message: `🎁 Claimed Seasonal Prize [${tier.title}]: +${tier.coinsReward.toLocaleString()} Coins & +${tier.gemsReward.toLocaleString()} Gems!`,
              className: 'log-reward'
            },
            ...prev.battleLog
          ]
        };
        try {
          localStorage.setItem('bossRushTycoon', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  };

  return (
    <div className="space-y-6 max-w-[950px] mx-auto">
      {/* 1. Header Banner with Time Horizon & Sync Trigger */}
      <LeaderboardSeasonHeader
        seasonMode={seasonMode}
        onSeasonChange={setSeasonMode}
        currentUser={currentUser}
        onSyncLeaderboard={onSyncLeaderboard}
        isSyncingLeaderboard={isSyncingLeaderboard}
        onOpenAccount={onOpenAccount}
        powerScore={powerScore}
      />

      {/* 2. Top Stats: Hero Attributes & Live Telemetry Summary */}
      <HeroAttributeSummary
        gameState={gameState}
        totalAttack={totalAttack}
        totalDefense={totalDefense}
        totalSpeed={totalSpeed}
        powerScore={powerScore}
      />

      {/* 3. Category Filter Navigation Bar */}
      <LeaderboardCategoryNav
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        unclaimedRewardsCount={unclaimedCount}
      />

      {/* 4. Active View Content */}
      {activeCategory === 'boss_specialists' ? (
        <BossSpecialistGrid
          cloudLeaderboard={cloudLeaderboard}
          gameState={gameState}
        />
      ) : activeCategory === 'rewards' ? (
        <SeasonalRewardClaimStation
          gameState={gameState}
          seasonMode={seasonMode}
          onClaimReward={handleClaimReward}
        />
      ) : (
        <LeaderboardRosterTable
          cloudLeaderboard={cloudLeaderboard}
          gameState={gameState}
          activeCategory={activeCategory}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};
