# Dynamic Vector SVG Share Cards & Deep Link Guide (`/Docs/DYNAMIC_SHARE_LINKS_GUIDE.md`)

> **Specification**: Real-time Vector SVG Generation & Deep-Tagged Share System  
> **Application**: Power-Up Armory · Boss Rush Tycoon (`poweruparmory.game`)  
> **Ecosystem Partners**: RapportVerse (`rapprt.space`), MiniBarnMaster (`minibarnmaster.ai.studio`)  
> **Status**: 🟢 Production Ready  

---

## 1. Executive Summary

Power-Up Armory provides dynamically generated, high-resolution vector SVG social preview cards (1200x630 resolution) tailored on-the-fly based on link parameters and deep tagging. This enables:
1. **Dynamic Social Cards for OpenGraph / Twitter**: Platforms like Twitter/X, Discord, Slack, iMessage, and Facebook render custom champion or boss statistics embedded directly into the preview image.
2. **Interactive In-App Share Studio**: Players can preview their vector card in real-time, toggle perspectives, copy deep-tagged URLs, copy direct SVG endpoints, download raw `.svg` files, and share via native device APIs.
3. **Deep Link Inward Routing & Dynamic Metadata**: When recipients click an incoming share link, the app dynamically extracts parameters (`player`, `ps`, `boss`, `invite`), customizes the document title and OpenGraph tags, and displays a contextual welcome banner.

---

## 2. Dynamic SVG HTTP Endpoint

* **Endpoint Route**: `/share-card.svg` (and `/api/share-card.svg`)
* **Content-Type**: `image/svg+xml; charset=utf-8`
* **Cache Control**: `public, max-age=3600` (1 hour browser & CDN caching)
* **Access Control**: `Access-Control-Allow-Origin: *`

### Supported Query Parameters

| Parameter | Type | Default | Description |
| :--- | :---: | :---: | :--- |
| `view` | string | `champion` | Card view mode: `'champion'`, `'boss'`, or `'squad'`. |
| `player` / `name` | string | `Hero` | Player champion display name. |
| `title` | string | `Grand Champion` | Sovereign honorific / champion title. |
| `avatar` | string | `⚔️` | Hero avatar emoji or icon. |
| `ps` / `powerScore`| number | `1000` | Current aggregate Power Score. |
| `bosses` | number | `0` | Number of unique bosses vanquished. |
| `maxBosses` | number | `15` | Total bosses in active gauntlet. |
| `atk` | number | `250` | Live Hero Attack power. |
| `def` | number | `200` | Live Hero Defense rating. |
| `spd` | number | `100` | Live Hero Speed agility. |
| `coins` | number | `0` | Gold Coins reserve. |
| `gems` | number | `0` | Astral Gems reserve. |
| `code` / `invite` | string | `ARMORY-HERO` | Unique Squad Recruitment invite code. |
| `boss` | string | `Ignis` | Boss name (used in `view=boss`). |
| `bossEmoji` | string | `🔥` | Boss avatar emoji (used in `view=boss`). |

---

## 3. Card View Modes

### A. 👑 Champion Codex View (`view=champion`)
Displays the player's core identity, title, avatar, Power Score, Boss vanquish count, ATK/DEF/SPD combat metrics, and Squad Invite Code with the standard +3,000 Coin bonus CTA.

```
/share-card.svg?view=champion&player=TitanSlayer&title=Grand+Champion&avatar=⚔️&ps=2450&bosses=14&code=ARMORY-TITAN
```

### B. ⚔️ Boss Conquest Victory View (`view=boss`)
Celebrates titan victories in the Boss Gauntlet with boss artwork, the conqueror's credentials, and arena trophy rewards.

```
/share-card.svg?view=boss&boss=Ignis+the+Molten+Overlord&bossEmoji=🔥&player=TitanSlayer&ps=2450&bosses=14&code=ARMORY-TITAN
```

### C. 👥 Squad Recruitment View (`view=squad`)
Focused recruitment card advertising party formation for upcoming Co-Op Horde Assaults, prominently highlighting the recruit's +3,000 Gold and +150 Gems bonus.

```
/share-card.svg?view=squad&player=TitanSlayer&invite=ARMORY-TITAN
```

---

## 4. In-App Integration Touchpoints

1. **Account Modal (`AccountModal.tsx` & `SquadRecruitSection.tsx`)**:
   - `✨ Open Dynamic SVG Share Card Studio` button in the hero profile.
   - `✨ Card` trigger directly inside the Squad Recruitment box.
2. **Hall of Champions (`LeaderboardSeasonHeader.tsx`)**:
   - `👑 Share Card` button in the header alongside Season Lore and Sync actions.
3. **Combat Arena Modal (`BattleModal.tsx`)**:
   - `🏆 Share Card` quick action on active duels and victories.
4. **App Root Inward Listener (`App.tsx`)**:
   - Dynamically updates `<title>`, `<meta property="og:title">`, `<meta property="og:image">`, and `<meta name="twitter:image">` when landing from shared links.
   - Renders a top-floating welcome toast greeting incoming players with their friend's credentials.
