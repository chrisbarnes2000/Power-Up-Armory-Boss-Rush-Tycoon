import React from 'react';
import { ExternalLink, ShieldCheck, Sparkles, Terminal, FileText, Globe, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'Shop' | 'Game' | 'Stats' | 'Lore') => void;
  onOpenTour?: () => void;
  onOpenAccount?: () => void;
}

export default function Footer({ onNavigate, onOpenTour, onOpenAccount }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="app-global-footer" className="w-full bg-[#080d1a] border-t border-[#1a2942] mt-16 text-slate-400 py-10 px-4 sm:px-8 transition-colors">
      <div className="max-w-[1720px] mx-auto flex flex-col gap-8">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand & RapportVerse Partnership */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">⚔️</span>
              <span className="font-extrabold text-white text-lg tracking-tight">
                Power-Up Armory <span className="text-amber-400 text-xs font-mono uppercase bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full ml-1">Boss Rush</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gamified commerce and arcade tycoon combat system. Power up champions, defeat mythical bosses, and redeem cryptographic receipt keys.
            </p>

            {/* RapportVerse Partnership Callout */}
            <div className="mt-2 p-3 rounded-xl bg-gradient-to-r from-amber-950/30 to-indigo-950/30 border border-amber-500/25 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Proud Partner of RapportVerse
                </span>
                <span className="text-[10px] font-mono text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-400/30">
                  Affiliated
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-normal">
                Visual human relationship mapping, qualitative trust topology, and neurodiversity-affirming connection architecture.
              </p>
              <a
                href="https://rapprt.space"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors w-fit group"
              >
                <span>Visit RapportVerse (rapprt.space)</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation & Systems */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              System Modules
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('Shop')}
                  className="hover:text-cyan-300 transition text-left cursor-pointer flex items-center gap-1.5"
                >
                  <span>🛒</span>
                  <span>Power-Up Armory Storefront</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('Game')}
                  className="hover:text-cyan-300 transition text-left cursor-pointer flex items-center gap-1.5"
                >
                  <span>⚔️</span>
                  <span>Boss Rush Gauntlet & Tycoon</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('Stats')}
                  className="hover:text-cyan-300 transition text-left cursor-pointer flex items-center gap-1.5"
                >
                  <span>🏆</span>
                  <span>Global Cloud Leaderboard</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('Lore')}
                  className="hover:text-cyan-300 transition text-left cursor-pointer flex items-center gap-1.5"
                >
                  <span>📜</span>
                  <span>Compendium & Chronicles Lore Book</span>
                </button>
              </li>
              {onOpenTour && (
                <li>
                  <button
                    onClick={onOpenTour}
                    className="hover:text-amber-300 text-amber-400/90 font-semibold transition text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🧭</span>
                    <span>Launch 20-Step Interactive Tour</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Public Files & AI Indexing */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              Public Files & AI Index
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <a
                  href="/llms.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 transition flex items-center justify-between group"
                >
                  <span className="font-mono text-emerald-400">/llms.txt</span>
                  <span className="text-[10px] text-slate-500">LLM Markdown Spec</span>
                </a>
              </li>
              <li>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 transition flex items-center justify-between group"
                >
                  <span className="font-mono text-slate-300">/robots.txt</span>
                  <span className="text-[10px] text-slate-500">Crawler Rules</span>
                </a>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 transition flex items-center justify-between group"
                >
                  <span className="font-mono text-slate-300">/sitemap.xml</span>
                  <span className="text-[10px] text-slate-500">Site Map</span>
                </a>
              </li>
              <li>
                <a
                  href="/site.webmanifest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 transition flex items-center justify-between group"
                >
                  <span className="font-mono text-slate-300">/site.webmanifest</span>
                  <span className="text-[10px] text-slate-500">PWA Manifest</span>
                </a>
              </li>
              <li className="flex gap-2 pt-1">
                <a
                  href="/400.html"
                  target="_blank"
                  className="text-[10px] bg-slate-800/80 hover:bg-slate-700 px-2 py-0.5 rounded text-slate-300"
                >
                  400 Error
                </a>
                <a
                  href="/404.html"
                  target="_blank"
                  className="text-[10px] bg-slate-800/80 hover:bg-slate-700 px-2 py-0.5 rounded text-slate-300"
                >
                  404 Error
                </a>
                <a
                  href="/500.html"
                  target="_blank"
                  className="text-[10px] bg-slate-800/80 hover:bg-slate-700 px-2 py-0.5 rounded text-slate-300"
                >
                  500 Error
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust, Security & Compliance */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Governance & Standards
            </h4>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-300 font-medium">NASA JPL Power of 10</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span className="text-slate-300 font-medium">WCAG 2.1/2.2 AA Accessible</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="text-slate-300 font-medium">ITIL v4 Service Management</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span className="text-slate-300 font-medium">IEEE 830 SRS / FSD Spec</span>
              </div>
            </div>

            {onOpenAccount && (
              <button
                onClick={onOpenAccount}
                className="mt-2 text-xs bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 py-1.5 px-3 rounded-lg flex items-center justify-between cursor-pointer transition"
              >
                <span>Firebase Authentication</span>
                <span className="text-[10px] font-mono text-emerald-400">Cloud Sync</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Bar: Copyright, RapportVerse URI & Legal */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-center sm:text-left">
            <span>
              &copy; {currentYear} <strong>Power-Up Armory</strong>. All rights reserved.
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span>
              Affiliated & Powered by{' '}
              <a
                href="https://rapprt.space"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 transition"
              >
                RapportVerse (https://rapprt.space)
              </a>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              Built with <Heart className="w-3 h-3 text-red-500 inline fill-red-500" /> for Champions
            </span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-[11px] text-slate-400">v1.2.1</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
