import React, { useState } from 'react';
import { GameState } from '../../types';
import { BOSSES } from '../../data';
import { BOSS_DOSSIERS } from '../../loreData';

interface BossBestiaryTabProps {
  gameState: GameState;
  onChallengeBoss?: (bossId: string) => void;
}

export const BossBestiaryTab: React.FC<BossBestiaryTabProps> = ({ gameState, onChallengeBoss }) => {
  const [selectedBossId, setSelectedBossId] = useState<string>(BOSSES[0].id);

  const activeBossData = BOSSES.find(b => b.id === selectedBossId) || BOSSES[0];
  const activeBossDossier = BOSS_DOSSIERS.find(b => b.id === selectedBossId) || BOSS_DOSSIERS[0];

  // Progressive bestiary unlock checks
  const getBossStatus = (bossId: string) => {
    const kills = gameState.bossKillStats?.[bossId] || 0;
    const deaths = gameState.bossDeathStats?.[bossId] || 0;
    if (kills > 0) return 'conquered';
    if (deaths > 0) return 'encountered';
    return 'unencountered';
  };

  const activeStatus = getBossStatus(activeBossData.id);

  // Discovery statistics
  const totalBosses = BOSSES.length;
  const conqueredCount = BOSSES.filter(b => (gameState.bossKillStats?.[b.id] || 0) > 0).length;
  const encounteredCount = BOSSES.filter(b => getBossStatus(b.id) !== 'unencountered').length;

  return (
    <div className="space-y-6 w-full">
      {/* BESTIARY PROGRESSION BANNER */}
      <div className="bg-linear-to-r from-[#1a1208] via-[#121c2e] to-[#0a101d] border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">👾</span>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                CLASSIFIED EXPEDITION LOG
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                Astral Bestiary of Realm Titans
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 bg-black/40 border border-white/10 px-4 py-2 rounded-2xl">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Bestiary Transcribed</div>
              <div className="text-xs font-mono font-black text-amber-300">
                {conqueredCount}/{totalBosses} Conquered ({encounteredCount}/{totalBosses} Sighted)
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-sm font-bold text-amber-400">
              {Math.round((conqueredCount / totalBosses) * 100)}%
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900/80 rounded-full h-2.5 overflow-hidden border border-white/5">
          <div 
            className="bg-linear-to-r from-amber-500 via-rose-500 to-amber-400 h-full transition-all duration-700" 
            style={{ width: `${(conqueredCount / totalBosses) * 100}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400 mt-2 italic">
          Progressive Intel: Challenge titans in Boss Rush to identify threat profiles. Conquering a titan permanently transcribes their tactical weaknesses, drops, and lore.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Boss selector list */}
        <div className="lg:col-span-4 space-y-2">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold mb-2 flex items-center justify-between">
            <span>THREAT REGISTRY ({BOSSES.length})</span>
            <span className="text-amber-400 text-[10px]">PROGRESSIVE UNLOCK</span>
          </h3>

          {BOSSES.map(boss => {
            const isSelected = boss.id === selectedBossId;
            const status = getBossStatus(boss.id);
            const kills = gameState.bossKillStats?.[boss.id] || 0;
            const dossier = BOSS_DOSSIERS.find(b => b.id === boss.id);

            return (
              <button
                key={boss.id}
                onClick={() => setSelectedBossId(boss.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-linear-to-r from-amber-950/60 to-[#141c30] border-amber-500/60 text-white shadow-md'
                    : 'bg-[#0e1628] border-[#1a2540] hover:border-[#2a4060] text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`text-2xl ${status === 'unencountered' ? 'filter grayscale brightness-50' : ''}`}>
                    {status === 'unencountered' ? '❓' : boss.emoji}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{status === 'unencountered' ? `Classified [${boss.id.split(' ')[0]}]` : boss.id}</span>
                      {status === 'conquered' && <span className="text-emerald-400 text-[10px]">👑</span>}
                      {status === 'encountered' && <span className="text-amber-400 text-[10px]">⚠️</span>}
                      {status === 'unencountered' && <span className="text-slate-500 text-[10px]">🔒</span>}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      Req: {boss.powerReq} PS
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border block ${
                    status === 'conquered' 
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                      : status === 'encountered'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                      : 'bg-slate-900 text-slate-500 border-slate-700/40'
                  }`}>
                    {status === 'conquered' ? '✓ Mastered' : status === 'encountered' ? '⚠️ Sighted' : '🔒 Classified'}
                  </span>
                  <span className="text-xs font-mono text-emerald-400">{kills} Kills</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Boss Dossier Card with Progressive Intel */}
        <div className="lg:col-span-8 bg-[#0e1628] border border-[#1a2540] rounded-3xl p-5 sm:p-7 space-y-5 relative overflow-hidden">
          {activeStatus === 'unencountered' ? (
            /* Shrouded Classified Entry */
            <div className="py-12 px-4 text-center space-y-5">
              <div className="w-20 h-20 bg-slate-900 border-2 border-slate-700/50 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-inner text-slate-500">
                🔒
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <span className="text-xs font-mono text-amber-400/80 uppercase tracking-widest font-bold bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/20">
                  Intel Classified · Power Req: {activeBossData.powerReq} PS
                </span>
                <h3 className="text-xl font-black text-white font-mono uppercase tracking-wider">
                  Unidentified Titan Signature
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This titan lurks in the deep reaches of the Boss Rush. Challenge and engage this creature in combat to transcribe its biological traits, attack potency, and drops into the Bestiary.
                </p>
              </div>

              <div className="pt-3">
                <span className="inline-block text-[11px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-3.5 py-1.5 rounded-xl">
                  ⚔️ Requires Power Score {activeBossData.powerReq} PS in Boss Rush
                </span>
              </div>
            </div>
          ) : (
            /* Encountered or Conquered Dossier */
            <>
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

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-yellow-400 bg-black/40 border border-yellow-500/20 px-3 py-1 rounded-xl">
                    +{activeBossData.reward} 🪙 Gold
                  </span>
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${
                    activeStatus === 'conquered'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                  }`}>
                    {activeStatus === 'conquered' ? '👑 Mastered' : '⚠️ Sighted'}
                  </span>
                  {onChallengeBoss && (
                    <button
                      onClick={() => onChallengeBoss(activeBossData.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-1"
                    >
                      <span>⚔️</span>
                      <span>Challenge</span>
                    </button>
                  )}
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

              {/* Dossier In-Depth Intel (Tactical weaknesses unlocked only if conquered) */}
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

                {activeStatus === 'conquered' ? (
                  <>
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
                  </>
                ) : (
                  <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 text-center space-y-2">
                    <span className="text-lg block">🔒</span>
                    <span className="font-mono text-xs text-amber-300 font-bold uppercase tracking-wider block">
                      Tactical Counters Classified
                    </span>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Defeat {activeBossData.emoji} {activeBossData.id} at least once in Boss Rush to decipher its tactical weaknesses and recommended armory counter-arsenal.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
