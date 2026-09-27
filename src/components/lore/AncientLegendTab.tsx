import React from 'react';
import { SYSTEM_LEGEND } from '../../loreData';

export const AncientLegendTab: React.FC = () => {
  return (
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
                      <p className="leading-snug text-[11px] sm:text-xs">{cur.sources}</p>
                    </div>
                    <div className="pt-1.5">
                      <span className="text-slate-400 font-bold block text-xs uppercase">✦ Utility:</span>
                      <p className="leading-snug text-[11px] sm:text-xs">{cur.uses}</p>
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
  );
};
