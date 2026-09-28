# Item Build-Out Strategies & Stat Balance Guide

> **Developer Governance Reference**  
> *Target Architecture: High-Risk / High-Reward Stat Synergy Matrix & Safeguards*  
> *Last Updated: September 2026*

---

## 1. Overview & Balance Philosophy

In **Power-Up Armory: Boss Rush Tycoon**, champions customize their power profiles through weapons, armor, utility artifacts, and mystic relics. 

To foster strategic build diversity, certain high-powered items trade defensive resilience for massive offensive firepower. For example:
- **Shield Breaker 🔨**: +25 Attack, **-10 Defense** per pack unit.
- **Void Orb 🌌**: +30 Attack, **-20 Defense** per pack unit.
- **Titan Armor 💪**: +50 Defense, **-10 Speed** per pack unit.

This design enables extreme **Glass Cannon** builds (e.g. 310 ATK, -110 DEF, 379 PS) where players deal immense damage but suffer heavy incoming damage during boss encounters.

---

## 2. Stat Formulas & Mathematical Architecture

### A. Health & Defense Calculations
```typescript
Total Defense = Base Defense + SUM(Item Defense * Quantity * Level)
Normal Max HP = Math.max(10, 100 + Total Defense + maxHpBonus)
```
> **10 HP Hard Floor Safeguard**:  
> Regardless of how deeply negative a champion's Defense drops (e.g., `-110 DEF`), Max Health is enforced at a **minimum of 10 HP**. This prevents champions from becoming dead or gated on spawn (`-10/-10 HP`), allowing glass cannon challenges while preserving gameplay accessibility.

### B. Attack & Speed Calculations
```typescript
Total Attack  = Math.floor((Base Attack + SUM(Item Attack * Qty * Level)) * (1 + DamageBonus% / 100))
Total Speed   = Base Speed + SUM(Item Speed * Quantity * Level)
```

### C. Power Score Formula
```typescript
Base Power Score = Math.floor(Total Attack * 1.5 + Total Defense * 1.2 + Total Speed * 0.8)
Multiplier = 1.0 + Min(0.50, KillStreak * 0.05) + Min(0.30, DeathStreak * 0.05)
Final Power Score = Math.floor(Base Power Score * Multiplier)
```

---

## 3. Archetype Build Strategies

| Build Archetype | Primary Gear | Stat Distribution | Tactical Strategy | Counter-Balance |
| :--- | :--- | :--- | :--- | :--- |
| **Glass Cannon Berserker** | Shield Breaker 🔨<br>Void Orb 🌌<br>Focus Blade 🗡️ | **310+ ATK**<br>**-110 DEF**<br>**10 Max HP** | Obliterates low-to-mid tier bosses in 1-2 turns. High burst yield. | Must kill before boss attacks. Phoenix Feather 🦅 provides revive buffer. |
| **Titan Juggernaut** | Titan Armor 💪<br>Magnetite Shield 🧲<br>Dragon Scale 🐉 | **10+ ATK**<br>**150+ DEF**<br>**250+ Max HP** | Tanky bulwark that reflects 30% damage and withstands high boss hits. | Counter-balances negative defense penalties from Void Orbs. |
| **Evasion Assassin** | Speed Dagger ⚡<br>Wing Charm 🕊️<br>Cloak of Shadows 👻 | **100+ ATK**<br>**30+ DEF**<br>**60+ SPD** | High turn frequency (2 hits/turn) with 30-50% dodge chances. | Dodges high damage hits to compensate for lower raw HP. |
| **Mystic Supernova** | Star Fragment ⭐<br>Void Orb 🌌<br>Phoenix Feather 🦅 | **250+ ATK**<br>**-50 DEF**<br>**100% True DMG** | Bypasses boss armor completely with 10% instant-kill chance. | Phoenix Feather resurrects champion at 50% HP upon fatal hit. |

---

## 4. Extreme Stat Offset Safeguards & UX Prompts

To prevent accidental player lockout when acquiring heavy negative stat items:

1. **Stat Delta Preview Modal (`StatWarningModal.tsx`)**:
   - Triggers automatically whenever a pack purchase or code redemption drops **Total Defense below 0** or **Max HP below 50**.
   - Prompts the user with explicit `[Current -> New]` stat deltas before finalizing the transaction.
2. **Glass Cannon UI Badge**:
   - In `TycoonBankrollCard.tsx`, negative defense ratings blink in amber (`⚠️ -110 DEF`) with a descriptive tooltip explaining the Glass Cannon trade-off.
3. **Emergency Stat Purity Restructure**:
   - Available in the **Admin Modal** (`AdminModal.tsx`) under `[🛡️ Stat Purity Restructure]`.
   - Immediately clears negative defense multipliers and restores baseline HP to 100 during balance testing.

---

## 5. Item Registry & Base Stat Matrix

| Item Name | Emoji | Base Rate (/s) | ATK | DEF | SPD | Special Ability |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Focus Blade** | 🗡️ | 0.5 | +15 | 0 | +5 | Precision Strike (3x DMG, 20% chance) |
| **Rage Axe** | 🔥 | 0.8 | +12 | 0 | 0 | Berserk (+5 ATK per stack) |
| **Speed Dagger** | ⚡ | 1.0 | +8 | 0 | +20 | Flurry (2 hits per turn) |
| **Shield Breaker** | 🔨 | 1.5 | +25 | **-10** | 0 | Shatter (Ignores 40% armor) |
| **Wing Charm** | 🕊️ | 2.0 | +5 | +5 | +15 | Dodge (30% evasion) |
| **Magnetite Shield** | 🧲 | 1.2 | 0 | +30 | 0 | Reflect (Reflects 25% damage) |
| **Cloak of Shadows** | 👻 | 1.8 | +10 | +10 | +10 | Shadow Step (50% dodge 1st hit) |
| **Titan Armor** | 💪 | 3.0 | 0 | +50 | **-10** | Bulwark (Reduces damage by 50%) |
| **Dragon Scale** | 🐉 | 5.0 | +18 | +15 | 0 | Fire Breath (30% bonus damage) |
| **Phoenix Feather** | 🦅 | 8.0 | +10 | +10 | +5 | Revive (Resurrects once at 50% HP) |
| **Void Orb** | 🌌 | 12.0 | +30 | **-20** | 0 | Oblivion (100% true damage) |
| **Star Fragment** | ⭐ | 15.0 | +25 | 0 | +10 | Supernova (10% instant kill chance) |

---

## 6. Developer Commands & Balance Testing Workflow

During development and balance testing, use the Admin Console (`AdminModal.tsx`) to simulate build transitions:

- **Reset Negative Stats**: Restructures powerup quantities to neutralize negative defense penalties while retaining positive items.
- **Grant Gold & Gems**: Add +100,000 Coins or +5,000 Gems to test item purchase scaling.
- **Clear Combat Logs**: Reset local logs to inspect fresh turn calculations.
