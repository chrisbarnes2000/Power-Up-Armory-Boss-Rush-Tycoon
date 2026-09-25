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
}
