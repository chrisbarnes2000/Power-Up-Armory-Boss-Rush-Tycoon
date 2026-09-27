import { SeasonalRewardTier } from '../types';

export const MONTHLY_REWARDS: SeasonalRewardTier[] = [
  {
    id: 'monthly_kills_apex',
    title: 'Apex Voidwalker',
    period: 'monthly',
    category: 'kills',
    criteriaText: 'Slay 25+ Bosses this month',
    minRequirement: 25,
    coinsReward: 50000,
    gemsReward: 1000,
    badgeEmoji: '👑',
    titleReward: 'Apex Voidwalker'
  },
  {
    id: 'monthly_kills_veteran',
    title: 'Gauntlet Veteran',
    period: 'monthly',
    category: 'kills',
    criteriaText: 'Slay 10+ Bosses this month',
    minRequirement: 10,
    coinsReward: 25000,
    gemsReward: 500,
    badgeEmoji: '⚔️',
    titleReward: 'Gauntlet Veteran'
  },
  {
    id: 'monthly_kills_challenger',
    title: 'Bronze Gladiator',
    period: 'monthly',
    category: 'kills',
    criteriaText: 'Slay 3+ Bosses this month',
    minRequirement: 3,
    coinsReward: 10000,
    gemsReward: 250,
    badgeEmoji: '🗡️',
    titleReward: 'Bronze Gladiator'
  },
  {
    id: 'monthly_deaths_perseverance',
    title: 'Iron Will (Most Deaths)',
    period: 'monthly',
    category: 'deaths',
    criteriaText: 'Persevere through 10+ Boss Defeats',
    minRequirement: 10,
    coinsReward: 20000,
    gemsReward: 400,
    badgeEmoji: '💀',
    titleReward: 'Iron Will'
  },
  {
    id: 'monthly_deaths_challenger',
    title: 'Tenacious Spirit',
    period: 'monthly',
    category: 'deaths',
    criteriaText: 'Persevere through 3+ Boss Defeats',
    minRequirement: 3,
    coinsReward: 10000,
    gemsReward: 200,
    badgeEmoji: '🛡️',
    titleReward: 'Tenacious Challenger'
  },
  {
    id: 'monthly_max_damage',
    title: 'Cataclysm Strike',
    period: 'monthly',
    category: 'max_damage',
    criteriaText: 'Deal 1,000+ Max Single-Hit Damage',
    minRequirement: 1000,
    coinsReward: 25000,
    gemsReward: 500,
    badgeEmoji: '💥',
    titleReward: 'Cataclysm'
  },
  {
    id: 'monthly_dodges',
    title: 'Shadow Dancer',
    period: 'monthly',
    category: 'dodges',
    criteriaText: 'Evade 25+ Boss Strikes',
    minRequirement: 25,
    coinsReward: 15000,
    gemsReward: 350,
    badgeEmoji: '💨',
    titleReward: 'Shadow Dancer'
  },
  {
    id: 'monthly_specials',
    title: 'Arcane Overload',
    period: 'monthly',
    category: 'specials',
    criteriaText: 'Execute 15+ Special Abilities',
    minRequirement: 15,
    coinsReward: 15000,
    gemsReward: 350,
    badgeEmoji: '✨',
    titleReward: 'Spellweaver'
  },
  {
    id: 'monthly_gold_hoard',
    title: 'Midas Treasury',
    period: 'monthly',
    category: 'gold',
    criteriaText: 'Collect 100,000+ Total Gold Coins',
    minRequirement: 100000,
    coinsReward: 30000,
    gemsReward: 600,
    badgeEmoji: '🪙',
    titleReward: 'Gold Baron'
  },
  {
    id: 'monthly_gem_pioneer',
    title: 'Astral Gem Collector',
    period: 'monthly',
    category: 'gems',
    criteriaText: 'Accumulate 500+ Total Gems',
    minRequirement: 500,
    coinsReward: 20000,
    gemsReward: 500,
    badgeEmoji: '💎',
    titleReward: 'Crystal Lord'
  }
];

export const YEARLY_REWARDS: SeasonalRewardTier[] = [
  {
    id: 'yearly_grand_champion',
    title: 'Immortal Grand Champion',
    period: 'yearly',
    category: 'kills',
    criteriaText: 'Conquer 75+ Bosses across the Annual Championship',
    minRequirement: 75,
    coinsReward: 150000,
    gemsReward: 3000,
    badgeEmoji: '🏆',
    titleReward: 'Immortal Champion'
  },
  {
    id: 'yearly_tycoon_emperor',
    title: 'Galactic Tycoon Emperor',
    period: 'yearly',
    category: 'gold',
    criteriaText: 'Amass 1,000,000+ Lifetime Gold Fortune',
    minRequirement: 1000000,
    coinsReward: 100000,
    gemsReward: 2500,
    badgeEmoji: '🌟',
    titleReward: 'Grand Emperor'
  },
  {
    id: 'yearly_power_titan',
    title: 'Apex Titan Sovereign',
    period: 'yearly',
    category: 'overall_power',
    criteriaText: 'Attain 5,000+ Power Score',
    minRequirement: 5000,
    coinsReward: 100000,
    gemsReward: 2000,
    badgeEmoji: '⚡',
    titleReward: 'Titan Sovereign'
  }
];
