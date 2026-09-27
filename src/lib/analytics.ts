import { getAnalytics, isSupported, logEvent, Analytics } from 'firebase/analytics';
import { app } from './firebase';
import { APP_CONFIG } from '../config/appConfig';

const GA_MEASUREMENT_ID = APP_CONFIG.analytics.googleAnalyticsMeasurementId;
const VEMETRIC_PROJECT_ID = APP_CONFIG.analytics.vemetricProjectId;

export interface CookieConsentPreferences {
  necessary: boolean;  // Essential for session & cloud saving
  analytics: boolean;  // GA & Vemetric
  marketing: boolean;  // Conversion & promo tracking
  decided: boolean;
}

const CONSENT_KEY = 'armory_cookie_consent';
export const ANON_UID_KEY = 'armory_anon_uid';

export const DEFAULT_CONSENT: CookieConsentPreferences = {
  necessary: true,
  analytics: true,
  marketing: true,
  decided: true
};

let firebaseAnalyticsInstance: Analytics | null = null;
let isInitialized = false;

// Declare global telemetry objects
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    vmtrc?: (...args: any[]) => void;
    vmtrcq?: any[][];
    vemetric?: {
      track: (eventName: string, data?: Record<string, any>) => void;
      page: (pageName?: string) => void;
      identify?: (userId: string, traits?: Record<string, any>) => void;
    };
  }
}

/**
 * Get saved consent preferences from localStorage
 */
export function getSavedConsent(): CookieConsentPreferences {
  if (typeof window === 'undefined') return DEFAULT_CONSENT;
  try {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        necessary: true,
        analytics: parsed.analytics !== undefined ? !!parsed.analytics : true,
        marketing: parsed.marketing !== undefined ? !!parsed.marketing : true,
        decided: true
      };
    }
  } catch {
    // Ignore parse errors and fallback
  }
  return DEFAULT_CONSENT;
}

/**
 * Save user consent preferences to localStorage
 */
export function saveConsent(consent: Partial<CookieConsentPreferences>): CookieConsentPreferences {
  const current = getSavedConsent();
  const updated: CookieConsentPreferences = {
    necessary: true,
    analytics: consent.analytics !== undefined ? !!consent.analytics : current.analytics,
    marketing: consent.marketing !== undefined ? !!consent.marketing : current.marketing,
    decided: true
  };

  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(updated));
  } catch {}

  applyConsentToTrackers(updated);
  return updated;
}

/**
 * Apply consent parameters to Google Tag and Vemetric
 */
function applyConsentToTrackers(consent: CookieConsentPreferences) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage: consent.analytics ? 'granted' : 'denied',
      ad_storage: consent.marketing ? 'granted' : 'denied',
      ad_user_data: consent.marketing ? 'granted' : 'denied',
      ad_personalization: consent.marketing ? 'granted' : 'denied'
    });
  }

  if (consent.analytics && !firebaseAnalyticsInstance) {
    initFirebaseAnalytics();
  }

  if (consent.analytics) {
    initVemetric();
  }
}

/**
 * Initialize Firebase Analytics safely
 */
async function initFirebaseAnalytics() {
  try {
    const supported = await isSupported();
    if (supported && !firebaseAnalyticsInstance && app) {
      firebaseAnalyticsInstance = getAnalytics(app);
    }
  } catch {}
}

/**
 * Initialize Vemetric tracking script
 */
function initVemetric() {
  if (typeof window === 'undefined') return;

  window.vmtrcq = window.vmtrcq || [];

  if (!window.vemetric) {
    window.vemetric = {
      track: (eventName: string, data?: Record<string, any>) => {
        if (typeof window.vmtrc === 'function') {
          window.vmtrc('trackEvent', eventName, data);
        } else {
          window.vmtrcq?.push(['trackEvent', eventName, data]);
        }
      },
      page: (pagePathOrName?: string) => {
        const targetPath = pagePathOrName 
          ? (pagePathOrName.startsWith('/') ? pagePathOrName : `/${pagePathOrName}`)
          : window.location.pathname || '/';
        if (typeof window.vmtrc === 'function') {
          window.vmtrc('trackPageView', targetPath);
        } else {
          window.vmtrcq?.push(['trackPageView', targetPath]);
        }
      },
      identify: (userId: string, traits?: Record<string, any>) => {
        if (typeof window.vmtrc === 'function') {
          window.vmtrc('identify', userId, traits);
        } else {
          window.vmtrcq?.push(['identify', userId, traits]);
        }
      }
    };
  }

  // Inject Vemetric script if not already present
  if (!document.getElementById('vemetric-script') && VEMETRIC_PROJECT_ID) {
    const script = document.createElement('script');
    script.id = 'vemetric-script';
    script.defer = true;
    script.src = 'https://cdn.vemetric.com/main.js';
    script.setAttribute('data-token', VEMETRIC_PROJECT_ID);
    script.setAttribute('data-allow-cookies', 'true');
    script.setAttribute('data-track-page-views', 'true');
    script.onerror = () => {
      // Fallback silently if CDN unavailable
    };
    document.head.appendChild(script);
  }
}

/**
 * Main Analytics Initialization
 */
export function initAnalytics() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };
  }

  const consent = getSavedConsent();

  // Set default gtag consent
  window.gtag('consent', 'default', {
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    ad_storage: consent.marketing ? 'granted' : 'denied',
    ad_user_data: consent.marketing ? 'granted' : 'denied',
    ad_personalization: consent.marketing ? 'granted' : 'denied',
    wait_for_update: 500
  });

  // Inject Google Analytics gtag.js script if GA_MEASUREMENT_ID is configured
  if (!document.getElementById('gtag-script') && GA_MEASUREMENT_ID) {
    const script = document.createElement('script');
    script.id = 'gtag-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: true,
      cookie_flags: 'SameSite=None;Secure'
    });
  }

  applyConsentToTrackers(consent);
}

/**
 * Track custom event across Google Analytics, Vemetric, and Firebase
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  const consent = getSavedConsent();

  // 1. Google Analytics
  if (consent.analytics || consent.marketing) {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  }

  // 2. Firebase Analytics
  if (consent.analytics && firebaseAnalyticsInstance) {
    try {
      logEvent(firebaseAnalyticsInstance, eventName, params);
    } catch {}
  }

  // 3. Vemetric
  if (consent.analytics && window.vemetric) {
    try {
      window.vemetric.track(eventName, params);
    } catch {}
  }
}

/**
 * Track virtual page views across navigation tabs
 */
export function trackPageView(pageName: string, pagePath?: string) {
  const normalizedPath = pagePath 
    ? (pagePath.startsWith('/') ? pagePath : `/${pagePath}`)
    : `/${pageName.toLowerCase().replace(/\s+/g, '_')}`;

  trackEvent('page_view', {
    page_title: pageName,
    page_location: typeof window !== 'undefined' ? `${window.location.origin}${normalizedPath}` : '',
    page_path: normalizedPath
  });

  if (window.vemetric) {
    window.vemetric.page(normalizedPath);
  }
}

/**
 * Track boss battle events
 */
export function trackBossBattle(bossId: string, outcome: 'victory' | 'defeat', details: Record<string, any> = {}) {
  trackEvent('boss_battle_completed', {
    boss_id: bossId,
    outcome,
    ...details
  });
}

/**
 * Track seasonal reward claims
 */
export function trackRewardClaim(tierId: string, title: string, coins: number, gems: number) {
  trackEvent('seasonal_reward_claimed', {
    reward_id: tierId,
    reward_title: title,
    coins_reward: coins,
    gems_reward: gems
  });
}
