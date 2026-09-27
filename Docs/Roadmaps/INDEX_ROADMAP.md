# System Roadmap & Milestone Index (`/Docs/INDEX_ROADMAP.md`)

## Active Horizon

### Milestone 1.3.1 — Co-Op Horde Assaults & Multi-Champion World Boss Raids
- [ ] Group formation mechanisms connecting squad invite networks.
- [ ] Wave-based Horde battle encounters with escalating enemy clusters.
- [ ] Shared squad telemetry and combined multi-champion Power Score bonuses.

### Milestone 1.3.0 — PWA Deployment Desk, Squad Recruitment, Seasonal Leaderboard & Architecture Hardening
- [x] Dedicated Cross-Platform PWA Installation Desk with Chromium prompt capture and native iOS Safari Web Share API triggers.
- [x] Recurring Monthly PWA Champion Grant (`5,000 Coins + 250 Gems`) with calendar-month validation.
- [x] Champion Squad Recruitment & Invite Code System (`ARMORY-XXXXX`) awarding +3,000 Coins & +150 Gems.
- [x] **Seasonal Leaderboard & Tracking System for Monthly / Yearly Rewards**:
  - Multi-category leaderboards tracking Power Score, Total Boss Kills, Most Deaths (Gladiator perseverance), Max Single-Hit Damage, Most Dodges, Most Specials, Total Gold Earned, and Total Gems Earned.
  - Per-Boss Specialists Matrix tracking Top Executioner (Most Kills) and Undying Challenger (Most Deaths) across all 8 world bosses.
  - Interactive Seasonal Reward Claim Station offering tiered gold, gem, and title unlocks (e.g. *Apex Voidwalker*, *Iron Will*, *Cataclysm*, *Immortal Champion*).
  - Modular subcomponents under `/src/components/game/leaderboard/` adhering to NASA JPL Rule 4 (<200 lines per subcomponent).
- [x] Merged documentation topology consolidating `/docs` and `/Docs` into unified `/Docs/` tree with dedicated `/Docs/Agent_Instructions/`, `/Docs/LoreBook/`, `/Docs/Audits/`, and `/Docs/Roadmaps/` compendiums.
- [x] Compact user reset cards layout and side-by-side horizontal mobile arcade metrics.

---

## Completed Milestone Archive

### Milestone 1.2.5 — Shop & Profile Architecture Modular Decomposition (Completed 2026-09-27)
- [x] Decomposed monolithic `ShopView.tsx` (733 lines) into single-responsibility subcomponents (`/src/components/shop/`) adhering to NASA JPL Rule 4 (<200 lines per subcomponent).
- [x] Isolated Item Catalog Cards (`ShopItemCard.tsx`), Cart Preview Drawer (`ShopCartDrawer.tsx`), and Category navigation tabs (`ShopCategoryNav.tsx`).
- [x] Extracted shared calculation functions (`getPackUnits`, price calculators, optimization algorithms) into `/src/utils/shopUtils.ts`.
- [x] Decomposed `AccountModal.tsx` into 5 single-responsibility subcomponents in `/src/components/account/` (`LiveHeroStats.tsx`, `AccountQuickBadge.tsx`, `EditProfileForm.tsx`, `GuestAuthForm.tsx`, and `LocalResetOptions.tsx`).
- [x] Cleanly refactored container dimensions, desktop padding scales, and header line wraps.
- [x] Maintained full integration test coverage, Firebase key sync, and zero breaking changes across views.

### Milestone 1.2.4 — Modular Decomposition, Combat Engine, & Onboarding Bounties (Completed 2026-09-26)
- [x] Successfully decomposed monolithic `AdminModal.tsx` into 5 single-responsibility subcomponents (`/src/components/admin/`).
- [x] Decomposed `GuidedTour.tsx` into 3 modular UI subcomponents and decoupled static step definitions.
- [x] Isolated combat simulation mechanics, formulas, and attribute scaling into `combatEngine.ts`.
- [x] Implemented multi-tier onboarding tours (Express vs. Grand) with automated reward claims and anti-abuse safeguards.
- [x] Centralized system metadata into unified `appConfig.ts`.

### Milestone 1.2.1 — Accessibility & Mobile Navigation Polish (Completed 2026-09-25)
- [x] Added 50% and 75% font scale presets and lowered MIN_SCALE boundary.
- [x] Clean spotlight cleanup on tour navigation and exit.
- [x] Reverse chronological combat log with color-coded event types.
- [x] Sticky mobile header compression and bankroll margin padding.
- [x] Dual-cadence version logging framework (`CHANGELOG_DEV.md` and `CHANGELOG.md`).

### Milestone 1.2.0 — Core Power-Up Armory Release (Completed 2026-09-20)
- [x] Gamified commerce storefront, bulk discounts & cryptographic keys.
- [x] Real-time Boss Rush gauntlet & tycoon mining engine.
- [x] Firebase Firestore cloud leaderboard & authentication.
- [x] RapportVerse alliance integration.
