import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { POWERUPS } from '../data';
import { GameState, PurchaseItem, PurchaseRecord, UserProfile } from '../types';
import { CoinIcon } from './CoinIcon';
import { trackEvent, trackPageView } from '../lib/analytics';

// Import decoupled subcomponents and utilities
import { ShopCartDrawer } from './shop/ShopCartDrawer';
import { ShopCategoryNav, ShopCategoryKey } from './shop/ShopCategoryNav';
import { ShopItemCard } from './shop/ShopItemCard';
import { getPackUnits, getItemTotalUnits, optimizeCartForItem } from '../utils/shopUtils';
import { triggerParticleBurst } from './common/ParticleFX';
import { TycoonBankrollCard } from './game/TycoonBankrollCard';
import {
  getPassiveYield,
  getTotalAttack,
  getTotalDefense,
  getTotalSpeed,
  getNormalMaxHP,
  getPowerScore
} from '../utils/combatEngine';

interface ShopViewProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onOpenLoreBook?: () => void;
  controlledCategory?: 'weapons' | 'defense' | 'utility' | 'mystic';
  onCategoryChange?: (category: 'weapons' | 'defense' | 'utility' | 'mystic') => void;
  openCartDrawer?: boolean;
  userProfile?: UserProfile | null;
  isAdmin?: boolean;
}

export default function ShopView({
  gameState,
  setGameState,
  onOpenLoreBook,
  controlledCategory,
  onCategoryChange,
  openCartDrawer,
  userProfile,
  isAdmin
}: ShopViewProps) {
  // Category tab state
  const [activeCategory, setActiveCategory] = useState<ShopCategoryKey>(controlledCategory || 'weapons');
  
  // Local cart state: key is `item_id::pack_label` -> quantity
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (controlledCategory) {
      setActiveCategory(controlledCategory);
    }
  }, [controlledCategory]);

  useEffect(() => {
    if (typeof openCartDrawer === 'boolean') {
      setPreviewOpen(openCartDrawer);
    }
  }, [openCartDrawer]);

  const handleCategorySelect = (key: ShopCategoryKey) => {
    setActiveCategory(key);
    onCategoryChange?.(key);
    trackPageView(`Armory Store - ${key}`, `/shop/${key}`);
  };

  const copyToClipboard = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Define shop item categories
  const categories = {
    weapons: {
      id: 'weapons',
      items: POWERUPS.filter(p => ['Focus Blade', 'Rage Axe', 'Speed Dagger', 'Shield Breaker', 'Wing Charm', '???.???'].includes(p.id))
    },
    defense: {
      id: 'defense',
      items: POWERUPS.filter(p => ['Magnetite Shield', 'Cloak of Shadows', 'Titan Armor'].includes(p.id))
    },
    utility: {
      id: 'utility',
      items: POWERUPS.filter(p => ['Laser Lens', 'Phantom Dust', 'Dragon Scale'].includes(p.id))
    },
    mystic: {
      id: 'mystic',
      items: POWERUPS.filter(p => ['Phoenix Feather', 'Void Orb', 'Star Fragment'].includes(p.id))
    }
  };

  // Build category counts
  const categoryCounts: Record<ShopCategoryKey, number> = {
    weapons: categories.weapons.items.length,
    defense: categories.defense.items.length,
    utility: categories.utility.items.length,
    mystic: categories.mystic.items.length
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

  // Admin Shop Bypass / Cash-in-person check: when active, gold cost is waived
  const isCashBypassActive = Boolean(isAdmin || userProfile?.isArmoryStoreEnabled);
  const hasEnoughCoins = isCashBypassActive || gameState.coins >= cartTotal;
  const missingCoins = Math.max(0, cartTotal - Math.floor(gameState.coins));

  // Compute live hero combat attributes for TycoonBankrollCard
  const passiveYield = getPassiveYield(gameState);
  const totalAttack = getTotalAttack(gameState);
  const totalDefense = getTotalDefense(gameState);
  const totalSpeed = getTotalSpeed(gameState);
  const powerScore = getPowerScore(gameState);
  const normalMaxHP = getNormalMaxHP(gameState);

  const handleUseHealthPack = () => {
    if ((gameState.revivePacks || 0) <= 0) return;
    setGameState(prev => {
      const next = {
        ...prev,
        isDead: false,
        revivePacks: Math.max(0, (prev.revivePacks || 0) - 1)
      };
      try {
        localStorage.setItem('bossRushTycoon', JSON.stringify(next));
      } catch (e) {
        console.warn('Local storage write failed:', e);
      }
      return next;
    });
    triggerParticleBurst('rebirth');
    trackEvent('health_pack_used', {
      source: 'armory_store_bankroll',
      remaining_packs: Math.max(0, (gameState.revivePacks || 0) - 1)
    });
  };

  // Reset cart
  const resetCart = () => {
    setCart({});
    setGeneratedCode(null);
  };

  // Generate Unique checkout 16-character Code (Bridge)
  const checkoutCode = () => {
    if (cartCount === 0) return;
    if (!isCashBypassActive && gameState.coins < cartTotal) return;
    
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

    // Store in Game State & deduct in-game coins unless admin cash bypass is active
    setGameState(prev => {
      const next = {
        ...prev,
        coins: isCashBypassActive ? prev.coins : Math.max(0, prev.coins - cartTotal),
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

    triggerParticleBurst('purchase');

    // Track purchase telemetry in Google Analytics & Vemetric
    trackEvent('purchase', {
      transaction_id: code,
      value: cartTotal,
      currency: 'USD',
      items_count: cartCount,
      payment_type: isCashBypassActive ? 'in_person_cash_bypass' : 'gold_coins',
      items: cartItems.map(item => ({
        item_id: item.id,
        item_name: item.id,
        price: item.price,
        quantity: item.qty
      }))
    });

    trackEvent('armory_checkout_code_generated', {
      code,
      total_value: cartTotal,
      item_count: cartCount,
      payment_type: isCashBypassActive ? 'in_person_cash_bypass' : 'gold_coins'
    });

    setGeneratedCode(code);
    setCart({}); // clear cart on success
  };

  return (
    <div className="w-full max-w-full flex-1 flex flex-col bg-linear-to-b from-[#111827] to-[#0a0f1a] border border-[#2a3d5c] rounded-[32px] md:rounded-[48px] p-4 md:p-6 shadow-[0_30px_80px_rgba(0,0,0,0.9),inset_0_0_0_2px_#1f2d4a,inset_0_0_0_3px_#141f33] select-none my-2 md:my-6 relative overflow-visible pb-24 sm:pb-28">
      
      {/* Background radial elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #151f35 0%, #0a0e1a 70%)' }}></div>

      {/* SHOPPING HEADER */}
      <header className="flex items-center justify-between bg-linear-to-br from-[#1a2540] to-[#0f182a] border border-[#2a4060] px-3 sm:px-6 py-3 sm:py-4 rounded-[32px] sm:rounded-[60px] shadow-[0_4px_24px_rgba(0,0,0,0.5),inset_0_1px_0_#3a5a80] relative z-10 mb-6 w-full max-w-full">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <span className="text-sm sm:text-xl">⚔️</span>
          <span className="font-mono text-xs sm:text-sm md:text-base text-[#7ae0ff] uppercase tracking-widest font-black">ARMORY</span>
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

      {/* CART INVENTORY DRAWOR */}
      <ShopCartDrawer
        isOpen={previewOpen}
        cartCount={cartCount}
        cartTotal={cartTotal}
        cartItems={cartItems}
        onClose={() => setPreviewOpen(false)}
        onResetCart={resetCart}
      />

      {/* CATEGORY NAV SELECTOR CONTAINER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10 w-full">
        <div className="flex-1 max-w-full overflow-x-auto">
          <ShopCategoryNav
            activeCategory={activeCategory}
            onSelectCategory={handleCategorySelect}
            categoryCounts={categoryCounts}
          />
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap sm:pb-3.5">
          {onOpenLoreBook && (
            <button
              onClick={onOpenLoreBook}
              className="text-xs sm:text-sm text-[#7ae0ff] hover:text-white bg-[#141f35] hover:bg-[#1a2b4d] border border-[#2a4060] px-4 py-2 rounded-full font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <span>📖</span>
              <span>Lore & System Key</span>
            </button>
          )}
          <span className="text-xs sm:text-sm text-white/50 uppercase tracking-widest font-semibold italic bg-black/30 px-3 py-1.5 rounded-full border border-white/5">
            {POWERUPS.filter(p => gameState.powerups.find(g => g.id === p.id)?.owned).length} / 16 Unlocked
          </span>
        </div>
      </div>

      {/* POWER-UP ARMORY GRID */}
      <div id="shop-items-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 relative z-10 flex-1 mb-8">
        {categories[activeCategory].items.map(item => (
          <ShopItemCard
            key={item.id}
            item={item}
            cart={cart}
            onAddToCart={addToCart}
            onQuickPlus={quickPlus}
            onQuickMinus={quickMinus}
          />
        ))}
      </div>

      {/* FOOTER & CHECKOUT GATE */}
      <footer id="shop-checkout-footer" className="bg-black/90 border-t border-white/10 flex flex-col md:flex-row items-center justify-between p-6 rounded-3xl relative z-10 gap-6">
        <div className="flex-1 flex flex-wrap gap-6 md:gap-8 items-center">
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
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-white/40 uppercase font-bold tracking-[0.2em]">Subtotal Value</span>
              {isCashBypassActive && (
                <span className="text-[10px] font-mono font-bold bg-amber-950/80 border border-amber-500/40 text-amber-300 px-2 py-0.2 rounded-full flex items-center gap-1" title="In-person cash clearance enabled. Gold coin cost is waived.">
                  <span>💵</span>
                  <span>Cash Clearance Bypass</span>
                </span>
              )}
            </div>
            <p className="text-xl font-bold text-orange-500 flex items-center gap-1.5 font-mono">
              <CoinIcon className="w-5 h-5 drop-shadow" />
              <span>${cartTotal}.00</span>
              <span className="text-xs font-normal text-slate-400 ml-1 font-mono">({cartTotal.toLocaleString()} Coins)</span>
            </p>
            {!isCashBypassActive && cartCount > 0 && (
              <div className="text-[11px] font-mono mt-0.5">
                {gameState.coins >= cartTotal ? (
                  <span className="text-emerald-400 font-bold">
                    ✅ Available: {Math.floor(gameState.coins).toLocaleString()} Coins
                  </span>
                ) : (
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    <span>⚠️ Need {missingCoins.toLocaleString()} more coins</span>
                    <span className="text-slate-400 font-normal">({Math.floor(gameState.coins).toLocaleString()} owned)</span>
                  </span>
                )}
              </div>
            )}
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
            disabled={cartCount === 0 || !hasEnoughCoins}
            onClick={checkoutCode}
            className={`h-12 px-6 font-extrabold uppercase text-xs rounded-xl transition-all shadow-lg select-none flex items-center justify-center gap-2 ${
              cartCount === 0
                ? 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
                : !hasEnoughCoins
                  ? 'bg-red-950/60 border border-red-500/40 text-red-300 cursor-not-allowed opacity-90'
                  : 'bg-white text-black hover:bg-orange-500 hover:text-white hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] cursor-pointer'
            }`}
            title={!hasEnoughCoins ? `Need ${missingCoins.toLocaleString()} more coins to checkout` : 'Generate 16-character redemption key'}
          >
            {!hasEnoughCoins ? (
              <>
                <span>🔒</span>
                <span>Need {missingCoins.toLocaleString()} Coins</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>{isCashBypassActive ? 'Checkout Key (Cash Bypass)' : 'Checkout & Pay Gold'}</span>
              </>
            )}
          </button>
        </div>
      </footer>

      {/* REAL-TIME DYNAMIC STATBAR ON ARMORY STORE */}
      <TycoonBankrollCard
        coins={gameState.coins}
        gems={gameState.gems || 0}
        passiveYield={passiveYield}
        totalBossesDefeated={gameState.totalBossesDefeated}
        attack={totalAttack}
        defense={totalDefense}
        speed={totalSpeed}
        powerScore={powerScore}
        isDead={!!gameState.isDead}
        isFighting={false}
        livePlayerHP={gameState.isDead ? 0 : normalMaxHP}
        livePlayerMaxHP={normalMaxHP}
        maxHpBonus={gameState.maxHpBonus || 0}
        revivePacks={gameState.revivePacks || 0}
        onUseHealthPack={handleUseHealthPack}
      />
    </div>
  );
}
