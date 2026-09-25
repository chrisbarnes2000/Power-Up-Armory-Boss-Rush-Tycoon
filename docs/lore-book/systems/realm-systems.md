# ⚙️ Realm Systems & Tycoon Mechanics

Comprehensive documentation of the mathematical formulas, currencies, and economic conventions of the **Power-Up Armory**.

---

## 💰 Currencies of the Realm

### Gold Coins (🪙)
- **Primary Role:** Tycoon & Maintenance Currency
- **Harvest Sources:** Generated continuously by owned powerups in the tycoon system, and awarded as bounties for slaying Bosses.
- **Strategic Applications:** Used to upgrade powerup levels (increasing their base multiplier), purchase Pre-Fight combat enhancements (HP Shields & Combat Tonics), and pay for instant Battle Revives in combat.

### Prismatic Gems (💎)
- **Primary Role:** Premium Armory Currency
- **Harvest Sources:** Harvested exclusively by conquering high-tier Bosses in the Boss Rush Arena.
- **Strategic Applications:** Used to unlock new powerup licenses directly in the game view, and to purchase additional duplicate copies to stack multiplier volume.

### Power Score (PS)
- **Primary Role:** Combat Readiness & Gateway Metric
- **Harvest Sources:** Calculated dynamically: Sum of all owned item ATK + DEF + SPD, plus 10 PS per item Level, 5 PS per item Quantity, and 25 PS per total Bosses defeated.
- **Strategic Applications:** Acts as the strict gateway requirement to challenge higher-tier Bosses. Higher bosses demand disciplined armory development.


---

## 📐 Mathematical Formulas

### Passive Gold Yield Formula
```
Rate = Σ [ BaseRate × Quantity × (1 + (Level - 1) × 0.5) ] Gold/sec
```
*Every item generates Gold continuously. Adding duplicate copies increases the base multiplier linearly, while leveling up an item adds a +50% compound multiplier per level.*

### Effective Combat Stats
```
Total Attack = [ Σ (Item ATK × Quantity) ] × (1 + Tonic Bonus%)
```
*Combat damage is multiplied by your purchased Combat Tonics. Stacking multiple copies of a weapon dramatically boosts your per-turn strike force.*

### Hero Health Pool
```
Total Max HP = 100 Base HP + Total Defense + Shield Boosts
```
*Every point of defense across your armory directly expands your active health bar in boss encounters, allowing you to endure ferocious boss strikes.*


---

## 📦 Pack Naming Conventions & Consignment Volumes

| Packaging Term | Volume | In-Universe Lore |
| :--- | :--- | :--- |
| **Single / Shard** | `1 Unit` | The fundamental crystallization of an alchemical blueprint. Sufficient to activate the item license in your armory. |
| **10-Pack / 30-Pack** | `10 to 30 Units` | Wholesale crate distribution intended for rapid tycoon scaling. Multiplies passive yield ten-fold. |
| **Gram Fractions (0.5g, 1g, 3.5g, 7g, 14g)** | `Alchemical Essence Weighs` | High-purity mystical reagents (Phoenix Feathers, Dragon Scales, Void Orbs) are weighed in concentrated alchemical grams. Denser weights reflect exponentially deeper alchemical saturation. |
| **Tabs (1-Tab, 10-Tabs)** | `Sublingual Infusion Wafers` | Used exclusively for optical and cognitive enhancers like the Laser Lens. Rapidly absorbed into the champion’s ocular nervous system. |
| **Ziplock / Vacuum Vault** | `Bulk Vacuum Stash (Bulk Quantity)` | Heavyweight reinforced containers for bulk armory storage. Seals in astral volatility and preserves maximum potency. |
