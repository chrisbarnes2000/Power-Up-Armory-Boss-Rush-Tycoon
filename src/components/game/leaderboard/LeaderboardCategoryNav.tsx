import React from 'react';

export type LeaderboardCategory = 
  | 'power'
  | 'kills'
  | 'deaths'
  | 'max_damage'
  | 'dodges'
  | 'specials'
  | 'gold'
  | 'gems'
  | 'boss_specialists'
  | 'rewards';

export interface LeaderboardCategoryNavProps {
  activeCategory: LeaderboardCategory;
  onCategoryChange: (category: LeaderboardCategory) => void;
  unclaimedRewardsCount?: number;
}

export const LeaderboardCategoryNav: React.FC<LeaderboardCategoryNavProps> = ({
  activeCategory,
  onCategoryChange,
  unclaimedRewardsCount = 0
}) => {
  const categories: { id: LeaderboardCategory; label: string; icon: string; highlight?: boolean }[] = [
    { id: 'rewards', label: 'Seasonal Bounties', icon: '🎁', highlight: unclaimedRewardsCount > 0 },
    { id: 'power', label: 'Power Score', icon: '⚡' },
    { id: 'kills', label: 'Total Kills', icon: '⚔️' },
    { id: 'deaths', label: 'Most Deaths', icon: '💀' },
    { id: 'max_damage', label: 'Max Damage', icon: '💥' },
    { id: 'dodges', label: 'Most Dodges', icon: '💨' },
    { id: 'specials', label: 'Most Specials', icon: '✨' },
    { id: 'gold', label: 'Gold Earned', icon: '🪙' },
    { id: 'gems', label: 'Gems Earned', icon: '💎' },
    { id: 'boss_specialists', label: 'Boss Specialists', icon: '👹' }
  ];

  return (
    <div className="p-2 sm:p-2.5 bg-gradient-to-r from-[#171108]/95 via-[#23170b]/95 to-[#171108]/95 border border-amber-500/35 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(251,191,36,0.2)] backdrop-blur-md">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap scrollbar-none">
        {categories.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-full text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 border shrink-0 select-none ${
                isActive
                  ? 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 text-amber-50 shadow-[0_0_18px_rgba(217,119,6,0.45)] border-amber-300 ring-2 ring-amber-400/30 scale-102'
                  : cat.highlight
                  ? 'bg-amber-950/70 text-amber-300 border-amber-500/50 hover:bg-amber-900/80 animate-pulse'
                  : 'bg-[#120d07]/90 text-amber-200/75 border-amber-500/20 hover:text-white hover:border-amber-400/50 hover:bg-[#1f150c]'
              }`}
            >
              <span className="text-sm">{cat.icon}</span>
              <span>{cat.label}</span>
              {cat.id === 'rewards' && unclaimedRewardsCount > 0 && (
                <span className="bg-amber-400 text-black text-[10px] px-1.5 py-0.2 rounded-full font-black ml-0.5 shadow-xs animate-bounce">
                  {unclaimedRewardsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
