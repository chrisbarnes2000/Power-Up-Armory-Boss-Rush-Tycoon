import JSZip from 'jszip';
import { POWERUPS, BOSSES } from '../data';
import { ITEM_LORES, BOSS_DOSSIERS, CANONICAL_CHAPTERS, SYSTEM_LEGEND, VEILED_LEDGER_PREAMBLE, ItemLoreEntry, BossDossier, CanonicalChapter } from '../loreData';
import { PowerUp } from '../types';

/**
 * Converts an item identifier into a safe filename slug (e.g. "Focus Blade" -> "focus-blade")
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-');
}

/**
 * Generates rich, structured Markdown for an individual item in the Item Compendium.
 */
export function generateItemMarkdown(item: PowerUp, lore?: ItemLoreEntry): string {
  const category = lore?.category || (['Focus Blade', 'Rage Axe', 'Speed Dagger', 'Shield Breaker', 'Wing Charm', '???.???'].includes(item.id)
    ? 'Weapons'
    : ['Magnetite Shield', 'Cloak of Shadows', 'Titan Armor'].includes(item.id)
    ? 'Defense'
    : ['Laser Lens', 'Phantom Dust', 'Dragon Scale'].includes(item.id)
    ? 'Utility'
    : 'Mystic');

  const vendorName = lore?.vendorName || '"Echoes of the Old Tongue"';
  const vendorQuote = lore?.vendorQuote || 'The vendors speak in the Old Tongue — a dialect of metaphor, memory, and mercy.';
  const deliverableEcho = lore?.deliverableEcho || 'The Deliverables are not covers. They are echoes.';
  const inGameEffect = lore?.inGameEffect || item.effect;
  const mythos = lore?.mythos || item.description;
  const forging = lore?.forgingRecord || 'Forging records classified by the High Smith.';
  const significance = lore?.battleSignificance || item.effect;
  const targetBoss = lore?.bossCounter?.targetBoss || 'General Encounters';
  const whyItWorks = lore?.bossCounter?.whyItWorks || 'Balanced combat efficiency.';
  const tycoonPhil = lore?.tycoonPhilosophy || `Generates ${item.baseRate} Gold/s passive yield.`;

  return `---
title: "${item.id}"
vendorName: '${vendorName}'
category: "${category}"
rarity: "${item.rarity}"
emoji: "${item.emoji}"
attack: ${item.attack}
defense: ${item.defense}
speed: ${item.speed}
baseGoldRate: ${item.baseRate}
maxLevel: ${item.maxLevel}
upgradeCost: ${item.upgradeCost}
---

# ${item.emoji} ${item.id}
### *Vendor Name:* **${vendorName}**
*Category: ${category}*

> *" ${item.description} "*

---

## 📜 The Veiled Ledger Mythos

${mythos}

> 💬 **Vendor Voice:**  
> *"${vendorQuote}"*

> 🔮 **Nature of the Deliverable:**  
> *${deliverableEcho}*

---

## 🎮 In-Game Effect & Combat Parameters

- **In-Game Effect:** **${inGameEffect}**
- **Passive Aura:** ${item.effect}
- **Special Technique:** ${item.special || 'Standard armory calibration.'}

| Stat | Rating | Tactical Function |
| :--- | :--- | :--- |
| ⚔️ **Attack (ATK)** | \`+${item.attack}\` | Direct damage applied per combat turn |
| 🛡️ **Defense (DEF)** | \`+${item.defense}\` | Contributes to hero health and damage absorption |
| 💨 **Speed (SPD)** | \`+${item.speed}\` | Modifies evasion threshold and turn priority |
| 🪙 **Tycoon Rate** | \`+${item.baseRate}/s\` | Passive gold generated per second in the Bazaar |

---

## 🔨 Forging & Reagent Record

${forging}

---

## ⚔️ Battle Significance

${significance}

---

## 🎯 Tactical Boss Counter

- **Target Boss:** **${targetBoss}**
- **Tactical Rationale:** ${whyItWorks}

---

## 💰 Tycoon Economic Philosophy

${tycoonPhil}

---

## Store Packs & Commercial Consignment

| Pack Format | Unit Cost (USD) | In-Universe Lore |
| :--- | :--- | :--- |
${item.packs.length > 0 
  ? item.packs.map(p => `| **${p.label}** | \`$${p.price} USD\` | Standard commercial armory consignment |`).join('\n')
  : '| *Special Consignment* | N/A | Available via bazaar special order |'
}

---

> ### 📝 Developer & Lore Note:
> To update this item in the web application codebase:
> 1. Combat stats, pricing, and packs: \`src/data.ts\` -> \`POWERUPS\`
> 2. Mythos, vendor names, deliverable echoes, and boss counters: \`src/loreData.ts\` -> \`ITEM_LORES\`
`;
}

/**
 * Generates the Item Compendium Index Markdown with summary table
 */
export function generateCompendiumIndexMarkdown(): string {
  let md = `# ⚔️ POWER-UP ARMORY — LORE COMPENDIUM
### *The Veiled Ledger of the Bazaar*

---

## 📜 ON THE NATURE OF THE DELIVERABLES

> *In the Bazaar, nothing is sold by its true name.*
>
> *The Supply Chain is not a pipeline of products. It is a **river of essence** — each Power-Up artifact bleeds a residue that crystallizes, condenses, or ferments into a form the uninitiated can carry. The vendors do not lie. They simply speak in **the Old Tongue** — a dialect of metaphor, memory, and mercy.*
>
> *When a vendor says "Gumdrops," they are not hiding candy. They are honoring the Focus Blade's first wielder, who chewed sweet resin before every duel. When they say "Snow," they are not hiding powder. They are remembering the Dragon Scale's origin — a beast that slept in a blizzard and woke in a furnace.*
>
> *The Deliverables are not covers. They are **echoes**. Every street name is a prayer to the artifact that birthed it.*

---

## 📊 Comprehensive Item Directory

| Item | Vendor / Street Name | Category | Rarity | ATK | DEF | SPD | Gold Yield |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
`;

  POWERUPS.forEach(item => {
    const lore = ITEM_LORES.find(l => l.id === item.id);
    const category = lore?.category || 'Artifact';
    const vendor = lore?.vendorName || '"The Echo"';
    const filename = slugify(item.id === '???.???' ? 'mystery-artifact' : item.id);
    md += `| [${item.emoji} **${item.id}**](./${filename}.md) | ${vendor} | ${category} | \`${item.rarity}\` | +${item.attack} | +${item.defense} | +${item.speed} | +${item.baseRate}/s |\n`;
  });

  md += `
---

## 📂 Category Navigation

- **⚔️ Weapons:** [Focus Blade (Gumdrops)](./focus-blade.md), [Rage Axe (Sap)](./rage-axe.md), [Speed Dagger (Cartridges)](./speed-dagger.md), [Shield Breaker (Burners)](./shield-breaker.md), [Wing Charm (Fluff)](./wing-charm.md)
- **🛡️ Defense:** [Magnetite Shield (Buttons)](./magnetite-shield.md), [Cloak of Shadows (Bars)](./cloak-of-shadows.md), [Titan Armor (Caps & Stems)](./titan-armor.md)
- **✨ Utility:** [Laser Lens (Tabs)](./laser-lens.md), [Phantom Dust (Points)](./phantom-dust.md), [Dragon Scale (Snow)](./dragon-scale.md)
- **🌀 Mystic:** [Phoenix Feather (R)](./phoenix-feather.md), [Void Orb (S)](./void-orb.md), [Star Fragment (SandS)](./star-fragment.md)

---

## 💡 How to Edit Item Lore

1. Edit the respective item Markdown file in this \`items/\` directory.
2. In the application source code:
   - **Numerical Balance & Pricing**: Located in \`src/data.ts\` in the \`POWERUPS\` array.
   - **Lore, Mythos, Vendor Names, Forging Records & Counter Roles**: Located in \`src/loreData.ts\` in the \`ITEM_LORES\` array.
`;

  return md;
}

/**
 * Generates Markdown for a Boss Dossier
 */
export function generateBossMarkdown(boss: BossDossier): string {
  const bossData = BOSSES.find(b => b.id === boss.id);
  const emoji = bossData?.emoji || '👹';
  const hp = bossData?.baseHP || 100;
  const attack = bossData?.baseAttack || 10;
  const bounty = bossData?.reward || 100;
  const powerReq = bossData?.powerReq || 0;

  return `---
title: "${boss.id}"
threatLevel: "${boss.threatLevel}"
hp: ${hp}
attack: ${attack}
bountyGold: ${bounty}
powerRequirement: ${powerReq}
---

# ${emoji} ${boss.id} — ${boss.title}

> *"Threat Level: ${boss.threatLevel}"*

## Combat Dossier

| Metric | Rating |
| :--- | :--- |
| **Threat Classification** | \`${boss.threatLevel}\` |
| **Vital Health Pool** | \`${hp.toLocaleString()} HP\` |
| **Base Attack Force** | \`${attack} ATK\` |
| **Gold Bounty Reward** | \`+${bounty.toLocaleString()} 🪙\` |
| **Power Score Requirement** | \`${powerReq} PS\` |

---

## 📜 Historical Record
${boss.historicalRecord}

---

## 👁️ Lore & Biology
${boss.lore}

---

## ⚔️ Combat Behavior & Enrage Mechanics
${boss.behaviorLore}

---

## 🎯 Tactical Weakness
${boss.tacticalWeakness}

---

## 🛡️ Recommended Arsenal
${boss.recommendedArsenal.map(item => `- **${item}**`).join('\n')}
`;
}

/**
 * Generates Markdown for a Canonical Lore Chapter
 */
export function generateChapterMarkdown(chapter: CanonicalChapter): string {
  return `---
title: "${chapter.title}"
chapter: "${chapter.chapterNumber}"
era: "${chapter.era}"
featuredBoss: "${chapter.featuredBoss}"
---

# ${chapter.chapterNumber}: ${chapter.title}
### *${chapter.subtitle}*
**Era:** *${chapter.era}*  
**Featured Adversary:** *${chapter.featuredBoss}*  
**Key Armaments:** *${chapter.featuredItems.join(', ')}*

---

> *" ${chapter.excerpt} "*

## The Chronicle

${chapter.chronicle.map(paragraph => `${paragraph}\n`).join('\n')}

---

## 🎯 Tactical Lesson from Antiquity
> **${chapter.tacticalLesson}**
`;
}

/**
 * Generates Markdown for the Systems & Tycoon mechanics
 */
export function generateSystemsMarkdown(): string {
  return `# ⚙️ Realm Systems & Tycoon Mechanics

Comprehensive documentation of the mathematical formulas, currencies, and economic conventions of the **Power-Up Armory**.

---

## 💰 Currencies of the Realm

${SYSTEM_LEGEND.currencies.map(c => `### ${c.name}
- **Primary Role:** ${c.role}
- **Harvest Sources:** ${c.sources}
- **Strategic Applications:** ${c.uses}
`).join('\n')}

---

## 📐 Mathematical Formulas

${SYSTEM_LEGEND.tycoonFormulas.map(f => `### ${f.label}
\`\`\`
${f.formula}
\`\`\`
*${f.explanation}*
`).join('\n')}

---

## 📦 Pack Naming Conventions & Consignment Volumes

| Packaging Term | Volume | In-Universe Lore |
| :--- | :--- | :--- |
${SYSTEM_LEGEND.packNomenclature.map(p => `| **${p.term}** | \`${p.volume}\` | ${p.lore} |`).join('\n')}
`;
}

/**
 * Generates the Root README for the Lore Book documentation site
 */
export function generateRootReadme(): string {
  return `# ⚔️ Power-Up Armory — Lore Book & Item Compendium

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
- **Item stats and pricing**: Edit \`src/data.ts\` -> \`POWERUPS\`
- **Item lore, mythos, and boss counters**: Edit \`src/loreData.ts\` -> \`ITEM_LORES\`
- **Boss health, attack, and rewards**: Edit \`src/data.ts\` -> \`BOSSES\`
- **Boss lore dossiers**: Edit \`src/loreData.ts\` -> \`BOSS_DOSSIERS\`
- **Canonical stories**: Edit \`src/loreData.ts\` -> \`CANONICAL_CHAPTERS\`
`;
}

/**
 * Generates SUMMARY.md for GitBook / mdBook compatibility
 */
export function generateSummaryMarkdown(): string {
  let md = `# Summary

* [Introduction](README.md)

## Item Compendium
* [Compendium Index](items/README.md)
`;

  POWERUPS.forEach(item => {
    const filename = slugify(item.id === '???.???' ? 'mystery-artifact' : item.id);
    md += `  * [${item.emoji} ${item.id}](items/${filename}.md)\n`;
  });

  md += `
## Boss Bestiary
* [Bestiary Index](bosses/README.md)
`;

  BOSS_DOSSIERS.forEach(boss => {
    const filename = slugify(boss.id);
    md += `  * [${boss.id}](bosses/${filename}.md)\n`;
  });

  md += `
## Canonical Chronicles
* [Chronicles Index](chronicles/README.md)
`;

  CANONICAL_CHAPTERS.forEach(ch => {
    md += `  * [${ch.chapterNumber}: ${ch.title}](chronicles/${ch.id}.md)\n`;
  });

  md += `
## Systems & Mechanics
* [Realm Systems](systems/realm-systems.md)
`;

  return md;
}

/**
 * Downloads a single item's Markdown file
 */
export function downloadSingleItemMarkdown(item: PowerUp, lore?: ItemLoreEntry) {
  const content = generateItemMarkdown(item, lore);
  const filename = `${slugify(item.id === '???.???' ? 'mystery-artifact' : item.id)}.md`;
  
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads the full Lore Book Markdown site as a organized .zip archive
 */
export async function downloadLoreBookZip(): Promise<void> {
  const zip = new JSZip();

  // Root files
  zip.file('README.md', generateRootReadme());
  zip.file('SUMMARY.md', generateSummaryMarkdown());

  // items/ folder
  const itemsFolder = zip.folder('items');
  if (itemsFolder) {
    itemsFolder.file('README.md', generateCompendiumIndexMarkdown());
    POWERUPS.forEach(item => {
      const lore = ITEM_LORES.find(l => l.id === item.id);
      const filename = `${slugify(item.id === '???.???' ? 'mystery-artifact' : item.id)}.md`;
      itemsFolder.file(filename, generateItemMarkdown(item, lore));
    });
  }

  // bosses/ folder
  const bossesFolder = zip.folder('bosses');
  if (bossesFolder) {
    let bestiaryIndex = `# 👹 Boss Bestiary — Threat Classifications & Tactical Dossiers\n\n`;
    bestiaryIndex += `| Boss | Threat | HP | ATK | Gold Reward | Power Req |\n| :--- | :--- | :---: | :---: | :---: | :---: |\n`;
    BOSS_DOSSIERS.forEach(b => {
      const bData = BOSSES.find(x => x.id === b.id);
      bestiaryIndex += `| [${bData?.emoji || '👹'} **${b.id}**](./${slugify(b.id)}.md) | \`${b.threatLevel}\` | ${bData?.baseHP || 100} | ${bData?.baseAttack || 10} | ${bData?.reward || 100} | ${bData?.powerReq || 0} PS |\n`;
      bossesFolder.file(`${slugify(b.id)}.md`, generateBossMarkdown(b));
    });
    bossesFolder.file('README.md', bestiaryIndex);
  }

  // chronicles/ folder
  const chroniclesFolder = zip.folder('chronicles');
  if (chroniclesFolder) {
    let chIndex = `# 📜 Canonical War Chronicles\n\n`;
    CANONICAL_CHAPTERS.forEach(ch => {
      chIndex += `### [${ch.chapterNumber}: ${ch.title}](./${ch.id}.md)\n*${ch.subtitle}* (Era: ${ch.era})\n\n> ${ch.excerpt}\n\n`;
      chroniclesFolder.file(`${ch.id}.md`, generateChapterMarkdown(ch));
    });
    chroniclesFolder.file('README.md', chIndex);
  }

  // systems/ folder
  const systemsFolder = zip.folder('systems');
  if (systemsFolder) {
    systemsFolder.file('realm-systems.md', generateSystemsMarkdown());
  }

  // Generate and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'power-up-armory-lore-book-markdown.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
