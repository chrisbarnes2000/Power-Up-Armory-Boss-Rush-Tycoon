import { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, getDocs, setDoc, updateDoc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import ShopView from './components/ShopView';
import GameView from './components/GameView';
import LoreBookView from './components/LoreBookView';
import PartnersView from './components/PartnersView';
import AdminModal from './components/AdminModal';
import AccountModal from './components/AccountModal';
import GuidedTour, { TourStep } from './components/GuidedTour';
import { TOUR_BONUSES } from './data/tourSteps';
import FontScaleControl from './components/FontScaleControl';
import Footer from './components/Footer';
import { PWAInstallModal } from './components/common/PWAInstallModal';
import { ShareCardModal } from './components/common/ShareCardModal';
import { GlobalTouchTooltip } from './components/common/GlobalTouchTooltip';
import { ParticleOverlay, triggerParticleBurst } from './components/common/ParticleFX';
import { GameState, LeaderboardEntry, UserProfile } from './types';
import { POWERUPS, BOSSES, DEFAULT_BALANCE_CONFIG, calculatePowerScore, DEFAULT_STARTER_BASELINE_STATE, clearAllLocalUserData } from './data';
import { initAnalytics, trackPageView, trackUserIdentify, trackUserLogout, trackEvent, isDevWorkspace, trackSquadInvite } from './lib/analytics';
import CookieConsentBanner from './components/common/CookieConsentBanner';
import ChangelogModal from './components/ChangelogModal';
import { APP_VERSION } from './version';
import { getIsBetaTester, setBetaTesterMode, getIsCloudAutoSyncEnabled } from './lib/remoteConfig';
import { MONTHLY_REWARDS, YEARLY_REWARDS } from './data/seasonalRewards';
import { SeasonMode } from './components/game/leaderboard/LeaderboardSeasonHeader';
import { LeaderboardCategory } from './components/game/leaderboard/LeaderboardCategoryNav';

const DEFAULT_STATE: GameState = DEFAULT_STARTER_BASELINE_STATE;

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
  const [activeView, setActiveView] = useState<'Shop' | 'Game' | 'Stats' | 'Lore' | 'Partners'>('Game');
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
  const [controlledLoreTab, setControlledLoreTab] = useState<'compendium' | 'chronicles' | 'legend' | 'bestiary'>('compendium');
  const [initialLoreChronicleMode, setInitialLoreChronicleMode] = useState<'canonical' | 'living' | 'writer'>('canonical');
  const [controlledShopCategory, setControlledShopCategory] = useState<'weapons' | 'defense' | 'utility' | 'mystic'>('weapons');
  const [controlledGameTab, setControlledGameTab] = useState<'tycoon' | 'bosses' | 'stats'>('tycoon');
  const [controlledStatsSeason, setControlledStatsSeason] = useState<SeasonMode>('alltime');
  const [controlledStatsCategory, setControlledStatsCategory] = useState<LeaderboardCategory>('power');
  const [isShopCartDrawerOpen, setIsShopCartDrawerOpen] = useState(false);
  const [isPWAInstallOpen, setIsPWAInstallOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isBeta, setIsBeta] = useState(getIsBetaTester());
  const [isShareCardOpen, setIsShareCardOpen] = useState(false);
  const [shareCardDefaultView, setShareCardDefaultView] = useState<'champion' | 'boss' | 'squad'>('champion');
  const [shareCardBossData, setShareCardBossData] = useState<{ name: string; emoji: string } | undefined>(undefined);
  const [deepTagWelcome, setDeepTagWelcome] = useState<string | null>(null);

  const handleOpenShareCard = useCallback((view: 'champion' | 'boss' | 'squad' = 'champion', boss?: { name: string; emoji: string }) => {
    setShareCardDefaultView(view);
    setShareCardBossData(boss);
    setIsShareCardOpen(true);
  }, []);

  // Capture inward deep tagging & dynamically inject OpenGraph / Twitter dynamic SVG tags
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const deepPlayer = params.get('player') || params.get('name');
      const deepInvite = params.get('invite') || params.get('code');
      const deepBoss = params.get('boss');
      const deepPs = params.get('ps');

      if (deepPlayer || deepInvite || deepBoss) {
        const svgUrl = `${window.location.origin}/share-card.svg${window.location.search}`;
        const pageTitle = deepBoss 
          ? `${deepBoss} Vanquished by ${deepPlayer || 'Champion'} · Power-Up Armory`
          : deepPlayer 
            ? `${deepPlayer}'s Champion Codex · Power-Up Armory`
            : `Join Raid Squad ${deepInvite} · Power-Up Armory`;

        document.title = pageTitle;

        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', pageTitle);

        let ogImage = document.querySelector('meta[property="og:image"]');
        if (!ogImage) {
          ogImage = document.createElement('meta');
          ogImage.setAttribute('property', 'og:image');
          document.head.appendChild(ogImage);
        }
        ogImage.setAttribute('content', svgUrl);

        let twitterImage = document.querySelector('meta[name="twitter:image"]');
        if (!twitterImage) {
          twitterImage = document.createElement('meta');
          twitterImage.setAttribute('name', 'twitter:image');
          document.head.appendChild(twitterImage);
        }
        twitterImage.setAttribute('content', svgUrl);

        if (deepPlayer) {
          setDeepTagWelcome(`⚔️ ${deepPlayer}'s Codex Card Loaded${deepPs ? ` (Power Score: ${Number(deepPs).toLocaleString()})` : ''}!`);
        } else if (deepInvite) {
          setDeepTagWelcome(`👥 Squad Invite [${deepInvite}] Active! Redeem in Account for +3,000 Coins!`);
        }
      }
    } catch {}
  }, []);

  // Compute number of unclaimed seasonal rewards for live sub-menu badge
  const allSeasonalRewards = [...MONTHLY_REWARDS, ...YEARLY_REWARDS];
  const unclaimedSeasonalCount = allSeasonalRewards.filter(reward => {
    const isClaimed = !!gameState.claimedSeasonalRewards?.[reward.id];
    if (isClaimed) return false;

    let userVal = 0;
    switch (reward.category) {
      case 'kills':
        userVal = gameState.totalBossesDefeated || 0;
        break;
      case 'deaths':
        userVal = gameState.totalDeaths || (
          Object.values(gameState.bossDeathStats || {}).reduce<number>((a, b) => a + (Number(b) || 0), 0)
        );
        break;
      case 'max_damage':
        userVal = gameState.maxDamage || 0;
        break;
      case 'dodges':
        userVal = gameState.totalDodges || 0;
        break;
      case 'specials':
        userVal = gameState.totalSpecials || 0;
        break;
      case 'gold':
        userVal = gameState.totalGoldEarned || gameState.coins || 0;
        break;
      case 'gems':
        userVal = gameState.totalGemsEarned || gameState.gems || 0;
        break;
      case 'overall_power':
        userVal = gameState.powerScore || 0;
        break;
    }
    return userVal >= reward.minRequirement;
  }).length;

  // Floating Toast Notification when new bounties become claimable
  const [bountyToast, setBountyToast] = useState<string | null>(null);
  const prevUnclaimedCountRef = useRef<number | null>(null);
  const isInitialBountyMountRef = useRef(true);

  useEffect(() => {
    // Suppress launch particle FX during initial mount / app boot
    if (isInitialBountyMountRef.current) {
      prevUnclaimedCountRef.current = unclaimedSeasonalCount;
      isInitialBountyMountRef.current = false;
      return;
    }

    if (prevUnclaimedCountRef.current !== null && unclaimedSeasonalCount > prevUnclaimedCountRef.current) {
      const diff = unclaimedSeasonalCount - prevUnclaimedCountRef.current;
      setBountyToast(diff === 1 ? '1 New Bounty Unlocked!' : `${diff} New Bounties Unlocked!`);
    }
    prevUnclaimedCountRef.current = unclaimedSeasonalCount;
  }, [unclaimedSeasonalCount]);

  // Automatically prompt changelog if version has changed
  useEffect(() => {
    const lastSeenVersion = localStorage.getItem('armory_last_seen_version');
    if (lastSeenVersion !== APP_VERSION) {
      // Small delay to let the initial view settle
      const timer = setTimeout(() => {
        setIsChangelogOpen(true);
        localStorage.setItem('armory_last_seen_version', APP_VERSION);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

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

    trackEvent('tour_completed', {
      tour_mode: mode,
      reward_coins: bonus.coins,
      reward_gems: bonus.gems
    });

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

    trackEvent('pwa_bonus_claimed', {
      reward_coins: 5000,
      reward_gems: 250,
      month: currentMonth
    });

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

  // Initialize Google Analytics & Vemetric on Mount + Evaluate Inward Deep Links
  useEffect(() => {
    initAnalytics();

    // Inward Deep Linking & State Evaluator
    if (typeof window !== 'undefined') {
      try {
        const searchParams = new URLSearchParams(window.location.search);

        // 1. Top-Level View Deep Link (?view=shop|game|lore|stats)
        const viewParam = searchParams.get('view')?.toLowerCase();
        if (viewParam) {
          if (viewParam === 'shop' || viewParam === 'armory') setActiveView('Shop');
          else if (viewParam === 'game' || viewParam === 'arena' || viewParam === 'combat') setActiveView('Game');
          else if (viewParam === 'lore' || viewParam === 'compendium') setActiveView('Lore');
          else if (viewParam === 'stats' || viewParam === 'leaderboard') setActiveView('Stats');
        }

        // 2. Shop Category Deep Link (?category=weapons|defense|utility|mystic)
        const categoryParam = searchParams.get('category')?.toLowerCase();
        if (categoryParam && ['weapons', 'defense', 'utility', 'mystic'].includes(categoryParam)) {
          setActiveView('Shop');
          setControlledShopCategory(categoryParam as any);
        }

        // 3. Lore Sub-tab Deep Link (?lore=compendium|bosses|systems|calculator|story)
        const loreParam = searchParams.get('lore')?.toLowerCase();
        if (loreParam && ['compendium', 'bosses', 'systems', 'calculator', 'story'].includes(loreParam)) {
          setActiveView('Lore');
          setControlledLoreTab(loreParam as any);
        }

        // 4. Game Arena Sub-tab Deep Link (?tab=tycoon|bosses|stats)
        const gameTabParam = searchParams.get('tab')?.toLowerCase();
        if (gameTabParam && ['tycoon', 'bosses', 'stats'].includes(gameTabParam)) {
          setActiveView('Game');
          setControlledGameTab(gameTabParam as any);
        }

        // 5. Interactive Modal Deep Links (?tour=true, ?account=true, ?invite=ARMORY-XXXXX, ?squad=...)
        if (searchParams.get('tour') === 'true' || searchParams.get('guided_tour') === 'true') {
          setIsTourActive(true);
        }
        if (searchParams.get('install') === 'true' || searchParams.get('pwa') === 'true') {
          setIsPWAInstallOpen(true);
        }
        if (searchParams.get('account') === 'true' || searchParams.get('squad') || searchParams.get('invite') || searchParams.get('ref')) {
          setIsAccountOpen(true);
        }
      } catch (e) {
        console.warn('Deep link parsing error:', e);
      }
    }
  }, []);

  // Track virtual page views when activeView changes
  useEffect(() => {
    trackPageView(activeView);
  }, [activeView]);

  // Safety safeguard: close admin modal if user is no longer admin
  useEffect(() => {
    if (!isAdmin && isAdminOpen) {
      setIsAdminOpen(false);
    }
  }, [isAdmin, isAdminOpen]);

  // --- FIREBASE AUTH STATE LISTENER & INITIAL TOUR PROMPT ---
  const [hasEvaluatedInitialAuth, setHasEvaluatedInitialAuth] = useState(false);
  const previousAuthUserRef = useRef<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const prevUser = previousAuthUserRef.current;
      previousAuthUserRef.current = user;
      setCurrentUser(user);
      if (user) {
        const initialDisplayName = user.displayName || (user.email ? user.email.split('@')[0] : 'Champion');
        trackUserIdentify(user.uid, {
          email: user.email || undefined,
          displayName: initialDisplayName,
          avatarUrl: user.photoURL || undefined,
          isAnonymous: user.isAnonymous,
          powerScore: calculatePowerScore(gameState),
          totalBossesDefeated: gameState.totalBossesDefeated,
          coins: Math.floor(gameState.coins),
          gems: gameState.gems || 0
        });
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setUserProfile(data);
            if (data.displayName) {
              setGameState(prev => ({ ...prev, playerName: data.displayName }));
            }
            trackUserIdentify(user.uid, {
              email: data.email || user.email || undefined,
              displayName: data.displayName || initialDisplayName,
              avatarUrl: user.photoURL || undefined,
              title: data.title || 'Grand Champion',
              avatar: data.avatar || '⚔️',
              powerScore: data.powerScore || calculatePowerScore(gameState),
              totalBossesDefeated: data.totalBossesDefeated ?? gameState.totalBossesDefeated,
              coins: data.coins ?? Math.floor(gameState.coins),
              gems: gameState.gems || 0,
              isAnonymous: user.isAnonymous
            });

            if (data.isAdmin === true) {
              setIsAdmin(true);
              setIsBeta(true);
              setBetaTesterMode(true);
            }
            if (data.isBetaTester === true) {
              setIsBeta(true);
              setBetaTesterMode(true);
            }
          }

          // Owner & Admin verification check across all domains & preview builds
          const isOwnerAccount = 
            user.uid === 'WlMw7jRoVgSl2kyjH6B47DLayU72' ||
            user.email?.toLowerCase() === 'chris.barnes.2000@me.com';

          if (isOwnerAccount || (user as any).isAdmin === true) {
            setIsAdmin(true);
            setIsBeta(true);
            setBetaTesterMode(true);
          }

          user.getIdTokenResult().then(res => {
            if (res.claims.isAdmin === true || isOwnerAccount) {
              setIsAdmin(true);
              setIsBeta(true);
              setBetaTesterMode(true);
            }
          }).catch(() => {});

          // Parse local state stored in browser localStorage
          let localState = DEFAULT_STATE;
          try {
            const saved = localStorage.getItem('bossRushTycoon');
            if (saved) {
              localState = { ...DEFAULT_STATE, ...JSON.parse(saved) };
            }
          } catch (e) {
            console.warn('Could not parse localState in auth listener:', e);
          }

          const isQuickSyncDisabled = !!(localState.balanceConfig?.disableQuickSyncCheck || gameState.balanceConfig?.disableQuickSyncCheck);

          if (!isQuickSyncDisabled) {
            // Fetch Cloud Game Save Progress
            const progressDocRef = doc(db, 'user_progress', user.uid);
            const progressSnap = await getDoc(progressDocRef);
            if (progressSnap.exists()) {
              const cloudData = progressSnap.data();

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
          }
        } catch (err) {
          console.warn('Error fetching user profile or cloud progress:', err);
        }
      } else {
        // User is unauthenticated / logged out
        setUserProfile(null);
        setCloudSaveConflict(null);
        setIsAdmin(false);

        // If previously authenticated user signed out, wipe local storage and reset gameState to baseline
        // so new accounts cannot quick-sync or exploit prior user's battle progress
        if (prevUser !== null) {
          trackUserLogout(prevUser.uid);
          const cleanBaseline = clearAllLocalUserData();
          setGameState(cleanBaseline);
        }
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
    if (isDevWorkspace()) {
      // In dev sandbox, execute a single getDocs read to populate the cloud leaderboard with real users without keeping continuous open snapshot streams
      const fetchOnce = async () => {
        try {
          const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(50));
          const snapshot = await getDocs(q);
          const entries: LeaderboardEntry[] = [];
          snapshot.forEach((docSnap) => {
            entries.push(docSnap.data() as LeaderboardEntry);
          });
          setCloudLeaderboard(entries);
          setGameState(prev => ({ ...prev, leaderboard: entries }));
        } catch (err) {
          console.warn('Dev workspace one-time leaderboard fetch warning:', err);
        }
      };
      fetchOnce();
      return;
    }

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

        // Coins accrued directly based on loadout gold rate per second
        const accruedCoins = rate;

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

      const totalDeaths = gameState.totalDeaths || (
        Object.values(gameState.bossDeathStats || {}).reduce<number>((a, b) => a + (Number(b) || 0), 0)
      );

      const entry: LeaderboardEntry = {
        userId: currentUser.uid,
        name: nameToUse,
        score: currentPowerScore,
        bosses: bossesDefeated,
        coins: goldCoins,
        gems: gameState.gems || 0,
        avatar: avatarToUse,
        title: titleToUse,
        maxDamage: gameState.maxDamage || 0,
        totalDodges: gameState.totalDodges || 0,
        totalSpecials: gameState.totalSpecials || 0,
        totalKills: bossesDefeated,
        totalDeaths: totalDeaths,
        totalGoldEarned: gameState.totalGoldEarned || goldCoins,
        totalGemsEarned: gameState.totalGemsEarned || (gameState.gems || 0),
        bossKillStats: gameState.bossKillStats || {},
        bossDeathStats: gameState.bossDeathStats || {},
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
        gems: gameState.gems || 0,
        maxDamage: gameState.maxDamage || 0,
        totalDodges: gameState.totalDodges || 0,
        totalSpecials: gameState.totalSpecials || 0,
        totalGoldEarned: gameState.totalGoldEarned || goldCoins,
        totalGemsEarned: gameState.totalGemsEarned || (gameState.gems || 0),
        totalDeaths: totalDeaths,
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
        maxDamage: gameState.maxDamage || 0,
        totalDodges: gameState.totalDodges || 0,
        totalSpecials: gameState.totalSpecials || 0,
        totalGoldEarned: gameState.totalGoldEarned || gameState.coins,
        totalGemsEarned: gameState.totalGemsEarned || (gameState.gems || 0),
        totalDeaths: totalDeaths,
        claimedSeasonalRewards: gameState.claimedSeasonalRewards || {},
        updatedAt: new Date().toISOString()
      }), { merge: true });

      setGameState(prev => ({ ...prev, powerScore: currentPowerScore }));

      // Refresh identified user state and push latest stats to Vemetric & GA4
      trackUserIdentify(currentUser.uid, {
        email: currentUser.email || undefined,
        displayName: nameToUse,
        avatarUrl: currentUser.photoURL || undefined,
        avatar: avatarToUse,
        title: titleToUse,
        powerScore: currentPowerScore,
        totalBossesDefeated: bossesDefeated,
        coins: goldCoins,
        gems: gameState.gems || 0
      });

      // Dispatch analytics event
      trackEvent('leaderboard_synced', {
        user_id: currentUser.uid,
        power_score: currentPowerScore,
        bosses_defeated: bossesDefeated,
        coins: goldCoins,
        gems: gameState.gems || 0,
        max_damage: gameState.maxDamage || 0,
        total_dodges: gameState.totalDodges || 0,
        total_specials: gameState.totalSpecials || 0
      });

      // If running in dev workspace without persistent snapshot listener, refresh cloud leaderboard list
      if (isDevWorkspace()) {
        try {
          const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(50));
          const snapshot = await getDocs(q);
          const entries: LeaderboardEntry[] = [];
          snapshot.forEach((docSnap) => {
            entries.push(docSnap.data() as LeaderboardEntry);
          });
          setCloudLeaderboard(entries);
        } catch {}
      }
    } catch (err) {
      console.error('Error syncing leaderboard:', err);
      handleFirestoreError(err, OperationType.WRITE, `leaderboard/${currentUser.uid}`);
    } finally {
      setIsSyncingLeaderboard(false);
    }
  }, [currentUser, userProfile, gameState]);

  // Squad Invite Code Redemption Handler
  const handleRedeemInviteCode = useCallback((code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const myCode = 
      gameState.inviteCode || 
      userProfile?.inviteCode || 
      `ARMORY-${(userProfile?.userId || gameState.playerName || 'CHAMP').replace(/[^A-Za-z0-9]/g, '').slice(0, 5).toUpperCase() || 'HERO7'}`;

    if (cleanCode === myCode) {
      return { success: false, message: 'You cannot redeem your own squad invite code!' };
    }

    if (gameState.invitedByCode || userProfile?.invitedByCode) {
      return { success: false, message: 'You have already redeemed a squad invite code!' };
    }

    const isPartnerCode = ['MINIBARN-MASTER', 'MINIBARN', 'RAPPORT-VERSE', 'RAPPORTVERSE', 'RAPPRT'].includes(cleanCode);
    const partnerName = isPartnerCode 
      ? (cleanCode.includes('BARN') ? 'MiniBarnMaster' : 'RapportVerse') 
      : undefined;

    trackSquadInvite('redeemed', cleanCode, {
      is_partner_creator: isPartnerCode,
      ...(partnerName ? { creator_name: partnerName } : {}),
      reward_coins: 3000,
      reward_gems: 150
    });

    // Grant bonus: +3,000 Coins and +150 Gems
    const updatedState: GameState = {
      ...gameState,
      coins: gameState.coins + 3000,
      gems: (gameState.gems || 0) + 150,
      invitedByCode: cleanCode,
      inviteCode: myCode,
      squadRecruitsCount: (gameState.squadRecruitsCount || 0) + 1,
      squadMembers: [...(gameState.squadMembers || []), isPartnerCode ? `Partner Recruit: ${partnerName}` : `Recruited via ${cleanCode}`],
      battleLog: [
        {
          message: isPartnerCode 
            ? `🤝 ${partnerName} Partner Bonus Activated (${cleanCode})! Received +3,000 Coins & +150 Gems!`
            : `👥 Squad Invite Redeemed (${cleanCode})! Received +3,000 Coins & +150 Gems bonus!`,
          className: 'log-reward'
        },
        ...gameState.battleLog
      ]
    };

    setGameState(updatedState);
    localStorage.setItem('bossRushTycoon', JSON.stringify(updatedState));

    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      updateDoc(userRef, {
        invitedByCode: cleanCode,
        inviteCode: myCode,
        squadRecruitsCount: (userProfile?.squadRecruitsCount || 0) + 1,
        coins: updatedState.coins,
        updatedAt: new Date().toISOString()
      }).catch(err => console.warn('Could not sync invite to user profile:', err));

      const progressRef = doc(db, 'user_progress', currentUser.uid);
      setDoc(progressRef, {
        userId: currentUser.uid,
        coins: updatedState.coins,
        gems: updatedState.gems,
        invitedByCode: cleanCode,
        inviteCode: myCode,
        squadRecruitsCount: updatedState.squadRecruitsCount,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(err => console.warn('Could not sync invite to user progress:', err));

      setUserProfile(prev => prev ? {
        ...prev,
        invitedByCode: cleanCode,
        inviteCode: myCode,
        squadRecruitsCount: (prev.squadRecruitsCount || 0) + 1,
        coins: updatedState.coins
      } : null);
    }

    return { 
      success: true, 
      message: `🎉 Success! Joined squad (${cleanCode})! Received +3,000 Coins & +150 Gems!` 
    };
  }, [gameState, userProfile, currentUser]);

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
        baseSpeed: cloudData.baseSpeed ?? prev.baseSpeed,
        maxDamage: cloudData.maxDamage ?? prev.maxDamage,
        totalDodges: cloudData.totalDodges ?? prev.totalDodges,
        totalSpecials: cloudData.totalSpecials ?? prev.totalSpecials,
        totalGoldEarned: cloudData.totalGoldEarned ?? prev.totalGoldEarned,
        totalGemsEarned: cloudData.totalGemsEarned ?? prev.totalGemsEarned,
        totalDeaths: cloudData.totalDeaths ?? prev.totalDeaths,
        claimedSeasonalRewards: cloudData.claimedSeasonalRewards ?? prev.claimedSeasonalRewards
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
        maxDamage: localState.maxDamage || 0,
        totalDodges: localState.totalDodges || 0,
        totalSpecials: localState.totalSpecials || 0,
        totalGoldEarned: localState.totalGoldEarned || localState.coins,
        totalGemsEarned: localState.totalGemsEarned || (localState.gems || 0),
        totalDeaths: localState.totalDeaths || 0,
        claimedSeasonalRewards: localState.claimedSeasonalRewards || {},
        updatedAt: new Date().toISOString()
      }), { merge: true });
    } catch (err) {
      console.warn('Could not force local save to cloud:', err);
    }
    setCloudSaveConflict(null);
  };

  // --- AUTOMATIC CLOUD AUTO-SAVE THROTTLED TO 30 SECONDS (Gated by Beta Auto-Sync Flag) ---
  useEffect(() => {
    if (!currentUser || !getIsCloudAutoSyncEnabled()) return;

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
        className="sticky top-0 z-20 flex flex-col border-b border-white/10 bg-[#0a0e1a] shadow-2xl shadow-black/80 w-full max-w-full box-border"
      >
        {/* Tier 1: Brand & Top Utility Controls (Accessibility, Tour, Account, Admin, Cloud Status) */}
        <div className="w-full flex items-center justify-between px-2.5 sm:px-6 md:px-8 py-1.5 sm:py-2 border-b border-white/5 bg-[#0a0e1a] relative z-20">
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

            {/* Updates & Beta Flags Modal Trigger */}
            <button
              id="header-updates-beta-btn"
              onClick={() => setIsChangelogOpen(true)}
              className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-linear-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 text-[11px] sm:text-xs text-amber-300 hover:text-amber-200 font-extrabold transition flex items-center gap-1 cursor-pointer shadow-sm"
              title="View Release Updates, Dev Logs, Roadmap & Experimental Beta Flags"
            >
              <span className="text-xs sm:text-sm">🚀</span>
              <span className="hidden xs:inline">Updates &amp; Beta</span>
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
              <span className={`w-2 h-2 rounded-full animate-pulse ${isAdmin ? 'bg-red-400' : !getIsCloudAutoSyncEnabled() ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
              <span className="text-[11px] font-bold text-slate-400">
                {isAdmin ? 'Admin Bypassed' : !getIsCloudAutoSyncEnabled() ? 'Manual Sync' : currentUser ? 'Cloud Synced' : 'Cloud Ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Tier 2: Primary Navigation System & Contextual Dynamic Sub-Menu (Vertically Stacked) */}
        <div className="w-full flex items-center justify-center px-2 sm:px-6 pt-1.5 pb-3 sm:pb-3.5 bg-[#0b101d] border-t border-white/5 shadow-inner relative z-20">
          <div className="flex flex-col items-center gap-2 sm:gap-2.5 justify-center max-w-full w-full">
            {/* Primary Pill Navigation */}
            <div className="flex items-center bg-[#121c30] border border-[#2a4060] rounded-full p-0.5 shadow-inner">
              <button 
                id="nav-tab-game"
                onClick={() => {
                  setActiveView('Game');
                }} 
                className={`rounded-full font-bold text-[11px] sm:text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 ${
                  activeView === 'Game' ? 'bg-[#2a4060] text-[#d0e8ff] shadow-md shadow-blue-500/20 font-black' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-xs">🎮</span>
                <span className="hidden xs:inline">Game Arena</span>
                <span className="xs:hidden">Arena</span>
              </button>

              <button 
                id="nav-tab-armory-store"
                onClick={() => setActiveView('Shop')} 
                className={`rounded-full font-bold text-[11px] sm:text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 ${
                  activeView === 'Shop' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-black' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-xs">{isAdmin || userProfile?.isArmoryStoreEnabled || gameState.totalBossesDefeated >= 1 || (gameState.bossKillStats?.['Goblin King'] || 0) >= 1 ? '🛒' : '🔒'}</span>
                <span className="hidden xs:inline">Armory Store</span>
                <span className="xs:hidden">Store</span>
              </button>

              <button 
                id="nav-tab-lore"
                onClick={() => setActiveView('Lore')} 
                className={`rounded-full font-bold text-[11px] sm:text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 ${
                  activeView === 'Lore' ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20 font-black' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-xs">📖</span>
                <span className="hidden xs:inline">Lore Book</span>
                <span className="xs:hidden">Lore</span>
              </button>

              <button 
                id="nav-tab-stats"
                onClick={() => setActiveView('Stats')} 
                className={`rounded-full font-bold text-[11px] sm:text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 ${
                  activeView === 'Stats' ? 'bg-[#2a4060] text-[#d0e8ff] shadow-md shadow-blue-500/20 font-black' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-xs">🏆</span>
                <span className="hidden xs:inline">Rank & Stats</span>
                <span className="xs:hidden">Rank</span>
              </button>
            </div>

            {/* Dynamic Contextual Sub-Menu (Adapts to Active View) */}
            <div id="dynamic-sub-tabs" className="flex items-center gap-0.5 p-0.5 bg-[#142036] border border-[#2a4060] rounded-full shadow-md animate-fadeIn max-w-full overflow-x-auto scrollbar-none">
              {activeView === 'Partners' && (
                <div className="py-0.5 sm:py-1 px-3 text-[10px] sm:text-[11px] font-mono text-amber-300 uppercase tracking-widest font-black flex items-center gap-1">
                  <span>🤝</span>
                  <span>Strategic Partner Portal</span>
                </div>
              )}
              {activeView === 'Game' && (
                <>
                  <button 
                    id="game-tab-tycoon"
                    onClick={() => setControlledGameTab('tycoon')}
                    className={`py-0.5 sm:py-1 px-2.5 sm:px-3 rounded-full font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1 ${
                      controlledGameTab === 'tycoon' ? 'bg-amber-500 text-slate-950 shadow-sm font-black' : 'text-slate-400 hover:text-slate-100 hover:bg-[#1c2c48]'
                    }`}
                  >
                    <span>⚡</span>
                    <span>Tycoon Mine</span>
                  </button>
                  <button 
                    id="game-tab-bosses"
                    onClick={() => setControlledGameTab('bosses')}
                    className={`py-0.5 sm:py-1 px-2.5 sm:px-3 rounded-full font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1 ${
                      controlledGameTab === 'bosses' ? 'bg-red-600 text-white shadow-sm font-black' : 'text-slate-400 hover:text-slate-100 hover:bg-[#1c2c48]'
                    }`}
                  >
                    <span>⚔️</span>
                    <span>Boss Rush</span>
                  </button>
                  <button 
                    id="game-tab-quill"
                    onClick={() => {
                      setActiveView('Lore');
                      setControlledLoreTab('chronicles');
                      setInitialLoreChronicleMode('writer');
                    }}
                    className="py-0.5 sm:py-1 px-2.5 sm:px-3 rounded-full font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1 text-slate-400 hover:text-slate-100 hover:bg-[#1c2c48]"
                  >
                    <span>✍️</span>
                    <span>Chronicler's Quill</span>
                  </button>
                </>
              )}

              {activeView === 'Lore' && (
                <>
                  <button 
                    id="lore-sub-compendium"
                    onClick={() => setControlledLoreTab('compendium')}
                    className={`py-0.5 sm:py-1 px-2.5 sm:px-3 rounded-full font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1 ${
                      controlledLoreTab === 'compendium' ? 'bg-orange-600 text-white shadow-sm font-black' : 'text-slate-400 hover:text-slate-100 hover:bg-[#1c2c48]'
                    }`}
                  >
                    <span>📖</span>
                    <span>3D Tome</span>
                  </button>
                  <button 
                    id="lore-sub-chronicles"
                    onClick={() => {
                      setControlledLoreTab('chronicles');
                      setInitialLoreChronicleMode('canonical');
                    }}
                    className={`py-0.5 sm:py-1 px-2.5 sm:px-3 rounded-full font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1 ${
                      controlledLoreTab === 'chronicles' && initialLoreChronicleMode === 'canonical' ? 'bg-orange-600 text-white shadow-sm font-black' : 'text-slate-400 hover:text-slate-100 hover:bg-[#1c2c48]'
                    }`}
                  >
                    <span>📜</span>
                    <span>Scrolls</span>
                  </button>
                  <button 
                    id="lore-sub-bestiary"
                    onClick={() => setControlledLoreTab('bestiary')}
                    className={`py-0.5 sm:py-1 px-2.5 sm:px-3 rounded-full font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1 ${
                      controlledLoreTab === 'bestiary' ? 'bg-orange-600 text-white shadow-sm font-black' : 'text-slate-400 hover:text-slate-100 hover:bg-[#1c2c48]'
                    }`}
                  >
                    <span>👾</span>
                    <span>Bestiary</span>
                  </button>
                  <button 
                    id="lore-sub-legend"
                    onClick={() => setControlledLoreTab('legend')}
                    className={`py-0.5 sm:py-1 px-2.5 sm:px-3 rounded-full font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1 ${
                      controlledLoreTab === 'legend' ? 'bg-orange-600 text-white shadow-sm font-black' : 'text-slate-400 hover:text-slate-100 hover:bg-[#1c2c48]'
                    }`}
                  >
                    <span>🏛️</span>
                    <span>Codex</span>
                  </button>
                </>
              )}

              {activeView === 'Shop' && (
                <>
                  <button 
                    id="shop-sub-weapons"
                    onClick={() => setControlledShopCategory('weapons')}
                    className={`py-0.5 sm:py-1 px-2 sm:px-2.5 rounded-full font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1 ${
                      controlledShopCategory === 'weapons' ? 'bg-indigo-600 text-white shadow-sm font-black' : 'text-slate-400 hover:text-slate-100 hover:bg-[#1c2c48]'
                    }`}
                  >
                    <span>⚔️</span>
                    <span>Weapons</span>
                  </button>
                  <button 
                    id="shop-sub-defense"
                    onClick={() => setControlledShopCategory('defense')}
                    className={`py-0.5 sm:py-1 px-2 sm:px-2.5 rounded-full font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1 ${
                      controlledShopCategory === 'defense' ? 'bg-indigo-600 text-white shadow-sm font-black' : 'text-slate-400 hover:text-slate-100 hover:bg-[#1c2c48]'
                    }`}
                  >
                    <span>🛡️</span>
                    <span>Defense</span>
                  </button>
                  <button 
                    id="shop-sub-utility"
                    onClick={() => setControlledShopCategory('utility')}
                    className={`py-0.5 sm:py-1 px-2 sm:px-2.5 rounded-full font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1 ${
                      controlledShopCategory === 'utility' ? 'bg-indigo-600 text-white shadow-sm font-black' : 'text-slate-400 hover:text-slate-100 hover:bg-[#1c2c48]'
                    }`}
                  >
                    <span>✨</span>
                    <span>Utility</span>
                  </button>
                  <button 
                    id="shop-sub-mystic"
                    onClick={() => setControlledShopCategory('mystic')}
                    className={`py-0.5 sm:py-1 px-2 sm:px-2.5 rounded-full font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1 ${
                      controlledShopCategory === 'mystic' ? 'bg-indigo-600 text-white shadow-sm font-black' : 'text-slate-400 hover:text-slate-100 hover:bg-[#1c2c48]'
                    }`}
                  >
                    <span>🌀</span>
                    <span>Mystic</span>
                  </button>
                </>
              )}

              {activeView === 'Stats' && (
                <>
                  {/* Monthly Season Timeframe */}
                  <button 
                    id="stats-sub-monthly"
                    onClick={() => {
                      setControlledStatsSeason('monthly');
                      if (controlledStatsCategory === 'rewards') setControlledStatsCategory('power');
                    }}
                    className={`py-0.5 sm:py-1 px-2 sm:px-2.5 rounded-full font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1 ${
                      controlledStatsSeason === 'monthly' && controlledStatsCategory !== 'rewards'
                        ? 'bg-blue-600 text-white shadow-sm font-black'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-[#1c2c48]'
                    }`}
                    title="Monthly Seasonal Leaderboard"
                  >
                    <span>📅</span>
                    <span>Monthly</span>
                  </button>

                  {/* Yearly Championship Timeframe */}
                  <button 
                    id="stats-sub-yearly"
                    onClick={() => {
                      setControlledStatsSeason('yearly');
                      if (controlledStatsCategory === 'rewards') setControlledStatsCategory('power');
                    }}
                    className={`py-0.5 sm:py-1 px-2 sm:px-2.5 rounded-full font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1 ${
                      controlledStatsSeason === 'yearly' && controlledStatsCategory !== 'rewards'
                        ? 'bg-amber-600 text-white shadow-sm font-black'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-[#1c2c48]'
                    }`}
                    title="Yearly Championship Leaderboard"
                  >
                    <span>👑</span>
                    <span>Yearly</span>
                  </button>

                  {/* All-Time Eternal Timeframe */}
                  <button 
                    id="stats-sub-alltime"
                    onClick={() => {
                      setControlledStatsSeason('alltime');
                      if (controlledStatsCategory === 'rewards') setControlledStatsCategory('power');
                    }}
                    className={`py-0.5 sm:py-1 px-2 sm:px-2.5 rounded-full font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1 ${
                      controlledStatsSeason === 'alltime' && controlledStatsCategory !== 'rewards'
                        ? 'bg-purple-600 text-white shadow-sm font-black'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-[#1c2c48]'
                    }`}
                    title="All-Time Eternal Leaderboard"
                  >
                    <span>🏛️</span>
                    <span>All-Time</span>
                  </button>

                  {/* Claim Rewards Option */}
                  <button 
                    id="stats-sub-claim-rewards"
                    onClick={() => {
                      setControlledStatsCategory('rewards');
                    }}
                    className={`py-0.5 sm:py-1 px-2.5 sm:px-3 rounded-full font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1 ${
                      controlledStatsCategory === 'rewards'
                        ? 'bg-emerald-600 text-white shadow-sm font-black ring-1 ring-emerald-400/50'
                        : unclaimedSeasonalCount > 0
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40 hover:bg-amber-900/70 animate-pulse font-black'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-[#1c2c48]'
                    }`}
                    title="Claim Seasonal Tier Rewards"
                  >
                    <span>🎁</span>
                    <span>Claim</span>
                    {unclaimedSeasonalCount > 0 && (
                      <span className="bg-amber-400 text-black text-[9px] px-1.5 py-0.2 rounded-full font-black">
                        {unclaimedSeasonalCount}
                      </span>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* RENDER VIEW - EXPANDED WIDTH CONTAINER WITH SYNCHRONIZED BOUNDS */}
      <main className="flex-1 px-3 sm:px-6 md:px-8 lg:px-12 pt-4 sm:pt-6 md:pt-8 flex flex-col items-center w-full max-w-[1720px] 2xl:max-w-[1880px] mx-auto box-border min-h-[calc(100dvh-12rem)] transition-all duration-200">
        {activeView === 'Shop' && (isAdmin || userProfile?.isArmoryStoreEnabled === true || gameState.totalBossesDefeated >= 1 || (gameState.bossKillStats?.['Goblin King'] || 0) >= 1) ? (
          <ShopView
            gameState={gameState}
            setGameState={setGameState}
            controlledCategory={controlledShopCategory}
            onCategoryChange={setControlledShopCategory}
            openCartDrawer={isShopCartDrawerOpen}
            onOpenLoreBook={() => setActiveView('Lore')}
            userProfile={userProfile}
            isAdmin={isAdmin}
          />
        ) : activeView === 'Shop' ? (
          <div className="w-full max-w-2xl mx-auto my-10 bg-linear-to-b from-[#131b2f] via-[#0d1424] to-[#070b14] border-2 border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-center space-y-6">
            <div className="w-20 h-20 bg-amber-500/10 border-2 border-amber-500/40 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-inner animate-pulse">
              🔒
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/30">
                Level 1 Royal Clearance Required
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-mono">
                Royal Armory Store Bridge
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                The Royal Quartermaster reserves checkout voucher keys for proven champions. Defeat the <strong className="text-red-400">Goblin King</strong> in the Boss Rush to establish clearance!
              </p>
            </div>

            {/* Visual Teaser Preview of Gear Packs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="bg-[#0b101d] border border-white/10 rounded-xl p-3 space-y-1 opacity-75">
                <span className="text-2xl">🗡️</span>
                <div className="text-xs font-bold text-white">Weapons</div>
                <div className="text-[10px] text-slate-400">Packs & Shards</div>
              </div>
              <div className="bg-[#0b101d] border border-white/10 rounded-xl p-3 space-y-1 opacity-75">
                <span className="text-2xl">🛡️</span>
                <div className="text-xs font-bold text-white">Defense</div>
                <div className="text-[10px] text-slate-400">Shields & Armor</div>
              </div>
              <div className="bg-[#0b101d] border border-white/10 rounded-xl p-3 space-y-1 opacity-75">
                <span className="text-2xl">✨</span>
                <div className="text-xs font-bold text-white">Utility</div>
                <div className="text-[10px] text-slate-400">Lenses & Dust</div>
              </div>
              <div className="bg-[#0b101d] border border-white/10 rounded-xl p-3 space-y-1 opacity-75">
                <span className="text-2xl">🌀</span>
                <div className="text-xs font-bold text-white">Mystic</div>
                <div className="text-[10px] text-slate-400">Cosmic Relics</div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setActiveView('Game');
                  setControlledGameTab('bosses');
                }}
                className="w-full sm:w-auto px-6 py-3 bg-linear-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-red-600/30 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>⚔️</span>
                <span>Challenge Goblin King Now</span>
              </button>
              <button
                onClick={() => {
                  setActiveView('Game');
                  setControlledGameTab('tycoon');
                }}
                className="w-full sm:w-auto px-5 py-3 bg-[#172238] hover:bg-[#203050] text-[#7ae0ff] border border-[#2a4060] rounded-2xl text-xs font-mono font-bold transition cursor-pointer"
              >
                ← Return to Tycoon Mine
              </button>
            </div>
          </div>
        ) : null}
        {activeView === 'Game' && (
          <GameView
            gameState={gameState}
            setGameState={setGameState}
            initialTab={controlledGameTab}
            activeTab={controlledGameTab}
            onTabChange={setControlledGameTab}
            onOpenLoreBook={(tab, mode) => {
              setActiveView('Lore');
              if (tab && typeof tab === 'string') setControlledLoreTab(tab as any);
              if (mode && typeof mode === 'string') setInitialLoreChronicleMode(mode as any);
            }}
            currentUser={currentUser}
            userProfile={userProfile}
            onOpenAccount={() => setIsAccountOpen(true)}
            cloudLeaderboard={cloudLeaderboard}
            onSyncLeaderboard={syncLeaderboard}
            isSyncingLeaderboard={isSyncingLeaderboard}
            controlledStatsSeason={controlledStatsSeason}
            onStatsSeasonChange={setControlledStatsSeason}
            controlledStatsCategory={controlledStatsCategory}
            onStatsCategoryChange={setControlledStatsCategory}
            onOpenShareCard={handleOpenShareCard}
            onRedeemInviteCode={handleRedeemInviteCode}
          />
        )}
        {activeView === 'Stats' && (
          <GameView
            gameState={gameState}
            setGameState={setGameState}
            initialTab="stats"
            activeTab="stats"
            onTabChange={setControlledGameTab}
            onOpenLoreBook={(tab, mode) => {
              setActiveView('Lore');
              if (tab && typeof tab === 'string') setControlledLoreTab(tab as any);
              if (mode && typeof mode === 'string') setInitialLoreChronicleMode(mode as any);
            }}
            currentUser={currentUser}
            userProfile={userProfile}
            onOpenAccount={() => setIsAccountOpen(true)}
            cloudLeaderboard={cloudLeaderboard}
            onSyncLeaderboard={syncLeaderboard}
            isSyncingLeaderboard={isSyncingLeaderboard}
            controlledStatsSeason={controlledStatsSeason}
            onStatsSeasonChange={setControlledStatsSeason}
            controlledStatsCategory={controlledStatsCategory}
            onStatsCategoryChange={setControlledStatsCategory}
            onOpenShareCard={handleOpenShareCard}
            onRedeemInviteCode={handleRedeemInviteCode}
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
            initialChronicleMode={initialLoreChronicleMode}
          />
        )}
        {activeView === 'Partners' && (
          <PartnersView
            gameState={gameState}
            setGameState={setGameState}
          />
        )}
      </main>

      {/* GLOBAL FOOTER WITH RAPPORTVERSE COPYRIGHT & AFFILIATION */}
      <Footer
        onNavigate={(v) => {
          setActiveView(v as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenTour={startTour}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenInstall={() => setIsPWAInstallOpen(true)}
        onOpenChangelog={() => setIsChangelogOpen(true)}
        isAdmin={isAdmin}
        currentUser={currentUser}
      />

      {/* DYNAMIC CHANGELOG & UPDATES */}
      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
        isAdmin={isAdmin}
        user={currentUser}
        isBeta={isBeta}
        onToggleBeta={(enabled) => {
          setIsBeta(enabled);
          setBetaTesterMode(enabled);
        }}
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
        onOpenShareCard={handleOpenShareCard}
      />

      {/* DYNAMIC VECTOR SVG SHARE CARD STUDIO MODAL */}
      <ShareCardModal
        isOpen={isShareCardOpen}
        onClose={() => setIsShareCardOpen(false)}
        gameState={gameState}
        userProfile={userProfile}
        defaultView={shareCardDefaultView}
        bossData={shareCardBossData}
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

      {/* INCOMING DEEP TAG CHAMPION / SQUAD WELCOME TOAST BANNER */}
      {deepTagWelcome && (
        <div 
          onClick={() => {
            setIsAccountOpen(true);
            setDeepTagWelcome(null);
          }}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[350] w-11/12 max-w-lg bg-gradient-to-r from-cyan-900 via-indigo-900 to-cyan-950 text-white font-mono text-xs px-4 py-3 rounded-2xl shadow-[0_10px_40px_rgba(6,182,212,0.4)] border-2 border-cyan-400 flex items-center justify-between gap-3 animate-fadeIn cursor-pointer hover:border-cyan-300 transition-all select-none"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl shrink-0">✨</span>
            <div className="truncate">
              <div className="font-black text-cyan-200 truncate">{deepTagWelcome}</div>
              <div className="text-[10px] text-cyan-400 font-bold underline">Tap to open Squad &amp; Account Portal ▶</div>
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setDeepTagWelcome(null); }}
            className="text-slate-400 hover:text-white font-black text-sm p-1 shrink-0"
            title="Dismiss Welcome"
          >
            ✕
          </button>
        </div>
      )}

      {/* FLOATING BOUNTY UNLOCKED TOAST BANNER */}
      {bountyToast && (
        <div 
          onClick={() => {
            setActiveView('Game');
            setControlledGameTab('stats');
            setControlledStatsCategory('rewards');
            setBountyToast(null);
          }}
          className="fixed top-20 right-4 sm:right-6 z-[300] max-w-sm sm:max-w-md bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-mono font-black text-xs px-4 py-3 rounded-2xl shadow-[0_10px_35px_rgba(245,158,11,0.5)] border-2 border-yellow-200 flex items-center gap-3 animate-bounce cursor-pointer hover:scale-105 transition-all select-none"
        >
          <span className="text-2xl shrink-0">🎁</span>
          <div className="flex-1 min-w-0">
            <div className="uppercase tracking-wider font-black text-xs text-slate-950 font-mono leading-tight">{bountyToast}</div>
            <div className="text-[10px] text-slate-900 font-bold underline mt-0.5">Click to Open Seasonal Bounties ▶</div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setBountyToast(null); }}
            className="ml-1 text-slate-950 hover:text-white font-black text-sm p-1 shrink-0"
            title="Dismiss Toast"
          >
            ✕
          </button>
        </div>
      )}

      {/* CLOUD SAVE CONFLICT OVERLAY MODAL */}
      {cloudSaveConflict && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-[500] animate-fadeIn">
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

      {/* GDPR COOKIE & PRIVACY CONSENT BANNER & MODAL */}
      <CookieConsentBanner />

      {/* DYNAMIC PARTICLE BURST ENGINE (VICTORY, DEFEAT, PURCHASES, REBIRTH) */}
      <ParticleOverlay />

      {/* UNIVERSAL MOBILE TOUCH & DESKTOP HOVER TOOLTIP ENGINE */}
      <GlobalTouchTooltip />
    </div>
  );
}
