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
    { id: 'power', label: 'Power Score', icon: '⚡' },
    { id: 'kills', label: 'Total Kills', icon: '⚔️' },
    { id: 'deaths', label: 'Most Deaths', icon: '💀' },
    { id: 'max_damage', label: 'Max Damage', icon: '💥' },
    { id: 'dodges', label: 'Most Dodges', icon: '💨' },
    { id: 'specials', label: 'Most Specials', icon: '✨' },
    { id: 'gold', label: 'Gold Earned', icon: '🪙' },
    { id: 'gems', label: 'Gems Earned', icon: '💎' },
    { id: 'boss_specialists', label: 'Boss Specialists', icon: '👹' },
    { id: 'rewards', label: 'Claim Rewards', icon: '🎁', highlight: unclaimedRewardsCount > 0 }
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {categories.map(cat => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onCategoryChange(cat.id)}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 border shrink-0 ${
              isActive
                ? 'bg-blue-600 text-white border-blue-400 shadow-md scale-[1.02]'
                : cat.highlight
                ? 'bg-amber-950/40 text-amber-300 border-amber-500/40 hover:bg-amber-900/50 animate-pulse'
                : 'bg-[#101b30] text-slate-400 border-white/5 hover:text-white hover:bg-[#162440]'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
            {cat.id === 'rewards' && unclaimedRewardsCount > 0 && (
              <span className="bg-amber-400 text-black text-[10px] px-1.5 py-0.2 rounded-full font-black ml-0.5">
                {unclaimedRewardsCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
