import React from 'react';
import { GameState } from '../../types';
import { CoinIcon } from '../CoinIcon';
import { calculatePowerScore } from '../../data';

interface LiveHeroStatsProps {
  gameState: GameState;
}

export const LiveHeroStats: React.FC<LiveHeroStatsProps> = ({ gameState }) => {
  return (
    <div className="grid grid-cols-3 gap-2 text-center font-mono">
      <div className="bg-[#0b1222] border border-white/5 p-3 rounded-xl">
        <span className="text-xs text-slate-400 uppercase font-bold block">Power Score</span>
        <span className="text-sm sm:text-base font-black text-[#f5e56b]">{calculatePowerScore(gameState)} PS</span>
      </div>
      <div className="bg-[#0b1222] border border-white/5 p-3 rounded-xl">
        <span className="text-xs text-slate-400 uppercase font-bold block">Bosses Slain</span>
        <span className="text-sm sm:text-base font-black text-red-400">⚔️ {gameState.totalBossesDefeated}</span>
      </div>
      <div className="bg-[#0b1222] border border-white/5 p-3 rounded-xl">
        <span className="text-xs text-slate-400 uppercase font-bold block">Gold Hoard</span>
        <span className="text-sm sm:text-base font-black text-yellow-400 flex items-center justify-center gap-1">
          <span>{Math.floor(gameState.coins).toLocaleString()}</span>
          <CoinIcon className="w-4 h-4 drop-shadow inline shrink-0" />
        </span>
      </div>
    </div>
  );
};
