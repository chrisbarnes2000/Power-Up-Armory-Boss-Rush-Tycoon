import React, { useState } from 'react';
import { GameState } from '../../types';
import { POWERUPS } from '../../data';
import { ITEM_LORES, VEILED_LEDGER_PREAMBLE } from '../../loreData';
import { downloadSingleItemMarkdown } from '../../utils/markdownExporter';

interface ItemCompendiumTabProps {
  gameState: GameState;
  isExportingZip: boolean;
  onDownloadAllZip: () => void;
  onNavigateToShop?: () => void;
  onNavigateToBosses?: () => void;
}

export const ItemCompendiumTab: React.FC<ItemCompendiumTabProps> = ({
  gameState,
  isExportingZip,
  onDownloadAllZip,
  onNavigateToShop,
  onNavigateToBosses
}) => {
  const [compendiumFilter, setCompendiumFilter] = useState<'All' | 'Weapons' | 'Defense' | 'Utility' | 'Mystic' | 'Consumables'>('All');
  const [compendiumSearch, setCompendiumSearch] = useState('');
  const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'owned' | 'unowned'>('all');
  const [selectedItemDetailId, setSelectedItemDetailId] = useState<string>(POWERUPS[0].id);

  // Filtered items in compendium
  const filteredPowerups = POWERUPS.filter(p => {
    const ownedState = gameState.powerups.find(up => up.id === p.id);
    const isOwned = !!(ownedState && ownedState.owned && (ownedState.quantity > 0 || p.id === 'Combat Tonic' || p.id === 'Revive Pack'));

    if (ownershipFilter === 'owned' && !isOwned) return false;
    if (ownershipFilter === 'unowned' && isOwned) return false;

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
    } else if (compendiumFilter === 'Consumables') {
      const consumableIds = ['Revive Pack', 'Combat Tonic'];
      if (!consumableIds.includes(p.id)) return false;
    }

    if (compendiumSearch.trim()) {
      const term = compendiumSearch.toLowerCase();
      return p.id.toLowerCase().includes(term) || p.description.toLowerCase().includes(term) || p.rarity.toLowerCase().includes(term);
    }
    return true;
  });

  const activeCompendiumItem = POWERUPS.find(p => p.id === selectedItemDetailId) || filteredPowerups[0] || POWERUPS[0];
  const activeItemLore = ITEM_LORES.find(l => l.id === activeCompendiumItem.id);
  const activeOwnedState = gameState.powerups.find(p => p.id === activeCompendiumItem.id);
  const isActiveOwned = !!(activeOwnedState && activeOwnedState.owned && (activeOwnedState.quantity > 0 || activeCompendiumItem.id === 'Combat Tonic' || activeCompendiumItem.id === 'Revive Pack'));

  const totalInscribed = gameState.powerups.filter(p => p.owned && (p.quantity > 0 || p.id === 'Combat Tonic' || p.id === 'Revive Pack')).length;

  return (
    <div className="space-y-6 w-full">
      {/* 3D TOME BOOK CONTAINER WITH REALISTIC LEATHER BINDING & GILDED EDGES */}
      <div className="relative rounded-[32px] sm:rounded-[44px] bg-[#1c120a] p-2.5 sm:p-5 shadow-[0_35px_100px_rgba(0,0,0,0.95),inset_0_0_0_4px_#452814,inset_0_0_50px_rgba(0,0,0,0.9)] border-3 border-amber-900/70 overflow-visible [perspective:1400px]">
        
        {/* Brass Corner Brackets */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-500/70 rounded-tl-2xl pointer-events-none z-30"></div>
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-500/70 rounded-tr-2xl pointer-events-none z-30"></div>
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-500/70 rounded-bl-2xl pointer-events-none z-30"></div>
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-500/70 rounded-br-2xl pointer-events-none z-30"></div>

        {/* Silk Ribbon Bookmark */}
        <div className="absolute -top-3.5 right-14 sm:right-24 w-6 sm:w-7 h-16 bg-gradient-to-b from-red-700 via-rose-800 to-red-950 rounded-b-lg shadow-xl shadow-black/90 z-40 pointer-events-none border-b-4 border-amber-400">
          <div className="w-full h-full flex items-end justify-center pb-1 text-[9px] text-amber-200 font-serif">✦</div>
        </div>

        {/* Book Outer Leather Frame Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-amber-950 via-[#2a1a0f] to-amber-950 border-b border-amber-600/30 rounded-t-[26px] sm:rounded-t-[38px] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl filter drop-shadow">📖</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                  THE ASTRAL CODEX · 3D ILLUMINATED TOME
                </span>
                <span className="text-[9px] font-mono bg-amber-900/60 text-amber-200 border border-amber-500/30 px-2 py-0.2 rounded-full">
                  Progressive Inscription Active
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-amber-100 flex items-center gap-2">
                <span>{VEILED_LEDGER_PREAMBLE.title}</span>
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-amber-300 bg-amber-950/90 border border-amber-500/40 px-3 py-1 rounded-full font-bold shadow-sm">
              ✨ {totalInscribed} / {POWERUPS.length} Relics Inscribed
            </span>
            <button
              onClick={onDownloadAllZip}
              disabled={isExportingZip}
              className="text-xs font-bold text-amber-200 bg-amber-900/60 hover:bg-amber-800/80 border border-amber-500/40 px-3 py-1 rounded-full transition cursor-pointer flex items-center gap-1 shadow-sm"
              title="Download entire Lore Book as Markdown Archive (.zip)"
            >
              <span>📦</span>
              <span>{isExportingZip ? 'Archiving...' : 'Download Tome .zip'}</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Foil Strip */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 bg-[#120c08] border-b border-amber-900/50 p-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-1.5">
            {(['All', 'Weapons', 'Defense', 'Utility', 'Mystic', 'Consumables'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setCompendiumFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                  compendiumFilter === cat
                    ? 'bg-amber-600 text-amber-950 font-black shadow-sm'
                    : 'bg-white/5 text-amber-200/60 hover:text-amber-100 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}

            <div className="h-4 w-px bg-amber-800/40 mx-1 hidden sm:block"></div>

            {/* Progressive Ownership Filter */}
            {(['all', 'owned', 'unowned'] as const).map(f => (
              <button
                key={f}
                onClick={() => setOwnershipFilter(f)}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition cursor-pointer ${
                  ownershipFilter === f
                    ? 'bg-amber-500/30 text-amber-200 border border-amber-400/60 font-bold'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                {f === 'all' ? 'All' : f === 'owned' ? '✦ Inscribed' : '🔒 Veiled'}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={compendiumSearch}
            onChange={e => setCompendiumSearch(e.target.value)}
            placeholder="Search inscribed runes & relics..."
            className="bg-[#1c120a] border border-amber-800/50 rounded-full px-3 py-1 text-xs text-amber-100 placeholder-amber-400/40 focus:outline-none focus:border-amber-400 w-full md:w-56"
          />
        </div>

        {/* 3D TWO-PAGE SPREAD FOLIO WITH CENTER SPINE GUTTER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative bg-[#0e1628] rounded-b-[26px] sm:rounded-b-[38px] overflow-hidden border border-amber-950/80 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          
          {/* Central Book Spine Shadow Gutter (Creates authentic 3D open-tome fold) */}
          <div className="hidden lg:block absolute inset-y-0 left-5/12 w-6 -ml-3 bg-gradient-to-r from-black/60 via-black/80 to-transparent pointer-events-none z-20 border-r border-amber-950/60"></div>

          {/* LEFT FOLIO: Inscribed Relic Index (With gold leaf numbering & progressive seals) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#121a2d] to-[#0c1322] p-4 sm:p-5 border-b lg:border-b-0 lg:border-r-2 border-amber-950/90 flex flex-col justify-between relative shadow-[inset_-20px_0_35px_rgba(0,0,0,0.6)]">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-amber-400/80 uppercase tracking-wider border-b border-amber-500/20 pb-2 mb-2">
                <span>Left Folio · Relic Inscriptions</span>
                <span>({filteredPowerups.length} entries)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 max-h-[550px] overflow-y-auto pr-1">
                {filteredPowerups.map(item => {
                  const isSelected = item.id === activeCompendiumItem.id;
                  const ownedState = gameState.powerups.find(p => p.id === item.id);
                  const isOwned = !!(ownedState && ownedState.owned && (ownedState.quantity > 0 || item.id === 'Combat Tonic' || item.id === 'Revive Pack'));

                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItemDetailId(item.id)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between group relative overflow-hidden ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-950/80 via-[#1c2946] to-[#121c32] border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                          : 'bg-[#0b1220] border-white/5 hover:border-amber-500/30 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`text-2xl shrink-0 group-hover:scale-110 transition-transform ${
                          !isOwned ? 'filter grayscale brightness-50 opacity-60' : ''
                        }`}>
                          {item.emoji}
                        </span>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-white truncate flex items-center gap-1.5">
                            <span>{isOwned ? item.id : `Veiled ${item.rarity}`}</span>
                            {isOwned ? (
                              <span className="text-emerald-400 text-[10px]">●</span>
                            ) : (
                              <span className="text-amber-400 text-[10px]">🔒</span>
                            )}
                          </div>
                          <div className="text-[10px] text-amber-300/70 font-mono truncate">
                            {isOwned 
                              ? (item.id === 'Combat Tonic' || item.id === 'Revive Pack' ? '✨ Tactical Consumable' : `Lv.${ownedState?.level || 1} · x${ownedState?.quantity || 0} Bound`)
                              : '🔒 Uninscribed Relic'}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/40 text-amber-300 border border-white/10 shrink-0">
                        {item.rarity}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Left Page Footer Stamp */}
            <div className="pt-4 border-t border-white/5 text-[10px] font-mono text-slate-400 flex justify-between items-center">
              <span>Folio Inscriptions Verified</span>
              <span>Codex Vol. IV · Left Leaf</span>
            </div>
          </div>

          {/* RIGHT FOLIO: Illuminated Artifact Tome Dossier */}
          <div className="lg:col-span-7 bg-gradient-to-bl from-[#141e38] via-[#0f182c] to-[#0a1120] p-5 sm:p-7 space-y-5 relative shadow-[inset_20px_0_35px_rgba(0,0,0,0.6)]">
            
            {isActiveOwned ? (
              /* FULLY INSCRIBED ILLUMINATED ARTIFACT PAGE */
              <>
                {/* Illuminated Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-amber-500/20 pb-4 gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center text-4xl shadow-inner shrink-0 mt-0.5">
                      {activeCompendiumItem.emoji}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                          {activeCompendiumItem.rarity} Relic
                        </span>
                        {activeItemLore?.vendorName && (
                          <span className="text-[10px] font-mono text-amber-300 bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded">
                            Origin: {activeItemLore.vendorName}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                          ✓ Inscribed to Armory
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-amber-100 font-serif tracking-wide">
                        {activeCompendiumItem.id}
                      </h3>
                      <p className="text-xs text-amber-200/70 italic mt-0.5">"{activeCompendiumItem.description}"</p>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end gap-2 shrink-0">
                    <span className="text-xs font-mono font-bold text-green-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-xl shadow-sm">
                      +{activeCompendiumItem.baseRate}/s Gold
                    </span>
                    <button
                      onClick={() => downloadSingleItemMarkdown(activeCompendiumItem, activeItemLore)}
                      className="text-xs font-bold text-amber-300 bg-[#162138] border border-amber-500/30 hover:bg-[#1e2d4d] px-2.5 py-1 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-sm"
                      title={`Export ${activeCompendiumItem.id} folio to Markdown`}
                    >
                      <span>📥</span>
                      <span>Export .md</span>
                    </button>
                  </div>
                </div>

                {/* Combat Ratings Spread */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#0b1220]/80 p-3 rounded-2xl border border-amber-500/20 text-center shadow-inner">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">⚔️ Attack</span>
                    <span className="font-mono text-base text-[#f5e56b] font-black">+{activeCompendiumItem.attack}</span>
                  </div>
                  <div className="bg-[#0b1220]/80 p-3 rounded-2xl border border-amber-500/20 text-center shadow-inner">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">🛡️ Defense</span>
                    <span className="font-mono text-base text-[#7ae0ff] font-black">+{activeCompendiumItem.defense}</span>
                  </div>
                  <div className="bg-[#0b1220]/80 p-3 rounded-2xl border border-amber-500/20 text-center shadow-inner">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">💨 Speed</span>
                    <span className="font-mono text-base text-[#cb9df2] font-black">+{activeCompendiumItem.speed}</span>
                  </div>
                </div>

                {/* Tactical Special Aura & Effect */}
                <div className="bg-[#0d1424] p-4 rounded-2xl border border-white/5 space-y-2 text-xs">
                  <div>
                    <span className="text-amber-400 font-bold uppercase tracking-wider font-mono text-[11px] block mb-0.5">
                      ✨ Tactical Combat Aura:
                    </span>
                    <p className="text-amber-100 font-medium leading-relaxed">{activeCompendiumItem.effect}</p>
                  </div>
                  {activeCompendiumItem.special && (
                    <div className="pt-2 border-t border-white/5">
                      <span className="text-[#7ae0ff] font-bold uppercase tracking-wider font-mono text-[11px] block mb-0.5">
                        ⚡ Active Combat Technique:
                      </span>
                      <p className="text-slate-200 leading-relaxed font-semibold">{activeCompendiumItem.special}</p>
                    </div>
                  )}
                </div>

                {/* Canonical Lore Inscription */}
                <div className="space-y-2 border-t border-white/5 pt-3 text-xs">
                  <span className="font-mono text-[10px] text-amber-400 uppercase tracking-widest font-bold block">
                    📜 CANONICAL ARTIFACT CHRONICLE
                  </span>
                  <p className="text-slate-300 leading-relaxed font-serif text-xs sm:text-sm italic bg-black/20 p-3 rounded-xl border border-white/5">
                    {activeItemLore?.mythos || activeItemLore?.vendorQuote || activeCompendiumItem.description}
                  </p>
                </div>

                {/* Right Page Footer Status */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="text-emerald-400 font-bold">
                    ✦ Status: Inscribed to Hero Loadout (Level {activeOwnedState?.level} · Quantity: {activeOwnedState?.quantity})
                  </span>
                  <span>Folio 15 · Power-Up Armory</span>
                </div>
              </>
            ) : (
              /* SHROUDED VEILED ARTIFACT FOLIO (PROGRESSIVE UNLOCK) */
              <div className="py-10 px-4 text-center space-y-5">
                <div className="w-20 h-20 rounded-3xl bg-amber-950/40 border-2 border-amber-600/40 flex items-center justify-center mx-auto text-4xl shadow-2xl text-amber-500/70">
                  🔒
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <span className="text-[10px] font-mono text-amber-400/90 uppercase tracking-widest font-bold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/30">
                    Veiled Inscription · {activeCompendiumItem.rarity} Rarity
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-amber-200 font-serif tracking-wide">
                    Veiled Relic [{activeCompendiumItem.rarity}]
                  </h3>
                  <p className="text-xs text-amber-100/70 leading-relaxed italic font-serif">
                    "This artifact's celestial resonance is shrouded beneath ancient mystic runes. Inscribe it into your active arsenal to break the wax seal and reveal its true canonical chronicle."
                  </p>
                </div>

                {/* Partial Clue Box */}
                <div className="bg-[#0b1220]/80 border border-amber-500/20 p-4 rounded-2xl max-w-md mx-auto text-left space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                    <span className="text-slate-400 font-mono text-[10px] uppercase">Rarity Classification</span>
                    <span className="text-amber-300 font-mono font-bold">{activeCompendiumItem.rarity}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                    <span className="text-slate-400 font-mono text-[10px] uppercase">Known Vault Origin</span>
                    <span className="text-slate-300 font-mono">{activeItemLore?.vendorName || 'Royal Armory Vaults'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-mono text-[10px] uppercase">Base Yield Potential</span>
                    <span className="text-emerald-400 font-mono font-bold">+{activeCompendiumItem.baseRate}/s Gold</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  {onNavigateToShop && (
                    <button
                      onClick={onNavigateToShop}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-black text-xs font-mono uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🛒</span>
                      <span>Find in Armory Store</span>
                    </button>
                  )}
                  {onNavigateToBosses && (
                    <button
                      onClick={onNavigateToBosses}
                      className="px-5 py-2.5 bg-[#172238] hover:bg-[#203050] text-[#7ae0ff] border border-[#2a4060] rounded-xl text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>⚔️</span>
                      <span>Challenge Boss Rush</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
