import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, query, orderBy, limit, getDocs, doc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { POWERUPS, DEFAULT_HERO_BASELINE } from '../data';
import { APP_CONFIG } from '../config/appConfig';
import { GameState, LeaderboardEntry, PurchaseItem, PurchaseRecord, TempPayloadItem, UserProfile } from '../types';

import AdminCartInspector from './admin/AdminCartInspector';
import AdminCodeGenerator from './admin/AdminCodeGenerator';
import AdminCodeTracking from './admin/AdminCodeTracking';
import AdminUserModeration from './admin/AdminUserModeration';
import AdminBalanceConfig from './admin/AdminBalanceConfig';

import { User as FirebaseUser } from 'firebase/auth';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  cloudLeaderboard?: LeaderboardEntry[];
  currentUser?: FirebaseUser | null;
  userProfile?: UserProfile | null;
  setUserProfile?: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

export default function AdminModal({
  isOpen,
  onClose,
  gameState,
  setGameState,
  cloudLeaderboard,
  currentUser,
  userProfile,
  setUserProfile
}: AdminModalProps) {
  // User Store Statuses state
  const [userStoreStatuses, setUserStoreStatuses] = useState<{[userId: string]: boolean}>({});

  // Key builder states
  const [selectedItemId, setSelectedItemId] = useState<string>(POWERUPS[0].id);
  const [selectedQty, setSelectedQty] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<number>(25);
  const [customPayload, setCustomPayload] = useState<TempPayloadItem[]>([]);
  const [customCodeInput, setCustomCodeInput] = useState<string>('');
  
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Reverse Cart ID / Receipt Key Inspector State
  const [reverseLookupCode, setReverseLookupCode] = useState<string>('OUVL-RG3U-1WW3-MEB2');
  const [inspectedRecord, setInspectedRecord] = useState<PurchaseRecord | null>(null);
  const [lookupStatus, setLookupStatus] = useState<'idle' | 'searching' | 'found' | 'not_found'>('idle');
  const [isRegisteringCart, setIsRegisteringCart] = useState<boolean>(false);
  const [registerSuccessNotice, setRegisterSuccessNotice] = useState<string | null>(null);

  // Admin navigation sub-tab states
  const [activeAdminTab, setActiveAdminTab] = useState<'store_validation' | 'balance_config' | 'user_moderation'>('store_validation');
  const [storeValidationSubTab, setStoreValidationSubTab] = useState<'all' | 'inspector' | 'generator' | 'tracking'>('all');

  // Custom confirmation modal states
  const [confirmWipeOpen, setConfirmWipeOpen] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [deletedNotice, setDeletedNotice] = useState<string | null>(null);

  // Granular Character & Stat Wipe Configuration
  const [wipeOptions, setWipeOptions] = useState({
    wipeCurrenciesToZero: true,      // 0 Coins & 0 Gems (vs standard starter 2000c / 500g)
    wipeBaseStatsToZero: true,        // 0 ATK, 0 DEF/Armor, 0 SPD -> 0 PS (vs standard starter 10/5/10 -> 29 PS)
    wipeRevivePacksToZero: true,      // 0 Revive Nanite Packs (vs standard starter 2 packs)
    purgeReceiptHistory: false,       // Delete all minted receipt keys
    purgeLeaderboardHistory: false    // Wipe local leaderboard cache
  });

  // User leaderboard / accounts for wipe moderation
  const [playerList, setPlayerList] = useState<LeaderboardEntry[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState<boolean>(false);
  const [playerSearch, setPlayerSearch] = useState<string>('');
  const [wipeNotice, setWipeNotice] = useState<string | null>(null);
  const [confirmWipeUser, setConfirmWipeUser] = useState<{ userId: string; action: 'leaderboard' | 'account'; name: string } | null>(null);

  // Cloud purchases
  const [cloudPurchases, setCloudPurchases] = useState<PurchaseRecord[]>([]);

  // Helper to save local state
  const saveState = (newState: GameState) => {
    localStorage.setItem('bossRushTycoon', JSON.stringify(newState));
  };

  const fetchPlayers = useCallback(async () => {
    setLoadingPlayers(true);
    try {
      const snap = await getDocs(query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(100)));
      const list: LeaderboardEntry[] = [];
      snap.forEach(d => list.push(d.data() as LeaderboardEntry));
      setPlayerList(list);

      // Fetch and map store status from 'users' collection
      const usersSnap = await getDocs(collection(db, 'users'));
      const statuses: {[userId: string]: boolean} = {};
      usersSnap.forEach(d => {
        const data = d.data();
        if (data.userId) {
          statuses[data.userId] = !!data.isArmoryStoreEnabled;
        }
      });
      setUserStoreStatuses(statuses);
    } catch (e) {
      console.warn('Could not fetch leaderboard or users for admin moderation:', e);
      if (cloudLeaderboard && cloudLeaderboard.length > 0) {
        setPlayerList(cloudLeaderboard);
      } else if (gameState.leaderboard && gameState.leaderboard.length > 0) {
        setPlayerList(gameState.leaderboard);
      }
    } finally {
      setLoadingPlayers(false);
    }
  }, [cloudLeaderboard, gameState.leaderboard]);

  const handleToggleArmoryStore = async (userId: string) => {
    const currentStatus = !!userStoreStatuses[userId];
    const newStatus = !currentStatus;
    try {
      await setDoc(doc(db, 'users', userId), { isArmoryStoreEnabled: newStatus }, { merge: true });
      setUserStoreStatuses(prev => ({ ...prev, [userId]: newStatus }));
      
      // Update local profile if self
      if (currentUser && currentUser.uid === userId && setUserProfile) {
        setUserProfile(prev => prev ? { ...prev, isArmoryStoreEnabled: newStatus } : null);
      }
    } catch (err) {
      console.error('Error toggling armory store access:', err);
    }
  };

  const fetchCloudPurchases = useCallback(async () => {
    try {
      const snap = await getDocs(query(collection(db, 'purchases'), orderBy('date', 'desc'), limit(100)));
      const list: PurchaseRecord[] = [];
      snap.forEach(d => list.push(d.data() as PurchaseRecord));
      setCloudPurchases(list);
      
      // Merge with gameState.purchasedCodes if not already present
      if (list.length > 0) {
        setGameState(prev => {
          const existingCodes = new Set(prev.purchasedCodes.map(c => c.code));
          const newCodes = list.filter(c => !existingCodes.has(c.code));
          if (newCodes.length > 0) {
            const next = {
              ...prev,
              purchasedCodes: [...newCodes, ...prev.purchasedCodes]
            };
            saveState(next);
            return next;
          }
          return prev;
        });
      }
    } catch (e) {
      console.warn('Cloud purchases not available or offline:', e);
    }
  }, [setGameState]);

  useEffect(() => {
    if (isOpen) {
      fetchPlayers();
      fetchCloudPurchases();
    }
  }, [isOpen, fetchPlayers, fetchCloudPurchases]);

  // Combined code records
  const allCodes = useMemo(() => {
    const map = new Map<string, PurchaseRecord>();
    gameState.purchasedCodes.forEach(r => map.set(r.code.toUpperCase(), r));
    cloudPurchases.forEach(r => {
      const upper = r.code.toUpperCase();
      if (!map.has(upper)) {
        map.set(upper, r);
      }
    });
    return Array.from(map.values());
  }, [gameState.purchasedCodes, cloudPurchases]);

  // Perform reverse lookup on a Cart ID or Code
  const performReverseLookup = useCallback(async (codeToInspect: string) => {
    const cleanCode = codeToInspect.trim().toUpperCase();
    if (!cleanCode) {
      setInspectedRecord(null);
      setLookupStatus('idle');
      return;
    }

    setLookupStatus('searching');

    // 1. Check local & merged records
    const foundLocal = allCodes.find(r => r.code.toUpperCase() === cleanCode);
    if (foundLocal) {
      setInspectedRecord(foundLocal);
      setLookupStatus('found');
      return;
    }

    // 2. Query Firestore directly
    try {
      const docRef = doc(db, 'purchases', cleanCode);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as PurchaseRecord;
        setInspectedRecord(data);
        setLookupStatus('found');
        setGameState(prev => {
          if (prev.purchasedCodes.some(c => c.code.toUpperCase() === cleanCode)) return prev;
          const next = { ...prev, purchasedCodes: [data, ...prev.purchasedCodes] };
          saveState(next);
          return next;
        });
        return;
      }
    } catch (e) {
      console.warn('Direct Firestore reverse lookup failed:', e);
    }

    setInspectedRecord(null);
    setLookupStatus('not_found');
  }, [allCodes, setGameState]);

  useEffect(() => {
    if (isOpen && reverseLookupCode) {
      performReverseLookup(reverseLookupCode);
    }
  }, [isOpen, performReverseLookup, reverseLookupCode]);

  const handleWipeFromLeaderboard = async (userId: string, name: string) => {
    try {
      await deleteDoc(doc(db, 'leaderboard', userId));
      setPlayerList(prev => prev.filter(p => p.userId !== userId));
      setGameState(prev => ({
        ...prev,
        leaderboard: prev.leaderboard.filter(p => p.userId !== userId)
      }));
      setConfirmWipeUser(null);
      setWipeNotice(`Player "${name}" successfully wiped from global leaderboard.`);
      setTimeout(() => setWipeNotice(null), 4000);
    } catch (err) {
      console.error('Error wiping leaderboard record:', err);
      setWipeNotice(`Could not wipe "${name}" from leaderboard. Check Firestore permissions.`);
    }
  };

  const handleResetAccountStats = async (userId: string, name: string) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        powerScore: 0,
        totalBossesDefeated: 0,
        coins: 0,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      await setDoc(doc(db, 'leaderboard', userId), {
        score: 0,
        bosses: 0,
        coins: 0,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setPlayerList(prev => prev.map(p => p.userId === userId ? { ...p, score: 0, bosses: 0, coins: 0 } : p));
      setConfirmWipeUser(null);
      setWipeNotice(`Account stats for "${name}" have been reset to 0.`);
      setTimeout(() => setWipeNotice(null), 4000);
    } catch (err) {
      console.error('Error resetting user stats:', err);
      setWipeNotice(`Could not reset account for "${name}".`);
    }
  };

  const handleSyncGodConfigToUser = async (userId: string, name: string) => {
    try {
      const configToSync = gameState.balanceConfig || {
        baseReviveCost: 100,
        reviveCostMultiplier: 1.5,
        goldDropChance: 100,
        gemDropChance: 15,
        goldMultiplier: 1.0,
        gemMultiplier: 1.0,
        permUpgradeLimitPerFight: 3
      };
      await setDoc(doc(db, 'users', userId), {
        balanceConfig: configToSync,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setWipeNotice(`🧬 God Sandbox Balance Config successfully synced to "${name}"'s base account!`);
      setTimeout(() => setWipeNotice(null), 4000);
    } catch (err) {
      console.error('Error syncing god config:', err);
      setWipeNotice(`Could not sync God config for "${name}".`);
    }
  };

  const handleGrantRevivesToUser = async (userId: string, name: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userRef);
      const currentPacks = docSnap.exists() ? (docSnap.data().revivePacks || 0) : 0;
      await setDoc(userRef, {
        revivePacks: currentPacks + 5,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setWipeNotice(`🩹 Successfully granted +5 Revive Packs to "${name}" in the cloud!`);
      setTimeout(() => setWipeNotice(null), 4000);
    } catch (err) {
      console.error('Error granting packs in cloud:', err);
      setWipeNotice(`Could not grant revive packs to "${name}".`);
    }
  };

  const handleClearDeathForUser = async (userId: string, name: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        isDead: false,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setWipeNotice(`⚡ Cleared death status for "${name}" in the cloud!`);
      setTimeout(() => setWipeNotice(null), 4000);
    } catch (err) {
      console.error('Error clearing death in cloud:', err);
      setWipeNotice(`Could not revive "${name}".`);
    }
  };

  const handleResetRevivesForUser = async (userId: string, name: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        reviveCount: 0,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setWipeNotice(`🔄 Reset progressive death scaling cost counter to 0 for "${name}"!`);
      setTimeout(() => setWipeNotice(null), 4000);
    } catch (err) {
      console.error('Error resetting scaling in cloud:', err);
      setWipeNotice(`Could not reset counters for "${name}".`);
    }
  };

  const addToPayload = () => {
    const item = POWERUPS.find(p => p.id === selectedItemId);
    if (!item) return;

    setCustomPayload(prev => {
      const existing = prev.find(i => i.id === selectedItemId);
      if (existing) {
        return prev.map(i => i.id === selectedItemId ? { ...i, qty: i.qty + selectedQty } : i);
      }
      return [...prev, { id: selectedItemId, qty: selectedQty, emoji: item.emoji }];
    });
  };

  const removeFromPayload = (id: string) => {
    setCustomPayload(prev => prev.filter(i => i.id !== id));
  };

  const generateCustomCode = async (targetCodeOverride?: string) => {
    if (customPayload.length === 0) return;

    let code = targetCodeOverride;
    if (!code) {
      if (customCodeInput.trim()) {
        code = customCodeInput.trim().toUpperCase();
      } else {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        code = `STORE-${segment()}-${segment()}`;
      }
    }

    const items: PurchaseItem[] = customPayload.map(i => ({
      id: i.id,
      pack: i.pack || 'In-Store Order',
      qty: i.qty,
      price: Math.max(1, Math.floor(customPrice / customPayload.length)),
      emoji: i.emoji
    }));

    const newRecord: PurchaseRecord = {
      code,
      items,
      total: customPrice,
      date: new Date().toISOString(),
      redeemed: false
    };

    setGameState(prev => {
      const next = {
        ...prev,
        purchasedCodes: [newRecord, ...prev.purchasedCodes.filter(c => c.code.toUpperCase() !== code)]
      };
      saveState(next);
      return next;
    });

    try {
      await setDoc(doc(db, 'purchases', code), newRecord);
    } catch (e) {
      console.warn('Could not sync purchase to Firestore:', e);
    }

    setGeneratedCode(code);
    setCustomPayload([]);
    setCustomCodeInput('');
    setIsRegisteringCart(false);
    setRegisterSuccessNotice(`Successfully registered and allocated order for Cart ID: ${code}`);
    setTimeout(() => setRegisterSuccessNotice(null), 5000);

    setReverseLookupCode(code);
    performReverseLookup(code);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCodeRedeemed = async (codeStr: string) => {
    const upper = codeStr.toUpperCase();
    let updatedRecord: PurchaseRecord | null = null;

    setGameState(prev => {
      const nextCodes = prev.purchasedCodes.map(r => {
        if (r.code.toUpperCase() === upper) {
          const updated = { ...r, redeemed: !r.redeemed };
          updatedRecord = updated;
          return updated;
        }
        return r;
      });
      const next = { ...prev, purchasedCodes: nextCodes };
      saveState(next);
      return next;
    });

    if (updatedRecord) {
      try {
        await setDoc(doc(db, 'purchases', upper), updatedRecord, { merge: true });
      } catch (e) {
        console.warn('Could not update redemption status in Firestore:', e);
      }
    }

    if (inspectedRecord && inspectedRecord.code.toUpperCase() === upper) {
      setInspectedRecord(prev => prev ? { ...prev, redeemed: !prev.redeemed } : null);
    }
  };

  const deleteCode = async (codeStr: string) => {
    const upper = codeStr.toUpperCase();
    setGameState(prev => {
      const next = {
        ...prev,
        purchasedCodes: prev.purchasedCodes.filter(r => r.code.toUpperCase() !== upper)
      };
      saveState(next);
      return next;
    });

    try {
      await deleteDoc(doc(db, 'purchases', upper));
    } catch (e) {
      console.warn('Could not delete purchase from Firestore:', e);
    }

    setDeletedNotice(`Key ${codeStr} permanently deleted.`);
    setTimeout(() => setDeletedNotice(null), 3500);

    if (inspectedRecord && inspectedRecord.code.toUpperCase() === upper) {
      setInspectedRecord(null);
      setLookupStatus('not_found');
    }
  };

  const handleWipeAll = async () => {
    const coins = wipeOptions.wipeCurrenciesToZero ? 0 : 2000;
    const gems = wipeOptions.wipeCurrenciesToZero ? 0 : 500;
    const revivePacks = wipeOptions.wipeRevivePacksToZero ? 0 : 2;
    const baseAttack = wipeOptions.wipeBaseStatsToZero ? 0 : 10;
    const baseDefense = wipeOptions.wipeBaseStatsToZero ? 0 : 5;
    const baseSpeed = wipeOptions.wipeBaseStatsToZero ? 0 : 10;
    const powerScore = wipeOptions.wipeBaseStatsToZero ? 0 : 29;

    const resetState: GameState = {
      coins,
      gems,
      maxHpBonus: 0,
      damageBonusPercent: 0,
      powerups: POWERUPS.map(p => ({ id: p.id, owned: false, level: 1, quantity: 0 })),
      bosses: [
        { id: 'Goblin King', defeated: false },
        { id: 'Orc Warlord', defeated: false },
        { id: 'Shadow Dragon', defeated: false }
      ], 
      powerScore,
      totalBossesDefeated: 0,
      playerName: 'Champion',
      battleLog: [{
        message: `🗑️ Administrator wiped game state (${wipeOptions.wipeBaseStatsToZero ? 'Absolute Zero 0 PS / 0 Armor' : 'Standard 29 PS / 5 Armor'}). Clean profile initialized.`,
        className: 'log-defeat'
      }],
      leaderboard: wipeOptions.purgeLeaderboardHistory ? [] : gameState.leaderboard,
      purchasedCodes: wipeOptions.purgeReceiptHistory ? [] : gameState.purchasedCodes,
      bossKillStats: {},
      bossDeathStats: {},
      isDead: false,
      reviveCount: 0,
      revivePacks,
      baseAttack,
      baseDefense,
      baseSpeed
    };

    if (wipeOptions.purgeReceiptHistory) {
      try {
        for (const code of cloudPurchases) {
          await deleteDoc(doc(db, 'purchases', code.code.toUpperCase()));
        }
        setCloudPurchases([]);
      } catch (e) {
        console.warn('Could not purge cloud purchases:', e);
      }
    }

    setGameState(resetState);
    saveState(resetState);
    setConfirmWipeOpen(false);
    setShowSuccessAlert(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div 
        id="admin-panel-container"
        className="w-full max-w-[880px] bg-linear-to-b from-[#111827] via-[#0d1322] to-[#070b14] border-2 border-red-500/40 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(239,68,68,0.2)] max-h-[92vh] flex flex-col"
      >
        {/* HEADER */}
        <div className="bg-linear-to-r from-red-950 via-slate-900 to-[#10192e] border-b border-red-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 bg-red-900/40 border border-red-500/30 rounded-xl">🔑</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-mono text-sm sm:text-base text-red-400 font-black tracking-wider uppercase">ADMIN PORTAL & KEY VAULT</h2>
                <span className="text-[10px] font-mono font-bold bg-slate-800 border border-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                  {APP_CONFIG.devVersionTag}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">Reverse Cart ID Inspector, Order Itemization & State Management</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition font-mono font-bold text-lg cursor-pointer bg-white/5 hover:bg-white/10 w-9 h-9 rounded-full flex items-center justify-center border border-white/10"
          >
            ✕
          </button>
        </div>

        {/* ADMIN MAIN SUB-TAB NAVIGATION */}
        <div className="bg-[#090e18] border-b border-white/10 px-6 py-4.5 sm:py-5 flex items-center gap-3 overflow-x-auto text-xs font-mono min-h-[68px] sm:min-h-[72px]">
          <button
            type="button"
            onClick={() => setActiveAdminTab('store_validation')}
            className={`px-3.5 py-1.5 rounded-xl font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              activeAdminTab === 'store_validation'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-950/50'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>🛒</span>
            <span>Store Validation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('balance_config')}
            className={`px-3.5 py-1.5 rounded-xl font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              activeAdminTab === 'balance_config'
                ? 'bg-amber-950 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-950/50'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>⚙️</span>
            <span>Adjustment Configs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('user_moderation')}
            className={`px-3.5 py-1.5 rounded-xl font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              activeAdminTab === 'user_moderation'
                ? 'bg-red-950 text-red-300 border border-red-500/50 shadow-md shadow-red-950/50'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>👥</span>
            <span>Acct Mod  & Stats</span>
          </button>
        </div>

        {/* CONTENT (SCROLLABLE) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: STORE VALIDATION VAULT & TOOLS */}
          {activeAdminTab === 'store_validation' && (
            <div className="space-y-5">
              {/* STORE VALIDATION SUB-PILL NAVIGATION */}
              <div className="bg-[#0b1322] border border-cyan-500/20 rounded-xl p-2 flex items-center gap-2.5 sm:gap-4 overflow-x-auto text-[11px] font-mono w-fit max-w-full">
                <span className="text-cyan-400 font-bold uppercase tracking-wider px-2 flex items-center gap-1 text-[9px] sm:text-[11px] shrink-0">
                  <span>🛠️</span>
                  <span>Store Tools</span>
                </span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setStoreValidationSubTab('all')}
                    className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg font-bold transition cursor-pointer text-[9px] sm:text-[11px] h-7 sm:h-8 flex items-center justify-center shrink-0 ${
                      storeValidationSubTab === 'all'
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    🛠️ All Tools
                  </button>
                  <button
                    type="button"
                    onClick={() => setStoreValidationSubTab('inspector')}
                    className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg font-bold transition cursor-pointer text-[9px] sm:text-[11px] h-7 sm:h-8 flex items-center justify-center shrink-0 ${
                      storeValidationSubTab === 'inspector'
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    🔍 Reverse Inspector
                  </button>
                  <button
                    type="button"
                    onClick={() => setStoreValidationSubTab('generator')}
                    className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg font-bold transition cursor-pointer text-[9px] sm:text-[11px] h-7 sm:h-8 flex items-center justify-center shrink-0 ${
                      storeValidationSubTab === 'generator'
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    🎫 Key Builder
                  </button>
                  <button
                    type="button"
                    onClick={() => setStoreValidationSubTab('tracking')}
                    className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg font-bold transition cursor-pointer text-[9px] sm:text-[11px] h-7 sm:h-8 flex items-center justify-center shrink-0 ${
                      storeValidationSubTab === 'tracking'
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    📋 Vault Records
                  </button>
                </div>
              </div>

              {/* SECTION 1: REVERSE CART ID & RECEIPT KEY INSPECTOR */}
              {(storeValidationSubTab === 'all' || storeValidationSubTab === 'inspector') && (
                <AdminCartInspector
                  reverseLookupCode={reverseLookupCode}
                  setReverseLookupCode={setReverseLookupCode}
                  inspectedRecord={inspectedRecord}
                  setInspectedRecord={setInspectedRecord}
                  lookupStatus={lookupStatus}
                  setLookupStatus={setLookupStatus}
                  performReverseLookup={performReverseLookup}
                  toggleCodeRedeemed={toggleCodeRedeemed}
                  deleteCode={deleteCode}
                  copyToClipboard={copyToClipboard}
                  copied={copied}
                  registerSuccessNotice={registerSuccessNotice}
                  setRegisterSuccessNotice={setRegisterSuccessNotice}
                  isRegisteringCart={isRegisteringCart}
                  setIsRegisteringCart={setIsRegisteringCart}
                  selectedItemId={selectedItemId}
                  setSelectedItemId={setSelectedItemId}
                  selectedQty={selectedQty}
                  setSelectedQty={setSelectedQty}
                  addToPayload={addToPayload}
                  removeFromPayload={removeFromPayload}
                  customPayload={customPayload}
                  setCustomPayload={setCustomPayload}
                  customPrice={customPrice}
                  setCustomPrice={setCustomPrice}
                  generateCustomCode={generateCustomCode}
                />
              )}

              {/* SECTION 2: CODE BUILDER & RECEIPT MINTING */}
              {(storeValidationSubTab === 'all' || storeValidationSubTab === 'generator') && (
                <AdminCodeGenerator
                  selectedItemId={selectedItemId}
                  setSelectedItemId={setSelectedItemId}
                  selectedQty={selectedQty}
                  setSelectedQty={setSelectedQty}
                  addToPayload={addToPayload}
                  removeFromPayload={removeFromPayload}
                  customPayload={customPayload}
                  setCustomPayload={setCustomPayload}
                  customPrice={customPrice}
                  setCustomPrice={setCustomPrice}
                  customCodeInput={customCodeInput}
                  setCustomCodeInput={setCustomCodeInput}
                  generateCustomCode={generateCustomCode}
                  generatedCode={generatedCode}
                  copyToClipboard={copyToClipboard}
                  copied={copied}
                />
              )}

              {/* SECTION 3: CODE TRACKING & CONVERSION LIST */}
              {(storeValidationSubTab === 'all' || storeValidationSubTab === 'tracking') && (
                <AdminCodeTracking
                  allCodes={allCodes}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  deletedNotice={deletedNotice}
                  setDeletedNotice={setDeletedNotice}
                  setReverseLookupCode={setReverseLookupCode}
                  performReverseLookup={performReverseLookup}
                  toggleCodeRedeemed={toggleCodeRedeemed}
                  deleteCode={deleteCode}
                />
              )}
            </div>
          )}

          {/* TAB 2: ADJUSTMENT CONFIGS */}
          {activeAdminTab === 'balance_config' && (
            <AdminBalanceConfig
              gameState={gameState}
              setGameState={setGameState}
              saveState={saveState}
            />
          )}

          {/* TAB 3: USER MODERATION & LEADERBOARD STATS */}
          {activeAdminTab === 'user_moderation' && (
            <AdminUserModeration
              playerList={playerList}
              loadingPlayers={loadingPlayers}
              playerSearch={playerSearch}
              setPlayerSearch={setPlayerSearch}
              fetchPlayers={fetchPlayers}
              wipeNotice={wipeNotice}
              setWipeNotice={setWipeNotice}
              confirmWipeUser={confirmWipeUser}
              setConfirmWipeUser={setConfirmWipeUser}
              handleWipeFromLeaderboard={handleWipeFromLeaderboard}
              handleResetAccountStats={handleResetAccountStats}
              onOpenConfirmWipe={() => setConfirmWipeOpen(true)}
              userStoreStatuses={userStoreStatuses}
              onToggleArmoryStore={handleToggleArmoryStore}
              gameState={gameState}
              setGameState={setGameState}
              saveState={saveState}
              handleSyncGodConfigToUser={handleSyncGodConfigToUser}
              handleGrantRevivesToUser={handleGrantRevivesToUser}
              handleClearDeathForUser={handleClearDeathForUser}
              handleResetRevivesForUser={handleResetRevivesForUser}
            />
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-slate-950 border-t border-white/5 px-6 py-3.5 flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ADMIN ACCESS: AUTHORIZED STORE MANAGER ({APP_CONFIG.devVersionTag})</span>
          </span>
          <span>REVERSE LOOKUP & CLOUD SYNC ACTIVE</span>
        </div>
      </div>

      {/* CUSTOM CONFIRMATION WIPE MODAL WITH GRANULAR OPTIONS */}
      {confirmWipeOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-[200]">
          <div className="w-full max-w-[540px] bg-linear-to-b from-[#1e1313] via-[#140c0c] to-[#0a0505] border-2 border-red-500/60 rounded-3xl p-6 shadow-[0_0_90px_rgba(220,38,38,0.3)] space-y-5 text-left max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-red-500/20 pb-3.5">
              <div className="w-12 h-12 bg-red-950/80 border border-red-500/40 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                ⚠️
              </div>
              <div>
                <h3 className="font-mono text-sm md:text-base uppercase text-red-400 font-black tracking-wider">
                  RESET / WIPE CHARACTER STATE
                </h3>
                <p className="text-xs text-slate-300">
                  Select your desired clean-slate profile mode or customize granular attributes:
                </p>
              </div>
            </div>

            {/* Quick Preset Mode Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setWipeOptions({
                    wipeCurrenciesToZero: true,
                    wipeBaseStatsToZero: true,
                    wipeRevivePacksToZero: true,
                    purgeReceiptHistory: false,
                    purgeLeaderboardHistory: false
                  });
                }}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                  wipeOptions.wipeBaseStatsToZero && wipeOptions.wipeCurrenciesToZero
                    ? 'bg-red-950/70 border-red-500 text-white shadow-md shadow-red-950/50'
                    : 'bg-black/40 border-white/10 text-slate-400 hover:border-red-500/40 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-red-300 flex items-center gap-1.5">
                    <span>⚡</span> Absolute Zero Slate
                  </span>
                  <span className="text-[10px] font-mono bg-red-900/60 text-red-200 px-1.5 py-0.5 rounded">
                    0 PS / 0 DEF
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Wipes raw stats to 0 ATK, 0 DEF/Armor, 0 SPD, 0 Coins, 0 Gems & 0 Nanites.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setWipeOptions({
                    wipeCurrenciesToZero: false,
                    wipeBaseStatsToZero: false,
                    wipeRevivePacksToZero: false,
                    purgeReceiptHistory: false,
                    purgeLeaderboardHistory: false
                  });
                }}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                  !wipeOptions.wipeBaseStatsToZero && !wipeOptions.wipeCurrenciesToZero
                    ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-md shadow-emerald-950/50'
                    : 'bg-black/40 border-white/10 text-slate-400 hover:border-emerald-500/40 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <span>🎮</span> Standard Starter
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-900/60 text-emerald-200 px-1.5 py-0.5 rounded">
                    {DEFAULT_HERO_BASELINE.starter.powerScore} PS / {DEFAULT_HERO_BASELINE.starter.baseDefense} DEF
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Standard starter pack: 2,000c, 500g, 2 Nanites & base hero attributes (10 ATK / {DEFAULT_HERO_BASELINE.starter.baseDefense} DEF / 10 SPD).
                </p>
              </button>
            </div>

            {/* Granular Checkbox Options */}
            <div className="bg-black/50 border border-white/10 rounded-2xl p-3.5 space-y-2.5">
              <span className="text-[11px] font-mono font-bold uppercase text-slate-300 tracking-wider block border-b border-white/10 pb-1.5">
                Granular Attributes & Vault Options:
              </span>

              {/* Toggle 1: Base Character Stats (DEF / Armor & PS) */}
              <label className="flex items-start gap-2.5 text-xs font-mono text-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={wipeOptions.wipeBaseStatsToZero}
                  onChange={(e) => setWipeOptions(prev => ({ ...prev, wipeBaseStatsToZero: e.target.checked }))}
                  className="mt-0.5 accent-red-500 rounded cursor-pointer"
                />
                <div>
                  <span className="font-bold text-red-300">Wipe Inherent Base Hero Armor & Power Score to 0</span>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    {wipeOptions.wipeBaseStatsToZero 
                      ? 'Hero will have 0 ATK, 0 DEF (0 Armor), 0 SPD = 0 PS baseline.' 
                      : `Hero retains natural unarmored stats (10 ATK, ${DEFAULT_HERO_BASELINE.starter.baseDefense} DEF/Armor, 10 SPD = ${DEFAULT_HERO_BASELINE.starter.powerScore} PS).`}
                  </p>
                </div>
              </label>

              {/* Toggle 2: Starting Currencies */}
              <label className="flex items-start gap-2.5 text-xs font-mono text-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={wipeOptions.wipeCurrenciesToZero}
                  onChange={(e) => setWipeOptions(prev => ({ ...prev, wipeCurrenciesToZero: e.target.checked }))}
                  className="mt-0.5 accent-red-500 rounded cursor-pointer"
                />
                <div>
                  <span className="font-bold text-yellow-300">Wipe Bankroll to 0 (0 Coins & 0 Gems)</span>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    {wipeOptions.wipeCurrenciesToZero 
                      ? 'Starts with 0 Coins and 0 Gems.' 
                      : 'Grants standard starter allowance (2,000 Coins and 500 Gems).'}
                  </p>
                </div>
              </label>

              {/* Toggle 3: Revive Packs */}
              <label className="flex items-start gap-2.5 text-xs font-mono text-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={wipeOptions.wipeRevivePacksToZero}
                  onChange={(e) => setWipeOptions(prev => ({ ...prev, wipeRevivePacksToZero: e.target.checked }))}
                  className="mt-0.5 accent-red-500 rounded cursor-pointer"
                />
                <div>
                  <span className="font-bold text-cyan-300">Wipe Revive Nanite Packs to 0</span>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    {wipeOptions.wipeRevivePacksToZero 
                      ? '0 Revive Packs (Requires earning nanites or coin revival).' 
                      : '2 Starter Revive Packs.'}
                  </p>
                </div>
              </label>

              {/* Toggle 4: Purge Receipt Keys */}
              <label className="flex items-start gap-2.5 text-xs font-mono text-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={wipeOptions.purgeReceiptHistory}
                  onChange={(e) => setWipeOptions(prev => ({ ...prev, purgeReceiptHistory: e.target.checked }))}
                  className="mt-0.5 accent-red-500 rounded cursor-pointer"
                />
                <div>
                  <span className="font-bold text-purple-300">Purge Minted Receipt Keys from Vault & Cloud</span>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    Permanently deletes all {gameState.purchasedCodes.length} local and cloud receipt keys.
                  </p>
                </div>
              </label>

              {/* Toggle 5: Purge Leaderboard */}
              <label className="flex items-start gap-2.5 text-xs font-mono text-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={wipeOptions.purgeLeaderboardHistory}
                  onChange={(e) => setWipeOptions(prev => ({ ...prev, purgeLeaderboardHistory: e.target.checked }))}
                  className="mt-0.5 accent-red-500 rounded cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-300">Purge Local Leaderboard & Story Chronicles</span>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    Clears local cached score history and custom chronicle entries.
                  </p>
                </div>
              </label>
            </div>

            {/* Post-Wipe State Preview Banner */}
            <div className="bg-[#120a0a] border border-red-500/20 rounded-xl p-3 text-xs font-mono space-y-1">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Post-Wipe Target State:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
                <div className="bg-black/60 p-1.5 rounded border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Power Score</span>
                  <strong className={wipeOptions.wipeBaseStatsToZero ? 'text-red-400' : 'text-emerald-400'}>
                    {wipeOptions.wipeBaseStatsToZero ? '0 PS' : `${DEFAULT_HERO_BASELINE.starter.powerScore} PS`}
                  </strong>
                </div>
                <div className="bg-black/60 p-1.5 rounded border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Armor / DEF</span>
                  <strong className={wipeOptions.wipeBaseStatsToZero ? 'text-red-400' : 'text-blue-400'}>
                    {wipeOptions.wipeBaseStatsToZero ? '0 DEF' : `${DEFAULT_HERO_BASELINE.starter.baseDefense} DEF`}
                  </strong>
                </div>
                <div className="bg-black/60 p-1.5 rounded border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Starting Gold</span>
                  <strong className={wipeOptions.wipeCurrenciesToZero ? 'text-slate-400' : 'text-yellow-400'}>
                    {wipeOptions.wipeCurrenciesToZero ? '0' : '2,000'}
                  </strong>
                </div>
                <div className="bg-black/60 p-1.5 rounded border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Nanite Revives</span>
                  <strong className={wipeOptions.wipeRevivePacksToZero ? 'text-slate-400' : 'text-cyan-400'}>
                    {wipeOptions.wipeRevivePacksToZero ? '0' : '2'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button 
                type="button"
                onClick={() => setConfirmWipeOpen(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-bold border border-white/10 transition text-xs uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleWipeAll}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black tracking-wider shadow-lg shadow-red-950/60 transition text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🗑️</span>
                <span>Execute Wipe</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM SUCCESS ALERT MODAL */}
      {showSuccessAlert && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-[200]">
          <div className="w-full max-w-[420px] bg-linear-to-b from-[#111c16] to-[#0a120e] border-2 border-emerald-500/50 rounded-3xl p-6 shadow-[0_0_80px_rgba(16,185,129,0.25)] space-y-5 text-center">
            <div className="w-16 h-16 bg-emerald-950/60 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-3xl">
              ✅
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-mono text-sm md:text-base uppercase text-emerald-400 font-black tracking-wider font-extrabold">
                WIPE COMPLETED
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Character profile successfully re-initialized to{' '}
                <strong className="text-white font-mono">
                  {gameState.powerScore === 0 ? 'Absolute Zero (0 PS / 0 Armor / 0 Currency)' : 'Standard Starter (29 PS / 5 Armor / 2,000c)'}
                </strong>.
              </p>
            </div>

            <button 
              type="button"
              onClick={() => {
                setShowSuccessAlert(false);
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-wider shadow-md hover:shadow-emerald-600/20 transition text-xs cursor-pointer"
            >
              Back to Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
