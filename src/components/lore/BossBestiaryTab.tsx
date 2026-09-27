import React, { useState } from 'react';
import { GameState } from '../../types';
import { BOSSES } from '../../data';
import { BOSS_DOSSIERS } from '../../loreData';

interface BossBestiaryTabProps {
  gameState: GameState;
}

export const BossBestiaryTab: React.FC<BossBestiaryTabProps> = ({ gameState }) => {
  const [selectedBossId, setSelectedBossId] = useState<string>(BOSSES[0].id);

  const activeBossData = BOSSES.find(b => b.id === selectedBossId) || BOSSES[0];
  const activeBossDossier = BOSS_DOSSIERS.find(b => b.id === selectedBossId) || BOSS_DOSSIERS[0];

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Boss selector list */}
        <div className="lg:col-span-4 space-y-2">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold mb-2">
            THREAT REGISTRY ({BOSSES.length})
          </h3>

          {BOSSES.map(boss => {
            const isSelected = boss.id === selectedBossId;
            const kills = gameState.bossKillStats?.[boss.id] || 0;
            const dossier = BOSS_DOSSIERS.find(b => b.id === boss.id);

            return (
              <button
                key={boss.id}
                onClick={() => setSelectedBossId(boss.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-linear-to-r from-red-950/60 to-[#141c30] border-red-500/60 text-white shadow-md'
                    : 'bg-[#0e1628] border-[#1a2540] hover:border-[#2a4060] text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{boss.emoji}</span>
                  <div>
                    <div className="text-xs font-bold text-white">{boss.id}</div>
                    <div className="text-xs text-slate-400 font-mono">Req: {boss.powerReq} PS</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/20 block">
                    {dossier?.threatLevel || 'Hostile'}
                  </span>
                  <span className="text-xs font-mono text-emerald-400">{kills} Kills</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Boss Dossier Card */}
        <div className="lg:col-span-8 bg-[#0e1628] border border-[#1a2540] rounded-3xl p-5 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl sm:text-5xl">{activeBossData.emoji}</span>
              <div>
                <span className="text-xs font-mono text-red-400 uppercase tracking-widest font-bold">
                  THREAT LEVEL: {activeBossDossier.threatLevel}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">{activeBossData.id}</h3>
                <p className="text-xs text-slate-400 italic">"{activeBossDossier.title}"</p>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="text-xs font-mono text-yellow-400 bg-black/40 border border-yellow-500/20 px-3 py-1 rounded-xl">
                +{activeBossData.reward} 🪙 Gold
              </span>
            </div>
          </div>

          {/* Combat Ratings */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#141c30] p-3 rounded-xl border border-[#2a4060]/40 text-center">
              <span className="text-xs uppercase font-bold text-slate-400 block">❤️ Base HP</span>
              <span className="font-mono text-sm text-red-400 font-bold">{activeBossData.baseHP}</span>
            </div>
            <div className="bg-[#141c30] p-3 rounded-xl border border-[#2a4060]/40 text-center">
              <span className="text-xs uppercase font-bold text-slate-400 block">⚔️ Base ATK</span>
              <span className="font-mono text-sm text-red-400 font-bold">{activeBossData.baseAttack}</span>
            </div>
            <div className="bg-[#141c30] p-3 rounded-xl border border-[#2a4060]/40 text-center">
              <span className="text-xs uppercase font-bold text-slate-400 block">🎯 Power Req</span>
              <span className="font-mono text-sm text-[#7ae0ff] font-bold">{activeBossData.powerReq} PS</span>
            </div>
          </div>

          {/* Special Ability */}
          <div className="bg-red-950/20 border border-red-500/30 p-3.5 rounded-xl text-xs">
            <span className="text-red-300 font-bold uppercase font-mono text-xs block mb-0.5">⚡ Boss Special Technique:</span>
            <p className="text-red-100 font-semibold">{activeBossData.special}</p>
          </div>

          {/* Dossier In-Depth Intel */}
          <div className="space-y-3.5 border-t border-white/5 pt-4 text-xs">
            <div>
              <h5 className="font-mono text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">
                📜 HISTORICAL INTELLIGENCE & ORIGIN
              </h5>
              <p className="text-slate-200 leading-relaxed">{activeBossDossier.lore}</p>
            </div>

            <div>
              <h5 className="font-mono text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">
                🩸 COMBAT BEHAVIOR & PATTERNS
              </h5>
              <p className="text-slate-300 leading-relaxed">{activeBossDossier.behaviorLore}</p>
            </div>

            <div className="bg-amber-950/30 border border-amber-500/20 rounded-xl p-3">
              <h5 className="font-mono text-xs text-amber-300 uppercase tracking-widest font-bold mb-1">
                ⚡ TACTICAL WEAKNESS & COUNTER-STRATEGY
              </h5>
              <p className="text-amber-100 leading-relaxed">{activeBossDossier.tacticalWeakness}</p>
            </div>

            <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-3">
              <h5 className="font-mono text-xs text-[#7ae0ff] uppercase tracking-widest font-bold mb-1">
                ⚔️ RECOMMENDED ARMORY COUNTER-ARSENAL
              </h5>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {activeBossDossier.recommendedArsenal.map(item => (
                  <span key={item} className="bg-black/50 text-[#7ae0ff] px-2.5 py-1 rounded-lg border border-[#7ae0ff]/30 font-bold text-xs">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
