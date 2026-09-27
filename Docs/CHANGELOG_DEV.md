# Developer Changelog (`/Docs/CHANGELOG_DEV.md`)

> **CADENCE**: High-Frequency Developer Journal. Updated on every work turn / engineering iteration.

---

## [v1.3.0-dev.2] — 2026-09-27

### Engineering Actions
- **Reset Cards Height Reduction (`LocalResetOptions.tsx`)**:
  - **Compact Preset Cards**: Reduced the vertical height and padding of the user reset preset cards (`min-h-0`, padding `p-3`, button padding `py-2`), ensuring they fit neatly on all screen sizes without excessive scrolling.
- **Squad Recruitment & Invite Code Bonus System (`SquadRecruitSection.tsx`, `AccountModal.tsx`, `App.tsx`, `types.ts`)**:
  - **Unique Champion Invite Code**: Each player has a personalized squad invite code (`ARMORY-XXXXX`) with one-click clipboard copying and native OS share triggers.
  - **Recruitment Grant (+3,000 Coins & +150 Gems)**: Redeeming a squad invite code grants both players +3,000 Coins and +150 Gems, registered once per account to prevent duplication.
  - **Co-Op Raid & Horde Roadmap Teaser**: Integrated squad recruitment level tracking (`squadRecruitsCount`) and squad formation metadata designed as the foundation for upcoming Co-Op Horde Assaults and multi-champion World Boss raids.
- **PWA Installation Desk & Recurring Monthly Champion Grant (`PWAInstallModal.tsx`, `App.tsx`, `types.ts`)**:
  - **App Installation Desk Overlay**: Built a specialized PWA installation modal with dedicated guides for Chromium (Chrome/Edge desktop & Android) and Apple Safari on iOS. Includes a native `navigator.share` Web Share API trigger for quick "Add to Home Screen" actions on iPhone/iPad.
  - **Recurring Monthly PWA Bonus (5,000 Coins + 250 Gems)**: Added a recurring reward system for PWA champions. Users can claim a monthly bonus of +5,000 Coins and +250 Gems once per calendar month (`pwaBonusClaimedMonth`), tracked across local storage and Firestore cloud synchronizations.
  - **PWA Quick-Access Triggers**: Placed an `App Install 📱` pill trigger in the top navbar and a dedicated `PWA App Installation Guide` link inside the global footer.
- **Horizontal Mobile-Optimized Combat Layout (`BossGauntlet.tsx`)**:
  - **Side-by-Side Arena Healthbars**: Replaced the stacked vertical hero/boss combat bars inside the battle record card with a horizontal, flex-row side-by-side split container separated by a high-intensity centered `VS` arcade badge.
  - **Compact Mobile Constraints**: Designed the horizontal splits to shrink elegantly on mobile screens by reducing text size (`text-[10px]`), compressing margins, and reducing health bar thickness (`h-1.5`) so it fits small mobile viewports flawlessly without log clipping.
- **Arena Sizing Optimizations (`BattleModal.tsx`, `PreFightCoinShop.tsx`)**:
  - **Enlarged BossGauntlet Section**: Substantially scaled up the grand visualization area in `BattleModal`. Emojis boosted from text-4xl to massive text-7xl, text boosted to text-xl font-black, and HP bars expanded from thin h-3 lines into solid, glowing h-5 progress gauges. Centralized VS indicator also enlarged.
  - **Horizontal Flex-Row Mobile Adaptation**: Enforced a `flex-row` side-by-side split row on mobile screens inside `BattleModal`. Responsively scales down emojis (`text-3xl`), names (`text-xs`), and HP bar widths (`max-w-[100px]`) on smaller screens. This ensures the Hero, VS Badge, and Boss are visible side-by-side simultaneously on any phone without vertical overflow.
  - **Compressed Pre-Fight Coin Shop**: Scaled down the coin shop inside the overlay. In compact mode, padding shrinks to a tight p-2, descriptions are toggled off, and products are packed side-by-side inside a responsive grid using p-1.5 buttons to optimize vertical space.
- **Battle Cycling & Consecutive Streak Mechanics (`BattleModal.tsx`, `GameView.tsx`, `types.ts`, `combatEngine.ts`, `data.ts`)**:
  - **Relocated Battle Cycling Deck**: Moved the high-fidelity ready bosses selection deck from the top of the Boss tab directly inside the dynamic, overlaying **`BattleModal` (Arena Combat Modal)**. This ensures perfect visibility of the cycle controls while keeping combat and selection together in one modal.
  - **Inline Attribute Interpolation**: Equipped `BattleModal` to dynamically compute boss scaling thresholds (HP, attack, power requirement overrides) inside the overlay.
  - **Kill v Death Streak Stat Bonuses**: Enabled real-time tracking of player Kill and Death streaks. Consecutively defeating bosses awards a **`+5%` Power Score bonus per stack (up to +50%)**. Consecutively dying to bosses awards a **`+5%` underdog adrenaline boost per stack (up to +30%)**, helping players overcome difficult boss blocks. Shown cleanly in the Pre-Fight status panel.
- **Database Sanitization & Safety Guardrails (`App.tsx`)**:
  - **Firestore Payload Sanitizer**: Implemented `sanitizeForFirestore` to recursively purge any fields containing `undefined` values inside objects and arrays before writing to `user_progress`, `users`, or `leaderboard` collections.
  - **Boss Respawn Time Cleanup**: Swapped `respawnTime: undefined` with a structured destructuring pattern (`const { respawnTime, ...cleanBoss } = boss`) inside the boss auto-replenish loop, preventing state corruption.
- **Combat Simulation Rate Tuning & Battle Indicators (`BossArena.tsx`, `GameView.tsx`)**:
  - **Slower Combat Animation**: Reduced turn progression speed inside `GameView.tsx` from `500ms` down to a rhythmic `1400ms` delay, improving game visibility and allowing for high-end cinematic scaling or 3D view hooks later on.
  - **Attack Next Alert Badge**: Added a visually distinctive "🔥 READY TO FIGHT · ATTACK NEXT 🔥" badge right above the primary combat action button inside the boss arena selection cards when an active, undefeated boss is ready to be challenged.
- **User Moderation Dropdown Consolidation & Layout Alignment (`AdminUserModeration.tsx`, `AdminBalanceConfig.tsx`)**:
  - **Restored Defaults Button**: Moved the `⚙️ Reset Balance Defaults` button back to the footer of the `AdminBalanceConfig` view, allowing quick local restoration of standard mechanical multipliers.
  - **Cohesive dropdown (`z-50`)**: Moved `🧬 Sync God Config` into the newly created `⚙️ More Actions` list dropdown, uniting all four player cloud operations (+5 Revive packs, Clear death, Reset death counters, and Sync god config) in a single overlay.
  - **Mobile Layout Constraints**: Set the absolute dropdown to be left-aligned (`left-0`) on mobile displays to prevent clipping or layout overflow, and right-aligned (`md:right-0 md:left-auto`) on desktop viewports.

## [v1.3.0-dev.1] — 2026-09-27

### Engineering Actions
- **Sandbox Balance Config Synchronization & Account Migration (`AdminUserModeration.tsx`, `AdminBalanceConfig.tsx`, `AdminModal.tsx`)**:
  - **Relocated Local Sandbox Actions**:
    - Shifted all 5 localized character sandbox triggers (Grant +5 Revives, Clear Death & Revive Champion, Reset Revive Counter, Zero Slate Reset, Reset Balance Defaults) from the general Balance Sliders view over to the per-user `Acct Mod & Stats` panel (`AdminUserModeration.tsx`).
  - **Implemented God Config Cloud Sync**:
    - Created a specialized **`🧬 Sync God Config`** trigger alongside each player profile card. Clicking this takes the administrator's active local "god-sandbox" balance settings (`gameState.balanceConfig`) and serializes/pushes it directly into that user's persistent base cloud account in Cloud Firestore, allowing custom balance overrides on any live profile.
- **Lore Book Modular Decomposition (`LoreBookView.tsx`, `/src/components/lore/`)**:
  - **Single-File Complexity Reduced (88% reduction)**:
    - Slashed the monolithic `LoreBookView.tsx` from **1,344 lines to 157 lines** of high-efficiency routing and layout orchestration.
  - **Modular Architecture Decomposed**:
    - Decoupled primary tab view segments into a standalone `/src/components/lore/` subfolder housing five single-responsibility modules:
      1. `ChroniclesTab.tsx` — Manages the Canonical historical chapter grid (Chapters I-VII) alongside player database records and live boss kill/death counts.
      2. `StoryWeaverTab.tsx` — Isolates the RPG Sandbox creative writer form with automatic layout-drafting templates and Firestore binding connections.
      3. `ItemCompendiumTab.tsx` — Encompasses the filtered search list of the 16 primary items, active stat calculations, and single-item Markdown file downloading triggers.
      4. `BossBestiaryTab.tsx` — Hosts the Threat Registry sidebar, health comparisons, weaknesses grids, and optimal weapon recommendations.
      5. `AncientLegendTab.tsx` — Renders the currencies, alchemical packaging nomenclatures, and mathematical yield formula indices.
  - **Type Safety & Compiler Compliance**:
    - Cast `Object.values` arrays as strict `number[]` inside `ChroniclesTab.tsx` to prevent compiler evaluation issues on key indices.

---

## [v1.2.6-dev.1] — 2026-09-26

### Engineering Actions
- **Shop System Decoupling & Modularization (`ShopView.tsx`, `src/utils/shopUtils.ts`, `src/components/game/TycoonGrid.tsx`)**:
  - **Logic Consolidation**:
    - Removed inline math/helper functions (`getPackUnits`, `getItemTotalUnits`, `optimizeCartForItem`) inside `ShopView.tsx`.
    - Re-routed all components and grids (including `TycoonGrid.tsx`) to pull helper functions from the shared logic file `src/utils/shopUtils.ts`.
  - **Modular Architecture Refactored**:
    - Mounted the standalone `<ShopCategoryNav>` inside the categories segment, enabling seamless, dynamic category listings and counts.
    - Replaced the inline cart preview with the optimized, high-fidelity `<ShopCartDrawer>` component.
    - Shifted the dense map loops rendering individual items inside the grid to the independent `<ShopItemCard>` subcomponent.
  - **Line-Count Decreased**:
    - Slashed `ShopView.tsx` file density from **733 lines to 290 lines** (over a 60% reduction in complexity) for unmatched readability and maintainability.
  - **Padding & Margin Consolidation**:
    - Removed redundant margins and padding overlaps inside `<ShopCategoryNav>` (removing nested `mb-6` spacing and narrowing horizontal item gaps to `gap-2 sm:gap-3`).
    - Tightened `<ShopItemCard>` padding from `p-5` to `p-4` to present a clean, high-density dashboard.
    - Reduced outer wrapper padding from `p-4 md:p-8` to `p-4 md:p-6` and margins around the header/navigation containers to `mb-6` / `mb-4`.
    - Consolidated `<ShopItemCard>` header layout from double stacked rows to a unified, left-aligned emoji flex grid with nested item name, tooltip trigger, and rarity badges, decreasing card height and layout density.
    - Escalated the Armory header title text size inside `ShopView.tsx` from `text-[10px] sm:text-xs` to `text-xs sm:text-sm md:text-base` alongside extra letter-tracking (`tracking-widest font-black`).
    - Aligned `<ShopCategoryNav>` categories to start-alignment on mobile (`justify-start px-2`) while keeping center alignment on desktops (`sm:justify-center`), resolving pill clipping on small viewports.
- **Account Modal Decomposition & Layout Standardization (`AccountModal.tsx`, `/src/components/account/`)**:
  - **Modular Architecture Decomposed**:
    - Extracted core views and logic into a dedicated subcomponent directory `/src/components/account/` with five single-responsibility subcomponents:
      1. `LiveHeroStats.tsx` — Renders the player overall combat stat panels (Power Score, Bosses slain, and gold hoard).
      2. `AccountQuickBadge.tsx` — Encompasses player name, title tags, verified status, and cloud controls (Sign Out & Sync Leaderboard).
      3. `EditProfileForm` — Integrates avatar crest choices, customizable heroic names, and selection of titles.
      4. `GuestAuthForm` — Manages Google and email authorization tabs and credential entry.
      5. `LocalResetOptions` — Offers one-click preset character data wiping.
  - **Symmetrical Layout Refactoring**:
    - Moved the **Live Hero Stats Overview** panel directly above the **Account Quick Stats Badge** containing contact credentials for better priority representation.
    - Swapped the reset option cards' headers from single-line flexboxes to fluid, wrap-ready rows, preventing any text overhang of the PS & DEF badges on desktops.
    - Expanded the max width wrapper from `max-w-xl` to `md:max-w-3xl` and increased padding to `p-6 md:p-8` for spacious desktop presentation.
    - Amplified preset option descriptions to `text-xs sm:text-sm text-slate-300` for crisp legibility.
- **Verification Gate**:
  - Executed `lint_applet` (`tsc --noEmit`): 0 warnings, 0 errors.
  - Executed `compile_applet`: Build succeeded cleanly.

---

## [v1.2.5-final] — 2026-09-26

### Engineering Actions
- **Finalized v1.2.5 Version Cut**:
  - Promoted development milestone to stable public `1.2.5` version release.
  - Repurposed primary navigation controls: renamed navigation tab from "Armory Store" to "Tycoon Shop", pointing standard users directly to clicker upgrade panels under `GameView`.
  - Shifted Markdown ZIP Exporter utility into the bottom developer-reference panel of the Item Compendium inside `LoreBookView`.
  - Implemented dynamic user access controls: added toggles in `AdminUserModeration` to enable/disable the cart-based store per player account, synchronized in real-time with Firestore.
  - Validated build pipeline using static typing check and application compilation.

---

## [v1.2.5-dev.1] — 2026-09-26

### Engineering Actions
- **Milestone Version Bump to v1.2.5 (`package.json`, `appConfig.ts`, `INDEX_ROADMAP.md`, `INDEX_AUDIT.md`)**:
  - Incremented global application version to `1.2.5` (`v1.2.5-dev.1`).
  - Initiated Milestone 1.2.5 focusing on `ShopView.tsx` (733 lines) architecture breakdown and single-responsibility modular subcomponent decomposition (`/src/components/shop/`).
- **Verification Gate**:
  - Executed `lint_applet` (`tsc --noEmit`): 0 warnings, 0 errors.
  - Executed `compile_applet`: Build succeeded cleanly.

---

## [v1.2.4-dev.12] — 2026-09-26

### Engineering Actions
- **Main View Top Spacing Doubled (`App.tsx`)**:
  - Doubled top padding on `<main>` container from `pt-4 sm:pt-6 md:pt-8` (16px / 24px / 32px) to **`pt-8 sm:pt-12 md:pt-16`** (32px / 48px / 64px).
  - Provides generous, polished layout breathing room beneath the pinned navigation bar for all major operational views (Boss Rush arena, Tycoon mining, Armory storefront, Lore book, and Rank stats).
- **Verification Gate**:
  - Executed `lint_applet` (`tsc --noEmit`): 0 warnings, 0 errors.
  - Executed `compile_applet`: Build succeeded cleanly.

---

## [v1.2.4-dev.11] — 2026-09-26

### Engineering Actions
- **Main View Top Spacing Adjustment (`App.tsx`)**:
  - Added `pt-4 sm:pt-6 md:pt-8` top padding to the `<main>` container in `App.tsx`.
  - Created clean spatial separation between the sticky global navigation header and top view components (Astral Gold / Tycoon bankroll, Store headers, Lore views, and Rank tables).
- **Verification Gate**:
  - Executed `lint_applet` (`tsc --noEmit`): 0 warnings, 0 errors.
  - Executed `compile_applet`: Build succeeded cleanly.

---

## [v1.2.4-dev.10] — 2026-09-26

### Engineering Actions
- **Global Navigation Bar Padding Adjustment (`App.tsx`)**:
  - Updated `div:nth-of-type(2)` inside `header#global-navbar` from `py-1.5` to `pt-1.5 pb-3.5 sm:pb-4`, expanding bottom padding for cleaner spatial breathing room above view content.
- **Verification Gate**:
  - Executed `lint_applet` (`tsc --noEmit`): 0 warnings, 0 errors.
  - Executed `compile_applet`: Build succeeded cleanly.

---

## [v1.2.4-dev.9] — 2026-09-26

### Engineering Actions
- **Tiered Tour Onboarding Bonuses & Exploitation Prevention Engine (`types.ts`, `tourSteps.ts`, `TourModeChoiceCard.tsx`, `TourStepPopover.tsx`, `GuidedTour.tsx`, `App.tsx`)**:
  - **Tiered Bounties Configured**:
    - **⚡ Express 5-Step Tour**: Awarded **🪙 +1,000 Gold Coins** & **💎 +100 Gems**.
    - **📜 Grand 20-Step Tour**: Awarded **🪙 +5,000 Gold Coins** & **💎 +500 Gems**.
  - **Exploitation Guard & Single-Claim Tracking**:
    - Added `completedTours?: { short?: boolean; full?: boolean };` to `GameState` schema and localStorage persistence.
    - Guaranteed each mode's onboarding bounty is granted **strictly once per champion account**.
  - **UI Indicators & Celebration Banners**:
    - Updated `TourModeChoiceCard.tsx` with live reward badges (`🎁 Bonus Ready` vs `CheckCircle Claimed`).
    - Added a celebration callout box on the final step in `TourStepPopover.tsx` with animated green claim button (`🎁 Claim Bonus & Finish`).
    - Handled payout in `App.tsx` via `handleClaimTourBonus`, adding reward battle logs and updating user bankrolls.
- **Verification Gate**:
  - Executed `lint_applet` (`tsc --noEmit`): 0 warnings, 0 errors.
  - Executed `compile_applet`: Build succeeded cleanly.

---

## [v1.2.4-dev.8] — 2026-09-26

### Engineering Actions
- **GuidedTour Domain Decomposition (`GuidedTour.tsx`, `/src/data/tourSteps.ts`, `/src/components/tour/`)**:
  - Extracted 360 lines of static walkthrough configuration data (`TourStep` interface, `SHORT_TOUR_STEPS`, `TOUR_STEPS`) into a dedicated configuration module (`/src/data/tourSteps.ts`).
  - Created `/src/components/tour/` directory containing 3 single-responsibility subcomponents:
    1. `TourModeChoiceCard.tsx` (105 lines) — Onboarding mode selection screen (Express 5-Step vs Grand 20-Step vs Skip).
    2. `TourStepPopover.tsx` (128 lines) — Interactive step card with progress bar, category tags, title/description, spotlight hint callouts, keyboard tips (`← / →`), and Next/Prev/Skip control buttons.
    3. `TourSpotlightOverlay.tsx` (48 lines) — Smooth element scrolling, spotlight beacon highlight (`.tour-spotlight-active`) & cleanup destructor observer.
  - Refactored `GuidedTour.tsx` from 740 lines down to a **148-line orchestrator shell** (~80% reduction), achieving 100% compliance with NASA JPL Rule 4.
  - Updated `/Docs/INDEX_AUDIT.md` and `/Docs/STRUCTURE.md`.
- **Verification Gate**:
  - Executed `lint_applet` (`tsc --noEmit`): 0 warnings, 0 errors.
  - Executed `compile_applet`: Build succeeded cleanly.

---

## [v1.2.4-dev.7] — 2026-09-26

### Engineering Actions
- **React Rules of Hooks Audit & Internal Static Flag Resolution (`BattleModal.tsx`)**:
  - **Root Cause Resolution**: Identified conditional early return `if (!isOpen) return null;` placed on line 62 of `BattleModal.tsx` *before* `useRef(null)` and `useEffect(...)` hook declarations. In React 19 / Fiber reconciler, conditionally skipping hooks during unmounted/mounted state transitions corrupted internal Fiber static flags, throwing the runtime error: *"Internal React error: Expected static flag was missing."*
  - **Fix Applied**: Moved `useRef` and `useEffect` hook declarations to top of component body before `if (!isOpen) return null;`, bringing `BattleModal.tsx` into 100% compliance with React Rules of Hooks.
- **Verification Gate**:
  - Executed `lint_applet` (`tsc --noEmit`): 0 warnings, 0 errors.
  - Executed `compile_applet`: Build succeeded cleanly.

---

## [v1.2.4-dev.6] — 2026-09-26

### Engineering Actions
- **Tycoon Bankroll Card Z-Index Layer Elevation (`TycoonBankrollCard.tsx`, `BattleModal.tsx`)**:
  - Elevated `id="tycoon-bankroll-card"` z-index from `z-40` to **`z-[150]`** so the real-time stat bar remains continuously visible and interactive above the Arena Combat Modal backdrop (`z-[100]`).
  - Added bottom padding cushion (`pb-20 sm:pb-24`) to the outer `BattleModal` overlay container to prevent modal dialog content from being occluded by the fixed bottom stat bar.
- **Verification Gate**:
  - Executed `compile_applet`: Build succeeded cleanly with 0 type errors or warnings.

---

## [v1.2.4-dev.5] — 2026-09-26

### Engineering Actions
- **Combat Engine Modular Extraction (`/src/utils/combatEngine.ts`, `GameView.tsx`)**:
  - Extracted core combat formulas, boss scaling curves (`getBossHP`, `getBossAttack`, `getBossPowerReq`), damage turn calculation engine (`calculateCombatTurn`), yield rate calculators (`getPassiveYield`), total combat attributes (`getTotalAttack`, `getTotalDefense`, `getTotalSpeed`, `getNormalMaxHP`, `getPowerScore`), and revive cost calculations (`getCurrentReviveCost`) into a dedicated `/src/utils/combatEngine.ts` utility module (145 lines).
  - Streamlined `GameView.tsx` by delegating stat computations directly to `combatEngine.ts`.
- **Persistent Player Health Synchronization Fix (`TycoonBankrollCard.tsx`, `GameView.tsx`)**:
  - **Root Cause Resolution**: Identified that `TycoonBankrollCard` evaluated `isFighting ? livePlayerHP : normalHP`, causing the statbar to drop active damaged health values (e.g. `76/110 HP`) and revert to `max/max` (`110/110 HP`) as soon as combat turn loops paused or completed.
  - **Fix Applied**: Updated `TycoonBankrollCard.tsx` to continuously render the actual `livePlayerHP` and `livePlayerMaxHP` state regardless of `isFighting` flag state.
  - Added an automatic state synchronization `useEffect` in `GameView.tsx` to maintain accurate `livePlayerHP` (e.g. `76/110 HP`) across combat actions, damage logs, and revive/heal events.
- **Verification Gate**:
  - Executed `compile_applet`: Build succeeded cleanly with 0 type errors or warnings.

---

## [v1.2.4-dev.4] — 2026-09-26

### Engineering Actions
- **Admin Portal Sub-Tab Categorization & Deduplication (`AdminModal.tsx`, `AdminCartInspector.tsx`)**:
  - Implemented top-level navigation sub-tabs in `AdminModal.tsx` to cleanly separate **🛒 Store Validation**, **⚙️ Adjustment Configs** (`AdminBalanceConfig`), and **👥 User Moderation & Stats** (`AdminUserModeration`).
  - Added sub-pill filters within Store Validation (**All Tools**, **🔍 Reverse Inspector**, **🎫 Key Builder**, and **📋 Vault Records**).
  - Deduplicated order reconstruction in `AdminCartInspector.tsx` by seamlessly delegating to the shared Key Builder payload state and `generateCustomCode` helper.
- **Hero Baseline Centralization & Account Modal Polish (`data.ts`, `AdminBalanceConfig.tsx`, `AccountModal.tsx`)**:
  - Centralized `DEFAULT_HERO_BASELINE` in `src/data.ts` for **Standard Starter** (`10 ATK / 10 DEF / 10 SPD` $\to$ **30 PS & 10 DEF**) vs **Absolute Zero** (`0 ATK / 0 DEF / 0 SPD` $\to$ **0 PS & 0 DEF**).
  - Integrated custom base attribute inputs (`baseAttack`, `baseDefense`, `baseSpeed`) and 1-click baseline preset buttons in `AdminBalanceConfig.tsx`.
  - Updated `AccountModal.tsx` to import `DEFAULT_HERO_BASELINE` for reset profiles and replaced text coin emojis with the metallic SVG `<CoinIcon />`.
- **Tycoon Bankroll Stat Bar Reordering (`TycoonBankrollCard.tsx`)**:
  - **Layer 1 (Portal Bar)**: Moved **Bosses Defeated** (`💀`) to the **1st position** of the list, and swapped **Gems** (`💎`) and **Coins** (`🪙`) so Gems appears before Gold Coins.
  - **Layer 2 (Combat Attributes Bar)**: Moved **Health / HP** (`❤️`) to the **1st position** of the list, and updated display format to continuously show **`current / max`** HP (e.g., `110/110 HP` out of combat, and live `HP/MaxHP` in combat).
- **Verification Gate**:
  - `tsc --noEmit`: 0 errors.
  - `vite build` / `compile_applet`: Build succeeded cleanly.

---

## [v1.2.4-dev.3] — 2026-09-26

### Engineering Actions
- **User Account Wipe Presets (`AccountModal.tsx`)**:
  - Integrated the two 1-click clean-slate presets into the user-facing Account modal (`AccountModal.tsx`) for all registered and guest players:
    1. **⚡ Absolute Zero Slate**: Wipes raw stats to 0 ATK, 0 DEF (0 Armor), 0 SPD, 0 Coins, 0 Gems & 0 Nanites $\to$ **0 PS & 0 Armor**.
    2. **🎮 Standard Starter Pack**: Restores starter allocation (2,000 Coins, 500 Gems, 2 Nanite Revives, 10 ATK / 5 DEF / 10 SPD $\to$ **29 PS & 5 Armor**).
  - Added visual preview badges, distinct danger/success themed cards, and inline confirmation safeguards.
- **Verification Gate**:
  - `tsc --noEmit`: 0 errors.
  - `vite build`: Build succeeded cleanly.

---

## [v1.2.4-dev.2] — 2026-09-26

### Engineering Actions
- **Granular Character & Stat Wipe Architecture (`AdminModal.tsx`, `GameView.tsx`, `types.ts`)**:
  - Identified baseline character mechanics ($10\text{ ATK} + 5\text{ DEF/Armor} + 10\text{ SPD} \to 29\text{ Base PS}$) and engineered support for dynamic `baseAttack`, `baseDefense`, and `baseSpeed` overrides in `GameState`.
  - Upgraded the Admin Wipe confirmation modal with one-click presets and granular toggle switches:
    1. **Preset 1 — Absolute Zero Slate**: Wipes raw stats to 0 ATK, 0 DEF (0 Armor), 0 SPD, 0 Coins, 0 Gems & 0 Nanites $\to$ **0 PS & 0 Armor**.
    2. **Preset 2 — Standard Starter**: Re-initializes clean starter pack (2,000c, 500g, 2 Nanites, base 10 ATK / 5 DEF / 10 SPD $\to$ **29 PS & 5 Armor**).
    3. **Granular Checkboxes**: Individual toggles for wiping starting bankroll to 0, wiping inherent base armor/stats to 0, wiping revive nanite packs, purging physical/cloud receipt vouchers, and purging leaderboard records.
    4. **Live Target Preview**: Real-time 4-card matrix displaying resulting Power Score, Armor / DEF, Starting Gold, and Nanite Revives prior to execution.
- **Verification Gate**:
  - `tsc --noEmit`: 0 errors.
  - `vite build`: Build succeeded cleanly.

---

## [v1.2.4-dev.1] — 2026-09-26

### Engineering Actions
- **Centralized Application Configuration Architecture (`src/config/appConfig.ts`)**:
  - Created single source of truth configuration module `APP_CONFIG` defining canonical project metadata: `version` (`1.2.4`), `versionTag` (`v1.2.4`), `devVersionTag` (`v1.2.4-dev.1`), `releaseName` (`Boss Rush Tycoon`), `appName` (`Power-Up Armory`), `partner` URL & branding, and governance standards.
  - Linked `src/components/Footer.tsx` and `src/components/AdminModal.tsx` directly to `APP_CONFIG`, removing hardcoded version strings so future version updates require modifying only `src/config/appConfig.ts` and `package.json`.
- **AdminModal Modular Architecture & Single-Responsibility Decomposition (`AdminModal.tsx`, `/src/components/admin/`)**:
  - Successfully decomposed the 1,478-line monolithic `AdminModal.tsx` into 5 clean, single-responsibility subcomponents meeting NASA JPL Rule 4 and modularity guidelines:
    1. `src/components/admin/AdminCartInspector.tsx` (300 lines): Reverse Cart ID & receipt key inspector, order determination, itemization & cart reconstruction bridge.
    2. `src/components/admin/AdminCodeGenerator.tsx` (168 lines): Custom receipt key generator with item payload queue & custom pricing.
    3. `src/components/admin/AdminCodeTracking.tsx` (145 lines): Receipt key inventory, search/filter & redemption toggles.
    4. `src/components/admin/AdminUserModeration.tsx` (178 lines): Player account moderation, leaderboard purge & stat resets.
    5. `src/components/admin/AdminBalanceConfig.tsx` (202 lines): Game balance mechanics tuner, revival cost scaling & boss drop multipliers.
  - Refactored `AdminModal.tsx` from 1,478 lines down to a clean 348-line orchestrator shell managing global state sync, Firestore operations, and confirmation modals.
  - Added explicit `TempPayloadItem` interface to `src/types.ts` for clean type safety across subcomponents.
- **Verification Gate**:
  - `tsc --noEmit`: 0 errors.
  - `vite build`: Build succeeded cleanly.

---

## [v1.2.3-dev.25] — 2026-09-26

### Engineering Actions
- **Tycoon & Armory Grid Universal Touch Tooltips (`GlobalTouchTooltip.tsx`, `TycoonGenerators.tsx`, `ShopView.tsx`)**:
  - Upgraded `GlobalTouchTooltip` with structured multi-line card parsing (rendering title banner, rarity tags, descriptions, `✨ Effect:`, and `⚡ Special:` abilities).
  - Replaced brittle CSS `opacity-0 group-hover:opacity-100` hover overlays in `TycoonGenerators.tsx` and `ShopView.tsx` with universal `data-tooltip` integrations.
  - Added interactive `ⓘ` inspect chips and keyboard-accessible header buttons (`tabIndex={0}`, `role="button"`), enabling mobile users to touch-and-hold (200ms) or tap to inspect full item lore and abilities without clipping.
- **Verification Gate**:
  - `tsc --noEmit`: 0 errors.
  - `vite build`: Build succeeded cleanly.

---

## [v1.2.3-dev.24] — 2026-09-26

### Engineering Actions
- **Tycoon Statbar Footer Docking & Zero-Lag Physics (`TycoonBankrollCard.tsx`, `Footer.tsx`)**:
  - Removed the CSS `transition-[bottom] duration-75` property which caused an asynchronous 75ms interpolation lag/wiggle during active scrolling.
  - Replaced asynchronous React state updating with direct DOM ref manipulation synced via synchronous scroll event execution and `requestAnimationFrame`.
  - Mathematically locked the top edge of `<Footer />` (`#app-global-footer`, `relative z-30`) to `<TycoonBankrollCard />` (`#tycoon-bankroll-card`, `z-40 will-change-[bottom]`), ensuring a flush, pixel-perfect collision without floating gaps, stutter, or rubber-banding.
- **Verification Gate**:
  - `tsc --noEmit`: 0 errors.
  - `vite build`: Build succeeded cleanly.

---

## [v1.2.3-dev.23] — 2026-09-26

### Engineering Actions
- **Tycoon Layout Reorganization (`GameView.tsx`)**:
  - Relocated `<KeyRedemptionCard />` (`#game-redeem-container`) from the top of the Tycoon tab to the bottom below the Gold Core clicker and power-up generator grid.
  - Prioritizes active gameplay and gold core mining at the top of the viewport while keeping the code redemption bridge accessible at the bottom of the Tycoon section.
- **Verification Gate**:
  - `tsc --noEmit`: 0 errors.
  - `vite build`: Build succeeded cleanly.

---

## [v1.2.3-dev.22] — 2026-09-26

### Engineering Actions
- **Universal Mobile Touch-and-Hold & Desktop Hover Tooltip Engine (`GlobalTouchTooltip.tsx`, `App.tsx`)**:
  - Architected and mounted `GlobalTouchTooltip`, a centralized engine listening for `[data-tooltip]` and `[title]` attributes across the entire DOM tree.
  - **Touch & Mobile Support**: Long-pressing (250ms) or touching any interactive element with tooltip metadata immediately triggers a floating dark-slate popover badge with glowing pointer arrow and auto-dismissal (3.2s or on-scroll).
  - **Desktop & A11y Support**: Integrates seamless pointer tracking with boundary collision clamping and WCAG 2.1 AA keyboard `focusin`/`focusout` listeners.
  - Unified all elements (Header Tour, Account, Admin, Font Scale, Lore Compendium Markdown Downloads, Shop Quantity, Combat Timestamps & LocalStorage Toggles, Tycoon Currency & Stat Pills) under the universal touch-friendly tooltip system.
- **Verification Gate**:
  - `tsc --noEmit`: 0 errors.
  - `vite build`: Build succeeded cleanly.

---

## [v1.2.3-dev.21] — 2026-09-26

### Engineering Actions
- **Mobile Touch & Tap Popover Tooltip Engine (`TycoonBankrollCard.tsx`)**:
  - Replaced passive `<div>` stat elements with interactive, accessible `<button>` pills featuring active scale feedback (`active:scale-95`).
  - Added tap-to-inspect popover tooltip badge floating above the statbar on mobile and touchscreens.
  - Implemented auto-dismiss timer (3.2s) and close trigger `✕` for non-intrusive mobile exploration.
  - Retained native `title="..."` attributes for desktop mouse hover.
- **Verification Gate**:
  - `tsc --noEmit`: 0 errors.
  - `vite build`: Build succeeded cleanly.

---

## [v1.2.3-dev.20] — 2026-09-26

### Engineering Actions
- **Statbar Compact Notation & Single-Line Constraint (`TycoonBankrollCard.tsx`)**:
  - Implemented `formatCompact` and `formatYield` smart rounding utilities (e.g. `12.5k`, `1.4M`, `2.1B`, `+15/s`) to prevent large integer expansion.
  - Reduced pill padding to `px-2 sm:px-2.5 py-0.5` and inter-item spacing to `gap-1 sm:gap-1.5`.
  - Constrained both the Currency/Portal row and the Combat Stats row to strict single-line (`flex-nowrap`, non-breaking) layouts with the category headers (`🏆 PORTAL`, `⚡ STATS`).
  - Added full unrounded precision metrics into the hover `title="..."` tooltip attributes.
- **Verification Gate**:
  - `tsc --noEmit`: 0 errors.
  - `vite build`: Build succeeded cleanly.

---

## [v1.2.3-dev.19] — 2026-09-26

### Engineering Actions
- **Statbar Alignment & Right-Pinning (`TycoonBankrollCard.tsx`)**:
  - Applied `ml-auto justify-end` to the currency pills list (Coins, Gems, Yield/s, Boss Kills) and the combat stats list (ATK, DEF, HP, SPD, PS) within `TycoonBankrollCard.tsx`.
  - Pinned the metric lists firmly to the right side of their respective grouped containers while anchoring the left section headers (`🏆 PORTAL`, `⚡ STATS`) cleanly to the left edge.
- **Verification Gate**:
  - `tsc --noEmit`: 0 errors.
  - `vite build`: Build succeeded cleanly.

---

## [v1.2.3-dev.18] — 2026-09-26

### Engineering Actions
- **Mobile Header Font Scale & Space Optimization (`App.tsx`)**:
  - Scaled down the header logo typography from `text-sm sm:text-base` to `text-xs sm:text-sm md:text-base` and brand emoji from `text-2xl` to `text-xl sm:text-2xl`.
  - Optimized Tier 2 primary navigation tabs with compact `text-[11px] sm:text-xs` typography and responsive labels (`Lore`, `Store`, `Game`, `Rank` on narrow mobile viewports; full labels on standard screens).
  - Reduced button padding from `px-3 sm:px-5 py-1.5` to `px-2.5 sm:px-4 py-1 sm:py-1.5` and tightened sub-tab controls to `text-[10px] sm:text-[11px]`.
  - Scaled top utility chips (`Tour`, `Account`, `Admin`) to `text-[11px] sm:text-xs` for a sleek, compact single-row header footprint on small mobile viewports.
- **Verification Gate**:
  - `tsc --noEmit`: 0 errors.
  - `vite build`: Build succeeded cleanly.

---

## [v1.2.3-dev.17] — 2026-09-26

### Engineering Actions
- **Sticky Header Physics & Contrast Hardening (`App.tsx`)**:
  - Replaced `overflow-x-hidden` on the root viewport container with `overflow-x-clip` to prevent scroll-container interference with CSS `position: sticky; top: 0`.
  - Replaced semi-transparent Tier 2 navigation backgrounds with solid, 100% opaque slate-midnight surfaces (`bg-[#0b101d] border-t border-white/5 shadow-inner`) to eliminate visual bleed-through when cards and combat text scroll underneath.
  - Hardened `<header id="global-navbar">` with `sticky top-0 z-50 bg-[#0a0e1a] shadow-2xl` for consistent top pinning across desktop and mobile devices.
- **Verification Gate**:
  - `tsc --noEmit`: 0 errors.
  - `vite build`: Build succeeded cleanly.

---

## [v1.2.3-dev.16] — 2026-09-26

### Engineering Actions
- **Header Architecture & Scroll Flicker Elimination (`App.tsx`)**:
  - **Root Cause Resolution**: Identified the scroll flicker root cause as an infinite hysteresis jitter loop where a 30px scroll threshold dynamically collapsed navbar padding, reduced text sizes, and unmounted subtitle DOM nodes, causing sudden document layout height jumps of ~40px.
  - **Restructured into 2-Tier Sticky Header**:
    - **Tier 1 (Top Utility & Brand Bar)**: Houses the logo identity (`⚔️ POWER-UP ARMORY`) alongside the system action suite: Font Scale accessibility slider (`<FontScaleControl />`), Guided Tour button (`🧭 Tour`), Champion Account button (`🔑 Sign In` / Profile Chip), Admin console button (`⚙️ Admin`), and Firebase cloud status indicator.
    - **Tier 2 (Primary Navigation & Sub-Tabs)**: Centered, smooth pill navigation bar (`📖 Lore Book`, `🏪 Armory Store`, `🎮 Boss Rush`, `📊 Rank & Stats`) with embedded sub-tabs (`⚡ Tycoon` & `⚔️ Bosses`) when the game tab is selected.
  - **Physics & Stability**: Eliminated scroll-triggered layout shifts and unmounting, ensuring 100% stable, jitter-free pinning across all scroll positions.
- **Verification Gate**:
  - `tsc --noEmit`: 0 errors.
  - `vite build`: Build succeeded cleanly.

---

## [v1.2.3-dev.15] — 2026-09-26

### Engineering Actions
- **Toggleable Timestamps & LocalStorage Combat Log Persistence (`GameView.tsx`, `BossGauntlet.tsx`, `BattleModal.tsx`, `types.ts`)**:
  - Added `timestamp` (`HH:mm:ss`) support across all combat log messages (`BattleLogEntry` interface).
  - Added interactive `⏱️ Time ON/OFF` toggle button to show or hide inline monospace timestamp tags (`[HH:mm:ss]`) beside each log entry.
  - Added `💾 Saved / Volatile` LocalStorage persistence mode toggle, automatically preserving up to 100 historical combat logs across page reloads and browser sessions.
  - Added a `🧹 Clear` action button to flush stale logs on demand.
  - Saved user preferences (`powerupArmory_log_showTimestamps`, `powerupArmory_log_persistLogs`) in LocalStorage for persistent configuration.
- **Verification Gate**:
  - `tsc --noEmit`: 0 errors.
  - `vite build`: Build succeeded cleanly.

---

## [v1.2.3-dev.14] — 2026-09-26

### Engineering Actions
- **Combat Log Stream Direction Calibration (`GameView.tsx`, `BossGauntlet.tsx`, `BattleModal.tsx`)**:
  - Re-ordered combat logging to prepend the newest combat events directly at the top of the feed (`[newLog, ...prev]`).
  - Synced auto-scroll refs (`scrollTop = 0`) across both the Arena dashboard and the live `BattleModal` dialog so immediate battle events, critical strikes, and rewards are instantly in view without manual scrolling.
  - Added "Newest First" visual badge indicator to the combat record header.
- **Verification Gate**:
  - `tsc --noEmit`: 0 errors.
  - `vite build`: Build succeeded cleanly.

---

## [v1.2.3-dev.13] — 2026-09-26

### Engineering Actions
- **UI Streamlining & Focus Target**:
  - Removed duplicate secondary sub-navigation menu from `GameView.tsx` as requested.
  - Aligned view switching directly with the primary global header navigation system.
- **Verification Gate**:
  - `tsc --noEmit`: 0 errors.
  - `vite build`: Build succeeded cleanly.

---

## [v1.2.3-dev.12] — 2026-09-26

### Engineering Actions
- **Approach 1 Finalization (Phases 3 & 5 Decomposition + Complete Validation of Phases 1, 2, 4)**:
  - **Phase 3: Extracted `TycoonGenerators.tsx` (`src/components/game/TycoonGenerators.tsx`)** (168 lines):
    - Encapsulates Astral Ore Core clicker, combo multiplier tracker, and recent mining gain visual feedback.
    - Categorized powerup generator matrix (Weapons Class, Defense Safeguards, Utility Systems, Mystic Arts).
    - Detailed hover tooltips, real-time rate calculators, level-up upgrades, and gem copy purchasing flows.
  - **Phase 5: Extracted `BossGauntlet.tsx` (`src/components/game/BossGauntlet.tsx`)** (272 lines):
    - Encapsulates boss roster grid with status tags (`Ready`, `Hero Fallen`, `Respawning`, `Locked`).
    - Pre-fight gold booster shop (+25 HP Shield, +5% Damage Tonic) and Fallen Champion banner with immediate revival triggers.
    - Live combat log feed container with auto-scrolling ref and mobile quick arena simulation launcher.
  - **Extracted `KeyRedemptionCard.tsx` (`src/components/game/KeyRedemptionCard.tsx`)** (56 lines):
    - Dedicated receipt key and promo cipher redemption component with responsive input, validation, and submission state.
  - **Validated & Hardened Phases 1, 2, & 4 Subcomponents**:
    - Confirmed zero duplicate setups, circular dependencies, or broken interfaces in `TycoonBankrollCard.tsx`, `BattleModal.tsx`, and `StatsLeaderboard.tsx`.
  - **`GameView.tsx` Orchestration Refactor**:
    - Reduced `GameView.tsx` from **1,259 lines down to 448 lines** (75% total reduction from initial 1,800 lines).
    - Added integrated subnavigation switcher for instant toggling between Tycoon, Boss Arena, and Ranks tabs.
    - Updated `/Docs/INDEX_AUDIT.md` metrics.
- **Quality & Verification Gate**:
  - `tsc --noEmit`: 0 errors.
  - `vite build`: Build succeeded cleanly with 0 warnings.

---

## [v1.2.3-dev.11] — 2026-09-26

### Engineering Actions
- **Approach 1 (Phased Domain-Driven Subcomponent Decomposition - Phase 4: Leaderboard & Stats)**:
  - **Extracted `StatsLeaderboard.tsx` (`src/components/game/StatsLeaderboard.tsx`)**:
    - Created dedicated subcomponent (283 lines) encapsulating:
      - Hero Character Attributes card (ATK, DEF, HP, SPD, and total Power Score).
      - Boss Kill/Death History telemetry ledger tracking personal triumph/defeat counts.
      - Hall of Champions global rankings with multi-column sorting (Power Score, Bosses Defeated, Coins).
      - Cloud synchronization status badge, sign-in prompt for guest players, and score sync action trigger.
  - **Modularized `GameView.tsx`**:
    - Removed `leaderboardSortBy` internal state from `GameView.tsx`, localizing it within `StatsLeaderboard`.
    - Shrank `GameView.tsx` from 1,521 lines down to 1,259 lines (~541 lines removed overall from original 1,800).
    - Updated `/Docs/INDEX_AUDIT.md` module line ceiling metrics.
- **Quality & Verification Gate**:
  - Executed `compile_applet` and `lint_applet` (`tsc --noEmit`) with 0 errors.

---

## [v1.2.3-dev.10] — 2026-09-26

### Engineering Actions
- **Approach 1 (Phased Domain-Driven Subcomponent Decomposition - Phases 1 & 2)**:
  - **Phase 1: Extracted `TycoonBankrollCard.tsx` (`src/components/game/TycoonBankrollCard.tsx`)**:
    - Isolated the fixed/docking real-time bankroll and combat statbar into a dedicated subcomponent (144 lines).
    - Encapsulated dynamic footer collision detection and scroll/resize listeners strictly inside the card.
    - Preserved currency metrics (coins, gems, passive yield, bosses defeated) and player combat stats (ATK, DEF, live HP/max HP, SPD, PS).
  - **Phase 2: Extracted `BattleModal.tsx` (`src/components/game/BattleModal.tsx`)**:
    - Extracted the full combat arena simulation dialog and duel visualization into a dedicated subcomponent (208 lines).
    - Encapsulates player vs boss duel stage, live HP bars, pre-fight gold booster shop, live scrolling battle feed, and coin/pack revival controls.
  - **Main Game View Modularization (`GameView.tsx`)**:
    - Decreased line count from 1,800 to 1,521 lines with zero state regression or interface breaking changes.
    - Updated `/Docs/INDEX_AUDIT.md` module line ceiling metrics.
- **Quality & Verification Gate**:
  - Executed `compile_applet` and `lint_applet` (`tsc --noEmit`) with 0 errors.

---

## [v1.2.3-dev.9] — 2026-09-26

### Engineering Actions
- **Dynamic Footer Boundary Collision Docking for Tycoon Bankroll Card (`GameView.tsx`)**:
  - Restored fixed bottom screen docking (`fixed left-0 right-0 z-40`) so `#tycoon-bankroll-card` is immediately pinned to the bottom of the viewport on all screen sizes, including mobile.
  - Implemented dynamic boundary collision detection via scroll & resize listeners referencing `footer#app-global-footer`:
    - While scrolling through the game, `statbarBottomOffset` is `0px`, keeping the bar locked to the bottom of the screen.
    - When the top of the footer enters the viewport (`footerRect.top < viewportHeight`), `bottom: ${overlap}px` dynamically raises the card, perfectly docking it directly above the footer.
  - Preserved `pb-28 sm:pb-32` on `GameView` so the last combat logs and tycoon generators are never obscured.
- **Quality & Verification Gate**:
  - Executed `compile_applet` and `lint_applet` (`tsc --noEmit`) with 0 errors.

---

## [v1.2.3-dev.8] — 2026-09-26

### Engineering Actions
- **Tycoon Bankroll Card Layout Constraint Above Footer (`GameView.tsx`)**:
  - **Selected Target**: `div#tycoon-bankroll-card`
  - Replaced viewport-fixed placement (`fixed bottom-0`) with sticky positioning constrained within the main content container (`sticky bottom-0 ... mt-8`).
  - Allows the bankroll card to float visibly as the user scrolls through tycoon generators or bosses, but stops naturally right above `<footer id="app-global-footer">`.
  - Removed excessive `pb-32` spacing on `GameView` in favor of natural `pb-6`, completely eliminating overlap and ensuring that all bottom details, version strings, legal citations, and footer links remain 100% accessible on mobile viewports.
- **Quality & Verification Gate**:
  - Executed `compile_applet` and `lint_applet` (`tsc --noEmit`) with 0 errors.

---

## [v1.2.3-dev.7] — 2026-09-26

### Engineering Actions
- **Custom High-Impact SVG Lightning Icon Replacement (`LightningIcon.tsx`, `GameView.tsx`)**:
  - Replaced the thin unicode character `⚡` with a custom vector SVG component (`<LightningIcon />`) engineered specifically to match the optical mass and height of the `🏆` trophy emoji:
    - Bold electrical geometry with a wide aspect ratio and sharp contours.
    - Electric yellow to rich amber gradient fill (`#FFF7A1` -> `#D97706`) with an amber neon drop-shadow glow filter.
    - Specular white highlight beam down the top spine.
    - Responsive sizing `w-4.5 h-4.5 sm:w-5 sm:h-5 drop-shadow-md` perfectly counterbalancing `🏆 PORTAL`.
- **Quality & Verification Gate**:
  - Executed `compile_applet` and `lint_applet` (`tsc --noEmit`) with 0 errors.

---

## [v1.2.3-dev.6] — 2026-09-26

### Engineering Actions
- **Tycoon Bankroll Card Label & Icon Size Harmonization (`GameView.tsx`)**:
  - **Selected Targets**:
    - `div#tycoon-bankroll-card ... div:nth-of-type(1) > span:nth-of-type(1)` (`🏆 PORTAL`)
    - `div#tycoon-bankroll-card ... div:nth-of-type(2) > span:nth-of-type(1)` (`⚡ STATS`)
  - Scaled up the `⚡ STATS` label and lightning bolt icon to match the exact visual weight, font size, and emoji dimensions of the `🏆 PORTAL` label:
    - **Outer Span**: `font-mono text-xs sm:text-sm font-extrabold uppercase tracking-widest flex items-center gap-1.5 shrink-0`
    - **Icon Span**: `text-base sm:text-lg leading-none` on both `🏆` and `⚡`
    - **Text Label**: Perfectly synchronized typography across both layer 1 and layer 2.
- **Quality & Verification Gate**:
  - Executed `compile_applet` and `lint_applet` (`tsc --noEmit`) with 0 errors.

---

## [v1.2.3-dev.5] — 2026-09-26

### Engineering Actions
- **Tycoon Bankroll Card Lightning Bolt Sizing Calibration (`GameView.tsx`)**:
  - **Selected Target**: `div#root ... div#tycoon-bankroll-card ... div:nth-of-type(2) > span:nth-of-type(1) > span:nth-of-type(1)` (STATS section lightning bolt icon).
  - Increased typography size from inherited 10px/12px to `text-sm sm:text-base leading-none` with calibrated flex spacing `gap-1.5` for balanced visual prominence beside the combat attributes row.
- **Quality & Verification Gate**:
  - Executed `compile_applet` and `lint_applet` (`tsc --noEmit`) with 0 errors.

---

## [v1.2.3-dev.4] — 2026-09-26

### Engineering Actions
- **Tycoon Store Generator Upgrade Button Coin Icon Upgrade (`GameView.tsx`)**:
  - **Selected Target**: `div#root ... div:nth-of-type(3) > button:nth-of-type(1)` (Tycoon generator item upgrade button).
  - Replaced text `🪙` inside the generator level-up buttons (`Lv. Up ([Cost] 🪙)`) with inline `<CoinIcon className="w-3.5 h-3.5 inline-block drop-shadow" />`.
  - Replaced `💰 Rate:` label on each generator card with `<CoinIcon className="w-3.5 h-3.5 drop-shadow" /> Rate:`.
  - Upgraded manual Gold Ore Core button with `CoinIcon` and leaderboard gold indicators.
- **Quality & Verification Gate**:
  - Executed `compile_applet` and `lint_applet` (`tsc --noEmit`) with 0 errors.

---

## [v1.2.3-dev.3] — 2026-09-26

### Engineering Actions
- **Custom Metallic Gold Coin Icon Component (`CoinIcon.tsx`, `GameView.tsx`, `ShopView.tsx`)**:
  - **Component Creation (`CoinIcon.tsx`)**: Built a high-resolution, vector SVG metallic gold coin icon featuring concentric gold rim gradients, inner ridge textures, a central star insignia, and top specular light reflection.
  - **Revive & Combat Controls (`GameView.tsx`)**:
    - **Targeted Elements Updated**:
      - Top Arena Fallen Emergency Banner: Replaced generic emoji with `<CoinIcon className="w-3.5 h-3.5 drop-shadow" />` in the revive cost badge.
      - Boss Roster Card Revive Button: Integrated crisp inline `<CoinIcon className="w-4 h-4 inline-block drop-shadow" />` in `"REVIVE HERO ([Cost])"`.
      - Combat Record Revive Box: Updated coin revive button badge to feature `CoinIcon`.
      - Pre-Fight Coin Boosts Shop & Arena Modal: Replaced coin emoji with `CoinIcon` in the gold balance badge and "+25 HP / +5% DMG" purchase chips.
      - Pinned Bankroll HUD: Replaced `💰` with `CoinIcon` in the gold balance portal badge.
  - **Shopfront Commerce (`ShopView.tsx`)**:
    - Enhanced pack purchase chips with `CoinIcon` next to pack prices (e.g., Single, 10-Pack, 30-Pack).
    - Upgraded item subtotal and checkout footer value with `CoinIcon`.
- **Quality & Verification Gate**:
  - Executed `compile_applet` and `lint_applet` (`tsc --noEmit`) with 0 errors.

---

## [v1.2.3-dev.2] — 2026-09-26

### Engineering Actions
- **Fallen Champion Combat State & Health Display Overhaul (`GameView.tsx`)**:
  - **Selected Elements Targeted**:
    - **Boss Roster Fight Buttons**: When the champion has fallen (`gameState.isDead === true`), the standard fight buttons are dynamically transformed into prominent high-contrast **"💀 REVIVE HERO ([Cost] 🪙)"** quick-action buttons with amber-to-red gradients, allowing players to instantly revive directly from any boss card without needing to navigate away.
    - **Boss Card Status Tags**: Swapped tag from `Ready` or `Locked` to an animated pulsing `Hero Fallen` indicator (`bg-red-950/80 text-red-300 border border-red-500/50`).
    - **Arena Top Fallen Alert Banner**: Added a top-of-arena emergency banner with animated pulse, displaying 0 HP deceased status and quick-revive buttons (Coins vs Revive Pack).
    - **Live Battle Combat Log Health Bar**: Updated player health bar in the combat record to show `💀 [Hero] DECEASED` with a pulsing red 0 HP indicator and dark red empty track.
    - **Combat Log Revive Action Box**: Upgraded fallen alert styling with a glowing crimson border (`border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.35)]`) and animated skull icon.
    - **Bottom Bankroll HUD Health Indicator**: Health badge transitions from green to a pulsing crimson badge (`bg-red-950/80 border-2 border-red-500 text-red-200`) showing `💀 0 HP (FALLEN)`.
    - **Arena Modal Fighter Card**: Updated avatar to a gravestone emoji (`🪦`) with `DECEASED` badge and empty red HP bar when defeated.
- **Quality & Verification Gate**:
  - Executed `compile_applet` and `lint_applet` (`tsc --noEmit`) with 0 errors.

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
