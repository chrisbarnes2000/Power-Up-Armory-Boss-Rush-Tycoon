import React from 'react';
import { POWERUPS } from '../../data';
import { PurchaseRecord, TempPayloadItem } from '../../types';

interface AdminCartInspectorProps {
  reverseLookupCode: string;
  setReverseLookupCode: (code: string) => void;
  inspectedRecord: PurchaseRecord | null;
  setInspectedRecord: React.Dispatch<React.SetStateAction<PurchaseRecord | null>>;
  lookupStatus: 'idle' | 'searching' | 'found' | 'not_found';
  setLookupStatus: (status: 'idle' | 'searching' | 'found' | 'not_found') => void;
  performReverseLookup: (code: string) => Promise<void>;
  toggleCodeRedeemed: (code: string) => Promise<void>;
  deleteCode: (code: string) => Promise<void>;
  copyToClipboard: (text: string) => void;
  copied: boolean;
  registerSuccessNotice: string | null;
  setRegisterSuccessNotice: (msg: string | null) => void;
  isRegisteringCart: boolean;
  setIsRegisteringCart: (val: boolean) => void;
  selectedItemId: string;
  setSelectedItemId: (id: string) => void;
  selectedQty: number;
  setSelectedQty: (qty: number) => void;
  addToPayload: () => void;
  removeFromPayload: (id: string) => void;
  customPayload: TempPayloadItem[];
  setCustomPayload: React.Dispatch<React.SetStateAction<TempPayloadItem[]>>;
  customPrice: number;
  setCustomPrice: (price: number) => void;
  generateCustomCode: (override?: string) => Promise<void>;
}

export default function AdminCartInspector({
  reverseLookupCode,
  setReverseLookupCode,
  inspectedRecord,
  setInspectedRecord,
  lookupStatus,
  setLookupStatus,
  performReverseLookup,
  toggleCodeRedeemed,
  deleteCode,
  copyToClipboard,
  copied,
  registerSuccessNotice,
  setRegisterSuccessNotice,
  isRegisteringCart,
  setIsRegisteringCart,
  selectedItemId,
  setSelectedItemId,
  selectedQty,
  setSelectedQty,
  addToPayload,
  removeFromPayload,
  customPayload,
  setCustomPayload,
  customPrice,
  setCustomPrice,
  generateCustomCode
}: AdminCartInspectorProps) {
  return (
    <div 
      id="admin-reverse-lookup-section"
      className="bg-linear-to-b from-[#192238] via-[#101828] to-[#0a101d] border-2 border-cyan-500/40 rounded-2xl p-5 space-y-4 shadow-[0_4px_24px_rgba(6,182,212,0.12)] relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🔍</span>
          <div>
            <h3 className="font-mono text-xs sm:text-sm text-cyan-300 font-black uppercase tracking-wider flex items-center gap-2">
              REVERSE CART ID & KEY INSPECTOR
              <span className="text-[10px] font-mono bg-cyan-950/80 border border-cyan-500/30 text-cyan-200 px-2 py-0.5 rounded font-normal">
                Order Determination
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Input or paste any Cart ID / Receipt Key to reverse-lookup requested items, total price, and redemption status.
            </p>
          </div>
        </div>

        {/* Sample Quick Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-slate-400">Quick Test:</span>
          <button
            type="button"
            onClick={() => {
              setReverseLookupCode('OUVL-RG3U-1WW3-MEB2');
              performReverseLookup('OUVL-RG3U-1WW3-MEB2');
            }}
            className="px-2 py-1 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono rounded font-bold transition cursor-pointer"
          >
            OUVL-RG3U-1WW3-MEB2
          </button>
        </div>
      </div>

      {/* Input and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Enter or paste Cart ID (e.g. OUVL-RG3U-1WW3-MEB2 or STORE-XXXX-XXXX)..."
            value={reverseLookupCode}
            onChange={(e) => {
              setReverseLookupCode(e.target.value);
              if (lookupStatus !== 'idle') setLookupStatus('idle');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                performReverseLookup(reverseLookupCode);
              }
            }}
            className="w-full bg-[#090e18] text-sm text-cyan-200 font-mono font-bold border border-cyan-500/40 focus:border-cyan-400 rounded-xl px-4 py-2.5 focus:outline-none placeholder:text-slate-500 placeholder:font-normal"
          />
          {reverseLookupCode && (
            <button
              onClick={() => {
                setReverseLookupCode('');
                setInspectedRecord(null);
                setLookupStatus('idle');
              }}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-sm cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => performReverseLookup(reverseLookupCode)}
          className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black font-mono text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 shrink-0"
        >
          <span>🔍</span>
          <span>Reverse Inspect</span>
        </button>
      </div>

      {registerSuccessNotice && (
        <div className="px-4 py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs font-mono text-emerald-200 flex items-center justify-between">
          <span>✅ {registerSuccessNotice}</span>
          <button onClick={() => setRegisterSuccessNotice(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* INSPECTION RESULTS VIEW */}
      {lookupStatus === 'found' && inspectedRecord && (
        <div className="bg-[#0b1220] border border-cyan-500/30 rounded-xl p-4 space-y-3 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black text-white bg-black/60 px-3 py-1 rounded border border-cyan-500/30 tracking-wider">
                  {inspectedRecord.code}
                </span>
                <span className={`text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded border ${
                  inspectedRecord.redeemed 
                    ? 'bg-amber-950/60 text-amber-300 border-amber-500/30' 
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                }`}>
                  {inspectedRecord.redeemed ? 'CLAIMED / FULFILLED' : 'ACTIVE / UNUSED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Issued on: {new Date(inspectedRecord.date).toLocaleString()}
              </p>
            </div>

            <div className="text-right flex flex-col items-start sm:items-end">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Total Request Value</span>
              <span className="text-xl font-black font-mono text-yellow-400">
                ${inspectedRecord.total} <span className="text-xs text-slate-400 font-normal">USD</span>
              </span>
            </div>
          </div>

          {/* Itemized Breakdown Table */}
          <div>
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <span>📦</span> Requested Items Breakdown ({inspectedRecord.items.length} line items):
            </h4>
            <div className="space-y-2">
              {inspectedRecord.items.map((item, idx) => (
                <div 
                  key={idx} 
                  className="bg-black/40 border border-white/10 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{item.emoji}</span>
                    <div>
                      <span className="font-bold text-white">{item.id}</span>
                      <span className="text-slate-400 text-[11px] ml-2 bg-slate-800 px-1.5 py-0.5 rounded">
                        {item.pack}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <span className="text-cyan-300 font-bold">
                      Qty: x{item.qty}
                    </span>
                    <span className="text-yellow-300 font-bold">
                      ${item.price} USD
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inspection Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleCodeRedeemed(inspectedRecord.code)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                  inspectedRecord.redeemed
                    ? 'bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {inspectedRecord.redeemed ? '↩️ Reactivate / Mark Unused' : '✔️ Mark as Claimed / Fulfilled'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const breakdown = `RECEIPT KEY: ${inspectedRecord.code}\nTOTAL: $${inspectedRecord.total} USD\nITEMS:\n` +
                    inspectedRecord.items.map(i => `- ${i.emoji} ${i.id} (${i.pack}) x${i.qty} = $${i.price} USD`).join('\n');
                  copyToClipboard(breakdown);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold border border-slate-600 transition cursor-pointer"
              >
                {copied ? 'Copied Invoice!' : '📋 Copy Itemization'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => deleteCode(inspectedRecord.code)}
              className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 rounded-lg text-xs font-mono font-bold transition cursor-pointer"
            >
              🗑️ Delete Record
            </button>
          </div>
        </div>
      )}

      {/* NOT FOUND NOTIFICATION & MANUAL ORDER REGISTRATION BRIDGE */}
      {lookupStatus === 'not_found' && (
        <div className="bg-[#1a1215] border border-red-500/40 rounded-xl p-4 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-red-300 font-mono text-xs font-bold">
            <span>⚠️</span>
            <span>
              Cart ID <strong className="text-white bg-black/50 px-2 py-0.5 rounded">{reverseLookupCode}</strong> is not currently registered in active local or cloud records.
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            If this Cart ID was issued on another device or physical slip, reconstruct and register the requested items directly to this Cart ID using the Key Builder payload below.
          </p>

          <div className="pt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (customPayload.length === 0) {
                  addToPayload();
                }
                generateCustomCode(reverseLookupCode);
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black font-mono text-xs rounded-xl uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-md"
            >
              <span>⚡</span>
              <span>Register Order to {reverseLookupCode} ({customPayload.length > 0 ? `${customPayload.length} items queued` : `Add Current Item`})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
