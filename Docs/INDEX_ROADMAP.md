# System Roadmap & Milestone Index (`/Docs/INDEX_ROADMAP.md`)

## Active Horizon

### Milestone 1.3.0 — Enhanced Analytics & Social Share Cards
- [ ] Integration of OpenGraph social share cards and rich Schema.org structured data (JSON-LD).
- [ ] Automated telemetry event mapping for boss defeats and shop purchases.
- [ ] Expanded achievements system in Lore Book.

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
