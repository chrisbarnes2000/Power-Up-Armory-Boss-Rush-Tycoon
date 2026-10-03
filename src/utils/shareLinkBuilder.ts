/**
 * Share Link & Dynamic SVG URL Builder
 * Generates rich deep-tagged URLs and handles multi-channel sharing (Web Share, Twitter, Clipboard, SVG download).
 */

import { generateShareCardSvg, ShareCardParams } from './dynamicShareSvg';

export interface BuildShareUrlOptions {
  view?: 'champion' | 'boss' | 'squad' | 'store';
  player?: string;
  title?: string;
  avatar?: string;
  powerScore?: number;
  bossesDefeated?: number;
  totalBosses?: number;
  attack?: number;
  defense?: number;
  speed?: number;
  coins?: number;
  gems?: number;
  inviteCode?: string;
  bossName?: string;
  bossEmoji?: string;
  itemName?: string;
  medium?: string;
}

export function getAppBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://poweruparmory.game';
}

/**
 * Builds the deep-tagged application URL that users land on
 */
export function buildDeepShareUrl(options: BuildShareUrlOptions = {}): string {
  const baseUrl = getAppBaseUrl();
  const url = new URL(baseUrl);

  url.searchParams.set('view', options.view || 'champion');
  if (options.player) url.searchParams.set('player', options.player);
  if (options.title) url.searchParams.set('title', options.title);
  if (options.avatar) url.searchParams.set('avatar', options.avatar);
  if (options.powerScore !== undefined) url.searchParams.set('ps', String(options.powerScore));
  if (options.bossesDefeated !== undefined) url.searchParams.set('bosses', String(options.bossesDefeated));
  if (options.totalBosses !== undefined) url.searchParams.set('maxBosses', String(options.totalBosses));
  if (options.attack !== undefined) url.searchParams.set('atk', String(options.attack));
  if (options.defense !== undefined) url.searchParams.set('def', String(options.defense));
  if (options.speed !== undefined) url.searchParams.set('spd', String(options.speed));
  if (options.coins !== undefined) url.searchParams.set('coins', String(options.coins));
  if (options.gems !== undefined) url.searchParams.set('gems', String(options.gems));
  if (options.inviteCode) url.searchParams.set('invite', options.inviteCode);
  if (options.bossName) url.searchParams.set('boss', options.bossName);
  if (options.bossEmoji) url.searchParams.set('bossEmoji', options.bossEmoji);
  if (options.itemName) url.searchParams.set('item', options.itemName);

  // Standardized UTM Attribution
  url.searchParams.set('utm_source', 'share_card');
  url.searchParams.set('utm_medium', options.medium || 'dynamic_svg');
  url.searchParams.set('utm_campaign', `${options.view || 'champion'}_showcase`);
  if (options.inviteCode) url.searchParams.set('ref', options.inviteCode);

  return url.toString();
}

/**
 * Builds the direct endpoint URL for the dynamic SVG image
 */
export function buildDynamicSvgUrl(options: BuildShareUrlOptions = {}): string {
  const baseUrl = getAppBaseUrl();
  const url = new URL('/share-card.svg', baseUrl);

  url.searchParams.set('view', options.view || 'champion');
  if (options.player) url.searchParams.set('player', options.player);
  if (options.title) url.searchParams.set('title', options.title);
  if (options.avatar) url.searchParams.set('avatar', options.avatar);
  if (options.powerScore !== undefined) url.searchParams.set('ps', String(options.powerScore));
  if (options.bossesDefeated !== undefined) url.searchParams.set('bosses', String(options.bossesDefeated));
  if (options.totalBosses !== undefined) url.searchParams.set('maxBosses', String(options.totalBosses));
  if (options.attack !== undefined) url.searchParams.set('atk', String(options.attack));
  if (options.defense !== undefined) url.searchParams.set('def', String(options.defense));
  if (options.speed !== undefined) url.searchParams.set('spd', String(options.speed));
  if (options.coins !== undefined) url.searchParams.set('coins', String(options.coins));
  if (options.gems !== undefined) url.searchParams.set('gems', String(options.gems));
  if (options.inviteCode) url.searchParams.set('code', options.inviteCode);
  if (options.bossName) url.searchParams.set('boss', options.bossName);
  if (options.bossEmoji) url.searchParams.set('bossEmoji', options.bossEmoji);
  if (options.itemName) url.searchParams.set('item', options.itemName);

  return url.toString();
}

/**
 * Download the dynamic SVG directly to the user's device as a vector file
 */
export function downloadShareCardSvg(params: ShareCardParams, filename: string = 'champion-codex-card.svg'): void {
  const svgContent = generateShareCardSvg(params);
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
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
 * Format pre-composed social share text
 */
export function getShareText(options: BuildShareUrlOptions): string {
  const name = options.player || 'Champion';
  const ps = options.powerScore ? options.powerScore.toLocaleString() : '1,000';
  const bosses = options.bossesDefeated || 0;
  const invite = options.inviteCode ? `\n🎁 Join squad code [${options.inviteCode}] for +3,000 Coins + 150 Gems bonus!` : '';

  if (options.view === 'boss') {
    return `⚔️ Victory! ${name} vanquished ${options.bossName || 'the Boss'} on Power-Up Armory! (Power Score: ${ps})${invite}`;
  }
  if (options.view === 'squad') {
    return `👥 Join ${name}'s Raid Squad on Power-Up Armory! Use code [${options.inviteCode || 'ARMORY'}] to claim +3,000 Coins + 150 Gems!`;
  }
  return `👑 Inspect ${name}'s Champion Codex Card on Power-Up Armory! ⚡ Power Score: ${ps} | 🏆 Bosses Slain: ${bosses}${invite}`;
}

/**
 * Prepares an SVG file for native device sharing
 */
export async function shareSvgAsFile(params: ShareCardParams, filename: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.canShare) return false;

  const svgContent = generateShareCardSvg(params);
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const file = new File([blob], filename, { type: 'image/svg+xml' });

  if (navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Power-Up Armory Share Card',
      });
      return true;
    } catch (e) {
      console.warn('Native file share failed:', e);
      return false;
    }
  }
  return false;
}
