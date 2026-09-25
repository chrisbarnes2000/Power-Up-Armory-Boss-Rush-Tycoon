import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Sparkles, Compass, MapPin, Zap, ScrollText, SkipForward } from 'lucide-react';

export interface TourStep {
  id: string;
  stepNumber: number;
  page: 'Lore' | 'Shop' | 'Game' | 'Stats';
  pageLabel: string;
  subTab?: string;
  subTabLabel?: string;
  title: string;
  description: string;
  targetSelector?: string;
  spotlightHint?: string;
  badgeEmoji: string;
  openCartDrawer?: boolean;
}

// --- ⚡ SHORT EXPRESS TOUR (5 STEPS) ---
export const SHORT_TOUR_STEPS: TourStep[] = [
  {
    id: 'short-step-1-welcome',
    stepNumber: 1,
    page: 'Game',
    pageLabel: 'Global Command',
    subTab: 'tycoon',
    subTabLabel: 'Navigation & Realm',
    title: 'Welcome to Power-Up Armory',
    description: 'Power-Up Armory bridges an idle gold tycoon, boss battles, a retail weapon store, and canonical lore archives into one unified experience.',
    targetSelector: '#global-navbar',
    spotlightHint: 'Use the top navigation bar to switch between Boss Rush, Armory Store, Lore Book, and Rank Stats at any time.',
    badgeEmoji: '⚔️'
  },
  {
    id: 'short-step-2-store',
    stepNumber: 2,
    page: 'Shop',
    pageLabel: 'Armory Store',
    subTab: 'weapons',
    subTabLabel: 'Equipment & Keys',
    title: 'Armory Store & Voucher Keys',
    description: 'Browse weapons, shields, and mystic relics. Add bundle packs to your cart and checkout to generate store bridge voucher keys!',
    targetSelector: '#shop-tab-weapons',
    spotlightHint: 'Single items or bundle packs unlock higher attack damage, defense, and gold production.',
    badgeEmoji: '🗡️'
  },
  {
    id: 'short-step-3-tycoon',
    stepNumber: 3,
    page: 'Game',
    pageLabel: 'Boss Rush Game',
    subTab: 'tycoon',
    subTabLabel: 'Tycoon Economy',
    title: 'Tycoon Engine: Idle Gold & Upgrades',
    description: 'Your inventory automatically produces passive gold coins per second. Click the Gold Core to mine bonus gold and upgrade powerup levels!',
    targetSelector: '#tycoon-bankroll-card',
    spotlightHint: 'Redeem your store receipt keys in the redemption terminal to claim items directly into your game loadout.',
    badgeEmoji: '💰'
  },
  {
    id: 'short-step-4-bosses',
    stepNumber: 4,
    page: 'Game',
    pageLabel: 'Boss Rush Game',
    subTab: 'bosses',
    subTabLabel: 'Boss Combat',
    title: 'Boss Rush Arena: Tactical Battles',
    description: 'Face off against 8 epic arena titans! Your weapons, HP, and defense stats determine your combat strength against boss rage attacks.',
    targetSelector: '#boss-roster-selector',
    spotlightHint: 'Monitor the live battle log to evaluate critical hits and damage numbers in real time.',
    badgeEmoji: '💥'
  },
  {
    id: 'short-step-5-stats',
    stepNumber: 5,
    page: 'Stats',
    pageLabel: 'Rank & Stats',
    subTab: 'stats',
    subTabLabel: 'Hall of Champions',
    title: 'Hall of Champions: Global Ranks',
    description: 'Sync your score to Google Firebase to compete on the global leaderboard! Track your kill records and earn legendary champion titles.',
    targetSelector: '#stats-leaderboard-card',
    spotlightHint: 'You have completed the Express Tour! Choose your gear and conquer the arena!',
    badgeEmoji: '🏆'
  }
];

// --- 📜 FULL GRAND TOUR (20 STEPS) ---
export const TOUR_STEPS: TourStep[] = [
  // --- PART 1: GLOBAL COMMAND & ACCOUNT (STEPS 1-2) ---
  {
    id: 'step-1-welcome',
    stepNumber: 1,
    page: 'Shop',
    pageLabel: 'Global Command',
    subTab: 'weapons',
    subTabLabel: 'Navigation',
    title: 'Welcome to Power-Up Armory',
    description: 'Power-Up Armory bridges a retail e-commerce weapon shop, an idle economy tycoon, an active boss battle arena, and canonical lore archives into one unified experience.',
    targetSelector: '#global-navbar',
    spotlightHint: 'The top navigation bar lets you switch between all 4 operational realms at any time.',
    badgeEmoji: '⚔️'
  },
  {
    id: 'step-2-account',
    stepNumber: 2,
    page: 'Shop',
    pageLabel: 'Champion Portal',
    subTab: 'weapons',
    subTabLabel: 'Cloud Sync',
    title: 'Champion Profile & Cloud Sync',
    description: 'Sign in via Google or Email to link your champion account to Google Firebase. Your Power Score, boss kills, and titles sync in real-time to the global Hall of Champions.',
    targetSelector: '#header-account-btn',
    spotlightHint: 'Guest progress is safely saved on this device until you choose to connect cloud sync.',
    badgeEmoji: '🛡️'
  },

  // --- PART 2: 📖 LORE BOOK (STEPS 3-6) ---
  {
    id: 'step-3-lore-compendium',
    stepNumber: 3,
    page: 'Lore',
    pageLabel: 'Lore Book',
    subTab: 'compendium',
    subTabLabel: 'Artifact Compendium',
    title: 'Lore Book: Power-Up Compendium',
    description: 'Examine fabrication history, elemental origins, power multipliers, and tier classifications for every blade, shield, and mystic relic in the armory.',
    targetSelector: '#lore-tab-compendium',
    spotlightHint: 'Filter by category or search by name to inspect full lore dossiers and tactical stats.',
    badgeEmoji: '📜'
  },
  {
    id: 'step-4-lore-chronicles',
    stepNumber: 4,
    page: 'Lore',
    pageLabel: 'Lore Book',
    subTab: 'chronicles',
    subTabLabel: 'Chronicle Sagas',
    title: 'Lore Book: Chronicle Sagas',
    description: 'Relive canonical chapters of the realm and browse living battle sagas recorded from player encounters. You can also compose new custom lore with the AI Story Weaver!',
    targetSelector: '#lore-tab-chronicles',
    spotlightHint: 'Switch between Canonical Sagas, Living Battle Logs, and the interactive Story Weaver.',
    badgeEmoji: '⚔️'
  },
  {
    id: 'step-5-lore-legend',
    stepNumber: 5,
    page: 'Lore',
    pageLabel: 'Lore Book',
    subTab: 'legend',
    subTabLabel: 'The Ancient Legend',
    title: 'Lore Book: The Ancient Legend',
    description: 'Discover the founding lore of the Astral Citadel, the Primordial Titan wars, and the ancient pact that created the Power-Up Armory as humanity’s ultimate bulwark.',
    targetSelector: '#lore-tab-legend',
    spotlightHint: 'Explore foundational archives, celestial runes, and the origin mythos.',
    badgeEmoji: '👑'
  },
  {
    id: 'step-6-lore-bestiary',
    stepNumber: 6,
    page: 'Lore',
    pageLabel: 'Lore Book',
    subTab: 'bestiary',
    subTabLabel: 'Boss Bestiary',
    title: 'Lore Book: Boss Bestiary',
    description: 'Consult strategic intelligence dossiers on all 8 realm bosses. Study threat ratings, attack behaviors, elemental vulnerabilities, and battle lore before entering combat.',
    targetSelector: '#lore-tab-bestiary',
    spotlightHint: 'Knowing boss elemental weaknesses is vital before challenging high-tier arena beasts.',
    badgeEmoji: '👹'
  },

  // --- PART 3: 🏪 ARMORY STORE (STEPS 7-12) ---
  {
    id: 'step-7-shop-weapons',
    stepNumber: 7,
    page: 'Shop',
    pageLabel: 'Armory Store',
    subTab: 'weapons',
    subTabLabel: 'Weapons Depot',
    title: 'Armory Store: Offensive Blades & Axes',
    description: 'Browse the Weapons depot for Focus Blades, Rage Axes, and Speed Daggers. Each weapon directly increases your champion attack damage and combat speed in the arena.',
    targetSelector: '#shop-tab-weapons',
    spotlightHint: 'Choose between single purchases or discounted bundle packs for rapid scaling.',
    badgeEmoji: '🗡️'
  },
  {
    id: 'step-8-shop-defense',
    stepNumber: 8,
    page: 'Shop',
    pageLabel: 'Armory Store',
    subTab: 'defense',
    subTabLabel: 'Defense & Aegis',
    title: 'Armory Store: Defense & Protection',
    description: 'Equip Magnetite Shields, Cloaks of Shadows, and Titan Armor. Defense items boost your maximum HP pool and provide damage reduction against devastating boss strikes.',
    targetSelector: '#shop-tab-defense',
    spotlightHint: 'Higher HP pools give your champion the buffer needed to survive boss rage phases.',
    badgeEmoji: '🛡️'
  },
  {
    id: 'step-9-shop-utility',
    stepNumber: 9,
    page: 'Shop',
    pageLabel: 'Armory Store',
    subTab: 'utility',
    subTabLabel: 'Tactical Utility',
    title: 'Armory Store: Tactical Accessories',
    description: 'Equip Laser Lenses, Phantom Dust, and Dragon Scales. Tactical accessories boost critical hit chance, coin discovery rates, and passive generation multipliers.',
    targetSelector: '#shop-tab-utility',
    spotlightHint: 'Utility items form the backbone of high-efficiency idle gold production.',
    badgeEmoji: '⚡'
  },
  {
    id: 'step-10-shop-mystic',
    stepNumber: 10,
    page: 'Shop',
    pageLabel: 'Armory Store',
    subTab: 'mystic',
    subTabLabel: 'Mystic Relics',
    title: 'Armory Store: Primordial Mystic Relics',
    description: 'Harness celestial power with Phoenix Feathers, Void Orbs, and Star Fragments. Mystic items grant legendary perks like automatic combat revives and massive score multipliers.',
    targetSelector: '#shop-tab-mystic',
    spotlightHint: 'Phoenix Feathers grant life insurance in the Boss Rush arena when your HP hits zero.',
    badgeEmoji: '🔮'
  },
  {
    id: 'step-11-shop-cart',
    stepNumber: 11,
    page: 'Shop',
    pageLabel: 'Armory Store',
    subTab: 'weapons',
    subTabLabel: 'Cart & Inventory',
    title: 'Armory Store: Cart Inventory & Bundles',
    description: 'Add multiple packs and equipment items to your shopping cart. The floating cart drawer lets you review items, subtotal costs, and checkout in a single unified voucher.',
    targetSelector: '#shop-cart-preview-container',
    spotlightHint: 'Check the cart breakdown at any time by toggling the inventory counter in the header.',
    badgeEmoji: '📦',
    openCartDrawer: true
  },
  {
    id: 'step-12-shop-checkout',
    stepNumber: 12,
    page: 'Shop',
    pageLabel: 'Armory Store',
    subTab: 'weapons',
    subTabLabel: 'Checkout & Keys',
    title: 'Armory Store: Voucher Checkout & Keys',
    description: 'Click Checkout to generate a simulated retail Bridge Key! This unique cryptographic code can be redeemed at in-store terminals or in the Tycoon game to claim your loot.',
    targetSelector: '#shop-checkout-footer',
    spotlightHint: 'Copy your generated bridge key with one click or view past purchases in your archive.',
    badgeEmoji: '🎫'
  },

  // --- PART 4: 🎮 BOSS RUSH GAME (STEPS 13-18) ---
  {
    id: 'step-13-game-tycoon-economy',
    stepNumber: 13,
    page: 'Game',
    pageLabel: 'Boss Rush Game',
    subTab: 'tycoon',
    subTabLabel: 'Economy Engine',
    title: 'Tycoon Engine: Automated Passive Income',
    description: 'Every weapon and relic in your inventory continuously produces gold coins per second. Even when you step away, your armory empire generates wealth automatically!',
    targetSelector: '#tycoon-bankroll-card',
    spotlightHint: 'Watch your Gold Coins and Gems counters climb in real time at the top of the HUD.',
    badgeEmoji: '💰'
  },
  {
    id: 'step-14-game-tycoon-mining',
    stepNumber: 14,
    page: 'Game',
    pageLabel: 'Boss Rush Game',
    subTab: 'tycoon',
    subTabLabel: 'Manual Mining & Upgrades',
    title: 'Tycoon Engine: Gold Mining & Upgrades',
    description: 'Click the Gold Core to actively mine bonus coins and build combo multipliers! Reinvest your gold into leveling up your powerup cards to boost your overall combat Power Score.',
    targetSelector: '#tycoon-mine-container',
    spotlightHint: 'Upgrading powerup levels also accelerates your passive coin generation.',
    badgeEmoji: '⛏️'
  },
  {
    id: 'step-15-game-key-redemption',
    stepNumber: 15,
    page: 'Game',
    pageLabel: 'Boss Rush Game',
    subTab: 'tycoon',
    subTabLabel: 'Key Redemption',
    title: 'Tycoon Engine: Bridge Key Redemption',
    description: 'Enter your store receipt code or admin vouchers into the redemption terminal to instantly transfer purchased weapons and powerups directly into your game inventory.',
    targetSelector: '#game-redeem-container',
    spotlightHint: 'Codes can be entered in uppercase or lowercase; items unlock immediately upon submit.',
    badgeEmoji: '🔑'
  },
  {
    id: 'step-16-game-bosses-roster',
    stepNumber: 16,
    page: 'Game',
    pageLabel: 'Boss Rush Game',
    subTab: 'bosses',
    subTabLabel: 'Boss Arena',
    title: 'Combat Arena: Boss Roster Selection',
    description: 'Select your opponent from 8 fearsome arena bosses. Compare your current Power Score against their recommended combat rating before launching an assault.',
    targetSelector: '#boss-roster-selector',
    spotlightHint: 'Defeating earlier bosses is required to unlock terrifying titans like the Void Dragon.',
    badgeEmoji: '🎯'
  },
  {
    id: 'step-17-game-bosses-combat',
    stepNumber: 17,
    page: 'Game',
    pageLabel: 'Boss Rush Game',
    subTab: 'bosses',
    subTabLabel: 'Active Combat',
    title: 'Combat Arena: Real-Time Battle Simulation',
    description: 'Trigger active attacks, deploy equipped offensive abilities, and monitor both your health and the boss HP bar. Surviving rewards you with huge gold and gem bounties!',
    targetSelector: '#boss-battle-arena',
    spotlightHint: 'Equipped Phoenix Feathers will revive you automatically if you take lethal damage.',
    badgeEmoji: '💥'
  },
  {
    id: 'step-18-game-battle-feed',
    stepNumber: 18,
    page: 'Game',
    pageLabel: 'Boss Rush Game',
    subTab: 'bosses',
    subTabLabel: 'Battle Feed',
    title: 'Combat Arena: Real-Time Combat Feed',
    description: 'The battle log tracks every sword strike, critical roll, damage calculation, and status effect in real time, recording triumphant victories for your chronicle sagas.',
    targetSelector: '#boss-combat-log',
    spotlightHint: 'Review damage numbers to optimize your weapon loadout for difficult encounters.',
    badgeEmoji: '📋'
  },

  // --- PART 5: 📊 RANK & STATS (STEPS 19-20) ---
  {
    id: 'step-19-stats-leaderboard',
    stepNumber: 19,
    page: 'Stats',
    pageLabel: 'Rank & Stats',
    subTab: 'stats',
    subTabLabel: 'Hall of Champions',
    title: 'Rank & Stats: Global Cloud Leaderboard',
    description: 'See where you stand among all realm champions! Sort by overall Power Score, Boss Kills, or Gold Wealth. Hit "Sync Score to Cloud" to update your global standing.',
    targetSelector: '#stats-leaderboard-card',
    spotlightHint: 'Your customized avatar, moniker, and champion title are visible to players worldwide.',
    badgeEmoji: '🏆'
  },
  {
    id: 'step-20-stats-telemetry',
    stepNumber: 20,
    page: 'Stats',
    pageLabel: 'Rank & Stats',
    subTab: 'stats',
    subTabLabel: 'Combat Telemetry',
    title: 'Rank & Stats: Combat Telemetry & Records',
    description: 'Analyze individual boss kill counts, death counts, and battle win rates. You now command every corner of the Power-Up Armory! Ready your blades and conquer the realm!',
    targetSelector: '#stats-telemetry-card',
    spotlightHint: 'You can restart this tour anytime by clicking the "🎯 Tour" button in the top navigation.',
    badgeEmoji: '🌟'
  }
];

interface GuidedTourProps {
  isActive: boolean;
  onClose: () => void;
  onStepChange?: (step: TourStep) => void;
  // Legacy compatibility props
  currentStepIndex?: number;
  onNext?: () => void;
  onPrev?: () => void;
  onJumpToStep?: (index: number) => void;
}

export default function GuidedTour({
  isActive,
  onClose,
  onStepChange,
  currentStepIndex: externalIndex,
  onNext: externalOnNext,
  onPrev: externalOnPrev,
  onJumpToStep: externalOnJump
}: GuidedTourProps) {
  // Mode selection state: 'choice' (Welcome Choice Screen), 'short' (5 Steps), or 'full' (20 Steps)
  const [tourMode, setTourMode] = useState<'choice' | 'short' | 'full'>('choice');
  const [internalStepIndex, setInternalStepIndex] = useState(0);

  // Sync when tour becomes active
  useEffect(() => {
    if (isActive) {
      setTourMode('choice');
      setInternalStepIndex(0);
    }
  }, [isActive]);

  const activeSteps = tourMode === 'short' ? SHORT_TOUR_STEPS : TOUR_STEPS;
  const stepIndex = externalIndex !== undefined ? externalIndex : internalStepIndex;
  const currentStep = activeSteps[stepIndex] || activeSteps[0];
  const totalSteps = activeSteps.length;
  const progressPercent = Math.round(((stepIndex + 1) / totalSteps) * 100);

  // Notify parent component on step change
  useEffect(() => {
    if (isActive && tourMode !== 'choice' && currentStep && onStepChange) {
      onStepChange(currentStep);
    }
  }, [isActive, tourMode, stepIndex, currentStep, onStepChange]);

  // Smooth scroll and visual beacon effect on targeted element
  useEffect(() => {
    const clearSpotlights = () => {
      document.querySelectorAll('.tour-spotlight-active').forEach(el => {
        el.classList.remove('tour-spotlight-active');
      });
    };

    // Always clean up existing spotlight highlights on step/mode/activity state change
    clearSpotlights();

    if (!isActive || tourMode === 'choice' || !currentStep?.targetSelector) {
      return;
    }

    const timer = setTimeout(() => {
      clearSpotlights();
      const element = document.querySelector(currentStep.targetSelector!);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('tour-spotlight-active');
      }
    }, 180);

    return () => {
      clearTimeout(timer);
      clearSpotlights();
    };
  }, [isActive, tourMode, stepIndex, currentStep?.targetSelector]);

  const handleSelectMode = (mode: 'short' | 'full') => {
    setTourMode(mode);
    setInternalStepIndex(0);
  };

  const handleNext = () => {
    if (externalOnNext) {
      externalOnNext();
    } else {
      if (stepIndex < totalSteps - 1) {
        setInternalStepIndex(prev => prev + 1);
      } else {
        onClose();
      }
    }
  };

  const handlePrev = () => {
    if (externalOnPrev) {
      externalOnPrev();
    } else {
      if (stepIndex > 0) {
        setInternalStepIndex(prev => prev - 1);
      } else {
        // Return to Choice Screen on Back from Step 1
        setTourMode('choice');
      }
    }
  };

  const handleJump = (idx: number) => {
    if (externalOnJump) {
      externalOnJump(idx);
    } else {
      setInternalStepIndex(idx);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (tourMode === 'choice') {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, tourMode, stepIndex, totalSteps]);

  if (!isActive) return null;

  return (
    <aside 
      aria-label="Guided Tour Dialog"
      className="fixed inset-x-0 bottom-4 sm:bottom-6 z-[999] flex justify-center px-3 pointer-events-none animate-fadeIn"
    >
      <div 
        id="guided-tour-card"
        className="w-full max-w-2xl bg-[#0e1626]/98 border-2 border-[#3b5985] rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(59,130,246,0.25)] backdrop-blur-2xl pointer-events-auto p-4 sm:p-5 flex flex-col gap-3 text-slate-200 transition-all duration-300"
      >
        {/* --- 1. WELCOME MODE SELECTION SCREEN (FIRST STEP) --- */}
        {tourMode === 'choice' ? (
          <div className="space-y-4 my-1">
            {/* Header & Title */}
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl animate-bounce">🧭</span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white font-mono uppercase tracking-wider flex items-center gap-2">
                    Welcome to Power-Up Armory
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">
                    Choose your tour experience or skip directly to the game:
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Close Tour (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3 Interactive Choice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Option 1: Express Short Tour (5 Steps) */}
              <button
                onClick={() => handleSelectMode('short')}
                className="bg-linear-to-b from-amber-950/50 via-[#141d30] to-[#0e1626] border-2 border-amber-500/50 hover:border-amber-400 p-3.5 rounded-2xl text-left transition hover:scale-[1.02] cursor-pointer flex flex-col justify-between group shadow-lg shadow-amber-950/20"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">⚡</span>
                    <span className="text-[10px] font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5" />
                      5 Steps • 1 Min
                    </span>
                  </div>
                  <h4 className="font-black text-sm text-white group-hover:text-amber-300 transition">Express Tour</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Quick highlight of store items, tycoon gold yield, boss battles, and cloud rank stats.
                  </p>
                </div>
                <div className="mt-3.5 pt-2 border-t border-amber-500/20 text-xs text-amber-400 font-bold flex items-center justify-between font-mono">
                  <span>Start Short Tour</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </button>

              {/* Option 2: Full Grand Tour (20 Steps) */}
              <button
                onClick={() => handleSelectMode('full')}
                className="bg-linear-to-b from-blue-950/50 via-[#141d30] to-[#0e1626] border-2 border-blue-500/50 hover:border-blue-400 p-3.5 rounded-2xl text-left transition hover:scale-[1.02] cursor-pointer flex flex-col justify-between group shadow-lg shadow-blue-950/20"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">📜</span>
                    <span className="text-[10px] font-mono font-black bg-blue-500/20 text-blue-300 border border-blue-400/40 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <ScrollText className="w-2.5 h-2.5" />
                      20 Steps • 5 Min
                    </span>
                  </div>
                  <h4 className="font-black text-sm text-white group-hover:text-blue-300 transition">Full Grand Tour</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Complete masterclass across all 4 operational realms, lore sagas, bestiary, and cart options.
                  </p>
                </div>
                <div className="mt-3.5 pt-2 border-t border-blue-500/20 text-xs text-blue-400 font-bold flex items-center justify-between font-mono">
                  <span>Start Full Tour</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </button>

              {/* Option 3: Skip Tour */}
              <button
                onClick={onClose}
                className="bg-linear-to-b from-slate-900 via-[#141d30] to-[#0e1626] border-2 border-slate-700 hover:border-slate-500 p-3.5 rounded-2xl text-left transition hover:scale-[1.02] cursor-pointer flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">⏩</span>
                    <span className="text-[10px] font-mono font-black bg-slate-800 text-slate-300 border border-slate-600 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <SkipForward className="w-2.5 h-2.5" />
                      Skip
                    </span>
                  </div>
                  <h4 className="font-black text-sm text-white group-hover:text-slate-200 transition">Skip & Play</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Skip the guided tour immediately and dive straight into fighting bosses and tycooning.
                  </p>
                </div>
                <div className="mt-3.5 pt-2 border-t border-slate-700/50 text-xs text-slate-400 group-hover:text-white font-bold flex items-center justify-between font-mono">
                  <span>Jump to Game</span>
                  <X className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* --- 2. ACTIVE STEP WALKTHROUGH --- */
          <>
            {/* TOP BAR: BADGE, STEP INDICATOR & CLOSE */}
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl">{currentStep.badgeEmoji}</span>

                {/* Step & Mode Badge */}
                <button
                  onClick={() => setTourMode('choice')}
                  className="px-2.5 py-0.5 rounded-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 text-blue-300 hover:text-white font-mono text-xs font-extrabold uppercase tracking-wider flex items-center gap-1 transition cursor-pointer"
                  title="Click to switch tour mode or change tour length"
                >
                  <Compass className="w-3 h-3" />
                  <span>
                    {tourMode === 'short' ? 'Express Step' : 'Step'} {currentStep.stepNumber} of {totalSteps}
                  </span>
                  <span className="text-[10px] opacity-75 font-normal ml-0.5">({tourMode === 'short' ? '5 Short' : '20 Full'})</span>
                </button>

                <span className="px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-600/40 text-slate-300 font-mono text-xs font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-orange-400" />
                  <span>{currentStep.pageLabel}</span>
                  {currentStep.subTabLabel && (
                    <>
                      <span className="text-slate-500">•</span>
                      <span className="text-amber-300">{currentStep.subTabLabel}</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Close Tour (Esc)"
                  aria-label="Close Tour"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-white/5">
              <div 
                className="bg-linear-to-r from-blue-500 via-indigo-400 to-orange-500 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* TITLE & DESCRIPTION */}
            <div className="space-y-1.5 my-0.5">
              <h3 className="text-base sm:text-lg font-black text-white font-mono flex items-center gap-2 tracking-wide">
                {currentStep.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* SPOTLIGHT TACTICAL HINT */}
            {currentStep.spotlightHint && (
              <div className="px-3 py-1.5 rounded-xl bg-blue-950/40 border border-blue-500/20 text-blue-200/90 text-xs font-mono flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate sm:whitespace-normal">{currentStep.spotlightHint}</span>
              </div>
            )}

            {/* BOTTOM ACTION CONTROLS */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
              {/* Quick Step Selector Dots */}
              <div className="hidden md:flex items-center gap-1 max-w-[200px] overflow-hidden">
                {activeSteps.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => handleJump(idx)}
                    title={`Jump to Step ${idx + 1}: ${s.title}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === stepIndex ? 'w-4 bg-orange-400' : 'w-1.5 bg-slate-700 hover:bg-slate-500'}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                <button
                  onClick={() => setTourMode('choice')}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 font-mono transition cursor-pointer hover:underline flex items-center gap-1"
                  title="Return to Tour Choice Screen"
                >
                  <span>Change Tour</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-white/10 transition flex items-center gap-1 cursor-pointer"
                    title="Previous Step (Left Arrow)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">{stepIndex === 0 ? 'Tour Options' : 'Back'}</span>
                  </button>

                  <button
                    onClick={handleNext}
                    className="px-4 py-2 rounded-xl bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-black uppercase tracking-wider transition shadow-md shadow-orange-600/30 flex items-center gap-1.5 cursor-pointer active:scale-95"
                    title="Next Step (Right Arrow)"
                  >
                    <span>{stepIndex === totalSteps - 1 ? 'Finish Tour' : 'Next Step'}</span>
                    {stepIndex === totalSteps - 1 ? (
                      <Sparkles className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
