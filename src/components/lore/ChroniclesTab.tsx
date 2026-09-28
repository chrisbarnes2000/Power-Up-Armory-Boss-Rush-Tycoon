import React, { useState, useEffect } from 'react';
import { GameState } from '../../types';
import { BOSSES } from '../../data';
import { CANONICAL_CHAPTERS, BOSS_DOSSIERS, CanonicalChapter } from '../../loreData';

interface ChroniclesTabProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onOpenWeaver: () => void;
  onDeleteStory: (storyId: string) => void;
  initialMode?: 'canonical' | 'living';
}

export const ChroniclesTab: React.FC<ChroniclesTabProps> = ({
  gameState,
  onOpenWeaver,
  onDeleteStory,
  initialMode = 'canonical'
}) => {
  const [chronicleMode, setChronicleMode] = useState<'canonical' | 'living'>(initialMode);
  
  useEffect(() => {
    setChronicleMode(initialMode);
  }, [initialMode]);

  const [selectedChapter, setSelectedChapter] = useState<CanonicalChapter>(CANONICAL_CHAPTERS[0]);

  // Calculations for Living War Saga
  const totalDeaths: number = (Object.values(gameState.bossDeathStats || {}) as number[]).reduce((a, b) => a + b, 0);
  const totalKills: number = (Object.values(gameState.bossKillStats || {}) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 w-full">
      {/* Sub-mode switches: Canonical Saga vs Living War Saga vs Chronicler's Quill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0e1628] border border-[#1a2540] p-3 rounded-2xl">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setChronicleMode('canonical')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              chronicleMode === 'canonical'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <span>🏛️</span>
            <span>The Canonical Saga (I-VII)</span>
          </button>

          <button
            onClick={() => setChronicleMode('living')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              chronicleMode === 'living'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <span>⚔️</span>
            <span>The Living War Saga (Your Records)</span>
          </button>

          <button
            onClick={onOpenWeaver}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 bg-white/5 text-slate-400 hover:text-white"
          >
            <span>✍️</span>
            <span>Chronicler's Quill (Write Story)</span>
          </button>
        </div>

        <div className="text-xs font-mono text-slate-400">
          {chronicleMode === 'canonical' ? '7 Canonical Chapters connecting gear to boss triumphs' : 'Dynamic chronicles compiled from your active game state'}
        </div>
      </div>

      {/* MODE A: CANONICAL CHAPTERS */}
      {chronicleMode === 'canonical' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Chapters list sidebar */}
          <div className="lg:col-span-4 space-y-2.5">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold mb-2">
              CHRONICLE CHAPTERS
            </h3>
            {CANONICAL_CHAPTERS.map(ch => {
              const isSelected = selectedChapter.id === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChapter(ch)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-linear-to-r from-[#1a2540] to-[#141f35] border-[#7ae0ff]/60 shadow-[0_0_20px_rgba(122,224,255,0.15)]'
                      : 'bg-[#0e1628] border-[#1a2540] hover:border-[#2a4060] text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-widest">{ch.chapterNumber}</span>
                    <span className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">{ch.era}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-white">{ch.title}</h4>
                  <p className="text-xs text-slate-400 truncate">{ch.subtitle}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs text-slate-400">Target:</span>
                    <span className="text-xs font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/20">{ch.featuredBoss}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Chapter detail reader */}
          <div className="lg:col-span-8 bg-[#0e1628] border border-[#1a2540] rounded-3xl p-5 sm:p-7 flex flex-col">
            <div className="border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center justify-between text-xs font-mono text-orange-400 uppercase tracking-widest font-bold mb-1">
                <span>{selectedChapter.chapterNumber} · {selectedChapter.era}</span>
                <span className="bg-white/5 text-slate-400 px-2.5 py-1 rounded-full text-xs">Canonical Record</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">{selectedChapter.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 italic mt-1">{selectedChapter.subtitle}</p>
            </div>

            {/* Featured gear & boss encounter badge bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="bg-[#141c30] p-3 rounded-xl border border-[#2a4060]/40">
                <span className="text-xs uppercase font-bold text-slate-400 block mb-1">⚔️ Key Armaments Forged</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedChapter.featuredItems.map(item => (
                    <span key={item} className="text-xs font-bold text-[#7ae0ff] bg-black/40 px-2 py-0.5 rounded border border-[#7ae0ff]/20">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#141c30] p-3 rounded-xl border border-[#2a4060]/40">
                <span className="text-xs uppercase font-bold text-slate-400 block mb-1">👹 Adversary Documented</span>
                <span className="text-xs font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/20 inline-block">
                  {selectedChapter.featuredBoss}
                </span>
              </div>
            </div>

            {/* Main Prose */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans mb-6">
              {selectedChapter.chronicle.map((para, i) => (
                <p key={i} className="leading-relaxed bg-black/15 p-3 rounded-xl border border-white/5">
                  {para}
                </p>
              ))}
            </div>

            {/* Tactical Takeaway */}
            <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 mt-auto">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-extrabold block mb-1">
                ⚡ TACTICAL DOCTRINE & BATTLE CONNECTION
              </span>
              <p className="text-xs text-amber-100 leading-relaxed">
                {selectedChapter.tacticalLesson}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODE B: THE LIVING WAR SAGA */}
      {chronicleMode === 'living' && (
        <div className="space-y-6">
          {/* Dynamic Overview Banner */}
          <div className="bg-linear-to-br from-[#141f35] to-[#0a0f1d] border border-[#2a4060] rounded-3xl p-5 sm:p-6 shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
              <div>
                <span className="text-xs font-mono text-[#7ae0ff] uppercase tracking-widest font-bold">
                  THE REAL-TIME CHRONICLE OF
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Champion {gameState.playerName || 'Hero'}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <span className="bg-[#142a20] text-[#6affaa] px-3 py-1.5 rounded-xl border border-[#3a8a5a]/30 font-bold">
                  ⚔️ {gameState.totalBossesDefeated} Boss Victories
                </span>
                <span className="bg-red-950/40 text-red-300 px-3 py-1.5 rounded-xl border border-red-500/20 font-bold">
                  💀 {totalDeaths} Fallen Campaigns
                </span>
                <span className="bg-[#1a2440] text-[#f5e56b] px-3 py-1.5 rounded-xl border border-[#2a4060] font-bold">
                  🛡️ {gameState.powerScore} Power Score
                </span>
              </div>
            </div>

            {/* Dynamic Generated Narrative Prose */}
            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3 font-sans">
              <p>
                <span className="font-bold text-white">The Scribe’s Current Record:</span> In the ongoing records of the Armory, Champion <span className="text-[#7ae0ff] font-bold">{gameState.playerName || 'Hero'}</span> commands an arsenal of <span className="text-[#f5e56b] font-bold">{gameState.powerups.filter(p => p.owned).length} unique item licenses</span>.
              </p>
              <p>
                {totalKills > 0 ? (
                  <span>
                    Across {totalKills} total confirmed battlefield executions, the champion has proven that their selected equipment holds sufficient firepower to dismantle the realm’s most formidable terrors.
                    {totalDeaths > 0 && ` Each of the ${totalDeaths} recorded defeats served not as an end, but as a crucible that taught the value of defensive bulk and alchemical revives.`}
                  </span>
                ) : (
                  <span>
                    The champion has yet to record their first boss victory. The training grounds and armory stands ready — forge your initial weapons and challenge the Goblin King to initiate your chapter.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Boss Record Breakdown */}
          <div className="bg-[#0e1628] border border-[#1a2540] rounded-3xl p-5 sm:p-6">
            <h4 className="text-xs sm:text-sm font-mono text-[#f5e56b] uppercase tracking-wider font-bold mb-4 border-b border-white/5 pb-2.5">
              ⚔️ RECORDED BOSS ENGAGEMENTS & GEAR CONNECTIONS
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BOSSES.map(boss => {
                const kills = gameState.bossKillStats?.[boss.id] || 0;
                const deaths = gameState.bossDeathStats?.[boss.id] || 0;
                const recommended = BOSS_DOSSIERS.find(b => b.id === boss.id)?.recommendedArsenal || [];

                return (
                  <div key={boss.id} className="bg-[#141c30]/70 border border-[#2a4060]/40 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{boss.emoji}</span>
                          <span className="font-extrabold text-sm text-white">{boss.id}</span>
                        </div>
                        <div className="flex gap-1.5 text-xs font-mono">
                          <span className="bg-[#142a20] text-[#6affaa] px-2 py-0.5 rounded font-bold">{kills} Kills</span>
                          <span className="bg-red-950/40 text-red-300 px-2 py-0.5 rounded font-bold">{deaths} Deaths</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 italic mb-2.5">
                        {kills > 0
                          ? `Documented victory! Slayers utilized targeted counters against this foe.`
                          : deaths > 0
                          ? `Fierce resistance encountered. Review tactical arsenal to exploit weaknesses.`
                          : `Unchallenged in current era. Requires ${boss.powerReq} Power Score.`}
                      </p>
                    </div>

                    <div className="border-t border-white/5 pt-2 mt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Optimal Arsenal:</span>
                      <span className="text-[#7ae0ff] font-bold">{recommended.join(', ')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Chronicles Bound by Player */}
          <div className="bg-[#0e1628] border border-[#1a2540] rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <div>
                <h4 className="text-xs sm:text-sm font-mono text-amber-400 uppercase tracking-wider font-bold">
                  📜 CUSTOM BATTLE CHRONICLES ({gameState.customStories?.length || 0})
                </h4>
                <p className="text-xs text-slate-400">Personal stories connecting your loadout to battle feats</p>
              </div>
              <button
                onClick={onOpenWeaver}
                className="text-xs font-bold uppercase tracking-wider bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-1.5 rounded-xl transition cursor-pointer"
              >
                + Weave New Tale
              </button>
            </div>

            {(!gameState.customStories || gameState.customStories.length === 0) ? (
              <div className="text-center py-8 text-slate-400 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-sm font-bold text-slate-300 mb-1">No custom battle stories written yet</p>
                <button
                  onClick={onOpenWeaver}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer mt-2"
                >
                  Open Chronicler's Quill
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {gameState.customStories.map(story => (
                  <div key={story.id} className="bg-[#141c30] border border-[#2a4060] rounded-2xl p-4.5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-white">{story.title}</span>
                          <span className={`text-xs font-mono uppercase px-2 py-0.5 rounded font-bold ${
                            story.outcome === 'victory' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/20' :
                            story.outcome === 'close-call' ? 'bg-amber-950 text-amber-300 border border-amber-500/20' :
                            story.outcome === 'heroic' ? 'bg-blue-950 text-blue-300 border border-blue-500/20' :
                            'bg-red-950 text-red-300 border border-red-500/20'
                          }`}>
                            {story.outcome}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          Penned by {story.author} · {story.date} · Foe: {story.bossId}
                        </p>
                      </div>
                      <button
                        onClick={() => onDeleteStory(story.id)}
                        className="text-xs text-red-400 hover:text-red-300 bg-red-950/40 px-2 py-1 rounded border border-red-500/20 self-start sm:self-auto cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                      {story.storyText}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs font-mono text-slate-400">
                      <span>Equipped Armaments:</span>
                      {story.featuredItems.map(item => (
                        <span key={item} className="bg-black/40 text-[#7ae0ff] px-2 py-0.5 rounded border border-[#7ae0ff]/20">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
