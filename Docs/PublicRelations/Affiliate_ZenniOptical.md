# Strategic Affiliate Integration: Zenni Optical Refer-a-Friend Program

> **Universal Affiliate Specification & Deployment Guide**  
> **Ecosystem Applications**: PowerUpBossTycoon, MiniBarnMaster (`minibarnmaster.ai.studio`), RapportVerse (`rapprt.space`)  
> **Affiliate Partner**: Zenni Optical ([zennioptical.com](https://www.zennioptical.com))  
> **Program**: Zenni Rewards "Refer a Friend — Give $15, Get $15"  
> **Referral Access URL**: [http://rwrd.io/r7jn9f2?c](http://rwrd.io/r7jn9f2?c)  
> **Status**: 🟢 Active Production Affiliate Synergy  

---

## 1. Executive Summary & Value Proposition

This document defines the standardized cross-application integration for the **Zenni Optical Refer-a-Friend Affiliate Program**. It is structured for plug-and-play adoption across all affiliated web platforms (including **MiniBarnMaster**, **RapportVerse**, and **Power-Up Armory & Boss Rush Tycoon**).

### Core Program Proposition
> *"Spread the love, share the savings! Share a $15 off coupon with friends and earn 300 points ($15 in Rewards) when they place their first purchase."*

---

## 2. Program Breakdown & Reward Tier Matrix

The Zenni Optical referral mechanism provides dual-sided value:

| Action | Referred Friend Receives | Referrer / Partner Receives |
| :--- | :--- | :--- |
| **First-Time Purchase** | **$15 Off Coupon** at checkout | **300 Zenni Rewards Points** ($15 in Rewards) |

### Scalable Reward Stacking
* **Invite 1 Friend**: **$15 in Rewards** *(300 Loyalty Points)*
* **Invite 5 Friends**: **$75 in Rewards** *(1,500 Loyalty Points)*
* **Invite 10 Friends**: **$150 in Rewards** *(3,000 Loyalty Points)*

### Member Benefits & Loyalty Perks
In addition to referral rewards, the Zenni Rewards program provides essential customer perks:
* 🚚 **Get free standard US shipping on all orders over $65²**
* 💸 **Earn 1 point on every dollar you spend**
* 🎂 **Enjoy a birthday gift**

---

## 3. Regulatory & Legal Disclosures

All ecosystem applications integrating this affiliate link must link to Zenni Optical's official compliance policies and include standard FTC-compliant disclosure notices:

* **Primary Referral Link**: [http://rwrd.io/r7jn9f2?c](http://rwrd.io/r7jn9f2?c)
* **Official Privacy Policy**: [https://www.zennioptical.com/privacy-policy](https://www.zennioptical.com/privacy-policy)
* **Official Terms of Use**: [https://www.zennioptical.com/terms-of-use](https://www.zennioptical.com/terms-of-use)

### Terms & Conditions Summary
- $15 discount is valid strictly for first-time customers on regular-priced eyewear merchandise at Zenni.com.
- First-time customers must enter their unique referral voucher code in the Shopping Cart during checkout.
- Upon verified first-time purchase completion, 300 Zenni Rewards points are deposited into the referrer’s loyalty account.
- Excludes taxes, shipping fees, gift cards, and Lunar New Year collections. Cannot be combined with other promotional codes or retroactively applied to prior orders.
- Void where prohibited. Subject to Zenni Optical's Notice of Financial Incentives.

---

## 4. Universal Integration Templates for Affiliated Apps

### A. React / Tailwind Component Template (Drop-in for MiniBarnMaster & RapportVerse)

```tsx
import React from 'react';
import { ExternalLink, Glasses, Gift, ShieldCheck } from 'lucide-react';

export const ZenniOpticalAffiliateCard: React.FC = () => {
  const referralUrl = 'http://rwrd.io/r7jn9f2?c';
  const privacyUrl = 'https://www.zennioptical.com/privacy-policy';
  const termsUrl = 'https://www.zennioptical.com/terms-of-use';

  return (
    <div className="bg-gradient-to-br from-[#121c33] via-[#0d1424] to-[#070b14] border-2 border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-xl text-slate-200 space-y-6">
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-3xl">👓</span>
          <div>
            <h3 className="font-extrabold text-white text-base sm:text-lg tracking-tight font-mono">
              Zenni Optical
            </h3>
            <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold font-mono">
              Official Eyewear Partner · Give $15, Get $15
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-500/30">
          Special Offer
        </span>
      </div>

      {/* Value Copy */}
      <div className="space-y-2">
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Spread the love, share the savings! Get a <strong>$15 off coupon</strong> on your first eyewear order and earn 300 reward points ($15 in Rewards) through our official partnership link.
        </p>
      </div>

      {/* Reward Stacking Preview Grid */}
      <div className="grid grid-cols-3 gap-2.5 text-center text-xs font-mono">
        <div className="bg-black/40 border border-white/5 p-2.5 rounded-xl">
          <span className="text-[10px] text-slate-400 block uppercase">1 Referral</span>
          <strong className="text-cyan-300 text-sm">$15</strong>
          <span className="text-[9px] text-slate-500 block">300 Pts</span>
        </div>
        <div className="bg-black/40 border border-white/5 p-2.5 rounded-xl">
          <span className="text-[10px] text-slate-400 block uppercase">5 Referrals</span>
          <strong className="text-amber-300 text-sm">$75</strong>
          <span className="text-[9px] text-slate-500 block">1,500 Pts</span>
        </div>
        <div className="bg-black/40 border border-white/5 p-2.5 rounded-xl">
          <span className="text-[10px] text-slate-400 block uppercase">10 Referrals</span>
          <strong className="text-emerald-300 text-sm">$150</strong>
          <span className="text-[9px] text-slate-500 block">3,000 Pts</span>
        </div>
      </div>

      {/* Everyday Member Perks */}
      <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-2xl p-3.5 space-y-2 text-xs font-mono">
        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
          ✨ Everyday Zenni Rewards Member Perks:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5 bg-black/30 p-2 rounded-lg border border-white/5">
            <span>🚚</span>
            <span>Free standard US shipping over $65²</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/30 p-2 rounded-lg border border-white/5">
            <span>💸</span>
            <span>Earn 1 point on every $1 spent</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/30 p-2 rounded-lg border border-white/5">
            <span>🎂</span>
            <span>Enjoy a special birthday gift</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-2">
        <a
          href={referralUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-12 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
        >
          <span>Claim $15 Off at Zenni Optical</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Legal Policy Links */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-white/5 pt-3">
        <span>*New customers only. Exclusions apply.</span>
        <div className="flex gap-3">
          <a href={privacyUrl} target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 underline">Privacy Policy</a>
          <span>·</span>
          <a href={termsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 underline">Terms of Use</a>
        </div>
      </div>
    </div>
  );
};
```

---

### B. Social Media & Email Campaign Snippets

#### 🐦 X / Twitter / Threads Broadcast
> 👓 **Sharper Vision, Bigger Savings!** ✨
> 
> We’ve partnered with @ZenniOptical to bring you **$15 OFF** your first pair of prescription glasses, blue-light blockers, or polarized sunglasses:
> 
> 🎁 Claim your $15 discount coupon here: http://rwrd.io/r7jn9f2?c
> 
> Spread the love & stack your rewards! #ZenniOptical #Affiliate #Savings #Eyewear #RapportVerse #MiniBarnMaster

#### 💼 Community Newsletter / Discord Announcement
> **👓 Partner Perk: Zenni Optical $15 Community Savings**
> 
> Looking for high-quality prescription glasses, safety goggles, or blue-light blocking lenses for long gaming/coding sessions?
> 
> We're proud to share our official Zenni Optical partnership link. First-time buyers get **$15 off**, and you can refer friends to stack $15 (300 points) for every referral.
> 
> 👉 **Get Your $15 Voucher**: http://rwrd.io/r7jn9f2?c  
> 📜 *Privacy*: https://www.zennioptical.com/privacy-policy | *Terms*: https://www.zennioptical.com/terms-of-use

---

## 5. Ecosystem Alignment

| Application | Integration Touchpoint | Primary Use Case |
| :--- | :--- | :--- |
| **PowerUpBossTycoon** | `/src/components/PartnersView.tsx` | Armory partner hub & player discount desk |
| **MiniBarnMaster** | Construction Safety & Eyewear Hub | Workshop safety goggles & protective glasses |
| **RapportVerse** | Community Perk & Wellness Directory | Visual ergonomics & connection lifestyle benefits |
