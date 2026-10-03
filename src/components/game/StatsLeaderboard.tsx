import React, { useState } from 'react';
import { GameState, LeaderboardEntry, UserProfile, SeasonalRewardTier } from '../../types';
import { User as FirebaseUser } from 'firebase/auth';
import { trackEvent } from '../../lib/analytics';
import { triggerParticleBurst } from '../common/ParticleFX';

// Modular Leaderboard Subcomponents
import { LeaderboardSeasonHeader, SeasonMode } from './leaderboard/LeaderboardSeasonHeader';
import { LeaderboardCategoryNav, LeaderboardCategory } from './leaderboard/LeaderboardCategoryNav';
import { HeroAttributeSummary } from './leaderboard/HeroAttributeSummary';
import { LeaderboardRosterTable } from './leaderboard/LeaderboardRosterTable';
import { BossSpecialistGrid } from './leaderboard/BossSpecialistGrid';
import { SeasonalRewardClaimStation } from './leaderboard/SeasonalRewardClaimStation';
import { SquadRecruitSection } from '../account/SquadRecruitSection';
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
  controlledSeasonMode?: SeasonMode;
  onSeasonChange?: (mode: SeasonMode) => void;
  controlledCategory?: LeaderboardCategory;
  onCategoryChange?: (category: LeaderboardCategory) => void;
  onOpenLoreBook?: () => void;
  onOpenShareCard?: (view?: 'champion' | 'boss' | 'squad') => void;
  onRedeemInviteCode: (code: string) => { success: boolean; message: string };
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
  onClaimReward,
  controlledSeasonMode,
  onSeasonChange,
  controlledCategory,
  onCategoryChange,
  onOpenLoreBook,
  onOpenShareCard,
  onRedeemInviteCode
}) => {
  const [internalSeasonMode, setInternalSeasonMode] = useState<SeasonMode>('alltime');
  const [internalActiveCategory, setInternalActiveCategory] = useState<LeaderboardCategory>('power');

  const seasonMode = controlledSeasonMode !== undefined ? controlledSeasonMode : internalSeasonMode;
  const setSeasonMode = (mode: SeasonMode) => {
    setInternalSeasonMode(mode);
    if (onSeasonChange) onSeasonChange(mode);
  };

  const activeCategory = controlledCategory !== undefined ? controlledCategory : internalActiveCategory;
  const setActiveCategory = (category: LeaderboardCategory) => {
    setInternalActiveCategory(category);
    if (onCategoryChange) onCategoryChange(category);
  };

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
    triggerParticleBurst('purchase');
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
    <div className="w-full max-w-full flex-1 flex flex-col bg-linear-to-b from-[#111827] to-[#0a0f1a] border border-[#2a3d5c] rounded-[32px] md:rounded-[48px] p-3.5 sm:p-6 md:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.9),inset_0_0_0_2px_#1f2d4a,inset_0_0_0_3px_#141f33] select-none my-2 md:my-6 relative overflow-visible space-y-6">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #151f35 0%, #0a0e1a 70%)' }}></div>
      {/* 1. Header Banner with Time Horizon & Sync Trigger */}
      <LeaderboardSeasonHeader
        seasonMode={seasonMode}
        onSeasonChange={setSeasonMode}
        currentUser={currentUser}
        onSyncLeaderboard={onSyncLeaderboard}
        isSyncingLeaderboard={isSyncingLeaderboard}
        onOpenAccount={onOpenAccount}
        powerScore={powerScore}
        onOpenLoreBook={onOpenLoreBook}
        onOpenShareCard={onOpenShareCard}
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
      <div className="w-full">
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

      {/* 5. Squad Recruitment (Only for logged in users) */}
      {currentUser && (
        <SquadRecruitSection
          gameState={gameState}
          setGameState={setGameState!}
          userProfile={userProfile || null}
          onRedeemInviteCode={onRedeemInviteCode}
          onOpenShareCard={onOpenShareCard as any}
        />
      )}
    </div>
  );
};
