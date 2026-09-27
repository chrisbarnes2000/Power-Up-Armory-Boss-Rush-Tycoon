import React from 'react';
import { POWERUPS } from '../../data';
import { TempPayloadItem } from '../../types';

interface AdminCodeGeneratorProps {
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
  customCodeInput: string;
  setCustomCodeInput: (code: string) => void;
  generateCustomCode: (override?: string) => Promise<void>;
  generatedCode: string | null;
  copyToClipboard: (text: string) => void;
  copied: boolean;
}

export default function AdminCodeGenerator({
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
  customCodeInput,
  setCustomCodeInput,
  generateCustomCode,
  generatedCode,
  copyToClipboard,
  copied
}: AdminCodeGeneratorProps) {
  return (
    <div 
      id="admin-code-builder-section"
      className="bg-linear-to-b from-[#141d30] via-[#0d1524] to-[#080d18] border border-blue-500/30 rounded-2xl p-5 space-y-4 shadow-xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-500/20 pb-3">
        <div>
          <h3 className="font-mono text-xs sm:text-sm text-[#7ae0ff] font-extrabold uppercase tracking-widest flex items-center gap-2">
            <span>🎫</span> GENERATE CUSTOM IN-STORE RECEIPT KEY
          </h3>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            Mint a secure receipt key with custom power-up payloads for in-person customer checkout or promotional delivery.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* SELECT ITEM */}
        <div className="md:col-span-6 flex flex-col gap-1.5">
          <label className="text-xs text-slate-300 font-bold uppercase">Power-up Item</label>
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="bg-[#141c30] text-slate-200 border border-[#2a4060] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-medium"
          >
            {POWERUPS.map(p => (
              <option key={p.id} value={p.id}>{p.emoji} {p.id} ({p.rarity}) — ${p.packs[0]?.price ?? 25} USD</option>
            ))}
          </select>
        </div>

        {/* SELECT QUANTITY */}
        <div className="md:col-span-3 flex flex-col gap-1.5">
          <label className="text-xs text-slate-300 font-bold uppercase">QTY Units</label>
          <input
            type="number"
            min="1"
            max="50"
            value={selectedQty}
            onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="bg-[#141c30] text-slate-200 border border-[#2a4060] rounded-xl px-3 py-2 text-xs text-center focus:outline-none focus:border-blue-500 font-bold font-mono"
          />
        </div>

        {/* ADD TO PAYLOAD BUTTON */}
        <div className="md:col-span-3 flex items-end">
          <button
            type="button"
            onClick={addToPayload}
            className="w-full py-2 bg-blue-900/50 hover:bg-blue-800/70 border border-blue-500/40 text-blue-200 hover:text-white rounded-xl text-xs font-extrabold uppercase transition cursor-pointer shadow-sm"
          >
            ➕ Add Item
          </button>
        </div>
      </div>

      {/* PAYLOAD LIST */}
      {customPayload.length > 0 && (
        <div className="bg-black/40 rounded-xl p-3.5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-300 uppercase font-bold tracking-wider">Order Queue ({customPayload.length} items)</p>
            <button onClick={() => setCustomPayload([])} className="text-[11px] text-red-400 hover:text-red-300 font-mono">Clear Queue</button>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {customPayload.map(i => (
              <div key={i.id} className="flex items-center justify-between bg-white/5 px-3 py-1.5 rounded-lg text-xs font-mono">
                <span className="text-slate-200">{i.emoji} {i.id} <strong className="text-[#7ae0ff]">x{i.qty}</strong></span>
                <button
                  onClick={() => removeFromPayload(i.id)}
                  className="text-red-400 hover:text-red-300 font-bold transition px-2 py-0.5 rounded bg-red-950/40"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 uppercase font-bold font-mono">Price:</span>
                <input
                  type="number"
                  min="1"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(Math.max(1, parseInt(e.target.value) || 1))}
                  className="bg-[#141c30] text-[#f5e56b] border border-[#2a4060] rounded-lg px-2.5 py-1 text-xs w-20 text-center font-bold font-mono"
                />
                <span className="text-xs text-slate-400 font-mono">USD</span>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Custom Code ID (Optional)"
                  value={customCodeInput}
                  onChange={(e) => setCustomCodeInput(e.target.value)}
                  className="bg-[#141c30] text-xs text-slate-200 border border-[#2a4060] rounded-lg px-2.5 py-1 font-mono placeholder:text-slate-500 w-36"
                />
              </div>
            </div>

            <button
              onClick={() => generateCustomCode()}
              className="w-full sm:w-auto sm:ml-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black uppercase tracking-wider rounded-xl text-xs transition cursor-pointer shadow-lg shadow-emerald-900/20"
            >
              🎫 Issue Secure Receipt Key
            </button>
          </div>
        </div>
      )}

      {/* RESULT */}
      {generatedCode && (
        <div className="bg-[#142a20] border-2 border-green-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
          <div>
            <p className="text-xs text-green-400 font-bold uppercase tracking-widest">SUCCESSFULLY MINTED KEY!</p>
            <p className="text-xs text-slate-300 mt-0.5">Provide this receipt key to the client for immediate redemption:</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base text-[#6affaa] font-black tracking-widest bg-black/60 px-4 py-1.5 rounded border border-green-500/30">{generatedCode}</span>
            <button
              onClick={() => copyToClipboard(generatedCode)}
              className="px-3.5 py-1.5 rounded-lg bg-green-700 text-xs text-white font-bold hover:bg-green-600 transition cursor-pointer"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
