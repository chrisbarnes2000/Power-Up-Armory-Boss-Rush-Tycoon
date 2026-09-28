# Analytics Conversion Funnels & Telemetry Architecture Guide

> **Platforms Covered**: Vemetric, Google Analytics 4 (GA4), and Firebase Analytics  
> **App Version**: Power-Up Armory Boss Rush v1.3.0  
> **Governance Standard**: NASA JPL Power of 10 & ITIL v4 Service Management Compliant  
> **Ecosystem Partners**: RapportVerse (`https://rapprt.space`), MiniBarnMaster, & Independent Creator Alliances

---

## 📑 Table of Contents

1. [Executive Summary & Telemetry Philosophy](#1-executive-summary--telemetry-philosophy)
2. [Global Context & Parameter Auto-Enrichment](#2-global-context--parameter-auto-enrichment)
3. [Developer Workspace & AI Studio Container Isolation](#3-developer-workspace--ai-studio-container-isolation)
4. [User Privacy & Cookie Consent Architecture](#4-user-privacy--cookie-consent-architecture)
5. [Inward UTM Attribution Engine (RapportVerse & MiniBarnMaster)](#5-inward-utm-attribution-engine-rapportverse--minibarnmaster)
6. [Outward UTM Tagging Taxonomy & Partner Referral Protocol](#6-outward-utm-tagging-taxonomy--partner-referral-protocol)
7. [Inward Deep Linking & State Routing Protocol](#7-inward-deep-linking--state-routing-protocol)
8. [Social Media Sharing & Leaderboard Brag Card Architecture](#8-social-media-sharing--leaderboard-brag-card-architecture)
9. [Complete Telemetry Event Dictionary (All 25+ Points)](#9-complete-telemetry-event-dictionary)
   - [9.1 Navigation & Screen Engagement](#91-navigation--screen-engagement)
   - [9.2 Campaign Attribution & Partner Clicks](#92-campaign-attribution--partner-clicks)
   - [9.3 Social Sharing & Squad Referrals](#93-social-sharing--squad-referrals)
   - [9.4 Onboarding & Interactive Guided Tour](#94-onboarding--interactive-guided-tour)
   - [9.5 Tycoon Economy & Powerup Progression](#95-tycoon-economy--powerup-progression)
   - [9.6 Boss Combat & Gauntlet Battle Engine](#96-boss-combat--gauntlet-battle-engine)
   - [9.7 Lore Book Compendium & Scholar Quests](#97-lore-book-compendium--scholar-quests)
   - [9.8 Armory E-Commerce & Checkout Vouchers](#98-armory-e-commerce--checkout-vouchers)
   - [9.9 User Identity, Authentication & Cloud Leaderboard](#99-user-identity-authentication--cloud-leaderboard)
10. [Core Conversion Funnel Blueprints](#10-core-conversion-funnel-blueprints)
    - [Funnel 1: Onboarding Tour to First Boss Victory](#funnel-1-onboarding-tour-to-first-boss-victory)
    - [Funnel 2: Store Browsing to Checkout Code Generation](#funnel-2-store-browsing-to-checkout-code-generation)
    - [Funnel 3: Tycoon Economy Mining to Seasonal Leaderboard Dominance](#funnel-3-tycoon-economy-mining-to-seasonal-leaderboard-dominance)
    - [Funnel 4: Lore Compendium Exploration to Grand Master Unlock](#funnel-4-lore-compendium-exploration-to-grand-master-unlock)
    - [Funnel 5: Progressive Web App (PWA) Bonus Claim Loop](#funnel-5-progressive-web-app-pwa-bonus-claim-loop)
    - [Funnel 6: Guest to Authenticated Cloud Champion Sync](#funnel-6-guest-to-authenticated-cloud-champion-sync)
    - [Funnel 7: Creator & Partner Inward Referral to Boss Conquest](#funnel-7-creator--partner-inward-referral-to-boss-conquest)
    - [Funnel 8: Social Leaderboard Brag Viral Referral Loop](#funnel-8-social-leaderboard-brag-viral-referral-loop)
11. [Multi-Platform Implementation & Step-by-Step Setup](#11-multi-platform-implementation--step-by-step-setup)
    - [11.1 Vemetric Setup & Fallback Beacon Protocol](#111-vemetric-setup--fallback-beacon-protocol)
    - [11.2 Google Analytics 4 (GA4) Custom Explorations](#112-google-analytics-4-ga4-custom-explorations)
    - [11.3 Firebase Analytics & BigQuery Ingestion](#113-firebase-analytics--bigquery-ingestion)
12. [Auditing, Validation & Verification Protocols](#12-auditing-validation--verification-protocols)

---

## 1. Executive Summary & Telemetry Philosophy

The **Power-Up Armory Boss Rush** telemetry engine is engineered to deliver zero-drop, privacy-compliant behavioral intelligence across three distinct analytics platforms:
- **Vemetric**: Fast, privacy-centric quantitative product tracking with direct beacon failover (`https://cdn.vemetric.com/api/v1/event`).
- **Google Analytics 4 (GA4)**: Conversion marketing, audience cohorts, and e-commerce attribution (`G-YX5LPMCNB8`).
- **Firebase Analytics**: Real-time applet session analytics integrated directly into Google Cloud Firestore.

All telemetry dispatches are centralized inside `/src/lib/analytics.ts`. Direct ad-hoc calls to third-party SDKs are strictly prohibited by code governance to guarantee deterministic payload enrichment, environment isolation, and strict consent adherence.

---

## 2. Global Context & Parameter Auto-Enrichment

Every single event emitted through `trackEvent(eventName, params)` is automatically injected with persistent session metadata and campaign attribution before dispatch. You never need to pass these manually:

| Injected Property | Type | Description | Example Value |
| :--- | :--- | :--- | :--- |
| `user_id` | string | Authenticated Firebase UID or persistent client device ID | `usr_a8f9c2d1` or `client_x7z912a` |
| `client_id` | string | Unique client browser installation ID from `localStorage` | `client_9a2b8e317d` |
| `registered_user` | boolean | `true` if signed into an authenticated profile, else `false` | `true` |
| `attr_source` | string | Inward campaign source attribution (first/last touch) | `'rapportverse'`, `'minibarnmaster'`, `'twitter'` |
| `attr_medium` | string | Inward channel medium | `'partner_network'`, `'creator'`, `'social_brag'` |
| `attr_campaign` | string | Inward campaign or initiative name | `'barn_crossplay'`, `'leaderboard_stats'` |
| `attr_creator` | string? | Name of referring content creator or streamer | `'MiniBarnMaster'` |
| `attr_squad_invite`| string? | Referring player's squad invite code | `'ARMORY-ARTHU'` |
| `environment` | string | Execution environment flag | `'production'` or `'dev_beta'` |
| `environment_tag` | string | Standardized filter tag | `'production'` or `'dev/beta'` |
| `is_dev_preview` | boolean | Set to `true` when running inside preview or local dev hosts | `false` |
| `app_channel` | string | Distribution channel indicator | `'production'` or `'dev_workspace_preview'` |
| `user_email` | string? | Sanitized email of authenticated account (if present) | `player@example.com` |
| `player_name` | string? | Display name (prefixed with `[DEV/BETA]` in dev preview) | `'[DEV/BETA] Arthur'` or `'Arthur'` |
| `page_location` | string | Complete URL at time of trigger | `https://rapprt.space/game` |
| `page_path` | string | Normalized relative route | `'/game'`, `'/shop/weapons'` |
| `timestamp` | string | ISO 8601 UTC timestamp of event generation | `2026-09-27T16:45:00.000Z` |

---

## 3. Developer Workspace & AI Studio Container Isolation

To protect production analytics integrity and marketing funnel metrics, the analytics library includes automated host detection via `isDevPreviewContainer()`:

### Ignored Dev Patterns:
- `localhost`, `127.0.0.1`, `0.0.0.0`
- `ais-dev-`, `us-east5.run.app`, `run.app`
- `googleusercontent.com`, `aistudio.google.com`
- `cloudshell.dev`, `webcontainer.io`, `stackblitz.io`

### Automated Behavioral Isolation:
1. **Event Name Tagging (`getTaggedEventName`)**: In developer containers, all event names are automatically prefixed with `dev_` (e.g., `boss_battle_started` becomes `dev_boss_battle_started`). Production environments emit clean, untagged event names.
2. **Environment Segment**: The `environment` property is set to `'dev_beta'` and `app_channel` is `'dev_workspace_preview'`.
3. **Filtering in Dashboards**: Product managers can simply exclude `environment = dev_beta` or filter out event names starting with `dev_` in GA4 or Vemetric funnels to view pure production metrics.

---

## 4. User Privacy & Cookie Consent Architecture

In compliance with GDPR, ePrivacy, and CCPA standards, no tracking cookies or marketing pixels fire until user consent preferences are evaluated:

| Category | Storage Key | Default State | Controls |
| :--- | :--- | :--- | :--- |
| **Necessary** | `armory_cookie_consent` | `true` (enforced) | Session persistence, local game progress, Firestore token authentication |
| **Analytics** | `armory_cookie_consent` | `false` (opt-in) | Vemetric beacon tracking, Firebase Analytics, GA4 `analytics_storage` |
| **Marketing** | `armory_cookie_consent` | `false` (opt-in) | Google Tag Manager ad storage, conversion attribution, remarketing |

### Consent Updates:
When updated via `saveConsent()`, the runtime immediately calls:
```typescript
window.gtag('consent', 'update', {
  analytics_storage: consent.analytics ? 'granted' : 'denied',
  ad_storage: consent.marketing ? 'granted' : 'denied',
  ad_user_data: consent.marketing ? 'granted' : 'denied',
  ad_personalization: consent.marketing ? 'granted' : 'denied'
});
```

---

## 5. Inward UTM Attribution Engine (RapportVerse & MiniBarnMaster)

The applet captures all inbound campaign and partner referral parameters on first page touch through `captureInwardAttribution()`. Attribution is persisted in `localStorage` under `armory_inward_attribution` and automatically merged into **all subsequent events** across the player's session.

### 5.1 Inbound Query Parameters Supported

| URL Parameter | Schema / Key | Description | Example Incoming Link |
| :--- | :--- | :--- | :--- |
| `utm_source` | `attr_source` | Traffic source | `?utm_source=rapportverse`, `?utm_source=minibarnmaster` |
| `utm_medium` | `attr_medium` | Traffic medium | `?utm_medium=partner_network`, `?utm_medium=creator` |
| `utm_campaign`| `attr_campaign`| Campaign identifier | `?utm_campaign=barn_crossplay`, `?utm_campaign=trust_topology` |
| `utm_content` | `attr_content` | Specific link/card | `?utm_content=header_banner`, `?utm_content=footer_badge` |
| `creator` | `attr_creator` | Creator or streamer handle | `?creator=MiniBarnMaster`, `?creator=IndieDevStream` |
| `invite` / `squad` | `attr_squad_invite` | Peer squad referral code | `?invite=ARMORY-ARTHU`, `?squad=ARMORY-VANGU` |
| `ref` | `attr_ref` | General referrer code | `?ref=MINIBARN-MASTER`, `?ref=RAPPORT-VERSE` |

### 5.2 Canonical Inbound Link Examples for Partners

#### RapportVerse Inbound Link:
```
https://rapprt.space/armory?utm_source=rapportverse&utm_medium=partner_network&utm_campaign=rapportverse_ecosystem&invite=RAPPORT-VERSE
```

#### MiniBarnMaster Creator Referral Link:
```
https://ais-dev-...run.app/?utm_source=minibarnmaster&utm_medium=creator&utm_campaign=barn_crossplay&creator=MiniBarnMaster&invite=MINIBARN-MASTER
```

#### Viral Social Brag Referral Link:
```
https://rapprt.space/?utm_source=twitter&utm_medium=social_brag&utm_campaign=leaderboard_stats&ref=ARMORY-CHRIS&view=game
```

### 5.3 Automated Inward Telemetry Dispatch
When attribution parameters are parsed, the engine automatically fires:
```typescript
trackEvent('campaign_attribution_captured', {
  utm_source: 'minibarnmaster',
  utm_medium: 'creator',
  utm_campaign: 'barn_crossplay',
  creator: 'MiniBarnMaster',
  squad_invite: 'MINIBARN-MASTER',
  source_type: 'creator_referral',
  landing_url: window.location.href,
  captured_at: '2026-09-27T16:50:00.000Z'
});
```

---

## 6. Outward UTM Tagging Taxonomy & Partner Referral Protocol

To establish reciprocal telemetry attribution across our partner ecosystem, every outbound link leaving Power-Up Armory is formatted with standard UTM parameters and tracked via `trackOutboundPartnerClick()`.

### 6.1 Standard Outbound UTM Taxonomy

```typescript
export function buildOutboundPartnerUrl(baseUrl: string, params: {
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
}): string
```

| Destination | Destination URL | Outbound UTM Query Parameters | Telemetry Placement |
| :--- | :--- | :--- | :--- |
| **RapportVerse** | `https://rapprt.space` | `?utm_source=powerup_armory&utm_medium=partner_footer&utm_campaign=rapportverse_ecosystem&utm_content=footer_partnership_card` | `footer_partnership_card` |
| **MiniBarnMaster**| `https://minibarnmaster.com` | `?utm_source=powerup_armory&utm_medium=creator_spotlight&utm_campaign=barn_crossplay&utm_content=footer_creator_alliance` | `footer_creator_alliance` |

### 6.2 Outward Telemetry Event
When a player clicks an external partner link, the app emits:
- **Event**: `outbound_partner_click`
- **Payload**:
  - `partner_name`: `'RapportVerse'` | `'MiniBarnMaster'`
  - `destination_url`: Target URL
  - `placement`: `'footer_partnership_card'` | `'footer_creator_alliance'`
  - `utm_source`: `'powerup_armory'`
  - `utm_medium`: Placement identifier
  - `utm_campaign`: `${partner_name}_ecosystem`

---

## 7. Inward Deep Linking & State Routing Protocol

Power-Up Armory supports rich query-string deep links on initial page load, instantly routing users to specific tabs, sub-categories, bosses, or modal dialogs without page reloads.

### 7.1 Deep Linking Parameter Matrix

| Parameter | Allowed Values | Target State / View | Example Use Case |
| :--- | :--- | :--- | :--- |
| `?view=` | `shop`, `armory`, `game`, `arena`, `lore`, `compendium`, `stats`, `leaderboard` | Switches `activeView` to target top-level page | Direct link from marketing email or social ad |
| `?category=` | `weapons`, `defense`, `utility`, `mystic` | Automatically opens Shop and filters category tab | Linking directly to Weapons in promo announcement |
| `?lore=` | `compendium`, `bosses`, `systems`, `calculator`, `story` | Automatically opens Lore Book to target sub-tab | Linking to Boss Bestiary from Reddit guide |
| `?tab=` | `tycoon`, `bosses`, `stats` | Automatically sets Game Arena sub-deck | Direct link to Arena Boss Gauntlet |
| `?tour=true` | `true` | Instantly launches the Guided Onboarding Tour | Partner onboarding links for first-time visitors |
| `?install=true`| `true` | Opens the PWA Installation Modal | In-game banner or promotional install drive |
| `?account=true`| `true` | Opens Account Modal for login / profile edit | Welcome link for registered champions |
| `?invite=` / `?squad=` | e.g. `ARMORY-HERO`, `MINIBARN-MASTER` | Opens Account Modal with Squad Referral desk | Friend referral links and partner promo codes |

---

## 8. Social Media Sharing & Leaderboard Brag Card Architecture

Located directly inside the Leaderboard view (`src/components/game/leaderboard/HeroAttributeSummary.tsx`), champions can brag about their combat records across social media or challenge squads.

### 8.1 Multi-Platform Sharing Targets

1. **Native Web Share API (`navigator.share`)**:
   - On iOS Safari and Android Chrome, triggers the native operating system share sheet with title, brag description, and deep link URL.
2. **X / Twitter**:
   - Pre-formatted web intent (`https://twitter.com/intent/tweet?text=...&url=...`) with hashtags `#PowerUpArmory #RapportVerse`.
3. **Bluesky**:
   - Pre-formatted compose intent (`https://bsky.app/intent/compose?text=...`).
4. **Reddit**:
   - Formatted submission link targeting gaming communities (`https://www.reddit.com/submit?title=...&url=...`).
5. **Formatted Clipboard Brag Card**:
   - Formats a beautiful ASCII box card with all live combat telemetry, squad code, and UTM-tagged challenge link.

### 8.2 Formatted Brag Card Structure
```text
╔════════════════════════════════════════╗
  ⚔️ POWER-UP ARMORY COMBAT RECORD ⚔️
  👑 Champion: Arthur Pendragon
  ⚡ Power Score: 12,450 PS
  🏆 Bosses Defeated: 18 | Deaths: 3 (K/D: 6.00)
  💥 Peak Critical Strike: 8,420 DMG
  💨 Attacks Dodged: 42 | ✨ Specials Cast: 29
  🛡️ Squad Invite: ARMORY-ARTHU (+3,000 Gold / +150 Gems)
  🎮 Challenge My Record: https://rapprt.space/?utm_source=clipboard&utm_medium=social_brag&utm_campaign=leaderboard_stats&ref=ARMORY-ARTHU&view=game
╚════════════════════════════════════════╝
```

### 8.3 Telemetry Event: `leaderboard_shared`
- **Trigger**: Player shares their combat stats via native share, social button, or copies the card.
- **Payload**:
  - `platform`: `'native_share'` | `'twitter'` | `'bluesky'` | `'reddit'` | `'clipboard'`
  - `power_score`: Champion's total Power Score
  - `total_kills`: Boss conquests count
  - `max_damage`: Peak critical strike damage
  - `share_url`: UTM-tagged deep link URL

---

## 9. Complete Telemetry Event Dictionary

The application dispatches over 25 discrete telemetry events across all core game, economy, attribution, and lore systems.

### 9.1 Navigation & Screen Engagement

#### `page_view`
- **Trigger**: Fired when active tab or nested view changes.
- **Payload Properties**:
  - `page_title` *(string)*: e.g. `'game'`, `'Armory Store - weapons'`, `'Lore Book - bestiary'`
  - `page_location` *(string)*: Full URL
  - `page_path` *(string)*: Normalized path string (e.g., `'/game'`, `'/shop/weapons'`)

---

### 9.2 Campaign Attribution & Partner Clicks

#### `campaign_attribution_captured`
- **Trigger**: Inbound visitor lands with UTM parameters, creator handle, or squad invite code in the URL.
- **Dispatch Location**: `src/lib/analytics.ts` (`captureInwardAttribution`)
- **Payload Properties**:
  - `utm_source` *(string?)*: Campaign source (`'rapportverse'`, `'minibarnmaster'`, `'twitter'`)
  - `utm_medium` *(string?)*: Channel medium (`'partner_network'`, `'creator'`, `'social_brag'`)
  - `utm_campaign` *(string?)*: Campaign identifier
  - `creator` *(string?)*: Referring creator handle
  - `squad_invite` *(string?)*: Referring squad invite code
  - `source_type` *(string)*: `'creator_referral'` | `'squad_invite'` | `'campaign'` | `'direct_link'`
  - `landing_url` *(string)*: Full initial arrival URL

#### `outbound_partner_click`
- **Trigger**: Player clicks an external outbound partner link in the Footer or PR section.
- **Dispatch Location**: `src/components/Footer.tsx` (via `trackOutboundPartnerClick`)
- **Payload Properties**:
  - `partner_name` *(string)*: `'RapportVerse'` or `'MiniBarnMaster'`
  - `destination_url` *(string)*: Outbound target URL with query params
  - `placement` *(string)*: UI link location (`'footer_partnership_card'`, `'footer_creator_alliance'`)
  - `utm_source` *(string)*: `'powerup_armory'`
  - `utm_medium` *(string)*: UI placement key
  - `utm_campaign` *(string)*: Partner campaign key

---

### 9.3 Social Sharing & Squad Referrals

#### `leaderboard_shared`
- **Trigger**: Player shares their hero attributes or combat scorecard to socials.
- **Dispatch Location**: `src/components/game/leaderboard/HeroAttributeSummary.tsx`
- **Payload Properties**:
  - `platform` *(string)*: `'native_share'`, `'twitter'`, `'bluesky'`, `'reddit'`, `'clipboard'`
  - `power_score` *(number)*: Total Power Score at time of sharing
  - `total_kills` *(number)*: Boss victories count
  - `max_damage` *(number)*: Single-hit crit peak
  - `share_url` *(string)*: Generated deep link URL with UTM tags

#### `squad_invite_shared`
- **Trigger**: Player shares their personal squad referral code (`ARMORY-XXXXX`).
- **Dispatch Location**: `src/components/account/SquadRecruitSection.tsx`
- **Payload Properties**:
  - `invite_code` *(string)*: Player's squad invite code
  - `method` *(string)*: `'native_share'` | `'clipboard'`
  - `invite_url` *(string)*: Complete UTM-tagged recruitment URL

#### `squad_invite_redeemed`
- **Trigger**: Player redeems a friend's squad code or a partner creator promo code.
- **Dispatch Location**: `src/components/AccountModal.tsx` (`handleRedeemInviteCode`)
- **Payload Properties**:
  - `invite_code` *(string)*: Redeemed code (e.g. `'ARMORY-HERO'`, `'MINIBARN-MASTER'`, `'RAPPORT-VERSE'`)
  - `is_partner_creator` *(boolean)*: `true` if matched against recognized partner creator handles
  - `creator_name` *(string?)*: `'MiniBarnMaster'` or `'RapportVerse'`
  - `reward_coins` *(number)*: `3000`
  - `reward_gems` *(number)*: `150`

---

### 9.4 Onboarding & Interactive Guided Tour

#### `tour_started`
- **Trigger**: Player selects either Express Mode or Full Deep Dive Mode in the tour modal.
- **Payload Properties**: `tour_mode` (`'short'` or `'full'`), `total_steps` (`5` or `12`).

#### `tour_step_viewed`
- **Trigger**: Player views any step of the guided tour overlay.
- **Payload Properties**: `tour_mode`, `step_index`, `total_steps`, `step_id`, `step_title`, `page`, `sub_tab`.

#### `tour_skipped`
- **Trigger**: Player dismisses or closes the tour before completing all steps.
- **Payload Properties**: `tour_mode`, `step_index`, `total_steps`.

#### `tour_completed`
- **Trigger**: Player finishes the final step and collects the one-time completion bonus.
- **Payload Properties**: `tour_mode`, `reward_coins` (`500` or `1500`), `reward_gems` (`25` or `100`).

---

### 9.5 Tycoon Economy & Powerup Progression

#### `tycoon_powerup_purchased`
- **Trigger**: Player buys an item generator license or powerup equipment with Gems in Tycoon Arena.
- **Payload Properties**: `item_id`, `item_name`, `gem_cost`, `new_quantity`.

#### `tycoon_powerup_upgraded`
- **Trigger**: Player levels up an owned mining powerup generator using Gold Coins.
- **Payload Properties**: `item_id`, `item_name`, `new_level`, `coin_cost`.

#### `seasonal_reward_claimed`
- **Trigger**: Player meets seasonal leaderboard benchmark and claims rank tier prize.
- **Payload Properties**: `reward_id`, `reward_title`, `category`, `coins`, `gems`.

#### `pwa_bonus_claimed`
- **Trigger**: Player claims the recurring monthly Progressive Web App installation grant.
- **Payload Properties**: `reward_coins` (`5000`), `reward_gems` (`250`), `month` (`'2026-09'`).

---

### 9.6 Boss Combat & Gauntlet Battle Engine

#### `boss_battle_started`
- **Trigger**: Player initiates a battle turn against a boss in the gauntlet modal.
- **Payload Properties**: `boss_id`, `boss_name`, `player_hp`, `player_atk`.

#### `boss_battle_completed`
- **Trigger**: Battle resolution completes either via victory or champion defeat.
- **Victory Payload**: `boss_id`, `boss_name`, `outcome: 'victory'`, `turns`, `reward_coins`, `reward_gems`.
- **Defeat Payload**: `boss_id`, `boss_name`, `outcome: 'defeat'`, `turns`, `boss_hp_remaining`.

---

### 9.7 Lore Book Compendium & Scholar Quests

#### `lore_book_opened`
- **Trigger**: Player opens the Lore Book screen (`initial_tab`).

#### `lore_first_open_reward_claimed`
- **Trigger**: First-time explorer opens compendium (`reward_coins: 200`, `reward_gems: 10`).

#### `lore_page_completed`
- **Trigger**: Reads previously unread chapter (`page_id`, `reward_coins: 100`, `reward_gems: 5`, `total_pages_completed`).

#### `lore_book_completed`
- **Trigger**: Completes all lore chapters (`reward_coins: 1000`, `reward_gems: 50`, `all_pages: []`).

---

### 9.8 Armory E-Commerce & Checkout Vouchers

#### `purchase`
- **Trigger**: Standard e-commerce transaction generated when an Armory cart is checked out.
- **Payload**: `transaction_id`, `value`, `currency: 'USD'`, `items_count`, `items: [{ item_id, price, quantity }]`.

#### `armory_checkout_code_generated`
- **Trigger**: Companion event tracking the redemption code generated for in-game unlocking.
- **Payload**: `code`, `total_value`, `item_count`.

---

### 9.9 User Identity, Authentication & Cloud Leaderboard

#### `user_logged_out`
- **Trigger**: Explicit sign out from user account modal. Clears user identity from GA4 and Vemetric.

#### `leaderboard_synced`
- **Trigger**: Player publishes local progression, achievements, and stats to cloud Firestore.
- **Payload**: `user_id`, `power_score`, `bosses_defeated`, `coins`, `gems`, `max_damage`, `total_dodges`, `total_specials`.

#### Anonymous User Session Merging & `updateUser` API
To guarantee that champions are never misclassified as "anonymous" in Vemetric and GA4 when signed in via Gmail or email, the applet enforces strict anonymous session discipline:

1. **Anonymous Session Preservation on First Visit**:
   - The applet does **not** call `identify` with an arbitrary client ID hash during initial anonymous browsing.
   - Vemetric tracks anonymous actions (pageviews, store browsing, tycoon clicks) in an anonymous session context.
2. **Deterministic Session Merging upon Login**:
   - The instant a user signs in (Google OAuth or Email/Password), `trackUserIdentify(user.uid, traits)` is called.
   - Under Vemetric's ingestion protocol, calling `vemetric.identify(userId)` retroactively stitches all prior actions taken during the anonymous session into the identified user's permanent profile.
3. **User Attribute Synchronization via `updateUser`**:
   - Simultaneously, `vemetric.updateUser({...})` is called to register the user's `displayName` and `avatarUrl` at the root level, ensuring the user roster never displays them as "anon":
   ```typescript
   vemetric.updateUser({
     displayName: isDev ? `[DEV/BETA] ${name}` : name,
     avatarUrl: user.photoURL || undefined,
     set: {
       userId: user.uid,
       email: user.email,
       displayName: isDev ? `[DEV/BETA] ${name}` : name,
       powerScore: currentPowerScore,
       totalBossesDefeated: bossesDefeated,
       registered_user: true,
       is_anonymous: false,
       environment: isDev ? 'dev_beta' : 'production'
     },
     setOnce: {
       first_identified_at: new Date().toISOString(),
       initial_attr_source: attribution?.utm_source
     }
   });
   ```
4. **Leaderboard Synchronization Trigger**:
   - Whenever the champion syncs their score to the cloud leaderboard (manual sync in Account Modal or auto-sync in Arena), `trackUserIdentify` and `updateUser` are re-invoked with updated `powerScore`, `coins`, `gems`, and `bossesDefeated` attributes.

#### 9.9.1 Logout Hygiene & Identity Attribution Protocol
To prevent account progression contamination and eliminate score spoofing or anonymous identity leaks when switching accounts:
1. **Attribution-First Logout Emittance**:
   - The `user_logged_out` event is explicitly dispatched **before** clearing `sessionStorage._vmId` or in-memory `currentUserId`.
   - This ensures Vemetric and GA4 attribute the sign-out action directly to the departing authenticated user rather than creating a phantom "anonymous" user registration.
   - Debounce lockouts (1,500ms) prevent duplicate execution when both `AccountModal.handleSignOut` and `App.onAuthStateChanged` register the session exit.
2. **Full Storage Cleansing on Sign Out**:
   - `localStorage` keys purged: `'bossRushTycoon'`, `'powerupArmory_save'`, `'powerupArmory_saved_combat_logs'`, `'powerupArmory_log_showTimestamps'`, `'powerupArmory_log_persistLogs'`, `'armory_user_id'`, `'armory_anon_uid'`, `'armory_device_client_id'`, `'armory_inward_attribution'`.
   - `sessionStorage` keys purged: `'_vmId'`, `'_vmDn'`, `'_vmCtx'`, `'powerup_tour_prompted'`.
3. **TycoonBankrollCard Instant Baseline Reversion**:
   - In-memory `gameState` immediately resets to `DEFAULT_STARTER_BASELINE_STATE`:
     - Gold Coins: 2,000 | Gems: 500 | Bosses Defeated: 0
     - Base Attributes: 10 ATK, 10 DEF, 10 SPD
     - Calculated Power Score: 35 PS | Passive Yield: +0/s
     - Live Combat HP: 110 / 110 Max HP
4. **Exploit Prevention**:
   - Guarantees that signing out from an advanced high-power account and subsequently signing in to a brand new account cannot transfer local uncommitted coins, power-ups, or boss kill counts into the new user's cloud Firestore save or leaderboard record.
5. **Analytics Identity Flush & Modular Architecture**:
   - Vemetric logic is isolated inside `/src/lib/analytics/vemetric.ts`.
   - Single-flight dispatch routes through `window.vmtrc` or queued `window.vmtrcq`, eliminating duplicate REST hub collisions that previously spawned secondary anonymous user sessions.
   - GA4 `user_id` is set to `null` and `registered_user: false`.
   - Vemetric session is cleanly purged via `vemetricResetUser()`.

---

## 10. Core Conversion Funnel Blueprints

Below are the 8 primary conversion funnels used by engineering, growth, and marketing to monitor user acquisition, partner synergies, and viral growth loops.

### Funnel 1: Onboarding Tour to First Boss Victory
*Measures new visitor transition through guided onboarding into tactical combat conquest.*

| Step # | Step Name | Event Name / Type | Property Filters | Intent / Milestone |
| :---: | :--- | :--- | :--- | :--- |
| **1** | Landing | `page_view` | `page_path` = `/` or `/game` | Visitor arrives on app |
| **2** | Tour Started | `tour_started` | `tour_mode` in `('short', 'full')` | User initiates guided tour |
| **3** | Tour Completed | `tour_completed` | `reward_coins` > 0 | User claims tour onboarding bonus |
| **4** | First Boss Battle | `boss_battle_started` | `boss_id` = `'shadow_grunt'` | Player challenges Tier 1 boss |
| **5** | First Boss Defeated | `boss_battle_completed` | `outcome` = `'victory'` | Player conquers boss |
| **6** | Cloud Rank Sync | `leaderboard_synced` | `power_score` > 0 | Rank published to global roster |

---

### Funnel 2: Store Browsing to Checkout Code Generation
*Tracks Armory store discovery, category navigation, cart checkout, and redemption voucher creation.*

| Step # | Step Name | Event Name / Type | Property Filters | Intent / Milestone |
| :---: | :--- | :--- | :--- | :--- |
| **1** | View Armory Store | `page_view` | `page_path` = `'/shop'` | Player enters Armory tab |
| **2** | Filter Category | `page_view` | `page_path` in `('/shop/weapons', '/shop/defense', '/shop/utility', '/shop/mystic')` | Player inspects category |
| **3** | Checkout Purchase | `purchase` | `currency` = `'USD'`, `value` > 0 | Cart checkout executed |
| **4** | Voucher Generated | `armory_checkout_code_generated` | `code` exists | Player gets in-game redeem code |

---

### Funnel 3: Tycoon Economy Mining to Seasonal Leaderboard Dominance
*Analyzes the incremental gameplay loop from generator upgrades to seasonal prize redemption.*

| Step # | Step Name | Event Name / Type | Property Filters | Intent / Milestone |
| :---: | :--- | :--- | :--- | :--- |
| **1** | Acquire Generator | `tycoon_powerup_purchased` | `gem_cost` > 0 | Player invests gems in generator |
| **2** | Level Up Generator | `tycoon_powerup_upgraded` | `new_level` >= 2 | Player reinvests gold in levels |
| **3** | Conquered High Boss | `boss_battle_completed` | `outcome` = `'victory'`, `boss_id` in `('iron_golem', 'void_dragon')` | Player tests amplified stats |
| **4** | Claim Seasonal Rank | `seasonal_reward_claimed` | `reward_id` exists | Player claims seasonal prize |

---

### Funnel 4: Lore Compendium Exploration to Grand Master Unlock
*Monitors narrative content engagement and completion of the in-game encyclopedia.*

| Step # | Step Name | Event Name / Type | Property Filters | Intent / Milestone |
| :---: | :--- | :--- | :--- | :--- |
| **1** | Open Compendium | `lore_book_opened` | none | Player opens Lore Book view |
| **2** | Claim Scholar Grant | `lore_first_open_reward_claimed` | `reward_coins` = 200 | First-time discovery bonus |
| **3** | Read Lore Chapters | `lore_page_completed` | `total_pages_completed` >= 2 | Multi-chapter reading depth |
| **4** | Grand Master Unlock | `lore_book_completed` | `reward_coins` = 1000 | 100% compendium mastery |

---

### Funnel 5: Progressive Web App (PWA) Bonus Claim Loop
*Measures adoption of standalone installable app and monthly retention claims.*

| Step # | Step Name | Event Name / Type | Property Filters | Intent / Milestone |
| :---: | :--- | :--- | :--- | :--- |
| **1** | App Session | `page_view` | `page_path` = `'/game'` | User opens game view |
| **2** | PWA Grant Claimed | `pwa_bonus_claimed` | `reward_coins` = 5000 | Monthly PWA reward redeemed |
| **3** | Leaderboard Sync | `leaderboard_synced` | `coins` >= 5000 | Progress saved to cloud account |

---

### Funnel 6: Guest to Authenticated Cloud Champion Sync
*Monitors identity conversion from anonymous guest player to authenticated cloud account.*

| Step # | Step Name | Event Name / Type | Property Filters | Intent / Milestone |
| :---: | :--- | :--- | :--- | :--- |
| **1** | Anonymous Play | `page_view` | `registered_user` = `false` | Guest visitor plays game |
| **2** | Battle Victory | `boss_battle_completed` | `outcome` = `'victory'` | Plays gauntlet as guest |
| **3** | Account Identity | User Identified (`trackUserIdentify`) | `userId` exists | Signs in with Google/Firebase |
| **4** | Cloud Sync | `leaderboard_synced` | `registered_user` = `true` | Cloud leaderboard published |

---

### Funnel 7: Creator & Partner Inward Referral to Boss Conquest
*Tracks visitor conversion from partner sources (RapportVerse, MiniBarnMaster) through code redemption and combat victory.*

| Step # | Step Name | Event Name / Type | Property Filters | Intent / Milestone |
| :---: | :--- | :--- | :--- | :--- |
| **1** | Inward Partner Arrival | `campaign_attribution_captured` | `utm_source` in `('rapportverse', 'minibarnmaster')` or `creator` exists | Lands from partner network |
| **2** | Tour / Arena Entry | `page_view` | `page_path` in `('/game', '/game/tycoon')` | Engages with arena |
| **3** | Redeem Partner Code | `squad_invite_redeemed` | `is_partner_creator` = `true` | Unlocks +3,000 Gold / +150 Gems |
| **4** | Purchase Equipment | `tycoon_powerup_purchased` | `gem_cost` > 0 | Upgrades gear using bonus gems |
| **5** | Boss Conquered | `boss_battle_completed` | `outcome` = `'victory'` | Slays first gauntlet boss |

---

### Funnel 8: Social Leaderboard Brag Viral Referral Loop
*Tracks viral outbound social sharing, reciprocal squad code clicks, and new recruit acquisition.*

| Step # | Step Name | Event Name / Type | Property Filters | Intent / Milestone |
| :---: | :--- | :--- | :--- | :--- |
| **1** | Champion Shares Brag | `leaderboard_shared` | `platform` in `('twitter', 'bluesky', 'reddit', 'native_share', 'clipboard')` | Veteran posts brag scorecard |
| **2** | Friend Lands via Link | `campaign_attribution_captured` | `utm_medium` = `'social_brag'` or `utm_source` = `'squad_invite'` | New recruit clicks deep link |
| **3** | Friend Joins Squad | `squad_invite_redeemed` | `invite_code` exists | Friend claims +3,000 Gold bonus |
| **4** | Friend Slays Boss | `boss_battle_completed` | `outcome` = `'victory'` | Friend advances in arena |
| **5** | Friend Syncs Roster | `leaderboard_synced` | `power_score` > 0 | Friend enters the leaderboard |

---

## 11. Multi-Platform Implementation & Step-by-Step Setup

### 11.1 Vemetric Setup & Fallback Beacon Protocol
1. **Script Integration**: The library loads `https://cdn.vemetric.com/main.js` with attributes `data-token`, `data-allow-cookies="true"`, and `data-track-page-views="false"`.
2. **Offline / Ad-Blocker Fallback**: If the Vemetric script fails to load, `sendVemetricBeacon()` uses `navigator.sendBeacon()` or `fetch(..., { keepalive: true })` to post payloads directly to `https://cdn.vemetric.com/api/v1/event`.
3. **Filtering by Inbound Attribution**:
   - In Vemetric, segment reports by `attr_source = 'minibarnmaster'` or `attr_source = 'rapportverse'` to measure partner cohort retention.

---

### 11.2 Google Analytics 4 (GA4) Custom Explorations
1. **Google Tag Setup**: Configured with Measurement ID `G-YX5LPMCNB8`.
2. **Custom Dimensions to Register**:
   - Under **Admin** > **Custom Definitions**, create event-scoped dimensions for:
     - `attr_source`
     - `attr_medium`
     - `attr_campaign`
     - `attr_creator`
     - `attr_squad_invite`
     - `platform`
     - `invite_code`
     - `boss_id`
     - `outcome`
3. **Building Funnel 7 (Partner Referral to Boss Kill)**:
   - Go to **Explore** > **Funnel Exploration**.
   - Step 1: Event = `campaign_attribution_captured`
   - Step 2: Event = `squad_invite_redeemed`
   - Step 3: Event = `boss_battle_completed` AND `outcome` = `victory`
   - Breakdown by `attr_source` to compare conversion rates between RapportVerse and MiniBarnMaster.

---

### 11.3 Firebase Analytics & BigQuery Ingestion
1. **Initialization**: Initialized conditionally when `isSupported()` resolves to true and user grants analytics consent.
2. **Event Logging**: Managed via `firebase/analytics` `logEvent()`.
3. **Cloud Firestore Sync**: Firebase events stream directly into Google BigQuery for cohort segmentation across project `ai-studio-poweruparmorybos-e704d73f-6a08-491c-9c4c-b7e874827600`.

---

## 12. Auditing, Validation & Verification Protocols

When verifying telemetry, deep linking, and UTM tracking changes:
1. **Inward Deep Link Test**:
   - Visit: `/?view=shop&category=mystic&utm_source=test_source&utm_medium=partner&creator=MiniBarnMaster`
   - Verify that the app opens directly to the **Armory Shop** on the **Mystic** category.
   - Verify in Console that `campaign_attribution_captured` was dispatched.
2. **Outbound Partner Click Test**:
   - Scroll to Footer and click **Visit RapportVerse** or **Explore MiniBarnMaster Network**.
   - Verify that target URLs contain clean UTM query parameters (`utm_source=powerup_armory`).
   - Check Network tab for `outbound_partner_click` beacon dispatch.
3. **Social Sharing Test**:
   - Navigate to **Stats / Leaderboard**, scroll to **Hero Combat Telemetry**.
   - Click **Copy Card**, paste into an editor, and confirm the ASCII scorecard contains the champion's name, Power Score, K/D ratio, and UTM-tagged deep link URL.
   - Confirm `leaderboard_shared` is logged with `platform: 'clipboard'`.
