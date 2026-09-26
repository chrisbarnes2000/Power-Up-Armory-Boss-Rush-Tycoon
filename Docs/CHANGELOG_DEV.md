# Developer Changelog (`/Docs/CHANGELOG_DEV.md`)

> **CADENCE**: High-Frequency Developer Journal. Updated on every work turn / engineering iteration.

---

## [v1.2.3-dev.1] — 2026-09-26

### Engineering Actions
- **Milestone Iteration & Dev Counter Reset**:
  - Incremented target release milestone from `v1.2.1` to **`v1.2.3`**.
  - Reset high-frequency iteration counter to **`v1.2.3-dev.1`**.
  - Synchronized version across `package.json` (`1.2.3`), `Footer.tsx` (`v1.2.3`), `/Docs/CHANGELOG.md` (`v1.2.3`), and `/Docs/CHANGELOG_DEV.md`.
- **Architectural Decomposition Alignment**:
  - Prepared repository structure and action items for executing the subcomponent decomposition plan across the 6 major monolith files (`GameView.tsx`, `AdminModal.tsx`, `LoreBookView.tsx`, `AccountModal.tsx`, `GuidedTour.tsx`, `ShopView.tsx`).
- **Quality & Verification Gate**:
  - Executed `compile_applet` and `lint_applet` (`tsc --noEmit`) to verify 0 errors.

---

## [v1.2.1-dev.12] — 2026-09-26

### Engineering Actions
- **Horizontal Internal Padding & Spacing Calibration (`App.tsx`, `GameView.tsx`)**:
  - **Files**: `/src/App.tsx`, `/src/components/GameView.tsx`
  - Re-calibrated outer `<main>` container padding to `px-4 sm:px-6 md:px-10 lg:px-16 box-border` for balanced gutter rhythm on ultrawide and tablet screens.
  - Adjusted `GameView` root wrapper horizontal padding to `px-2 sm:px-4 md:px-6 box-border` to prevent card content from pressing against viewport boundaries.
  - Enforced `w-full max-w-full` on active view tab container for consistent layout box models.

- **Quality & Verification Gate**:
  - Executed `compile_applet` and `lint_applet` (`tsc --noEmit`) with 0 errors.

---

## [v1.2.1-dev.11] — 2026-09-26

### Engineering Actions
- **Dynamic Boss Rush Header Sub-Navigation (`App.tsx`, `GameView.tsx`)**:
  - **Files**: `/src/App.tsx`, `/src/components/GameView.tsx`
  - Integrated `#game-sub-tabs` directly into `#global-navbar` when the user is actively on the Boss Rush view (`activeView === 'Game'`).
  - Rendered compact dual pills for **🏪 Tycoon** and **⚔️ Bosses** with responsive labels (`hidden sm:inline`).
  - Removed duplicate `#game-sub-tabs` from inside `GameView.tsx` to streamline the viewport and eliminate redundant navigational bars.

- **Pinned Bottom Bankroll Card HUD (`GameView.tsx`)**:
  - **File**: `/src/components/GameView.tsx`
  - Upgraded `#tycoon-bankroll-card` from sticky positioning to fully pinned fixed bottom positioning (`fixed bottom-0 left-0 right-0 z-40`).
  - Styled with high-contrast gradient (`from-[#1a2540]/99 via-[#131d33]/99 to-[#0f182a]/99`), backdrop blur (`backdrop-blur-2xl`), top border accent, and floating container width (`max-w-[1720px] 2xl:max-w-[1880px] mx-auto`).
  - Added bottom padding cushion (`pb-32`) to the `GameView` content canvas to ensure no cards, bosses, or mining controls are occluded behind the fixed HUD.

- **Quality & Verification Gate**:
  - Executed `compile_applet` and `lint_applet` (`tsc --noEmit`) with 0 errors.

---

## [v1.2.1-dev.10] — 2026-09-26

### Engineering Actions
- **Mobile & Tablet Viewport Overflow Elimination (`App.tsx`, `Footer.tsx`)**:
  - **Files**: `/src/App.tsx`, `/src/components/Footer.tsx`
  - Resolved horizontal viewport spacing and right-hand gap on mobile and tablet viewports.
  - Applied `w-full max-w-full overflow-x-hidden box-border` to root app wrapper.
  - Enforced `w-full max-w-full box-border` on `header#global-navbar`.
  - Added `box-border` to `<main>` container and `max-w-full box-border` on `footer#app-global-footer` to guarantee zero cross-axis overflow.

- **Quality & Verification Gate**:
  - Executed `compile_applet` and `lint_applet` (`tsc --noEmit`) with 0 errors.

---

## [v1.2.1-dev.9] — 2026-09-26

### Engineering Actions
- **Enhanced Responsive Media Breakpoints & Fluid Typography (`index.css`)**:
  - **File**: `/src/index.css`
  - Configured comprehensive Tailwind v4 `@theme` breakpoints: `--breakpoint-xs: 480px`, `--breakpoint-sm: 640px`, `--breakpoint-md: 768px`, `--breakpoint-lg: 1024px`, `--breakpoint-xl: 1280px`, `--breakpoint-2xl: 1536px`, `--breakpoint-3xl: 1920px`, and `--breakpoint-ultrawide: 2560px`.
  - Added device-aware media query utility classes: `.touch-target-optimized` for coarse touch pointers, `.hover-lift` for fine mouse pointers, and `.retina-crisp` for high-DPI displays.
  - Introduced fluid typography clamp utilities: `.fluid-heading-lg`, `.fluid-heading-md`, and `.fluid-body`.
  - Added `.responsive-grid-auto` layout utility scaling dynamically for standard displays up through 4K / ultrawide monitors.

- **Quality & Verification Gate**:
  - Executed `compile_applet` and `lint_applet` (`tsc --noEmit`) with 0 errors.

---

## [v1.2.1-dev.8] — 2026-09-25

### Engineering Actions
- **Canon Expansion & Lore Data Schema (`loreData.ts`)**:
  - **File**: `/src/loreData.ts`
  - Created structured lore registries for all 15 armory items (`ITEM_LORES`), complete with in-world vendor names, vendor quotes, deliverable echoes, forging records, and tactical boss counter notes.
  - Established 8 Boss Threat Dossiers (`BOSS_DOSSIERS`) with threat classifications (Planetary, Cosmic, Void, Apex, Cataclysm, Eldritch, Dread), combat mechanics, vulnerability indices, and survivor debriefs.
  - Authored 7 canonical War Chronicles (`CANONICAL_CHAPTERS`) documenting the Void Incursion, Dawn of Forging, Siege of Ironspire, and Battle for the Cosmos.

- **Quality & Verification Gate**:
  - Executed `compile_applet` and `lint_applet` (`tsc --noEmit`) with 0 errors.

---

## [v1.2.1-dev.7] — 2026-09-25

### Engineering Actions
- **Interactive Lore Book Compendium & Client-Side ZIP Exporter (`LoreBookView.tsx`)**:
  - **File**: `/src/components/LoreBookView.tsx`
  - Integrated 5-tab immersive lore browser: Compendium, Boss Dossiers, Realm Systems, Power Calculator, and War Chronicles.
  - Implemented one-click documentation export (`downloadLoreBookZip`) powered by `JSZip`, bundling complete GitBook-compatible markdown archives directly in the browser.
  - Built interactive Power Scaling & Synergy Calculator allowing real-time stat simulation and boss victory probability calculations.

- **Quality & Verification Gate**:
  - Executed `compile_applet` and `lint_applet` (`tsc --noEmit`) with 0 errors.

---

## [v1.2.1-dev.6] — 2026-09-25

### Engineering Actions
- **Static Lore Book / GitBook Markdown Generator (`generateDocs.ts`, `markdownExporter.ts`)**:
  - **Files**: `/src/utils/generateDocs.ts`, `/src/utils/markdownExporter.ts`, `/docs/lore-book/*`
  - Created standalone generator engine exporting standardized Markdown files with frontmatter metadata.
  - Generated `/docs/lore-book/README.md`, `SUMMARY.md`, 15 item markdown files in `/docs/lore-book/items/`, 8 boss dossiers in `/docs/lore-book/bosses/`, and 7 chronicle chapters in `/docs/lore-book/chronicles/`.
  - Added `slugify()` and markdown formatters for GitBook, Hugo, and Astro static-site generator compatibility.

- **Quality & Verification Gate**:
  - Executed `compile_applet` and `lint_applet` (`tsc --noEmit`) with 0 errors.

---

## [v1.2.1-dev.5] — 2026-09-25

### Engineering Actions
- **Bottom Floating Bankroll Card HUD (`GameView.tsx`)**:
  - **File**: `/src/components/GameView.tsx`
  - Moved `#tycoon-bankroll-card` from top sticky position to sticky bottom floating HUD (`sticky bottom-2 sm:bottom-3 z-40`).
  - Added bottom shadow effect (`shadow-[0_-10px_30px_rgba(0,0,0,0.85)]`) and reduced padding for maximum viewport visibility while scrolling.

- **Condensed Secondary Navigation Sub Tabs (`GameView.tsx`)**:
  - **File**: `/src/components/GameView.tsx`
  - Re-positioned `#game-sub-tabs` to sticky top position directly beneath the main global navbar (`sticky top-[54px] sm:top-[64px] z-30`).
  - Simplified spacing and margins (`p-1 gap-1.5 mb-3.5`) and condensed button heights/padding on `button#game-tab-tycoon` and `button#game-tab-bosses` (`py-2 px-3`).

- **Quality & Verification Gate**:
  - Executed `compile_applet` and `lint_applet` (`tsc --noEmit`) with 0 errors.

---

## [v1.2.1-dev.4] — 2026-09-25

### Engineering Actions
- **Player Death State & Progressive Revive Mechanics**:
  - **Files**: `/src/types.ts`, `/src/data.ts`, `/src/App.tsx`, `/src/components/GameView.tsx`
  - Added `GameBalanceConfig` schema and `isDead`, `reviveCount`, `revivePacks`, `balanceConfig` properties to `GameState`.
  - Updated `fightBoss()` in `GameView.tsx` to prevent fallen champions from entering battles without first reviving.
  - Implemented exponential revive cost scaling: `cost = baseReviveCost * (reviveCostMultiplier ^ reviveCount)` (e.g., 100, 150, 225, 337...).
  - Integrated 1-click Revive Pack consumption (`handleReviveWithPack()`) that bypasses coin scaling penalties and restores full health.
  - Added "Revive Pack" utility item to `POWERUPS` in `src/data.ts`.

- **Probabilistic Boss Drops (Gold & Diamonds)**:
  - **Files**: `/src/components/GameView.tsx`
  - Replaced fixed victory drops with probabilistic dice rolls based on `goldDropChance` (default 70%) and `gemDropChance` (default 35%), modified by `goldMultiplier` and `gemMultiplier`.
  - Updated combat battle logs to itemize exact Gold/Gem drops or indicate when drops fail to roll.

- **Extended Game Balance Admin Panel**:
  - **Files**: `/src/components/AdminModal.tsx`
  - Created **Section 5: Game Balance, Death & Boss Drop Configuration** with real-time sliders for Base Revive Cost, Revive Cost Multiplier, Gold Drop Chance %, Gem Drop Chance %, Gold Multiplier, and Gem Multiplier.
  - Added support buttons: "Grant +5 Revive Packs", "Clear Death & Revive Champion", "Reset Revive Scaling Counter", and "Reset Balance Defaults".

- **Quality & Verification Gate**:
  - Executed `compile_applet` and `lint_applet` (`tsc --noEmit`) with 0 errors.

---

## [v1.2.1-dev.3] — 2026-09-25

### Engineering Actions
- **Global Scrollbar Hiding (`src/index.css`)**:
  - Added CSS rule reset to hide vertical and horizontal scrollbars across WebKit (Chrome, Safari, Opera), Firefox (`scrollbar-width: none`), and IE/Edge (`-ms-overflow-style: none`).
  - Added `.no-scrollbar` utility class for specific scrollable elements while maintaining standard scroll touch and wheel functionality.

- **App Background Canvas Synchronization (`index.html`, `src/index.css`)**:
  - **Files**: `/index.html`, `/src/index.css`
  - **Changes**: Configured `#0a0e1a` dark cosmic background color across `html`, `body`, `#root`, `<meta name="theme-color">`, `<meta name="background-color">`, and `<meta name="apple-mobile-web-app-status-bar-style">`.
  - **Fix**: Added `viewport-fit=cover` and `overscroll-behavior: none` to prevent white background canvas bleed when pinching/zooming out, holding mobile devices sideways in landscape orientation, or overscrolling/rubber-banding.

---

## [v1.2.1-dev.2] — 2026-09-25

### Engineering Actions
- **Governance & Version Logging Protocol Integration**:
  - Updated `/AGENTS.md` and `/Docs/PROJECT_INSTRUCTIONS.md` to enforce the dual-cadence version logging framework (`CHANGELOG_DEV.md` vs `CHANGELOG.md`).
  - Added version drift tracking, social broadcast protocols, and ITIL v4 change enablement requirements.
  - Standardized version numbering across `package.json` (`1.2.1`) and `src/components/Footer.tsx` (`v1.2.1`).

- **Font Scale Accessibility Enhancements (`FontScaleControl.tsx`)**:
  - **File**: `/src/components/FontScaleControl.tsx`
  - **Lines**: 10–20, 88–95, 186–206
  - **Changes**: Lowered `MIN_SCALE` from 85% to 50%. Added quick preset options for `50%` and `75%`.
  - **Layout**: Converted quick preset layout to a 7-column grid (`grid-cols-7`) with `text-[11px]` scaling for clean rendering on mobile devices.
  - **Classification**: Updated `getScaleCategory()` to classify <=60% as "Micro" and <=80% as "Tiny".

---

## [v1.2.1-dev.1] — 2026-09-25

### Engineering Actions
- **Guided Tour Spotlight Ring Cleanup (`GuidedTour.tsx`)**:
  - **File**: `/src/components/GuidedTour.tsx`
  - **Changes**: Created `clearSpotlights()` utility to strip `.tour-spotlight-active` class from all DOM elements upon step transitions, mode switches, or tour completion.
  - **Fix**: Resolved lingering highlight rings on elements such as `#stats-leaderboard-card`.

- **Mobile Navigation & Sticky Bankroll Card Layout (`App.tsx`, `GameView.tsx`)**:
  - Added header scroll detection in `App.tsx` (`isScrolled` state triggered at Y > 30px).
  - Compacted navbar height and tab buttons on scroll to optimize viewport budget on mobile screens.
  - Adjusted sticky padding and header margins for `#tycoon-bankroll-card` to ensure unobstructed view of player stats when scrolling.

- **Combat Log Order & Color Coding (`GameView.tsx`)**:
  - Reversed battle log rendering so the most recent entry displays at the top.
  - Color-coded text logs: Green for victory/gains, Yellow for informational alerts, Red for damage/defeat, White for narrative/purchases.

- **Quality & Verification Gate**:
  - Executed `compile_applet` and `lint_applet` (`tsc --noEmit`) with 0 errors.
