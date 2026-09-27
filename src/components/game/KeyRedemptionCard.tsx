import React, { useState } from 'react';

export interface KeyRedemptionCardProps {
  onRedeem: (code: string) => void | Promise<void>;
  isProcessing?: boolean;
}

/**
 * KeyRedemptionCard - Dedicated UI for in-store receipt key & promo code redemption
 */
export const KeyRedemptionCard: React.FC<KeyRedemptionCardProps> = ({
  onRedeem,
  isProcessing = false
}) => {
  const [code, setCode] = useState('');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim() || isProcessing) return;
    await onRedeem(code.trim());
    setCode('');
  };

  return (
    <div id="game-redeem-container" className="bg-linear-to-r from-orange-950/40 via-[#10192e] to-red-950/40 border border-orange-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
      {/* Absolute decorative glow background */}
      <div className="absolute right-0 top-0 w-64 h-64 bg-orange-500/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
      
      <div className="space-y-1.5 max-w-[550px] z-10">
        <div className="flex items-center gap-2 text-orange-400">
          <span className="text-xl">💳</span>
          <h3 className="font-mono text-sm uppercase font-black tracking-wider">REDEEM IN-STORE RECEIPT KEY</h3>
        </div>
        <p className="text-slate-300 text-xs leading-relaxed">
          Received a printed receipt code from checkout? Input your key below to instantly load physical gear and claim your premium <strong className="text-purple-300">Gems 💎</strong> bonus!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-2.5 min-w-[280px] md:min-w-[340px] z-10">
        <input 
          type="text" 
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g., STORE-XXXX-XXXX" 
          disabled={isProcessing}
          aria-label="In-store receipt or promo key"
          className="flex-1 bg-black/40 border border-slate-700/80 rounded-xl px-4 py-3 text-xs md:text-sm text-white uppercase font-mono tracking-wider focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-50"
        />
        <button 
          type="submit"
          disabled={!code.trim() || isProcessing}
          className="px-6 py-3 rounded-xl bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs md:text-sm uppercase tracking-wider shadow-md hover:shadow-orange-600/20 active:scale-[0.98] transition cursor-pointer"
        >
          {isProcessing ? 'Verifying...' : 'Redeem'}
        </button>
      </form>
    </div>
  );
};
