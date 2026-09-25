import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { POWERUPS } from '../data';
import { GameState, PurchaseItem, PurchaseRecord } from '../types';

interface ShopViewProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onOpenLoreBook?: () => void;
  controlledCategory?: 'weapons' | 'defense' | 'utility' | 'mystic';
  onCategoryChange?: (category: 'weapons' | 'defense' | 'utility' | 'mystic') => void;
  openCartDrawer?: boolean;
}

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

export default function ShopView({
  gameState,
  setGameState,
  onOpenLoreBook,
  controlledCategory,
  onCategoryChange,
  openCartDrawer
}: ShopViewProps) {
  // Category tabs
  const [activeCategory, setActiveCategory] = useState<'weapons' | 'defense' | 'utility' | 'mystic'>(controlledCategory || 'weapons');
  
  // Local cart state: key is `item_id::pack_label` -> quantity
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (controlledCategory) {
      setActiveCategory(controlledCategory);
    }
  }, [controlledCategory]);

  React.useEffect(() => {
    if (typeof openCartDrawer === 'boolean') {
      setPreviewOpen(openCartDrawer);
    }
  }, [openCartDrawer]);

  const handleCategorySelect = (key: 'weapons' | 'defense' | 'utility' | 'mystic') => {
    setActiveCategory(key);
    onCategoryChange?.(key);
  };

  const copyToClipboard = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to resolve categories
  const categories = {
    weapons: {
      id: 'weapons',
      icon: '⚔️',
      name: 'Weapons',
      items: POWERUPS.filter(p => ['Focus Blade', 'Rage Axe', 'Speed Dagger', 'Shield Breaker', 'Wing Charm', '???.???'].includes(p.id))
    },
    defense: {
      id: 'defense',
      icon: '🛡️',
      name: 'Defense',
      items: POWERUPS.filter(p => ['Magnetite Shield', 'Cloak of Shadows', 'Titan Armor'].includes(p.id))
    },
    utility: {
      id: 'utility',
      icon: '✨',
      name: 'Utility',
      items: POWERUPS.filter(p => ['Laser Lens', 'Phantom Dust', 'Dragon Scale'].includes(p.id))
    },
    mystic: {
      id: 'mystic',
      icon: '🌀',
      name: 'Mystic',
      items: POWERUPS.filter(p => ['Phoenix Feather', 'Void Orb', 'Star Fragment'].includes(p.id))
    }
  };

  const rarityColors = {
    'Common': '#8a9aaa',
    'Uncommon': '#6aaa8a',
    'Rare': '#4a8ad0',
    'Epic': '#aa6ad0',
    'Legendary': '#f5a040',
    'Mythic': '#f04080',
    '??': '#6a6a7a'
  };

  const rarityBgGlows = {
    'Common': 'group-hover:shadow-[0_0_15px_rgba(138,154,170,0.15)]',
    'Uncommon': 'group-hover:shadow-[0_0_15px_rgba(106,170,138,0.2)]',
    'Rare': 'group-hover:shadow-[0_0_15px_rgba(74,138,208,0.25)]',
    'Epic': 'group-hover:shadow-[0_0_15px_rgba(170,106,208,0.3)]',
    'Legendary': 'group-hover:shadow-[0_0_20px_rgba(245,160,64,0.35)]',
    'Mythic': 'group-hover:shadow-[0_0_25px_rgba(240,64,128,0.4)]',
    '??': 'group-hover:shadow-none'
  };

  const rarityBorderColors = {
    'Common': 'border-white/10 focus-within:border-white/20',
    'Uncommon': 'border-green-500/20 focus-within:border-green-500/40',
    'Rare': 'border-blue-500/20 focus-within:border-blue-500/40',
    'Epic': 'border-purple-500/20 focus-within:border-purple-500/40',
    'Legendary': 'border-yellow-500/20 focus-within:border-yellow-500/40',
    'Mythic': 'border-red-500/20 focus-within:border-red-500/40',
    '??': 'border-white/5 opacity-50'
  };

  // Helper to calculate total discrete units in cart for a specific item
  const getItemTotalUnits = (itemId: string, currentCart: { [key: string]: number }): number => {
    return Object.keys(currentCart)
      .filter(key => key.startsWith(`${itemId}::`))
      .reduce((sum, key) => {
        const qty = currentCart[key] || 0;
        const packLabel = key.split('::')[1];
        const packUnits = getPackUnits(itemId, packLabel);
        return sum + qty * packUnits;
      }, 0);
  };

  // Auto-optimize cart for an item into the best combination of bulk packs and individuals
  const optimizeCartForItem = (
    itemId: string,
    targetUnits: number,
    prevCart: { [key: string]: number }
  ): { [key: string]: number } => {
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
  };

  // Add item to cart with automated milestone pack optimization
  const addToCart = (itemId: string, packLabel: string) => {
    const packUnits = getPackUnits(itemId, packLabel);
    setCart(prev => {
      const currentUnits = getItemTotalUnits(itemId, prev);
      const newUnits = currentUnits + packUnits;
      return optimizeCartForItem(itemId, newUnits, prev);
    });
    setGeneratedCode(null);
  };

  // Remove or decrement
  const removeFromCart = (itemId: string, packLabel: string) => {
    const packUnits = getPackUnits(itemId, packLabel);
    setCart(prev => {
      const currentUnits = getItemTotalUnits(itemId, prev);
      const newUnits = Math.max(0, currentUnits - packUnits);
      return optimizeCartForItem(itemId, newUnits, prev);
    });
    setGeneratedCode(null);
  };

  // Increment item by 1 unit with auto-pack milestone optimization
  const quickPlus = (itemId: string) => {
    const item = POWERUPS.find(p => p.id === itemId);
    if (!item || item.comingSoon || item.packs.length === 0) return;
    setCart(prev => {
      const currentUnits = getItemTotalUnits(itemId, prev);
      const newUnits = currentUnits + 1;
      return optimizeCartForItem(itemId, newUnits, prev);
    });
    setGeneratedCode(null);
  };

  // Decrement item by 1 unit with auto-pack milestone optimization
  const quickMinus = (itemId: string) => {
    const item = POWERUPS.find(p => p.id === itemId);
    if (!item || item.comingSoon) return;
    setCart(prev => {
      const currentUnits = getItemTotalUnits(itemId, prev);
      const newUnits = Math.max(0, currentUnits - 1);
      return optimizeCartForItem(itemId, newUnits, prev);
    });
    setGeneratedCode(null);
  };

  // Calculate cart metrics (total cost, total discrete item count, and line items)
  const getCartMetrics = () => {
    let total = 0;
    let count = 0;
    const itemsList: PurchaseItem[] = [];

    Object.keys(cart).forEach(key => {
      const qty = cart[key] || 0;
      const [itemId, packLabel] = key.split('::');
      const item = POWERUPS.find(p => p.id === itemId);
      if (item && qty > 0) {
        const pack = item.packs.find(p => p.label === packLabel);
        if (pack) {
          total += pack.price * qty;
          const units = getPackUnits(itemId, packLabel);
          count += qty * units;
          itemsList.push({
            id: itemId,
            pack: packLabel,
            qty,
            price: pack.price,
            emoji: item.emoji
          });
        }
      }
    });

    return { total, count, itemsList };
  };

  const { total: cartTotal, count: cartCount, itemsList: cartItems } = getCartMetrics();

  // Reset cart
  const resetCart = () => {
    setCart({});
    setGeneratedCode(null);
  };

  // Generate Unique checkout 16-character Code (Bridge)
  const checkoutCode = () => {
    if (cartCount === 0) return;
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const code = `${segment()}-${segment()}-${segment()}-${segment()}`;

    const newRecord: PurchaseRecord = {
      code,
      items: cartItems,
      total: cartTotal,
      date: new Date().toISOString(),
      redeemed: false
    };

    // Store in Game State
    setGameState(prev => {
      const next = {
        ...prev,
        purchasedCodes: [newRecord, ...prev.purchasedCodes]
      };
      try {
        localStorage.setItem('bossRushTycoon', JSON.stringify(next));
      } catch (e) {
        console.warn('Local storage write failed:', e);
      }
      return next;
    });

    // Sync to Firestore for multi-device & admin lookup
    try {
      setDoc(doc(db, 'purchases', code), newRecord);
    } catch (e) {
      console.warn('Firestore purchase sync failed:', e);
    }

    setGeneratedCode(code);
    setCart({}); // clear cart on success
  };

  return (
    <div className="w-full max-w-full flex-1 flex flex-col bg-linear-to-b from-[#111827] to-[#0a0f1a] border border-[#2a3d5c] rounded-[32px] md:rounded-[48px] p-4 md:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.9),inset_0_0_0_2px_#1f2d4a,inset_0_0_0_3px_#141f33] select-none my-2 md:my-6 relative overflow-visible">
      
      {/* Background radial elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #151f35 0%, #0a0e1a 70%)' }}></div>

      {/* SHOPPING HEADER */}
      <header className="flex items-center justify-between bg-linear-to-br from-[#1a2540] to-[#0f182a] border border-[#2a4060] px-3 sm:px-6 py-3 sm:py-4 rounded-[32px] sm:rounded-[60px] shadow-[0_4px_24px_rgba(0,0,0,0.5),inset_0_1px_0_#3a5a80] relative z-10 mb-8 w-full max-w-full">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <span className="text-sm sm:text-xl">⚔️</span>
          <span className="font-mono text-[10px] sm:text-xs text-[#7ae0ff] uppercase tracking-wider font-bold">ARMORY</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-6 ml-auto">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest hidden xs:inline-block">POWER LEVEL</span>
            <span className="font-mono text-sm sm:text-xl text-[#f5e56b] border border-[#f5e56b]/40 bg-[#141c30] px-2.5 sm:px-4 py-0.5 sm:py-1 rounded-[40px] shadow-[0_0_20px_rgba(245,229,107,0.1)]">
              {Math.floor(cartTotal / 10)}
            </span>
          </div>

          {/* Cart Dropdown Preview Toggle */}
          <div>
            <button 
              onClick={() => setPreviewOpen(!previewOpen)}
              className="text-xs text-[#aac0e0] font-bold uppercase tracking-wider bg-[#1a2440] border border-[#2a4060] px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-[40px] flex items-center gap-1 sm:gap-2 hover:bg-[#2a3a60] hover:text-[#d0e8ff] transition-all cursor-pointer whitespace-nowrap"
            >
              <span>📦</span>
              <span>{cartCount} items</span>
              <span className="text-xs">{previewOpen ? '▲' : '▼'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* CART INVENTORY MODAL (ALIGNED TO PARENT COMPONENT) */}
      {previewOpen && (
        <div id="shop-cart-preview-container" className="z-[200]">
          {/* Dismiss Backdrop */}
          <div 
            className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-xs"
            onClick={() => setPreviewOpen(false)}
          />

          {/* Cart Inventory Content aligned to ShopView and Cart toggle */}
          <div className="absolute top-[70px] sm:top-[78px] md:top-[84px] right-4 sm:right-10 md:right-14 z-[200] w-[calc(100%-2rem)] sm:w-96 max-h-[75vh] overflow-y-auto bg-linear-to-br from-[#1a2440] to-[#0f182a] border border-[#3a5a80] rounded-2xl p-4 sm:p-5 shadow-[0_25px_70px_rgba(0,0,0,0.9),inset_0_0_0_1px_#3a5a80] backdrop-blur-xl">
            <div className="flex justify-between items-center border-b border-[#2a4060] pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#f5e56b] font-bold">INVENTORY</span>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30 font-bold">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#7ae0ff] font-bold font-mono">Total: ${cartTotal}</span>
                <button 
                  onClick={() => setPreviewOpen(false)} 
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer text-sm"
                  aria-label="Close inventory"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {cartItems.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 italic">🛒 No items selected</div>
              ) : (
                cartItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-white/5 pb-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.emoji}</span>
                      <span className="text-slate-200 font-bold">{item.id}</span>
                      <span className="text-xs text-slate-400 bg-black/40 px-2 py-0.5 rounded font-mono">{item.pack}</span>
                    </div>
                    <div className="flex gap-3 font-mono font-bold">
                      <span className="text-[#f5e56b]">×{item.qty}</span>
                      <span className="text-[#7ae0ff]">${item.qty * item.price}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <button
                  onClick={resetCart}
                  className="text-red-400 hover:text-red-300 text-xs font-mono hover:underline cursor-pointer"
                >
                  Clear Cart
                </button>
                <span className="text-xs text-slate-400 font-mono">
                  Ready to checkout below
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CATEGORY SELECTOR */}
      <div id="shop-categories-tabs" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10 w-full">
        <div className="flex flex-wrap gap-2.5 max-w-full">
          {Object.entries(categories).map(([key, cat]) => (
            <button
              key={key}
              id={`shop-tab-${key}`}
              onClick={() => handleCategorySelect(key as any)}
              className={`px-4 py-2 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-extrabold uppercase transition-all tracking-wider cursor-pointer flex items-center gap-2 ${activeCategory === key ? 'bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.4)] border border-orange-400/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'}`}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          {onOpenLoreBook && (
            <button
              onClick={onOpenLoreBook}
              className="text-xs sm:text-sm text-[#7ae0ff] hover:text-white bg-[#141f35] hover:bg-[#1a2b4d] border border-[#2a4060] px-4 py-2 rounded-full font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <span>📖</span>
              <span>Lore & System Key</span>
            </button>
          )}
          <span className="text-xs sm:text-sm text-white/50 uppercase tracking-widest font-semibold italic bg-black/30 px-3 py-1.5 rounded-full border border-white/5">{POWERUPS.filter(p => gameState.powerups.find(g => g.id === p.id)?.owned).length} / 16 Unlocked</span>
        </div>
      </div>

      {/* POWER-UP ARMORY GRID */}
      <div id="shop-items-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 relative z-10 flex-1 mb-8">
        {categories[activeCategory].items.map(item => {
          // Total discrete units of this item in the cart
          const totalUnitsInCart = getItemTotalUnits(item.id, cart);

          // Subtotal cost in cart for this item
          const subtotalCost = Object.keys(cart)
            .filter(key => key.startsWith(`${item.id}::`))
            .reduce((sum, key) => {
              const qty = cart[key] || 0;
              const packLabel = key.split('::')[1];
              const pack = item.packs.find(p => p.label === packLabel);
              return sum + (pack ? pack.price : 0) * qty;
            }, 0);

          // Find smallest base pack (individual unit)
          const sortedPacksByUnit = [...item.packs].sort((a, b) => getPackUnits(item.id, a.label) - getPackUnits(item.id, b.label));
          const baseSinglePack = sortedPacksByUnit[0];
          const unoptimizedCost = baseSinglePack ? totalUnitsInCart * baseSinglePack.price : subtotalCost;
          const savings = Math.max(0, unoptimizedCost - subtotalCost);

          // Check if there is a multi-pack milestone available
          const multiPacks = [...item.packs].filter(p => getPackUnits(item.id, p.label) > 1).sort((a, b) => getPackUnits(item.id, a.label) - getPackUnits(item.id, b.label));
          const nextMilestonePack = multiPacks.find(p => getPackUnits(item.id, p.label) > totalUnitsInCart);
          const activeAppliedMultiPacks = Object.keys(cart)
            .filter(k => k.startsWith(`${item.id}::`))
            .filter(k => getPackUnits(item.id, k.split('::')[1]) > 1);

          return (
            <div 
              key={item.id} 
              className={`group bg-linear-to-b from-[#1a2440] to-[#111a2e] rounded-2xl p-5 border relative overflow-visible transition-all flex flex-col justify-between shadow-lg ${rarityBorderColors[item.rarity]} ${rarityBgGlows[item.rarity]}`}
            >
              {/* Card Icon & Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-4xl block filter drop-shadow-[0_0_15px_rgba(100,200,255,0.2)]">{item.emoji}</span>
                  <div className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-black/40 border border-white/10" style={{ color: rarityColors[item.rarity] }}>
                    {item.rarity}
                  </div>
                </div>
                
                {/* Name & Hover Tooltip */}
                <div className="relative inline-block w-full">
                  <h4 className="font-extrabold text-lg text-white tracking-wide mb-1.5 select-none cursor-help relative z-10 hover:text-[#7ae0ff] transition-colors flex items-center justify-between">
                    <span>{item.id}</span>
                  </h4>

                  {/* Tooltip containing Lore and Effect */}
                  <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 scale-90 bg-linear-to-b from-[#1a2a4a] to-[#0f1a30] border border-[#3a5a80] rounded-2xl p-4 w-72 text-[#b0c8e8] text-xs leading-relaxed shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_0_0_1px_#4a6a90] opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none z-[100] text-center">
                    <div className="font-mono text-xs text-[#f5e56b] font-extrabold uppercase tracking-wider mb-1.5">✦ {item.id}</div>
                    <span className="text-xs uppercase font-bold tracking-widest block mb-1.5" style={{ color: rarityColors[item.rarity] }}>
                      {item.rarity}
                    </span>
                    <p className="text-slate-200 font-sans mb-2 text-xs">{item.description}</p>
                    <p className="text-[#8affc5] border-t border-[#3a5a80] pt-1.5 italic font-mono text-xs">⚡ {item.effect}</p>
                  </div>
                </div>

                {/* ENHANCED INLINE ITEM EFFECT & STATS DISPLAY */}
                <div className="mb-4 bg-[#10182b]/80 border border-[#2a3c5a] rounded-xl p-3 space-y-2 shadow-inner">
                  {/* Combat Stats Grid */}
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    <div className="bg-[#162138] border border-red-500/20 px-1.5 py-1 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-mono font-bold leading-none">ATK</span>
                      <span className="text-xs font-extrabold text-red-400 font-mono">+{item.attack}</span>
                    </div>
                    <div className="bg-[#162138] border border-cyan-500/20 px-1.5 py-1 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-mono font-bold leading-none">DEF</span>
                      <span className="text-xs font-extrabold text-cyan-400 font-mono">+{item.defense}</span>
                    </div>
                    <div className="bg-[#162138] border border-purple-500/20 px-1.5 py-1 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-mono font-bold leading-none">SPD</span>
                      <span className="text-xs font-extrabold text-purple-300 font-mono">+{item.speed}</span>
                    </div>
                  </div>

                  {/* Special Passive Ability */}
                  <div className="bg-[#141d33] px-2.5 py-1.5 rounded-lg border border-amber-400/20 text-xs flex items-center gap-1.5">
                    <span className="text-amber-400 font-black">✦</span>
                    <span className="text-amber-200 font-bold truncate">{item.special}</span>
                  </div>

                  {/* Core Tactical Effect */}
                  <div className="text-xs text-slate-300 font-mono leading-tight pl-1 border-l-2 border-[#7ae0ff]/60">
                    <span className="text-[#7ae0ff] font-bold">Effect:</span> {item.effect}
                  </div>

                  {/* Milestone Progress / Savings Banner */}
                  {savings > 0 ? (
                    <div className="bg-emerald-950/70 border border-emerald-500/40 px-2 py-1 rounded-lg text-xs font-bold text-emerald-300 flex items-center justify-between animate-in fade-in">
                      <span className="flex items-center gap-1">
                        <span>🎉</span>
                        <span>Bulk Pack Active</span>
                      </span>
                      <span className="font-mono text-emerald-200 bg-emerald-900/60 px-1.5 py-0.5 rounded">
                        Save ${savings}
                      </span>
                    </div>
                  ) : nextMilestonePack && totalUnitsInCart > 0 ? (
                    <div className="space-y-1 pt-0.5">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>Milestone: {nextMilestonePack.label}</span>
                        <span className="text-cyan-400 font-bold">
                          {totalUnitsInCart}/{getPackUnits(item.id, nextMilestonePack.label)}
                        </span>
                      </div>
                      <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="bg-linear-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (totalUnitsInCart / getPackUnits(item.id, nextMilestonePack.label)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Pack Selection Buttons (Pills) */}
                {!item.comingSoon && (
                  <div className="flex flex-wrap gap-2.5 sm:gap-3 mb-4">
                    {item.packs.map((pack, pIdx) => {
                      const packKey = `${item.id}::${pack.label}`;
                      const packQty = cart[packKey] || 0;
                      const units = getPackUnits(item.id, pack.label);
                      return (
                        <button
                          key={pIdx}
                          onClick={() => addToCart(item.id, pack.label)}
                          className={`bg-linear-to-br from-[#1f2d48] to-[#16203a] border rounded-full py-2.5 px-4 sm:py-3 sm:px-5 text-sm sm:text-base font-bold flex items-center gap-2.5 sm:gap-3 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer ${
                            packQty > 0
                              ? 'border-orange-500 bg-linear-to-br from-orange-950/40 to-[#1f2d48] text-white shadow-orange-500/20 ring-2 ring-orange-500/30'
                              : 'border-[#2a4060] text-[#b0c8e8] hover:border-slate-300 hover:text-white'
                          }`}
                        >
                          <span className="font-semibold flex items-center gap-1.5">
                            <span>{pack.label}</span>
                            {units > 1 && (
                              <span className="text-xs text-cyan-300 font-mono font-bold bg-cyan-950/90 px-2 py-0.5 rounded-full border border-cyan-500/40">
                                {units}x
                              </span>
                            )}
                          </span>
                          <span className="text-[#f5e56b] bg-[#141c30] px-3 py-1 rounded-full text-sm sm:text-base font-black border border-[#f5e56b]/30">
                            ${pack.price}
                          </span>
                          {packQty > 0 && (
                            <span className="text-white bg-orange-600 px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-extrabold animate-pulse">
                              {packQty}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quantity Adjuster Row & Item total */}
              {!item.comingSoon ? (
                <div className="flex items-center justify-between bg-black/50 border border-[#1a2540] rounded-full p-2 mt-2">
                  <div className="flex flex-col ml-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-base font-black text-[#f5e56b]">
                        ${subtotalCost}
                      </span>
                      {savings > 0 && (
                        <span className="font-mono text-xs text-slate-500 line-through">
                          ${unoptimizedCost}
                        </span>
                      )}
                    </div>
                    {savings > 0 && (
                      <span className="text-[10px] text-emerald-400 font-mono font-bold leading-none">
                        Save ${savings}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button 
                      onClick={() => quickMinus(item.id)}
                      className="w-8 h-8 bg-[#1a2440] border border-[#2a4060] rounded-full flex items-center justify-center font-bold text-slate-300 hover:bg-[#2a3a60] hover:text-white transition active:scale-90 cursor-pointer text-base"
                      title="Decrease item quantity by 1"
                    >
                      −
                    </button>
                    <div className="flex flex-col items-center">
                      <span className="font-mono text-base font-extrabold text-slate-200 min-w-[24px] text-center leading-none">
                        {totalUnitsInCart}
                      </span>
                      {totalUnitsInCart > 0 && activeAppliedMultiPacks.length > 0 && (
                        <span className="text-[9px] font-mono text-cyan-400 font-bold leading-none mt-0.5">
                          pack deal
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => quickPlus(item.id)}
                      className="w-8 h-8 bg-[#1a2440] border border-[#2a4060] rounded-full flex items-center justify-center font-bold text-slate-300 hover:bg-[#2a3a60] hover:text-white transition active:scale-90 cursor-pointer text-base"
                      title="Increase item quantity by 1"
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-sm text-slate-500 italic py-3 border border-dashed border-white/10 rounded-xl">
                  🔒 Level Lock
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FOOTER & CHECKOUT GATE */}
      <footer id="shop-checkout-footer" className="bg-black/90 border-t border-white/10 flex flex-col md:flex-row items-center justify-between p-6 rounded-3xl relative z-10 gap-6">
        <div className="flex-1 flex gap-8 items-center">
          <div className="flex flex-col">
            <span className="text-xs text-white/40 uppercase font-bold tracking-[0.2em] mb-1">BRIDGE KEY / CODE</span>
            {generatedCode ? (
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg md:text-xl font-black text-[#7ae0ff] tracking-wide">
                  {generatedCode}
                </span>
                <button
                  onClick={copyToClipboard}
                  className={`px-3 py-1 text-xs font-bold uppercase rounded border transition-all flex items-center gap-1.5 cursor-pointer ${copied ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-blue-500/10 border-blue-500/30 text-[#7ae0ff] hover:bg-blue-500/20 hover:border-blue-500/50'}`}
                  title="Copy to clipboard"
                >
                  <span>{copied ? '✅' : '📋'}</span>
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            ) : (
              <div className="font-mono text-xs text-slate-500 italic">
                {cartCount > 0 ? "Ready for generation code..." : "Add items above to start checkout"}
              </div>
            )}
          </div>
          
          <div className="h-10 w-px bg-white/10 hidden md:block"></div>

          <div className="flex flex-col">
            <span className="text-xs text-white/40 uppercase font-bold tracking-[0.2em] mb-1">Subtotal Value</span>
            <p className="text-xl font-bold text-orange-500">${cartTotal}.00</p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          {cartCount > 0 && (
            <button 
              onClick={resetCart}
              className="text-xs text-slate-400 hover:text-white font-bold uppercase transition bg-white/5 px-4 py-2 rounded-lg cursor-pointer"
            >
              ⟲ Reset
            </button>
          )}

          <button 
            disabled={cartCount === 0}
            onClick={checkoutCode}
            className={`h-12 px-6 font-extrabold uppercase text-xs rounded-xl transition-all shadow-lg select-none flex items-center justify-center gap-2 cursor-pointer ${cartCount > 0 ? 'bg-white text-black hover:bg-orange-500 hover:text-white hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'}`}
          >
            ⚡ Checkout & Generate Key
          </button>
        </div>
      </footer>
    </div>
  );
}
