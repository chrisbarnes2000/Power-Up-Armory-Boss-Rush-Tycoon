import React, { useState, useEffect } from 'react';
import { GameState } from '../../types';
import { BOSSES } from '../../data';
import { CANONICAL_CHAPTERS, CanonicalChapter } from '../../loreData';

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

  // Progressive Chapter Unlock calculation: locked directly based on the Encountered Titan
  const isChapterUnlocked = (chapter: CanonicalChapter, index: number): boolean => {
    // Chapter 1 is the initiate prologue scroll (unsealed by default for all scholars)
    if (index === 0) return true;

    const bossId = chapter.featuredBoss;
    const kills = gameState.bossKillStats?.[bossId] || 0;
    const deaths = gameState.bossDeathStats?.[bossId] || 0;
    const bossDefeated = (gameState.bosses || []).find(b => b.id === bossId)?.defeated;

    // Unlocked once the Titan has been encountered in combat (kills > 0 or deaths > 0 or defeated)
    return kills > 0 || deaths > 0 || !!bossDefeated;
  };

  const selectedIndex = CANONICAL_CHAPTERS.findIndex(c => c.chapterNumber === selectedChapter.chapterNumber);
  const isSelectedUnlocked = isChapterUnlocked(selectedChapter, selectedIndex >= 0 ? selectedIndex : 0);

  // Calculations for Living War Saga
  const totalDeaths: number = (Object.values(gameState.bossDeathStats || {}) as number[]).reduce((a, b) => a + b, 0);
  const totalKills: number = (Object.values(gameState.bossKillStats || {}) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 w-full">
      {/* Sub-mode switches: Canonical Saga vs Living War Saga vs Chronicler's Quill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0e1628] border border-amber-500/20 p-3 rounded-2xl shadow-md">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setChronicleMode('canonical')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              chronicleMode === 'canonical'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20 font-black'
                : 'bg-white/5 text-amber-200/70 hover:text-white'
            }`}
          >
            <span>📜</span>
            <span>Ancient Scrolls (Canonical)</span>
          </button>

          <button
            onClick={() => setChronicleMode('living')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              chronicleMode === 'living'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20 font-black'
                : 'bg-white/5 text-amber-200/70 hover:text-white'
            }`}
          >
            <span>⚔️</span>
            <span>The Living War Saga (Your Records)</span>
          </button>

          <button
            onClick={onOpenWeaver}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 bg-white/5 text-slate-300 hover:text-white"
          >
            <span>✍️</span>
            <span>Chronicler's Quill</span>
          </button>
        </div>

        <div className="text-xs font-mono text-amber-400/80">
          {chronicleMode === 'canonical' ? 'Weathered ancient papyrus scrolls with progressive wax seals' : 'Dynamic chronicles compiled from your active game state'}
        </div>
      </div>

      {/* MODE A: CANONICAL CHAPTERS - WEATHERED SCROLL PRESENTATION */}
      {chronicleMode === 'canonical' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Scroll Chapters List Sidebar */}
          <div className="lg:col-span-4 space-y-2.5">
            <h3 className="text-xs font-mono text-amber-400 uppercase tracking-wider font-bold mb-2 flex items-center justify-between">
              <span>ARCHIVED SCROLLS ({CANONICAL_CHAPTERS.length})</span>
              <span className="text-[10px] text-slate-400">WAX SEAL KEYS</span>
            </h3>

            {CANONICAL_CHAPTERS.map((chapter, idx) => {
              const isSelected = selectedChapter.chapterNumber === chapter.chapterNumber;
              const unlocked = isChapterUnlocked(chapter, idx);

              return (
                <button
                  key={chapter.chapterNumber}
                  onClick={() => setSelectedChapter(chapter)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between relative overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-950/80 via-[#2a1d12] to-[#1a1208] border-amber-500/80 text-white shadow-lg ring-1 ring-amber-500/30'
                      : 'bg-[#0e1628] border-white/5 hover:border-amber-500/30 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl shrink-0">
                      {unlocked ? '📜' : '🔒'}
                    </span>
                    <div>
                      <div className="text-[10px] font-mono text-amber-400/80 uppercase font-bold">
                        {chapter.chapterNumber} · {chapter.era}
                      </div>
                      <div className="text-xs font-bold text-white truncate max-w-[180px]">
                        {unlocked ? chapter.title : `Classified Scroll`}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border block ${
                      unlocked
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                        : 'bg-red-950/60 text-red-300 border-red-500/30'
                    }`}>
                      {unlocked ? '🔓 Unsealed' : `🔒 Seek ${chapter.featuredBoss.split(' ')[0]}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Ancient Parchment Scroll Reader */}
          <div className="lg:col-span-8 flex flex-col relative">
            
            {/* Top Scroll Dowel / Wooden Finial */}
            <div className="h-6 sm:h-7 bg-gradient-to-r from-[#2c1d11] via-[#633e22] to-[#2c1d11] rounded-full border-2 border-amber-700/60 shadow-[0_6px_15px_rgba(0,0,0,0.8)] flex items-center justify-between px-4 z-20">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm"></span>
              <span className="text-[10px] font-mono text-amber-200 uppercase font-bold tracking-widest">
                ANCIENT PARCHMENT SCROLL · REALM ARCHIVES
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm"></span>
            </div>

            {/* Scroll Parchment Body */}
            <div className="bg-gradient-to-b from-[#1c140d] via-[#121927] to-[#1c140d] border-x-4 border-amber-900/60 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative -my-1 z-10 space-y-6">
              
              {/* Dynamic Wax Seal Stamp (Top Right) - Adapts to Broken vs Sealed */}
              {isSelectedUnlocked ? (
                <div className="absolute top-4 right-6 flex flex-col items-center pointer-events-none select-none z-20">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-950 via-slate-900 to-amber-950 border-2 border-emerald-400/80 flex flex-col items-center justify-center text-[9px] font-black text-emerald-300 shadow-xl shadow-black/80 font-mono transform -rotate-12 border-dashed">
                    <span className="text-[9px] leading-tight font-black">BROKEN</span>
                    <span className="text-[8px] text-amber-300 font-bold leading-tight">SEAL</span>
                  </div>
                  <div className="flex gap-1 mt-0.5">
                    <div className="w-1.5 h-3 bg-emerald-700/70 shadow-md rounded-b -rotate-12"></div>
                    <div className="w-1.5 h-2.5 bg-amber-700/70 shadow-md rounded-b rotate-12"></div>
                  </div>
                </div>
              ) : (
                <div className="absolute top-4 right-6 flex flex-col items-center pointer-events-none select-none z-20">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-700 via-rose-900 to-red-950 border-2 border-amber-400 flex items-center justify-center text-[10px] font-black text-amber-200 shadow-xl shadow-black/80 font-mono transform rotate-12">
                    SEALED
                  </div>
                  <div className="w-2 h-5 bg-red-800 shadow-md rounded-b"></div>
                </div>
              )}

              {isSelectedUnlocked ? (
                <>
                  <div className="border-b border-amber-500/20 pb-4 pr-16 sm:pr-20">
                    <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest font-bold mb-1">
                      <span>{selectedChapter.chapterNumber}</span>
                      <span>·</span>
                      <span>{selectedChapter.era}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-amber-100 font-serif tracking-wide">
                      {selectedChapter.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-200/70 italic mt-1 font-serif">
                      "{selectedChapter.subtitle}"
                    </p>
                  </div>

                  {/* Armaments & Encounter Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#0b101c]/80 p-3 rounded-xl border border-amber-500/20">
                      <span className="text-[10px] uppercase font-bold text-amber-400/90 block mb-1 font-mono">
                        ⚔️ Armaments Mentioned
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedChapter.featuredItems.map(item => (
                          <span key={item} className="text-xs font-bold text-[#7ae0ff] bg-black/40 px-2 py-0.5 rounded border border-[#7ae0ff]/20">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#0b101c]/80 p-3 rounded-xl border border-amber-500/20">
                      <span className="text-[10px] uppercase font-bold text-amber-400/90 block mb-1 font-mono">
                        👹 Encountered Titan
                      </span>
                      <span className="text-xs font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/20 inline-block">
                        {selectedChapter.featuredBoss}
                      </span>
                    </div>
                  </div>

                  {/* Main Prose with Parchment Styling */}
                  <div className="space-y-4 text-xs sm:text-sm text-amber-100 leading-relaxed font-serif">
                    {selectedChapter.chronicle.map((para, i) => (
                      <p key={i} className="leading-relaxed bg-black/20 p-3.5 rounded-xl border border-amber-500/10 shadow-inner">
                        {i === 0 && <span className="text-xl font-black text-amber-400 float-left mr-2 leading-none font-serif">“</span>}
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* Tactical Takeaway Seal */}
                  <div className="bg-amber-950/50 border border-amber-500/30 rounded-2xl p-4 shadow-inner">
                    <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-extrabold block mb-1">
                      ⚡ TACTICAL INHERITANCE
                    </span>
                    <p className="text-xs text-amber-100 leading-relaxed font-sans">
                      {selectedChapter.tacticalLesson}
                    </p>
                  </div>
                </>
              ) : (
                /* Locked Scroll Teaser */
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-950/80 border-2 border-red-500/40 flex items-center justify-center mx-auto text-3xl text-red-400 shadow-xl">
                    🔒
                  </div>
                  <div className="space-y-1 max-w-sm mx-auto">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold bg-red-950/60 px-3 py-1 rounded-full border border-red-500/30">
                      Wax Seal Unbroken
                    </span>
                    <h3 className="text-lg font-black text-white font-mono uppercase">
                      Classified Chapter {selectedChapter.chapterNumber}
                    </h3>
                    <p className="text-xs text-slate-300">
                      Engage and encounter <strong className="text-amber-400">{selectedChapter.featuredBoss}</strong> in the Boss Rush arena to break this ancient wax seal and transcribe its battle history!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Scroll Dowel / Wooden Finial */}
            <div className="h-6 sm:h-7 bg-gradient-to-r from-[#2c1d11] via-[#633e22] to-[#2c1d11] rounded-full border-2 border-amber-700/60 shadow-[0_-6px_15px_rgba(0,0,0,0.8)] flex items-center justify-between px-4 z-20">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm"></span>
              <span className="text-[10px] font-mono text-amber-200 uppercase font-bold tracking-widest">
                TRANSCRIBED FOR POWER-UP ARMORY
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm"></span>
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
                  🏆 {gameState.totalBossesDefeated || 0} Bosses Conquered
                </span>
                <span className="bg-[#2a1414] text-[#ff6a6a] px-3 py-1.5 rounded-xl border border-[#8a3a3a]/30 font-bold">
                  💀 {totalDeaths} Defeats Endured
                </span>
                <span className="bg-[#2a2414] text-[#ffea6a] px-3 py-1.5 rounded-xl border border-[#8a7a3a]/30 font-bold">
                  💰 {Math.floor(gameState.coins).toLocaleString()} Gold In Reserve
                </span>
              </div>
            </div>

            {/* Boss Gauntlet Kill/Death Ledger */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
                BATTLE LEDGER BY ADVERSARY
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {BOSSES.map(boss => {
                  const kills = gameState.bossKillStats?.[boss.id] || 0;
                  const deaths = gameState.bossDeathStats?.[boss.id] || 0;
                  return (
                    <div key={boss.id} className="bg-[#0e1628] border border-[#1a2540] p-3 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{boss.emoji}</span>
                        <div>
                          <div className="text-xs font-bold text-white">{boss.id}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Req: {boss.powerReq} PS</div>
                        </div>
                      </div>
                      <div className="text-right text-xs font-mono">
                        <span className="text-emerald-400 font-bold">{kills}W</span>
                        <span className="text-slate-500 mx-1">/</span>
                        <span className="text-red-400 font-bold">{deaths}L</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* User Custom Sagas / Community Stories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
                COMMUNITY CHRONICLES & INSCRIBED SAGAS ({gameState.customStories?.length || 0})
              </h4>
              <button
                onClick={onOpenWeaver}
                className="text-xs text-[#7ae0ff] hover:underline font-bold font-mono"
              >
                + Inscribe New Saga
              </button>
            </div>

            {(!gameState.customStories || gameState.customStories.length === 0) ? (
              <div className="bg-[#0e1628] border border-dashed border-[#1a2540] rounded-3xl p-8 text-center space-y-3">
                <span className="text-3xl block">✍️</span>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No custom chronicles have been inscribed yet. Use the <strong>Chronicler's Quill</strong> to write and immortalize your epic battles into the Lore Book!
                </p>
                <button
                  onClick={onOpenWeaver}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Write Your First Battle Saga
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gameState.customStories.map(story => (
                  <div key={story.id} className="bg-[#0e1628] border border-[#1a2540] rounded-2xl p-4.5 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2 mb-2">
                        <div>
                          <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                            {story.date} · by {story.author}
                          </span>
                          <h5 className="text-sm font-bold text-white">{story.title}</h5>
                        </div>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                          story.outcome === 'victory' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-red-950 text-red-300 border border-red-500/30'
                        }`}>
                          {story.outcome}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed italic font-serif">
                        "{story.storyText}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-[10px] font-mono text-slate-500">
                        Adversary: {story.bossId}
                      </span>
                      <button
                        onClick={() => onDeleteStory(story.id)}
                        className="text-[10px] text-red-400 hover:text-red-300 font-mono hover:underline cursor-pointer"
                      >
                        Delete Story
                      </button>
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
