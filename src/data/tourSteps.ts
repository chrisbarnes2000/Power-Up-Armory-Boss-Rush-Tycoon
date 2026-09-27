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

// --- 🎁 ONE-TIME TOUR COMPLETION BONUSES ---
export const TOUR_BONUSES = {
  short: {
    coins: 1000,
    gems: 100,
    label: '+1,000 Gold Coins & +100 Gems',
    title: '⚡ Express Tour Onboarding Bonus'
  },
  full: {
    coins: 5000,
    gems: 500,
    label: '+5,000 Gold Coins & +500 Gems',
    title: '📜 Grand Tour Master Onboarding Bonus'
  }
};

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
