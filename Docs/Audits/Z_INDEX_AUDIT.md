# Z-Index Audit & Stacking Strategy

## 1. Overview
The application previously relied on arbitrary high magic numbers for Z-index (`z-[9999]`, etc.). This creates brittle stacking contexts and makes future UI development unpredictable.

## 2. Standardized Stacking Scale (Tailwind)
We have introduced a standardized Z-index scale in `src/index.css` via the Tailwind theme. Use these class names instead of magic numbers:

| Utility Class | Purpose | Value |
| :--- | :--- | :--- |
| `z-base` | Default background elements | 0 |
| `z-low` | Subtle layered elements | 10 |
| `z-mid` | HUDs, sticky navs, standard layered content | 50 |
| `z-high` | High priority UI, hover states | 100 |
| `z-modal` | Modals, drawers | 150 |
| `z-overlay` | Global overlays | 200 |
| `z-toast` | Toasts, notifications | 300 |

## 3. Audit Findings (Current State)
*Many components still use hardcoded values.*
- **To Refactor**: `GuidedTour` (`z-[999]`), `AdminUserModeration` (`z-[999]`), `StatWarningModal` (`z-[300]`).
- **Standardized**: `CookieConsentBanner`, `GlobalTouchTooltip`.

## 4. Maintenance Rule
1. **Never use magic numbers** (e.g., `z-[9999]`).
2. If a new UI element requires a new layer, propose adding it to the `src/index.css` theme definition first, ensuring it respects this hierarchy.
3. If an existing component is found with a high magic number, refactor it to the closest appropriate standard class.
