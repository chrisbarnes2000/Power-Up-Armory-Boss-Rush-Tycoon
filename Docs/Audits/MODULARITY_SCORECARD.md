# Modularity & Architecture Line Ceiling Scorecard

> **Location**: `/Docs/Audits/MODULARITY_SCORECARD.md`  
> **Standard**: Single Responsibility Principle & NASA JPL Rule 4 (<200 lines per subcomponent, <1000 lines per root orchestrator)  
> **Status**: 🟢 PASS — 100% Decomposed

---

## 📊 Module Line Count Ledger

### Core Views & Orchestrators

| Module | Purpose | Line Count | Modularity Status |
| :--- | :--- | :---: | :---: |
| `src/App.tsx` | Central application shell & cloud synchronizer | ~680 | 🟢 Pass (<1000 ceiling) |
| `src/components/ShopView.tsx` | Armory storefront orchestrator | ~350 | 🟢 Pass (Decomposed into 3 subcomponents) |
| `src/components/GameView.tsx` | Boss gauntlet & tycoon mining orchestrator | ~400 | 🟢 Pass (Decomposed into 6 subcomponents) |
| `src/components/LoreBookView.tsx` | Compendium layout & export coordinator | ~160 | 🟢 Pass (Decomposed into 5 subcomponents) |
| `src/components/AdminModal.tsx` | Admin panel & telemetries orchestrator | ~350 | 🟢 Pass (Decomposed into 5 subcomponents) |
| `src/components/AccountModal.tsx` | User profile & cloud sync coordinator | ~550 | 🟢 Pass (Decomposed into 6 subcomponents) |
| `src/components/GuidedTour.tsx` | Onboarding tour walkthrough shell | ~150 | 🟢 Pass (Decomposed into 3 subcomponents) |

---

### Subcomponent Decompositions

- **Shop Subcomponents (`/src/components/shop/`)**:
  - `ShopItemCard.tsx`: Individual item catalog card with bundle pricing & purchase controls.
  - `ShopCategoryNav.tsx`: Category filtering & horizontal scrolling pill bar.
  - `ShopCartDrawer.tsx`: Cart contents drawer, discount calculator & checkout bridge.
- **Account Subcomponents (`/src/components/account/`)**:
  - `LiveHeroStats.tsx`: Live Power Score & attribute progress card.
  - `AccountQuickBadge.tsx`: Compact user credentials & cloud sync widget.
  - `EditProfileForm.tsx`: Hero avatar & title customization panel.
  - `SquadRecruitSection.tsx`: Personal squad invite code generator & reward redemption desk.
  - `LocalResetOptions.tsx`: Compact character wipe & starter pack restoration presets.
  - `GuestAuthForm.tsx`: Email/Password & Google Sign-In interface.
- **Game Subcomponents (`/src/components/game/`)**:
  - `TycoonGenerators.tsx`: Mining clicker, multipliers, and generator grid.
  - `BossGauntlet.tsx`: Boss battle card roster & active challenge feed.
  - `BattleModal.tsx`: Combat duel visualization, turn engine, and pre-fight coin shop.
  - `StatsLeaderboard.tsx`: Master coordinator orchestrating seasonal boards and reward claim stations.
  - `TycoonBankrollCard.tsx`: Bankroll stats banner with responsive clearance.
  - `KeyRedemptionCard.tsx`: Cryptographic receipt key & promo validator.
  - **Leaderboard Subcomponents (`/src/components/game/leaderboard/`)**:
    - `LeaderboardSeasonHeader.tsx`: Countdown timers, prize pool banners, and seasonal mode switchers.
    - `LeaderboardCategoryNav.tsx`: Horizontal scrollable pills for all 10 metric categories & rewards.
    - `LeaderboardRosterTable.tsx`: Full ranked champions table with custom metric columns and user badges.
    - `BossSpecialistGrid.tsx`: Per-boss matrix tracking Top Executioner (Most Kills) and Undying Challenger (Most Deaths).
    - `SeasonalRewardClaimStation.tsx`: Monthly & yearly claimable reward tiers with interactive progress bars.
    - `HeroAttributeSummary.tsx`: Hero attributes card tracking attack, defense, max damage, dodges, and specials.
