import React, { useState, useEffect } from 'react';
import { GameState } from '../types';
import { downloadLoreBookZip } from '../utils/markdownExporter';

// Import newly decomposed modular tab components
import { ChroniclesTab } from './lore/ChroniclesTab';
import { StoryWeaverTab } from './lore/StoryWeaverTab';
import { ItemCompendiumTab } from './lore/ItemCompendiumTab';
import { BossBestiaryTab } from './lore/BossBestiaryTab';
import { AncientLegendTab } from './lore/AncientLegendTab';

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
  onNavigateToGame,
  controlledTab,
  onTabChange
}: LoreBookViewProps) {
  // Primary Navigation tabs
  const [activeTab, setActiveTab] = useState<'chronicles' | 'legend' | 'compendium' | 'bestiary'>(controlledTab || 'compendium');
  const [subMode, setSubMode] = useState<'view' | 'weaver'>('view');
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (controlledTab) {
      setActiveTab(controlledTab);
      setSubMode('view');
    }
  }, [controlledTab]);

  const handleTabChange = (tab: 'chronicles' | 'legend' | 'compendium' | 'bestiary') => {
    setActiveTab(tab);
    setSubMode('view');
    onTabChange?.(tab);
  };

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

  const handleDeleteStory = (storyId: string) => {
    setGameState(prev => {
      const filtered = (prev.customStories || []).filter(s => s.id !== storyId);
      const next = { ...prev, customStories: filtered };
      try {
        localStorage.setItem('bossRushTycoon', JSON.stringify(next));
      } catch (e) {
        console.warn('LocalStorage write failed:', e);
      }
      return next;
    });
  };

  const triggerStorySuccessToast = (title: string) => {
    setSuccessToast(`Story "${title}" permanently bound to the Lore Book!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

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

        {/* Quick action buttons to jump back into game/shop */}
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          {onNavigateToGame && (
            <button
              onClick={() => onNavigateToGame('tycoon')}
              className="text-xs text-[#7ae0ff] font-bold uppercase tracking-wider bg-[#141c30] border border-[#2a4060] px-3 py-1.5 rounded-[30px] hover:bg-[#1a2a4c] transition cursor-pointer flex items-center gap-1"
              title="Navigate to Tycoon upgrades and mining"
            >
              <span>🏪</span>
              <span>Tycoon Shop</span>
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

      {/* Success Notification Banners */}
      {exportSuccessMsg && (
        <div className="bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between mb-4 shadow-lg animate-fade-in relative z-20">
          <div className="flex items-center gap-2">
            <span>📦</span>
            <span>{exportSuccessMsg}</span>
          </div>
          <button onClick={() => setExportSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-100 text-sm font-bold">×</button>
        </div>
      )}

      {successToast && (
        <div className="bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between mb-4 shadow-lg animate-fade-in relative z-20">
          <div className="flex items-center gap-2">
            <span>✨</span>
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-emerald-100 text-sm font-bold">×</button>
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

      {/* CORE ACTIVE TABS ELEMENT MATRIX */}
      <div className="relative z-10 flex-1 flex flex-col w-full">
        {activeTab === 'compendium' && (
          <ItemCompendiumTab
            gameState={gameState}
            isExportingZip={isExportingZip}
            onDownloadAllZip={handleDownloadAllZip}
          />
        )}

        {activeTab === 'chronicles' && subMode === 'view' && (
          <ChroniclesTab
            gameState={gameState}
            setGameState={setGameState}
            onOpenWeaver={() => setSubMode('weaver')}
            onDeleteStory={handleDeleteStory}
          />
        )}

        {activeTab === 'chronicles' && subMode === 'weaver' && (
          <StoryWeaverTab
            gameState={gameState}
            setGameState={setGameState}
            onSaveSuccess={triggerStorySuccessToast}
            onBackToLiving={() => setSubMode('view')}
          />
        )}

        {activeTab === 'legend' && (
          <AncientLegendTab />
        )}

        {activeTab === 'bestiary' && (
          <BossBestiaryTab gameState={gameState} />
        )}
      </div>

    </div>
  );
}
