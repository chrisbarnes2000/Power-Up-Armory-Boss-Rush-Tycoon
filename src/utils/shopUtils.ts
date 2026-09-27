import { POWERUPS } from '../data';
import { GamePowerUpState, PurchaseItem, PurchaseRecord } from '../types';

// Utility to calculate base units represented by a pack
export function getPackUnits(powerupId: string, packLabel: string): number {
  const match = packLabel.match(/^(\d+)-(?:Pack|Tabs|pack|tab|tabs)/i);
  if (match) return parseInt(match[1], 10);
  
  if (packLabel === '10-Pack' || packLabel === '10-Tabs') return 10;
  if (packLabel === '30-Pack') return 30;
  if (packLabel === '1-Tab' || packLabel === 'Single' || packLabel === 'Shard' || packLabel === 'pt.') return 1;
  if (packLabel === '1g') return 1;
  if (packLabel === '3.5g') return 3.5;
  if (packLabel === '7g') return 7;
  if (packLabel === '14g') return 14;
  if (packLabel === 'Ziplock') return powerupId === 'Wing Charm' ? 20 : 8;
  if (packLabel === '1/8th') return 1;
  if (packLabel === '1/4') return 2;
  if (packLabel === '1/2') return 4;
  if (packLabel === 'g.') return 10;
  if (packLabel === '1/2g') return 1;
  return 1;
}

// Helper to calculate total discrete units in cart for a specific item
export function getItemTotalUnits(itemId: string, currentCart: { [key: string]: number }): number {
  return Object.keys(currentCart)
    .filter(key => key.startsWith(`${itemId}::`))
    .reduce((sum, key) => {
      const qty = currentCart[key] || 0;
      const packLabel = key.split('::')[1];
      const packUnits = getPackUnits(itemId, packLabel);
      return sum + qty * packUnits;
    }, 0);
}

// Auto-optimize cart for an item into the best combination of bulk packs and individuals
export function optimizeCartForItem(
  itemId: string,
  targetUnits: number,
  prevCart: { [key: string]: number }
): { [key: string]: number } {
  const item = POWERUPS.find(p => p.id === itemId);
  const nextCart = { ...prevCart };

  // Remove all existing cart entries for this item
  Object.keys(nextCart).forEach(k => {
    if (k.startsWith(`${itemId}::`)) {
      delete nextCart[k];
    }
  });

  if (!item || targetUnits <= 0 || item.packs.length === 0) {
    return nextCart;
  }

  // Build pack info list with unit sizes and prices
  const packList = item.packs.map(p => ({
    label: p.label,
    price: p.price,
    units: getPackUnits(item.id, p.label)
  }));

  // Sort descending by unit size (largest packs first to greedily apply best bulk discounts)
  const sortedPacks = [...packList].sort((a, b) => b.units - a.units);

  let remaining = targetUnits;
  for (const pack of sortedPacks) {
    if (pack.units > 1 && pack.units <= remaining) {
      const count = Math.floor(remaining / pack.units);
      if (count > 0) {
        const key = `${itemId}::${pack.label}`;
        nextCart[key] = count;
        remaining -= count * pack.units;
      }
    }
  }

  // Any remainder gets assigned to the base unit pack (smallest unit size)
  if (remaining > 0) {
    const basePack = sortedPacks[sortedPacks.length - 1];
    const key = `${itemId}::${basePack.label}`;
    nextCart[key] = (nextCart[key] || 0) + remaining;
  }

  return nextCart;
}

// Generate Unique checkout 16-character Bridge Key Code
export function generateBridgeKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${segment()}-${segment()}-${segment()}-${segment()}`;
}

export const RARITY_COLORS = {
  'Common': '#8a9aaa',
  'Uncommon': '#6aaa8a',
  'Rare': '#4a8ad0',
  'Epic': '#aa6ad0',
  'Legendary': '#f5a040',
  'Mythic': '#f04080',
  '??': '#6a6a7a'
};

export const RARITY_BG_GLOWS = {
  'Common': 'group-hover:shadow-[0_0_15px_rgba(138,154,170,0.15)]',
  'Uncommon': 'group-hover:shadow-[0_0_15px_rgba(106,170,138,0.2)]',
  'Rare': 'group-hover:shadow-[0_0_15px_rgba(74,138,208,0.25)]',
  'Epic': 'group-hover:shadow-[0_0_15px_rgba(170,106,208,0.3)]',
  'Legendary': 'group-hover:shadow-[0_0_20px_rgba(245,160,64,0.35)]',
  'Mythic': 'group-hover:shadow-[0_0_25px_rgba(240,64,128,0.4)]',
  '??': 'group-hover:shadow-none'
};

export const RARITY_BORDER_COLORS = {
  'Common': 'border-white/10 focus-within:border-white/20',
  'Uncommon': 'border-green-500/20 focus-within:border-green-500/40',
  'Rare': 'border-blue-500/20 focus-within:border-blue-500/40',
  'Epic': 'border-purple-500/20 focus-within:border-purple-500/40',
  'Legendary': 'border-yellow-500/20 focus-within:border-yellow-500/40',
  'Mythic': 'border-red-500/20 focus-within:border-red-500/40',
  '??': 'border-white/5 opacity-50'
};
