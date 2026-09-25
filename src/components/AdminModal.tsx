import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, getDocs, doc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { POWERUPS } from '../data';
import { GameState, LeaderboardEntry, PurchaseItem, PurchaseRecord } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  cloudLeaderboard?: LeaderboardEntry[];
}

interface TempPayloadItem {
  id: string;
  qty: number;
  emoji: string;
  pack?: string;
  price?: number;
}

export default function AdminModal({ isOpen, onClose, gameState, setGameState, cloudLeaderboard }: AdminModalProps) {
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

  // Custom confirmation modal states to avoid browser alert/prompt
  const [confirmWipeOpen, setConfirmWipeOpen] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [deletedNotice, setDeletedNotice] = useState<string | null>(null);

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
    } catch (e) {
      console.warn('Could not fetch leaderboard for admin moderation:', e);
      if (cloudLeaderboard && cloudLeaderboard.length > 0) {
        setPlayerList(cloudLeaderboard);
      } else if (gameState.leaderboard && gameState.leaderboard.length > 0) {
        setPlayerList(gameState.leaderboard);
      }
    } finally {
      setLoadingPlayers(false);
    }
  }, [cloudLeaderboard, gameState.leaderboard]);

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
  const allCodes = React.useMemo(() => {
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
        // Add to local state
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

  // Auto-run lookup on mount if reverseLookupCode is set
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

  const filteredPlayers = playerList.filter(p => {
    const q = playerSearch.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.userId && p.userId.toLowerCase().includes(q))
    );
  });

  if (!isOpen) return null;

  // Add item to custom payload builder
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

  // Remove item from custom payload
  const removeFromPayload = (id: string) => {
    setCustomPayload(prev => prev.filter(i => i.id !== id));
  };

  // Generate the code and push to GameState & Firestore
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

    // Save to local state
    setGameState(prev => {
      const next = {
        ...prev,
        purchasedCodes: [newRecord, ...prev.purchasedCodes.filter(c => c.code.toUpperCase() !== code)]
      };
      saveState(next);
      return next;
    });

    // Save to Firestore
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

    // Re-inspect newly minted code
    setReverseLookupCode(code);
    performReverseLookup(code);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mark a code as redeemed or not
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

    // Update in Firestore
    if (updatedRecord) {
      try {
        await setDoc(doc(db, 'purchases', upper), updatedRecord, { merge: true });
      } catch (e) {
        console.warn('Could not update redemption status in Firestore:', e);
      }
    }

    // Refresh inspected record
    if (inspectedRecord && inspectedRecord.code.toUpperCase() === upper) {
      setInspectedRecord(prev => prev ? { ...prev, redeemed: !prev.redeemed } : null);
    }
  };

  // Delete a code completely
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

  // Wipe All Data
  const handleWipeAll = () => {
    const resetState: GameState = {
      coins: 2000,
      gems: 500,
      maxHpBonus: 0,
      damageBonusPercent: 0,
      powerups: POWERUPS.map(p => ({ id: p.id, owned: false, level: 1, quantity: 0 })),
      bosses: [
        { id: 'Goblin King', defeated: false },
        { id: 'Orc Warlord', defeated: false },
        { id: 'Shadow Dragon', defeated: false }
      ], 
      powerScore: 0,
      totalBossesDefeated: 0,
      playerName: 'Champion',
      battleLog: [{ message: '🗑️ Administrator wiped game state. Clean profile initialized.', className: 'log-defeat' }],
      leaderboard: [],
      purchasedCodes: [],
      bossKillStats: {},
      bossDeathStats: {}
    };

    setGameState(resetState);
    saveState(resetState);
    setConfirmWipeOpen(false);
    setShowSuccessAlert(true);
  };

  // Filter receipt records
  const filteredCodes = allCodes.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    const matchesCode = r.code.toLowerCase().includes(searchLower);
    const matchesItem = r.items.some(i => i.id.toLowerCase().includes(searchLower));
    return matchesCode || matchesItem;
  });

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
                <span className="text-[10px] font-mono font-bold bg-amber-950/60 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded">
                  Store Manager
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

        {/* CONTENT (SCROLLABLE) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* ========================================================================= */}
          {/* SECTION 1: REVERSE CART ID & RECEIPT KEY INSPECTOR (HIGHLIGHTED)        */}
          {/* ========================================================================= */}
          <div 
            id="admin-reverse-lookup-section"
            className="bg-linear-to-b from-[#192238] via-[#101828] to-[#0a101d] border-2 border-cyan-500/40 rounded-2xl p-5 space-y-4 shadow-[0_4px_24px_rgba(6,182,212,0.12)] relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🔍</span>
                <div>
                  <h3 className="font-mono text-xs sm:text-sm text-cyan-300 font-black uppercase tracking-wider flex items-center gap-2">
                    REVERSE CART ID & KEY INSPECTOR
                    <span className="text-[10px] font-mono bg-cyan-950/80 border border-cyan-500/30 text-cyan-200 px-2 py-0.5 rounded font-normal">
                      Order Determination
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Input or paste any Cart ID / Receipt Key to reverse-lookup requested items, total price, and redemption status.
                  </p>
                </div>
              </div>

              {/* Sample Quick Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-slate-400">Quick Test:</span>
                <button
                  type="button"
                  onClick={() => {
                    setReverseLookupCode('OUVL-RG3U-1WW3-MEB2');
                    performReverseLookup('OUVL-RG3U-1WW3-MEB2');
                  }}
                  className="px-2 py-1 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono rounded font-bold transition cursor-pointer"
                >
                  OUVL-RG3U-1WW3-MEB2
                </button>
              </div>
            </div>

            {/* Input and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Enter or paste Cart ID (e.g. OUVL-RG3U-1WW3-MEB2 or STORE-XXXX-XXXX)..."
                  value={reverseLookupCode}
                  onChange={(e) => {
                    setReverseLookupCode(e.target.value);
                    if (lookupStatus !== 'idle') setLookupStatus('idle');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      performReverseLookup(reverseLookupCode);
                    }
                  }}
                  className="w-full bg-[#090e18] text-sm text-cyan-200 font-mono font-bold border border-cyan-500/40 focus:border-cyan-400 rounded-xl px-4 py-2.5 focus:outline-none placeholder:text-slate-500 placeholder:font-normal"
                />
                {reverseLookupCode && (
                  <button
                    onClick={() => {
                      setReverseLookupCode('');
                      setInspectedRecord(null);
                      setLookupStatus('idle');
                    }}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => performReverseLookup(reverseLookupCode)}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black font-mono text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 shrink-0"
              >
                <span>🔍</span>
                <span>Reverse Inspect</span>
              </button>
            </div>

            {registerSuccessNotice && (
              <div className="px-4 py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs font-mono text-emerald-200 flex items-center justify-between">
                <span>✅ {registerSuccessNotice}</span>
                <button onClick={() => setRegisterSuccessNotice(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
              </div>
            )}

            {/* INSPECTION RESULTS VIEW */}
            {lookupStatus === 'found' && inspectedRecord && (
              <div className="bg-[#0b1220] border border-cyan-500/30 rounded-xl p-4 space-y-3 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-white bg-black/60 px-3 py-1 rounded border border-cyan-500/30 tracking-wider">
                        {inspectedRecord.code}
                      </span>
                      <span className={`text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded border ${
                        inspectedRecord.redeemed 
                          ? 'bg-amber-950/60 text-amber-300 border-amber-500/30' 
                          : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {inspectedRecord.redeemed ? 'CLAIMED / FULFILLED' : 'ACTIVE / UNUSED'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      Issued on: {new Date(inspectedRecord.date).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-start sm:items-end">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Total Request Value</span>
                    <span className="text-xl font-black font-mono text-yellow-400">
                      ${inspectedRecord.total} <span className="text-xs text-slate-400 font-normal">USD</span>
                    </span>
                  </div>
                </div>

                {/* Itemized Breakdown Table */}
                <div>
                  <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                    <span>📦</span> Requested Items Breakdown ({inspectedRecord.items.length} line items):
                  </h4>
                  <div className="space-y-2">
                    {inspectedRecord.items.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="bg-black/40 border border-white/10 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs font-mono"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{item.emoji}</span>
                          <div>
                            <span className="font-bold text-white">{item.id}</span>
                            <span className="text-slate-400 text-[11px] ml-2 bg-slate-800 px-1.5 py-0.5 rounded">
                              {item.pack}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <span className="text-cyan-300 font-bold">
                            Qty: x{item.qty}
                          </span>
                          <span className="text-yellow-300 font-bold">
                            ${item.price} USD
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inspection Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleCodeRedeemed(inspectedRecord.code)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                        inspectedRecord.redeemed
                          ? 'bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {inspectedRecord.redeemed ? '↩️ Reactivate / Mark Unused' : '✔️ Mark as Claimed / Fulfilled'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const breakdown = `RECEIPT KEY: ${inspectedRecord.code}\nTOTAL: $${inspectedRecord.total} USD\nITEMS:\n` +
                          inspectedRecord.items.map(i => `- ${i.emoji} ${i.id} (${i.pack}) x${i.qty} = $${i.price} USD`).join('\n');
                        copyToClipboard(breakdown);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold border border-slate-600 transition cursor-pointer"
                    >
                      {copied ? 'Copied Invoice!' : '📋 Copy Itemization'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteCode(inspectedRecord.code)}
                    className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 rounded-lg text-xs font-mono font-bold transition cursor-pointer"
                  >
                    🗑️ Delete Record
                  </button>
                </div>
              </div>
            )}

            {/* NOT FOUND NOTIFICATION & MANUAL ORDER REGISTRATION BRIDGE */}
            {lookupStatus === 'not_found' && (
              <div className="bg-[#1a1215] border border-red-500/40 rounded-xl p-4 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-red-300 font-mono text-xs font-bold">
                  <span>⚠️</span>
                  <span>
                    Cart ID <strong className="text-white bg-black/50 px-2 py-0.5 rounded">{reverseLookupCode}</strong> is not currently registered in active local or cloud records.
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  If this Cart ID was issued on another device or physical slip, you can reconstruct and register the requested items directly to this exact Cart ID below.
                </p>

                <div className="pt-2">
                  {!isRegisteringCart ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisteringCart(true);
                        // Add default item to payload if empty
                        if (customPayload.length === 0) {
                          setCustomPayload([
                            { id: 'Focus Blade', qty: 1, emoji: '🗡️', pack: 'Single Unit', price: 25 }
                          ]);
                        }
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black font-mono text-xs rounded-xl uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-md"
                    >
                      <span>➕</span>
                      <span>Reconstruct & Register Order to {reverseLookupCode}</span>
                    </button>
                  ) : (
                    <div className="bg-black/50 border border-amber-500/30 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-xs font-mono font-bold text-amber-300 uppercase">
                          Allocate Requested Items to: <span className="text-white">{reverseLookupCode}</span>
                        </span>
                        <button
                          onClick={() => setIsRegisteringCart(false)}
                          className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
                        >
                          ✕ Cancel
                        </button>
                      </div>

                      {/* Item Selector */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                        <div className="sm:col-span-6">
                          <label className="text-[10px] text-slate-400 font-bold uppercase">Select Item</label>
                          <select
                            value={selectedItemId}
                            onChange={(e) => setSelectedItemId(e.target.value)}
                            className="w-full bg-[#141c30] text-slate-200 border border-[#2a4060] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                          >
                            {POWERUPS.map(p => (
                              <option key={p.id} value={p.id}>{p.emoji} {p.id} (${p.packs[0]?.price ?? 25} USD)</option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-3">
                          <label className="text-[10px] text-slate-400 font-bold uppercase">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={selectedQty}
                            onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full bg-[#141c30] text-slate-200 border border-[#2a4060] rounded-lg px-2.5 py-1.5 text-xs text-center font-mono font-bold"
                          />
                        </div>
                        <div className="sm:col-span-3 flex items-end">
                          <button
                            type="button"
                            onClick={addToPayload}
                            className="w-full py-1.5 bg-blue-900/50 hover:bg-blue-800 text-blue-200 border border-blue-500/40 rounded-lg text-xs font-bold uppercase transition cursor-pointer"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>

                      {/* Items in Queue */}
                      {customPayload.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Requested Items in Cart:</span>
                          {customPayload.map(i => (
                            <div key={i.id} className="flex items-center justify-between bg-white/5 px-2.5 py-1 rounded text-xs font-mono">
                              <span className="text-slate-200">{i.emoji} {i.id} <strong className="text-amber-300">x{i.qty}</strong></span>
                              <button
                                onClick={() => removeFromPayload(i.id)}
                                className="text-red-400 hover:text-red-300 text-[11px] px-1.5 py-0.5 rounded bg-red-950/40"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Price & Submit */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-mono font-bold uppercase">Order Total:</span>
                          <input
                            type="number"
                            min="1"
                            value={customPrice}
                            onChange={(e) => setCustomPrice(Math.max(1, parseInt(e.target.value) || 1))}
                            className="bg-[#141c30] text-yellow-300 border border-[#2a4060] rounded-lg px-2 py-1 text-xs w-20 text-center font-bold font-mono"
                          />
                          <span className="text-xs text-slate-400 font-mono">USD</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => generateCustomCode(reverseLookupCode)}
                          className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono rounded-lg uppercase tracking-wider transition cursor-pointer shadow-md"
                        >
                          💾 Save & Mint to {reverseLookupCode}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2: CODE BUILDER & RECEIPT MINTING (SELECTOR 2)                   */}
          {/* ========================================================================= */}
          <div 
            id="admin-code-builder-section"
            className="bg-linear-to-b from-[#141d30] via-[#0d1524] to-[#080d18] border border-blue-500/30 rounded-2xl p-5 space-y-4 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-500/20 pb-3">
              <div>
                <h3 className="font-mono text-xs sm:text-sm text-[#7ae0ff] font-extrabold uppercase tracking-widest flex items-center gap-2">
                  <span>🎫</span> GENERATE CUSTOM IN-STORE RECEIPT KEY
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Mint a secure receipt key with custom power-up payloads for in-person customer checkout or promotional delivery.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* SELECT ITEM */}
              <div className="md:col-span-6 flex flex-col gap-1.5">
                <label className="text-xs text-slate-300 font-bold uppercase">Power-up Item</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="bg-[#141c30] text-slate-200 border border-[#2a4060] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-medium"
                >
                  {POWERUPS.map(p => (
                    <option key={p.id} value={p.id}>{p.emoji} {p.id} ({p.rarity}) — ${p.packs[0]?.price ?? 25} USD</option>
                  ))}
                </select>
              </div>

              {/* SELECT QUANTITY */}
              <div className="md:col-span-3 flex flex-col gap-1.5">
                <label className="text-xs text-slate-300 font-bold uppercase">QTY Units</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={selectedQty}
                  onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="bg-[#141c30] text-slate-200 border border-[#2a4060] rounded-xl px-3 py-2 text-xs text-center focus:outline-none focus:border-blue-500 font-bold font-mono"
                />
              </div>

              {/* ADD TO PAYLOAD BUTTON */}
              <div className="md:col-span-3 flex items-end">
                <button
                  type="button"
                  onClick={addToPayload}
                  className="w-full py-2 bg-blue-900/50 hover:bg-blue-800/70 border border-blue-500/40 text-blue-200 hover:text-white rounded-xl text-xs font-extrabold uppercase transition cursor-pointer shadow-sm"
                >
                  ➕ Add Item
                </button>
              </div>
            </div>

            {/* PAYLOAD LIST */}
            {customPayload.length > 0 && (
              <div className="bg-black/40 rounded-xl p-3.5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-300 uppercase font-bold tracking-wider">Order Queue ({customPayload.length} items)</p>
                  <button onClick={() => setCustomPayload([])} className="text-[11px] text-red-400 hover:text-red-300 font-mono">Clear Queue</button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {customPayload.map(i => (
                    <div key={i.id} className="flex items-center justify-between bg-white/5 px-3 py-1.5 rounded-lg text-xs font-mono">
                      <span className="text-slate-200">{i.emoji} {i.id} <strong className="text-[#7ae0ff]">x{i.qty}</strong></span>
                      <button
                        onClick={() => removeFromPayload(i.id)}
                        className="text-red-400 hover:text-red-300 font-bold transition px-2 py-0.5 rounded bg-red-950/40"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-300 uppercase font-bold font-mono">Price:</span>
                      <input
                        type="number"
                        min="1"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(Math.max(1, parseInt(e.target.value) || 1))}
                        className="bg-[#141c30] text-[#f5e56b] border border-[#2a4060] rounded-lg px-2.5 py-1 text-xs w-20 text-center font-bold font-mono"
                      />
                      <span className="text-xs text-slate-400 font-mono">USD</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Custom Code ID (Optional)"
                        value={customCodeInput}
                        onChange={(e) => setCustomCodeInput(e.target.value)}
                        className="bg-[#141c30] text-xs text-slate-200 border border-[#2a4060] rounded-lg px-2.5 py-1 font-mono placeholder:text-slate-500 w-36"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => generateCustomCode()}
                    className="w-full sm:w-auto sm:ml-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black uppercase tracking-wider rounded-xl text-xs transition cursor-pointer shadow-lg shadow-emerald-900/20"
                  >
                    🎫 Issue Secure Receipt Key
                  </button>
                </div>
              </div>
            )}

            {/* RESULT */}
            {generatedCode && (
              <div className="bg-[#142a20] border-2 border-green-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
                <div>
                  <p className="text-xs text-green-400 font-bold uppercase tracking-widest">SUCCESSFULLY MINTED KEY!</p>
                  <p className="text-xs text-slate-300 mt-0.5">Provide this receipt key to the client for immediate redemption:</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base text-[#6affaa] font-black tracking-widest bg-black/60 px-4 py-1.5 rounded border border-green-500/30">{generatedCode}</span>
                  <button
                    onClick={() => copyToClipboard(generatedCode)}
                    className="px-3.5 py-1.5 rounded-lg bg-green-700 text-xs text-white font-bold hover:bg-green-600 transition cursor-pointer"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3: CODE TRACKING & CONVERSION LIST (SELECTOR 1)                  */}
          {/* ========================================================================= */}
          <div 
            id="admin-code-tracking-section"
            className="bg-linear-to-b from-[#181326] via-[#110e1d] to-[#090812] border border-purple-500/30 rounded-2xl p-5 space-y-4 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-3">
              <div>
                <h3 className="font-mono text-xs sm:text-sm text-[#cb9df2] font-extrabold uppercase tracking-widest flex items-center gap-2">
                  <span>📋</span> RECEIPT CODE TRACKING & VAULT RECORDS
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Live inventory of all {allCodes.length} issued checkout keys across local session and cloud storage.
                </p>
              </div>

              {/* SEARCH */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter keys or items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#141c30] text-xs text-slate-200 border border-[#2a4060] rounded-xl pl-3 pr-7 py-1.5 focus:outline-none focus:border-purple-500 max-w-xs font-mono placeholder:text-slate-500"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1.5 text-slate-400 text-xs">✕</button>
                )}
              </div>
            </div>

            {deletedNotice && (
              <div className="px-3.5 py-2 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 font-mono flex items-center justify-between shadow-lg">
                <span className="flex items-center gap-2">
                  <span>🗑️</span>
                  <strong>{deletedNotice}</strong>
                </span>
                <button 
                  onClick={() => setDeletedNotice(null)} 
                  className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {filteredCodes.length === 0 ? (
              <div className="bg-[#141c30]/20 border border-white/5 rounded-2xl p-8 text-center text-slate-400 text-xs font-mono">
                No issued receipt codes found matching your criteria. Use the reverse lookup or builder above to inspect/mint codes.
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {filteredCodes.map(r => (
                  <div 
                    key={r.code}
                    onClick={() => {
                      setReverseLookupCode(r.code);
                      performReverseLookup(r.code);
                    }}
                    className={`bg-linear-to-b from-[#161e33] to-[#0f1524] border rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all cursor-pointer ${
                      r.redeemed ? 'border-[#1a2d20] opacity-75' : 'border-[#2a4060] hover:border-cyan-500/50 hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black tracking-wider text-slate-100 bg-black/60 px-2.5 py-0.5 rounded border border-white/10">
                          {r.code}
                        </span>
                        <span className={`text-[10px] sm:text-xs font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                          r.redeemed ? 'bg-amber-950/50 text-amber-300 border-amber-500/20' : 'bg-emerald-950/50 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {r.redeemed ? 'CLAIMED / FULFILLED' : 'ACTIVE / UNUSED'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 flex flex-wrap gap-x-2 font-mono">
                        <span>Date: {new Date(r.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="text-[#f5e56b] font-bold">Total: ${r.total} USD</span>
                      </div>
                      <div className="text-xs text-slate-300 flex flex-wrap gap-1.5 pt-0.5">
                        {r.items.map((it, idx) => (
                          <span key={idx} className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-xs font-mono text-slate-200">
                            {it.emoji} {it.id} (x{it.qty})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleCodeRedeemed(r.code)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer font-mono ${
                          r.redeemed 
                            ? 'bg-amber-950/40 text-amber-300 border border-amber-500/20 hover:bg-amber-900/40' 
                            : 'bg-green-950/40 text-green-300 border border-green-500/20 hover:bg-green-900/40'
                        }`}
                      >
                        {r.redeemed ? '↩️ Reactivate Key' : '✔️ Redeem/Claim'}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCode(r.code);
                        }}
                        className="p-2 text-red-400 hover:text-red-200 bg-red-950/30 hover:bg-red-900/60 border border-red-500/20 hover:border-red-500/50 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                        title="Delete Receipt Code"
                        aria-label="Delete Receipt Code"
                      >
                        <span className="text-sm leading-none">🗑️</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 4: USER & LEADERBOARD PURGE MANAGEMENT                           */}
          {/* ========================================================================= */}
          <div className="bg-linear-to-b from-red-950/30 via-[#14121e] to-[#0d0f18] border border-red-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-500/20 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base text-red-400">⚠️</span>
                  <h3 className="font-mono text-xs text-red-400 font-extrabold uppercase tracking-widest">
                    USER & LEADERBOARD PURGE MANAGEMENT
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Search and wipe requested usernames from the global Hall of Champions leaderboard, or reset player cloud stats upon user request.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setConfirmWipeOpen(true)}
                className="px-4 py-2 bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-500/40 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer shrink-0 shadow-sm"
                title="Wipe local device character state"
              >
                <span>🗑️</span>
                <span>Reset Local Device</span>
              </button>
            </div>

            {/* Notification alert */}
            {wipeNotice && (
              <div className="px-3.5 py-2 rounded-xl bg-red-950/70 border border-red-500/40 text-xs text-red-200 font-mono flex items-center justify-between shadow-md">
                <span>🛡️ {wipeNotice}</span>
                <button onClick={() => setWipeNotice(null)} className="text-slate-400 hover:text-white px-1 cursor-pointer">✕</button>
              </div>
            )}

            {/* Search filter and refresh */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Filter player username, title, or UID..."
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  className="w-full bg-[#0c101c] text-xs text-slate-200 border border-[#2a4060] rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:border-red-500/60 font-mono placeholder:text-slate-500"
                />
                {playerSearch && (
                  <button 
                    onClick={() => setPlayerSearch('')} 
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={fetchPlayers}
                disabled={loadingPlayers}
                className="px-3.5 py-2 bg-[#172238] hover:bg-[#203050] text-slate-200 border border-[#2a4060] rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 shrink-0"
              >
                <span className={loadingPlayers ? 'animate-spin' : ''}>🔄</span>
                <span>Refresh ({filteredPlayers.length})</span>
              </button>
            </div>

            {/* List of accounts to wipe or reset */}
            {filteredPlayers.length === 0 ? (
              <div className="bg-black/30 border border-white/5 rounded-xl p-6 text-center text-slate-400 text-xs font-mono">
                {playerList.length === 0 ? 'No players currently recorded on the Hall of Champions leaderboard.' : 'No users match your search query.'}
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {filteredPlayers.map((player) => (
                  <div
                    key={player.userId}
                    className="bg-black/40 border border-white/10 hover:border-red-500/30 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{player.avatar || '⚔️'}</span>
                        <span className="font-mono text-xs font-bold text-white">{player.name}</span>
                        {player.title && (
                          <span className="text-[10px] sm:text-xs text-amber-300/80 bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                            {player.title}
                          </span>
                        )}
                        <span className="text-[10px] sm:text-xs text-slate-500 font-mono">UID: {player.userId.slice(0, 8)}...</span>
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-400 font-mono flex flex-wrap gap-x-3">
                        <span>Score: <strong className="text-emerald-400">{player.score?.toLocaleString() ?? 0}</strong></span>
                        <span>Bosses: <strong className="text-blue-400">{player.bosses ?? 0}</strong></span>
                        <span>Coins: <strong className="text-yellow-400">{player.coins?.toLocaleString() ?? 0}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {confirmWipeUser?.userId === player.userId ? (
                        <div className="flex items-center gap-1.5 bg-red-950/90 border border-red-500/50 rounded-lg p-1 animate-fadeIn">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirmWipeUser.action === 'leaderboard') {
                                handleWipeFromLeaderboard(player.userId, player.name);
                              } else {
                                handleResetAccountStats(player.userId, player.name);
                              }
                            }}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold rounded transition cursor-pointer shadow-sm"
                          >
                            Confirm {confirmWipeUser.action === 'leaderboard' ? 'Wipe' : 'Reset'}?
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmWipeUser(null)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded transition cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setConfirmWipeUser({ userId: player.userId, action: 'leaderboard', name: player.name })}
                            className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white border border-red-500/30 rounded-lg text-xs font-mono font-bold transition cursor-pointer"
                            title="Remove from Leaderboard rankings"
                          >
                            Wipe Rank
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmWipeUser({ userId: player.userId, action: 'account', name: player.name })}
                            className="px-2.5 py-1.5 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 hover:text-white border border-amber-500/30 rounded-lg text-xs font-mono font-bold transition cursor-pointer"
                            title="Reset powerScore, bosses, and coins to 0"
                          >
                            Reset Stats
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* FOOTER */}
        <div className="bg-slate-950 border-t border-white/5 px-6 py-3.5 flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ADMIN ACCESS: AUTHORIZED STORE MANAGER</span>
          </span>
          <span>REVERSE LOOKUP & CLOUD SYNC ACTIVE</span>
        </div>
      </div>

      {/* CUSTOM CONFIRMATION WIPE MODAL */}
      {confirmWipeOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-[200]">
          <div className="w-full max-w-[450px] bg-linear-to-b from-[#1c1212] to-[#0d0707] border-2 border-red-600/50 rounded-3xl p-6 shadow-[0_0_80px_rgba(220,38,38,0.25)] space-y-6 text-center">
            <div className="w-16 h-16 bg-red-950/60 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-3xl">
              ⚠️
            </div>
            
            <div className="space-y-2">
              <h3 className="font-mono text-sm md:text-base uppercase text-red-400 font-black tracking-wider">WIPE ALL CHARACTER STATE?</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                You are about to completely reset this game profile! This will permanently delete your character's levels, coins, gems, battle log history, and checkout codes.
              </p>
              <p className="text-red-300 font-bold font-mono text-xs bg-red-950/40 py-1.5 px-3 rounded-lg border border-red-500/10">
                🛑 THIS ACTION CANNOT BE UNDONE!
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmWipeOpen(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-bold border border-white/10 transition text-xs uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleWipeAll}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black tracking-wider shadow-md hover:shadow-red-600/20 transition text-xs uppercase cursor-pointer"
              >
                Confirm Wipe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM SUCCESS ALERT MODAL */}
      {showSuccessAlert && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-[200]">
          <div className="w-full max-w-[400px] bg-linear-to-b from-[#111c16] to-[#0a120e] border-2 border-emerald-500/50 rounded-3xl p-6 shadow-[0_0_80px_rgba(16,185,129,0.25)] space-y-5 text-center">
            <div className="w-16 h-16 bg-emerald-950/60 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-3xl">
              ✅
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-mono text-sm md:text-base uppercase text-emerald-400 font-black tracking-wider font-extrabold">WIPE COMPLETED</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                All local tycoon profiles and physical purchase receipt cache have been cleared successfully.
              </p>
            </div>

            <button 
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
