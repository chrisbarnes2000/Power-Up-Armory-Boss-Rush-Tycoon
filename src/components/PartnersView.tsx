import React, { useState } from 'react';
import { Sparkles, ExternalLink, ShieldCheck, Heart, Users, FileText, ArrowRight, Wallet, TrendingUp, CheckCircle, Gift } from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';
import { GameState } from '../types';
import { CoinIcon } from './CoinIcon';
import { buildOutboundPartnerUrl, trackOutboundPartnerClick, trackEvent } from '../lib/analytics';

interface PartnersViewProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export default function PartnersView({ gameState, setGameState }: PartnersViewProps) {
  // 1. Storage ROI Calculator State
  const [rentCost, setRentCost] = useState<number>(145); // Monthly rental fee
  const [months, setMonths] = useState<number>(36); // Timeline duration

  // 2. Affiliate Code Redemption Desk State
  const [promoInput, setPromoInput] = useState<string>('');
  const [promoMessage, setPromoMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [claimingState, setClaimingState] = useState<boolean>(false);

  // Partners outbound URLs
  const rapportVerseUrl = buildOutboundPartnerUrl(APP_CONFIG.partner.url, {
    utm_medium: 'partner_hub',
    utm_campaign: 'rapportverse_ecosystem',
    utm_content: 'partners_view_hub'
  });

  const miniBarnMasterUrl = buildOutboundPartnerUrl(APP_CONFIG.miniBarnMaster?.url || 'https://minibarnmaster.ai.studio', {
    utm_medium: 'partner_hub',
    utm_campaign: 'barn_crossplay',
    utm_content: 'partners_view_hub'
  });

  const zenniReferralUrl = APP_CONFIG.zenniOptical?.referralUrl || 'http://rwrd.io/r7jn9f2?c';
  const zenniPrivacyUrl = APP_CONFIG.zenniOptical?.privacyUrl || 'https://www.zennioptical.com/privacy-policy';
  const zenniTermsUrl = APP_CONFIG.zenniOptical?.termsUrl || 'https://www.zennioptical.com/terms-of-use';

  // ROI Math
  const totalRentWasted = rentCost * months;
  const customShedValue = 3200; // Average cost of custom storage shed built by MiniBarnMaster
  const netSavings = totalRentWasted - customShedValue;

  // Code redemption handler
  const handleRedeemPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = promoInput.trim().toUpperCase();

    if (!cleanCode) return;

    setClaimingState(true);
    setPromoMessage(null);

    // Check if code was already redeemed
    if (gameState.invitedByCode || gameState.purchasedCodes.some(c => c.code.toUpperCase() === cleanCode)) {
      setPromoMessage({
        success: false,
        text: '⚠️ You have already redeemed this or another affiliate promo code!'
      });
      setClaimingState(false);
      return;
    }

    const isPartner = ['MINIBARN', 'MINIBARN-MASTER', 'RAPPORTVERSE', 'RAPPORT-VERSE', 'RAPPRT', 'ZENNI', 'ZENNI15', 'ZENNIOPTICAL', 'ZENNI-OPTICAL'].includes(cleanCode);
    
    if (isPartner) {
      let partnerName = 'RapportVerse';
      if (cleanCode.includes('BARN')) partnerName = 'MiniBarnMaster';
      if (cleanCode.includes('ZENNI')) partnerName = 'Zenni Optical';
      
      // Update state: Give +3,000 Coins & +150 Gems
      const nextState: GameState = {
        ...gameState,
        coins: gameState.coins + 3000,
        gems: (gameState.gems || 0) + 150,
        invitedByCode: cleanCode,
        battleLog: [
          {
            message: `🤝 Active Partner Synergy Voucher Activated (${cleanCode})! Received +3,000 Coins & +150 Gems from ${partnerName}!`,
            className: 'log-reward'
          },
          ...gameState.battleLog
        ]
      };

      setGameState(nextState);
      localStorage.setItem('bossRushTycoon', JSON.stringify(nextState));

      // Track telemetry
      trackEvent('partner_promo_redeemed', {
        partner: partnerName,
        code: cleanCode,
        bonus_coins: 3000,
        bonus_gems: 150
      });

      setPromoMessage({
        success: true,
        text: `🎉 Code Accepted! You received +3,000 Coins & +150 Gems from our partner ${partnerName}!`
      });
      setPromoInput('');
    } else {
      setPromoMessage({
        success: false,
        text: '❌ Invalid partner promo code. Try "ZENNI", "MINIBARN", or "RAPPORTVERSE".'
      });
    }

    setClaimingState(false);
  };

  return (
    <div className="w-full max-w-full flex-1 flex flex-col bg-linear-to-b from-[#111827] to-[#0a0f1a] border border-[#2a3d5c] rounded-[32px] md:rounded-[48px] p-4 md:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.9),inset_0_0_0_2px_#1f2d4a,inset_0_0_0_3px_#141f33] select-none my-2 md:my-6 relative overflow-visible">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 10%, #1c3d5c 0%, #0a0e1a 70%)' }}></div>

      {/* HEADER HERO */}
      <header className="text-center space-y-3 mb-8 relative z-10 max-w-2xl mx-auto">
        <span className="text-[11px] font-mono font-black text-amber-400 bg-amber-950/60 border border-amber-500/30 px-3 py-1.5 rounded-full uppercase tracking-widest inline-block">
          🤝 Strategic Affiliation Portal
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight font-mono">
          Affiliates & Partners Hub
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Bridging high-fidelity corporate tycoon simulation with authentic relationship software. Explore active cross-play campaigns, calculate asset ROI, and redeem collaborative affiliate bonuses.
        </p>
      </header>

      {/* TWO PRIMARY PARTNERS PANELS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 mb-8">
        
        {/* PANEL 1: RAPPORTVERSE ALLIANCE */}
        <section className="bg-linear-to-b from-[#121c33] to-[#0a1122] border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">🤝</span>
                <div>
                  <h3 className="font-extrabold text-white text-base sm:text-lg tracking-tight">RapportVerse</h3>
                  <p className="text-[10px] text-amber-400 uppercase tracking-widest font-bold font-mono">Visual Human Topologies</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded border border-indigo-500/30">
                Official Affiliate
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Collaborating directly to support <strong>RapportVerse (rapprt.space)</strong> — the visual-first relationship engine designed for visual sync and connection management.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-1">
                <span className="text-indigo-400 text-xs font-mono font-bold block">01 · Visual Connection Map</span>
                <span className="text-[11px] text-slate-400 block">Ditch tedious text lists for multi-dimensional connection graphs.</span>
              </div>
              <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-1">
                <span className="text-indigo-400 text-xs font-mono font-bold block">02 · Privacy Sovereignty</span>
                <span className="text-[11px] text-slate-400 block">GDPR compliance, pure local caching, and absolute client data ownership.</span>
              </div>
            </div>

            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs text-amber-300 leading-relaxed font-sans">
              "We align with RapportVerse because human trust is our most premium asset. In visual-first networks, clarity breeds strength."
            </div>
          </div>

          <div className="pt-2">
            <a
              href={rapportVerseUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOutboundPartnerClick('RapportVerse', rapportVerseUrl, 'partners_hub_card')}
              className="w-full h-12 bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore Platform: rapprt.space</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

        {/* PANEL 2: MINIBARNMASTER SHED SIMULATION */}
        <section className="bg-linear-to-b from-[#121c33] to-[#0a1122] border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">🌾</span>
                <div>
                  <h3 className="font-extrabold text-white text-base sm:text-lg tracking-tight">MiniBarnMaster</h3>
                  <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold font-mono">PNW Shed Manufacturing</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/30">
                Simulation Partner
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bridging Pacific Northwest manufacturing and custom barn engineering with PowerUpBossTycoon. Experience the interactive rental unit ROI comparison dashboard below!
            </p>

            {/* ROI COMPARISON WIDGET */}
            <div className="bg-black/50 border border-[#2a3d5c] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[11px] font-mono font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Shed Ownership ROI Engine</span>
                </span>
                <span className="text-[10px] text-slate-400">minibarnmaster.ai.studio</span>
              </div>

              {/* Sliders */}
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-300">
                    <span>Monthly Rental Storage Fee:</span>
                    <strong className="text-yellow-400">${rentCost}/mo</strong>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="300"
                    step="5"
                    value={rentCost}
                    onChange={(e) => setRentCost(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-300">
                    <span>Timeline Duration:</span>
                    <strong className="text-cyan-400">{months} Months</strong>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="60"
                    step="6"
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
              </div>

              {/* ROI Output */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-center text-xs font-mono">
                <div className="bg-red-950/30 border border-red-500/10 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block uppercase">Total Storage Rent</span>
                  <strong className="text-red-400 text-sm">${totalRentWasted.toLocaleString()}</strong>
                </div>
                <div className="bg-emerald-950/30 border border-emerald-500/10 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block uppercase">Asset ROI Savings</span>
                  <strong className={`text-sm ${netSavings >= 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {netSavings >= 0 ? `+$${netSavings.toLocaleString()}` : `-$${Math.abs(netSavings).toLocaleString()}`}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <a
              href={miniBarnMasterUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOutboundPartnerClick('MiniBarnMaster', miniBarnMasterUrl, 'partners_hub_card')}
              className="w-full h-12 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore Custom Sheds & Barns</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

      </div>

      {/* ZENNI OPTICAL AFFILIATE SHOWCASE SECTION */}
      <section className="bg-linear-to-br from-[#0c182b] via-[#091322] to-[#060a14] border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative z-10 mb-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">👓</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-lg sm:text-xl tracking-tight font-mono">
                  Zenni Optical
                </h3>
                <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/40 uppercase">
                  Give $15, Get $15
                </span>
              </div>
              <p className="text-[11px] text-cyan-400 font-mono font-semibold">
                Official Eyewear Partner · Prescription Glasses, Blue-Light Blokz & Polarized Eyewear
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto">
            🟢 Active Referral Offer
          </span>
        </div>

        {/* Promo Quote Box */}
        <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 relative">
          <p className="text-xs sm:text-sm text-cyan-100 leading-relaxed italic font-sans">
            "Spread the love, share the savings! Share a $15 off coupon with friends and earn 300 points ($15 in Rewards) when they place their first purchase."
          </p>
        </div>

        {/* Reward Stacking Breakdown Matrix */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
            🎁 Stack Your Rewards — The more you refer, the more you get back!
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center font-mono">
            <div className="bg-black/40 border border-white/5 p-3.5 rounded-2xl space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Invite 1 Friend</span>
              <strong className="text-cyan-300 text-base sm:text-lg block font-black">You get $15!</strong>
              <span className="text-[10px] text-slate-400 font-normal block">(300 Points)</span>
            </div>
            <div className="bg-black/40 border border-amber-500/20 p-3.5 rounded-2xl space-y-1">
              <span className="text-[10px] text-amber-400 uppercase tracking-widest block font-bold">Invite 5 Friends</span>
              <strong className="text-amber-300 text-base sm:text-lg block font-black">You get $75!</strong>
              <span className="text-[10px] text-slate-400 font-normal block">(1,500 Points)</span>
            </div>
            <div className="bg-black/40 border border-emerald-500/20 p-3.5 rounded-2xl space-y-1">
              <span className="text-[10px] text-emerald-400 uppercase tracking-widest block font-bold">Invite 10 Friends</span>
              <strong className="text-emerald-300 text-base sm:text-lg block font-black">You get $150!</strong>
              <span className="text-[10px] text-slate-400 font-normal block">(3,000 Points)</span>
            </div>
          </div>
        </div>

        {/* Everyday Zenni Rewards Member Perks */}
        <div className="bg-cyan-950/25 border border-cyan-500/20 rounded-2xl p-4 sm:p-5 space-y-2.5">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
            <span>✨</span>
            <span>Everyday Zenni Rewards Member Perks</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
            <div className="flex items-center gap-2.5 bg-black/40 border border-white/5 p-3 rounded-xl">
              <span className="text-lg shrink-0">🚚</span>
              <span className="text-slate-200 text-[11px] font-semibold leading-snug">
                Get free standard US shipping on all orders over $65²
              </span>
            </div>
            <div className="flex items-center gap-2.5 bg-black/40 border border-white/5 p-3 rounded-xl">
              <span className="text-lg shrink-0">💸</span>
              <span className="text-slate-200 text-[11px] font-semibold leading-snug">
                Earn 1 point on every dollar you spend
              </span>
            </div>
            <div className="flex items-center gap-2.5 bg-black/40 border border-white/5 p-3 rounded-xl">
              <span className="text-lg shrink-0">🎂</span>
              <span className="text-slate-200 text-[11px] font-semibold leading-snug">
                Enjoy a birthday gift
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Outbound Referral Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <a
            href={zenniReferralUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackOutboundPartnerClick('ZenniOptical', zenniReferralUrl, 'partners_zenni_card')}
            className="w-full sm:flex-1 h-12 bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Claim $15 Off Coupon at Zenni Optical</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Legal Disclosures, Privacy & Terms */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-400 font-mono border-t border-white/5 pt-3 gap-2">
          <span>*Valid for first-time customers on eligible regular priced eyewear merchandise at Zenni.com.</span>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={zenniPrivacyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-300 underline transition"
            >
              Privacy Policy
            </a>
            <span>·</span>
            <a
              href={zenniTermsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-300 underline transition"
            >
              Terms of Use
            </a>
          </div>
        </div>
      </section>

      {/* DEDICATED PROMOTIONAL DESK & REGIONAL DEMAND */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        
        {/* SUB-SECTION 1: REDEEM CODES CARD */}
        <div className="bg-[#0b1220]/80 border border-[#2a3d5c] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-white/5">
            <span className="text-xl">🎁</span>
            <div>
              <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Partner Redeem Desk</h4>
              <p className="text-[10px] text-slate-400 font-mono">Claim exclusive +3000 Coins cross-play bonus</p>
            </div>
          </div>

          <form onSubmit={handleRedeemPromoCode} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-mono uppercase block">Enter Partner Promo Code:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder='e.g., "MINIBARN" or "RAPPORTVERSE"'
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500/50 font-mono"
                />
                <button
                  type="submit"
                  disabled={claimingState || !promoInput.trim()}
                  className="bg-amber-600 hover:bg-amber-500 disabled:bg-white/5 text-slate-950 disabled:text-slate-500 font-bold px-4 rounded-xl text-xs uppercase cursor-pointer transition shrink-0"
                >
                  {claimingState ? 'Redeeming...' : 'Apply'}
                </button>
              </div>
            </div>

            {promoMessage && (
              <div className={`p-3 rounded-xl text-xs leading-relaxed ${promoMessage.success ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-400' : 'bg-red-950/40 border border-red-500/30 text-red-300'}`}>
                {promoMessage.text}
              </div>
            )}
          </form>
        </div>

        {/* SUB-SECTION 2: WASHINGTON STATE TERRITORY DEMAND MAP */}
        <div className="bg-[#0b1220]/80 border border-[#2a3d5c] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-white/5">
            <span className="text-xl">🗺️</span>
            <div>
              <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Washington State Territory Demand</h4>
              <p className="text-[10px] text-emerald-400 font-mono">PNW Regional Faction Demands</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1">
              <strong className="text-amber-300 block">📍 Seattle / Bellevue</strong>
              <span className="text-slate-400 text-[10px] block">High demand for HOA-compliant studios & garden offices.</span>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1">
              <strong className="text-emerald-300 block">📍 Coast / Moores</strong>
              <span className="text-slate-400 text-[10px] block">Requires rustproof, high-moisture framing protocols.</span>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1">
              <strong className="text-cyan-300 block">📍 Spokane / East</strong>
              <span className="text-slate-400 text-[10px] block">Requires heavy snow-load structural roof framing.</span>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1">
              <strong className="text-indigo-300 block">📍 Tacoma / Olympia</strong>
              <span className="text-slate-400 text-[10px] block">Requires heavy-duty workshops & timber sheds.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
