# Project Structure Directory

Power-Up Armory & RapportVerse Ecosystem Architecture

```
├── /Docs/                      # Technical specification documents
│   ├── README.md               # Developer documentation & ecosystem reference
│   ├── STRUCTURE.md            # Structural layout and dependencies
│   ├── CHANGELOG_DEV.md        # High-frequency developer turn-by-turn changelog
│   ├── CHANGELOG.md            # Customer-facing public milestone release notes
│   ├── INDEX_ROADMAP.md        # Active horizon roadmap & archived milestone log
│   ├── INDEX_AUDIT.md          # NASA JPL Power of 10 & WCAG audit scorecards
│   ├── INDEX_MARKETING.md      # Ecosystem marketing & social broadcast copy
│   ├── PROJECT_INSTRUCTIONS.md # Agent workflow, Power of 10 rules & WCAG guidelines
│   ├── ITIL_GOVERNANCE.md      # ITIL v4 Service Management & Change Enablement Policy
│   ├── FSD_SPECIFICATION.md    # Functional Specification Standard (IEEE 830 & Stanford FSD)
│   ├── DELEGATION_AND_CHECKIN.md # 5-Point Delegation Checklist & Check-In Protocol
│   ├── SPRINT_CEREMONIES.md    # Agile Sprint Ceremonies, Story Point Estimation & Retrospective Engine
│   ├── PARTNERSHIP.md          # Proud Partner of RapportVerse affiliation document
│   └── /PublicRelations/       # Public relations and ecosystem strategy
│       └── BRAND_BRIEF.md      # Brand promise, positioning & strategy
├── /docs/                      # Lore book & in-game compendium
│   └── /lore-book/             # Boss chronicles, item catalogs & system compendiums
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
│   │   └── tourSteps.ts        # Express 5-Step & Grand 20-Step walkthrough step configurations
│   ├── /components/            # UI Components and views
│   │   ├── /admin/             # Modular admin console subcomponents
│   │   ├── /game/              # Boss Rush gauntlet, tycoon & leaderboard subcomponents
│   │   ├── /tour/              # Interactive onboarding walkthrough subcomponents
│   │   ├── /account/           # Modular profile stats, guest auth & local data reset options
│   │   ├── /shop/              # Modular shopping carts, navigation bars, and item card subcomponents
│   │   ├── ShopView.tsx        # Armory Storefront orchestrator, coordinating cart and grids
│   │   ├── GameView.tsx        # Real-time Boss Rush gauntlet, tycoon mining & key redemption
│   │   ├── LoreBookView.tsx    # Interactive Lore Book, boss profiles & gear compendium
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
