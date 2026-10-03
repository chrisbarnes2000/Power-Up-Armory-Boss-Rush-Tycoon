import { GameState, PowerUp, Boss } from '../types';
import { POWERUPS, BOSSES } from '../data';

export const getPowerupData = (id: string): PowerUp | undefined => POWERUPS.find(p => p.id === id);
export const getBossData = (id: string): Boss | undefined => BOSSES.find(b => b.id === id);

export const getBossHP = (bossId: string, totalBossesDefeated: number = 0): number => {
  const boss = getBossData(bossId);
  if (!boss) return 100;
  // Scaled progressive HP curve per defeat milestone
  const scale = 1 + (totalBossesDefeated * 0.08);
  return Math.floor(boss.baseHP * scale);
};

export const getBossAttack = (bossId: string, totalBossesDefeated: number = 0): number => {
  const boss = getBossData(bossId);
  if (!boss) return 10;
  const scale = 1 + (totalBossesDefeated * 0.05);
  return Math.floor(boss.baseAttack * scale);
};

export const getBossPowerReq = (bossId: string, totalBossesDefeated: number = 0): number => {
  const boss = getBossData(bossId);
  if (!boss) return 0;
  const scale = 1 + (totalBossesDefeated * 0.04);
  return Math.floor(boss.powerReq * scale);
};

export const getPassiveYield = (gameState: GameState): number => {
  let yieldPerSec = 0;
  gameState.powerups.forEach(p => {
    if (p.owned && p.quantity > 0) {
      const data = getPowerupData(p.id);
      if (data) {
        yieldPerSec += data.baseRate * p.quantity * (1 + (p.level - 1) * 0.5);
      }
    }
  });
  return Math.round(yieldPerSec * 10) / 10;
};

export const getTotalAttack = (gameState: GameState): number => {
  let atk = gameState.baseAttack !== undefined ? gameState.baseAttack : 10;
  gameState.powerups.forEach(p => {
    if (p.owned && p.quantity > 0) {
      const data = getPowerupData(p.id);
      if (data) {
        // Diminishing returns scaling on bulk duplicate copies so level progression matters
        const effectiveQty = 1 + Math.log2(p.quantity);
        atk += Math.floor(data.attack * effectiveQty * p.level);
      }
    }
  });
  if (gameState.damageBonusPercent) {
    atk = Math.floor(atk * (1 + (gameState.damageBonusPercent / 100)));
  }
  return Math.max(5, atk);
};

export const getTotalDefense = (gameState: GameState): number => {
  let def = gameState.baseDefense !== undefined ? gameState.baseDefense : 5;
  gameState.powerups.forEach(p => {
    if (p.owned && p.quantity > 0) {
      const data = getPowerupData(p.id);
      if (data) {
        const effectiveQty = 1 + Math.log2(p.quantity);
        def += Math.floor(data.defense * effectiveQty * p.level);
      }
    }
  });
  return Math.max(0, def);
};

export const getTotalSpeed = (gameState: GameState): number => {
  let spd = gameState.baseSpeed !== undefined ? gameState.baseSpeed : 10;
  gameState.powerups.forEach(p => {
    if (p.owned && p.quantity > 0) {
      const data = getPowerupData(p.id);
      if (data) {
        const effectiveQty = 1 + Math.log2(p.quantity);
        spd += Math.floor(data.speed * effectiveQty * p.level);
      }
    }
  });
  return Math.max(1, spd);
};

// --- COMBAT ATTRIBUTES: FOCUS, STEALTH, ACCURACY, REFLECT ---
export const getPlayerFocus = (gameState: GameState): number => {
  let focus = 0;
  gameState.powerups.forEach(p => {
    if (p.owned && p.quantity > 0) {
      if (p.id === 'Focus Blade') focus += 15 * p.level;
      if (p.id === 'Speed Dagger') focus += 10 * p.level;
      if (p.id === 'Star Fragment') focus += 30 * p.level;
    }
  });
  return focus;
};

export const getCritChance = (gameState: GameState): number => {
  const focus = getPlayerFocus(gameState);
  // Base 15% crit chance, +1% per 10 Focus points, capped at 50% max
  return Math.min(0.50, 0.15 + (focus * 0.001));
};

export const getPlayerStealth = (gameState: GameState): number => {
  let stealth = 0;
  gameState.powerups.forEach(p => {
    if (p.owned && p.quantity > 0) {
      if (p.id === 'Cloak of Shadows') stealth += 35 * p.level;
      if (p.id === 'Wing Charm') stealth += 15 * p.level;
      if (p.id === 'Phantom Dust') stealth += 20 * p.level;
    }
  });
  return stealth;
};

export const getDodgeChance = (gameState: GameState): number => {
  const stealth = getPlayerStealth(gameState);
  // Base 15% dodge chance, +1% per 15 Stealth points, capped at 40% max
  return Math.min(0.40, 0.15 + (stealth * 0.0008));
};

export const hasPrecisionAccuracy = (gameState: GameState): boolean => {
  const lens = gameState.powerups.find(p => p.id === 'Laser Lens');
  return !!(lens && lens.owned && lens.quantity > 0);
};

export const hasTrueDamage = (gameState: GameState): boolean => {
  const orb = gameState.powerups.find(p => p.id === 'Void Orb');
  return !!(orb && orb.owned && orb.quantity > 0);
};

export const hasDamageReflection = (gameState: GameState): boolean => {
  const shield = gameState.powerups.find(p => p.id === 'Magnetite Shield');
  return !!(shield && shield.owned && shield.quantity > 0);
};

export const getNormalMaxHP = (gameState: GameState): number => {
  return Math.max(10, 100 + getTotalDefense(gameState) + (gameState.maxHpBonus || 0));
};

export const getPowerScore = (gameState: GameState): number => {
  const basePS = Math.floor(
    getTotalAttack(gameState) * 1.5 + 
    getTotalDefense(gameState) * 1.2 + 
    getTotalSpeed(gameState) * 0.8
  );

  // Kill v Death Streak Bonuses
  const kStreak = gameState.killStreak || 0;
  const dStreak = gameState.deathStreak || 0;

  let multiplier = 1.0;
  if (kStreak > 0) {
    multiplier += Math.min(0.50, kStreak * 0.05);
  }
  if (dStreak > 0) {
    multiplier += Math.min(0.30, dStreak * 0.05);
  }

  return Math.floor(basePS * multiplier);
};

export const getCurrentReviveCost = (gameState: GameState): number => {
  const config = gameState.balanceConfig || {
    baseReviveCost: 100,
    reviveCostMultiplier: 1.5,
    goldDropChance: 70,
    gemDropChance: 35,
    goldMultiplier: 1.0,
    gemMultiplier: 1.0
  };
  const revives = gameState.reviveCount || 0;
  return Math.floor(config.baseReviveCost * Math.pow(config.reviveCostMultiplier, revives));
};

export interface TurnResult {
  playerDamage: number;
  isCrit: boolean;
  specialTrigger?: { name: string; emoji: string; effectText: string };
  isSupernova?: boolean;
  bossDamageTaken: number;
  playerDamageTaken: number;
  isDodge: boolean;
  reflectedDamage?: number;
  isBossDodged?: boolean;
  bossMechanicNote?: string;
}

/**
 * Calculates a single tactical combat turn between Player and Boss
 */
export const calculateCombatTurn = (
  gameState: GameState,
  bossId: string,
  currentBossHP: number,
  currentPlayerHP: number,
  turnNumber: number = 1
): TurnResult => {
  const playerAtk = getTotalAttack(gameState);
  const playerDef = getTotalDefense(gameState);
  let bossAtk = getBossAttack(bossId, gameState.totalBossesDefeated);
  const boss = getBossData(bossId);

  // --- 1. PLAYER ATTACK TURN ---
  let damage = Math.max(5, Math.floor(playerAtk * (0.85 + Math.random() * 0.3)));
  
  // Focus Critical Strike calculation
  const critChance = getCritChance(gameState);
  const isCrit = Math.random() < critChance;
  if (isCrit) {
    damage = Math.floor(damage * 2.2);
  }

  // Active Technique calculation (15% base trigger chance)
  let specialTrigger: { name: string; emoji: string; effectText: string } | undefined;
  let isSupernova = false;

  const ownedSpecials = gameState.powerups.filter(p => p.owned && p.quantity > 0);
  if (Math.random() < 0.16 && ownedSpecials.length > 0) {
    const randomSpecial = ownedSpecials[Math.floor(Math.random() * ownedSpecials.length)];
    const itemData = getPowerupData(randomSpecial.id);
    if (itemData) {
      specialTrigger = {
        name: itemData.id,
        emoji: itemData.emoji,
        effectText: itemData.special
      };
      if (itemData.id === 'Star Fragment') {
        damage = Math.floor(damage * 3.5);
        if (Math.random() < 0.05 && bossId !== 'Star Eater') {
          isSupernova = true;
        }
      } else if (itemData.id === 'Void Orb') {
        damage = Math.floor(damage * 1.8);
      } else if (itemData.id === 'Dragon Scale') {
        damage = Math.floor(damage * 1.4);
      } else if (itemData.id === 'Speed Dagger') {
        damage = Math.floor(damage * 1.5);
      } else if (itemData.id === 'Rage Axe') {
        const bonusRatio = 1 + Math.min(0.5, turnNumber * 0.05);
        damage = Math.floor(damage * bonusRatio);
      }
    }
  }

  // Boss Armor & Mechanics calculation
  let bossMechanicNote: string | undefined;
  let isBossDodged = false;

  if (bossId === 'Shadow Assassin' && !hasPrecisionAccuracy(gameState)) {
    // Shadow Assassin has 30% dodge without Laser Lens
    if (Math.random() < 0.30) {
      isBossDodged = true;
      damage = 0;
      bossMechanicNote = 'Shadow Assassin phased through the strike!';
    }
  }

  if (bossId === 'Goblin King' && turnNumber === 1) {
    // Goblin King Minion shield absorbs turn 1 strike
    damage = Math.floor(damage * 0.3);
    bossMechanicNote = 'Goblin minions intercepted the brunt of the strike!';
  }

  if (bossId === 'Elder Titan' && !hasTrueDamage(gameState)) {
    // Stone Carapace absorbs 35% physical damage
    damage = Math.floor(damage * 0.65);
    bossMechanicNote = 'Elder Titan Stone Carapace blunted physical trauma (-35%)';
  }

  if (bossId === 'Orc Warlord' && currentBossHP <= (boss?.baseHP || 850) * 0.5) {
    // Enraged Orc deals 50% more attack
    bossAtk = Math.floor(bossAtk * 1.5);
    bossMechanicNote = 'Orc Warlord is ENRAGED (+50% attack power)!';
  }

  // --- 2. BOSS ATTACK TURN ---
  const dodgeChance = getDodgeChance(gameState);
  let isDodge = Math.random() < dodgeChance;

  // Cloak of Shadows guaranteed stealth dodge on turn 1
  const cloak = gameState.powerups.find(p => p.id === 'Cloak of Shadows');
  if (cloak && cloak.owned && turnNumber === 1) {
    isDodge = true;
  }

  let playerDamageTaken = 0;
  let reflectedDamage = 0;

  if (!isDodge) {
    const defenseReduction = Math.min(0.75, playerDef / (playerDef + 250));
    let rawBossDamage = Math.max(3, Math.floor(bossAtk * (0.8 + Math.random() * 0.4)));
    
    // Dragon Wyrm pierces 50% defense
    if (bossId === 'Dragon Wyrm') {
      playerDamageTaken = Math.max(5, Math.floor(rawBossDamage * (1 - (defenseReduction * 0.5))));
    } else {
      playerDamageTaken = Math.max(2, Math.floor(rawBossDamage * (1 - defenseReduction)));
    }

    // Magnetite Shield reflection
    if (hasDamageReflection(gameState)) {
      reflectedDamage = Math.floor(playerDamageTaken * 0.25);
    }
  }

  return {
    playerDamage: damage,
    isCrit,
    specialTrigger,
    isSupernova,
    bossDamageTaken: isBossDodged ? 0 : (damage + reflectedDamage),
    playerDamageTaken,
    isDodge,
    reflectedDamage: reflectedDamage > 0 ? reflectedDamage : undefined,
    isBossDodged,
    bossMechanicNote
  };
};
