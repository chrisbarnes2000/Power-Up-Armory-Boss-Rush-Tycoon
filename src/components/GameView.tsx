import React, { useState, useEffect, useRef } from 'react';
import { GameState, UserProfile, LeaderboardEntry, PurchaseRecord, Boss, GameBossState, PowerUp, BattleLogEntry } from '../types';
import { POWERUPS, BOSSES } from '../data';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';

// Combat Engine & Stat Calculation Utilities
import {
  getPowerupData,
  getBossData,
  getBossHP as getBossHPEngine,
  getBossAttack as getBossAttackEngine,
  getBossPowerReq as getBossPowerReqEngine,
  getPassiveYield as getPassiveYieldEngine,
  getTotalAttack as getTotalAttackEngine,
  getTotalDefense as getTotalDefenseEngine,
  getTotalSpeed as getTotalSpeedEngine,
  getNormalMaxHP as getNormalMaxHPEngine,
  getPowerScore as getPowerScoreEngine,
  getCurrentReviveCost as getCurrentReviveCostEngine
} from '../utils/combatEngine';

// Modular Subcomponents
import { TycoonBankrollCard } from './game/TycoonBankrollCard';
import { BattleModal } from './game/BattleModal';
import { StatsLeaderboard } from './game/StatsLeaderboard';
import { KeyRedemptionCard } from './game/KeyRedemptionCard';
import { TycoonGenerators } from './game/TycoonGenerators';
import { BossGauntlet } from './game/BossGauntlet';

export interface GameViewProps {
  initialTab?: 'tycoon' | 'bosses' | 'stats';
  activeTab?: 'tycoon' | 'bosses' | 'stats';
  onTabChange?: (tab: 'tycoon' | 'bosses' | 'stats') => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onOpenLoreBook?: () => void;
  currentUser?: FirebaseUser | null;
  userProfile?: UserProfile | null;
  cloudLeaderboard?: LeaderboardEntry[];
  onOpenAccount?: () => void;
  onSyncLeaderboard?: () => Promise<void>;
  isSyncingLeaderboard?: boolean;
}

export function GameView({ 
  initialTab = 'tycoon',
  activeTab: controlledActiveTab,
  onTabChange,
  gameState, 
  setGameState, 
  onOpenLoreBook,
  currentUser,
  userProfile,
  cloudLeaderboard = [],
  onOpenAccount,
  onSyncLeaderboard,
  isSyncingLeaderboard = false
}: GameViewProps) {
  // Tab state management
  const [activeTab, setActiveTab] = useState<'tycoon' | 'bosses' | 'stats'>(controlledActiveTab || initialTab || 'tycoon');

  useEffect(() => {
    if (controlledActiveTab) {
      setActiveTab(controlledActiveTab);
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [controlledActiveTab, initialTab]);

  const handleTabChange = (tab: 'tycoon' | 'bosses' | 'stats') => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  // Modal & Battle Arena simulation state
  const [isBattleModalOpen, setIsBattleModalOpen] = useState(false);
  const [isFighting, setIsFighting] = useState(false);
  const [activeBossId, setActiveBossId] = useState<string | null>(null);
  const [livePlayerHP, setLivePlayerHP] = useState(100);
  const [livePlayerMaxHP, setLivePlayerMaxHP] = useState(100);
  const [liveBossHP, setLiveBossHP] = useState(100);
  const [liveBossMaxHP, setLiveBossMaxHP] = useState(100);
  const [isRedeemingCode, setIsRedeemingCode] = useState(false);

  // Manual mining clicker mechanics
  const [miningCombo, setMiningCombo] = useState<number>(1);
  const [recentMineGain, setRecentMineGain] = useState<number | null>(null);
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Timestamp & Combat Log LocalStorage Persistence Preferences
  const [showTimestamps, setShowTimestamps] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('powerupArmory_log_showTimestamps');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [persistLogs, setPersistLogs] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('powerupArmory_log_persistLogs');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Battle logs with optional LocalStorage restoration
  const [battleLogs, setBattleLogs] = useState<BattleLogEntry[]>(() => {
    try {
      const isPersist = localStorage.getItem('powerupArmory_log_persistLogs');
      if (isPersist === 'true' || isPersist === null) {
        const savedLogs = localStorage.getItem('powerupArmory_saved_combat_logs');
        if (savedLogs) {
          const parsed = JSON.parse(savedLogs);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not restore saved combat logs:', e);
    }
    const initialTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return [
      { 
        message: 'Equip legendary gear, mine raw gold cores, and conquer titan bosses.', 
        className: 'log-damage',
        timestamp: initialTime
      },
      { 
        message: '🌟 Welcome to the Astral Powerup Armory!', 
        className: 'log-special',
        timestamp: initialTime
      }
    ];
  });

  const logContainerRef = useRef<HTMLDivElement>(null);

  const toggleTimestamps = () => {
    setShowTimestamps(prev => {
      const next = !prev;
      try { localStorage.setItem('powerupArmory_log_showTimestamps', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const togglePersistLogs = () => {
    setPersistLogs(prev => {
      const next = !prev;
      try { 
        localStorage.setItem('powerupArmory_log_persistLogs', JSON.stringify(next));
        if (!next) {
          localStorage.removeItem('powerupArmory_saved_combat_logs');
        } else {
          localStorage.setItem('powerupArmory_saved_combat_logs', JSON.stringify(battleLogs));
        }
      } catch {}
      return next;
    });
  };

  const handleClearLogs = () => {
    const resetLog: BattleLogEntry[] = [{
      message: '🧹 Combat log record cleared.',
      className: 'log-buff',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }];
    setBattleLogs(resetLog);
    if (persistLogs) {
      try {
        localStorage.setItem('powerupArmory_saved_combat_logs', JSON.stringify(resetLog));
      } catch {}
    }
  };

  const addLog = (message: string, className = '') => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setBattleLogs(prev => {
      const nextLogs = [{ message, className, timestamp }, ...prev.slice(0, 99)];
      if (persistLogs) {
        try {
          localStorage.setItem('powerupArmory_saved_combat_logs', JSON.stringify(nextLogs));
        } catch (e) {
          console.warn('Failed to save combat logs to localStorage:', e);
        }
      }
      return nextLogs;
    });
  };

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [battleLogs]);

  const getLogColorStyling = (log: { message: string; className: string }) => {
    switch (log.className) {
      case 'log-reward':
        return 'text-[#f5e56b] font-bold';
      case 'log-victory':
        return 'text-emerald-400 font-extrabold';
      case 'log-defeat':
        return 'text-red-400 font-bold';
      case 'log-special':
        return 'text-cyan-300 font-bold';
      case 'log-buff':
        return 'text-purple-300';
      case 'log-heal':
        return 'text-green-300 font-bold';
      case 'log-damage':
      default:
        return 'text-slate-300';
    }
  };

  const saveState = (newState: GameState) => {
    try {
      localStorage.setItem('powerupArmory_save', JSON.stringify(newState));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  };

  // --- STATS & COMPUTATIONS (Delegated to combatEngine utility) ---
  const getBossState = (id: string): GameBossState | undefined => gameState.bosses.find(b => b.id === id);

  const getBossHP = (bossId: string) => getBossHPEngine(bossId, gameState.totalBossesDefeated);
  const getBossAttack = (bossId: string) => getBossAttackEngine(bossId, gameState.totalBossesDefeated);
  const getBossPowerReq = (bossId: string) => getBossPowerReqEngine(bossId, gameState.totalBossesDefeated);
  const getPassiveYield = () => getPassiveYieldEngine(gameState);
  const getTotalAttack = () => getTotalAttackEngine(gameState);
  const getTotalDefense = () => getTotalDefenseEngine(gameState);
  const getTotalSpeed = () => getTotalSpeedEngine(gameState);
  const getPowerScore = () => getPowerScoreEngine(gameState);
  const getCurrentReviveCost = () => getCurrentReviveCostEngine(gameState);

  // Synchronize live player max HP & live player HP across state updates
  const normalHP = getNormalMaxHPEngine(gameState);
  useEffect(() => {
    setLivePlayerMaxHP(normalHP);
    setLivePlayerHP(prev => {
      if (gameState.isDead) return 0;
      if (prev === 0 || prev > normalHP) return normalHP;
      return prev; // Retain current damaged HP (e.g. 76)
    });
  }, [normalHP, gameState.isDead]);

  const getPackUnits = (itemId: string, packType: string): number => {
    if (packType.includes('10')) return 10;
    if (packType.includes('5')) return 5;
    if (packType.includes('3')) return 3;
    return 1;
  };

  // --- MANUAL MINING CORE ---
  const handleMineGoldCore = () => {
    if (gameState.isDead) {
      addLog(`💀 You cannot mine while deceased! Revive your champion first.`, 'log-defeat');
      return;
    }

    const newCombo = Math.min(10, miningCombo + 1);
    setMiningCombo(newCombo);

    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current);
    }
    comboTimeoutRef.current = setTimeout(() => {
      setMiningCombo(1);
    }, 1800);

    const baseClickYield = 5;
    const speedBonus = Math.floor(getTotalSpeed() * 0.2);
    const attackBonus = Math.floor(getTotalAttack() * 0.1);
    const totalMined = Math.max(1, Math.floor((baseClickYield + speedBonus + attackBonus) * newCombo));

    setRecentMineGain(totalMined);
    setTimeout(() => setRecentMineGain(null), 600);

    setGameState(prev => {
      const next = { 
        ...prev, 
        coins: prev.coins + totalMined,
        totalGoldEarned: (prev.totalGoldEarned || 0) + totalMined
      };
      saveState(next);
      return next;
    });
  };

  // --- POWERUP PURCHASING & UPGRADES ---
  const buyPowerupInGame = (powerupId: string) => {
    const data = getPowerupData(powerupId);
    if (!data) return;
    const ps = gameState.powerups.find(p => p.id === powerupId);
    if (!ps) return;

    const gemCost = ps.owned
      ? Math.max(15, Math.floor(((data.upgradeCost * (1 + (ps.quantity * 0.25))) / 10) * 3))
      : Math.max(15, Math.floor((data.upgradeCost / 10) * 3));

    if ((gameState.gems || 0) < gemCost) {
      addLog(`❌ Not enough Gems! Need ${gemCost} 💎 for ${data.emoji} ${data.id}`, 'log-defeat');
      return;
    }

    setGameState(prev => {
      const next = {
        ...prev,
        gems: (prev.gems || 0) - gemCost,
        powerups: prev.powerups.map(p =>
          p.id === powerupId
            ? { ...p, owned: true, quantity: p.quantity + 1 }
            : p
        )
      };
      saveState(next);
      return next;
    });

    addLog(`💎 Acquired +1 ${data.emoji} ${data.id} for ${gemCost} Gems!`, 'log-reward');
  };

  const upgradePowerupLevel = (powerupId: string) => {
    const data = getPowerupData(powerupId);
    if (!data) return;
    const ps = gameState.powerups.find(p => p.id === powerupId);
    if (!ps || !ps.owned) return;

    if (ps.level >= data.maxLevel) {
      addLog(`✨ ${data.emoji} ${data.id} is already at MAX LEVEL (${data.maxLevel})!`, 'log-special');
      return;
    }

    const upgradeCost = Math.floor(data.upgradeCost * ps.level * 1.5);
    if (gameState.coins < upgradeCost) {
      addLog(`❌ Not enough coins! Need ${upgradeCost} Coins to upgrade ${data.emoji} ${data.id}`, 'log-defeat');
      return;
    }

    setGameState(prev => {
      const next = {
        ...prev,
        coins: prev.coins - upgradeCost,
        powerups: prev.powerups.map(p =>
          p.id === powerupId
            ? { ...p, level: p.level + 1 }
            : p
        )
      };
      saveState(next);
      return next;
    });

    addLog(`⚡ Upgraded ${data.emoji} ${data.id} to Level ${ps.level + 1}!`, 'log-buff');
  };

  // --- BATTLE CYCLE ---
  const fightBoss = (bossId: string) => {
    if (isFighting) return;
    const boss = getBossData(bossId);
    const bs = getBossState(bossId);
    if (!boss || !bs) return;

    if (gameState.isDead) {
      const cost = getCurrentReviveCost();
      addLog(`💀 Champion is fallen! Revive required (${cost} Coins or 1 Revive Pack) before challenging ${boss.emoji} ${boss.id}`, 'log-defeat');
      return;
    }

    if (bs.defeated) {
      addLog(`⚔️ ${boss.emoji} ${boss.id} has already been conquered!`, 'log-defeat');
      return;
    }

    const powerScore = getPowerScore();
    const req = getBossPowerReq(bossId);
    if (powerScore < req) {
      addLog(`❌ Power Score too low! Requires ${req} PS to challenge ${boss.emoji} ${boss.id}`, 'log-defeat');
      return;
    }

    setIsFighting(true);
    setActiveBossId(bossId);
    setIsBattleModalOpen(true);

    // Reset pre-fight upgrade counters for the new fight round
    setGameState(prev => {
      const next = {
        ...prev,
        hpUpgradesInCurrentFightCount: 0,
        dmgUpgradesInCurrentFightCount: 0
      };
      saveState(next);
      return next;
    });

    let bossHP = getBossHP(bossId);
    const bossAtk = getBossAttack(bossId);
    let playerHP = 100 + getTotalDefense() + (gameState.maxHpBonus || 0);
    const playerAtk = getTotalAttack();
    
    setLivePlayerMaxHP(playerHP);
    setLivePlayerHP(playerHP);
    setLiveBossMaxHP(bossHP);
    setLiveBossHP(bossHP);

    addLog(`⚔️ BATTLE START: Challenging ${boss.emoji} ${boss.id} (HP: ${bossHP})`, 'log-special');

    let turn = 0;
    const maxTurns = 60;

    const battleTurn = () => {
      if (bossHP <= 0) {
        setLiveBossHP(0);
        const config = gameState.balanceConfig || {
          baseReviveCost: 100,
          reviveCostMultiplier: 1.5,
          goldDropChance: 70,
          gemDropChance: 35,
          goldMultiplier: 1.0,
          gemMultiplier: 1.0
        };

        const rollGold = Math.random() * 100;
        const rollGems = Math.random() * 100;
        const getsGold = rollGold < config.goldDropChance;
        const getsGems = rollGems < config.gemDropChance;

        const baseReward = boss.reward + (gameState.totalBossesDefeated * 10);
        const reward = getsGold ? Math.floor(baseReward * config.goldMultiplier) : 0;
        const baseGemReward = Math.max(5, Math.floor(boss.reward / 5));
        const gemReward = getsGems ? Math.floor(baseGemReward * config.gemMultiplier) : 0;

        setGameState(prev => {
          const stats = prev.bossKillStats || {};
          const next = {
            ...prev,
            coins: prev.coins + reward,
            gems: prev.gems + gemReward,
            totalGoldEarned: (prev.totalGoldEarned || 0) + reward,
            totalGemsEarned: (prev.totalGemsEarned || 0) + gemReward,
            bosses: prev.bosses.map(b => b.id === bossId ? { ...b, defeated: true, respawnTime: 15 } : b),
            totalBossesDefeated: prev.totalBossesDefeated + 1,
            killStreak: (prev.killStreak || 0) + 1,
            deathStreak: 0,
            bossKillStats: {
              ...stats,
              [bossId]: (stats[bossId] || 0) + 1
            }
          };
          saveState(next);
          return next;
        });

        let dropMsg = '';
        if (getsGold && getsGems) {
          dropMsg = `+${reward} Coins & +${gemReward} Gems!`;
        } else if (getsGold) {
          dropMsg = `+${reward} Coins (No Gems dropped)`;
        } else if (getsGems) {
          dropMsg = `+${gemReward} Gems (No Gold dropped)`;
        } else {
          dropMsg = `No Gold or Gems dropped`;
        }

        addLog(`🏆 VICTORY! Defeated ${boss.emoji} ${boss.id}! ${dropMsg}`, 'log-victory');
        setIsFighting(false);
        setActiveBossId(null);
        return;
      }

      if (playerHP <= 0 || turn >= maxTurns) {
        setLivePlayerHP(0);
        setGameState(prev => {
          const stats = prev.bossDeathStats || {};
          const next = {
            ...prev,
            isDead: true,
            deathStreak: (prev.deathStreak || 0) + 1,
            killStreak: 0,
            totalDeaths: (prev.totalDeaths || 0) + 1,
            bossDeathStats: {
              ...stats,
              [bossId]: (stats[bossId] || 0) + 1
            }
          };
          saveState(next);
          return next;
        });

        const currentCost = getCurrentReviveCost();
        addLog(`💀 Defeated by ${boss.emoji} ${boss.id}! Revive for ${currentCost} Coins or consume 1 Revive Pack!`, 'log-defeat');
        setIsFighting(false);
        setActiveBossId(null);
        return;
      }

      turn++;

      // Player Turn
      let damage = Math.max(1, Math.floor(playerAtk * (0.8 + Math.random() * 0.4)));
      const isCrit = Math.random() < 0.15;
      if (isCrit) {
        damage = Math.floor(damage * 2);
        addLog(`💥 CRITICAL STRIKE! Dealt ${damage} damage!`, 'log-damage');
      }

      // Special Artifact Triggers
      let specialTriggered = false;
      if (Math.random() < 0.12) {
        const ownedSpecials = gameState.powerups.filter(p => p.owned && p.quantity > 0);
        if (ownedSpecials.length > 0) {
          const randomSpecial = ownedSpecials[Math.floor(Math.random() * ownedSpecials.length)];
          const itemData = getPowerupData(randomSpecial.id);
          if (itemData) {
            specialTriggered = true;
            addLog(`✨ ${itemData.emoji} Special: ${itemData.special}`, 'log-special');
            if (itemData.id === 'Star Fragment' && Math.random() < 0.1) {
              bossHP = 0;
              setLiveBossHP(0);
              addLog(`💫 SUPERNOVA! ${boss.emoji} ${boss.id} was instantly vaporized!`, 'log-victory');
              setGameState(prev => {
                const next = {
                  ...prev,
                  totalSpecials: (prev.totalSpecials || 0) + 1
                };
                saveState(next);
                return next;
              });
              setTimeout(battleTurn, 1400);
              return;
            }
            if (itemData.id === 'Void Orb') {
              damage = Math.floor(damage * 1.6);
              addLog(`🌌 Oblivion rift: Strike bypasses armor for +60% damage!`, 'log-special');
            }
            if (itemData.id === 'Dragon Scale' && Math.random() < 0.3) {
              damage = Math.floor(damage * 1.3);
              addLog(`🐉 Dragonfire Breath melts boss for bonus damage!`, 'log-special');
            }
          }
        }
      }

      // Update max damage and specials in state
      setGameState(prev => {
        const currentMax = prev.maxDamage || 0;
        const newMax = Math.max(currentMax, damage);
        const newSpecials = (prev.totalSpecials || 0) + (specialTriggered ? 1 : 0);
        if (newMax !== currentMax || specialTriggered) {
          const next = { ...prev, maxDamage: newMax, totalSpecials: newSpecials };
          saveState(next);
          return next;
        }
        return prev;
      });

      bossHP = Math.max(0, bossHP - damage);
      addLog(`🗡️ You deal ${damage} damage! Boss HP: ${bossHP}`, 'log-damage');

      if (bossHP <= 0) {
        setLiveBossHP(0);
        setTimeout(battleTurn, 1400);
        return;
      }

      // Boss Turn
      const isDodge = Math.random() < 0.2;
      if (isDodge) {
        addLog(`🔄 You dodged the boss attack!`, 'log-buff');
        setGameState(prev => {
          const next = { ...prev, totalDodges: (prev.totalDodges || 0) + 1 };
          saveState(next);
          return next;
        });
      } else {
        const defenseMultiplier = Math.min(0.8, getTotalDefense() / 150);
        let actualBossDamage = Math.max(1, Math.floor(bossAtk * (0.7 + Math.random() * 0.6)));
        actualBossDamage = Math.floor(actualBossDamage * (1 - defenseMultiplier));
        playerHP = Math.max(0, playerHP - actualBossDamage);
        addLog(`👹 ${boss.emoji} ${boss.id} strikes for ${actualBossDamage} damage! Player HP: ${playerHP}`, 'log-damage');
      }

      if (boss.id === 'Orc Warlord' && bossHP < getBossHP(bossId) * 0.5) {
        addLog(`💀 Orc Warlord enters Frenzy! Attack speed and strength increased!`, 'log-special');
      }

      setLivePlayerHP(playerHP);
      setLiveBossHP(bossHP);
      setTimeout(battleTurn, 1400);
    };

    battleTurn();
  };

  const handleReviveWithCoins = () => {
    const cost = getCurrentReviveCost();
    if (gameState.coins >= cost) {
      setGameState(prev => {
        const next = {
          ...prev,
          coins: prev.coins - cost,
          isDead: false,
          reviveCount: (prev.reviveCount || 0) + 1
        };
        saveState(next);
        return next;
      });
      const maxHP = 100 + getTotalDefense() + (gameState.maxHpBonus || 0);
      setLivePlayerHP(maxHP);
      addLog(`⚡ Revived for ${cost} Coins! HP fully restored. (Next Coin Revive: ${Math.floor((gameState.balanceConfig?.baseReviveCost || 100) * Math.pow(gameState.balanceConfig?.reviveCostMultiplier || 1.5, (gameState.reviveCount || 0) + 1))} Coins)`, 'log-heal');
    } else {
      addLog(`❌ Insufficient Coins to Revive! Requires ${cost} Coins (You have ${Math.floor(gameState.coins)}). Use 1 Revive Pack instead!`, 'log-defeat');
    }
  };

  const handleReviveWithPack = () => {
    const availablePacks = gameState.revivePacks || 0;
    if (availablePacks > 0) {
      setGameState(prev => {
        const next = {
          ...prev,
          revivePacks: prev.revivePacks! - 1,
          isDead: false
        };
        saveState(next);
        return next;
      });
      const maxHP = 100 + getTotalDefense() + (gameState.maxHpBonus || 0);
      setLivePlayerHP(maxHP);
      addLog(`🩹 Consumed 1 Revive Pack! HP fully restored without incrementing coin revive scaling penalty! (${availablePacks - 1} Packs remaining)`, 'log-heal');
    } else {
      addLog(`❌ No Revive Packs available! Purchase Revive Packs in the Tycoon Store or pay ${getCurrentReviveCost()} Coins.`, 'log-defeat');
    }
  };

  // --- REDEMPTION ENGINE ---
  const redeemReceiptCode = async (codeStr: string) => {
    const formattedCode = codeStr.trim().toUpperCase();
    setIsRedeemingCode(true);

    try {
      let localRecord = gameState.purchasedCodes.find(r => r.code.toUpperCase() === formattedCode && !r.redeemed);
      
      if (!localRecord) {
        try {
          const snap = await getDoc(doc(db, 'purchases', formattedCode));
          if (snap.exists()) {
            const cloudRec = snap.data() as PurchaseRecord;
            if (!cloudRec.redeemed) {
              localRecord = cloudRec;
            }
          }
        } catch (e) {
          console.warn('Could not query cloud purchases:', e);
        }
      }

      const demoCodes: Record<string, string> = {
        'FOCUS-001': 'Focus Blade',
        'SPEED-002': 'Speed Dagger',
        'SHIELD-003': 'Magnetite Shield',
        'TITAN-004': 'Titan Armor',
        'PHOENIX-005': 'Phoenix Feather',
        'DRAGON-006': 'Dragon Scale',
        'VOID-007': 'Void Orb',
        'STAR-008': 'Star Fragment'
      };

      if (localRecord) {
        const codeRecordToRedeem = localRecord;
        setGameState(prev => {
          const updatedPowerups = prev.powerups.map(p => {
            const matchingItems = codeRecordToRedeem.items.filter(i => i.id === p.id);
            if (matchingItems.length > 0) {
              const addedUnits = matchingItems.reduce((sum, i) => sum + i.qty * getPackUnits(i.id, i.pack), 0);
              return { ...p, owned: true, quantity: p.quantity + addedUnits };
            }
            return p;
          });

          const existsInLocal = prev.purchasedCodes.some(r => r.code.toUpperCase() === formattedCode);
          const updatedCodes = existsInLocal 
            ? prev.purchasedCodes.map(r => r.code.toUpperCase() === formattedCode ? { ...r, redeemed: true } : r)
            : [{ ...codeRecordToRedeem, redeemed: true }, ...prev.purchasedCodes];

          const codeGemBonus = Math.max(150, Math.floor((codeRecordToRedeem.total || 0) * 0.1));
          
          const next = {
            ...prev,
            gems: (prev.gems || 0) + codeGemBonus,
            powerups: updatedPowerups,
            purchasedCodes: updatedCodes
          };
          saveState(next);
          return next;
        });

        try {
          setDoc(doc(db, 'purchases', formattedCode), { ...codeRecordToRedeem, redeemed: true }, { merge: true });
        } catch (e) {
          console.warn('Could not update redeemed status in Firestore:', e);
        }

        const codeGemBonus = Math.max(150, Math.floor((localRecord.total || 0) * 0.1));
        addLog(`🔑 Receipt Key Redeemed! Unlocked items & +${codeGemBonus} Gems 💎!`, 'log-reward');
        localRecord.items.forEach(i => {
          const units = getPackUnits(i.id, i.pack);
          const totalUnits = i.qty * units;
          addLog(` - ${i.emoji} ${i.id} (${i.pack}${units > 1 ? ` = ${totalUnits} units` : ''})`, 'log-buff');
        });
      } else if (demoCodes[formattedCode]) {
        const id = demoCodes[formattedCode];
        const data = getPowerupData(id);
        if (data) {
          setGameState(prev => {
            const next = {
              ...prev,
              gems: (prev.gems || 0) + 50,
              powerups: prev.powerups.map(p => p.id === id ? { ...p, owned: true, quantity: p.quantity + 1 } : p)
            };
            saveState(next);
            return next;
          });
          addLog(`🔑 Demo Code redeemed! Unlocked ${data.emoji} ${id} and +50 Gems 💎!`, 'log-reward');
        }
      } else {
        addLog(`❌ Invalid or already redeemed Key: ${formattedCode}`, 'log-defeat');
      }
    } finally {
      setIsRedeemingCode(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col select-none py-2 md:py-4 relative pb-28 sm:pb-32 px-2 sm:px-4 md:px-6 box-border">
      {/* ACTIVE TAB CONTAINER */}
      <div className="flex-1 w-full max-w-full">
        {/* TAB 1: TYCOON & CLICKER GENERATORS */}
        {activeTab === 'tycoon' && (
          <div className="space-y-8">
            <TycoonGenerators
              gameState={gameState}
              onMineGoldCore={handleMineGoldCore}
              miningCombo={miningCombo}
              recentMineGain={recentMineGain}
              onUpgradePowerupLevel={upgradePowerupLevel}
              onBuyPowerupInGame={buyPowerupInGame}
              getPowerupData={getPowerupData}
            />
            <KeyRedemptionCard
              onRedeem={redeemReceiptCode}
              isProcessing={isRedeemingCode}
            />
          </div>
        )}

        {/* TAB 2: BOSS BATTLE ARENA */}
        {activeTab === 'bosses' && (
          <BossGauntlet
            gameState={gameState}
            setGameState={setGameState}
            saveState={saveState}
            addLog={addLog}
            isFighting={isFighting}
            activeBossId={activeBossId}
            onFightBoss={fightBoss}
            onReviveWithCoins={handleReviveWithCoins}
            onReviveWithPack={handleReviveWithPack}
            getCurrentReviveCost={getCurrentReviveCost}
            getBossData={getBossData}
            getBossState={getBossState}
            getBossPowerReq={getBossPowerReq}
            getBossHP={getBossHP}
            getBossAttack={getBossAttack}
            powerScore={getPowerScore()}
            livePlayerHP={livePlayerHP}
            livePlayerMaxHP={livePlayerMaxHP}
            liveBossHP={liveBossHP}
            liveBossMaxHP={liveBossMaxHP}
            battleLogs={battleLogs}
            logContainerRef={logContainerRef}
            getLogColorStyling={getLogColorStyling}
            onOpenLoreBook={onOpenLoreBook}
            onOpenBattleModal={() => setIsBattleModalOpen(true)}
            showTimestamps={showTimestamps}
            onToggleTimestamps={toggleTimestamps}
            persistLogs={persistLogs}
            onTogglePersistLogs={togglePersistLogs}
            onClearLogs={handleClearLogs}
          />
        )}

        {/* TAB 3: STATS & LEADERBOARD */}
        {activeTab === 'stats' && (
          <StatsLeaderboard
            gameState={gameState}
            setGameState={setGameState}
            currentUser={currentUser}
            userProfile={userProfile}
            cloudLeaderboard={cloudLeaderboard}
            onOpenAccount={onOpenAccount}
            onSyncLeaderboard={onSyncLeaderboard}
            isSyncingLeaderboard={isSyncingLeaderboard}
            totalAttack={getTotalAttack()}
            totalDefense={getTotalDefense()}
            totalSpeed={getTotalSpeed()}
            powerScore={getPowerScore()}
          />
        )}
      </div>

      {/* REAL-TIME DYNAMIC STATBAR */}
      <TycoonBankrollCard
        coins={gameState.coins}
        gems={gameState.gems || 0}
        passiveYield={getPassiveYield()}
        totalBossesDefeated={gameState.totalBossesDefeated}
        attack={getTotalAttack()}
        defense={getTotalDefense()}
        speed={getTotalSpeed()}
        powerScore={getPowerScore()}
        isDead={gameState.isDead}
        isFighting={isFighting}
        livePlayerHP={livePlayerHP}
        livePlayerMaxHP={livePlayerMaxHP}
        maxHpBonus={gameState.maxHpBonus}
      />

      {/* COMBAT ARENA MODAL OVERLAY */}
      <BattleModal
        isOpen={isBattleModalOpen}
        onClose={() => setIsBattleModalOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
        userProfile={userProfile}
        activeBossId={activeBossId}
        isFighting={isFighting}
        livePlayerHP={livePlayerHP}
        livePlayerMaxHP={livePlayerMaxHP}
        liveBossHP={liveBossHP}
        liveBossMaxHP={liveBossMaxHP}
        totalAttack={getTotalAttack()}
        totalDefense={getTotalDefense()}
        bossHP={activeBossId ? getBossHP(activeBossId) : 0}
        battleLogs={battleLogs}
        getLogColorStyling={getLogColorStyling}
        addLog={addLog}
        saveState={saveState}
        handleReviveWithCoins={handleReviveWithCoins}
        handleReviveWithPack={handleReviveWithPack}
        getCurrentReviveCost={getCurrentReviveCost}
        showTimestamps={showTimestamps}
        onToggleTimestamps={toggleTimestamps}
        persistLogs={persistLogs}
        onTogglePersistLogs={togglePersistLogs}
        onFightBoss={fightBoss}
        powerScore={getPowerScore()}
      />
    </div>
  );
}

export default GameView;
