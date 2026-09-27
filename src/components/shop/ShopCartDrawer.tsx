import React from 'react';
import { PurchaseItem } from '../../types';

interface ShopCartDrawerProps {
  isOpen: boolean;
  cartCount: number;
  cartTotal: number;
  cartItems: PurchaseItem[];
  onClose: () => void;
  onResetCart: () => void;
}

export const ShopCartDrawer: React.FC<ShopCartDrawerProps> = ({
  isOpen,
  cartCount,
  cartTotal,
  cartItems,
  onClose,
  onResetCart
}) => {
  if (!isOpen) return null;

  return (
    <div id="shop-cart-preview-container" className="z-[200]">
      {/* Dismiss Backdrop */}
      <div 
        className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-xs"
        onClick={onClose}
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
              onClick={onClose} 
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
              onClick={onResetCart}
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
  );
};
