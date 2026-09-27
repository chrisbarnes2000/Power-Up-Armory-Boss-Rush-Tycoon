import React from 'react';
import { GameState } from '../../../types';

export interface HeroAttributeSummaryProps {
  gameState: GameState;
  totalAttack: number;
  totalDefense: number;
  totalSpeed: number;
  powerScore: number;
}

export const HeroAttributeSummary: React.FC<HeroAttributeSummaryProps> = ({
  gameState,
  totalAttack,
  totalDefense,
  totalSpeed,
  powerScore
}) => {
  const maxDamage = gameState.maxDamage || 0;
  const totalDodges = gameState.totalDodges || 0;
  const totalSpecials = gameState.totalSpecials || 0;
  const totalDeaths = gameState.totalDeaths || (
    Object.values(gameState.bossDeathStats || {}).reduce<number>((acc, curr) => acc + (Number(curr) || 0), 0)
  );
  const totalKills = gameState.totalBossesDefeated || 0;
  const kdRatio = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : totalKills.toFixed(1);

  return (
    <div className="bg-[#0e1628] border border-[#1a2540] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
      <div>
        <h3 className="font-mono text-sm text-[#7ae0ff] uppercase font-bold tracking-wider mb-3.5 border-b border-white/5 pb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">📊 HERO COMBAT TELEMETRY</span>
          <span className="text-xs text-slate-400 font-normal">K/D: <strong className="text-white">{kdRatio}</strong></span>
        </h3>

        {/* 6 Grid Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="bg-[#141c30] p-2.5 rounded-xl border border-[#2a4060]/30 flex flex-col">
            <span className="text-[11px] text-slate-400 block uppercase font-bold">🗡️ Total Attack</span>
            <span className="font-mono text-sm text-[#f5e56b] font-black mt-0.5">+{totalAttack} ATK</span>
            <span className="text-[10px] text-slate-500 block leading-tight">+{gameState.damageBonusPercent || 0}% Tonic</span>
          </div>

          <div className="bg-[#141c30] p-2.5 rounded-xl border border-[#2a4060]/30 flex flex-col">
            <span className="text-[11px] text-slate-400 block uppercase font-bold">🛡️ Armor / Defense</span>
            <span className="font-mono text-sm text-[#7ae0ff] font-black mt-0.5">+{totalDefense} DEF</span>
            <span className="text-[10px] text-slate-500 block leading-tight">Damage mitigation</span>
          </div>

          <div className="bg-[#141c30] p-2.5 rounded-xl border border-[#2a4060]/30 flex flex-col">
            <span className="text-[11px] text-slate-400 block uppercase font-bold">💖 Total Max HP</span>
            <span className="font-mono text-sm text-red-400 font-black mt-0.5">{100 + totalDefense + (gameState.maxHpBonus || 0)} HP</span>
            <span className="text-[10px] text-slate-500 block leading-tight">+{gameState.maxHpBonus || 0} Shield</span>
          </div>

          <div className="bg-[#141c30] p-2.5 rounded-xl border border-[#2a4060]/30 flex flex-col">
            <span className="text-[11px] text-slate-400 block uppercase font-bold">💥 Max Damage</span>
            <span className="font-mono text-sm text-orange-400 font-black mt-0.5">{maxDamage} DMG</span>
            <span className="text-[10px] text-slate-500 block leading-tight">Single-hit crit peak</span>
          </div>

          <div className="bg-[#141c30] p-2.5 rounded-xl border border-[#2a4060]/30 flex flex-col">
            <span className="text-[11px] text-slate-400 block uppercase font-bold">💨 Attacks Dodged</span>
            <span className="font-mono text-sm text-[#cb9df2] font-black mt-0.5">{totalDodges} Evasions</span>
            <span className="text-[10px] text-slate-500 block leading-tight">SPD + agility rate</span>
          </div>

          <div className="bg-[#141c30] p-2.5 rounded-xl border border-[#2a4060]/30 flex flex-col">
            <span className="text-[11px] text-slate-400 block uppercase font-bold">✨ Specials Cast</span>
            <span className="font-mono text-sm text-cyan-300 font-black mt-0.5">{totalSpecials} Powers</span>
            <span className="text-[10px] text-slate-500 block leading-tight">Artifact activations</span>
          </div>
        </div>
      </div>

      <div className="bg-black/35 border border-white/5 rounded-xl p-3 mt-3 text-xs font-mono text-slate-300 space-y-1">
        <div className="flex justify-between"><span>👑 Champion Name:</span> <span className="font-bold text-white">{gameState.playerName || 'Hero'}</span></div>
        <div className="flex justify-between"><span>⚡ Total Power Score:</span> <span className="font-bold text-[#f5e56b]">{powerScore} PS</span></div>
        <div className="flex justify-between">
          <span>⚔️ Kills vs Deaths:</span> 
          <span className="font-bold text-slate-200">
            <span className="text-emerald-400">{totalKills} W</span> / <span className="text-red-400">{totalDeaths} L</span>
          </span>
        </div>
      </div>
    </div>
  );
};
