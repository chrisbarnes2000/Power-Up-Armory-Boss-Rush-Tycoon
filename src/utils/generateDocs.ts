import fs from 'fs';
import path from 'path';
import { POWERUPS, BOSSES } from '../data';
import { ITEM_LORES, BOSS_DOSSIERS, CANONICAL_CHAPTERS } from '../loreData';
import {
  generateRootReadme,
  generateSummaryMarkdown,
  generateCompendiumIndexMarkdown,
  generateItemMarkdown,
  generateBossMarkdown,
  generateChapterMarkdown,
  generateSystemsMarkdown,
  slugify
} from './markdownExporter';

const docsDir = path.resolve(process.cwd(), 'docs/lore-book');
const itemsDir = path.join(docsDir, 'items');
const bossesDir = path.join(docsDir, 'bosses');
const chroniclesDir = path.join(docsDir, 'chronicles');
const systemsDir = path.join(docsDir, 'systems');

// Ensure directories exist
[docsDir, itemsDir, bossesDir, chroniclesDir, systemsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Write root files
fs.writeFileSync(path.join(docsDir, 'README.md'), generateRootReadme(), 'utf-8');
fs.writeFileSync(path.join(docsDir, 'SUMMARY.md'), generateSummaryMarkdown(), 'utf-8');

// Write item files
fs.writeFileSync(path.join(itemsDir, 'README.md'), generateCompendiumIndexMarkdown(), 'utf-8');
POWERUPS.forEach(item => {
  const lore = ITEM_LORES.find(l => l.id === item.id);
  const filename = `${slugify(item.id === '???.???' ? 'mystery-artifact' : item.id)}.md`;
  fs.writeFileSync(path.join(itemsDir, filename), generateItemMarkdown(item, lore), 'utf-8');
});

// Write boss files
let bestiaryIndex = `# 👹 Boss Bestiary — Threat Classifications & Tactical Dossiers\n\n`;
bestiaryIndex += `| Boss | Threat | HP | ATK | Gold Reward | Power Req |\n| :--- | :--- | :---: | :---: | :---: | :---: |\n`;
BOSS_DOSSIERS.forEach(b => {
  const bData = BOSSES.find(x => x.id === b.id);
  bestiaryIndex += `| [${bData?.emoji || '👹'} **${b.id}**](./${slugify(b.id)}.md) | \`${b.threatLevel}\` | ${bData?.baseHP || 100} | ${bData?.baseAttack || 10} | ${bData?.reward || 100} | ${bData?.powerReq || 0} PS |\n`;
  fs.writeFileSync(path.join(bossesDir, `${slugify(b.id)}.md`), generateBossMarkdown(b), 'utf-8');
});
fs.writeFileSync(path.join(bossesDir, 'README.md'), bestiaryIndex, 'utf-8');

// Write canonical chronicles
let chIndex = `# 📜 Canonical War Chronicles\n\n`;
CANONICAL_CHAPTERS.forEach(ch => {
  chIndex += `### [${ch.chapterNumber}: ${ch.title}](./${ch.id}.md)\n*${ch.subtitle}* (Era: ${ch.era})\n\n> ${ch.excerpt}\n\n`;
  fs.writeFileSync(path.join(chroniclesDir, `${ch.id}.md`), generateChapterMarkdown(ch), 'utf-8');
});
fs.writeFileSync(path.join(chroniclesDir, 'README.md'), chIndex, 'utf-8');

// Write systems
fs.writeFileSync(path.join(systemsDir, 'realm-systems.md'), generateSystemsMarkdown(), 'utf-8');

console.log('✅ Successfully generated complete Lore Book Markdown site in /docs/lore-book');
