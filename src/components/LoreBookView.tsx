import React, { useState } from 'react';
import { GameState, CustomStoryEntry } from '../types';
import { POWERUPS, BOSSES } from '../data';
import { CANONICAL_CHAPTERS, ITEM_LORES, BOSS_DOSSIERS, SYSTEM_LEGEND, VEILED_LEDGER_PREAMBLE, CanonicalChapter } from '../loreData';
import { downloadLoreBookZip, downloadSingleItemMarkdown } from '../utils/markdownExporter';

interface LoreBookViewProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onNavigateToShop?: () => void;
  onNavigateToGame?: (tab?: 'tycoon' | 'bosses' | 'stats') => void;
  controlledTab?: 'chronicles' | 'legend' | 'compendium' | 'bestiary';
  onTabChange?: (tab: 'chronicles' | 'legend' | 'compendium' | 'bestiary') => void;
}

export default function LoreBookView({
  gameState,
  setGameState,
  onNavigateToShop,
  onNavigateToGame,
  controlledTab,
  onTabChange
}: LoreBookViewProps) {
  // Navigation Tabs within Lore Book
  const [activeTab, setActiveTab] = React.useState<'chronicles' | 'legend' | 'compendium' | 'bestiary'>(controlledTab || 'compendium');
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  const handleDownloadAllZip = async () => {
    try {
      setIsExportingZip(true);
      await downloadLoreBookZip();
      setExportSuccessMsg('Downloaded power-up-armory-lore-book-markdown.zip!');
      setTimeout(() => setExportSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Failed to export markdown zip:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  React.useEffect(() => {
    if (controlledTab) {
      setActiveTab(controlledTab);
    }
  }, [controlledTab]);

  const handleTabChange = (tab: 'chronicles' | 'legend' | 'compendium' | 'bestiary') => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  // Chronicles sub-tab: Canonical vs Living Battle Saga vs Story Weaver
  const [chronicleMode, setChronicleMode] = useState<'canonical' | 'living' | 'weaver'>('canonical');
  const [selectedChapter, setSelectedChapter] = useState<CanonicalChapter>(CANONICAL_CHAPTERS[0]);

  // Item Compendium Category Filter & Search
  const [compendiumFilter, setCompendiumFilter] = useState<'All' | 'Weapons' | 'Defense' | 'Utility' | 'Mystic'>('All');
  const [compendiumSearch, setCompendiumSearch] = useState('');
  const [selectedItemDetailId, setSelectedItemDetailId] = useState<string>(POWERUPS[0].id);

  // Boss Bestiary Selection
  const [selectedBossId, setSelectedBossId] = useState<string>(BOSSES[0].id);

  // Story Weaver State (For building custom story connecting items to battle records)
  const [weaverBoss, setWeaverBoss] = useState<string>(BOSSES[0].id);
  const [weaverItems, setWeaverItems] = useState<string[]>([POWERUPS[0].id]);
  const [weaverOutcome, setWeaverOutcome] = useState<'victory' | 'defeat' | 'close-call' | 'heroic'>('victory');
  const [weaverTitle, setWeaverTitle] = useState('');
  const [weaverText, setWeaverText] = useState('');
  const [weaverAuthor, setWeaverAuthor] = useState(gameState.playerName || 'Champion');
  const [weaverSuccessAlert, setWeaverSuccessAlert] = useState<string | null>(null);

  // Save State helper
  const saveState = (newState: GameState) => {
    localStorage.setItem('bossRushTycoon', JSON.stringify(newState));
  };

  // Helper to toggle items in story weaver
  const toggleWeaverItem = (itemId: string) => {
    setWeaverItems(prev => {
      if (prev.includes(itemId)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(i => i !== itemId);
      } else {
        if (prev.length >= 4) return prev; // Limit to 4 key items
        return [...prev, itemId];
      }
    });
  };

  // Auto-Weave Battle Story Draft based on player's battle record
  const handleAutoWeave = () => {
    const boss = BOSSES.find(b => b.id === weaverBoss);
    const bossKills = gameState.bossKillStats?.[weaverBoss] || 0;
    const bossDeaths = gameState.bossDeathStats?.[weaverBoss] || 0;
    const itemsUsed = weaverItems.map(id => POWERUPS.find(p => p.id === id)?.id || id).join(', ');
    const firstItem = POWERUPS.find(p => p.id === weaverItems[0]);

    let generatedTitle = '';
    let generatedStory = '';

    if (weaverOutcome === 'victory') {
      generatedTitle = `The Triumph over ${boss?.id || weaverBoss}`;
      generatedStory = `Under the blood-tinted arena torches, ${weaverAuthor} stood opposite ${boss?.emoji} ${boss?.id}. Having recorded ${bossKills + 1} career triumph(s) and braved ${bossDeaths} harrowing setback(s), the champion placed total faith in their chosen armory loadout: ${itemsUsed}.\n\nWhen the beast unleashed its ferocious assault, the resonance of the ${firstItem?.emoji} ${firstItem?.id} cut through the fray. With synchronized precision and unyielding nerve, the champion executed the decisive strike. The ${boss?.id} roared in defeat and dissolved into a shower of gold coins and radiant gems, forever etching another legendary victory into the Armory’s battle annals.`;
    } else if (weaverOutcome === 'close-call') {
      generatedTitle = `A Hair's Breadth: The Clash with ${boss?.id || weaverBoss}`;
      generatedStory = `The duel with ${boss?.emoji} ${boss?.id} pushed ${weaverAuthor} to the absolute threshold of mortal endurance. With vital health depleted to mere fractions and the arena walls fracturing, it was the alchemical potency of ${itemsUsed} that prevented total collapse.\n\nDodging lethal shockwaves by mere inches, the champion delivered a desperate counter-blow that turned the tide just as consciousness threatened to fade. Though bloodied and exhausted, ${weaverAuthor} lived to tell the tale and claim the contested bounty.`;
    } else if (weaverOutcome === 'heroic') {
      generatedTitle = `The Heroic Defiance of ${boss?.id || weaverBoss}`;
      generatedStory = `Songs will be sung in the Armory forge of the hour ${weaverAuthor} challenged the mighty ${boss?.emoji} ${boss?.id}. Armed with ${itemsUsed}, the champion fought not merely for coin or pride, but to prove that mortal discipline can rival cosmic tyrants.\n\nEvery parry resonated like thunder through the battle chamber. Even in the face of overwhelming odds, the champion refused to yield, demonstrating the transcendent synergy between mastercraft steel and unbreakable will.`;
    } else {
      generatedTitle = `Bitter Steel: The Reckoning of ${boss?.id || weaverBoss}`;
      generatedStory = `Not all encounters in the Boss Rush arena end in triumph. In this grim record, ${weaverAuthor} stood against ${boss?.emoji} ${boss?.id}. Despite the formidable power of ${itemsUsed}, the beast's raw ferocity found a fatal gap in defenses.\n\nYet defeat in the Armory is merely the whetstone of champions. As the revive spark rekindled the champion’s breath, the lessons of this battle were transcribed into the ledger to forge stronger armor and sharper blades for the inevitable rematch.`;
    }

    setWeaverTitle(generatedTitle);
    setWeaverText(generatedStory);
  };

  // Submit custom story to GameState
  const handleSaveCustomStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weaverTitle.trim() || !weaverText.trim()) return;

    const newStory: CustomStoryEntry = {
      id: `story-${Date.now()}`,
      title: weaverTitle.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      bossId: weaverBoss,
      featuredItems: [...weaverItems],
      outcome: weaverOutcome,
      storyText: weaverText.trim(),
      author: weaverAuthor.trim() || 'Champion'
    };

    setGameState(prev => {
      const existing = prev.customStories || [];
      const next = {
        ...prev,
        customStories: [newStory, ...existing]
      };
      saveState(next);
      return next;
    });

    setWeaverSuccessAlert(`Story "${newStory.title}" permanently bound to the Lore Book!`);
    setTimeout(() => setWeaverSuccessAlert(null), 4000);
    setWeaverTitle('');
    setWeaverText('');
    setChronicleMode('living');
  };

  // Delete custom story
  const handleDeleteCustomStory = (storyId: string) => {
    setGameState(prev => {
      const filtered = (prev.customStories || []).filter(s => s.id !== storyId);
      const next = { ...prev, customStories: filtered };
      saveState(next);
      return next;
    });
  };

  // Stats for Living War Saga
  const totalKills = Object.values(gameState.bossKillStats || {}).reduce((a, b) => a + b, 0);
  const totalDeaths = Object.values(gameState.bossDeathStats || {}).reduce((a, b) => a + b, 0);
  const ownedPowerupCount = gameState.powerups.filter(p => p.owned).length;
  const highestPowerup = gameState.powerups
    .filter(p => p.owned)
    .sort((a, b) => (b.level * 10 + b.quantity * 5) - (a.level * 10 + a.quantity * 5))[0];
  const highestPowerupData = highestPowerup ? POWERUPS.find(p => p.id === highestPowerup.id) : null;

  // Filtered items in compendium
  const filteredPowerups = POWERUPS.filter(p => {
    if (compendiumFilter === 'Weapons') {
      const weaponIds = ['Focus Blade', 'Rage Axe', 'Speed Dagger', 'Shield Breaker', 'Wing Charm', '???.???'];
      if (!weaponIds.includes(p.id)) return false;
    } else if (compendiumFilter === 'Defense') {
      const defIds = ['Magnetite Shield', 'Cloak of Shadows', 'Titan Armor'];
      if (!defIds.includes(p.id)) return false;
    } else if (compendiumFilter === 'Utility') {
      const utilIds = ['Laser Lens', 'Phantom Dust', 'Dragon Scale'];
      if (!utilIds.includes(p.id)) return false;
    } else if (compendiumFilter === 'Mystic') {
      const mysticIds = ['Phoenix Feather', 'Void Orb', 'Star Fragment'];
      if (!mysticIds.includes(p.id)) return false;
    }

    if (compendiumSearch.trim()) {
      const term = compendiumSearch.toLowerCase();
      return p.id.toLowerCase().includes(term) || p.description.toLowerCase().includes(term) || p.rarity.toLowerCase().includes(term);
    }
    return true;
  });

  const activeCompendiumItem = POWERUPS.find(p => p.id === selectedItemDetailId) || POWERUPS[0];
  const activeItemLore = ITEM_LORES.find(l => l.id === activeCompendiumItem.id);
  const activeBossDossier = BOSS_DOSSIERS.find(b => b.id === selectedBossId) || BOSS_DOSSIERS[0];
  const activeBossData = BOSSES.find(b => b.id === selectedBossId) || BOSSES[0];

  return (
    <div className="w-full max-w-full flex-1 flex flex-col bg-linear-to-b from-[#111827] to-[#0a0f1a] border border-[#2a3d5c] rounded-[32px] md:rounded-[48px] p-3.5 sm:p-6 md:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.9),inset_0_0_0_2px_#1f2d4a,inset_0_0_0_3px_#141f33] select-none my-2 md:my-6 relative overflow-visible">
      
      {/* Background radial elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #151f35 0%, #0a0e1a 70%)' }}></div>

      {/* LORE BOOK MAIN HEADER */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-linear-to-br from-[#1a2540] to-[#0f182a] border border-[#2a4060] px-4 sm:px-6 py-3.5 sm:py-4 rounded-[28px] sm:rounded-[60px] shadow-[0_4px_24px_rgba(0,0,0,0.5),inset_0_1px_0_#3a5a80] relative z-10 mb-6 w-full max-w-full gap-3 sm:gap-0">
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-2xl sm:text-3xl">📖</span>
          <div>
            <h2 className="font-mono text-xs sm:text-sm text-[#7ae0ff] uppercase tracking-wider font-bold">
              THE ARMORY LORE BOOK & CHRONICLES
            </h2>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
              SYSTEM LEGEND · ITEM COMPENDIUM · BATTLE SAGAS
            </p>
          </div>
        </div>

        {/* Quick action buttons to jump back into game/shop & download Markdown */}
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleDownloadAllZip}
            disabled={isExportingZip}
            className="text-xs text-amber-300 font-bold uppercase tracking-wider bg-amber-950/40 border border-amber-500/40 px-3.5 py-1.5 rounded-[30px] hover:bg-amber-900/60 hover:border-amber-400 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Download the entire Lore Book and Item Compendium as a zip of Markdown (.md) files"
          >
            <span>{isExportingZip ? '⏳' : '📥'}</span>
            <span>{isExportingZip ? 'Bundling...' : 'Download Markdown Site (.zip)'}</span>
          </button>

          {onNavigateToShop && (
            <button
              onClick={onNavigateToShop}
              className="text-xs text-[#7ae0ff] font-bold uppercase tracking-wider bg-[#141c30] border border-[#2a4060] px-3 py-1.5 rounded-[30px] hover:bg-[#1a2a4c] transition cursor-pointer flex items-center gap-1"
            >
              <span>🏪</span>
              <span>Shop</span>
            </button>
          )}
          {onNavigateToGame && (
            <button
              onClick={() => onNavigateToGame('bosses')}
              className="text-xs text-[#f5e56b] font-bold uppercase tracking-wider bg-[#141c30] border border-[#2a4060] px-3 py-1.5 rounded-[30px] hover:bg-[#1a2a4c] transition cursor-pointer flex items-center gap-1"
            >
              <span>⚔️</span>
              <span>Boss Rush</span>
            </button>
          )}
        </div>
      </header>

      {/* Success Notification Banner */}
      {exportSuccessMsg && (
        <div className="bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between mb-4 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <span>📦</span>
            <span>{exportSuccessMsg}</span>
          </div>
          <button onClick={() => setExportSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-100 text-sm font-bold">×</button>
        </div>
      )}

      {/* TOP NAVIGATION TABS */}
      <div id="lore-nav-tabs" className="flex flex-wrap items-center justify-between gap-2.5 mb-6 relative z-10 w-full border-b border-white/10 pb-4">
        <div className="flex flex-wrap gap-1.5 sm:gap-2 max-w-full">
          <button
            id="lore-tab-compendium"
            onClick={() => handleTabChange('compendium')}
            className={`px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold uppercase transition-all tracking-wider cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'compendium'
                ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.3)] border border-orange-400/30'
                : 'bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10'
            }`}
          >
            <span>⚔️</span>
            <span>Item Compendium</span>
          </button>

          <button
            id="lore-tab-chronicles"
            onClick={() => handleTabChange('chronicles')}
            className={`px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold uppercase transition-all tracking-wider cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'chronicles'
                ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.3)] border border-orange-400/30'
                : 'bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10'
            }`}
          >
            <span>📜</span>
            <span>Battle Chronicles</span>
          </button>

          <button
            id="lore-tab-legend"
            onClick={() => handleTabChange('legend')}
            className={`px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold uppercase transition-all tracking-wider cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'legend'
                ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.3)] border border-orange-400/30'
                : 'bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10'
            }`}
          >
            <span>👑</span>
            <span>The Ancient Legend</span>
          </button>

          <button
            id="lore-tab-bestiary"
            onClick={() => handleTabChange('bestiary')}
            className={`px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold uppercase transition-all tracking-wider cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'bestiary'
                ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.3)] border border-orange-400/30'
                : 'bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10'
            }`}
          >
            <span>👹</span>
            <span>Boss Bestiary</span>
          </button>
        </div>

        <span className="text-xs font-mono text-slate-400 uppercase tracking-widest self-start sm:self-auto">
          TOME ARCHIVE VOL. IV
        </span>
      </div>

      {/* ============================================================ */}
      {/* SECTION 1: BATTLE CHRONICLES & STORY WEAVER                   */}
      {/* ============================================================ */}
      {activeTab === 'chronicles' && (
        <div className="space-y-6 w-full">
          
          {/* Sub-mode switches: Canonical Saga vs Living War Saga vs Chronicler's Quill */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0e1628] border border-[#1a2540] p-3 rounded-2xl">
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
                onClick={() => setChronicleMode('weaver')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                  chronicleMode === 'weaver'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <span>✍️</span>
                <span>Chronicler's Quill (Write Story)</span>
              </button>
            </div>

            <div className="text-xs font-mono text-slate-400">
              {chronicleMode === 'canonical' && '7 Canonical Chapters connecting gear to boss triumphs'}
              {chronicleMode === 'living' && 'Dynamic chronicles compiled from your active game state'}
              {chronicleMode === 'weaver' && 'Compose & preserve stories connecting your loadout to battle feats'}
            </div>
          </div>

          {/* Success Banner */}
          {weaverSuccessAlert && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
              <span>✨ {weaverSuccessAlert}</span>
              <button onClick={() => setWeaverSuccessAlert(null)} className="text-emerald-400 hover:text-white text-xs font-bold cursor-pointer">✕</button>
            </div>
          )}

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

          {/* MODE B: THE LIVING WAR SAGA (DYNAMIC TO PLAYER'S ACTIVE GAMESTATE) */}
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

                {/* Dynamic Generated Narrative Prose connecting items to records */}
                <div className="bg-black/30 border border-white/5 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3 font-sans">
                  <p>
                    <span className="font-bold text-white">The Scribe’s Current Record:</span> In the ongoing records of the Armory, Champion <span className="text-[#7ae0ff] font-bold">{gameState.playerName || 'Hero'}</span> commands an arsenal of <span className="text-[#f5e56b] font-bold">{ownedPowerupCount} unique item licenses</span>.
                    {highestPowerupData ? (
                      <span> Most celebrated among their armaments is the <span className="text-amber-400 font-bold">{highestPowerupData.emoji} {highestPowerupData.id}</span> (Level {highestPowerup?.level}, x{highestPowerup?.quantity} copies), generating reliable passive income and crushing enemy ranks.</span>
                    ) : (
                      <span> The champion’s armory is currently beginning its first industrial expansions.</span>
                    )}
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

              {/* Boss Record Breakdown with Lore Commentary */}
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
                    onClick={() => setChronicleMode('weaver')}
                    className="text-xs font-bold uppercase tracking-wider bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    + Weave New Tale
                  </button>
                </div>

                {(!gameState.customStories || gameState.customStories.length === 0) ? (
                  <div className="text-center py-8 text-slate-400 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-sm font-bold text-slate-300 mb-1">No custom battle stories written yet</p>
                    <p className="text-xs max-w-md mx-auto mb-3">
                      Use the Chronicler's Quill to build out custom chronicles celebrating epic duels, narrow victories, or heroic defeats using your gear!
                    </p>
                    <button
                      onClick={() => setChronicleMode('weaver')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
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
                            onClick={() => handleDeleteCustomStory(story.id)}
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

          {/* MODE C: CHRONICLER'S QUILL (STORY BUILDER & WEAVER) */}
          {chronicleMode === 'weaver' && (
            <div className="bg-[#0e1628] border border-[#1a2540] rounded-3xl p-5 sm:p-7">
              <div className="border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-widest mb-1">
                  <span>✍️ THE CHRONICLER'S QUILL</span>
                  <span className="bg-white/5 text-slate-400 px-2 py-0.5 rounded text-xs">Story Studio</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">Weave a Battle Tale</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Connect your real armory equipment with your battle record. Auto-draft an evocative chronicle or handwrite custom lore to bind permanently to the Tome.
                </p>
              </div>

              <form onSubmit={handleSaveCustomStory} className="space-y-5">
                {/* 1. Pick Adversary from Boss Records */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider font-bold mb-2">
                    1. Select Target Adversary from Battle Records
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {BOSSES.map(boss => (
                      <button
                        type="button"
                        key={boss.id}
                        onClick={() => setWeaverBoss(boss.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                          weaverBoss === boss.id
                            ? 'bg-orange-600/20 border-orange-500 text-white'
                            : 'bg-[#141c30] border-[#2a4060]/40 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <span className="text-xl">{boss.emoji}</span>
                        <div className="truncate">
                          <div className="text-xs font-bold truncate">{boss.id}</div>
                          <div className="text-xs font-mono text-slate-400">{gameState.bossKillStats?.[boss.id] || 0} Kills Recorded</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Choose Key Armaments from Armory */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider font-bold mb-1">
                    2. Choose Key Armaments Used in Combat (Up to 4)
                  </label>
                  <p className="text-xs text-slate-400 mb-2">Click to toggle gear active in this battle chronicle.</p>
                  <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {POWERUPS.map(item => {
                      const isSelected = weaverItems.includes(item.id);
                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => toggleWeaverItem(item.id)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600/30 border-blue-400 text-white'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>{item.emoji}</span>
                          <span>{item.id}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Outcome & Author */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider font-bold mb-1.5">
                      3. Combat Encounter Outcome
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['victory', 'close-call', 'heroic', 'defeat'] as const).map(out => (
                        <button
                          type="button"
                          key={out}
                          onClick={() => setWeaverOutcome(out)}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                            weaverOutcome === out
                              ? 'bg-amber-600 text-white border-amber-400'
                              : 'bg-[#141c30] border-[#2a4060]/40 text-slate-400'
                          }`}
                        >
                          {out}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider font-bold mb-1.5">
                      Chronicler / Champion Name
                    </label>
                    <input
                      type="text"
                      value={weaverAuthor}
                      onChange={e => setWeaverAuthor(e.target.value)}
                      placeholder="Your Name..."
                      className="w-full bg-[#141c30] border border-[#2a4060] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Auto-Draft Button */}
                <div className="flex items-center justify-between bg-black/20 p-3 rounded-2xl border border-white/5">
                  <div>
                    <span className="text-xs font-bold text-amber-300 block">Need inspiration?</span>
                    <span className="text-xs text-slate-400">Auto-draft a narrative chronicle connecting your selected gear to the boss record.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoWeave}
                    className="px-4 py-2 bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md"
                  >
                    ✨ Auto-Weave Story Draft
                  </button>
                </div>

                {/* Title & Story Textarea */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider font-bold mb-1.5">
                    Chronicle Chapter Title
                  </label>
                  <input
                    type="text"
                    required
                    value={weaverTitle}
                    onChange={e => setWeaverTitle(e.target.value)}
                    placeholder="e.g. The Shattered Fang of the Void Serpent..."
                    className="w-full bg-[#141c30] border border-[#2a4060] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider font-bold mb-1.5">
                    Chronicle Narrative Prose
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={weaverText}
                    onChange={e => setWeaverText(e.target.value)}
                    placeholder="Write the lore of how the battle unfolded, detailing how the weapons, shields, and relics countered the adversary's power..."
                    className="w-full bg-[#141c30] border border-[#2a4060] rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 leading-relaxed font-sans"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setWeaverTitle('');
                      setWeaverText('');
                    }}
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                  >
                    📖 Bind Story to Lore Book
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 2: SYSTEM LEGEND & TYCOON KEY                         */}
      {/* ============================================================ */}
      {activeTab === 'legend' && (
        <div className="space-y-6 w-full">
          {/* Legend Banner */}
          <div className="bg-[#0e1628] border border-[#1a2540] rounded-3xl p-5 sm:p-7">
            <div className="border-b border-white/10 pb-3 mb-5">
              <span className="text-xs font-mono text-[#7ae0ff] uppercase tracking-widest font-bold block mb-1">
                SYSTEM CODEX & ECONOMIC ARCHITECTURE
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">The Armory & Tycoon Legend</h3>
              <p className="text-xs text-slate-300 mt-1">
                A complete key explaining currencies, mathematical yield formulas, alchemical reagent packaging, and combat ratings.
              </p>
            </div>

            {/* CURRENCIES KEY */}
            <div className="mb-8">
              <h4 className="text-xs font-mono text-[#f5e56b] uppercase tracking-wider font-bold mb-3 flex items-center gap-1.5">
                <span>💰</span>
                <span>CURRENCY TRIAD & FLOW</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SYSTEM_LEGEND.currencies.map(cur => (
                  <div key={cur.name} className="bg-[#141c30] border border-[#2a4060]/40 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <h5 className="font-extrabold text-sm text-white mb-1">{cur.name}</h5>
                      <span className="text-xs font-mono text-[#7ae0ff] uppercase tracking-wider block mb-2">{cur.role}</span>
                      
                      <div className="space-y-2 text-xs text-slate-300">
                        <div>
                          <span className="text-slate-400 font-bold block text-xs uppercase">✦ Sources:</span>
                          <p className="leading-snug">{cur.sources}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block text-xs uppercase">✦ Utility:</span>
                          <p className="leading-snug">{cur.uses}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TYCOON MATHEMATICAL FORMULAS */}
            <div className="mb-8">
              <h4 className="text-xs font-mono text-[#6affaa] uppercase tracking-wider font-bold mb-3 flex items-center gap-1.5">
                <span>📈</span>
                <span>TYCOON FORMULAS & COMBAT MECHANICS</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SYSTEM_LEGEND.tycoonFormulas.map(form => (
                  <div key={form.label} className="bg-[#141c30] border border-[#2a4060]/40 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <h5 className="font-extrabold text-xs text-white uppercase tracking-wider mb-2">{form.label}</h5>
                      <div className="bg-black/50 p-2.5 rounded-xl border border-white/5 font-mono text-xs text-[#f5e56b] mb-2.5">
                        {form.formula}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {form.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PACK NOMENCLATURE & REAGENT PACKAGING KEY */}
            <div>
              <h4 className="text-xs font-mono text-[#cb9df2] uppercase tracking-wider font-bold mb-3 flex items-center gap-1.5">
                <span>📦</span>
                <span>ALCHEMICAL PACK SIZING & NOMENCLATURE KEY</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {SYSTEM_LEGEND.packNomenclature.map(pack => (
                  <div key={pack.term} className="bg-[#141c30] border border-[#2a4060]/40 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-white">{pack.term}</span>
                      <span className="text-xs font-mono text-[#7ae0ff] bg-black/40 px-2 py-0.5 rounded">{pack.volume}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {pack.lore}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 3: ITEM COMPENDIUM (16 POWERUPS)                     */}
      {/* ============================================================ */}
      {activeTab === 'compendium' && (
        <div className="space-y-6 w-full">

          {/* VEILED LEDGER PREAMBLE BANNER */}
          <div className="bg-linear-to-r from-[#141d33] via-[#10182a] to-[#0c1220] border border-[#2a4060] rounded-3xl p-5 sm:p-6 shadow-lg relative overflow-hidden">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3 mb-3">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold block">
                  THE VEILED LEDGER OF THE BAZAAR
                </span>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>📜</span>
                  <span>{VEILED_LEDGER_PREAMBLE.title}</span>
                </h3>
              </div>
              <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-full shrink-0">
                16 ARTIFACTS RECORDED
              </span>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed italic">
              {VEILED_LEDGER_PREAMBLE.paragraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0e1628] border border-[#1a2540] p-3.5 rounded-2xl">
            <div className="flex flex-wrap gap-1.5">
              {(['All', 'Weapons', 'Defense', 'Utility', 'Mystic'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCompendiumFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                    compendiumFilter === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleDownloadAllZip}
                disabled={isExportingZip}
                className="text-xs font-bold text-amber-300 bg-amber-950/40 border border-amber-500/40 hover:bg-amber-900/60 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0"
                title="Download all items and lore documents as a Markdown zip"
              >
                <span>📥</span>
                <span>Export Markdown Site</span>
              </button>

              <input
                type="text"
                value={compendiumSearch}
                onChange={e => setCompendiumSearch(e.target.value)}
                placeholder="Search by name, stat, or rarity..."
                className="bg-[#141c30] border border-[#2a4060] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7ae0ff] w-full sm:w-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Items selector grid (FOCUSED TARGETS) */}
            <div className="lg:col-span-5 flex flex-col min-h-[500px] max-h-[850px] lg:max-h-[950px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto pr-1 flex-1 content-start">
              {filteredPowerups.map(item => {
                const isSelected = item.id === activeCompendiumItem.id;
                const ownedState = gameState.powerups.find(p => p.id === item.id);
                const loreEntry = ITEM_LORES.find(l => l.id === item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItemDetailId(item.id)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-linear-to-b from-[#1a2540] to-[#121c33] border-[#7ae0ff] shadow-md shadow-cyan-500/10'
                        : 'bg-[#0e1628] border-[#1a2540] hover:border-[#2a4060] text-slate-300'
                    }`}
                  >
                    {/* FOCUSED CSS SELECTOR 3 TARGET: Rarity Header */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl">{item.emoji}</span>
                      <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded" style={{
                        backgroundColor: {
                          'Common': '#3a4a60',
                          'Uncommon': '#2a503a',
                          'Rare': '#20406a',
                          'Epic': '#4a206a',
                          'Legendary': '#6a4010',
                          'Mythic': '#6a1030',
                          '??': '#2a2a30'
                        }[item.rarity] || '#2a3a50',
                        color: '#d0e0ff'
                      }}>
                        {item.rarity}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-white truncate">{item.id}</div>
                    
                    {/* FOCUSED CSS SELECTOR 1 TARGET: Vendor Name */}
                    {loreEntry?.vendorName && (
                      <div className="text-xs text-amber-300/90 italic truncate mt-0.5 font-serif">
                        {loreEntry.vendorName}
                      </div>
                    )}
                    
                    {/* FOCUSED CSS SELECTOR 2 TARGET: Owned / Unowned Status */}
                    <div className="text-xs text-slate-400 font-mono mt-1">
                      {ownedState?.owned ? `x${ownedState.quantity} Owned (Lv.${ownedState.level})` : '🔒 Not Yet Owned'}
                    </div>
                  </button>
                );
              })}
              </div>
            </div>

            {/* Selected Item Lore Codex Card */}
            <div className="lg:col-span-7 bg-[#0e1628] border border-[#1a2540] rounded-3xl p-5 sm:p-7 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-white/10 pb-4 gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-4xl sm:text-5xl shrink-0 mt-1">{activeCompendiumItem.emoji}</span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-orange-400 uppercase tracking-widest font-bold">
                        {activeCompendiumItem.rarity} TIER ARTIFACT
                      </span>
                      {activeItemLore?.vendorName && (
                        <span className="text-xs font-mono text-amber-300 bg-amber-950/50 border border-amber-500/30 px-2 py-0.5 rounded-md">
                          Vendor: {activeItemLore.vendorName}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">{activeCompendiumItem.id}</h3>
                    <p className="text-sm text-slate-300 italic">"{activeCompendiumItem.description}"</p>
                  </div>
                </div>

                <div className="flex items-center sm:flex-col sm:items-end gap-2 shrink-0">
                  <span className="text-xs sm:text-sm font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-3 py-1 rounded-xl whitespace-nowrap">
                    +{activeCompendiumItem.baseRate}/s Gold
                  </span>
                  <button
                    onClick={() => downloadSingleItemMarkdown(activeCompendiumItem, activeItemLore)}
                    className="text-xs font-bold text-[#7ae0ff] bg-[#141c30] border border-[#2a4060] hover:bg-[#1a2a4c] hover:border-[#7ae0ff] px-2.5 py-1 rounded-xl transition cursor-pointer flex items-center gap-1"
                    title={`Download ${activeCompendiumItem.id} as a Markdown (.md) file`}
                  >
                    <span>📥</span>
                    <span>Download .md</span>
                  </button>
                </div>
              </div>

              {/* Combat Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#141c30] p-3 rounded-xl border border-[#2a4060]/40 text-center">
                  <span className="text-xs uppercase font-bold text-slate-300 block">⚔️ Attack</span>
                  <span className="font-mono text-sm sm:text-base text-[#f5e56b] font-bold">+{activeCompendiumItem.attack}</span>
                </div>
                <div className="bg-[#141c30] p-3 rounded-xl border border-[#2a4060]/40 text-center">
                  <span className="text-xs uppercase font-bold text-slate-300 block">🛡️ Defense</span>
                  <span className="font-mono text-sm sm:text-base text-[#7ae0ff] font-bold">+{activeCompendiumItem.defense}</span>
                </div>
                <div className="bg-[#141c30] p-3 rounded-xl border border-[#2a4060]/40 text-center">
                  <span className="text-xs uppercase font-bold text-slate-300 block">💨 Speed</span>
                  <span className="font-mono text-sm sm:text-base text-[#cb9df2] font-bold">+{activeCompendiumItem.speed}</span>
                </div>
              </div>

              {/* In-Game Effect & Passive */}
              <div className="bg-[#141c30] p-4 rounded-2xl border border-white/5 space-y-2 text-xs sm:text-sm">
                {activeItemLore?.inGameEffect && (
                  <div>
                    <span className="text-cyan-400 font-bold">🎮 In-Game Effect:</span>{' '}
                    <span className="text-white font-medium">{activeItemLore.inGameEffect}</span>
                  </div>
                )}
                <div><span className="text-amber-400 font-bold">✨ Passive Aura:</span> <span className="text-slate-200">{activeCompendiumItem.effect}</span></div>
                {activeCompendiumItem.special && (
                  <div className="text-xs sm:text-sm text-slate-100 leading-relaxed">
                    <span className="text-[#7ae0ff] font-bold">⚡ Active Technique:</span> <span className="text-slate-200">{activeCompendiumItem.special}</span>
                  </div>
                )}
              </div>

              {/* Deep Lore Section */}
              {activeItemLore && (
                <div className="space-y-4 border-t border-white/10 pt-5 text-sm">
                  {/* The Veiled Ledger Mythos */}
                  <div>
                    <h5 className="font-mono text-xs text-amber-300 uppercase tracking-widest font-bold mb-1.5 flex items-center gap-1.5">
                      <span>📜</span>
                      <span>THE VEILED LEDGER MYTHOS</span>
                    </h5>
                    <p className="text-sm sm:text-base text-slate-200 leading-relaxed">{activeItemLore.mythos}</p>
                  </div>

                  {/* Vendor Voice Quote */}
                  {activeItemLore.vendorQuote && (
                    <div className="bg-amber-950/20 border-l-2 border-amber-400 p-3.5 rounded-r-2xl">
                      <h6 className="font-mono text-xs text-amber-300/90 uppercase tracking-widest font-bold mb-1">
                        💬 VENDOR VOICE (THE OLD TONGUE)
                      </h6>
                      <p className="text-xs sm:text-sm text-amber-100 italic leading-relaxed">
                        "{activeItemLore.vendorQuote}"
                      </p>
                    </div>
                  )}

                  {/* Deliverable Echo / Essence */}
                  {activeItemLore.deliverableEcho && (
                    <div className="bg-cyan-950/20 border-l-2 border-cyan-400 p-3.5 rounded-r-2xl">
                      <h6 className="font-mono text-xs text-cyan-300/90 uppercase tracking-widest font-bold mb-1">
                        🔮 NATURE OF THE DELIVERABLE (ECHO)
                      </h6>
                      <p className="text-xs sm:text-sm text-cyan-100 leading-relaxed">
                        {activeItemLore.deliverableEcho}
                      </p>
                    </div>
                  )}

                  <div>
                    <h5 className="font-mono text-xs text-slate-300 uppercase tracking-widest font-bold mb-1.5">
                      🔨 FORGING & REAGENT RECORD
                    </h5>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{activeItemLore.forgingRecord}</p>
                  </div>

                  <div className="bg-red-950/30 border border-red-500/20 rounded-2xl p-4">
                    <h5 className="font-mono text-xs text-red-300 uppercase tracking-widest font-bold mb-1.5">
                      🎯 BOSS COUNTER ROLE: {activeItemLore.bossCounter.targetBoss}
                    </h5>
                    <p className="text-xs sm:text-sm text-red-100 leading-relaxed">{activeItemLore.bossCounter.whyItWorks}</p>
                  </div>

                  <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4">
                    <h5 className="font-mono text-xs text-emerald-300 uppercase tracking-widest font-bold mb-1.5">
                      💰 TYCOON ECONOMIC PHILOSOPHY
                    </h5>
                    <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">{activeItemLore.tycoonPhilosophy}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Guide on updating text in the codebase */}
          <div className="bg-[#0b1222] border border-[#1e2d4d] rounded-2xl p-4 sm:p-5 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <span>💡</span>
              <span>Developer Reference: Updating In-Game Item Texts & Lore</span>
            </div>
            <p className="leading-relaxed">
              When updating the text in these Markdown files or directly within the codebase:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="bg-[#141c30] p-3 rounded-xl border border-white/5">
                <span className="font-mono text-amber-300 font-bold block mb-1">📁 Stats & Store Pricing</span>
                <p className="text-xs text-slate-400">
                  Edit <code className="text-white bg-black/40 px-1 py-0.5 rounded">src/data.ts</code> in the <code className="text-cyan-300">POWERUPS</code> array to modify attack, defense, speed, pricing tiers, and base gold yield.
                </p>
              </div>
              <div className="bg-[#141c30] p-3 rounded-xl border border-white/5">
                <span className="font-mono text-emerald-300 font-bold block mb-1">📁 Lore, Mythos & Boss Counters</span>
                <p className="text-xs text-slate-400">
                  Edit <code className="text-white bg-black/40 px-1 py-0.5 rounded">src/loreData.ts</code> in the <code className="text-cyan-300">ITEM_LORES</code> array to modify ancient mythos, forging logs, and boss tactical counters.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 4: BOSS BESTIARY & THREAT DOSSIERS                   */}
      {/* ============================================================ */}
      {activeTab === 'bestiary' && (
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
      )}

    </div>
  );
}
