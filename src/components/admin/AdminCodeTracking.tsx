import React from 'react';
import { PurchaseRecord } from '../../types';

interface AdminCodeTrackingProps {
  allCodes: PurchaseRecord[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  deletedNotice: string | null;
  setDeletedNotice: (notice: string | null) => void;
  setReverseLookupCode: (code: string) => void;
  performReverseLookup: (code: string) => Promise<void>;
  toggleCodeRedeemed: (code: string) => Promise<void>;
  deleteCode: (code: string) => Promise<void>;
}

export default function AdminCodeTracking({
  allCodes,
  searchTerm,
  setSearchTerm,
  deletedNotice,
  setDeletedNotice,
  setReverseLookupCode,
  performReverseLookup,
  toggleCodeRedeemed,
  deleteCode
}: AdminCodeTrackingProps) {
  const filteredCodes = allCodes.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    const matchesCode = r.code.toLowerCase().includes(searchLower);
    const matchesItem = r.items.some(i => i.id.toLowerCase().includes(searchLower));
    return matchesCode || matchesItem;
  });

  return (
    <div 
      id="admin-code-tracking-section"
      className="bg-linear-to-b from-[#181326] via-[#110e1d] to-[#090812] border border-purple-500/30 rounded-2xl p-5 space-y-4 shadow-xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-3">
        <div>
          <h3 className="font-mono text-xs sm:text-sm text-[#cb9df2] font-extrabold uppercase tracking-widest flex items-center gap-2">
            <span>📋</span> RECEIPT CODE TRACKING & VAULT RECORDS
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Live inventory of all {allCodes.length} issued checkout keys across local session and cloud storage.
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <input
            type="text"
            placeholder="Filter keys or items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#141c30] text-xs text-slate-200 border border-[#2a4060] rounded-xl pl-3 pr-7 py-1.5 focus:outline-none focus:border-purple-500 max-w-xs font-mono placeholder:text-slate-500"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1.5 text-slate-400 text-xs cursor-pointer">✕</button>
          )}
        </div>
      </div>

      {deletedNotice && (
        <div className="px-3.5 py-2 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 font-mono flex items-center justify-between shadow-lg">
          <span className="flex items-center gap-2">
            <span>🗑️</span>
            <strong>{deletedNotice}</strong>
          </span>
          <button 
            onClick={() => setDeletedNotice(null)} 
            className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {filteredCodes.length === 0 ? (
        <div className="bg-[#141c30]/20 border border-white/5 rounded-2xl p-8 text-center text-slate-400 text-xs font-mono">
          No issued receipt codes found matching your criteria. Use the reverse lookup or builder above to inspect/mint codes.
        </div>
      ) : (
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {filteredCodes.map(r => (
            <div 
              key={r.code}
              onClick={() => {
                setReverseLookupCode(r.code);
                performReverseLookup(r.code);
              }}
              className={`bg-linear-to-b from-[#161e33] to-[#0f1524] border rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all cursor-pointer ${
                r.redeemed ? 'border-[#1a2d20] opacity-75' : 'border-[#2a4060] hover:border-cyan-500/50 hover:shadow-md'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black tracking-wider text-slate-100 bg-black/60 px-2.5 py-0.5 rounded border border-white/10">
                    {r.code}
                  </span>
                  <span className={`text-[10px] sm:text-xs font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                    r.redeemed ? 'bg-amber-950/50 text-amber-300 border-amber-500/20' : 'bg-emerald-950/50 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {r.redeemed ? 'CLAIMED / FULFILLED' : 'ACTIVE / UNUSED'}
                  </span>
                </div>
                <div className="text-xs text-slate-300 flex flex-wrap gap-x-2 font-mono">
                  <span>Date: {new Date(r.date).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="text-[#f5e56b] font-bold">Total: ${r.total} USD</span>
                </div>
                <div className="text-xs text-slate-300 flex flex-wrap gap-1.5 pt-0.5">
                  {r.items.map((it, idx) => (
                    <span key={idx} className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-xs font-mono text-slate-200">
                      {it.emoji} {it.id} (x{it.qty})
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => toggleCodeRedeemed(r.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer font-mono ${
                    r.redeemed 
                      ? 'bg-amber-950/40 text-amber-300 border border-amber-500/20 hover:bg-amber-900/40' 
                      : 'bg-green-950/40 text-green-300 border border-green-500/20 hover:bg-green-900/40'
                  }`}
                >
                  {r.redeemed ? '↩️ Reactivate Key' : '✔️ Redeem/Claim'}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCode(r.code);
                  }}
                  className="p-2 text-red-400 hover:text-red-200 bg-red-950/30 hover:bg-red-900/60 border border-red-500/20 hover:border-red-500/50 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                  title="Delete Receipt Code"
                  aria-label="Delete Receipt Code"
                >
                  <span className="text-sm leading-none">🗑️</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
