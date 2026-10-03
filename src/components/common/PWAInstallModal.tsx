import React, { useEffect, useState } from 'react';
import { Sparkles, X, Chrome, Compass, Share, Smartphone, Laptop, CheckCircle, Info, Gift, Award } from 'lucide-react';
import { GameState } from '../../types';
import { CoinIcon } from '../CoinIcon';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onClaimBonus: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ 
  isOpen, 
  onClose,
  gameState,
  onClaimBonus 
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [activeTab, setActiveTab] = useState<'chromium' | 'safari'>('chromium');

  const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-09"
  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const hasClaimedThisMonth = gameState.pwaBonusClaimedMonth === currentMonth;

  useEffect(() => {
    // Detect if app is running in standalone PWA mode
    const checkStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(checkStandalone);

    // Detect OS details
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIOSDevice);

    // Detect if browser is Safari specifically
    const isSafariBrowser = /safari/.test(ua) && !/chrome|crios|fxios|opr|edg/.test(ua);
    setIsSafari(isSafariBrowser);

    // Auto-focus Safari tab for iOS users
    if (isIOSDevice) {
      setActiveTab('safari');
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  // Native Chromium install trigger
  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        if (!hasClaimedThisMonth) {
          onClaimBonus();
        }
        onClose();
      }
    } catch (err) {
      console.warn('Native PWA install prompt failed:', err);
    }
  };

  // Web Share API to trigger native Safari iOS Share menu
  const handleIOSShareTrigger = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Power-Up Armory — Boss Rush',
          text: 'Power up mythical weapons and challenge the Boss Rush Gauntlet on the go!',
          url: window.location.origin
        });
      } catch (err) {
        console.log('Share prompt dismissed:', err);
      }
    } else {
      // Fallback alert
      alert('The Web Share API is not supported on this browser version. To install, please click your browser\'s standard Share button manually!');
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 pb-20 sm:pb-24 animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0c1322] border-2 border-cyan-500/50 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[88vh] overflow-hidden text-slate-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#0e172a]/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl animate-pulse">📱</span>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                <span>App Installation Desk</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-sans uppercase font-bold tracking-widest animate-pulse">PWA v1.3</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">Run Power-Up Armory like a native application</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer text-sm font-bold"
            title="Close Install Desk"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* MONTHLY PWA INSTALLATION REWARD CARD */}
          <div className="bg-linear-to-r from-[#171b30] via-[#1c2438] to-[#121c2e] border-2 border-amber-500/50 rounded-2xl p-4 shadow-[0_0_20px_rgba(245,158,11,0.15)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400 animate-bounce" />
                <h4 className="font-black text-xs uppercase font-mono text-amber-300 tracking-wider">
                  Monthly PWA Installation Grant
                </h4>
              </div>
              <span className="text-[9px] font-mono text-amber-400 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                {currentMonthName}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Install the web app to receive a recurring monthly champion grant of <strong className="text-yellow-400 font-mono">5,000 Gold</strong> and <strong className="text-sky-300 font-mono">250 Gems</strong>!
            </p>

            <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl p-2.5">
              <div className="flex items-center gap-3 text-xs font-mono font-black">
                <span className="flex items-center gap-1 text-yellow-400">
                  <CoinIcon className="w-4 h-4" />
                  <span>+5,000 Coins</span>
                </span>
                <span className="flex items-center gap-1 text-sky-300">
                  <span>💎</span>
                  <span>+250 Gems</span>
                </span>
              </div>

              {hasClaimedThisMonth ? (
                <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Claimed for {currentMonthName}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onClaimBonus}
                  className="px-3.5 py-1.5 rounded-lg bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black font-mono text-xs uppercase tracking-wider cursor-pointer shadow-md shadow-amber-500/20 active:scale-95 transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  <span>Claim Grant</span>
                </button>
              )}
            </div>

            {hasClaimedThisMonth && (
              <p className="text-[10px] text-slate-400 font-mono italic text-center">
                ✨ Monthly grant claimed! Your next recurring grant will unlock on the 1st of next month.
              </p>
            )}
          </div>

          {isStandalone && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-emerald-300">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold uppercase tracking-wider font-mono">Running Standalone!</p>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  Excellent! You are currently running the applet inside its standalone window. You have offline capabilities, hardware acceleration, and quick access!
                </p>
              </div>
            </div>
          )}

          {!isStandalone && (
            <>
              {/* OS Switcher Tabs */}
              <div className="flex bg-[#121c30] border border-[#2a4060] rounded-xl p-1 shrink-0">
                <button
                  onClick={() => setActiveTab('chromium')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition font-mono ${
                    activeTab === 'chromium' ? 'bg-cyan-600 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Chrome className="w-4 h-4" />
                  <span>Chromium / Android</span>
                </button>
                <button
                  onClick={() => setActiveTab('safari')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition font-mono ${
                    activeTab === 'safari' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Safari / iOS</span>
                </button>
              </div>

              {/* Tab 1: Chromium / Desktop / Android */}
              {activeTab === 'chromium' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-[#0e1628] border border-[#1a2540] rounded-2xl p-4 space-y-3.5">
                    <h4 className="text-xs font-black uppercase font-mono text-cyan-400 flex items-center gap-2 border-b border-white/5 pb-2">
                      <Laptop className="w-4 h-4" />
                      <span>Desktop (Chrome, Edge, Opera)</span>
                    </h4>
                    <ol className="text-xs text-slate-300 space-y-2 font-mono list-decimal pl-4 leading-relaxed">
                      <li>Open the game in a Chromium browser (<strong className="text-white">Google Chrome</strong> or <strong className="text-white">Microsoft Edge</strong>).</li>
                      <li>Click the **Install Icon (🖥️📥)** in the rightmost corner of the URL address bar.</li>
                      <li>Alternatively, click the menu button **(⋮)** and select <strong className="text-cyan-400">"Save and share" → "Install app"</strong>.</li>
                      <li>Confirm the installation to pin the Armory shortcut directly to your computer desktop!</li>
                    </ol>
                  </div>

                  <div className="bg-[#0e1628] border border-[#1a2540] rounded-2xl p-4 space-y-3.5">
                    <h4 className="text-xs font-black uppercase font-mono text-cyan-400 flex items-center gap-2 border-b border-white/5 pb-2">
                      <Smartphone className="w-4 h-4" />
                      <span>Android (Chrome)</span>
                    </h4>
                    <ol className="text-xs text-slate-300 space-y-2 font-mono list-decimal pl-4 leading-relaxed">
                      <li>Launch Google Chrome on your Android mobile device.</li>
                      <li>Tap the browser options menu **(⋮)** in the top-right corner.</li>
                      <li>Select <strong className="text-cyan-400">"Add to Home Screen"</strong> or <strong className="text-cyan-400">"Install app"</strong>.</li>
                      <li>Confirm to place the application icon on your mobile home screen with a dedicated splash screen!</li>
                    </ol>
                  </div>

                  {/* Native Install Button Trigger */}
                  {deferredPrompt ? (
                    <button
                      type="button"
                      onClick={handleNativeInstall}
                      className="w-full py-3 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black font-mono text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-cyan-500/25 active:scale-95 transition flex items-center justify-center gap-2"
                    >
                      <span>📥 INSTALL APP NOW (ONE-TAP)</span>
                    </button>
                  ) : (
                    <div className="p-3 bg-slate-900/40 border border-slate-700/30 rounded-xl text-[10px] text-slate-400 font-mono text-center flex items-center gap-2 justify-center">
                      <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Automatic one-tap prompt is ready when Chrome triggers it. If missing, use the browser menu above!</span>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Safari on iOS (iPhone & iPad) */}
              {activeTab === 'safari' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-[#0e1628] border border-[#1a2540] rounded-2xl p-4 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <h4 className="text-xs font-black uppercase font-mono text-amber-400 flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        <span>iOS Safari Step-by-Step</span>
                      </h4>
                      {isSafari && (
                        <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-950 border border-amber-500/30 px-1.5 py-0.2 rounded-full uppercase animate-pulse">
                          Compatible Safari
                        </span>
                      )}
                    </div>
                    
                    <ol className="text-xs text-slate-300 space-y-2.5 font-mono list-decimal pl-4 leading-relaxed">
                      <li>
                        Launch <strong className="text-white">Safari Browser</strong> on your iPhone or iPad. Other iOS browsers (Chrome/Firefox) do not support home screen installations.
                      </li>
                      <li>
                        Tap the native iOS <strong className="text-amber-400 flex items-center gap-1.5 inline-flex">Share Button <Share className="w-3.5 h-3.5 text-amber-400 inline" /></strong> on the Safari bottom navigation bar.
                      </li>
                      <li>
                        Scroll down through the share options list and select <strong className="text-white">"Add to Home Screen" (➕)</strong>.
                      </li>
                      <li>
                        Customize the display name if desired and tap <strong className="text-amber-400">"Add"</strong> in the top-right corner to complete!
                      </li>
                    </ol>
                  </div>

                  {/* iOS Deep Link Trigger / Native Share sheet caller */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleIOSShareTrigger}
                      className="w-full py-3 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black font-mono text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 transition flex items-center justify-center gap-2"
                    >
                      <Share className="w-4 h-4" />
                      <span>📤 OPEN SAFARI SHARE SHEET NOW</span>
                    </button>
                    <p className="text-[9px] text-slate-500 font-mono text-center leading-normal">
                      💡 Clicking above opens iOS native sharing. In Safari, select **"Add to Home Screen"** to save!
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer info banner */}
        <div className="p-4 bg-slate-950 border-t border-white/10 shrink-0 flex items-center gap-2.5 text-[10px] text-slate-400 font-mono">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>PWAs enable instant loading, fully-integrated storage syncing, and optimal viewport presence.</span>
        </div>

      </div>
    </div>
  );
};

