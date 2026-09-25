import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BOSSES, POWERUPS } from '../data';
import { GameState, PurchaseRecord, LeaderboardEntry, UserProfile } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { getPackUnits } from './ShopView';

interface GameViewProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  initialTab?: 'tycoon' | 'bosses' | 'stats';
  onTabChange?: (tab: 'tycoon' | 'bosses' | 'stats') => void;
  onOpenLoreBook?: () => void;
  currentUser?: FirebaseUser | null;
  userProfile?: UserProfile | null;
  onOpenAccount?: () => void;
  cloudLeaderboard?: LeaderboardEntry[];
  onSyncLeaderboard?: () => Promise<void>;
  isSyncingLeaderboard?: boolean;
}

export default function GameView({ 
  gameState, 
  setGameState, 
  initialTab = 'tycoon', 
  onTabChange,
  onOpenLoreBook,
  currentUser,
  userProfile,
  onOpenAccount,
  cloudLeaderboard = [],
  onSyncLeaderboard,
  isSyncingLeaderboard = false
}: GameViewProps) {
  const [activeTab, setActiveViewTab] = useState<'tycoon' | 'bosses' | 'stats'>(initialTab);
  const [leaderboardSortBy, setLeaderboardSortBy] = useState<'score' | 'bosses' | 'coins'>('score');

  const handleTabChange = (tab: 'tycoon' | 'bosses' | 'stats') => {
    setActiveViewTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  // Synchronize internal activeTab when initialTab prop is updated from App
  useEffect(() => {
    setActiveViewTab(initialTab);
  }, [initialTab]);
  
  // Redeem input
  const [redeemCodeInput, setRedeemCodeInput] = useState('');
  
  // Mining state for manual ore clicking
  const [miningCombo, setMiningCombo] = useState(1);
  const [lastMineTime, setLastMineTime] = useState(0);
  const [recentMineGain, setRecentMineGain] = useState<number | null>(null);

  const handleMineGoldCore = () => {
    const now = Date.now();
    const isCombo = now - lastMineTime < 950;
    const nextCombo = isCombo ? Math.min(miningCombo + 1, 10) : 1;
    setLastMineTime(now);
    setMiningCombo(nextCombo);

    const baseGain = 15 + Math.floor(getPowerScore() / 15);
    const earned = baseGain * nextCombo;
    setRecentMineGain(earned);
    setTimeout(() => setRecentMineGain(null), 850);

    setGameState(prev => {
      const next = { ...prev, coins: prev.coins + earned };
      saveState(next);
      return next;
    });
  };
  
  // Battle state
  const [isFighting, setIsFighting] = useState(false);
  const [activeBossId, setActiveBossId] = useState<string | null>(null);
  const [isBattleModalOpen, setIsBattleModalOpen] = useState(false);

  // Live HP states for health bar rendering
  const [livePlayerHP, setLivePlayerHP] = useState<number>(100);
  const [livePlayerMaxHP, setLivePlayerMaxHP] = useState<number>(100);
  const [liveBossHP, setLiveBossHP] = useState<number>(100);
  const [liveBossMaxHP, setLiveBossMaxHP] = useState<number>(100);
  
  // Custom scrolling logs
  const [battleLogs, setBattleLog] = useState<{ message: string; className: string }[]>(
    gameState.battleLog.length > 0 ? gameState.battleLog : [{ message: '⚔️ Welcome, Champion! Defeat bosses to earn rewards.', className: '' }]
  );
  
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Sync log scroll position to top (most recent on top)
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [battleLogs]);

  // Keep gameState in sync with logs
  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      battleLog: battleLogs
    }));
  }, [battleLogs, setGameState]);

  // Save state helper
  const saveState = (newState: GameState) => {
    localStorage.setItem('bossRushTycoon', JSON.stringify(newState));
  };

  // Logging utility (prepends new logs to top)
  const addLog = (message: string, className = '') => {
    setBattleLog(prev => {
      const next = [{ message, className }, ...prev];
      return next.slice(0, 100); // Max 100 entries, newest on top
    });
  };

  // Log color coding helper (Green for good, Yellow for info, Red for bad, White for narrative/purchases)
  const getLogColorStyling = (log: { message: string; className: string }) => {
    const cls = (log.className || '').toLowerCase();
    const msg = log.message.toLowerCase();

    // 1. GREEN for Good (Victory, Rewards, Heals, Buffs, Code Redemptions)
    if (
      cls.includes('victory') || cls.includes('reward') || cls.includes('heal') || cls.includes('buff') || cls.includes('good') ||
      msg.includes('victory') || msg.includes('unlocked') || msg.includes('+ coins') || msg.includes('+ gems') || msg.includes('revived') || msg.includes('healed')
    ) {
      return 'text-emerald-400 font-extrabold bg-emerald-950/20 px-2 py-1 rounded-md border-l-2 border-emerald-500 shadow-sm shadow-emerald-950/30';
    }

    // 2. RED for Bad (Defeat, Damage, Missing requirements, Failures)
    if (
      cls.includes('defeat') || cls.includes('damage') || cls.includes('error') || cls.includes('bad') ||
      msg.includes('defeated') || msg.includes('strikes for') || msg.includes('deal') || msg.includes('damage') || msg.includes('failed') || msg.includes('too low') || msg.includes('invalid')
    ) {
      return 'text-red-400 font-extrabold bg-red-950/20 px-2 py-1 rounded-md border-l-2 border-red-500 shadow-sm shadow-red-950/30';
    }

    // 3. WHITE for Narrative or Purchases (Pre-fight shop, coin/gem purchases, chronicles, sagas)
    if (
      cls.includes('purchase') || cls.includes('narrative') ||
      msg.includes('purchased') || msg.includes('bought') || msg.includes('saga') || msg.includes('legend') || msg.includes('chapter') || msg.includes('key redeemed')
    ) {
      return 'text-white font-bold bg-white/10 px-2 py-1 rounded-md border-l-2 border-white/60 shadow-sm';
    }

    // 4. YELLOW for Info / Status / Special Notices
    return 'text-amber-300 font-extrabold bg-amber-950/20 px-2 py-1 rounded-md border-l-2 border-amber-400 shadow-sm shadow-amber-950/30';
  };

  // --- STAT CALCULATORS ---
  const getPowerupData = (id: string) => POWERUPS.find(p => p.id === id);
  const getPowerupState = (id: string) => gameState.powerups.find(p => p.id === id);
  const getBossState = (id: string) => gameState.bosses.find(b => b.id === id);
  const getBossData = (id: string) => BOSSES.find(b => b.id === id);

  const getPassiveYield = () => {
    let rate = 0;
    gameState.powerups.forEach(ps => {
      if (ps.owned && ps.quantity > 0) {
        const data = getPowerupData(ps.id);
        if (data) {
          const base = data.baseRate * ps.quantity;
          const multiplier = 1 + (ps.level - 1) * 0.5;
          rate += base * multiplier;
        }
      }
    });
    return rate;
  };

  const getPowerScore = () => {
    let score = 0;
    gameState.powerups.forEach(ps => {
      if (ps.owned) {
        const data = getPowerupData(ps.id);
        if (data) {
          const statScore = data.attack + Math.max(0, data.defense) + Math.max(0, data.speed);
          score += statScore + (ps.level * 10) + (ps.quantity * 5);
        }
      }
    });
    score += gameState.totalBossesDefeated * 25;
    return Math.floor(score);
  };

  const getTotalAttack = () => {
    let atk = 0;
    gameState.powerups.forEach(ps => {
      if (ps.owned && ps.quantity > 0) {
        const data = getPowerupData(ps.id);
        if (data) atk += data.attack * ps.quantity;
      }
    });
    const bonus = 1 + (gameState.damageBonusPercent || 0) / 100;
    return Math.max(1, Math.floor(atk * bonus));
  };

  const getTotalDefense = () => {
    let def = 0;
    gameState.powerups.forEach(ps => {
      if (ps.owned && ps.quantity > 0) {
        const data = getPowerupData(ps.id);
        if (data) def += data.defense * ps.quantity;
      }
    });
    return Math.max(0, def);
  };

  const getTotalSpeed = () => {
    let spd = 0;
    gameState.powerups.forEach(ps => {
      if (ps.owned && ps.quantity > 0) {
        const data = getPowerupData(ps.id);
        if (data) spd += data.speed * ps.quantity;
      }
    });
    return Math.max(1, spd + 10);
  };

  const getBossHP = (bossId: string) => {
    const boss = getBossData(bossId);
    if (!boss) return 0;
    const scale = 1 + (gameState.totalBossesDefeated * 0.05);
    return Math.floor(boss.baseHP * scale);
  };

  const getBossAttack = (bossId: string) => {
    const boss = getBossData(bossId);
    if (!boss) return 0;
    const scale = 1 + (gameState.totalBossesDefeated * 0.03);
    return Math.floor(boss.baseAttack * scale);
  };

  const getBossPowerReq = (bossId: string) => {
    const boss = getBossData(bossId);
    if (!boss) return 0;
    const scale = 1 + (gameState.totalBossesDefeated * 0.02);
    return Math.floor(boss.powerReq * scale);
  };

  // --- TYCOON UPGRADES ---
  const buyPowerupInGame = (id: string) => {
    const ps = getPowerupState(id);
    const data = getPowerupData(id);
    if (!ps || !data) return;

    // Premium Locked Currency: Gems (tripled base price per prompt)
    const costInGems = Math.max(15, Math.floor(((data.upgradeCost * (1 + (ps.quantity * 0.25))) / 10) * 3));
    if (gameState.gems >= costInGems) {
      setGameState(prev => {
        const next = {
          ...prev,
          gems: prev.gems - costInGems,
          powerups: prev.powerups.map(p => p.id === id ? { ...p, owned: true, quantity: p.quantity + 1 } : p)
        };
        saveState(next);
        return next;
      });
      addLog(`🛒 Purchased ${data.emoji} ${id} (x${ps.quantity + 1}) for ${costInGems} Gems!`, 'log-buff');
    } else {
      addLog(`❌ Need ${costInGems} Gems 💎 for ${id}`, 'log-defeat');
    }
  };

  const upgradePowerupLevel = (id: string) => {
    const ps = getPowerupState(id);
    const data = getPowerupData(id);
    if (!ps || !data) return;

    if (ps.level >= data.maxLevel) {
      addLog(`⚠️ ${id} is already at max level!`, 'log-defeat');
      return;
    }

    const cost = Math.floor(data.upgradeCost * ps.level * 1.5);
    if (gameState.coins >= cost) {
      setGameState(prev => {
        const next = {
          ...prev,
          coins: prev.coins - cost,
          powerups: prev.powerups.map(p => p.id === id ? { ...p, level: p.level + 1 } : p)
        };
        saveState(next);
        return next;
      });
      addLog(`⬆️ ${data.emoji} ${id} upgraded to Level ${ps.level + 1}!`, 'log-buff');
    } else {
      addLog(`❌ Need ${cost} coins to upgrade ${id}`, 'log-defeat');
    }
  };

  // --- BATTLE CYCLE ---
  const fightBoss = (bossId: string) => {
    if (isFighting) return;
    const boss = getBossData(bossId);
    const bs = getBossState(bossId);
    if (!boss || !bs) return;

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
        // VICTORY
        setLiveBossHP(0);
        const reward = boss.reward + (gameState.totalBossesDefeated * 10);
        const gemReward = Math.max(5, Math.floor(boss.reward / 5));
        setGameState(prev => {
          const stats = prev.bossKillStats || {};
          const next = {
            ...prev,
            coins: prev.coins + reward,
            gems: prev.gems + gemReward,
            bosses: prev.bosses.map(b => b.id === bossId ? { ...b, defeated: true, respawnTime: 15 } : b),
            totalBossesDefeated: prev.totalBossesDefeated + 1,
            bossKillStats: {
              ...stats,
              [bossId]: (stats[bossId] || 0) + 1
            }
          };
          saveState(next);
          return next;
        });
        addLog(`🏆 VICTORY! Defeated ${boss.emoji} ${boss.id}! +${reward} Coins & +${gemReward} Gems!`, 'log-victory');
        setIsFighting(false);
        setActiveBossId(null);
        return;
      }

      if (playerHP <= 0 || turn >= maxTurns) {
        // DEFEAT
        setLivePlayerHP(0);
        addLog(`💀 Defeated by ${boss.emoji} ${boss.id}. Use Revive (100 coins) or upgrade stats!`, 'log-defeat');
        setGameState(prev => {
          const stats = prev.bossDeathStats || {};
          const next = {
            ...prev,
            bossDeathStats: {
              ...stats,
              [bossId]: (stats[bossId] || 0) + 1
            }
          };
          saveState(next);
          return next;
        });
        setIsFighting(false);
        setActiveBossId(null);
        return;
      }

      turn++;

      // PLAYER TURN
      let damage = Math.max(1, Math.floor(playerAtk * (0.8 + Math.random() * 0.4)));
      let isCrit = Math.random() < 0.15;
      if (isCrit) {
        damage = Math.floor(damage * 2);
        addLog(`💥 CRITICAL STRIKE! Dealt ${damage} damage!`, 'log-damage');
      }

      // Check special artifact triggers
      if (Math.random() < 0.12) {
        const ownedSpecials = gameState.powerups.filter(p => p.owned && p.quantity > 0);
        if (ownedSpecials.length > 0) {
          const randomSpecial = ownedSpecials[Math.floor(Math.random() * ownedSpecials.length)];
          const itemData = getPowerupData(randomSpecial.id);
          if (itemData) {
            addLog(`✨ ${itemData.emoji} Special: ${itemData.special}`, 'log-special');
            if (itemData.id === 'Star Fragment' && Math.random() < 0.1) {
              bossHP = 0;
              setLiveBossHP(0);
              addLog(`💫 SUPERNOVA! ${boss.emoji} ${boss.id} was instantly vaporized!`, 'log-victory');
              setTimeout(battleTurn, 500);
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

      bossHP = Math.max(0, bossHP - damage);
      addLog(`🗡️ You deal ${damage} damage! Boss HP: ${bossHP}`, 'log-damage');

      if (bossHP <= 0) {
        setLiveBossHP(0);
        setTimeout(battleTurn, 500);
        return;
      }

      // BOSS TURN
      let isDodge = Math.random() < 0.2;
      if (isDodge) {
        addLog(`🔄 You dodged the boss attack!`, 'log-buff');
      } else {
        const defenseMultiplier = Math.min(0.8, getTotalDefense() / 150);
        let actualBossDamage = Math.max(1, Math.floor(bossAtk * (0.7 + Math.random() * 0.6)));
        actualBossDamage = Math.floor(actualBossDamage * (1 - defenseMultiplier));
        playerHP = Math.max(0, playerHP - actualBossDamage);
        addLog(`👹 ${boss.emoji} ${boss.id} strikes for ${actualBossDamage} damage! Player HP: ${playerHP}`, 'log-damage');
      }

      // Boss special status alerts
      if (boss.id === 'Orc Warlord' && bossHP < getBossHP(bossId) * 0.5) {
        addLog(`💀 Orc Warlord enters Frenzy! Attack speed and strength increased!`, 'log-special');
      }

      // Update live HP trackers
      setLivePlayerHP(playerHP);
      setLiveBossHP(bossHP);

      setTimeout(battleTurn, 500);
    };

    battleTurn();
  };

  const handleRevive = () => {
    if (gameState.coins >= 100) {
      setGameState(prev => {
        const next = { ...prev, coins: prev.coins - 100 };
        saveState(next);
        return next;
      });
      addLog(`⚡ Revived! Your power-ups glow as your strength returns. HP fully restored.`, 'log-heal');
    } else {
      addLog(`❌ Not enough coins to Revive (requires 100).`, 'log-defeat');
    }
  };

  // --- REDEMPTION BRIDGE ---
  const redeemReceiptCode = async (codeStr: string) => {
    const formattedCode = codeStr.trim().toUpperCase();
    
    // 1. Check locally generated codes
    let localRecord = gameState.purchasedCodes.find(r => r.code.toUpperCase() === formattedCode && !r.redeemed);
    
    // 2. If not found locally, query Firestore purchases
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

    // Pre-defined demo keys
    const demoCodes: { [key: string]: string } = {
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
        // Redeem all items inside the code record (factoring in multi-pack units)
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

      // Update in Firestore
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

      setRedeemCodeInput('');
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
        setRedeemCodeInput('');
      }
    } else {
      addLog(`❌ Invalid or already redeemed Key: ${formattedCode}`, 'log-defeat');
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col select-none py-2 md:py-4 relative">
      
      {/* REAL-TIME STATBAR - COMPACT STICKY HUD */}
      <div id="tycoon-bankroll-card" className="flex flex-col gap-1.5 sm:gap-2 bg-linear-to-r from-[#1a2540]/98 via-[#131d33]/98 to-[#0f182a]/98 backdrop-blur-xl border border-[#2a4060] px-3 sm:px-5 py-2 sm:py-2.5 rounded-2xl sm:rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.85)] mb-4 sticky top-[108px] xs:top-[96px] sm:top-[68px] md:top-[58px] z-40 transition-all duration-300">
        
        {/* Layer 1: Currencies & Yield (Icons + Values) */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 border-b border-white/10 pb-1.5">
          <span className="font-mono text-[11px] text-[#7ae0ff] font-extrabold uppercase tracking-widest flex items-center gap-1.5 shrink-0">
            <span>🏆</span> <span className="hidden xs:inline">PORTAL</span>
          </span>
          
          <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
            {/* Coins */}
            <div className="bg-[#141c30] px-2.5 sm:px-3 py-1 rounded-full border border-[#2a4060] text-xs flex items-center gap-1.5 shadow-inner" title="Gold Coins">
              <span className="text-base">💰</span>
              <span className="font-mono text-[#f5e56b] font-extrabold text-xs sm:text-sm">{Math.floor(gameState.coins).toLocaleString()}</span>
            </div>

            {/* Gems */}
            <div className="bg-[#141c30] px-2.5 sm:px-3 py-1 rounded-full border border-[#2a4060] text-xs flex items-center gap-1.5 shadow-inner" title="Gems">
              <span className="text-base">💎</span>
              <span className="font-mono text-[#cb9df2] font-extrabold text-xs sm:text-sm">{Math.floor(gameState.gems || 0).toLocaleString()}</span>
            </div>

            {/* Yield */}
            <div className="bg-[#141c30] px-2.5 sm:px-3 py-1 rounded-full border border-[#2a4060] text-xs flex items-center gap-1.5 shadow-inner" title="Passive Yield per second">
              <span className="text-base">⏱️</span>
              <span className="font-mono text-green-400 font-extrabold text-xs sm:text-sm">+{(getPassiveYield() / 1000).toFixed(3)}/s</span>
            </div>

            {/* Bosses Defeated */}
            <div className="bg-[#141c30] px-2.5 sm:px-3 py-1 rounded-full border border-[#2a4060] text-xs flex items-center gap-1.5 shadow-inner" title="Bosses Defeated">
              <span className="text-base">💀</span>
              <span className="font-mono text-red-400 font-extrabold text-xs sm:text-sm">{gameState.totalBossesDefeated}</span>
            </div>
          </div>
        </div>

        {/* Layer 2: Player Combat Attributes (Icons + Values) */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
          <span className="font-mono text-[10px] sm:text-xs text-amber-400/90 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
            <span>⚡</span> <span className="hidden xs:inline">STATS</span>
          </span>

          <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
            {/* ATK */}
            <div className="bg-[#121c33] px-2.5 sm:px-3 py-1 rounded-full border border-red-500/30 text-xs flex items-center gap-1 shadow-sm hover:border-red-400/60 transition" title="Attack Damage (ATK)">
              <span className="text-sm">⚔️</span>
              <span className="font-mono text-red-300 font-extrabold text-xs sm:text-sm">{getTotalAttack()}</span>
            </div>

            {/* DEF */}
            <div className="bg-[#121c33] px-2.5 sm:px-3 py-1 rounded-full border border-blue-500/30 text-xs flex items-center gap-1 shadow-sm hover:border-blue-400/60 transition" title="Defense Rating (DEF)">
              <span className="text-sm">🛡️</span>
              <span className="font-mono text-blue-300 font-extrabold text-xs sm:text-sm">{getTotalDefense()}</span>
            </div>

            {/* HP */}
            <div className="bg-[#121c33] px-2.5 sm:px-3 py-1 rounded-full border border-emerald-500/30 text-xs flex items-center gap-1 shadow-sm hover:border-emerald-400/60 transition" title="Player Health Points (HP)">
              <span className="text-sm">❤️</span>
              <span className="font-mono text-emerald-300 font-extrabold text-xs sm:text-sm">
                {isFighting ? `${livePlayerHP}/${livePlayerMaxHP}` : `${100 + getTotalDefense() + (gameState.maxHpBonus || 0)}`}
              </span>
            </div>

            {/* SPD */}
            <div className="bg-[#121c33] px-2.5 sm:px-3 py-1 rounded-full border border-amber-500/30 text-xs flex items-center gap-1 shadow-sm hover:border-amber-400/60 transition" title="Combat Speed (SPD)">
              <span className="text-sm">⚡</span>
              <span className="font-mono text-amber-300 font-extrabold text-xs sm:text-sm">{getTotalSpeed()}</span>
            </div>

            {/* PS */}
            <div className="bg-[#121c33] px-2.5 sm:px-3 py-1 rounded-full border border-cyan-500/30 text-xs flex items-center gap-1 shadow-sm hover:border-cyan-400/60 transition" title="Power Score (PS)">
              <span className="text-sm">✨</span>
              <span className="font-mono text-cyan-300 font-extrabold text-xs sm:text-sm">{getPowerScore()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW SUB TABS - STICKY PINNED */}
      <div id="game-sub-tabs" className="w-full grid grid-cols-2 gap-2 p-1.5 bg-[#121c30]/98 border border-[#2a4060] rounded-2xl md:rounded-full mb-6 shadow-xl sticky top-[200px] xs:top-[182px] sm:top-[150px] md:top-[135px] z-30 backdrop-blur-xl transition-all duration-300">
        <button 
          id="game-tab-tycoon"
          onClick={() => handleTabChange('tycoon')}
          className={`w-full py-2.5 px-4 rounded-xl md:rounded-full font-extrabold text-xs md:text-sm uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${activeTab === 'tycoon' ? 'bg-[#2a4060] border border-[#5a8ac0] text-[#d0e8ff] shadow-md shadow-blue-500/20' : 'text-slate-400 hover:text-slate-100 hover:bg-[#18243c]'}`}
        >
          <span>🏪</span>
          <span>Tycoon Upgrades</span>
        </button>
        <button 
          id="game-tab-bosses"
          onClick={() => handleTabChange('bosses')}
          className={`w-full py-2.5 px-4 rounded-xl md:rounded-full font-extrabold text-xs md:text-sm uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${activeTab === 'bosses' ? 'bg-[#2a4060] border border-[#5a8ac0] text-[#d0e8ff] shadow-md shadow-blue-500/20' : 'text-slate-400 hover:text-slate-100 hover:bg-[#18243c]'}`}
        >
          <span>⚔️</span>
          <span>Boss Challenge Mode</span>
        </button>
      </div>

      {/* ACTIVE VIEW TAB */}
      <div className="flex-1">
        
        {/* TYCOON GRID */}
        {activeTab === 'tycoon' && (
          <div className="space-y-8">
            {/* RECEIPT REDEMPTION BANNER */}
            <div id="game-redeem-container" className="bg-linear-to-r from-orange-950/40 via-[#10192e] to-red-950/40 border border-orange-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
              {/* Absolute decorative glow background */}
              <div className="absolute right-0 top-0 w-64 h-64 bg-orange-500/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
              
              <div className="space-y-1.5 max-w-[550px] z-10">
                <div className="flex items-center gap-2 text-orange-400">
                  <span className="text-xl">💳</span>
                  <h3 className="font-mono text-sm uppercase font-black tracking-wider">REDEEM IN-STORE RECEIPT KEY</h3>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Received a printed receipt code from checkout? Input your key below to instantly load physical gear and claim your premium <strong className="text-purple-300">Gems 💎</strong> bonus!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch gap-2.5 min-w-[280px] md:min-w-[340px] z-10">
                <input 
                  type="text" 
                  value={redeemCodeInput}
                  onChange={(e) => setRedeemCodeInput(e.target.value)}
                  placeholder="e.g., STORE-XXXX-XXXX" 
                  className="flex-1 bg-black/40 border border-slate-700/80 rounded-xl px-4 py-3 text-xs md:text-sm text-white uppercase font-mono tracking-wider focus:outline-none focus:border-orange-500 transition-colors"
                />
                <button 
                  onClick={() => redeemReceiptCode(redeemCodeInput)}
                  className="px-6 py-3 rounded-xl bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black text-xs md:text-sm uppercase tracking-wider shadow-md hover:shadow-orange-600/20 active:scale-[0.98] transition cursor-pointer"
                >
                  Redeem
                </button>
              </div>
            </div>

            {/* MANUAL MINING & ACTIVE ORE CLICKER */}
            <div id="tycoon-mine-container" className="bg-linear-to-r from-[#142038] via-[#1a2b4c] to-[#121c32] border border-[#2a4570] rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-yellow-400">
                  <span className="text-2xl">⛏️</span>
                  <h3 className="font-mono text-sm uppercase font-black tracking-wider">ASTRAL GOLD FORGE & CORE MINING</h3>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed max-w-[500px]">
                  Channel celestial energy into the Astral Ore Core! Tap or click rapidly to extract raw gold with combo multipliers up to <strong className="text-amber-300">10x</strong>.
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                {miningCombo > 1 && (
                  <span className="font-mono text-xs font-black text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2.5 py-1 rounded-full animate-bounce">
                    🔥 {miningCombo}x Combo!
                  </span>
                )}
                <button
                  onClick={handleMineGoldCore}
                  className="relative px-6 py-3.5 bg-linear-to-b from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-mono font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.35)] active:scale-95 transition cursor-pointer flex items-center gap-2 border border-yellow-300/60"
                >
                  <span className="text-lg">✨</span>
                  <span>Mine Gold Core</span>
                  {recentMineGain !== null && (
                    <span className="absolute -top-3 right-2 text-xs font-black text-green-300 bg-black/80 px-2 py-0.5 rounded-full border border-green-500/40 animate-ping">
                      +{recentMineGain}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* CATEGORIZED SEPARATE LISTS */}
            {[
              {
                name: 'Weapons Class',
                icon: '⚔️',
                color: 'text-rose-400',
                items: ['Focus Blade', 'Rage Axe', 'Speed Dagger', 'Shield Breaker', 'Wing Charm', '???.???']
              },
              {
                name: 'Defense Safeguards',
                icon: '🛡️',
                color: 'text-sky-400',
                items: ['Magnetite Shield', 'Cloak of Shadows', 'Titan Armor']
              },
              {
                name: 'Utility Systems',
                icon: '✨',
                color: 'text-emerald-400',
                items: ['Laser Lens', 'Phantom Dust', 'Dragon Scale']
              },
              {
                name: 'Mystic Arts',
                icon: '🌀',
                color: 'text-[#cb9df2]',
                items: ['Phoenix Feather', 'Void Orb', 'Star Fragment']
              }
            ].map(category => (
              <div key={category.name} className="space-y-4">
                <h3 className="font-mono text-xs text-slate-300 uppercase font-extrabold tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                  <span>{category.icon}</span>
                  <span className={category.color}>{category.name}</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {category.items.map(itemId => {
                    const ps = gameState.powerups.find(p => p.id === itemId);
                    if (!ps) return null;
                    const data = getPowerupData(ps.id);
                    if (!data) return null;
                    
                    const currentRate = ps.owned ? (data.baseRate * ps.quantity * (1 + (ps.level - 1) * 0.5)) : 0;
                    const nextUpgradeCost = Math.floor(data.upgradeCost * ps.level * 1.5);
                    const nextBuyCostGems = Math.max(15, Math.floor(((data.upgradeCost * (1 + (ps.quantity * 0.25))) / 10) * 3));
                    const unlockCostGems = Math.max(15, Math.floor((data.upgradeCost / 10) * 3));

                    return (
                      <div key={ps.id} className="group relative overflow-visible bg-linear-to-b from-[#1a2440] to-[#111a2e] border border-[#2a3d60] rounded-2xl p-4.5 shadow-lg flex flex-col justify-between hover:border-blue-500/40 transition">
                        {/* Tooltip on Hover */}
                        <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 scale-90 bg-linear-to-b from-[#121c32] to-[#0c1322] border border-[#304d7c] rounded-2xl p-4 w-72 text-[#b0c8e8] text-xs leading-relaxed shadow-[0_12px_40px_rgba(0,0,0,0.85),inset_0_0_0_1px_#2a4068] opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none z-[100] text-center">
                          <div className="font-mono text-xs text-[#f5e56b] font-extrabold uppercase tracking-wider mb-1.5">✦ {data.id}</div>
                          <span className="text-xs uppercase font-bold tracking-widest block mb-1.5" style={{ color: {
                            'Common': '#8a9aaa',
                            'Uncommon': '#6aaa8a',
                            'Rare': '#4a8ad0',
                            'Epic': '#aa6ad0',
                            'Legendary': '#f5a040',
                            'Mythic': '#f04080',
                            '??': '#6a6a7a'
                          }[data.rarity] || '#8a9aaa' }}>
                            {data.rarity}
                          </span>
                          <p className="text-slate-300 italic mb-2">"{data.description}"</p>
                          <div className="border-t border-white/5 pt-1.5 mt-1.5 text-left space-y-1">
                            <div><span className="text-white font-bold">✨ Effect:</span> {data.effect}</div>
                            {data.special && <div><span className="text-amber-400 font-bold">⚡ Special:</span> {data.special}</div>}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2.5">
                            <span className="text-3xl">{data.emoji}</span>
                            <span className="text-sm font-extrabold text-[#d0e0ff] truncate">{ps.owned ? ps.id : '🔒 Locked'}</span>
                          </div>

                          <div className="text-xs text-slate-300 space-y-1.5 mb-4">
                            <div className="flex justify-between"><span>⚔️ ATK:</span> <span className="text-[#f5e56b] font-bold">{data.attack}</span></div>
                            <div className="flex justify-between"><span>🛡️ DEF:</span> <span className="text-[#f5e56b] font-bold">{data.defense}</span></div>
                            <div className="flex justify-between"><span>💨 SPD:</span> <span className="text-[#f5e56b] font-bold">{data.speed}</span></div>
                            <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1.5 font-mono text-xs">
                              <span>💰 Rate:</span>
                              <span className="text-green-400">+{currentRate.toFixed(1)}/s</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {ps.owned ? (
                            <>
                              <button 
                                disabled={ps.level >= data.maxLevel}
                                onClick={() => upgradePowerupLevel(ps.id)}
                                className="w-full text-xs py-2 rounded-lg border border-[#2a4060] bg-black/40 text-[#aac0e0] font-bold hover:bg-[#2a4060] hover:text-white transition disabled:opacity-30 cursor-pointer"
                              >
                                {ps.level >= data.maxLevel ? 'MAX LEVEL' : `Lv. Up (${nextUpgradeCost} 🪙)`}
                              </button>
                              <button 
                                onClick={() => buyPowerupInGame(ps.id)}
                                className="w-full text-xs py-2 rounded-lg bg-orange-600 hover:bg-orange-500 font-bold text-white transition cursor-pointer"
                              >
                                +1 Copy (${nextBuyCostGems} 💎)
                              </button>
                              <div className="text-xs text-center text-slate-300 font-bold">x{ps.quantity} Owned • Level {ps.level}</div>
                            </>
                          ) : (
                            <button 
                              onClick={() => buyPowerupInGame(ps.id)}
                              className="w-full text-xs py-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-500 font-bold text-[#cb9df2] transition cursor-pointer"
                            >
                              Unlock (${unlockCostGems} 💎)
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BOSS RUSH BATTLES */}
        {activeTab === 'bosses' && (
          <div id="boss-battle-arena" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Mobile Quick Action Banner (Noticeable Combat Options for Small Screens) */}
            <div className="lg:hidden col-span-1 bg-linear-to-r from-red-950/70 via-[#10192e] to-amber-950/70 border-2 border-red-500/50 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-2.5 text-xs">
                <span className="text-2xl animate-pulse">⚡</span>
                <div>
                  <div className="font-extrabold text-white text-xs sm:text-sm">Pre-Fight Shop & Live Arena</div>
                  <div className="text-[10px] text-amber-300 font-mono">Buy HP/DMG boosts & view live simulation</div>
                </div>
              </div>
              <button
                onClick={() => setIsBattleModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-linear-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-mono text-xs font-black uppercase tracking-wider shrink-0 cursor-pointer shadow-md shadow-red-600/30 flex items-center gap-1.5 active:scale-95 transition"
              >
                <span>Arena Modal</span>
                <span>⚔️</span>
              </button>
            </div>

            {/* Boss List */}
            <div id="boss-roster-selector" className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BOSSES.map(boss => {
                const bs = getBossState(boss.id);
                const req = getBossPowerReq(boss.id);
                const hp = getBossHP(boss.id);
                const atk = getBossAttack(boss.id);
                const powerScore = getPowerScore();

                let tag = 'Locked';
                let tagClass = 'bg-[#141c30] text-slate-400 border border-[#2a4060]';
                if (bs?.defeated) {
                  const sLeft = bs.respawnTime !== undefined ? bs.respawnTime : 15;
                  tag = `Respawning ${sLeft}s`;
                  tagClass = 'bg-amber-950/60 text-amber-300 border border-amber-500/30';
                } else if (powerScore >= req) {
                  tag = 'Ready';
                  tagClass = 'bg-[#142a20] text-[#6affaa] border border-[#3a8a5a]';
                }

                return (
                  <div key={boss.id} className="bg-linear-to-b from-[#1a2440] to-[#111a2e] border border-[#2a3d60] rounded-2xl p-4.5 flex flex-col justify-between hover:border-red-500/20 transition-colors">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl">{boss.emoji}</span>
                          <span className="font-extrabold text-base text-white">{boss.id}</span>
                        </div>
                        <span className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full ${tagClass}`}>{tag}</span>
                      </div>

                      <div className="text-xs text-slate-300 space-y-1.5 mb-4 font-mono">
                        <div className="flex justify-between"><span>❤️ HP:</span> <span className="text-red-400 font-bold">{hp}</span></div>
                        <div className="flex justify-between"><span>⚔️ ATK:</span> <span className="text-red-400 font-bold">{atk}</span></div>
                        <div className="flex justify-between"><span>🎯 Power Req:</span> <span className="text-[#7ae0ff] font-bold">{req} PS</span></div>
                        <div className="text-xs text-slate-400 italic mt-1.5 pb-1.5 border-t border-white/5 pt-1.5">✦ {boss.special}</div>
                      </div>
                    </div>

                    <button
                      disabled={bs?.defeated || powerScore < req || isFighting}
                      onClick={() => fightBoss(boss.id)}
                      className="w-full py-3 rounded-xl text-xs md:text-sm uppercase font-black tracking-wider bg-red-900/40 hover:bg-red-700/60 border border-red-500/40 text-[#ff6a6a] disabled:opacity-30 transition cursor-pointer"
                    >
                      {bs?.defeated ? `Respawning in ${bs.respawnTime !== undefined ? bs.respawnTime : 15}s` : isFighting ? 'Fighting...' : 'FIGHT'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Battle Logging & Revive Actions */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              
              {/* PRE-FIGHT COIN BOOSTS STORE */}
              <div className="bg-[#0e1628] border border-[#1a2540] rounded-2xl p-4 flex flex-col">
                <h3 className="font-mono text-xs text-[#f5e56b] uppercase font-bold tracking-wider mb-2 border-b border-white/5 pb-2 flex items-center gap-1.5">⚡ PRE-FIGHT COIN SHOP</h3>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">Upgrade your health or acquire one-off combat boosts using Gold!</p>
                
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (gameState.coins >= 250) {
                        setGameState(prev => {
                          const next = {
                            ...prev,
                            coins: prev.coins - 250,
                            maxHpBonus: (prev.maxHpBonus || 0) + 25
                          };
                          saveState(next);
                          return next;
                        });
                        addLog(`💖 Purchased HP Shield (+25 Max HP Permanent)! Current Bonus: +${(gameState.maxHpBonus || 0) + 25} HP`, 'log-heal');
                      } else {
                        addLog(`❌ Not enough coins! HP Shield costs 250 Coins.`, 'log-defeat');
                      }
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-[#141c30] hover:bg-[#1a2a4c] border border-[#2a4060] transition cursor-pointer text-left text-xs text-slate-200"
                  >
                    <span>💖 Max HP Shield (+25 HP)</span>
                    <span className="font-mono text-[#f5e56b] font-extrabold bg-[#0a0f1d] px-2 py-0.5 rounded border border-[#f5e56b]/20">250 🪙</span>
                  </button>

                  <button
                    onClick={() => {
                      if (gameState.coins >= 300) {
                        setGameState(prev => {
                          const next = {
                            ...prev,
                            coins: prev.coins - 300,
                            damageBonusPercent: (prev.damageBonusPercent || 0) + 5
                          };
                          saveState(next);
                          return next;
                        });
                        addLog(`⚔️ Purchased Combat Tonic (+5% DMG Permanent)! Current Bonus: +${(gameState.damageBonusPercent || 0) + 5}% DMG`, 'log-buff');
                      } else {
                        addLog(`❌ Not enough coins! Combat Tonic costs 300 Coins.`, 'log-defeat');
                      }
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-[#141c30] hover:bg-[#1a2a4c] border border-[#2a4060] transition cursor-pointer text-left text-xs text-slate-200"
                  >
                    <span>🔥 Combat Tonic (+5% Damage)</span>
                    <span className="font-mono text-[#f5e56b] font-extrabold bg-[#0a0f1d] px-2 py-0.5 rounded border border-[#f5e56b]/20">300 🪙</span>
                  </button>
                </div>

                <div className="flex gap-2 justify-between border-t border-white/5 pt-2 mt-3 text-xs font-mono text-slate-400">
                  <span>🛡️ Active HP Boost: +{gameState.maxHpBonus || 0} HP</span>
                  <span>⚔️ Active DMG Boost: +{gameState.damageBonusPercent || 0}%</span>
                </div>
              </div>

              {/* BATTLE RECORD CONTAINER */}
              <div id="boss-combat-log" className="bg-[#0e1628] border border-[#1a2540] rounded-2xl p-4 flex flex-col justify-between h-[360px]">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                  <h3 className="font-mono text-xs text-[#f5e56b] uppercase font-bold tracking-wider">⚔️ BATTLE RECORD</h3>
                  {onOpenLoreBook && (
                    <button
                      onClick={onOpenLoreBook}
                      className="text-xs font-mono font-bold text-[#7ae0ff] hover:text-white bg-[#141f35] hover:bg-[#1a2b4d] border border-[#2a4060] px-2 py-0.5 rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      <span>📖</span>
                      <span>Lore Book</span>
                    </button>
                  )}
                </div>
                
                {/* Dynamic live combat health bars */}
                {isFighting && activeBossId && (
                  <div className="bg-[#141c30]/60 border border-red-500/20 rounded-xl p-3 mb-3 space-y-2.5">
                    {/* Boss Health Bar */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-red-400 font-bold uppercase flex items-center gap-1">
                          <span>👾</span>
                          <span>{getBossData(activeBossId)?.id || activeBossId}</span>
                        </span>
                        <span className="font-bold text-red-300">{liveBossHP} / {liveBossMaxHP} HP</span>
                      </div>
                      <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="bg-linear-to-r from-red-600 to-orange-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(0, Math.min(100, (liveBossHP / liveBossMaxHP) * 100))}%` }}
                        />
                      </div>
                    </div>

                    {/* Player Health Bar */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-emerald-400 font-bold uppercase flex items-center gap-1">
                          <span>🛡️</span>
                          <span>{gameState.playerName || 'Hero'}</span>
                        </span>
                        <span className="font-bold text-emerald-300">{livePlayerHP} / {livePlayerMaxHP} HP</span>
                      </div>
                      <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="bg-linear-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(0, Math.min(100, (livePlayerHP / livePlayerMaxHP) * 100))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Scrolling Logs */}
                <div ref={logContainerRef} className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1 font-mono text-xs md:text-sm leading-relaxed">
                  {battleLogs.map((log, index) => (
                    <div key={index} className={`transition-all ${getLogColorStyling(log)}`}>
                      {log.message}
                    </div>
                  ))}
                </div>

                {/* Revive Button */}
                {livePlayerHP < 20 && (
                  <button 
                    onClick={handleRevive}
                    className="w-full py-3.5 rounded-2xl bg-yellow-600 hover:bg-yellow-500 text-black font-extrabold uppercase text-xs md:text-sm tracking-wider shadow-lg shadow-yellow-600/10 cursor-pointer transition-all active:scale-95"
                  >
                    ⚡ Revive (100 coins)
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

        {/* RANK & STATS DASHBOARD */}
        {activeTab === 'stats' && (
          <div className="space-y-6 max-w-[950px] mx-auto">
            {/* Top Stats Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* HERO ATTRIBUTES BLOCK */}
              <div id="stats-power-score-card" className="bg-[#0e1628] border border-[#1a2540] rounded-2xl p-5.5 flex flex-col justify-between">
                <div>
                  <h3 className="font-mono text-sm text-[#7ae0ff] uppercase font-bold tracking-wider mb-3.5 border-b border-white/5 pb-2.5 flex items-center gap-1.5">
                    📊 HERO CHARACTER ATTRIBUTES
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#141c30] p-3 rounded-xl border border-[#2a4060]/30 flex flex-col">
                      <span className="text-xs text-slate-400 block uppercase font-bold">🗡️ Total Attack</span>
                      <span className="font-mono text-sm text-[#f5e56b] font-black mt-1">+{getTotalAttack()} ATK</span>
                      <span className="text-xs text-slate-500 block leading-tight mt-1">Base + {gameState.damageBonusPercent || 0}% Tonic</span>
                    </div>
                    <div className="bg-[#141c30] p-3 rounded-xl border border-[#2a4060]/30 flex flex-col">
                      <span className="text-xs text-slate-400 block uppercase font-bold">🛡️ Armor / Defense</span>
                      <span className="font-mono text-sm text-[#7ae0ff] font-black mt-1">+{getTotalDefense()} DEF</span>
                      <span className="text-xs text-slate-500 block leading-tight mt-1">Reduces boss strike dmg</span>
                    </div>
                    <div className="bg-[#141c30] p-3 rounded-xl border border-[#2a4060]/30 flex flex-col">
                      <span className="text-xs text-slate-400 block uppercase font-bold">💖 Total Max HP</span>
                      <span className="font-mono text-sm text-red-400 font-black mt-1">{100 + getTotalDefense() + (gameState.maxHpBonus || 0)} HP</span>
                      <span className="text-xs text-slate-500 block leading-tight mt-1">Base + {gameState.maxHpBonus || 0} Shield</span>
                    </div>
                    <div className="bg-[#141c30] p-3 rounded-xl border border-[#2a4060]/30 flex flex-col">
                      <span className="text-xs text-slate-400 block uppercase font-bold">💨 Speed Rating</span>
                      <span className="font-mono text-sm text-[#cb9df2] font-black mt-1">+{getTotalSpeed()} SPD</span>
                      <span className="text-xs text-slate-500 block leading-tight mt-1">Base 10 + Powerup boost</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black/35 border border-white/5 rounded-xl p-3 mt-4 text-xs font-mono text-slate-300 space-y-1">
                  <div className="flex justify-between"><span>👑 Player Name:</span> <span className="font-bold text-white">{gameState.playerName || 'Hero'}</span></div>
                  <div className="flex justify-between"><span>🛡️ Total Power Score:</span> <span className="font-bold text-[#f5e56b]">{getPowerScore()} PS</span></div>
                  <div className="flex justify-between"><span>💰 Gold Balance:</span> <span className="font-bold text-yellow-400">{Math.floor(gameState.coins)} 🪙</span></div>
                </div>
              </div>

              {/* BOSS KILL/DEATH HISTORY LEDGER */}
              <div id="stats-telemetry-card" className="bg-[#0e1628] border border-[#1a2540] rounded-2xl p-5.5">
                <h3 className="font-mono text-sm text-red-400 uppercase font-bold tracking-wider mb-3.5 border-b border-white/5 pb-2.5 flex items-center gap-1.5">
                  🏆 BOSS KILL/DEATH HISTORY
                </h3>
                
                <div className="space-y-2 max-h-[225px] overflow-y-auto pr-1">
                  {BOSSES.map(boss => {
                    const kills = gameState.bossKillStats?.[boss.id] || 0;
                    const deaths = gameState.bossDeathStats?.[boss.id] || 0;
                    return (
                      <div key={boss.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl text-xs font-mono">
                        <span className="text-slate-300 flex items-center gap-2">
                          <span className="text-lg">{boss.emoji}</span>
                          <span className="font-bold truncate max-w-[140px]">{boss.id}</span>
                        </span>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="bg-[#142a20] text-[#6affaa] px-2 py-1 rounded border border-[#3a8a5a]/20 font-bold">⚔️ {kills} KILLS</span>
                          <span className="bg-red-950/40 text-red-400 px-2 py-1 rounded border border-red-500/10 font-bold">💀 {deaths} DEATHS</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* HALL OF CHAMPIONS LEADERBOARD */}
            <div id="stats-leaderboard-card" className="bg-[#0e1628] border border-[#1a2540] rounded-2xl p-5.5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3 mb-4">
                <div>
                  <h3 className="text-[#f5e56b] font-mono text-sm uppercase tracking-wider font-extrabold flex items-center gap-2">
                    <span>👑 HALL OF CHAMPIONS LEADERBOARD</span>
                    <span className="text-xs bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-sans font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Cloud Live</span>
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time global rankings powered by Firebase Firestore.
                  </p>
                </div>

                {/* Leaderboard Actions & Sort Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex bg-[#141c30] p-1 border border-[#2a4060] rounded-xl text-xs font-mono font-bold">
                    <button
                      type="button"
                      onClick={() => setLeaderboardSortBy('score')}
                      className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${leaderboardSortBy === 'score' ? 'bg-[#2a4060] text-[#f5e56b]' : 'text-slate-400 hover:text-white'}`}
                    >
                      ⚡ Power
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeaderboardSortBy('bosses')}
                      className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${leaderboardSortBy === 'bosses' ? 'bg-[#2a4060] text-red-400' : 'text-slate-400 hover:text-white'}`}
                    >
                      ⚔️ Bosses
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeaderboardSortBy('coins')}
                      className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${leaderboardSortBy === 'coins' ? 'bg-[#2a4060] text-yellow-400' : 'text-slate-400 hover:text-white'}`}
                    >
                      🪙 Gold
                    </button>
                  </div>

                  {currentUser ? (
                    <button
                      type="button"
                      onClick={() => onSyncLeaderboard && onSyncLeaderboard()}
                      disabled={isSyncingLeaderboard}
                      className="text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <span className={isSyncingLeaderboard ? 'animate-spin inline-block' : ''}>🔄</span>
                      <span>{isSyncingLeaderboard ? 'Syncing...' : 'Sync Score'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onOpenAccount}
                      className="text-xs bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-blue-300 font-extrabold px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🔑</span>
                      <span>Sign In to Rank</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Guest prompt banner if not logged in */}
              {!currentUser && (
                <div className="mb-4 bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/30 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏆</span>
                    <span className="text-xs text-slate-300">
                      Sign in with <strong className="text-white">Email</strong> or <strong className="text-white">Google</strong> to bind your base account and submit your score of <strong className="text-[#f5e56b]">{getPowerScore()} PS</strong>!
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAccount}
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    Connect Account
                  </button>
                </div>
              )}
              
              {/* Leaderboard Entries List */}
              <div className="space-y-2">
                {(() => {
                  // Fallback challengers if Firestore is currently empty or loading
                  const defaultChallengers: LeaderboardEntry[] = [
                    { userId: 'challenger-1', name: 'ZeusBlade', score: 3250, bosses: 7, coins: 50000, avatar: '⚡', title: 'Grand Champion' },
                    { userId: 'challenger-2', name: 'ConcentratedFocus', score: 2850, bosses: 5, coins: 34500, avatar: '🔮', title: 'Arcane Adept' },
                    { userId: 'challenger-3', name: 'ShadowWraith', score: 2100, bosses: 4, coins: 12000, avatar: '🐉', title: 'Void Stalker' },
                    { userId: 'challenger-4', name: 'LichBuster', score: 1450, bosses: 3, coins: 6400, avatar: '🛡️', title: 'Ironclad Sentinel' }
                  ];

                  // Merge cloud entries with current user entry
                  const list: (LeaderboardEntry & { isCurrentPlayer?: boolean })[] = [...(cloudLeaderboard.length > 0 ? cloudLeaderboard : defaultChallengers)];

                  // If user is logged in or active, ensure their entry is present in the list
                  const currentPlayerName = userProfile?.displayName || currentUser?.displayName || gameState.playerName || 'Hero';
                  const currentPlayerAvatar = userProfile?.avatar || '⚔️';
                  const currentPlayerTitle = userProfile?.title || 'Grand Champion';
                  const currentScore = getPowerScore();
                  const currentBosses = gameState.totalBossesDefeated;
                  const currentCoins = Math.floor(gameState.coins);

                  const existingIndex = list.findIndex(e => (currentUser && e.userId === currentUser.uid) || (!currentUser && e.name.toLowerCase().includes(currentPlayerName.toLowerCase())));

                  if (existingIndex >= 0) {
                    list[existingIndex] = {
                      ...list[existingIndex],
                      name: currentPlayerName,
                      avatar: currentPlayerAvatar,
                      title: currentPlayerTitle,
                      score: Math.max(list[existingIndex].score, currentScore),
                      bosses: Math.max(list[existingIndex].bosses, currentBosses),
                      coins: Math.max(list[existingIndex].coins, currentCoins),
                      isCurrentPlayer: true
                    };
                  } else {
                    list.push({
                      userId: currentUser?.uid || 'guest-current',
                      name: currentPlayerName,
                      avatar: currentPlayerAvatar,
                      title: currentPlayerTitle,
                      score: currentScore,
                      bosses: currentBosses,
                      coins: currentCoins,
                      isCurrentPlayer: true
                    });
                  }

                  // Sort list based on active filter
                  list.sort((a, b) => {
                    if (leaderboardSortBy === 'bosses') return b.bosses - a.bosses;
                    if (leaderboardSortBy === 'coins') return b.coins - a.coins;
                    return b.score - a.score;
                  });

                  return list.map((entry, index) => {
                    let medal = `#${index + 1}`;
                    let medalClass = 'text-slate-400 font-mono text-xs';
                    if (index === 0) { medal = '🥇'; medalClass = 'text-yellow-400 text-xl'; }
                    else if (index === 1) { medal = '🥈'; medalClass = 'text-slate-300 text-xl'; }
                    else if (index === 2) { medal = '🥉'; medalClass = 'text-amber-600 text-xl'; }

                    const isYou = entry.isCurrentPlayer;

                    return (
                      <div 
                        key={entry.userId || `${entry.name}-${index}`} 
                        className={`flex items-center justify-between p-3 sm:p-3.5 rounded-xl border transition ${
                          isYou 
                            ? 'bg-blue-600/15 border-blue-500/40 shadow-sm shadow-blue-500/10' 
                            : 'bg-white/5 border-white/5 hover:bg-white/8'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                          <span className={`w-8 sm:w-10 text-center shrink-0 ${medalClass}`}>{medal}</span>
                          <span className="text-xl sm:text-2xl shrink-0">{entry.avatar || '⚔️'}</span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-xs sm:text-sm font-extrabold truncate ${isYou ? 'text-blue-300' : 'text-slate-200'}`}>
                                {entry.name}
                              </span>
                              {isYou && (
                                <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.5 rounded font-bold">
                                  You
                                </span>
                              )}
                              {entry.title && (
                                <span className="text-xs bg-white/5 text-slate-400 border border-white/10 px-1.5 py-0.5 rounded hidden md:inline font-mono">
                                  {entry.title}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                              <span>🪙 {entry.coins.toLocaleString()} gold</span>
                              {entry.updatedAt && (
                                <span className="text-slate-500 hidden sm:inline">• synced</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-5 text-xs font-mono font-bold shrink-0">
                          <span className="text-slate-300 flex items-center gap-1">
                            <span className="text-red-400">⚔️</span>
                            <span>{entry.bosses}</span>
                            <span className="text-slate-500 hidden sm:inline">bosses</span>
                          </span>
                          <div className="bg-[#141c30] px-2.5 py-1 rounded-lg border border-[#2a4060]/40 text-right">
                            <span className="text-[#f5e56b] block text-xs sm:text-sm font-black">{entry.score.toLocaleString()} PS</span>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* COMBAT ARENA MODAL OVERLAY WITH ACTIVE FIGHT ANIMATION */}
      {isBattleModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#0c1322] border-2 border-red-500/50 rounded-3xl shadow-[0_0_60px_rgba(239,68,68,0.3)] p-4 sm:p-6 flex flex-col gap-4 text-slate-200 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl animate-pulse">⚔️</span>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white font-mono uppercase tracking-wider flex items-center gap-2">
                    <span>Arena Combat Simulation</span>
                    {isFighting && <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {activeBossId ? `Target: ${activeBossId}` : 'Pre-Fight Readiness & Combat Arena'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBattleModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer text-base font-bold"
                title="Close Arena Modal"
              >
                ✕
              </button>
            </div>

            {/* Duel Stage Visualization */}
            {activeBossId ? (
              <div className="bg-linear-to-b from-[#1c0f2b] via-[#121c30] to-[#0c1322] border border-red-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden shadow-inner">
                {/* Hero / Player Fighter Card */}
                <div className="flex flex-col items-center text-center space-y-1.5 flex-1">
                  <span className={`text-4xl sm:text-5xl ${isFighting ? 'animate-bounce' : ''}`}>{userProfile?.avatar || '⚔️'}</span>
                  <div className="font-extrabold text-sm text-emerald-300 font-mono">{gameState.playerName || 'Champion'}</div>
                  <div className="text-xs font-bold text-slate-400 font-mono">ATK {getTotalAttack()} • DEF {getTotalDefense()}</div>
                  {/* Player HP Bar */}
                  <div className="w-full max-w-[180px] bg-black/60 h-3 rounded-full overflow-hidden border border-emerald-500/40 p-0.5">
                    <div 
                      className="bg-linear-to-r from-emerald-500 to-emerald-300 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(0, Math.min(100, (livePlayerHP / livePlayerMaxHP) * 100))}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">{livePlayerHP} / {livePlayerMaxHP} HP</span>
                </div>

                {/* VS Dynamic Indicator */}
                <div className="flex flex-col items-center justify-center shrink-0">
                  <span className="text-2xl font-black font-mono text-red-500 animate-pulse bg-red-950/70 border border-red-500/40 px-3.5 py-1 rounded-xl shadow-lg shadow-red-950/50">VS</span>
                  <span className="text-[10px] text-slate-300 font-mono mt-1 uppercase tracking-wider font-extrabold">
                    {isFighting ? '⚔️ DUEL ACTIVE' : 'PRE-FIGHT READY'}
                  </span>
                </div>

                {/* Boss Fighter Card */}
                <div className="flex flex-col items-center text-center space-y-1.5 flex-1">
                  <span className={`text-4xl sm:text-5xl ${isFighting ? 'animate-pulse' : ''}`}>{getBossData(activeBossId)?.emoji || '👹'}</span>
                  <div className="font-extrabold text-sm text-red-400 font-mono">{activeBossId}</div>
                  <div className="text-xs font-bold text-slate-400 font-mono">Boss HP: {getBossHP(activeBossId)}</div>
                  {/* Boss HP Bar */}
                  <div className="w-full max-w-[180px] bg-black/60 h-3 rounded-full overflow-hidden border border-red-500/40 p-0.5">
                    <div 
                      className="bg-linear-to-r from-red-600 to-orange-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(0, Math.min(100, (liveBossHP / liveBossMaxHP) * 100))}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-red-400">{liveBossHP} / {liveBossMaxHP} HP</span>
                </div>
              </div>
            ) : (
              <div className="bg-[#141d30] border border-[#2a4060] rounded-2xl p-4 text-center">
                <span className="text-3xl block mb-2">🎯</span>
                <p className="text-xs font-bold text-slate-300">Select any arena boss from the roster to trigger a live animated duel simulation!</p>
              </div>
            )}

            {/* Quick Pre-Fight Coin Boosts inside Modal */}
            <div className="bg-[#141d30] border border-[#2a4060] rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[#f5e56b] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>PRE-FIGHT GOLD BOOST SHOP</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-bold">Gold Balance: 🪙 {Math.floor(gameState.coins).toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    if (gameState.coins >= 250) {
                      setGameState(prev => {
                        const next = { ...prev, coins: prev.coins - 250, maxHpBonus: (prev.maxHpBonus || 0) + 25 };
                        saveState(next);
                        return next;
                      });
                      addLog(`💖 Purchased HP Shield (+25 Max HP Permanent)!`, 'log-heal');
                    } else {
                      addLog(`❌ Need 250 Coins for HP Shield.`, 'log-defeat');
                    }
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-[#1c2944] hover:bg-[#25375c] border border-[#2a4060] text-xs font-bold text-slate-200 flex items-center justify-between transition cursor-pointer active:scale-95"
                >
                  <span className="flex items-center gap-1">💖 Max HP Shield (+25 HP)</span>
                  <span className="text-[#f5e56b] font-mono font-extrabold bg-[#0a0f1d] px-2 py-0.5 rounded border border-[#f5e56b]/20">250 🪙</span>
                </button>

                <button
                  onClick={() => {
                    if (gameState.coins >= 300) {
                      setGameState(prev => {
                        const next = { ...prev, coins: prev.coins - 300, damageBonusPercent: (prev.damageBonusPercent || 0) + 5 };
                        saveState(next);
                        return next;
                      });
                      addLog(`⚔️ Purchased Combat Tonic (+5% DMG Permanent)!`, 'log-buff');
                    } else {
                      addLog(`❌ Need 300 Coins for Combat Tonic.`, 'log-defeat');
                    }
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-[#1c2944] hover:bg-[#25375c] border border-[#2a4060] text-xs font-bold text-slate-200 flex items-center justify-between transition cursor-pointer active:scale-95"
                >
                  <span className="flex items-center gap-1">🔥 Combat Tonic (+5% DMG)</span>
                  <span className="text-[#f5e56b] font-mono font-extrabold bg-[#0a0f1d] px-2 py-0.5 rounded border border-[#f5e56b]/20">300 🪙</span>
                </button>
              </div>
            </div>

            {/* Live Scrolling Battle Feed in Modal */}
            <div className="bg-[#080d18] border border-white/10 rounded-2xl p-3.5 h-44 overflow-y-auto space-y-1.5 font-mono text-xs shadow-inner">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1 font-bold">Live Combat Log Feed:</span>
              {battleLogs.map((log, index) => (
                <div key={index} className={`transition-all ${getLogColorStyling(log)}`}>
                  {log.message}
                </div>
              ))}
            </div>

            {/* Footer Controls */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
              {livePlayerHP < 20 && (
                <button 
                  onClick={handleRevive}
                  className="px-4 py-2 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-black font-extrabold uppercase text-xs tracking-wider cursor-pointer transition shadow-md shadow-yellow-600/20 active:scale-95"
                >
                  ⚡ Revive (100 coins)
                </button>
              )}
              
              <button
                onClick={() => setIsBattleModalOpen(false)}
                className="ml-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Close Arena
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
