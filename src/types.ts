export interface Pack {
  label: string;
  price: number;
}

export interface PowerUp {
  id: string;
  emoji: string;
  baseRate: number;
  maxLevel: number;
  upgradeCost: number;
  attack: number;
  defense: number;
  speed: number;
  special: string;
  description: string;
  effect: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | '??';
  packs: Pack[];
  comingSoon?: boolean;
}

export interface Boss {
  id: string;
  emoji: string;
  baseHP: number;
  baseAttack: number;
  reward: number;
  powerReq: number;
  special: string;
}

export interface PurchaseItem {
  id: string;
  pack: string;
  qty: number;
  price: number;
  emoji: string;
}

export interface TempPayloadItem {
  id: string;
  qty: number;
  emoji: string;
  pack?: string;
  price?: number;
}

export interface PurchaseRecord {
  code: string;
  items: PurchaseItem[];
  total: number;
  date: string;
  redeemed: boolean;
}

export interface GamePowerUpState {
  id: string;
  owned: boolean;
  level: number;
  quantity: number;
}

export interface GameBossState {
  id: string;
  defeated: boolean;
  respawnTime?: number;
}

export interface LeaderboardEntry {
  userId?: string;
  name: string;
  score: number;
  bosses: number;
  coins: number;
  avatar?: string;
  title?: string;
  updatedAt?: string;
}

export interface UserProfile {
  userId: string;
  email?: string;
  displayName: string;
  avatar?: string;
  title?: string;
  powerScore?: number;
  totalBossesDefeated?: number;
  coins?: number;
  isAdmin?: boolean;
  isArmoryStoreEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomStoryEntry {
  id: string;
  title: string;
  date: string;
  bossId: string;
  featuredItems: string[];
  outcome: 'victory' | 'defeat' | 'close-call' | 'heroic';
  storyText: string;
  author: string;
}

export interface BattleLogEntry {
  message: string;
  className: string;
  timestamp?: string;
}

export interface GameBalanceConfig {
  baseReviveCost: number;       // Base coin cost for revival (e.g. 100)
  reviveCostMultiplier: number; // Scaling factor per revive (e.g. 1.5)
  goldDropChance: number;       // Chance % for boss to drop gold (0 - 100)
  gemDropChance: number;        // Chance % for boss to drop gems (0 - 100)
  goldMultiplier: number;       // Gold yield multiplier (e.g. 1.0)
  gemMultiplier: number;        // Gem yield multiplier (e.g. 1.0)
  permUpgradeLimitPerFight?: number; // Limit of each perm upgrade between fights (e.g. 3)
}

export interface GameState {
  coins: number;
  gems: number;
  maxHpBonus: number;
  damageBonusPercent: number;
  powerups: GamePowerUpState[];
  bosses: GameBossState[];
  powerScore: number;
  totalBossesDefeated: number;
  playerName: string;
  battleLog: { message: string; className: string }[];
  leaderboard: LeaderboardEntry[];
  purchasedCodes: PurchaseRecord[];
  bossKillStats?: { [bossId: string]: number };
  bossDeathStats?: { [bossId: string]: number };
  customStories?: CustomStoryEntry[];
  
  // Player Death & Revive Progression
  isDead?: boolean;
  reviveCount?: number;
  revivePacks?: number;
  balanceConfig?: GameBalanceConfig;
  killStreak?: number;
  deathStreak?: number;

  // Completed Tour Rewards Tracking (One-time payouts)
  completedTours?: {
    short?: boolean;
    full?: boolean;
  };

  // Pre-fight upgrade counters (Tracked between boss fights)
  hpUpgradesInCurrentFightCount?: number;
  dmgUpgradesInCurrentFightCount?: number;

  // Base Character Stats Override (allows true 0 PS / 0 Armor resets)
  baseAttack?: number;
  baseDefense?: number;
  baseSpeed?: number;
}
