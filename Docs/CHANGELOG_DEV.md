# Developer Changelog (`/Docs/CHANGELOG_DEV.md`)

> **CADENCE**: High-Frequency Developer Journal. Updated on every work turn / engineering iteration.

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
