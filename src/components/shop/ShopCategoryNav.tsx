import React from 'react';

export type ShopCategoryKey = 'weapons' | 'defense' | 'utility' | 'mystic';

interface ShopCategoryNavProps {
  activeCategory: ShopCategoryKey;
  onSelectCategory: (category: ShopCategoryKey) => void;
  categoryCounts: Record<ShopCategoryKey, number>;
}

const CATEGORIES: { key: ShopCategoryKey; icon: string; name: string }[] = [
  { key: 'weapons', icon: '⚔️', name: 'Weapons' },
  { key: 'defense', icon: '🛡️', name: 'Defense' },
  { key: 'utility', icon: '✨', name: 'Utility' },
  { key: 'mystic', icon: '🌀', name: 'Mystic' }
];

export const ShopCategoryNav: React.FC<ShopCategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
  categoryCounts
}) => {
  return (
    <nav 
      aria-label="Armory Categories"
      className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none w-full max-w-full px-2"
    >
      {CATEGORIES.map(cat => {
        const isActive = activeCategory === cat.key;
        const count = categoryCounts[cat.key] || 0;
        
        return (
          <button
            key={cat.key}
            id={`shop-tab-${cat.key}`}
            onClick={() => onSelectCategory(cat.key)}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-[24px] sm:rounded-[30px] font-mono text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer shrink-0 border ${
              isActive 
                ? 'bg-linear-to-r from-[#203254] to-[#16243d] border-[#4a72a8] text-white shadow-[0_4px_20px_rgba(74,114,168,0.3)] scale-105' 
                : 'bg-[#101826]/80 hover:bg-[#162238] border-[#22334d] text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-sm sm:text-base">{cat.icon}</span>
            <span>{cat.name}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              isActive ? 'bg-[#4a72a8] text-white' : 'bg-[#1a283e] text-slate-400'
            }`}>
              {count}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
