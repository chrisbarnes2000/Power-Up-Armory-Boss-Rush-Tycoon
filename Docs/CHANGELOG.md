# Public Changelog (`/Docs/CHANGELOG.md`)

> **CADENCE**: Milestone Frequency. Customer-facing release notes for official public cuts.

---

## [v1.2.5] — 2026-09-26

### 🚀 What's New in v1.2.5

#### 🏪 Tycoon Shop Repurposing & Navigation Routing
- **Direct Tycoon Access**: Repurposed the main storefront tab as the **Tycoon Shop**, routing standard players directly to the clicker-mining and automation upgrade panels under the Boss Rush domain.
- **Lore Book Redirect Integration**: Configured the internal redirection buttons within the Compendium to align with the new Tycoon Shop layout.

#### 📦 Gated Armory Store & Access Controls (RBAC)
- **Administrative Access Controls**: Added an option in the Admin Portal under User Moderation to enable or disable the full transaction-based Armory Store for specific users dynamically.
- **Secure Access Verification**: Introduced an authentication and profile verification check that locks access and presents a highly polished restriction notice if the store is not authorized for a user.

#### 🛠️ Relocated Markdown ZIP Exporter
- **Dev-First Relocation**: Moved the Lore Book Markdown ZIP generator button from the top header into the "Developer Reference: Updating In-Game Item Texts & Lore" container at the bottom of the Item Compendium.

---

## [v1.2.4] — 2026-09-26

### 🚀 What's New in v1.2.4

#### ⚙️ Modular Admin Console & Architecture Decomposition
- **Single-Responsibility Separation**: Decomposed the complex admin control interface into five independent subcomponents (`AdminCartInspector`, `AdminCodeGenerator`, `AdminCodeTracking`, `AdminUserModeration`, and `AdminBalanceConfig`).
- **Precision Validation & Auditing**: Isolated reverse checkout lookup tools, crypto receipt key managers, and gameplay balance calibration tuners for standard-compliant service assurance.

#### 🧭 Multi-Tier Guided Onboarding & Interactive Tour
- **Express vs. Grand Walkthroughs**: Added option-driven onboarding modes (Express 5-Step vs. Grand 20-Step vs. Skip) to accommodate varied player learning styles.
- **Tiered Completion Bounties**: Integrated automated, exploitation-guarded rewards (+1,000 Gold Coins & +100 Gems for Express; +5,000 Gold Coins & +500 Gems for Grand) with single-claim tracking per account.
- **Decomposed Walkthrough Architecture**: Modularized the tour overlay engine (`TourModeChoiceCard`, `TourStepPopover`, `TourSpotlightOverlay`, and `tourSteps` data config) to meet safety-critical engineering constraints.

#### 🎮 Centralized Combat Engine & Stat Mechanics
- **Isolated Math Framework**: Extracted combat equations, boss scaling curves, and passive yield computations into a dedicated utility module (`combatEngine.ts`).
- **Persistent Health Synchronization**: Fixed real-time synchronization of player health metrics, continuously updating live HP indicators across active battles, browser reloads, and revive triggers.

#### 👤 Granular Champion Profiles & Reset Presets
- **Granular Account Wipes**: Enhanced player and administrator profile management with 1-click clean-slate resets:
  - *Absolute Zero Slate*: Wipes characters down to bare-minimum 0-stat parameters for maximum challenge.
  - *Standard Starter Pack*: Swiftly restores baseline default parameters (10 ATK, 5 DEF, 10 SPD, 2,000 Coins, 500 Gems, and 2 Revive Nanites).
- **Responsive Pinned Layout**: Elevated live player stats to stay continuously accessible above active modals.

#### 📐 Spatial Geometry & Visual Refinements
- **Page Layout Breathing Room**: Doubled top margin spacing beneath the sticky navigation header to ensure generous layout spacing across all device widths.

---

## [v1.2.3] — 2026-09-26

### 🚀 What's New in v1.2.3

#### 👆 Universal Mobile Touch & Long-Press Tooltips
- **Universal Tooltip Engine**: Introduced touch-and-hold (200ms) popovers and tap-to-inspect cards across all mobile and touch displays.
- **Rich Card Itemization**: Tooltips now feature formatted title banners, item rarity badges, dynamic lore excerpts, and detailed ability breakdowns (`✨ Effect:` and `⚡ Special:`).
- **Desktop & A11y Support**: Smooth pointer tracking with boundary collision clamping and WCAG 2.1 AA keyboard focus trap compatibility.

#### ⚡ Pinned Tycoon Bankroll & Zero-Lag Physics
- **Precision Sticky HUD**: Re-engineered the bottom Tycoon Bankroll card with hardware-accelerated physics, locking flush to the global footer without jitter or rubber-banding.
- **Compact Metric Notation**: Integrated smart rounding (`12.5k`, `1.4M`, `2.1B`, `+15/s`) ensuring all currency, portal links, and combat statistics fit cleanly on a single row.
- **Interactive Stat Pills**: Tap any stat or currency pill on mobile to view detailed live metrics and tooltips.

#### 🎮 Streamlined Gameplay & Armory Layout
- **Reorganized Tycoon Interface**: Moved the Receipt Key Redemption card beneath active power-up generators, giving primary focus to active Gold Core clicking and generator upgrades.
- **Reverse-Chronological Battle Logs**: Combat feedback now presents the latest actions first with distinct color-coded alerts (Green = Gains, Red = Damage, Yellow = Criticals, White = Lore).

#### 🔍 Reverse Cart ID & Order Determination
- **Instant Receipt Lookup**: Customers and administrators can enter or paste any Cart ID / Receipt Key to immediately inspect itemization, pricing, and fulfillment state.
- **Offline Order Reconstruction**: Offline physical slips or cross-device carts can be reconstructed and minted directly to their exact Cart ID.

#### 🛡️ Architecture & Modularity Foundations
- **Decomposition Program**: Established subcomponent decomposition boundaries for core domains adhering to NASA JPL Power of 10 and 500-line modularity guidelines.
- **Global Design & Accessibility**: Verified full compliance with WCAG 2.1/2.2 AA standards, dynamic 50%–150% font scaling, and smooth guided tour spotlights.

---

## [v1.2.1] — 2026-09-25

### 🚀 What's New in v1.2.1

#### 🔤 Enhanced Font & UI Scaling Controls
- **Micro & Tiny Text Presets**: Added instant **50%** and **75%** font scale presets in the Accessibility Popover for high-density displays.
- **Lower Minimum Scale**: Lowered the minimum font scaling limit down to 50% for maximum customization across all screens.

#### 🧭 Smooth Guided Tour Spotlights
- **Clean Focus Trapping**: Improved tour spotlight cleanup so focus highlight rings instantly disappear when advancing steps or exiting the interactive walkthrough.

#### 📱 Mobile Navigation & Tycoon Header Optimizations
- **Dynamic Compact Header**: Navbar automatically compresses when scrolling on mobile devices to preserve screen space.
- **Sticky Bankroll Elevation**: Player stats and bankroll totals remain visible and properly cushioned below the top header while scrolling.

#### ⚔️ Combat Log & Battle Feedback
- **Latest First**: Battle log events now display in reverse chronological order, putting the newest combat actions at the top.
- **Vibrant Color Cues**: Action logs feature clear color coding (Green = Gains, Red = Damage, Yellow = Alerts, White = Story/Shop).

#### 🛡️ ITIL v4 Governance & Dual-Cadence Tracking
- Upgraded agent governance workflow with high-frequency developer changelogs (`CHANGELOG_DEV.md`) and strict WCAG 2.1/2.2 AA accessibility verification.

---

## [v1.2.0] — 2026-09-20

### 🏆 Initial Milestone Release
- Storefront with bulk pack discounts & receipt code generator.
- Boss Rush gauntlet with real-time tycoon mining mechanics.
- Firebase Authentication and Global Cloud Leaderboard.
- RapportVerse affiliation & interactive 20-step system tour.
