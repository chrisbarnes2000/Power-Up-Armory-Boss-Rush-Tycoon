# Project Structure Directory

Power-Up Armory & RapportVerse Ecosystem Architecture

```
├── /Docs/                      # Technical specification & governance documents
│   ├── README.md               # Developer documentation & ecosystem reference
│   ├── STRUCTURE.md            # Structural layout and dependencies
│   ├── CHANGELOG_DEV.md        # High-frequency developer turn-by-turn changelog
│   ├── CHANGELOG.md            # Customer-facing public milestone release notes
│   ├── /Agent_Instructions/    # Agent execution workflows & engineering governance
│   │   ├── README.md           # Engineering governance and protocol index
│   │   ├── PROJECT_INSTRUCTIONS.md # Agent workflow, Power of 10 rules & WCAG guidelines
│   │   ├── ITIL_GOVERNANCE.md  # ITIL v4 Service Management & Change Enablement Policy
│   │   ├── FSD_SPECIFICATION.md# Functional Specification Standard (IEEE 830 & Stanford FSD)
│   │   ├── DELEGATION_AND_CHECKIN.md # 5-Point Delegation Checklist & Check-In Protocol
│   │   └── SPRINT_CEREMONIES.md# Agile Sprint Ceremonies, Story Point Estimation & Retrospective Engine
│   ├── /Audits/                # System audits, quality scorecards & NASA JPL evaluations
│   │   ├── INDEX_AUDIT.md      # Master audit index and status overview
│   │   ├── NASA_JPL_POWER_OF_10.md # NASA JPL Power of 10 safety scorecard
│   │   ├── WCAG_ACCESSIBILITY_AUDIT.md # WCAG 2.1/2.2 AA accessibility evaluation
│   │   └── MODULARITY_SCORECARD.md # Component line count ceilings & maintainability metrics
│   ├── /Roadmaps/              # Milestone horizons & release plans
│   │   └── INDEX_ROADMAP.md    # Active horizon roadmap & archived milestone log
│   ├── /LoreBook/              # In-game lore book & compendium
│   │   ├── README.md           # Lore book master compendium index
│   │   ├── SUMMARY.md          # GitBook-compliant summary manifest
│   │   ├── /bosses/            # Boss threat classifications & tactical dossiers
│   │   ├── /chronicles/        # Canonical war chronicles & campaign eras
│   │   ├── /items/             # Power-up items directory & mechanical lore
│   │   └── /systems/           # Realm systems, currency economies & world laws
│   └── /PublicRelations/       # Public relations, ecosystem partnerships & marketing
│       ├── BRAND_BRIEF.md      # Brand promise, positioning & strategy
│       ├── INDEX_MARKETING.md  # Social broadcast copy & distribution matrix
│       ├── RapportVersePartnership.md # Proud Partner of RapportVerse affiliation document
│       └── PowerUpBossTycoonPartnership.md # Official affiliate, sponsor & partner one-sheet kit
├── /public/                    # Static public web assets
│   ├── favicon.svg             # Multi-layer SVG favicon
│   ├── apple-touch-icon.svg    # iOS Safari bookmark icon
│   ├── icon-192.svg            # Android PWA launcher icon
│   ├── icon-512.svg            # Android splash screen icon
│   ├── icon-maskable.svg       # Android adaptive maskable icon
│   ├── site.webmanifest        # W3C Web App Manifest
│   ├── manifest.json           # Manifest alias
│   ├── browserconfig.xml       # Windows live tile configuration
│   ├── robots.txt              # Search and AI bot indexing configuration
│   ├── llms.txt                # LLM system architecture documentation
│   ├── llm.txt                 # LLM brief pointer
│   ├── sitemap.xml             # XML sitemap
│   ├── 400.html                # Standalone Bad Request error page
│   ├── 404.html                # Standalone Not Found error page
│   └── 500.html                # Standalone Server Error page
├── /src/
│   ├── /config/
│   │   └── appConfig.ts        # Centralized application configuration (version, release, branding, partnership)
│   ├── /data/
│   │   ├── tourSteps.ts        # Express 5-Step & Grand 20-Step walkthrough step configurations
│   │   └── seasonalRewards.ts  # Monthly & yearly reward tiers, prize currencies & criteria
│   ├── /components/            # UI Components and views
│   │   ├── /admin/             # Modular admin console subcomponents
│   │   ├── /game/              # Boss Rush gauntlet, tycoon & leaderboard subcomponents
│   │   │   └── /leaderboard/   # Modular seasonal rankings, reward claims & boss specialists
│   │   ├── /tour/              # Interactive onboarding walkthrough subcomponents
│   │   ├── /account/           # Modular profile stats, guest auth & local data reset options
│   │   ├── /shop/              # Modular shopping carts, navigation bars, and item card subcomponents
│   │   ├── /lore/              # Modular item directory, boss dossiers & campaign quill tabs
│   │   ├── ShopView.tsx        # Armory Storefront orchestrator, coordinating cart and grids
│   │   ├── GameView.tsx        # Real-time Boss Rush gauntlet, tycoon mining & key redemption
│   │   ├── LoreBookView.tsx    # Interactive Lore Book layout coordinator, binding tab subcomponents
│   │   ├── AdminModal.tsx      # Admin panel for debugging, score resets & telemetry
│   │   ├── AccountModal.tsx    # Profile coordinator orchestrating logins and cloud data syncing
│   │   ├── GuidedTour.tsx      # Interactive walkthrough orchestrator shell
│   │   ├── FontScaleControl.tsx# Accessibility font scalar controls
│   │   └── Footer.tsx          # Global ecosystem footer with RapportVerse partnership & copyright
│   ├── /lib/
│   │   └── firebase.ts         # Firebase Auth and Firestore configuration & error handlers
│   ├── /utils/
│   │   ├── combatEngine.ts     # Centralized combat turn, damage mitigation & boss scaling calculators
│   │   ├── shopUtils.ts        # Shared pack calculators, greedy optimizations, and bridge key encoders
│   │   ├── generateDocs.ts     # Automated static lore book markdown generator
│   │   └── markdownExporter.ts # Markdown builders & client-side ZIP packaging engine
│   ├── App.tsx                 # Central React entry point, auth listener & route switcher
│   ├── data.ts                 # Items, bosses, pack configurations & stat calculation formulas
│   ├── loreData.ts             # Item lore lorebooks, boss dossiers & canonical war chronicles
│   ├── types.ts                # TypeScript domain types, models & interfaces
│   ├── main.tsx                # React DOM render root
│   └── index.css               # Global Tailwind CSS imports
│   index.html                  # HTML5 entry with favicons, OpenGraph & JSON-LD
│   package.json                # Project script configuration & dependencies
│   vite.config.ts              # Vite bundling configuration
│   tsconfig.json               # TypeScript strict compiler options
│   firestore.rules             # Cloud Firestore security rules
└── metadata.json               # Platform metadata and frame permissions
```
