import React, { useState, useEffect } from 'react';
import { GameState } from '../types';
import { downloadLoreBookZip } from '../utils/markdownExporter';
import { trackPageView, trackEvent } from '../lib/analytics';
import { triggerParticleBurst } from './common/ParticleFX';

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
  initialChronicleMode?: 'canonical' | 'living' | 'writer';
}

const ALL_LORE_PAGES = ['compendium', 'chronicles', 'bestiary', 'legend'];

export default function LoreBookView({
  gameState,
  setGameState,
  onNavigateToShop,
  onNavigateToGame,
  controlledTab,
  onTabChange,
  initialChronicleMode
}: LoreBookViewProps) {
  // Primary Navigation tabs
  const [activeTab, setActiveTab] = useState<'chronicles' | 'legend' | 'compendium' | 'bestiary'>(controlledTab || 'compendium');
  const [subMode, setSubMode] = useState<'view' | 'weaver'>('view');
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Sync controlled tab & chronicle submode
  useEffect(() => {
    if (controlledTab) {
      setActiveTab(controlledTab);
      if (controlledTab === 'chronicles') {
        if (initialChronicleMode === 'writer') {
          setSubMode('weaver');
        } else {
          setSubMode('view');
        }
      } else {
        setSubMode('view');
      }
    } else if (initialChronicleMode === 'writer') {
      setActiveTab('chronicles');
      setSubMode('weaver');
    }
  }, [controlledTab, initialChronicleMode]);

  // --- LORE BOOK REWARDS & TELEMETRY ENGINE ---
  useEffect(() => {
    trackEvent('lore_book_opened', { initial_tab: typeof activeTab === 'string' ? activeTab : 'compendium' });

    setGameState(prev => {
      const rewardsState = prev.loreBookRewards || { firstOpenClaimed: false, pagesCompleted: [], loreMasterClaimed: false };
      let coinsToAdd = 0;
      let gemsToAdd = 0;
      let isUpdated = false;
      let logMsg = '';

      // 1. First Time Lore Scholar Bonus (+200 Coins, +10 Gems)
      let firstClaimed = rewardsState.firstOpenClaimed;
      if (!firstClaimed) {
        firstClaimed = true;
        coinsToAdd += 200;
        gemsToAdd += 10;
        isUpdated = true;
        logMsg = '📖 First-Time Lore Scholar Bonus Claimed! Received +200 Coins & +10 Gems!';
        trackEvent('lore_first_open_reward_claimed', { reward_coins: 200, reward_gems: 10 });
      }

      // 2. Per-Page Completion Bonus (+100 Coins, +5 Gems per page)
      const currentPages = new Set(rewardsState.pagesCompleted || []);
      const tabStr = typeof activeTab === 'string' ? activeTab : 'compendium';
      if (!currentPages.has(tabStr)) {
        currentPages.add(tabStr);
        coinsToAdd += 100;
        gemsToAdd += 5;
        isUpdated = true;
        logMsg = logMsg 
          ? `${logMsg} | 📜 Lore Page Explored (${tabStr.toUpperCase()}): +100 Coins & +5 Gems!` 
          : `📜 Lore Page Explored (${tabStr.toUpperCase()})! Received +100 Coins & +5 Gems!`;
        trackEvent('lore_page_completed', { 
          page_id: tabStr, 
          reward_coins: 100, 
          reward_gems: 5, 
          total_pages_completed: currentPages.size 
        });
      }

      // 3. Grand Lore Master Bonus (+1,000 Coins, +50 Gems when all 4 pages are completed)
      let grandClaimed = rewardsState.loreMasterClaimed;
      const pagesCompletedArr = Array.from(currentPages);
      const hasCompletedAll = ALL_LORE_PAGES.every(p => currentPages.has(p));

      if (hasCompletedAll && !grandClaimed) {
        grandClaimed = true;
        coinsToAdd += 1000;
        gemsToAdd += 50;
        isUpdated = true;
        logMsg = `👑 LORE MASTER GRAND BONUS UNLOCKED! Earned +1,000 Coins & +50 Gems for mastering the entire Lore Book!`;
        trackEvent('lore_book_completed', { 
          reward_coins: 1000, 
          reward_gems: 50, 
          all_pages: pagesCompletedArr 
        });
      }

      if (!isUpdated) return prev;

      setSuccessToast(logMsg);
      setTimeout(() => setSuccessToast(null), 5000);
      triggerParticleBurst('purchase');

      const next: GameState = {
        ...prev,
        coins: prev.coins + coinsToAdd,
        gems: (prev.gems || 0) + gemsToAdd,
        loreBookRewards: {
          firstOpenClaimed: firstClaimed,
          pagesCompleted: pagesCompletedArr,
          loreMasterClaimed: grandClaimed
        },
        battleLog: [
          { message: `📖 ${logMsg}`, className: 'log-reward' },
          ...prev.battleLog
        ]
      };

      try {
        localStorage.setItem('bossRushTycoon', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save lore rewards to localStorage:', e);
      }

      return next;
    });
  }, [activeTab]);

  const handleTabChange = (tab: 'chronicles' | 'legend' | 'compendium' | 'bestiary') => {
    setActiveTab(tab);
    setSubMode('view');
    onTabChange?.(tab);
    trackPageView(`Lore Book - ${tab}`, `/lore/${tab}`);
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

      {/* TOP NAVIGATION TABS - 3D TOME BOOK & ANCIENT SCROLLS CODEX */}
      <div id="lore-nav-tabs" className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10 w-full border-b border-amber-500/20 pb-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 max-w-full p-1.5 bg-gradient-to-r from-[#1a1107]/95 via-[#27170a]/95 to-[#1a1107]/95 border border-amber-500/40 rounded-2xl sm:rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(251,191,36,0.3)] backdrop-blur-md">
          <button
            id="lore-tab-compendium"
            onClick={() => handleTabChange('compendium')}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-black uppercase transition-all tracking-wider cursor-pointer flex items-center gap-1.5 select-none shadow-md ${
              activeTab === 'compendium'
                ? 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 text-amber-50 shadow-[0_0_20px_rgba(217,119,6,0.5)] border-2 border-amber-300 ring-2 ring-amber-500/30'
                : 'bg-[#140d06] text-amber-200/80 hover:text-white border border-amber-500/20 hover:border-amber-400/50'
            }`}
          >
            <span className="text-sm">📖</span>
            <span>3D Tome (Relics)</span>
            <span className="text-[9px] font-mono font-bold bg-amber-950/80 text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-500/30">
              {gameState.powerups.filter(p => p.owned && p.quantity > 0).length}/16
            </span>
          </button>

          <button
            id="lore-tab-chronicles"
            onClick={() => {
              handleTabChange('chronicles');
              setSubMode('view');
            }}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-black uppercase transition-all tracking-wider cursor-pointer flex items-center gap-1.5 select-none shadow-md ${
              activeTab === 'chronicles' && subMode === 'view'
                ? 'bg-gradient-to-r from-yellow-700 via-amber-700 to-yellow-800 text-yellow-100 shadow-[0_0_20px_rgba(180,83,9,0.5)] border-2 border-yellow-400 ring-2 ring-yellow-500/30'
                : 'bg-[#140d06] text-yellow-200/80 hover:text-white border border-yellow-500/20 hover:border-yellow-400/50'
            }`}
          >
            <span className="text-sm">📜</span>
            <span>Ancient Scrolls</span>
            <span className="text-[9px] font-mono font-bold bg-yellow-950/80 text-yellow-300 px-1.5 py-0.2 rounded-full border border-yellow-500/30">
              Ch. 1-8
            </span>
          </button>

          <button
            id="lore-tab-weaver"
            onClick={() => {
              handleTabChange('chronicles');
              setSubMode('weaver');
            }}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-black uppercase transition-all tracking-wider cursor-pointer flex items-center gap-1.5 select-none shadow-md ${
              activeTab === 'chronicles' && subMode === 'weaver'
                ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-amber-50 shadow-[0_0_20px_rgba(245,158,11,0.5)] border-2 border-amber-300 ring-2 ring-amber-500/30'
                : 'bg-[#140d06] text-amber-200/80 hover:text-white border border-amber-500/20 hover:border-amber-400/50'
            }`}
          >
            <span className="text-sm">✍️</span>
            <span>Chronicler's Quill</span>
            <span className="text-[9px] font-mono font-bold bg-amber-950/80 text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-500/30">
              Editor
            </span>
          </button>

          <button
            id="lore-tab-bestiary"
            onClick={() => handleTabChange('bestiary')}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-black uppercase transition-all tracking-wider cursor-pointer flex items-center gap-1.5 select-none shadow-md ${
              activeTab === 'bestiary'
                ? 'bg-gradient-to-r from-red-800 via-rose-700 to-red-900 text-red-50 shadow-[0_0_20px_rgba(225,29,72,0.5)] border-2 border-red-400 ring-2 ring-red-500/30'
                : 'bg-[#140d06] text-rose-200/80 hover:text-white border border-red-500/20 hover:border-red-400/50'
            }`}
          >
            <span className="text-sm">👾</span>
            <span>Boss Bestiary</span>
            <span className="text-[9px] font-mono font-bold bg-red-950/80 text-rose-300 px-1.5 py-0.2 rounded-full border border-red-500/30">
              {Object.keys(gameState.bossKillStats || {}).length}/10 Slain
            </span>
          </button>

          <button
            id="lore-tab-legend"
            onClick={() => handleTabChange('legend')}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-black uppercase transition-all tracking-wider cursor-pointer flex items-center gap-1.5 select-none shadow-md ${
              activeTab === 'legend'
                ? 'bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-indigo-50 shadow-[0_0_20px_rgba(99,102,241,0.5)] border-2 border-indigo-400 ring-2 ring-indigo-500/30'
                : 'bg-[#140d06] text-indigo-200/80 hover:text-white border border-indigo-500/20 hover:border-indigo-400/50'
            }`}
          >
            <span className="text-sm">🏛️</span>
            <span>Systems Codex</span>
          </button>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-mono text-amber-400/80 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/20">
          <span>✨</span>
          <span>TOME ARCHIVE VOL. IV</span>
        </div>
      </div>

      {/* CORE ACTIVE TABS ELEMENT MATRIX */}
      <div className="relative z-10 flex-1 flex flex-col w-full">
        {activeTab === 'compendium' && (
          <ItemCompendiumTab
            gameState={gameState}
            isExportingZip={isExportingZip}
            onDownloadAllZip={handleDownloadAllZip}
            onNavigateToShop={onNavigateToShop}
            onNavigateToBosses={() => onNavigateToGame?.('bosses')}
          />
        )}

        {activeTab === 'chronicles' && subMode === 'view' && (
          <ChroniclesTab
            gameState={gameState}
            setGameState={setGameState}
            onOpenWeaver={() => setSubMode('weaver')}
            onDeleteStory={handleDeleteStory}
            initialMode={initialChronicleMode === 'living' ? 'living' : 'canonical'}
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
          <BossBestiaryTab 
            gameState={gameState} 
            onChallengeBoss={() => onNavigateToGame?.('bosses')}
          />
        )}
      </div>

    </div>
  );
}
