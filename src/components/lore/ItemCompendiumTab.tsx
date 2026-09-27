import React, { useState } from 'react';
import { GameState } from '../../types';
import { POWERUPS } from '../../data';
import { ITEM_LORES, VEILED_LEDGER_PREAMBLE } from '../../loreData';
import { downloadSingleItemMarkdown } from '../../utils/markdownExporter';

interface ItemCompendiumTabProps {
  gameState: GameState;
  isExportingZip: boolean;
  onDownloadAllZip: () => void;
}

export const ItemCompendiumTab: React.FC<ItemCompendiumTabProps> = ({
  gameState,
  isExportingZip,
  onDownloadAllZip
}) => {
  const [compendiumFilter, setCompendiumFilter] = useState<'All' | 'Weapons' | 'Defense' | 'Utility' | 'Mystic'>('All');
  const [compendiumSearch, setCompendiumSearch] = useState('');
  const [selectedItemDetailId, setSelectedItemDetailId] = useState<string>(POWERUPS[0].id);

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

  return (
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
        {/* Items selector grid */}
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
                  
                  {loreEntry?.vendorName && (
                    <div className="text-xs text-amber-300/90 italic truncate mt-0.5 font-serif">
                      {loreEntry.vendorName}
                    </div>
                  )}
                  
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
              <div>
                <h5 className="font-mono text-xs text-amber-300 uppercase tracking-widest font-bold mb-1.5 flex items-center gap-1.5">
                  <span>📜</span>
                  <span>THE VEILED LEDGER MYTHOS</span>
                </h5>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed">{activeItemLore.mythos}</p>
              </div>

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

      {/* Developer Reference */}
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
              Edit <code className="text-white bg-black/40 px-1 py-0.5 rounded">src/data.ts</code> in the <code className="text-cyan-300">POWERUPS</code> array.
            </p>
          </div>
          <div className="bg-[#141c30] p-3 rounded-xl border border-white/5">
            <span className="font-mono text-emerald-300 font-bold block mb-1">📁 Lore, Mythos & Boss Counters</span>
            <p className="text-xs text-slate-400">
              Edit <code className="text-white bg-black/40 px-1 py-0.5 rounded">src/loreData.ts</code> in the <code className="text-cyan-300">ITEM_LORES</code> array.
            </p>
          </div>
        </div>

        {/* ZIP DOWNLOAD TRIGGER */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-white font-bold block text-xs sm:text-sm">📥 Export All Item Lore & Chronicles</span>
            <span className="text-slate-400 text-[11px] sm:text-xs">Bundle the entire structured Markdown Tome into a single offline-compatible zip archive.</span>
          </div>
          <button
            type="button"
            onClick={onDownloadAllZip}
            disabled={isExportingZip}
            className="px-4 py-2 bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md inline-flex items-center gap-1.5 shrink-0"
          >
            <span>{isExportingZip ? '⏳' : '📦'}</span>
            <span>{isExportingZip ? 'Exporting...' : 'Download Markdown Site (.zip)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
