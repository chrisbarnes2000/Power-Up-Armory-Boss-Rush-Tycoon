# 📖 Item Compendium — Complete Armory Index

Welcome to the definitive reference manual for all combat armaments, protective wards, utility prisms, and mystical singularities forged within the **Power-Up Armory**.

This catalog details all 15 power-up artifacts, their combat parameters, passive tycoon revenue contributions, and canonical lore.

---

## 📊 Comprehensive Item Directory

| Item | Category | Rarity | ATK | DEF | SPD | Gold Yield | Special Trait |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| [🗡️ **Focus Blade**](./focus-blade.md) | Weapons | `Common` | +15 | +0 | +5 | +0.5/s | Precision Strike — 3x damage, 20% chance |
| [🔥 **Rage Axe**](./rage-axe.md) | Weapons | `Common` | +12 | +0 | +0 | +0.8/s | Berserk — +5 attack per stack (max 10) |
| [⚡ **Speed Dagger**](./speed-dagger.md) | Weapons | `Uncommon` | +8 | +0 | +20 | +1/s | Flurry — 2 hits per turn |
| [🔨 **Shield Breaker**](./shield-breaker.md) | Weapons | `Rare` | +25 | +-10 | +0 | +1.5/s | Shatter — Ignores 40% armor |
| [🕊️ **Wing Charm**](./wing-charm.md) | Weapons | `Rare` | +5 | +5 | +15 | +2/s | Dodge — 30% evasion |
| [❓ **???.???**](./mystery-artifact.md) | Weapons | `??` | +0 | +0 | +0 | +0/s | TBD |
| [🧲 **Magnetite Shield**](./magnetite-shield.md) | Defense | `Uncommon` | +0 | +30 | +0 | +1.2/s | Reflect — Reflects 25% damage |
| [👻 **Cloak of Shadows**](./cloak-of-shadows.md) | Defense | `Rare` | +10 | +10 | +10 | +1.8/s | Shadow Step — 50% dodge first hit |
| [💪 **Titan Armor**](./titan-armor.md) | Defense | `Epic` | +0 | +50 | +-10 | +3/s | Bulwark — Reduces damage by 50% |
| [🔫 **Laser Lens**](./laser-lens.md) | Utility | `Uncommon` | +20 | +0 | +5 | +2.5/s | Focus Beam — 100% accuracy |
| [🌫️ **Phantom Dust**](./phantom-dust.md) | Utility | `Epic` | +15 | +5 | +15 | +3.5/s | Phase — 20% ethereal damage |
| [🐉 **Dragon Scale**](./dragon-scale.md) | Utility | `Legendary` | +18 | +15 | +0 | +5/s | Fire Breath — 30% bonus damage |
| [🦅 **Phoenix Feather**](./phoenix-feather.md) | Mystic | `Mythic` | +10 | +10 | +5 | +8/s | Revive — Resurrect once with 50% HP |
| [🌌 **Void Orb**](./void-orb.md) | Mystic | `Mythic` | +30 | +-20 | +0 | +12/s | Oblivion — 100% true damage |
| [⭐ **Star Fragment**](./star-fragment.md) | Mystic | `Mythic` | +25 | +0 | +10 | +15/s | Supernova — 10% chance to instant kill |

---

## 📂 Category Navigation

- [🗡️ Weapons (Focus Blade, Rage Axe, Speed Dagger, Shield Breaker, Wing Charm)](./focus-blade.md)
- [🛡️ Defense (Magnetite Shield, Cloak of Shadows, Titan Armor)](./magnetite-shield.md)
- [✨ Utility (Laser Lens, Phantom Dust, Dragon Scale)](./laser-lens.md)
- [🌀 Mystic (Phoenix Feather, Void Orb, Star Fragment)](./phoenix-feather.md)

---

## 💡 How to Edit Item Lore

1. Edit the respective item Markdown file in this `items/` directory.
2. In the application source code:
   - **Numerical Balance & Pricing**: Located in `src/data.ts` in the `POWERUPS` array.
   - **Lore, Mythos, Forging Records & Counter Roles**: Located in `src/loreData.ts` in the `ITEM_LORES` array.
