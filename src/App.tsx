import { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import ShopView from './components/ShopView';
import GameView from './components/GameView';
import LoreBookView from './components/LoreBookView';
import AdminModal from './components/AdminModal';
import AccountModal from './components/AccountModal';
import GuidedTour, { TourStep } from './components/GuidedTour';
import { TOUR_BONUSES } from './data/tourSteps';
import FontScaleControl from './components/FontScaleControl';
import Footer from './components/Footer';
import { PWAInstallModal } from './components/common/PWAInstallModal';
import { GlobalTouchTooltip } from './components/common/GlobalTouchTooltip';
import { GameState, LeaderboardEntry, UserProfile } from './types';
import { POWERUPS, BOSSES, DEFAULT_BALANCE_CONFIG, calculatePowerScore } from './data';

const DEFAULT_STATE: GameState = {
  coins: 2000,
  gems: 500,
  maxHpBonus: 0,
  damageBonusPercent: 0,
  powerups: POWERUPS.map(p => ({ id: p.id, owned: false, level: 1, quantity: 0 })),
  bosses: BOSSES.map(b => ({ id: b.id, defeated: false })),
  powerScore: 0,
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
  balanceConfig: DEFAULT_BALANCE_CONFIG
};

// Safety-critical utility to clean and strip undefined fields recursively before Firestore writes
function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore) as unknown as T;
  }
  if (typeof obj === 'object') {
    const clean: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        if (val !== undefined) {
          clean[key] = sanitizeForFirestore(val);
        }
      }
    }
    return clean as T;
  }
  return obj;
}

export default function App() {
  const [activeView, setActiveView] = useState<'Shop' | 'Game' | 'Stats' | 'Lore'>('Game');
  const [gameState, setGameState] = useState<GameState>(DEFAULT_STATE);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [cloudLeaderboard, setCloudLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isSyncingLeaderboard, setIsSyncingLeaderboard] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Cloud Save Conflict & Auto-Save properties
  const [cloudSaveConflict, setCloudSaveConflict] = useState<{
    cloud: any;
    local: GameState;
  } | null>(null);
  const lastCloudSaveTimeRef = useRef<number>(0);

  // --- GUIDED TOUR ENGINE (SHORT / FULL / SKIP) ---
  const [isTourActive, setIsTourActive] = useState(false);

  // Controlled sub-tabs across pages
  const [controlledLoreTab, setControlledLoreTab] = useState<'compendium' | 'bosses' | 'systems' | 'calculator' | 'story'>('compendium');
  const [controlledShopCategory, setControlledShopCategory] = useState<'weapons' | 'defense' | 'utility' | 'mystic'>('weapons');
  const [controlledGameTab, setControlledGameTab] = useState<'tycoon' | 'bosses' | 'stats'>('tycoon');
  const [isShopCartDrawerOpen, setIsShopCartDrawerOpen] = useState(false);
  const [isPWAInstallOpen, setIsPWAInstallOpen] = useState(false);

  // Synchronize active view and sub tabs to a given tour step
  const handleTourStepChange = useCallback((step: TourStep) => {
    if (!step) return;

    // Switch top-level view
    if (step.page) {
      setActiveView(step.page);
    }

    // Switch sub-tab if defined
    if (step.subTab) {
      if (step.page === 'Lore') {
        setControlledLoreTab(step.subTab as any);
      } else if (step.page === 'Shop') {
        setControlledShopCategory(step.subTab as any);
      } else if (step.page === 'Game' || step.page === 'Stats') {
        setControlledGameTab(step.subTab as any);
      }
    }

    // Open or close shop cart drawer
    if (step.openCartDrawer || step.id === 'step-11-shop-cart' || step.id === 'step-12-shop-checkout') {
      setIsShopCartDrawerOpen(true);
    } else {
      setIsShopCartDrawerOpen(false);
    }
  }, []);

  const startTour = useCallback(() => {
    setIsTourActive(true);
  }, []);

  // One-time tour mode bonus claim handler
  const handleClaimTourBonus = useCallback((mode: 'short' | 'full') => {
    const bonus = TOUR_BONUSES[mode];
    if (!bonus) return;

    setGameState(prev => {
      if (prev.completedTours?.[mode]) return prev; // Guard against duplicate payouts

      const next: GameState = {
        ...prev,
        coins: prev.coins + bonus.coins,
        gems: prev.gems + bonus.gems,
        completedTours: {
          ...prev.completedTours,
          [mode]: true
        },
        battleLog: [
          {
            message: `🎁 ${bonus.title} Claimed! Received +${bonus.coins.toLocaleString()} Coins & +${bonus.gems.toLocaleString()} Gems!`,
            className: 'log-reward'
          },
          ...prev.battleLog
        ]
      };

      try {
        localStorage.setItem('bossRushTycoon', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save tour bonus state to localStorage:', e);
      }

      return next;
    });
  }, []);

  // Recurring Monthly PWA Installation Grant Claim Handler (Once per calendar month)
  const handleClaimPwaBonus = useCallback(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    setGameState(prev => {
      if (prev.pwaBonusClaimedMonth === currentMonth) return prev; // Guard against duplicate payouts in same month

      const next: GameState = {
        ...prev,
        coins: prev.coins + 5000,
        gems: prev.gems + 250,
        pwaBonusClaimedMonth: currentMonth,
        battleLog: [
          {
            message: `📱 Monthly PWA Installation Grant Claimed! Received +5,000 Coins & +250 Gems (${currentMonthName})!`,
            className: 'log-reward'
          },
          ...prev.battleLog
        ]
      };

      try {
        localStorage.setItem('bossRushTycoon', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save PWA bonus state to localStorage:', e);
      }

      if (currentUser) {
        setDoc(doc(db, 'user_progress', currentUser.uid), sanitizeForFirestore({
          userId: currentUser.uid,
          coins: next.coins,
          gems: next.gems,
          pwaBonusClaimedMonth: currentMonth,
          updatedAt: new Date().toISOString()
        }), { merge: true }).catch(err => console.warn('Could not sync PWA bonus to cloud:', err));
      }

      return next;
    });
  }, [currentUser]);

  // --- CHECK ISADMIN FLAG IN AUTH DETAILS OR FIRESTORE PROFILE ---
  useEffect(() => {
    let admin = false;

    // Check designated owner / root admin credentials
    const isOwnerAccount = 
      currentUser?.uid === 'WlMw7jRoVgSl2kyjH6B47DLayU72' ||
      currentUser?.email?.toLowerCase() === 'chris.barnes.2000@me.com';

    // 1. Check firestore profile or designated owner
    if (userProfile?.isAdmin === true || isOwnerAccount) {
      admin = true;
    }

    // 2. Check auth details (direct property, custom claims, or token claims)
    if (currentUser) {
      if ((currentUser as any).isAdmin === true || (currentUser as any).claims?.isAdmin === true) {
        admin = true;
      }
      currentUser.getIdTokenResult().then((tokenResult) => {
        if (tokenResult.claims.isAdmin === true || userProfile?.isAdmin === true || isOwnerAccount) {
          setIsAdmin(true);
        }
      }).catch((err) => {
        console.warn('Could not inspect auth token claims:', err);
      });

      // Auto-set and persist the isAdmin flag in Firestore for your owner account
      if (isOwnerAccount && userProfile && userProfile.isAdmin !== true) {
        setDoc(doc(db, 'users', currentUser.uid), { isAdmin: true }, { merge: true })
          .then(() => {
            setUserProfile(prev => prev ? { ...prev, isAdmin: true } : prev);
          })
          .catch((err) => console.warn('Auto-set admin error in Firestore:', err));
      }
    }

    setIsAdmin(admin);
  }, [currentUser, userProfile]);

  // Safety safeguard: close admin modal if user is no longer admin
  useEffect(() => {
    if (!isAdmin && isAdminOpen) {
      setIsAdminOpen(false);
    }
  }, [isAdmin, isAdminOpen]);

  // --- FIREBASE AUTH STATE LISTENER & INITIAL TOUR PROMPT ---
  const [hasEvaluatedInitialAuth, setHasEvaluatedInitialAuth] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setUserProfile(data);
            if (data.displayName) {
              setGameState(prev => ({ ...prev, playerName: data.displayName }));
            }
          }

          // Fetch Cloud Game Save Progress
          const progressDocRef = doc(db, 'user_progress', user.uid);
          const progressSnap = await getDoc(progressDocRef);
          if (progressSnap.exists()) {
            const cloudData = progressSnap.data();
            
            // Check if current local state is just the default starter
            let localState = DEFAULT_STATE;
            try {
              const saved = localStorage.getItem('bossRushTycoon');
              if (saved) {
                localState = { ...DEFAULT_STATE, ...JSON.parse(saved) };
              }
            } catch (e) {
              console.warn('Could not parse localState in auth listener:', e);
            }

            const isLocalDefault = 
              localState.totalBossesDefeated === 0 && 
              localState.coins <= 2005 && 
              !(localState.powerups || []).some(p => p.owned);

            if (isLocalDefault) {
              // Automatically restore progress since local is pristine
              const next: GameState = {
                ...localState,
                coins: cloudData.coins ?? localState.coins,
                gems: cloudData.gems ?? localState.gems,
                maxHpBonus: cloudData.maxHpBonus ?? localState.maxHpBonus,
                damageBonusPercent: cloudData.damageBonusPercent ?? localState.damageBonusPercent,
                powerups: (localState.powerups || []).map(p => {
                  const cloudP = cloudData.powerups?.find((cp: any) => cp.id === p.id);
                  return cloudP ? { ...p, ...cloudP } : p;
                }),
                bosses: (localState.bosses || []).map(b => {
                  const cloudB = cloudData.bosses?.find((cb: any) => cb.id === b.id);
                  return cloudB ? { ...b, ...cloudB } : b;
                }),
                totalBossesDefeated: cloudData.totalBossesDefeated ?? localState.totalBossesDefeated,
                purchasedCodes: cloudData.purchasedCodes ?? localState.purchasedCodes,
                bossKillStats: cloudData.bossKillStats ?? localState.bossKillStats,
                bossDeathStats: cloudData.bossDeathStats ?? localState.bossDeathStats,
                customStories: cloudData.customStories ?? localState.customStories,
                reviveCount: cloudData.reviveCount ?? localState.reviveCount,
                revivePacks: cloudData.revivePacks ?? localState.revivePacks,
                completedTours: cloudData.completedTours ?? localState.completedTours,
                baseAttack: cloudData.baseAttack ?? localState.baseAttack,
                baseDefense: cloudData.baseDefense ?? localState.baseDefense,
                baseSpeed: cloudData.baseSpeed ?? localState.baseSpeed
              };
              setGameState(next);
              localStorage.setItem('bossRushTycoon', JSON.stringify(next));
            } else {
              // Compare both to see if we should prompt
              const isCoinsDiff = Math.abs((cloudData.coins || 0) - localState.coins) > 5;
              const isBossesDiff = (cloudData.totalBossesDefeated || 0) !== localState.totalBossesDefeated;
              
              if (isCoinsDiff || isBossesDiff) {
                setCloudSaveConflict({
                  cloud: cloudData,
                  local: localState
                });
              }
            }
          } else {
            // First time log in with progress - push local progress to cloud backup
            let localState = DEFAULT_STATE;
            try {
              const saved = localStorage.getItem('bossRushTycoon');
              if (saved) {
                localState = { ...DEFAULT_STATE, ...JSON.parse(saved) };
              }
            } catch {}
            const isLocalDefault = 
              localState.totalBossesDefeated === 0 && 
              localState.coins <= 2005 && 
              !(localState.powerups || []).some(p => p.owned);

            if (!isLocalDefault) {
              setDoc(doc(db, 'user_progress', user.uid), sanitizeForFirestore({
                userId: user.uid,
                coins: localState.coins,
                gems: localState.gems,
                maxHpBonus: localState.maxHpBonus,
                damageBonusPercent: localState.damageBonusPercent,
                powerups: localState.powerups || [],
                bosses: localState.bosses || [],
                totalBossesDefeated: localState.totalBossesDefeated || 0,
                purchasedCodes: localState.purchasedCodes || [],
                bossKillStats: localState.bossKillStats || {},
                bossDeathStats: localState.bossDeathStats || {},
                customStories: localState.customStories || [],
                reviveCount: localState.reviveCount || 0,
                revivePacks: localState.revivePacks || 0,
                completedTours: localState.completedTours || {},
                baseAttack: localState.baseAttack ?? 10,
                baseDefense: localState.baseDefense ?? 5,
                baseSpeed: localState.baseSpeed ?? 5,
                updatedAt: new Date().toISOString()
              }), { merge: true }).catch(err => console.warn('Push local state to cloud error:', err));
            }
          }
        } catch (err) {
          console.warn('Error fetching user profile or cloud progress:', err);
        }
      } else {
        setUserProfile(null);
      }

      // Prompt tour on initial load if user is not logged in
      if (!hasEvaluatedInitialAuth) {
        setHasEvaluatedInitialAuth(true);
        if (!user) {
          const alreadyPrompted = sessionStorage.getItem('powerup_tour_prompted');
          if (!alreadyPrompted) {
            setIsTourActive(true);
            sessionStorage.setItem('powerup_tour_prompted', 'true');
          }
        }
      }
    });

    return () => unsubscribe();
  }, [hasEvaluatedInitialAuth]);

  // --- REAL-TIME CLOUD LEADERBOARD LISTENER ---
  useEffect(() => {
    try {
      const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(50));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const entries: LeaderboardEntry[] = [];
        snapshot.forEach((docSnap) => {
          entries.push(docSnap.data() as LeaderboardEntry);
        });
        setCloudLeaderboard(entries);
        setGameState(prev => ({ ...prev, leaderboard: entries }));
      }, (error) => {
        console.warn('Leaderboard snapshot listener warning:', error.message);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Leaderboard listener setup error:', err);
    }
  }, []);

  // --- PERSISTENCE LOAD ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bossRushTycoon');
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Ensure all properties exist
        const loadedState = { ...DEFAULT_STATE, ...parsed };
        
        // Match lists
        loadedState.powerups = DEFAULT_STATE.powerups.map(defaultPs => {
          const match = parsed.powerups?.find((p: any) => p.id === defaultPs.id);
          return match ? { ...defaultPs, ...match } : defaultPs;
        });

        loadedState.bosses = DEFAULT_STATE.bosses.map(defaultBoss => {
          const match = parsed.bosses?.find((b: any) => b.id === defaultBoss.id);
          return match ? { ...defaultBoss, ...match } : defaultBoss;
        });

        setGameState(loadedState);
      }
    } catch (e) {
      console.error('Failed to load saved state:', e);
    }
  }, []);

  // --- PASSIVE COIN GENERATION LOOP & BOSS COOLDOWN DECREMENT ---
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(prev => {
        // Calculate rate based on current loadout
        let rate = 0;
        prev.powerups.forEach(ps => {
          if (ps.owned && ps.quantity > 0) {
            const data = POWERUPS.find(p => p.id === ps.id);
            if (data) {
              const base = data.baseRate * ps.quantity;
              const multiplier = 1 + (ps.level - 1) * 0.5;
              rate += base * multiplier;
            }
          }
        });

        // Coins rate fractioned by 1,000 for slower gameplay and high-retention progression
        const accruedCoins = rate / 1000;

        // Auto-replenish bosses every 15 seconds after victory so they replenish more often
        const updatedBosses = prev.bosses.map(boss => {
          if (boss.defeated) {
            const currentRespawn = boss.respawnTime !== undefined ? boss.respawnTime : 15;
            if (currentRespawn <= 1) {
              const { respawnTime, ...cleanBoss } = boss;
              return { ...cleanBoss, defeated: false };
            } else {
              return { ...boss, respawnTime: currentRespawn - 1 };
            }
          }
          return boss;
        });

        const currentPowerScore = calculatePowerScore(prev);

        const next = {
          ...prev,
          coins: prev.coins + accruedCoins,
          bosses: updatedBosses,
          powerScore: currentPowerScore
        };
        localStorage.setItem('bossRushTycoon', JSON.stringify(next));
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // --- SYNC LEADERBOARD TO FIRESTORE ---
  const syncLeaderboard = useCallback(async (profileOverride?: UserProfile) => {
    if (!currentUser) return;
    setIsSyncingLeaderboard(true);
    try {
      const activeProfile = profileOverride || userProfile;
      const currentPowerScore = calculatePowerScore(gameState);
      const nameToUse = activeProfile?.displayName || currentUser.displayName || gameState.playerName || 'Hero';
      const avatarToUse = activeProfile?.avatar || '⚔️';
      const titleToUse = activeProfile?.title || 'Grand Champion';
      const bossesDefeated = gameState.totalBossesDefeated;
      const goldCoins = Math.floor(gameState.coins);

      const entry: LeaderboardEntry = {
        userId: currentUser.uid,
        name: nameToUse,
        score: currentPowerScore,
        bosses: bossesDefeated,
        coins: goldCoins,
        avatar: avatarToUse,
        title: titleToUse,
        updatedAt: new Date().toISOString()
      };

      // Write to Firestore public leaderboard collection
      await setDoc(doc(db, 'leaderboard', currentUser.uid), sanitizeForFirestore(entry), { merge: true });

      // Update user doc with latest stats
      await setDoc(doc(db, 'users', currentUser.uid), sanitizeForFirestore({
        userId: currentUser.uid,
        email: currentUser.email || '',
        displayName: nameToUse,
        avatar: avatarToUse,
        title: titleToUse,
        powerScore: currentPowerScore,
        totalBossesDefeated: bossesDefeated,
        coins: goldCoins,
        updatedAt: new Date().toISOString()
      }), { merge: true });

      // Write comprehensive progress backup
      const progressDocRef = doc(db, 'user_progress', currentUser.uid);
      await setDoc(progressDocRef, sanitizeForFirestore({
        userId: currentUser.uid,
        coins: gameState.coins,
        gems: gameState.gems,
        maxHpBonus: gameState.maxHpBonus,
        damageBonusPercent: gameState.damageBonusPercent,
        powerups: gameState.powerups || [],
        bosses: gameState.bosses || [],
        totalBossesDefeated: gameState.totalBossesDefeated || 0,
        purchasedCodes: gameState.purchasedCodes || [],
        bossKillStats: gameState.bossKillStats || {},
        bossDeathStats: gameState.bossDeathStats || {},
        customStories: gameState.customStories || [],
        reviveCount: gameState.reviveCount || 0,
        revivePacks: gameState.revivePacks || 0,
        completedTours: gameState.completedTours || {},
        baseAttack: gameState.baseAttack ?? 10,
        baseDefense: gameState.baseDefense ?? 5,
        baseSpeed: gameState.baseSpeed ?? 5,
        updatedAt: new Date().toISOString()
      }), { merge: true });

      setGameState(prev => ({ ...prev, powerScore: currentPowerScore }));
    } catch (err) {
      console.error('Error syncing leaderboard:', err);
      handleFirestoreError(err, OperationType.WRITE, `leaderboard/${currentUser.uid}`);
    } finally {
      setIsSyncingLeaderboard(false);
    }
  }, [currentUser, userProfile, gameState]);

  // Apply Cloud Progress (Overwrite Local State)
  const applyCloudProgress = (cloudData: any) => {
    setGameState(prev => {
      const next: GameState = {
        ...prev,
        coins: cloudData.coins ?? prev.coins,
        gems: cloudData.gems ?? prev.gems,
        maxHpBonus: cloudData.maxHpBonus ?? prev.maxHpBonus,
        damageBonusPercent: cloudData.damageBonusPercent ?? prev.damageBonusPercent,
        powerups: prev.powerups.map(p => {
          const cloudP = cloudData.powerups?.find((cp: any) => cp.id === p.id);
          return cloudP ? { ...p, ...cloudP } : p;
        }),
        bosses: prev.bosses.map(b => {
          const cloudB = cloudData.bosses?.find((cb: any) => cb.id === b.id);
          return cloudB ? { ...b, ...cloudB } : b;
        }),
        totalBossesDefeated: cloudData.totalBossesDefeated ?? prev.totalBossesDefeated,
        purchasedCodes: cloudData.purchasedCodes ?? prev.purchasedCodes,
        bossKillStats: cloudData.bossKillStats ?? prev.bossKillStats,
        bossDeathStats: cloudData.bossDeathStats ?? prev.bossDeathStats,
        customStories: cloudData.customStories ?? prev.customStories,
        reviveCount: cloudData.reviveCount ?? prev.reviveCount,
        revivePacks: cloudData.revivePacks ?? prev.revivePacks,
        completedTours: cloudData.completedTours ?? prev.completedTours,
        pwaBonusClaimedMonth: cloudData.pwaBonusClaimedMonth ?? prev.pwaBonusClaimedMonth,
        inviteCode: cloudData.inviteCode ?? prev.inviteCode,
        invitedByCode: cloudData.invitedByCode ?? prev.invitedByCode,
        squadRecruitsCount: cloudData.squadRecruitsCount ?? prev.squadRecruitsCount,
        squadMembers: cloudData.squadMembers ?? prev.squadMembers,
        baseAttack: cloudData.baseAttack ?? prev.baseAttack,
        baseDefense: cloudData.baseDefense ?? prev.baseDefense,
        baseSpeed: cloudData.baseSpeed ?? prev.baseSpeed
      };
      localStorage.setItem('bossRushTycoon', JSON.stringify(next));
      return next;
    });
    setCloudSaveConflict(null);
  };

  // Overwrite Cloud Save with Local State
  const resolveWithLocalProgress = async () => {
    if (!currentUser || !cloudSaveConflict) return;
    try {
      const progressDocRef = doc(db, 'user_progress', currentUser.uid);
      const localState = cloudSaveConflict.local;
      await setDoc(progressDocRef, sanitizeForFirestore({
        userId: currentUser.uid,
        coins: localState.coins,
        gems: localState.gems,
        maxHpBonus: localState.maxHpBonus,
        damageBonusPercent: localState.damageBonusPercent,
        powerups: localState.powerups || [],
        bosses: localState.bosses || [],
        totalBossesDefeated: localState.totalBossesDefeated || 0,
        purchasedCodes: localState.purchasedCodes || [],
        bossKillStats: localState.bossKillStats || {},
        bossDeathStats: localState.bossDeathStats || {},
        customStories: localState.customStories || [],
        reviveCount: localState.reviveCount || 0,
        revivePacks: localState.revivePacks || 0,
        completedTours: localState.completedTours || {},
        pwaBonusClaimedMonth: localState.pwaBonusClaimedMonth,
        inviteCode: localState.inviteCode,
        invitedByCode: localState.invitedByCode,
        squadRecruitsCount: localState.squadRecruitsCount || 0,
        squadMembers: localState.squadMembers || [],
        baseAttack: localState.baseAttack ?? 10,
        baseDefense: localState.baseDefense ?? 5,
        baseSpeed: localState.baseSpeed ?? 5,
        updatedAt: new Date().toISOString()
      }), { merge: true });
    } catch (err) {
      console.warn('Could not force local save to cloud:', err);
    }
    setCloudSaveConflict(null);
  };

  // --- AUTOMATIC CLOUD AUTO-SAVE THROTTLED TO 30 SECONDS ---
  useEffect(() => {
    if (!currentUser) return;

    // Skip if default starter profile
    const isDefault = 
      gameState.totalBossesDefeated === 0 && 
      gameState.coins <= 2005 && 
      !gameState.powerups.some(p => p.owned);
    if (isDefault) return;

    const now = Date.now();
    if (now - lastCloudSaveTimeRef.current >= 30000) {
      lastCloudSaveTimeRef.current = now;

      setDoc(doc(db, 'user_progress', currentUser.uid), sanitizeForFirestore({
        userId: currentUser.uid,
        coins: gameState.coins,
        gems: gameState.gems,
        maxHpBonus: gameState.maxHpBonus,
        damageBonusPercent: gameState.damageBonusPercent,
        powerups: gameState.powerups || [],
        bosses: gameState.bosses || [],
        totalBossesDefeated: gameState.totalBossesDefeated || 0,
        purchasedCodes: gameState.purchasedCodes || [],
        bossKillStats: gameState.bossKillStats || {},
        bossDeathStats: gameState.bossDeathStats || {},
        customStories: gameState.customStories || [],
        reviveCount: gameState.reviveCount || 0,
        revivePacks: gameState.revivePacks || 0,
        completedTours: gameState.completedTours || {},
        pwaBonusClaimedMonth: gameState.pwaBonusClaimedMonth,
        inviteCode: gameState.inviteCode,
        invitedByCode: gameState.invitedByCode,
        squadRecruitsCount: gameState.squadRecruitsCount || 0,
        squadMembers: gameState.squadMembers || [],
        baseAttack: gameState.baseAttack ?? 10,
        baseDefense: gameState.baseDefense ?? 5,
        baseSpeed: gameState.baseSpeed ?? 5,
        updatedAt: new Date().toISOString()
      }), { merge: true }).catch(err => console.warn('Auto-save error:', err));
    }
  }, [gameState.totalBossesDefeated, gameState.gems, gameState.powerups, gameState.isDead, gameState.pwaBonusClaimedMonth, currentUser]);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-[#d0e0ff] flex flex-col font-sans select-none w-full max-w-full overflow-x-clip box-border" style={{ backgroundImage: 'radial-gradient(ellipse at 20% 20%, #151f35 0%, #0a0e1a 70%)' }}>
      
      {/* GLOBAL NAVBAR - STICKY 2-TIER HEADER */}
      <header 
        id="global-navbar" 
        className="sticky top-0 z-50 flex flex-col border-b border-white/10 bg-[#0a0e1a] shadow-2xl shadow-black/80 w-full max-w-full box-border"
      >
        {/* Tier 1: Brand & Top Utility Controls (Accessibility, Tour, Account, Admin, Cloud Status) */}
        <div className="w-full flex items-center justify-between px-2.5 sm:px-6 md:px-8 py-1.5 sm:py-2 border-b border-white/5 bg-[#0a0e1a]">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <span className="text-xl sm:text-2xl filter drop-shadow">⚔️</span>
            <div>
              <h1 className="font-black uppercase tracking-wider font-mono text-[#7ae0ff] text-xs sm:text-sm md:text-base leading-none">
                POWER-UP ARMORY
              </h1>
              <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-widest font-bold hidden md:block mt-0.5">
                GAMIFIED TYCOON COMMERCE
              </p>
            </div>
          </div>

          {/* Top Utility Actions: Accessibility, Tour, Account, Admin, Cloud Status */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
            {/* Dynamic Font Scale Slider Control */}
            <FontScaleControl />

            {/* 20-Step Guided Tour Trigger Button */}
            <button
              id="header-guided-tour-btn"
              onClick={startTour}
              className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-linear-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-[11px] sm:text-xs text-amber-300 hover:text-amber-200 font-extrabold transition flex items-center gap-1 cursor-pointer shadow-sm"
              title="Start 20-Step Guided Tour across all 4 pages and sub-tabs"
            >
              <span className="text-xs sm:text-sm animate-pulse">🧭</span>
              <span className="hidden xs:inline">Tour</span>
            </button>

            {/* PWA / iOS Install Trigger Button */}
            <button
              id="header-pwa-install-btn"
              onClick={() => setIsPWAInstallOpen(true)}
              className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-linear-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-[11px] sm:text-xs text-cyan-300 hover:text-cyan-200 font-extrabold transition flex items-center gap-1 cursor-pointer shadow-sm"
              title="Install Web App on Google Chrome or Safari iOS (iPhone/iPad)"
            >
              <span className="text-xs sm:text-sm animate-bounce">📱</span>
              <span className="hidden xs:inline">App Install</span>
            </button>

            {/* Champion Account Button */}
            {currentUser ? (
              <button
                id="header-account-btn"
                onClick={() => setIsAccountOpen(true)}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-blue-950/50 hover:bg-blue-900/70 border border-blue-500/40 text-[11px] sm:text-xs text-blue-200 hover:text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Open Champion Account Details"
              >
                <span className="text-xs sm:text-sm">{userProfile?.avatar || '⚔️'}</span>
                <span className="font-mono truncate max-w-[70px] sm:max-w-[100px]">
                  {userProfile?.displayName || currentUser.displayName || gameState.playerName}
                </span>
                <span className="text-[10px] sm:text-[11px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-mono hidden md:inline">
                  {calculatePowerScore(gameState)} PS
                </span>
              </button>
            ) : (
              <button
                id="header-account-btn"
                onClick={() => setIsAccountOpen(true)}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-[11px] sm:text-xs text-white font-extrabold transition flex items-center gap-1 cursor-pointer shadow-md shadow-blue-500/20 uppercase tracking-wider"
                title="Sign in with Email or Google to link account"
              >
                <span>🔑</span>
                <span>Sign In</span>
              </button>
            )}

            {/* Admin Panel Chip */}
            {isAdmin && (
              <button
                id="header-admin-button"
                onClick={() => setIsAdminOpen(true)}
                className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-[11px] sm:text-xs text-red-300 hover:text-white font-bold transition flex items-center gap-1 cursor-pointer"
                title="Open Root Administration Console"
              >
                <span>⚙️</span>
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            {/* Sync Info */}
            <div className="text-right hidden lg:flex items-center gap-1.5 pl-2 border-l border-white/10 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-bold text-slate-400">{currentUser ? 'Cloud Synced' : 'Cloud Ready'}</span>
            </div>
          </div>
        </div>

        {/* Tier 2: Primary Navigation System (Pinned smoothly and fully opaque) */}
        <div className="w-full flex items-center justify-center px-2 sm:px-6 pt-1.5 pb-3.5 sm:pb-4 bg-[#0b101d] border-t border-white/5 shadow-inner">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center max-w-full">
            <div className="flex bg-[#121c30] border border-[#2a4060] rounded-full p-0.5 shadow-inner">
              <button 
                id="nav-tab-lore"
                onClick={() => setActiveView('Lore')} 
                className={`rounded-full font-bold text-[11px] sm:text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1 sm:py-1.5 ${
                  activeView === 'Lore' ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-xs">📖</span>
                <span className="hidden xs:inline">Lore Book</span>
                <span className="xs:hidden">Lore</span>
              </button>
              {(isAdmin || userProfile?.isArmoryStoreEnabled === true) && (
                <button 
                  id="nav-tab-armory-store"
                  onClick={() => setActiveView('Shop')} 
                  className={`rounded-full font-bold text-[11px] sm:text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1 sm:py-1.5 ${
                    activeView === 'Shop' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs">🛒</span>
                  <span className="hidden xs:inline">Armory Store</span>
                  <span className="xs:hidden">Armory</span>
                </button>
              )}
              {userProfile?.isArmoryStoreEnabled !== true && (
                <button 
                  id="nav-tab-shop"
                  onClick={() => {
                    setActiveView('Game');
                    setControlledGameTab('tycoon');
                  }} 
                  className={`rounded-full font-bold text-[11px] sm:text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1 sm:py-1.5 ${
                    activeView === 'Game' && controlledGameTab === 'tycoon' ? 'bg-[#2a4060] text-[#d0e8ff] shadow-md shadow-blue-500/10' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs">🏪</span>
                  <span className="hidden xs:inline">Tycoon Shop</span>
                  <span className="xs:hidden">Shop</span>
                </button>
              )}
              <button 
                id="nav-tab-game"
                onClick={() => {
                  setActiveView('Game');
                  setControlledGameTab('bosses');
                }} 
                className={`rounded-full font-bold text-[11px] sm:text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1 sm:py-1.5 ${
                  activeView === 'Game' && controlledGameTab === 'bosses' ? 'bg-[#2a4060] text-[#d0e8ff] shadow-md shadow-blue-500/10' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-xs">🎮</span>
                <span className="hidden xs:inline">Boss Rush</span>
                <span className="xs:hidden">Game</span>
              </button>
              <button 
                id="nav-tab-stats"
                onClick={() => setActiveView('Stats')} 
                className={`rounded-full font-bold text-[11px] sm:text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1 sm:py-1.5 ${
                  activeView === 'Stats' ? 'bg-[#2a4060] text-[#d0e8ff] shadow-md shadow-blue-500/10' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-xs">📊</span>
                <span className="hidden xs:inline">Rank & Stats</span>
                <span className="xs:hidden">Rank</span>
              </button>
            </div>

            {/* Dynamic Game Sub-Tabs on Boss Rush Tab */}
            {activeView === 'Game' && (
              <div id="game-sub-tabs" className="flex items-center gap-0.5 p-0.5 bg-[#142036] border border-[#2a4060] rounded-full shadow-md animate-fadeIn">
                <button 
                  id="game-tab-tycoon"
                  onClick={() => setControlledGameTab('tycoon')}
                  className={`py-0.5 sm:py-1 px-2 sm:px-2.5 rounded-full font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1 ${
                    controlledGameTab === 'tycoon' ? 'bg-amber-500 text-slate-950 shadow-sm font-black' : 'text-slate-400 hover:text-slate-100 hover:bg-[#1c2c48]'
                  }`}
                >
                  <span>⚡</span>
                  <span>Tycoon</span>
                </button>
                <button 
                  id="game-tab-bosses"
                  onClick={() => setControlledGameTab('bosses')}
                  className={`py-0.5 sm:py-1 px-2 sm:px-2.5 rounded-full font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1 ${
                    controlledGameTab === 'bosses' ? 'bg-red-600 text-white shadow-sm font-black' : 'text-slate-400 hover:text-slate-100 hover:bg-[#1c2c48]'
                  }`}
                >
                  <span>⚔️</span>
                  <span>Bosses</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* RENDER VIEW - EXPANDED WIDTH CONTAINER */}
      <main className="flex-1 px-4 sm:px-6 md:px-10 lg:px-16 pt-8 sm:pt-12 md:pt-16 flex flex-col items-center w-full max-w-[1720px] 2xl:max-w-[1880px] mx-auto box-border">
        {activeView === 'Shop' && (isAdmin || userProfile?.isArmoryStoreEnabled === true) ? (
          <ShopView
            gameState={gameState}
            setGameState={setGameState}
            controlledCategory={controlledShopCategory}
            onCategoryChange={setControlledShopCategory}
            openCartDrawer={isShopCartDrawerOpen}
            onOpenLoreBook={() => setActiveView('Lore')}
          />
        ) : activeView === 'Shop' ? (
          <div className="text-center py-20 font-mono space-y-4 max-w-lg mx-auto bg-[#0d1322] border border-[#2a4060]/30 rounded-3xl p-8 my-10 shadow-2xl shadow-black/80">
            <span className="text-5xl block animate-bounce mb-2">🔒</span>
            <h2 className="text-lg sm:text-xl font-black text-red-400 uppercase tracking-widest">ARMORY STORE RESTRICTED</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Access to the checkout-based Armory Store is classified. Ask a Root Administrator in the leaderboard to authorize access for your Champion ID.
            </p>
            <button
              onClick={() => {
                setActiveView('Game');
                setControlledGameTab('tycoon');
              }}
              className="mt-4 px-5 py-2.5 bg-[#172238] hover:bg-[#203050] text-[#7ae0ff] border border-[#2a4060] rounded-xl text-xs font-mono font-bold transition cursor-pointer"
            >
              ← Jump back to Tycoon Shop
            </button>
          </div>
        ) : null}
        {activeView === 'Game' && (
          <GameView
            gameState={gameState}
            setGameState={setGameState}
            initialTab={controlledGameTab}
            onTabChange={setControlledGameTab}
            onOpenLoreBook={() => setActiveView('Lore')}
            currentUser={currentUser}
            userProfile={userProfile}
            onOpenAccount={() => setIsAccountOpen(true)}
            cloudLeaderboard={cloudLeaderboard}
            onSyncLeaderboard={syncLeaderboard}
            isSyncingLeaderboard={isSyncingLeaderboard}
          />
        )}
        {activeView === 'Stats' && (
          <GameView
            gameState={gameState}
            setGameState={setGameState}
            initialTab="stats"
            onTabChange={setControlledGameTab}
            onOpenLoreBook={() => setActiveView('Lore')}
            currentUser={currentUser}
            userProfile={userProfile}
            onOpenAccount={() => setIsAccountOpen(true)}
            cloudLeaderboard={cloudLeaderboard}
            onSyncLeaderboard={syncLeaderboard}
            isSyncingLeaderboard={isSyncingLeaderboard}
          />
        )}
        {activeView === 'Lore' && (
          <LoreBookView
            gameState={gameState}
            setGameState={setGameState}
            controlledTab={controlledLoreTab}
            onTabChange={setControlledLoreTab}
            onNavigateToShop={() => setActiveView('Shop')}
            onNavigateToGame={(tab) => {
              setActiveView(tab === 'stats' ? 'Stats' : 'Game');
              if (tab) setControlledGameTab(tab);
            }}
          />
        )}
      </main>

      {/* GLOBAL FOOTER WITH RAPPORTVERSE COPYRIGHT & AFFILIATION */}
      <Footer
        onNavigate={(v) => {
          setActiveView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenTour={startTour}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenInstall={() => setIsPWAInstallOpen(true)}
      />

      {/* ADMINISTRATIVE OVERLAY */}
      <AdminModal 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        gameState={gameState} 
        setGameState={setGameState} 
        cloudLeaderboard={cloudLeaderboard}
        currentUser={currentUser}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
      />

      {/* ACCOUNT & FIREBASE AUTH MODAL */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
        currentUser={currentUser}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        onSyncLeaderboard={syncLeaderboard}
      />

      {/* GUIDED TOUR OVERLAY (SHORT / FULL / SKIP) */}
      <GuidedTour
        isActive={isTourActive}
        onClose={() => setIsTourActive(false)}
        onStepChange={handleTourStepChange}
        completedTours={gameState.completedTours}
        onClaimBonus={handleClaimTourBonus}
      />

      {/* PWA INSTALLATION DESK OVERLAY */}
      <PWAInstallModal
        isOpen={isPWAInstallOpen}
        onClose={() => setIsPWAInstallOpen(false)}
        gameState={gameState}
        onClaimBonus={handleClaimPwaBonus}
      />

      {/* CLOUD SAVE CONFLICT OVERLAY MODAL */}
      {cloudSaveConflict && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-[100] animate-fadeIn">
          <div className="w-full max-w-[550px] bg-linear-to-b from-[#111827] via-[#0d1322] to-[#070b14] border-2 border-cyan-500/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.15)] space-y-6 text-center">
            <div className="w-16 h-16 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto text-3xl">
              ☁️
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase tracking-wider text-cyan-400 font-mono">
                Cloud Save Found!
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                We detected a saved progress profile on your cloud account that differs from your current local browser progress. Choose which state you would like to keep.
              </p>
            </div>

            {/* Cloud vs Local Stats Grid */}
            <div className="grid grid-cols-2 gap-4 text-left">
              {/* Cloud Saved Progress Info */}
              <div className="bg-[#0b1322] border border-cyan-500/20 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full uppercase tracking-wider text-center">
                    Cloud Progress
                  </span>
                </div>
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Defeats:</span>
                    <span className="text-white font-black">🏆 {cloudSaveConflict.cloud.totalBossesDefeated || 0}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Coins:</span>
                    <span className="text-yellow-400 font-bold">{Math.floor(cloudSaveConflict.cloud.coins || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Gems:</span>
                    <span className="text-sky-300 font-bold">💎 {cloudSaveConflict.cloud.gems || 0}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => applyCloudProgress(cloudSaveConflict.cloud)}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black font-mono text-xs rounded-xl cursor-pointer transition uppercase tracking-wider shadow-md shadow-cyan-500/20"
                >
                  Sync From Cloud
                </button>
              </div>

              {/* Local Saved Progress Info */}
              <div className="bg-slate-900/60 border border-slate-700/30 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full uppercase tracking-wider text-center">
                    Local Progress
                  </span>
                </div>
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Defeats:</span>
                    <span className="text-white font-black">🏆 {cloudSaveConflict.local.totalBossesDefeated || 0}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Coins:</span>
                    <span className="text-yellow-400 font-bold">{Math.floor(cloudSaveConflict.local.coins || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Gems:</span>
                    <span className="text-sky-300 font-bold">💎 {cloudSaveConflict.local.gems || 0}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resolveWithLocalProgress}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-black font-mono text-xs rounded-xl cursor-pointer transition uppercase tracking-wider border border-slate-700"
                >
                  Keep Local
                </button>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-mono italic">
              Warning: Choosing an option will overwrite the alternate progress storage.
            </div>
          </div>
        </div>
      )}

      {/* UNIVERSAL MOBILE TOUCH & DESKTOP HOVER TOOLTIP ENGINE */}
      <GlobalTouchTooltip />
    </div>
  );
}
