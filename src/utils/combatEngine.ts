import { GameState, PowerUp, Boss } from '../types';
import { POWERUPS, BOSSES } from '../data';

export const getPowerupData = (id: string): PowerUp | undefined => POWERUPS.find(p => p.id === id);
export const getBossData = (id: string): Boss | undefined => BOSSES.find(b => b.id === id);

export const getBossHP = (bossId: string, totalBossesDefeated: number = 0): number => {
  const boss = getBossData(bossId);
  if (!boss) return 100;
  return Math.floor(boss.baseHP + (totalBossesDefeated * 25));
};

export const getBossAttack = (bossId: string, totalBossesDefeated: number = 0): number => {
  const boss = getBossData(bossId);
  if (!boss) return 10;
  return Math.floor(boss.baseAttack + (totalBossesDefeated * 3));
};

export const getBossPowerReq = (bossId: string, totalBossesDefeated: number = 0): number => {
  const boss = getBossData(bossId);
  if (!boss) return 0;
  return Math.floor(boss.powerReq + (totalBossesDefeated * 10));
};

export const getPassiveYield = (gameState: GameState): number => {
  let yieldPerSec = 0;
  gameState.powerups.forEach(p => {
    if (p.owned) {
      const data = getPowerupData(p.id);
      if (data) {
        yieldPerSec += data.baseRate * p.quantity * (1 + (p.level - 1) * 0.5);
      }
    }
  });
  return yieldPerSec;
};

export const getTotalAttack = (gameState: GameState): number => {
  let atk = gameState.baseAttack !== undefined ? gameState.baseAttack : 10;
  gameState.powerups.forEach(p => {
    if (p.owned) {
      const data = getPowerupData(p.id);
      if (data) atk += data.attack * p.quantity * p.level;
    }
  });
  if (gameState.damageBonusPercent) {
    atk = Math.floor(atk * (1 + (gameState.damageBonusPercent / 100)));
  }
  return atk;
};

export const getTotalDefense = (gameState: GameState): number => {
  let def = gameState.baseDefense !== undefined ? gameState.baseDefense : 5;
  gameState.powerups.forEach(p => {
    if (p.owned) {
      const data = getPowerupData(p.id);
      if (data) def += data.defense * p.quantity * p.level;
    }
  });
  return def;
};

export const getTotalSpeed = (gameState: GameState): number => {
  let spd = gameState.baseSpeed !== undefined ? gameState.baseSpeed : 10;
  gameState.powerups.forEach(p => {
    if (p.owned) {
      const data = getPowerupData(p.id);
      if (data) spd += data.speed * p.quantity * p.level;
    }
  });
  return spd;
};

export const getNormalMaxHP = (gameState: GameState): number => {
  return 100 + getTotalDefense(gameState) + (gameState.maxHpBonus || 0);
};

export const getPowerScore = (gameState: GameState): number => {
  return Math.floor(
    getTotalAttack(gameState) * 1.5 + 
    getTotalDefense(gameState) * 1.2 + 
    getTotalSpeed(gameState) * 0.8
  );
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
}

/**
 * Calculates a single combat turn between Player and Boss
 */
export const calculateCombatTurn = (
  gameState: GameState,
  bossId: string,
  currentBossHP: number,
  currentPlayerHP: number
): TurnResult => {
  const playerAtk = getTotalAttack(gameState);
  const playerDef = getTotalDefense(gameState);
  const bossAtk = getBossAttack(bossId, gameState.totalBossesDefeated);

  // Player attack calculation
  let damage = Math.max(1, Math.floor(playerAtk * (0.8 + Math.random() * 0.4)));
  const isCrit = Math.random() < 0.15;
  if (isCrit) {
    damage = Math.floor(damage * 2);
  }

  let specialTrigger: { name: string; emoji: string; effectText: string } | undefined;
  let isSupernova = false;

  if (Math.random() < 0.12) {
    const ownedSpecials = gameState.powerups.filter(p => p.owned && p.quantity > 0);
    if (ownedSpecials.length > 0) {
      const randomSpecial = ownedSpecials[Math.floor(Math.random() * ownedSpecials.length)];
      const itemData = getPowerupData(randomSpecial.id);
      if (itemData) {
        specialTrigger = {
          name: itemData.id,
          emoji: itemData.emoji,
          effectText: itemData.special
        };
        if (itemData.id === 'Star Fragment' && Math.random() < 0.1) {
          isSupernova = true;
        } else if (itemData.id === 'Void Orb') {
          damage = Math.floor(damage * 1.6);
        } else if (itemData.id === 'Dragon Scale' && Math.random() < 0.3) {
          damage = Math.floor(damage * 1.3);
        }
      }
    }
  }

  // Boss attack calculation
  const isDodge = Math.random() < 0.2;
  let playerDamageTaken = 0;
  if (!isDodge) {
    const defenseMultiplier = Math.min(0.8, playerDef / 150);
    let actualBossDamage = Math.max(1, Math.floor(bossAtk * (0.7 + Math.random() * 0.6)));
    playerDamageTaken = Math.floor(actualBossDamage * (1 - defenseMultiplier));
  }

  return {
    playerDamage: damage,
    isCrit,
    specialTrigger,
    isSupernova,
    bossDamageTaken: damage,
    playerDamageTaken,
    isDodge
  };
};
