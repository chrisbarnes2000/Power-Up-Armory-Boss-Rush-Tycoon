import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Cookie, Settings, Check, X, Info } from 'lucide-react';
import { getSavedConsent, saveConsent, CookieConsentPreferences } from '../../lib/analytics';
import { useFocusTrap } from '../../lib/useFocusTrap';

interface CookieConsentBannerProps {
  onConsentChange?: (consent: CookieConsentPreferences) => void;
}

export default function CookieConsentBanner({ onConsentChange }: CookieConsentBannerProps) {
  const [consent, setConsent] = useState<CookieConsentPreferences>(getSavedConsent());
  const [showBanner, setShowBanner] = useState<boolean>(!consent.decided);
  const [showModal, setShowModal] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(modalRef, {
    isOpen: showModal,
    onDismiss: () => setShowModal(false)
  });

  // Draft preferences inside settings modal
  const [draftAnalytics, setDraftAnalytics] = useState<boolean>(consent.analytics);
  const [draftMarketing, setDraftMarketing] = useState<boolean>(consent.marketing);

  useEffect(() => {
    // Listen for global custom event to open preferences modal from footer or account settings
    const handleOpenModal = () => {
      const current = getSavedConsent();
      setDraftAnalytics(current.analytics);
      setDraftMarketing(current.marketing);
      setShowModal(true);
    };

    window.addEventListener('open-cookie-preferences', handleOpenModal);
    return () => window.removeEventListener('open-cookie-preferences', handleOpenModal);
  }, []);

  const handleAcceptAll = () => {
    const updated = saveConsent({ analytics: true, marketing: true });
    setConsent(updated);
    setShowBanner(false);
    setShowModal(false);
    if (onConsentChange) onConsentChange(updated);
  };

  const handleEssentialOnly = () => {
    const updated = saveConsent({ analytics: false, marketing: false });
    setConsent(updated);
    setShowBanner(false);
    setShowModal(false);
    if (onConsentChange) onConsentChange(updated);
  };

  const handleSaveModalCustom = () => {
    const updated = saveConsent({ analytics: draftAnalytics, marketing: draftMarketing });
    setConsent(updated);
    setShowBanner(false);
    setShowModal(false);
    if (onConsentChange) onConsentChange(updated);
  };

  return (
    <>
      {/* GDPR Bottom Banner */}
      {showBanner && !showModal && (
        <div 
          id="cookie-consent-banner"
          role="region"
          aria-label="Cookie and Privacy Consent"
          className="fixed bottom-0 inset-x-0 z-high p-4 sm:p-6 bg-[#0a0e1a]/95 backdrop-blur-md border-t border-[#1e2d4a] shadow-2xl transition-all animate-fade-in"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3 max-w-3xl">
              <div className="p-2.5 bg-indigo-500/20 rounded-2xl text-indigo-400 shrink-0 mt-0.5 border border-indigo-500/30">
                <Cookie className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Privacy & Cookie Preferences
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    GDPR Compliant
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  We use essential cookies to maintain secure sessions. With your permission, we also use optional analytics (Firebase & Vemetric) and marketing tags (Google Analytics GTG) to track promo code conversions and improve your experience.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#1e2d4a]">
              <button
                id="cookie-settings-btn"
                type="button"
                onClick={() => {
                  setDraftAnalytics(consent.analytics);
                  setDraftMarketing(consent.marketing);
                  setShowModal(true);
                }}
                className="flex-1 md:flex-initial px-3.5 py-2 bg-[#121c32] hover:bg-[#182645] text-slate-200 text-xs font-semibold rounded-xl border border-white/10 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Settings className="h-3.5 w-3.5 text-slate-400" />
                <span>Customize</span>
              </button>

              <button
                id="cookie-essential-btn"
                type="button"
                onClick={handleEssentialOnly}
                className="flex-1 md:flex-initial px-3.5 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Essential Only
              </button>

              <button
                id="cookie-accept-all-btn"
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 md:flex-initial px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Accept All</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Cookie Preferences Settings Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-modal-title"
            className="bg-[#0e1628] border border-[#203354] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#203354] flex items-center justify-between bg-[#121c32]">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30" aria-hidden="true">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 id="cookie-modal-title" className="text-base font-bold text-white">
                    Cookie & Tracking Settings
                  </h3>
                  <p className="text-xs text-slate-400">
                    Manage consent parameters for analytics & GTG conversion tracking
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close cookie preferences"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Category 1: Essential / Necessary (Locked) */}
              <div className="p-4 rounded-xl border border-[#203354] bg-[#101b30] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white">
                      Essential & Functional Cookies
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                      Always Active
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Required for user authentication, security, account session management, and core database interactions. These cannot be disabled.
                </p>
              </div>

              {/* Category 2: Analytics (Firebase Analytics & Vemetric) */}
              <div className="p-4 rounded-xl border border-[#203354] bg-[#121c32] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    Analytics & Diagnostic Cookies
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="cookie-analytics-checkbox"
                      aria-label="Analytics and diagnostic cookies"
                      type="checkbox"
                      checked={draftAnalytics}
                      onChange={(e) => setDraftAnalytics(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enables <strong>Firebase Analytics</strong> and <strong>Vemetric</strong> to gather aggregated usage performance, page view stats, and app reliability metrics.
                </p>
              </div>

              {/* Category 3: Marketing & Conversion Tracking (Google Tag / GTG) */}
              <div className="p-4 rounded-xl border border-[#203354] bg-[#121c32] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    Marketing & GTG Conversion Tags
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="cookie-marketing-checkbox"
                      aria-label="Marketing and conversion tracking"
                      type="checkbox"
                      checked={draftMarketing}
                      onChange={(e) => setDraftMarketing(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enables <strong>Google Tag (GTG)</strong> conversion tracking when promotional discount codes lead to armory item purchases and sales.
                </p>
              </div>

              <div className="flex items-start space-x-2 text-[11px] text-slate-400 pt-1">
                <Info className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
                <span>
                  You can modify your consent settings at any time from the site footer or Account settings.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#203354] flex items-center justify-end space-x-2 bg-[#101b30]">
              <button
                type="button"
                onClick={handleEssentialOnly}
                className="px-4 py-2 border border-slate-700 text-xs font-semibold text-slate-300 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Reject Optional
              </button>
              <button
                type="button"
                onClick={handleSaveModalCustom}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Helper function for site footer or profile settings to trigger the preference modal
 */
export function openCookiePreferencesModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-cookie-preferences'));
  }
}
