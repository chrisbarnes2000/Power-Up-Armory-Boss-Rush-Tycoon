import { PowerUp, Boss, GameBalanceConfig, GameState } from './types';

export const DEFAULT_BALANCE_CONFIG: GameBalanceConfig = {
  baseReviveCost: 100,
  reviveCostMultiplier: 1.5,
  goldDropChance: 70,
  gemDropChance: 35,
  goldMultiplier: 1.0,
  gemMultiplier: 1.0,
  permUpgradeLimitPerFight: 3,
  disableQuickSyncCheck: false
};

export const DEFAULT_HERO_BASELINE = {
  starter: {
    baseAttack: 10,
    baseDefense: 10,
    baseSpeed: 10,
    coins: 2000,
    gems: 500,
    revivePacks: 2,
    powerScore: 35
  },
  absoluteZero: {
    baseAttack: 0,
    baseDefense: 0,
    baseSpeed: 0,
    coins: 0,
    gems: 0,
    revivePacks: 0,
    powerScore: 0
  }
};

export const POWERUPS: PowerUp[] = [
  // --- WEAPONS ---
  {
    id: 'Focus Blade',
    emoji: '🗡️',
    baseRate: 1.5,
    maxLevel: 10,
    upgradeCost: 50,
    attack: 15,
    defense: 0,
    speed: 5,
    special: 'Precision Strike — 3x damage, +15% Focus Crit chance',
    description: "A blade forged from pure concentration. Cuts through distractions with surgical precision.",
    effect: "+15% Focus (Boosts Critical Strike chance up to 50% max)",
    rarity: 'Common',
    packs: [{ label: 'Shard', price: 40 }, { label: '10-Pack', price: 350 }]
  },
  {
    id: 'Rage Axe',
    emoji: '🔥',
    baseRate: 2.0,
    maxLevel: 10,
    upgradeCost: 75,
    attack: 14,
    defense: 0,
    speed: 0,
    special: 'Berserk Fury — Escalating combat damage per turn',
    description: "Channel your inner fury. Each swing grows stronger as your anger builds.",
    effect: "+5% damage per turn in battle, stacks up to 10x",
    rarity: 'Common',
    packs: [{ label: 'Single', price: 45 }]
  },
  {
    id: 'Speed Dagger',
    emoji: '⚡',
    baseRate: 2.5,
    maxLevel: 10,
    upgradeCost: 100,
    attack: 10,
    defense: 0,
    speed: 20,
    special: 'Flurry Strike — Rapid dual strikes per turn',
    description: "Light as a feather, sharp as lightning. Strike before your enemy blinks.",
    effect: "+20 Speed, +5% Dodge Chance and +10% Focus",
    rarity: 'Uncommon',
    packs: [{ label: 'Single', price: 15 }, { label: '10-Pack', price: 120 }]
  },
  {
    id: 'Shield Breaker',
    emoji: '🔨',
    baseRate: 3.5,
    maxLevel: 8,
    upgradeCost: 150,
    attack: 28,
    defense: -5,
    speed: 0,
    special: 'Armor Shatter — Bypasses 50% boss defense',
    description: "Designed to shatter even the strongest defenses. The ultimate anti-armor weapon.",
    effect: "Shatters 50% of boss armor mitigation",
    rarity: 'Rare',
    packs: [{ label: 'Single', price: 50 }, { label: '10-Pack', price: 400 }]
  },
  {
    id: 'Wing Charm',
    emoji: '🕊️',
    baseRate: 4.0,
    maxLevel: 8,
    upgradeCost: 200,
    attack: 8,
    defense: 8,
    speed: 18,
    special: 'Celestial Grace — Evades incoming lethal blows',
    description: "A feather from a celestial being. Grants the wearer temporary flight and grace.",
    effect: "+15% Stealth Dodge and +18 Speed",
    rarity: 'Rare',
    packs: [
      { label: '1g', price: 12 },
      { label: '3.5g', price: 30 },
      { label: '7g', price: 60 },
      { label: '14g', price: 120 },
      { label: 'Ziplock', price: 160 }
    ]
  },
  {
    id: '???.???',
    emoji: '❓',
    baseRate: 0.0,
    maxLevel: 1,
    upgradeCost: 9999,
    attack: 0,
    defense: 0,
    speed: 0,
    special: 'TBD',
    description: "A mysterious artifact waiting to be unlocked.",
    effect: "??? — Classified Armory Blueprint",
    rarity: '??',
    packs: [],
    comingSoon: true
  },

  // --- DEFENSE ---
  {
    id: 'Magnetite Shield',
    emoji: '🧲',
    baseRate: 3.0,
    maxLevel: 10,
    upgradeCost: 120,
    attack: 0,
    defense: 30,
    speed: 0,
    special: 'Reflect — Reflects 25% damage back on boss',
    description: "A shield that attracts danger and repels harm. The more you're hit, the stronger it gets.",
    effect: "+30 Defense, reflects 25% damage back on boss",
    rarity: 'Uncommon',
    packs: [{ label: 'Single', price: 20 }, { label: '30-Pack', price: 450 }]
  },
  {
    id: 'Cloak of Shadows',
    emoji: '👻',
    baseRate: 4.5,
    maxLevel: 8,
    upgradeCost: 180,
    attack: 10,
    defense: 15,
    speed: 15,
    special: 'Shadow Step — 100% dodge on turn 1 or critical HP',
    description: "Woven from the fabric of night itself. Become one with the darkness.",
    effect: "+35% Stealth (+1% Dodge per 15% Stealth, up to 40% max)",
    rarity: 'Rare',
    packs: [{ label: 'Single', price: 30 }]
  },
  {
    id: 'Titan Armor',
    emoji: '💪',
    baseRate: 7.0,
    maxLevel: 5,
    upgradeCost: 300,
    attack: 0,
    defense: 65,
    speed: -10,
    special: 'Bulwark — Reduces all incoming boss damage by 40%',
    description: "Forged from the bones of ancient giants. Unbreakable, unstoppable, undeniable.",
    effect: "+65 Defense, absorbs 40% of all incoming damage",
    rarity: 'Epic',
    packs: [
      { label: '1/8th', price: 20 },
      { label: '1/4', price: 40 },
      { label: '1/2', price: 80 },
      { label: 'Ziplock', price: 160 }
    ]
  },

  // --- UTILITY ---
  {
    id: 'Laser Lens',
    emoji: '🔫',
    baseRate: 5.5,
    maxLevel: 6,
    upgradeCost: 250,
    attack: 25,
    defense: 0,
    speed: 8,
    special: 'Focus Beam — 100% True Precision',
    description: "Focuses light into a devastating beam. Precision and power in one.",
    effect: "+100% Accuracy (Player attacks can NEVER be dodged by bosses)",
    rarity: 'Uncommon',
    packs: [{ label: '1-Tab', price: 15 }, { label: '10-Tabs', price: 120 }]
  },
  {
    id: 'Phantom Dust',
    emoji: '🌫️',
    baseRate: 8.0,
    maxLevel: 5,
    upgradeCost: 350,
    attack: 18,
    defense: 10,
    speed: 18,
    special: 'Phase Shift — 25% ethereal damage bypass',
    description: "Spectral particles that phase through reality. Useful for both offense and escape.",
    effect: "+20% Stealth, strikes bypass physical shields",
    rarity: 'Epic',
    packs: [{ label: 'pt.', price: 15 }, { label: 'g.', price: 120 }]
  },
  {
    id: 'Revive Pack',
    emoji: '🩹',
    baseRate: 0.0,
    maxLevel: 10,
    upgradeCost: 50,
    attack: 0,
    defense: 5,
    speed: 0,
    special: 'Instant Revive — Restores 100% HP without paying coin scaling penalty',
    description: "Emergency medical nanites that instantly revive fallen champions at a fraction of the cost.",
    effect: "Bypasses coin revive penalty and restores full health",
    rarity: 'Uncommon',
    packs: [
      { label: 'Single Pack', price: 10 },
      { label: '3-Pack Bundle', price: 25 },
      { label: '10-Pack Chest', price: 75 }
    ]
  },
  {
    id: 'Combat Tonic',
    emoji: '🧪',
    baseRate: 0.0,
    maxLevel: 10,
    upgradeCost: 60,
    attack: 5,
    defense: 0,
    speed: 5,
    special: 'Adrenaline Surge — Increases permanent base damage multiplier by 5% per dose',
    description: "A highly concentrated alchemical brew that permanently hyper-charges the champion's combat reflexes.",
    effect: "+5% Damage Bonus per bought dose",
    rarity: 'Uncommon',
    packs: [
      { label: 'Single Vial', price: 15 },
      { label: '3-Vial Pack', price: 40 },
      { label: 'Apothecary Case', price: 110 }
    ]
  },
  {
    id: 'Dragon Scale',
    emoji: '🐉',
    baseRate: 12.0,
    maxLevel: 5,
    upgradeCost: 500,
    attack: 26,
    defense: 25,
    speed: 0,
    special: 'Dragonfire Breath — 35% bonus fire damage + burn tick',
    description: "A scale from the ancient dragon king. Imbued with elemental fury.",
    effect: "+35% Dragonfire damage, sets boss aflame for ongoing burn",
    rarity: 'Legendary',
    packs: [
      { label: '1/2g', price: 75 },
      { label: '1g', price: 120 },
      { label: '3.5g', price: 340 },
      { label: '7g', price: 660 }
    ]
  },

  // --- MYSTIC ---
  {
    id: 'Phoenix Feather',
    emoji: '🦅',
    baseRate: 16.0,
    maxLevel: 5,
    upgradeCost: 750,
    attack: 22,
    defense: 20,
    speed: 15,
    special: 'Rebirth — Revives once with 50% HP in combat',
    description: "A feather that burns with eternal flame. Death is merely a reset button.",
    effect: "Free mid-combat self-revive once per battle with 50% HP",
    rarity: 'Mythic',
    packs: [
      { label: '1/2g', price: 75 },
      { label: '1g', price: 120 },
      { label: '3.5g', price: 340 },
      { label: '7g', price: 660 },
      { label: '14g', price: 1100 }
    ]
  },
  {
    id: 'Void Orb',
    emoji: '🌌',
    baseRate: 25.0,
    maxLevel: 3,
    upgradeCost: 1200,
    attack: 45,
    defense: -10,
    speed: 0,
    special: 'Oblivion Strike — 100% True Damage',
    description: "A sphere of pure nothingness. It consumes all that stands before it.",
    effect: "Strikes deal 100% True Damage, ignoring all boss armor and resistances",
    rarity: 'Mythic',
    packs: [
      { label: '1/2g', price: 75 },
      { label: '1g', price: 120 },
      { label: '3.5g', price: 340 },
      { label: '7g', price: 660 },
      { label: '14g', price: 1100 }
    ]
  },
  {
    id: 'Star Fragment',
    emoji: '⭐',
    baseRate: 35.0,
    maxLevel: 3,
    upgradeCost: 1500,
    attack: 40,
    defense: 10,
    speed: 15,
    special: 'Supernova — Massive 4x cosmic burst (5% instant obliteration)',
    description: "A shard from a dying star. Contains the power of a supernova in a tiny crystal.",
    effect: "+30% Focus, 4x critical bursts and 5% cosmic vaporization",
    rarity: 'Mythic',
    packs: [
      { label: '1/2g', price: 75 },
      { label: '1g', price: 120 },
      { label: '3.5g', price: 340 },
      { label: '7g', price: 660 },
      { label: '14g', price: 1100 }
    ]
  }
];

export const BOSSES: Boss[] = [
  { id: 'Goblin King', emoji: '👹', baseHP: 350, baseAttack: 16, reward: 75, powerReq: 40, special: 'Minion Phalanx (absorbs 1st strike)' },
  { id: 'Orc Warlord', emoji: '💀', baseHP: 850, baseAttack: 32, reward: 200, powerReq: 120, special: 'Enrage at 50% HP (+50% attack power)' },
  { id: 'Shadow Assassin', emoji: '👤', baseHP: 1600, baseAttack: 55, reward: 450, powerReq: 280, special: 'Shadow Step (dodges 30% without Precision)' },
  { id: 'Dragon Wyrm', emoji: '🐉', baseHP: 3200, baseAttack: 85, reward: 800, powerReq: 550, special: 'Fire Breath (bypasses 50% player armor)' },
  { id: 'Lich King', emoji: '💀', baseHP: 5500, baseAttack: 120, reward: 1400, powerReq: 900, special: 'Undead Phylactery (resurrects at 20% HP once)' },
  { id: 'Elder Titan', emoji: '🪨', baseHP: 9500, baseAttack: 170, reward: 2200, powerReq: 1500, special: 'Stone Carapace (35% physical damage reduction)' },
  { id: 'Void Serpent', emoji: '🐍', baseHP: 16000, baseAttack: 240, reward: 3500, powerReq: 2400, special: 'Void Venom (stacking turn-by-turn poison damage)' },
  { id: 'Star Eater', emoji: '⭐', baseHP: 28000, baseAttack: 350, reward: 6000, powerReq: 3500, special: 'Cosmic Singularity (escalates attack +20% every turn)' }
];

export function calculatePowerScore(gameState: { 
  powerups: { id: string; owned: boolean; level: number; quantity: number }[]; 
  totalBossesDefeated: number;
  baseAttack?: number;
  baseDefense?: number;
  baseSpeed?: number;
  damageBonusPercent?: number;
  killStreak?: number;
  deathStreak?: number;
}): number {
  let atk = gameState.baseAttack !== undefined ? gameState.baseAttack : 10;
  let def = gameState.baseDefense !== undefined ? gameState.baseDefense : 5;
  let spd = gameState.baseSpeed !== undefined ? gameState.baseSpeed : 10;

  (gameState.powerups || []).forEach(p => {
    if (p.owned) {
      const data = POWERUPS.find(pu => pu.id === p.id);
      if (data) {
        atk += data.attack * p.quantity * p.level;
        def += data.defense * p.quantity * p.level;
        spd += data.speed * p.quantity * p.level;
      }
    }
  });

  if (gameState.damageBonusPercent) {
    atk = Math.floor(atk * (1 + (gameState.damageBonusPercent / 100)));
  }

  const baseScore = Math.floor(atk * 1.5 + def * 1.2 + spd * 0.8);
  
  // Kill v Death Streak Bonuses
  const kStreak = gameState.killStreak || 0;
  const dStreak = gameState.deathStreak || 0;
  
  let multiplier = 1.0;
  if (kStreak > 0) {
    // +5% bonus per consecutive kill (up to +50%)
    multiplier += Math.min(0.50, kStreak * 0.05);
  }
  if (dStreak > 0) {
    // +5% underdog adrenaline boost per consecutive death (up to +30%)
    multiplier += Math.min(0.30, dStreak * 0.05);
  }

  return Math.floor(baseScore * multiplier);
}

export const DEFAULT_STARTER_BASELINE_STATE: GameState = {
  coins: 500,
  gems: 100,
  maxHpBonus: 0,
  damageBonusPercent: 0,
  powerups: POWERUPS.map(p => ({
    id: p.id,
    owned: (p.id === 'Revive Pack' || p.id === 'Combat Tonic') ? true : false,
    level: 1,
    quantity: p.id === 'Revive Pack' ? 2 : 0
  })),
  bosses: BOSSES.map(b => ({ id: b.id, defeated: false })),
  powerScore: 35,
  totalBossesDefeated: 0,
  playerName: 'Champion',
  battleLog: [{ message: '⚔️ Welcome, Champion! Defeat bosses to earn rewards.', className: '' }],
  leaderboard: [],
  purchasedCodes: [],
  bossKillStats: {},
  bossDeathStats: {},
  customStories: [],
  isDead: false,
  reviveCount: 0,
  revivePacks: 2,
  baseAttack: 10,
  baseDefense: 10,
  baseSpeed: 10,
  balanceConfig: DEFAULT_BALANCE_CONFIG
};

/**
 * Clears all local storage user progress, battle logs, attribution, and analytics IDs on logout.
 * Resets local game state to clean starter baseline so new logins cannot quick-sync or exploit prior scores.
 */
export function clearAllLocalUserData(): GameState {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('bossRushTycoon');
      localStorage.removeItem('powerupArmory_save');
      localStorage.removeItem('powerupArmory_saved_combat_logs');
      localStorage.removeItem('powerupArmory_log_showTimestamps');
      localStorage.removeItem('powerupArmory_log_persistLogs');
      localStorage.removeItem('armory_user_id');
      localStorage.removeItem('armory_anon_uid');
      localStorage.removeItem('armory_device_client_id');
      localStorage.removeItem('armory_inward_attribution');
      sessionStorage.removeItem('powerup_tour_prompted');
      sessionStorage.removeItem('_vmId');
      sessionStorage.removeItem('_vmDn');
      sessionStorage.removeItem('_vmCtx');
      // Save pristine starter baseline state to bossRushTycoon so subsequent reads get clean starter
      localStorage.setItem('bossRushTycoon', JSON.stringify(DEFAULT_STARTER_BASELINE_STATE));
    } catch (e) {
      console.warn('Error clearing localStorage on logout:', e);
    }
  }
  return DEFAULT_STARTER_BASELINE_STATE;
}
