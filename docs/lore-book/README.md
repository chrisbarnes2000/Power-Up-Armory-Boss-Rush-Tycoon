# ⚔️ Power-Up Armory — Lore Book & Item Compendium

Welcome to the complete Markdown documentation site for the **Power-Up Armory: Boss Rush Tycoon**.

This repository of Markdown documents holds all canonical world-building, weapon specifications, forging records, boss tactical dossiers, and economic balance formulas.

---

## 📚 Table of Contents

### 1. [📖 Item Compendium (15 Artifacts)](./items/README.md)
Detailed codex entries for every armament, defense shield, utility lens, and mystical cosmic relic.
- **Weapons:** [Focus Blade](./items/focus-blade.md), [Rage Axe](./items/rage-axe.md), [Speed Dagger](./items/speed-dagger.md), [Shield Breaker](./items/shield-breaker.md), [Wing Charm](./items/wing-charm.md)
- **Defense:** [Magnetite Shield](./items/magnetite-shield.md), [Cloak of Shadows](./items/cloak-of-shadows.md), [Titan Armor](./items/titan-armor.md)
- **Utility:** [Laser Lens](./items/laser-lens.md), [Phantom Dust](./items/phantom-dust.md), [Dragon Scale](./items/dragon-scale.md)
- **Mystic:** [Phoenix Feather](./items/phoenix-feather.md), [Void Orb](./items/void-orb.md), [Star Fragment](./items/star-fragment.md), [Mystery Artifact](./items/mystery-artifact.md)

### 2. [👹 Boss Bestiary & Tactical Dossiers](./bosses/README.md)
Comprehensive battle data and weakness breakdowns for all 8 realm overlords:
- [Goblin King](./bosses/goblin-king.md)
- [Orc Warlord](./bosses/orc-warlord.md)
- [Shadow Assassin](./bosses/shadow-assassin.md)
- [Dragon Wyrm](./bosses/dragon-wyrm.md)
- [Lich King](./bosses/lich-king.md)
- [Elder Titan](./bosses/elder-titan.md)
- [Void Serpent](./bosses/void-serpent.md)
- [Star Eater](./bosses/star-eater.md)

### 3. [📜 Canonical War Chronicles](./chronicles/README.md)
The seven foundational sagas recording the discovery of steel and the fall of the titans:
- [Chapter I: The Concentration of Steel](./chronicles/chapter-1.md)
- [Chapter II: The Siege of Broken Shields](./chronicles/chapter-2.md)
- [Chapter III: Gloom and Phantom Steps](./chronicles/chapter-3.md)
- [Chapter IV: The Celestial Pyre](./chronicles/chapter-4.md)
- [Chapter V: Winter of the Undying](./chronicles/chapter-5.md)
- [Chapter VI: The Primordial Rift](./chronicles/chapter-6.md)
- [Chapter VII: The Supernova Convergence](./chronicles/chapter-7.md)

### 4. [⚙️ Realm Systems & Economy](./systems/realm-systems.md)
Currencies, Gold/s yield formulas, Power Score weights, and packaging conventions.

---

## 🛠️ How to Update In-Game Text

If you modify these Markdown files and want to reflect the updates inside the live application:
- **Item stats and pricing**: Edit `src/data.ts` -> `POWERUPS`
- **Item lore, mythos, and boss counters**: Edit `src/loreData.ts` -> `ITEM_LORES`
- **Boss health, attack, and rewards**: Edit `src/data.ts` -> `BOSSES`
- **Boss lore dossiers**: Edit `src/loreData.ts` -> `BOSS_DOSSIERS`
- **Canonical stories**: Edit `src/loreData.ts` -> `CANONICAL_CHAPTERS`
