import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import ShopView from './components/ShopView';
import GameView from './components/GameView';
import LoreBookView from './components/LoreBookView';
import AdminModal from './components/AdminModal';
import AccountModal from './components/AccountModal';
import GuidedTour, { TourStep } from './components/GuidedTour';
import FontScaleControl from './components/FontScaleControl';
import Footer from './components/Footer';
import { GameState, LeaderboardEntry, UserProfile } from './types';
import { POWERUPS, BOSSES, calculatePowerScore } from './data';

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
  customStories: []
};

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

  // --- SCROLL DETECTION FOR DYNAMIC COMPACT NAVBAR ---
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- GUIDED TOUR ENGINE (SHORT / FULL / SKIP) ---
  const [isTourActive, setIsTourActive] = useState(false);

  // Controlled sub-tabs across pages
  const [controlledLoreTab, setControlledLoreTab] = useState<'compendium' | 'bosses' | 'systems' | 'calculator' | 'story'>('compendium');
  const [controlledShopCategory, setControlledShopCategory] = useState<'weapons' | 'defense' | 'utility' | 'mystic'>('weapons');
  const [controlledGameTab, setControlledGameTab] = useState<'tycoon' | 'bosses' | 'stats'>('tycoon');
  const [isShopCartDrawerOpen, setIsShopCartDrawerOpen] = useState(false);

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
        } catch (err) {
          console.warn('Error fetching user profile:', err);
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
              return { ...boss, defeated: false, respawnTime: undefined };
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
      await setDoc(doc(db, 'leaderboard', currentUser.uid), entry, { merge: true });

      // Update user doc with latest stats
      await setDoc(doc(db, 'users', currentUser.uid), {
        userId: currentUser.uid,
        email: currentUser.email || '',
        displayName: nameToUse,
        avatar: avatarToUse,
        title: titleToUse,
        powerScore: currentPowerScore,
        totalBossesDefeated: bossesDefeated,
        coins: goldCoins,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setGameState(prev => ({ ...prev, powerScore: currentPowerScore }));
    } catch (err) {
      console.error('Error syncing leaderboard:', err);
      handleFirestoreError(err, OperationType.WRITE, `leaderboard/${currentUser.uid}`);
    } finally {
      setIsSyncingLeaderboard(false);
    }
  }, [currentUser, userProfile, gameState]);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-[#d0e0ff] flex flex-col font-sans select-none" style={{ backgroundImage: 'radial-gradient(ellipse at 20% 20%, #151f35 0%, #0a0e1a 70%)' }}>
      
      {/* GLOBAL NAVBAR - STICKY HEADER */}
      <header 
        id="global-navbar" 
        className={`sticky top-0 z-50 flex flex-col sm:flex-row items-center justify-between px-3 sm:px-6 md:px-8 border-b border-white/10 bg-[#0a0e1a]/95 backdrop-blur-md shadow-lg shadow-black/50 gap-1.5 sm:gap-4 transition-all duration-300 ${
          isScrolled ? 'py-1 sm:py-2 bg-[#080b15]/98 shadow-2xl shadow-black/80' : 'py-3.5 sm:py-4'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <span className={`transition-all duration-300 ${isScrolled ? 'text-2xl' : 'text-3xl'}`}>⚔️</span>
          <div>
            <h1 className={`font-black uppercase tracking-wider font-mono text-[#7ae0ff] transition-all duration-300 ${isScrolled ? 'text-sm sm:text-base' : 'text-lg'}`}>
              POWER-UP ARMORY
            </h1>
            {!isScrolled && (
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold hidden sm:block">
                GAMIFIED TYCOON COMMERCE
              </p>
            )}
          </div>
        </div>

        {/* View Toggle Panel */}
        <div className={`flex bg-[#141c30] border border-[#2a4060] rounded-[40px] shadow-inner flex-wrap justify-center gap-1 sm:gap-0 transition-all duration-300 ${isScrolled ? 'p-0.5' : 'p-1'}`}>
          <button 
            id="nav-tab-lore"
            onClick={() => setActiveView('Lore')} 
            className={`rounded-[30px] font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              isScrolled ? 'px-2.5 sm:px-4 py-1 sm:py-1.5' : 'px-4 sm:px-6 py-2'
            } ${activeView === 'Lore' ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <span>📖</span>
            <span className={isScrolled ? 'hidden md:inline' : 'inline'}>Lore Book</span>
            {isScrolled && <span className="md:hidden">Lore</span>}
          </button>
          <button 
            id="nav-tab-shop"
            onClick={() => setActiveView('Shop')} 
            className={`rounded-[30px] font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              isScrolled ? 'px-2.5 sm:px-4 py-1 sm:py-1.5' : 'px-4 sm:px-6 py-2'
            } ${activeView === 'Shop' ? 'bg-[#2a4060] text-[#d0e8ff] shadow-md shadow-blue-500/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <span>🏪</span>
            <span className={isScrolled ? 'hidden md:inline' : 'inline'}>Armory Store</span>
            {isScrolled && <span className="md:hidden">Store</span>}
          </button>
          <button 
            id="nav-tab-game"
            onClick={() => setActiveView('Game')} 
            className={`rounded-[30px] font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              isScrolled ? 'px-2.5 sm:px-4 py-1 sm:py-1.5' : 'px-4 sm:px-6 py-2'
            } ${activeView === 'Game' ? 'bg-[#2a4060] text-[#d0e8ff] shadow-md shadow-blue-500/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <span>🎮</span>
            <span className={isScrolled ? 'hidden md:inline' : 'inline'}>Boss Rush Game</span>
            {isScrolled && <span className="md:hidden">Boss Rush</span>}
          </button>
          <button 
            id="nav-tab-stats"
            onClick={() => setActiveView('Stats')} 
            className={`rounded-[30px] font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              isScrolled ? 'px-2.5 sm:px-4 py-1 sm:py-1.5' : 'px-4 sm:px-6 py-2'
            } ${activeView === 'Stats' ? 'bg-[#2a4060] text-[#d0e8ff] shadow-md shadow-blue-500/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <span>📊</span>
            <span className={isScrolled ? 'hidden md:inline' : 'inline'}>Rank & Stats</span>
            {isScrolled && <span className="md:hidden">Rank</span>}
          </button>
        </div>

        {/* Header Action Portal */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-end">
          {/* Dynamic Font Scale Slider Control */}
          <FontScaleControl />

          {/* 20-Step Guided Tour Trigger Button */}
          <button
            id="header-guided-tour-btn"
            onClick={startTour}
            className="px-3 sm:px-4 py-2 rounded-full bg-linear-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-xs text-amber-300 hover:text-amber-200 font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-amber-500/10"
            title="Start 20-Step Guided Tour across all 4 pages and sub-tabs"
          >
            <span className="text-sm animate-pulse">🧭</span>
            <span className="hidden xs:inline">Tour (20 Steps)</span>
          </button>

          {/* Champion Account Button */}
          {currentUser ? (
            <button
              id="header-account-btn"
              onClick={() => setIsAccountOpen(true)}
              className="px-3.5 sm:px-4 py-2 rounded-full bg-blue-950/50 hover:bg-blue-900/70 border border-blue-500/40 text-xs text-blue-200 hover:text-white font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
              title="Open Champion Account Details"
            >
              <span className="text-base">{userProfile?.avatar || '⚔️'}</span>
              <span className="font-mono truncate max-w-[90px] sm:max-w-[120px]">
                {userProfile?.displayName || currentUser.displayName || gameState.playerName}
              </span>
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono hidden sm:inline">
                {calculatePowerScore(gameState)} PS
              </span>
            </button>
          ) : (
            <button
              id="header-account-btn"
              onClick={() => setIsAccountOpen(true)}
              className="px-3.5 sm:px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-xs text-white font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20 uppercase tracking-wider"
              title="Sign in with Email or Google to link account"
            >
              <span>🔑</span>
              <span>Sign In</span>
            </button>
          )}

          {/* Admin Panel Chip (Only shown if user has isAdmin flag in auth details or firestore profile) */}
          {isAdmin && (
            <button
              id="header-admin-button"
              onClick={() => setIsAdminOpen(true)}
              className="px-3 sm:px-4 py-2 rounded-full bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-xs text-red-300 hover:text-white font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>⚙️</span>
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Sync Info */}
          <div className="text-right hidden lg:block">
            <p className="text-xs text-white/40 uppercase tracking-widest font-bold">FIREBASE</p>
            <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {currentUser ? 'Account Linked' : 'Cloud Ready'}
            </p>
          </div>
        </div>
      </header>

      {/* RENDER VIEW - EXPANDED WIDTH CONTAINER */}
      <main className="flex-1 px-3 sm:px-6 md:px-8 lg:px-12 flex flex-col items-center w-full max-w-[1720px] 2xl:max-w-[1880px] mx-auto">
        {activeView === 'Shop' && (
          <ShopView
            gameState={gameState}
            setGameState={setGameState}
            controlledCategory={controlledShopCategory}
            onCategoryChange={setControlledShopCategory}
            openCartDrawer={isShopCartDrawerOpen}
            onOpenLoreBook={() => setActiveView('Lore')}
          />
        )}
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
      />

      {/* ADMINISTRATIVE OVERLAY */}
      <AdminModal 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        gameState={gameState} 
        setGameState={setGameState} 
        cloudLeaderboard={cloudLeaderboard}
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
      />
    </div>
  );
}
