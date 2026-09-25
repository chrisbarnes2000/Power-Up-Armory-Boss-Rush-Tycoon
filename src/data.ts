import { PowerUp, Boss } from './types';

export const POWERUPS: PowerUp[] = [
  // --- WEAPONS ---
  {
    id: 'Focus Blade',
    emoji: '🗡️',
    baseRate: 0.5,
    maxLevel: 10,
    upgradeCost: 50,
    attack: 15,
    defense: 0,
    speed: 5,
    special: 'Precision Strike — 3x damage, 20% chance',
    description: "A blade forged from pure concentration. Cuts through distractions with surgical precision.",
    effect: "+15% focus, +10% accuracy",
    rarity: 'Common',
    packs: [{ label: 'Shard', price: 40 }, { label: '10-Pack', price: 350 }]
  },
  {
    id: 'Rage Axe',
    emoji: '🔥',
    baseRate: 0.8,
    maxLevel: 10,
    upgradeCost: 75,
    attack: 12,
    defense: 0,
    speed: 0,
    special: 'Berserk — +5 attack per stack (max 10)',
    description: "Channel your inner fury. Each swing grows stronger as your anger builds.",
    effect: "+5% damage per stack, stacks up to 10",
    rarity: 'Common',
    packs: [{ label: 'Single', price: 45 }]
  },
  {
    id: 'Speed Dagger',
    emoji: '⚡',
    baseRate: 1.0,
    maxLevel: 10,
    upgradeCost: 100,
    attack: 8,
    defense: 0,
    speed: 20,
    special: 'Flurry — 2 hits per turn',
    description: "Light as a feather, sharp as lightning. Strike before your enemy blinks.",
    effect: "+25% attack speed, +5% dodge",
    rarity: 'Uncommon',
    packs: [{ label: 'Single', price: 15 }, { label: '10-Pack', price: 120 }]
  },
  {
    id: 'Shield Breaker',
    emoji: '🔨',
    baseRate: 1.5,
    maxLevel: 8,
    upgradeCost: 150,
    attack: 25,
    defense: -10,
    speed: 0,
    special: 'Shatter — Ignores 40% armor',
    description: "Designed to shatter even the strongest defenses. The ultimate anti-armor weapon.",
    effect: "Ignores 40% of enemy armor",
    rarity: 'Rare',
    packs: [{ label: 'Single', price: 50 }, { label: '10-Pack', price: 400 }]
  },
  {
    id: 'Wing Charm',
    emoji: '🕊️',
    baseRate: 2.0,
    maxLevel: 8,
    upgradeCost: 200,
    attack: 5,
    defense: 5,
    speed: 15,
    special: 'Dodge — 30% evasion',
    description: "A feather from a celestial being. Grants the wearer temporary flight and grace.",
    effect: "+20% mobility, +10% evasion",
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
    effect: "??? — Coming Soon",
    rarity: '??',
    packs: [],
    comingSoon: true
  },

  // --- DEFENSE ---
  {
    id: 'Magnetite Shield',
    emoji: '🧲',
    baseRate: 1.2,
    maxLevel: 10,
    upgradeCost: 120,
    attack: 0,
    defense: 30,
    speed: 0,
    special: 'Reflect — Reflects 25% damage',
    description: "A shield that attracts danger and repels harm. The more you're hit, the stronger it gets.",
    effect: "Reflects 30% of damage, stacks defense",
    rarity: 'Uncommon',
    packs: [{ label: 'Single', price: 20 }, { label: '30-Pack', price: 450 }]
  },
  {
    id: 'Cloak of Shadows',
    emoji: '👻',
    baseRate: 1.8,
    maxLevel: 8,
    upgradeCost: 180,
    attack: 10,
    defense: 10,
    speed: 10,
    special: 'Shadow Step — 50% dodge first hit',
    description: "Woven from the fabric of night itself. Become one with the darkness.",
    effect: "+50% stealth, -20% enemy accuracy",
    rarity: 'Rare',
    packs: [{ label: 'Single', price: 30 }]
  },
  {
    id: 'Titan Armor',
    emoji: '💪',
    baseRate: 3.0,
    maxLevel: 5,
    upgradeCost: 300,
    attack: 0,
    defense: 50,
    speed: -10,
    special: 'Bulwark — Reduces damage by 50%',
    description: "Forged from the bones of ancient giants. Unbreakable, unstoppable, undeniable.",
    effect: "+200% defense, +50% health pool",
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
    baseRate: 2.5,
    maxLevel: 6,
    upgradeCost: 250,
    attack: 20,
    defense: 0,
    speed: 5,
    special: 'Focus Beam — 100% accuracy',
    description: "Focuses light into a devastating beam. Precision and power in one.",
    effect: "+100% ranged damage, perfect accuracy",
    rarity: 'Uncommon',
    packs: [{ label: '1-Tab', price: 15 }, { label: '10-Tabs', price: 120 }]
  },
  {
    id: 'Phantom Dust',
    emoji: '🌫️',
    baseRate: 3.5,
    maxLevel: 5,
    upgradeCost: 350,
    attack: 15,
    defense: 5,
    speed: 15,
    special: 'Phase — 20% ethereal damage',
    description: "Spectral particles that phase through reality. Useful for both offense and escape.",
    effect: "Pass through walls, +30% ethereal damage",
    rarity: 'Epic',
    packs: [{ label: 'pt.', price: 15 }, { label: 'g.', price: 120 }]
  },
  {
    id: 'Dragon Scale',
    emoji: '🐉',
    baseRate: 5.0,
    maxLevel: 5,
    upgradeCost: 500,
    attack: 18,
    defense: 15,
    speed: 0,
    special: 'Fire Breath — 30% bonus damage',
    description: "A scale from the ancient dragon king. Imbued with elemental fury.",
    effect: "+40% fire resistance, +25% breath attack damage",
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
    baseRate: 8.0,
    maxLevel: 3,
    upgradeCost: 800,
    attack: 10,
    defense: 10,
    speed: 5,
    special: 'Revive — Resurrect once with 50% HP',
    description: "A feather that burns with eternal flame. Death is merely a reset button.",
    effect: "Revive once per battle at 50% health",
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
    baseRate: 12.0,
    maxLevel: 3,
    upgradeCost: 1200,
    attack: 30,
    defense: -20,
    speed: 0,
    special: 'Oblivion — 100% true damage',
    description: "A sphere of pure nothingness. It consumes all that stands before it.",
    effect: "Deals 100% true damage, ignores all resistances",
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
    baseRate: 15.0,
    maxLevel: 3,
    upgradeCost: 1500,
    attack: 25,
    defense: 0,
    speed: 10,
    special: 'Supernova — 10% chance to instant kill',
    description: "A shard from a dying star. Contains the power of a supernova in a tiny crystal.",
    effect: "+500% critical damage, 10% chance to obliterate",
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
  { id: 'Goblin King', emoji: '👹', baseHP: 100, baseAttack: 10, reward: 50, powerReq: 50, special: 'Summons minions' },
  { id: 'Orc Warlord', emoji: '💀', baseHP: 250, baseAttack: 25, reward: 150, powerReq: 150, special: 'Rages at 50% HP' },
  { id: 'Shadow Assassin', emoji: '👤', baseHP: 400, baseAttack: 40, reward: 300, powerReq: 300, special: 'Dodges 30% attacks' },
  { id: 'Dragon Wyrm', emoji: '🐉', baseHP: 800, baseAttack: 60, reward: 500, powerReq: 500, special: 'Fire breath (AoE)' },
  { id: 'Lich King', emoji: '💀', baseHP: 1200, baseAttack: 80, reward: 800, powerReq: 800, special: 'Revives once' },
  { id: 'Elder Titan', emoji: '🪨', baseHP: 2000, baseAttack: 100, reward: 1200, powerReq: 1200, special: 'Armor (50% reduction)' },
  { id: 'Void Serpent', emoji: '🐍', baseHP: 3000, baseAttack: 150, reward: 2000, powerReq: 1800, special: 'Poison (damage over time)' },
  { id: 'Star Eater', emoji: '⭐', baseHP: 5000, baseAttack: 200, reward: 5000, powerReq: 2500, special: 'Obliterate (30% instant kill)' }
];

export function calculatePowerScore(gameState: { powerups: { id: string; owned: boolean; level: number; quantity: number }[]; totalBossesDefeated: number }): number {
  let score = 0;
  gameState.powerups.forEach(ps => {
    if (ps.owned) {
      const data = POWERUPS.find(p => p.id === ps.id);
      if (data) {
        const statScore = data.attack + Math.max(0, data.defense) + Math.max(0, data.speed);
        score += statScore + (ps.level * 10) + (ps.quantity * 5);
      }
    }
  });
  score += gameState.totalBossesDefeated * 25;
  return Math.floor(score);
}
