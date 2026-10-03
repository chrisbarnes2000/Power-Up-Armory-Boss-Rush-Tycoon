# 📐 Z-Index Layering & Stacking Context Guide

> **Document Version**: 2.0.0  
> **Last Updated**: 2026-10-02  
> **Governance**: Harmonized UI/UX Stacking Architecture & NASA JPL Rule 10 Layout Safety Standard  
> **Status**: 🟢 Active System Standard  

---

## 1. Executive Summary & Stacking Philosophy

To guarantee zero visual misalignment, unwanted element overlap, or clipped interactive targets across mobile web, desktop ultrawide, and high-contrast accessibility modes, **Power-Up Armory & Boss Rush Tycoon** enforces a strict **7-Tier Stacking Context Hierarchy**.

Every fixed, sticky, or absolute component MUST align strictly to its designated Z-index tier. Bypassing these standardized tiers or using uncoordinated arbitrary `z-[...]` values is strictly forbidden.

---

## 2. Harmonized Z-Index Stacking Context Matrix

| Tier Level | Scale / Class | Z-Index | Purpose & Target Components |
| :--- | :--- | :--- | :--- |
| **0. Base Page Canvas** | `z-0` – `z-10` | `0` – `10` | Document flow, scrollable grid containers (`#shop-items-grid`), tab views, and background cards (`ShopView`, `GameView`, `LoreBookView`). |
| **1. Fixed Navigation & HUD** | `z-20` – `z-50` | `20` – `50` | Fixed/sticky structural bars:<br>• `#app-global-footer` (`z-20`) <br>• `#tycoon-bankroll-card` real-time statbar (`z-40`) <br>• `#global-navbar` & mobile menu (`z-50`). |
| **2. Popovers & Drawers** | `z-[150]` – `z-[200]` | `150` – `200` | Floating popups & side drawers:<br>• `FontScaleControl` popover (`z-[150]`) <br>• `#shop-cart-preview-container` cart drawer (`z-[200]`). |
| **3. Floating Toasts & Alerts** | `z-[300]` | `300` | Floating status notifications:<br>• `bountyToast` seasonal reward alert banner (`z-[300]`). Floats above HUD/header without obscuring modals. |
| **4. Fullscreen Overlay Modals** | `z-[500]` | `500` | Full-screen backdrop dialogs:<br>• `AccountModal`<br>• `AdminModal`<br>• `BattleModal`<br>• `ChangelogModal`<br>• `PWAInstallModal`<br>• `CookieConsentBanner`<br>• `CloudSaveConflictModal`. |
| **5. Onboarding Guided Tour** | `z-[1000]` | `1000` | Interactive onboarding walkthrough spotlight ring (`z-[1000]`), step spotlight card, and backdrop blur. |
| **6. Atmospheric FX & Canvases** | `z-[9900]` – `z-[9980]` | `9900` – `9980` | Canvas FX overlays:<br>• `HealthMeshVignette` 6s progressive red edge filter (`z-[9900]`)<br>• `ParticleOverlay` confetti & coins canvas (`z-[9950]`)<br>• `BattleStartIntro` crossed swords animation (`z-[9980]`). |
| **7. Top Interaction Layer** | `z-[10000]` | `10000` | Global touch and hover tooltips (`GlobalTouchTooltip` / `GlobalTooltip`). Always renders on top of all modals, tours, and particle canvases to maintain 100% legibility. |

---

## 3. Comprehensive Component Inventory & Mapping

### A. Base Canvas & In-Page Flow (`z-0` to `z-10`)
* **`ShopView.tsx`**: Item cards grid (`#shop-items-grid`), category filter bar (`z-10`).
* **`GameView.tsx`**: Generator matrix, mining clicker console (`#tycoon-mine-container`), and boss cards (`z-10`).
* **`LoreBookView.tsx`**: Chronicle chapters, story weaver quill editor, item compendium (`z-10`).
* **`ChroniclesTab.tsx`**: Book page spine and parchment paper texture layers (`z-10` to `z-20`).

### B. Navigation & HUD Controls (`z-20` to `z-50`)
* **`Footer.tsx`**: Global page footer (`#app-global-footer`) (`z-20`).
* **`TycoonBankrollCard.tsx`**: Bottom fixed real-time bankroll statbar (`#tycoon-bankroll-card`) (`z-40`). Dynamically measures footer collision and lifts cleanly above `#app-global-footer`.
* **`Header.tsx`**: Sticky top navigation bar (`#global-navbar`) (`z-50`).

### C. Drawers & Popover Controllers (`z-[150]` to `z-[200]`)
* **`FontScaleControl.tsx`**: Dynamic 50%–165% font scaling popover panel (`#font-scale-popover`) (`z-[150]`).
* **`ShopCartDrawer.tsx`**: Right-hand shopping cart preview drawer (`#shop-cart-preview-container`) (`z-[200]`). Backdrop overlay set to `z-[150]`.

### D. Floating In-Page Toasts (`z-[300]`)
* **`App.tsx` (`bountyToast`)**: Floating seasonal bounty unlock banner (`z-[300]`). Positioned at `top-20 right-6`, animating smoothly above navigation bars while remaining under active fullscreen modals.

### E. Fullscreen Overlay Modals (`z-[500]`)
All full-screen backdrop dialogs enforce `z-[500]` with `backdrop-blur-md bg-black/80` to completely cover page content, drawers, and toasts:
* **`BattleModal.tsx`**: Turn-based arena combat simulation dialog (`z-[500]`).
* **`AccountModal.tsx`**: User profile, squad recruitment codes, and title management (`z-[500]`).
* **`AdminModal.tsx`**: Game balance config and user moderation panel (`z-[500]`).
* **`ChangelogModal.tsx`**: Version release notes and public broadcast updates (`z-[500]`).
* **`PWAInstallModal.tsx`**: Cross-platform home-screen installation instructions (`z-[500]`).
* **`CookieConsentBanner.tsx`**: GDPR privacy preferences dialog (`z-[500]`).
* **`App.tsx` (`CloudSaveConflictModal`)**: Dual cloud vs. local storage reconciliation modal (`z-[500]`).

### F. Guided Onboarding Tour (`z-[1000]`)
* **`GuidedTour.tsx`**: Step spotlight card (`z-[1000]`). Highlights targeted DOM elements while dimming background UIs.

### G. Atmospheric FX & Canvas Overlays (`z-[9900]` to `z-[9980]`)
* **`ParticleFX.tsx` (`HealthMeshVignette`)**: Progressive blood-red screen edge vignette (`z-[9900]`). Features a 6-second continuous decay loop (`requestAnimationFrame`).
* **`ParticleFX.tsx` (`ParticleOverlay`)**: Fullscreen canvas particle burst overlay (`z-[9950]`).
* **`ParticleFX.tsx` (`BattleStartIntro`)**: Duel commencement crossed blades animation (`z-[9980]`).

### H. Top Interaction Layer (`z-[10000]`)
* **`GlobalTouchTooltip.tsx`**: Global touch and hover tooltip container (`#global-touch-tooltip`) (`z-[10000]`). Positioned dynamically via viewport coordinates, ensuring tooltips are never clipped or hidden behind modals or particle canvases.

---

## 4. Verification & Linting Rules

1. **No Arbitrary Unaligned Values**: Do NOT introduce new arbitrary z-index values (e.g., `z-[123]`, `z-[999]`, `z-[888]`). Always select the exact tier from the Harmonized Z-Index Matrix.
2. **Modal Uniformity**: All fullscreen modals MUST use `z-[500]`.
3. **Tooltip Supremacy**: `GlobalTouchTooltip` MUST remain at `z-[10000]`.
