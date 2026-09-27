import React, { useState } from 'react';
import { GameState, PurchaseRecord } from '../../types';
import { POWERUPS } from '../../data';
import { CoinIcon } from '../CoinIcon';
import { getPackUnits } from '../../utils/shopUtils';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface TycoonGridProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  saveState: (newState: GameState) => void;
  addLog: (message: string, className?: string) => void;
  powerScore: number;
}

export const TycoonGrid: React.FC<TycoonGridProps> = ({
  gameState,
  setGameState,
  saveState,
  addLog,
  powerScore
}) => {
  // Redeem input state localized to Tycoon tab
  const [redeemCodeInput, setRedeemCodeInput] = useState('');

  // Manual ore mining state localized to Tycoon tab
  const [miningCombo, setMiningCombo] = useState(1);
  const [lastMineTime, setLastMineTime] = useState(0);
  const [recentMineGain, setRecentMineGain] = useState<number | null>(null);

  const getPowerupData = (id: string) => POWERUPS.find(p => p.id === id);
  const getPowerupState = (id: string) => gameState.powerups.find(p => p.id === id);

  const handleMineGoldCore = () => {
    const now = Date.now();
    const isCombo = now - lastMineTime < 950;
    const nextCombo = isCombo ? Math.min(miningCombo + 1, 10) : 1;
    setLastMineTime(now);
    setMiningCombo(nextCombo);

    const baseGain = 15 + Math.floor(powerScore / 15);
    const earned = baseGain * nextCombo;
    setRecentMineGain(earned);
    setTimeout(() => setRecentMineGain(null), 850);

    setGameState(prev => {
      const next = { ...prev, coins: prev.coins + earned };
      saveState(next);
      return next;
    });
  };

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
            <CoinIcon className="w-5 h-5 drop-shadow" />
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
                      <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1.5 font-mono text-xs items-center">
                        <span className="flex items-center gap-1">
                          <CoinIcon className="w-3.5 h-3.5 drop-shadow" />
                          <span>Rate:</span>
                        </span>
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
                          className="w-full text-xs py-2 rounded-lg border border-[#2a4060] bg-black/40 text-[#aac0e0] font-bold hover:bg-[#2a4060] hover:text-white transition disabled:opacity-30 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                        >
                          {ps.level >= data.maxLevel ? (
                            <span>MAX LEVEL</span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <span>Lv. Up ({nextUpgradeCost}</span>
                              <CoinIcon className="w-3.5 h-3.5 inline-block drop-shadow" />
                              <span>)</span>
                            </span>
                          )}
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
  );
};
