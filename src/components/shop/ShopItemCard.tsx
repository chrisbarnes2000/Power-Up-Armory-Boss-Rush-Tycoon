import React from 'react';
import { PowerUp, GamePowerUpState } from '../../types';
import { CoinIcon } from '../CoinIcon';
import { 
  getPackUnits, 
  getItemTotalUnits, 
  RARITY_COLORS, 
  RARITY_BG_GLOWS, 
  RARITY_BORDER_COLORS 
} from '../../utils/shopUtils';

interface ShopItemCardProps {
  item: PowerUp;
  cart: { [key: string]: number };
  onAddToCart: (itemId: string, packLabel: string) => void;
  onQuickPlus: (itemId: string) => void;
  onQuickMinus: (itemId: string) => void;
}

export const ShopItemCard: React.FC<ShopItemCardProps> = ({
  item,
  cart,
  onAddToCart,
  onQuickPlus,
  onQuickMinus
}) => {
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

  const itemTooltipText = `✦ ${item.id} [${item.rarity}]\n"${item.description}"\n✨ Effect: ${item.effect}${item.special ? `\n⚡ Special: ${item.special}` : ''}`;

  return (
    <div 
      className={`bg-linear-to-b from-[#1a2440] to-[#111a2e] rounded-2xl p-4 border relative overflow-visible transition-all flex flex-col justify-between shadow-lg ${RARITY_BORDER_COLORS[item.rarity] || 'border-white/10'} ${RARITY_BG_GLOWS[item.rarity] || ''}`}
    >
      {/* Card Icon & Header */}
      <div>
        <div className="flex items-start gap-3.5 mb-3">
          {/* Left: Compact emoji with beautiful glow */}
          <span className="text-3xl sm:text-4xl filter drop-shadow-[0_0_15px_rgba(100,200,255,0.2)] shrink-0 mt-0.5">{item.emoji}</span>
          
          {/* Right: Consolidated details */}
          <div className="flex-1 min-w-0">
            {/* Title Row with "ⓘ" icon inside */}
            <div 
              tabIndex={0}
              role="button"
              data-tooltip={itemTooltipText}
              className="relative cursor-help group/header select-none outline-none focus:ring-1 focus:ring-blue-400 rounded-lg flex items-center gap-1.5"
            >
              <h4 className="font-extrabold text-base sm:text-lg text-white tracking-wide group-hover/header:text-[#7ae0ff] transition-colors truncate">
                {item.id}
              </h4>
              <span className="text-slate-400 group-hover/header:text-amber-300 text-[10px] font-bold px-1 py-0.2 rounded-full bg-white/5 border border-white/10 shrink-0" title="Inspect Lore & Abilities">
                ⓘ
              </span>
            </div>

            {/* Sub-row: Compact Rarity Badge */}
            <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider mt-1 inline-block" style={{ color: RARITY_COLORS[item.rarity] }}>
              {item.rarity}
            </div>
          </div>
        </div>

        {/* INLINE ITEM EFFECT & STATS DISPLAY */}
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
                  onClick={() => onAddToCart(item.id, pack.label)}
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
                  <span className="text-[#f5e56b] bg-[#141c30] px-3 py-1 rounded-full text-sm sm:text-base font-black border border-[#f5e56b]/30 flex items-center gap-1.5 shadow-inner">
                    <CoinIcon className="w-4 h-4 drop-shadow" />
                    <span>${pack.price}</span>
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
              <span className="font-mono text-base font-black text-[#f5e56b] flex items-center gap-1">
                <CoinIcon className="w-4 h-4 drop-shadow" />
                <span>${subtotalCost}</span>
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
              onClick={() => onQuickMinus(item.id)}
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
                  Bundled
                </span>
              )}
            </div>
            <button 
              onClick={() => onQuickPlus(item.id)}
              className="w-8 h-8 bg-[#1a2440] border border-[#2a4060] rounded-full flex items-center justify-center font-bold text-slate-300 hover:bg-[#2a3a60] hover:text-white transition active:scale-90 cursor-pointer text-base"
              title="Increase item quantity by 1"
            >
              +
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-3 bg-[#101828] border border-white/5 rounded-full text-xs font-mono text-slate-500 italic">
          🔒 Lock - Sealed by Archmage
        </div>
      )}
    </div>
  );
};
