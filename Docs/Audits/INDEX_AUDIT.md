# System Audit & Codebase Scorecards (`/Docs/Audits/INDEX_AUDIT.md`)

## 📋 Granular Audit Reports & Scorecards
- [**HTTP Security & Vulnerability Defense Audit**](./HTTP_SECURITY_AUDIT.md) — Comprehensive remediation of CSP, HSTS, X-Content-Type, X-Frame-Options, COOP/CORP/COEP, and RFC 9116 `security.txt`.
- [**NASA JPL Power of 10 Safety Scorecard**](./NASA_JPL_POWER_OF_10.md) — Bounded loops, deterministic control flows, memory safety, and null defenses.
- [**WCAG 2.1/2.2 AA Accessibility Audit**](./WCAG_ACCESSIBILITY_AUDIT.md) — High contrast palette, keyboard traps avoidance, font scaling, and ARIA semantics.
- [**Modularity & Line Ceiling Scorecard**](./MODULARITY_SCORECARD.md) — Decomposition metrics and single-responsibility subcomponent breakdown.

---

## System Quality Scorecard

| Category | Standard / Baseline | Current Status | Notes |
| :--- | :--- | :--- | :--- |
| **Compilation & Linting** | `tsc --noEmit` & `vite build` | 🟢 0 Warnings, 0 Errors | Verified via `compile_applet` & `lint_applet` |
| **Safety-Critical Rules** | NASA JPL Power of 10 | 🟢 Compliant | Simple control flow, bounded loops, no unhandled async |
| **Accessibility** | WCAG 2.1/2.2 AA | 🟢 Compliant | High contrast ratios, focus rings, ARIA labels, dynamic font scaling (50%-165%) |
| **Service Management** | ITIL v4 Change Enablement | 🟢 Compliant | Standard change logging in `CHANGELOG_DEV.md` & `CHANGELOG.md` |
| **Security** | Firebase Rules & Secrets | 🟢 Audited | Firestore security rules enforce auth constraints, no client secrets |
| **HTTP Security & Headers** | OWASP Top 10 & RFC 9116 | 🟢 Enforced | CSP, HSTS, X-Content-Type, X-Frame-Options, COOP, CORP, COEP & `security.txt` |

## Module Line Ceiling Audit
- `App.tsx`: 597 lines (Below 1000 line ceiling)
- `GameView.tsx`: 408 lines (Reduced from 1,800 lines down to 408 lines via 5 subcomponents)
- `utils/combatEngine.ts`: 145 lines (Combat turn calculations, boss scaling formulas, damage & yield calculators)
- `utils/shopUtils.ts`: 125 lines (Shared pack units, cart calculators, and key generation bridge helpers)
- `game/TycoonGenerators.tsx`: 168 lines (Astral Ore mining clicker with combo bonus & categorized generator matrix)
- `game/BossGauntlet.tsx`: 272 lines (Boss roster grid, pre-fight coin shop, combat logs feed & revive controls)
- `game/KeyRedemptionCard.tsx`: 56 lines (In-store receipt key & promo code redemption interface)
- `game/StatsLeaderboard.tsx`: 314 lines (Player attributes, boss kill/death ledger & Hall of Champions)
- `game/TycoonBankrollCard.tsx`: 168 lines (Real-time bankroll & combat stats bar with dynamic footer clearance)
- `game/BattleModal.tsx`: 254 lines (Arena combat simulation & pre-fight gold shop)
- `ShopView.tsx`: 349 lines (Storefront orchestrator - reduced from 733 lines via 3 subcomponents and shared logic in `utils/shopUtils.ts`)
- `shop/ShopItemCard.tsx`: 238 lines (Compact card with item stats, inline descriptions, and automated milestone optimization displays)
- `shop/ShopCategoryNav.tsx`: 56 lines (Responsive, horizontal scrolling category pills layout)
- `shop/ShopCartDrawer.tsx`: 89 lines (Compact backdrop modal inventory drawer listing cart items and values)
- `LoreBookView.tsx`: 157 lines (Lightweight layout orchestrator - reduced from 1,345 lines via 5 subcomponents in `components/lore/`)
- `lore/ChroniclesTab.tsx`: 328 lines (Historical Chapter browser with canonical chronologies, player combat records & active kills count)
- `lore/StoryWeaverTab.tsx`: 205 lines (Sandbox campaign editor with automated templates & draft calculators)
- `lore/ItemCompendiumTab.tsx`: 245 lines (Artifact directory indexer with multi-property search and download triggers)
- `lore/BossBestiaryTab.tsx`: 115 lines (Boss Threat registry database tracking Weaknesses & Counters)
- `lore/AncientLegendTab.tsx`: 105 lines (Systems codex explaining formulas, currencies & reagent nomenclature keys)
- `GuidedTour.tsx`: 148 lines (Reduced from 740 lines down to 148 lines via 3 modular subcomponents and extracted data configuration)
- `data/tourSteps.ts`: 360 lines (TourStep interfaces, Express 5-Step & Grand 20-Step walkthrough configurations)
- `tour/TourModeChoiceCard.tsx`: 105 lines (Tour onboarding mode selector UI)
- `tour/TourStepPopover.tsx`: 128 lines (Step progress bar, description popover & keyboard navigation controls)
- `tour/TourSpotlightOverlay.tsx`: 48 lines (Element scroll-into-view & beacon spotlight highlight observer)
- `FontScaleControl.tsx`: 243 lines (Accessibility dynamic font scaler)
- `Footer.tsx`: 258 lines (Ecosystem partnership & legal compliance)
- `AdminModal.tsx`: 348 lines (Reduced from 1,478 lines via 5 modular subcomponents in `components/admin/`)
- `admin/AdminCartInspector.tsx`: 300 lines (Reverse Cart ID & key lookup, order determination, itemization & cart reconstruction)
- `admin/AdminCodeGenerator.tsx`: 168 lines (Custom receipt key generator with item payload queue & custom pricing)
- `admin/AdminCodeTracking.tsx`: 145 lines (Receipt key inventory, search/filter & redemption toggles)
- `admin/AdminUserModeration.tsx`: 178 lines (Player account moderation, leaderboard purge & stat resets)
- `admin/AdminBalanceConfig.tsx`: 202 lines (Game balance mechanics tuner, revival cost scaling & boss drop multipliers)
- `AccountModal.tsx`: 550 lines (Profile orchestrator - reduced from 879 lines via 5 subcomponents in `components/account/`)
- `account/LiveHeroStats.tsx`: 150 lines (Player profile stats summary widget showing Power Score, Slain Bosses, etc.)
- `account/AccountQuickBadge.tsx`: 80 lines (Symmetrical card displaying credentials, status badges, and cloud syncer)
- `account/EditProfileForm.tsx`: 200 lines (Custom credentials edit form with customizable hero name and selection titles)
- `account/GuestAuthForm.tsx`: 130 lines (Tabbable input panel managing authentication states)
- `account/LocalResetOptions.tsx`: 150 lines (Wipe tool providing absolute zero slate and baseline starter actions)
