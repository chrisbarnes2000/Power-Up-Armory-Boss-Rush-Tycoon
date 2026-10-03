/**
 * Dynamic SVG Share Card Generator
 * Produces high-fidelity 1200x630 vector graphics for OpenGraph, Twitter/X cards, and in-app sharing.
 * Fully compatible with both Node (Vite middleware) and Browser runtimes.
 */

export interface ShareCardParams {
  view?: 'champion' | 'boss' | 'squad' | 'store';
  name?: string;
  title?: string;
  avatar?: string;
  powerScore?: number | string;
  bossesDefeated?: number | string;
  totalBosses?: number | string;
  attack?: number | string;
  defense?: number | string;
  speed?: number | string;
  coins?: number | string;
  gems?: number | string;
  inviteCode?: string;
  bossName?: string;
  bossEmoji?: string;
  itemName?: string;
  itemType?: string;
  date?: string;
}

// Escape XML / SVG special characters
function escapeXml(unsafe: string = ''): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateShareCardSvg(params: ShareCardParams = {}): string {
  const view = params.view || 'champion';
  const name = escapeXml(params.name || 'Hero Champion');
  const title = escapeXml(params.title || 'Grand Champion');
  const avatar = params.avatar || '⚔️';
  const powerScore = Number(params.powerScore) || 1250;
  const bosses = Number(params.bossesDefeated) || 8;
  const maxBosses = Number(params.totalBosses) || 15;
  const attack = Number(params.attack) || 320;
  const defense = Number(params.defense) || 280;
  const speed = Number(params.speed) || 140;
  const coins = Number(params.coins) || 45000;
  const gems = Number(params.gems) || 850;
  const inviteCode = escapeXml(params.inviteCode || 'ARMORY-HERO');
  const bossName = escapeXml(params.bossName || 'Ignis the Molten Overlord');
  const bossEmoji = params.bossEmoji || '🔥';
  const itemName = escapeXml(params.itemName || 'Excalibur of Eternity');
  const dateStr = params.date || new Date().toISOString().split('T')[0];

  // Common Header & Decorative Assets
  const commonDefs = `
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0b1120" />
        <stop offset="40%" stop-color="#0f172a" />
        <stop offset="80%" stop-color="#090d16" />
        <stop offset="100%" stop-color="#05070d" />
      </linearGradient>
      
      <linearGradient id="cyanGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="50%" stop-color="#818cf8" />
        <stop offset="100%" stop-color="#fbbf24" />
      </linearGradient>

      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#fbbf24" />
      </linearGradient>

      <linearGradient id="crimsonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ef4444" />
        <stop offset="100%" stop-color="#f97316" />
      </linearGradient>

      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1e293b" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#0f172a" stop-opacity="0.9" />
      </linearGradient>

      <radialGradient id="ambientGlow" cx="80%" cy="20%" r="50%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>

      <radialGradient id="amberGlow" cx="20%" cy="80%" r="50%">
        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.2" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>

      <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.75" />
      </filter>
    </defs>
  `;

  // Render view-specific content
  let bodyContent = '';

  if (view === 'boss') {
    // Boss Vanquish Card
    bodyContent = `
      <!-- Main Content Card -->
      <g filter="url(#cardShadow)">
        <rect x="70" y="110" width="1060" height="420" rx="32" fill="url(#cardGrad)" stroke="#ef4444" stroke-opacity="0.4" stroke-width="2" />
      </g>

      <!-- Boss Vanquished Banner -->
      <rect x="110" y="145" width="220" height="34" rx="17" fill="#450a0a" stroke="#ef4444" stroke-opacity="0.5" stroke-width="1.5" />
      <text x="220" y="167" fill="#fca5a5" font-family="monospace" font-size="13" font-weight="bold" text-anchor="middle" letter-spacing="2">
        ⚔️ TITAN VANQUISHED
      </text>

      <!-- Boss Avatar & Name -->
      <circle cx="210" cy="290" r="75" fill="#180707" stroke="#ef4444" stroke-width="3" />
      <text x="210" y="315" font-size="70" text-anchor="middle">${bossEmoji}</text>

      <!-- Boss Details -->
      <text x="320" y="240" fill="#f87171" font-family="monospace" font-size="14" font-weight="bold" letter-spacing="3">ARENA CONQUEST</text>
      <text x="320" y="290" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" letter-spacing="-1">
        ${bossName}
      </text>
      <text x="320" y="330" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="20">
        Slain by <tspan fill="#38bdf8" font-weight="bold">${name}</tspan> · Power Score: <tspan fill="#fbbf24" font-weight="bold">${powerScore.toLocaleString()}</tspan>
      </text>

      <!-- Stat Badges Row -->
      <g transform="translate(110, 395)">
        <rect x="0" y="0" width="220" height="95" rx="16" fill="#090d16" stroke="#ffffff" stroke-opacity="0.1" />
        <text x="24" y="34" fill="#94a3b8" font-family="monospace" font-size="12" letter-spacing="1">BOSSES DOWN</text>
        <text x="24" y="74" fill="#ef4444" font-family="monospace" font-size="32" font-weight="bold">${bosses} / ${maxBosses}</text>

        <rect x="240" y="0" width="220" height="95" rx="16" fill="#090d16" stroke="#ffffff" stroke-opacity="0.1" />
        <text x="264" y="34" fill="#94a3b8" font-family="monospace" font-size="12" letter-spacing="1">HERO POWER</text>
        <text x="264" y="74" fill="#38bdf8" font-family="monospace" font-size="32" font-weight="bold">${powerScore.toLocaleString()}</text>

        <rect x="480" y="0" width="460" height="95" rx="16" fill="#1e1b4b" stroke="#818cf8" stroke-opacity="0.4" />
        <text x="504" y="34" fill="#a5b4fc" font-family="monospace" font-size="12" letter-spacing="1">CLAIM SQUAD BOUNTY</text>
        <text x="504" y="72" fill="#fbbf24" font-family="monospace" font-size="24" font-weight="black">Code: ${inviteCode}</text>
        <text x="760" y="72" fill="#c7d2fe" font-family="monospace" font-size="14">+3,000🪙 / +150💎</text>
      </g>
    `;
  } else if (view === 'squad') {
    // Squad Recruitment Card
    bodyContent = `
      <!-- Main Content Card -->
      <g filter="url(#cardShadow)">
        <rect x="70" y="110" width="1060" height="420" rx="32" fill="url(#cardGrad)" stroke="#818cf8" stroke-opacity="0.4" stroke-width="2" />
      </g>

      <!-- Badge -->
      <rect x="110" y="145" width="240" height="34" rx="17" fill="#1e1b4b" stroke="#818cf8" stroke-opacity="0.5" stroke-width="1.5" />
      <text x="230" y="167" fill="#c7d2fe" font-family="monospace" font-size="13" font-weight="bold" text-anchor="middle" letter-spacing="2">
        👥 SQUAD RECRUITMENT
      </text>

      <!-- Center Invite Big Typography -->
      <text x="110" y="240" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" letter-spacing="-1">
        Join ${name}'s Raid Squad
      </text>
      <text x="110" y="280" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="20">
        Form a unified party for upcoming Co-Op Horde Assaults &amp; Titan Raids.
      </text>

      <!-- Invite Code Showcase Block -->
      <rect x="110" y="320" width="500" height="90" rx="20" fill="#030712" stroke="#38bdf8" stroke-width="2" />
      <text x="140" y="354" fill="#94a3b8" font-family="monospace" font-size="12" letter-spacing="2">USE SQUAD INVITE CODE</text>
      <text x="140" y="392" fill="#38bdf8" font-family="monospace" font-size="34" font-weight="black" letter-spacing="3">${inviteCode}</text>

      <!-- Instant Welcome Bonus Box -->
      <rect x="635" y="320" width="445" height="90" rx="20" fill="#14532d" fill-opacity="0.3" stroke="#22c55e" stroke-opacity="0.4" stroke-width="2" />
      <text x="660" y="354" fill="#86efac" font-family="monospace" font-size="12" letter-spacing="2">INSTANT WELCOME BONUS</text>
      <text x="660" y="392" fill="#fde047" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="bold">+3,000 Coins + 150 Gems</text>

      <!-- Bottom Disclaimer -->
      <text x="110" y="470" fill="#64748b" font-family="monospace" font-size="14">
        Play free · No download required · Browser &amp; Mobile Web App
      </text>
    `;
  } else {
    // Default: Champion Profile Card
    bodyContent = `
      <!-- Main Content Card -->
      <g filter="url(#cardShadow)">
        <rect x="70" y="110" width="1060" height="420" rx="32" fill="url(#cardGrad)" stroke="#38bdf8" stroke-opacity="0.35" stroke-width="2" />
      </g>

      <!-- Champion Tier Badge -->
      <rect x="110" y="145" width="230" height="34" rx="17" fill="#0c4a6e" fill-opacity="0.6" stroke="#38bdf8" stroke-opacity="0.5" stroke-width="1.5" />
      <text x="225" y="167" fill="#7dd3fc" font-family="monospace" font-size="13" font-weight="bold" text-anchor="middle" letter-spacing="2">
        👑 OFFICIAL CHAMPION
      </text>

      <!-- Champion Avatar Circle -->
      <circle cx="195" cy="275" r="65" fill="#080e1a" stroke="#38bdf8" stroke-width="3" />
      <text x="195" y="298" font-size="60" text-anchor="middle">${avatar}</text>

      <!-- Hero Identity -->
      <text x="285" y="240" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="bold" letter-spacing="3">${title.toUpperCase()}</text>
      <text x="285" y="285" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" letter-spacing="-1">
        ${name}
      </text>
      <text x="285" y="322" fill="#94a3b8" font-family="monospace" font-size="16">
        Squad Code: <tspan fill="#38bdf8" font-weight="bold">${inviteCode}</tspan> · Verified Roster ID
      </text>

      <!-- Stat Badges Grid -->
      <g transform="translate(110, 365)">
        <!-- Power Score -->
        <rect x="0" y="0" width="220" height="125" rx="18" fill="#090d16" stroke="#38bdf8" stroke-opacity="0.3" />
        <text x="24" y="36" fill="#94a3b8" font-family="monospace" font-size="12" letter-spacing="1">⚡ POWER SCORE</text>
        <text x="24" y="82" fill="#38bdf8" font-family="monospace" font-size="36" font-weight="black">${powerScore.toLocaleString()}</text>
        <text x="24" y="106" fill="#64748b" font-family="system-ui, sans-serif" font-size="12">Combat Rating</text>

        <!-- Bosses Vanquished -->
        <rect x="240" y="0" width="220" height="125" rx="18" fill="#090d16" stroke="#fbbf24" stroke-opacity="0.3" />
        <text x="264" y="36" fill="#94a3b8" font-family="monospace" font-size="12" letter-spacing="1">🏆 BOSSES SLAIN</text>
        <text x="264" y="82" fill="#fbbf24" font-family="monospace" font-size="36" font-weight="black">${bosses} / ${maxBosses}</text>
        <text x="264" y="106" fill="#64748b" font-family="system-ui, sans-serif" font-size="12">Conquests Recorded</text>

        <!-- Core Attributes -->
        <rect x="480" y="0" width="250" height="125" rx="18" fill="#090d16" stroke="#ffffff" stroke-opacity="0.1" />
        <text x="504" y="36" fill="#94a3b8" font-family="monospace" font-size="12" letter-spacing="1">⚔️ COMBAT METRICS</text>
        <text x="504" y="70" fill="#f87171" font-family="monospace" font-size="16" font-weight="bold">ATK: ${attack}</text>
        <text x="620" y="70" fill="#60a5fa" font-family="monospace" font-size="16" font-weight="bold">DEF: ${defense}</text>
        <text x="504" y="102" fill="#34d399" font-family="monospace" font-size="16" font-weight="bold">SPD: ${speed}</text>
        <text x="620" y="102" fill="#fde047" font-family="monospace" font-size="16" font-weight="bold">🪙 ${coins > 9999 ? `${Math.floor(coins / 1000)}k` : coins}</text>

        <!-- Join Squad CTA Card -->
        <rect x="750" y="0" width="230" height="125" rx="18" fill="#1e1b4b" stroke="#818cf8" stroke-opacity="0.5" />
        <text x="770" y="36" fill="#c7d2fe" font-family="monospace" font-size="12" letter-spacing="1">JOIN SQUAD</text>
        <text x="770" y="75" fill="#fde047" font-family="monospace" font-size="20" font-weight="bold">+3,000 Coins</text>
        <text x="770" y="102" fill="#7dd3fc" font-family="monospace" font-size="13">+150 Gems bonus</text>
      </g>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" style="background:#0a0e1a">
    ${commonDefs}

    <!-- Background Canvas -->
    <rect width="1200" height="630" fill="url(#bgGrad)" />
    
    <!-- Ambient Radial Glows -->
    <circle cx="950" cy="120" r="400" fill="url(#ambientGlow)" />
    <circle cx="200" cy="500" r="400" fill="url(#amberGlow)" />

    <!-- Subtle Tech Grid Lines -->
    <g stroke="#ffffff" stroke-opacity="0.04" stroke-width="1">
      <line x1="0" y1="100" x2="1200" y2="100" />
      <line x1="0" y1="200" x2="1200" y2="200" />
      <line x1="0" y1="300" x2="1200" y2="300" />
      <line x1="0" y1="400" x2="1200" y2="400" />
      <line x1="0" y1="500" x2="1200" y2="500" />
      <line x1="200" y1="0" x2="200" y2="630" />
      <line x1="400" y1="0" x2="400" y2="630" />
      <line x1="600" y1="0" x2="600" y2="630" />
      <line x1="800" y1="0" x2="800" y2="630" />
      <line x1="1000" y1="0" x2="1000" y2="630" />
    </g>

    <!-- Top Application Header -->
    <g transform="translate(70, 55)">
      <text x="0" y="24" fill="url(#cyanGoldGrad)" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="900" letter-spacing="1">
        POWER-UP ARMORY
      </text>
      <text x="270" y="24" fill="#64748b" font-family="monospace" font-size="20">·</text>
      <text x="290" y="24" fill="#94a3b8" font-family="monospace" font-size="18" font-weight="bold" letter-spacing="2">
        BOSS RUSH TYCOON
      </text>

      <!-- Right-side Season Tag -->
      <text x="1060" y="24" fill="#fbbf24" font-family="monospace" font-size="14" font-weight="bold" text-anchor="end" letter-spacing="1">
        SEASON 2026 · LIVE ROSTER
      </text>
    </g>

    <!-- Dynamic Body Content -->
    ${bodyContent}

    <!-- Bottom Footer Brand & Watermark -->
    <g transform="translate(70, 580)">
      <text x="0" y="15" fill="#64748b" font-family="monospace" font-size="13">
        ⚔️ Play at <tspan fill="#38bdf8">poweruparmory.game</tspan> · Affiliate with <tspan fill="#a78bfa">RapportVerse</tspan> &amp; <tspan fill="#38bdf8">MiniBarnMaster</tspan>
      </text>
      <text x="1060" y="15" fill="#475569" font-family="monospace" font-size="13" text-anchor="end">
        Verified Game State · ${dateStr}
      </text>
    </g>
  </svg>`;
}
