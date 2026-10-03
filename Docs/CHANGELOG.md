# Public Changelog (`/Docs/CHANGELOG.md`)

> **CADENCE**: Milestone Frequency. Customer-facing release notes for official public cuts.

---

## [v1.3.3] — 2026-10-02

### 🚀 What's New in v1.3.3

#### 🛍️ Armory Store Tycoon Bankroll & Coin-Gated Checkout
- **Pinned Bankroll Statbar**: Integrated the live `TycoonBankrollCard` into the Armory Store (`ShopView`), providing continuous visibility into player Gold Coins, Astral Gems, passive gold yield, boss vanquishes, and core combat attributes (HP, ATK, DEF, SPD, PS).
- **Coin-Gated Checkout Validation**: Storefront checkout is now strictly validated against player gold reserves. Insufficient coins disable checkout with clear deficit feedback (`Need X more coins`). Completing checkout automatically deducts the required gold from the player's bankroll.
- **Admin In-Person Cash Payment Bypass**: Added an administrator toggle (`Shop Bypass: ON (Cash) / OFF (Gold)`) in User Moderation. When active, gold costs and deductions are waived with a clear `💵 Cash Clearance Bypass` indicator, allowing immediate item key generation for in-person cash payments.
- **In-Store Health Pack Quick Heal**: Players can now use consumable Health/Revive packs directly from the Armory Store bankroll bar to instantly restore fallen or wounded heroes to 100% health with rebirth particle FX.

#### 👓 Zenni Optical Referral & Rewards Synergy
- **Ecosystem Affiliate Hub**: Embedded an official Zenni Optical showcase card in the Partners & Affiliates portal (`PartnersView`) featuring the verified referral link (`http://rwrd.io/r7jn9f2?c`).
- **"Give $15, Get $15" Rewards Program**: Direct access to $15 off first-time eyewear purchases and 300 Zenni Rewards points per referral, with scalable milestones up to $150 (3,000 points).
- **Everyday Member Loyalty Perks**:
  - 🚚 Free standard US shipping on all orders over $65²
  - 💸 Earn 1 point on every dollar spent
  - 🎂 Special birthday rewards
- **In-Game Cross-Play Redemption**: Added code redemption support for `ZENNI`, `ZENNI15`, and `ZENNIOPTICAL` at the partner desk, awarding +3,000 Gold and +150 Gems.
- **Compliance & Universal Documentation**: Authored universal integration guide [`/Docs/PublicRelations/Affiliate_ZenniOptical.md`](./PublicRelations/Affiliate_ZenniOptical.md) linking official Zenni Privacy Policy and Terms of Use.

#### 🛡️ Complete HTTP Security & Vulnerability Hardening
- **HTTP Security Headers Suite**: Enforced full security headers across all server responses (`vite.config.ts`):
  - **Content Security Policy (CSP)**: Strict multi-directive policy restricting unauthorized scripts, styles, and frames while preserving AI Studio preview compatibility via `frame-ancestors`.
  - **HTTP Strict Transport Security (HSTS)**: `max-age=31536000; includeSubDomains; preload`.
  - **X-Content-Type-Options**: `nosniff`.
  - **X-Frame-Options**: `SAMEORIGIN` (coordinated with CSP `frame-ancestors`).
  - **Referrer-Policy**: `strict-origin-when-cross-origin`.
  - **Permissions-Policy**: Disables camera, microphone, geolocation, payment, and USB APIs.
  - **COOP / CORP / COEP**: `same-origin-allow-popups` (secures origin while maintaining Google/Firebase Auth popup compatibility), `cross-origin`, and `credentialless`.
- **RFC 9116 `security.txt`**: Deployed official security disclosure contact coordinates at `/.well-known/security.txt` and `/security.txt`, indexed in `robots.txt` and `index.html`.
- **Vulnerability Disclosure Policy**: Published official policy and safe harbor guidelines at `/public/security-policy.html`.
- **Audit Documentation**: Detailed in [`/Docs/Audits/HTTP_SECURITY_AUDIT.md`](./Audits/HTTP_SECURITY_AUDIT.md).

---

## [v1.3.1] — 2026-09-27

### 🚀 What's New in v1.3.1
- **Interactive Roadmap Portal**: Replaced the generic feedback system with a high-fidelity Roadmap dashboard tracking project-specific milestones like *Co-Op Horde Assaults* and *Elemental Affinities*.
- **Community Engagement Engine**: Added the ability to vote on upcoming features, with real-time counters and interactive visual feedback.
- **Advanced Feedback Loop**: Updated feedback channels to focus on core project pillars (Bosses, Weapons, Balance, Mechanics).
- **Style Hardening**: Refined the updates UI with glassmorphism effects, interactive glows, and optimized typography for better legibility across all champion scales.

### 🛠️ Polish & Performance
- **Navigation Clarification**: Renamed the "Feedback" tab to "Roadmap" to better reflect the collaborative nature of the project's evolution.
- **UI Diagnostics**: Updated the "Preview Build" status indicator to an amber theme, distinguishing pre-release environments from system errors.
- **Historical Backlog**: Fully bundled the historical record of all releases directly into the app for offline reference and deep transparency.

## [v1.3.0] — 2026-09-27

### 🚀 What's New in v1.3.0

#### 👥 Squad Recruitment & Co-Op Invite Code System
- **Personal Squad Invite Codes**: Every champion now has their own unique Squad Invite Code (`ARMORY-XXXXX`) available in the Account Modal with instant one-click clipboard copying and native device sharing.
- **Recruitment Grants (+3,000 Coins + 150 Gems)**: Redeeming a friend's squad invite code awards an instant one-time champion bonus of **+3,000 Gold** and **+150 Gems**, while advancing your Squad Formation tier.
- **Co-Op Horde & World Boss Roadmap**: The squad recruitment network establishes your party formation in preparation for upcoming cooperative horde defense battles and multi-champion World Boss raids.

#### 📱 Progressive Web App (PWA) Installation Desk & Monthly Champion Grant
- **Cross-Platform Installation Guides**: Added a dedicated PWA installation desk supporting Chromium browsers (Chrome, Edge, Opera on PC & Android) with automatic one-tap prompt capture, and tailored step-by-step guidance for Safari on iOS.
- **Native Safari iOS Share Sheet Trigger**: Integrated a quick-launch button using the standard `navigator.share` Web Share API to open the Safari share panel directly on iPhone and iPad for easy "Add to Home Screen" actions.
- **Monthly PWA Champion Grant (5,000 Coins + 250 Gems)**: Champions who install the app or launch in standalone mode can claim a recurring monthly grant of **+5,000 Gold** and **+250 Gems** once per calendar month, synced to both local storage and cloud profiles.

#### 🕹️ Horizontal Side-by-Side Arcade Battle Display
- **Space-Efficient Combat Splits**: Shifted the combat live metrics from a stacked vertical layout into a responsive, side-by-side split row inside the battle logging card. Now, the Hero health is pinned on the left and the Boss health is on the right, punctuated by a central glowing `VS` badge.
- **Mobile-Tailored Ergonomics**: Configured custom mobile breakpoints (`text-[10px]`, `h-1.5` bar heights, tight spacing) that compact automatically on small phones, giving players complete log visibility and smooth arcade animations.

#### ⚔️ Enlarged Arena Visuals & Compressed Pre-Fight Coin Shop
- **Epic Battle Proportions**: Substantially enlarged the `BossGauntlet` duel visualization cards inside the modal overlay. Hero/Boss avatars scale up to a massive **text-7xl**, names are printed in a striking **text-xl font-black**, and health bars are thickened into glowing **h-5** progress gauges to emphasize the battle action.
- **Horizontal Row Mobile Adaptability**: Forced a side-by-side **horizontal row** inside the modal on small phones. Scales down card elements responsively (e.g., text-3xl emojis, text-xs text, and 100px-wide HP bars), guaranteeing that the Hero, VS Badge, and Boss remain completely visible side-by-side on any mobile screen.
- **Micro Pre-Fight Coin Shop**: Scaled down the Pre-Fight Coin Shop inside the overlay to maximize combat space. Uses a space-saving side-by-side product grid with mini `p-1.5` buttons and removes redundant descriptive paragraphs when in compact mode.

#### ⚡ Arena Battle Cycling Deck inside Combat Modal Overlay
- **Modal-Integrated Cycling**: Relocated the ready-bosses battle deck from the Arena page tab directly into your dynamic **Arena Combat Modal overlay**! You can now easily review, cycle through, and challenge next-eligible bosses using `◀ Prev`, `Next ▶`, and **⚔️ FIGHT NEXT** triggers without ever leaving or closing the active battle screen.
- **Embedded Progression Support**: If your hero is low on Power Score or fallen, the modal-embedded controller provides interactive guidance showing exactly what stats are needed to unlock subsequent arena challenges.

#### 🏅 Consecutive Kill & Underdog Adrenaline Streak Bonuses
- **Kill Streak Power Multipliers**: Track your win streaks! Consecutive boss victories without dying award a **`+5%` Power Score bonus per consecutive win (up to +50%)**.
- **Underdog Death Recovery**: Help when you're stuck! Consecutive defeats inside the arena award an adrenaline-fueled underdog bonus of **`+5%` Power Score per consecutive death (up to +30%)**, giving you the extra grit needed to break out of death cycles.

#### 🛡️ Cloud Synchronizer Stability Guardrails
- **Undefined Field Prevention**: Built an automatic payload filter (`sanitizeForFirestore`) that sanitizes cloud data arrays and nested structures before saving. This solves a rare Google Firestore exception where state properties might carry an unexpected `undefined` value.
- **Boss Respawn Time Recovery**: Resolved an issue in the auto-respawn timer that passed `undefined` properties to the database on champion resurrection, ensuring uninterrupted offline/online synchronization.
- **Analytics Spam Reduction**: Debounced user identification calls in `trackUserIdentify` to prevent redundant identification and `updateUser` spam when Auth state changes rapidly.

#### ⚔️ Strategic Combat Speed Tuning & Arena Visuals
- **Slower, More Dramatic Battle Rates**: Slowed down combat simulation turn timeouts from `500ms` to `1400ms`. Each attack, hit, and critical swipe is now distinct, allowing players to fully experience the battle action—laying the foundation for premium high-fidelity 3D animated view overlays later.
- **"ATTACK NEXT" Smart Readiness Guidance**: Integrated a dynamic, orange pulse-animated `🔥 READY TO FIGHT · ATTACK NEXT 🔥` guidance badge right above the `FIGHT` button on un-conquered bosses that the champion is eligible to attack immediately based on current Power Scores.

#### 📚 Lore Book Modular Decomposition
- **Highly Refactored Architecture**: Slashed single-file complexity inside the Item Compendium. Successfully decomposed the massive `LoreBookView.tsx` into multiple, focused submodules in `/src/components/lore/` to maintain safety-critical design specifications.

#### 💡 Real-Time Sandbox Balance Isolation Banners
- **Context-Aware Visual Warnings**: Added visually prominent info banners inside the Game Balance calibration tab. Clearly informs administrators that real-time sliders and numbers represent isolated local sandboxes (persisted to LocalStorage and synced only to their own profile), preserving other players' independent game limits.

#### 🧬 Consolidated Cloud Overrides & More Actions Dropdown
- **Cohesive `z-50` Dropdown**: Replaced sprawling layout lists with a polished **"⚙️ More Actions"** dropdown on each player moderation card, featuring layered `z-50` overlays that avoid list-item clipping.
- **Persistent Cloud Support Triggers**: Built 4 powerful administrative actions inside the dropdown that write directly to the target user's persistent Firestore cloud account:
  1. **🧬 Sync God Config**: Pushes your currently adjusted sandbox sliders as that user's baseline game balance override.
  2. **🩹 Grant +5 Revive Packs**: Rewards 5 free extra revives to the user's online inventory.
  3. **⚡ Clear Death & Revive**: Resurrects a fallen champion remotely in the cloud.
  4. **🔄 Reset Death Scaling Counter**: Clears progressive revival pricing penalties back to 0 for the player.
- **Mobile Left-Constrained Alignment**: Designed smart CSS overrides that left-constrain the dropdown menu on mobile screens (`left-0`), transitioning to right-aligned (`md:right-0 md:left-auto`) on desktop screens.

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
