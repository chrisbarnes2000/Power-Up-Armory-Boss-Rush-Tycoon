import { getAnalytics, isSupported, logEvent, Analytics } from 'firebase/analytics';
import { app } from './firebase';
import { APP_CONFIG } from '../config/appConfig';
import {
  initVemetric,
  vemetricIdentify,
  vemetricUpdateUser,
  vemetricTrack,
  vemetricPage,
  vemetricResetUser,
  getVemetricIdentifier,
  VemetricUpdateUserPayload,
  VemetricIdentifyOptions,
  VEMETRIC_PROJECT_ID
} from './analytics/vemetric';

export {
  initVemetric,
  vemetricIdentify,
  vemetricUpdateUser,
  vemetricTrack,
  vemetricPage,
  vemetricResetUser,
  getVemetricIdentifier,
  VEMETRIC_PROJECT_ID
};
export type { VemetricUpdateUserPayload, VemetricIdentifyOptions };

const GA_MEASUREMENT_ID = APP_CONFIG.analytics.googleAnalyticsMeasurementId;

/**
 * Developer Workspace & AI Studio Container Detection
 */
export const DEV_WORKSPACE_IGNORE_LIST = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  'ais-dev-',
  'us-east5.run.app',
  'run.app',
  'googleusercontent.com',
  'aistudio.google.com',
  'cloudshell.dev',
  'webcontainer.io',
  'stackblitz.io'
];

/**
 * Check if the current session is running inside an AI Studio dev preview container or dev workspace
 */
export function isDevPreviewContainer(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const hostname = window.location.hostname.toLowerCase();
    const isAiStudioDev = DEV_WORKSPACE_IGNORE_LIST.some(pattern => hostname.includes(pattern));
    const metaEnv = (import.meta as any).env;
    const isViteDev = metaEnv?.DEV === true || metaEnv?.MODE === 'development';

    return isAiStudioDev || isViteDev;
  } catch {
    return false;
  }
}

export const isDevWorkspace = isDevPreviewContainer;

/**
 * Helper to ensure event names emitted from AI Studio preview containers are prefixed with `dev_`
 */
export function getTaggedEventName(eventName: string): string {
  if (isDevPreviewContainer()) {
    return eventName.startsWith('dev_') ? eventName : `dev_${eventName}`;
  }
  return eventName;
}

export interface CookieConsentPreferences {
  necessary: boolean;  // Essential for session & cloud saving
  analytics: boolean;  // GA & Vemetric
  marketing: boolean;  // Conversion & promo tracking
  decided: boolean;
}

const CONSENT_KEY = 'armory_cookie_consent';
export const ANON_UID_KEY = 'armory_anon_uid';
const DEVICE_ID_KEY = 'armory_device_client_id';
export const ATTRIBUTION_KEY = 'armory_inward_attribution';

export interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  ref?: string;
  creator?: string;
  squad_invite?: string;
  landing_url?: string;
  landing_path?: string;
  captured_at?: string;
}

let cachedAttribution: AttributionData | null = null;

/**
 * Capture inward UTM parameters, creator tags, and squad invites from current URL
 */
export function captureInwardAttribution(): AttributionData | null {
  if (typeof window === 'undefined') return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');
    const utmTerm = params.get('utm_term');
    const utmContent = params.get('utm_content');
    const ref = params.get('ref');
    const creator = params.get('creator');
    const squadInvite = params.get('invite') || params.get('squad') || params.get('code');

    const hasAttribution = !!(utmSource || utmMedium || utmCampaign || utmTerm || utmContent || ref || creator || squadInvite);

    if (hasAttribution) {
      const attribution: AttributionData = {
        ...(utmSource ? { utm_source: utmSource } : {}),
        ...(utmMedium ? { utm_medium: utmMedium } : {}),
        ...(utmCampaign ? { utm_campaign: utmCampaign } : {}),
        ...(utmTerm ? { utm_term: utmTerm } : {}),
        ...(utmContent ? { utm_content: utmContent } : {}),
        ...(ref ? { ref } : {}),
        ...(creator ? { creator } : {}),
        ...(squadInvite ? { squad_invite: squadInvite.toUpperCase() } : {}),
        landing_url: window.location.href,
        landing_path: window.location.pathname,
        captured_at: new Date().toISOString()
      };

      cachedAttribution = attribution;
      localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));

      // Emit attribution telemetry
      setTimeout(() => {
        trackEvent('campaign_attribution_captured', {
          ...attribution,
          source_type: creator ? 'creator_referral' : squadInvite ? 'squad_invite' : utmSource ? 'campaign' : 'direct_link'
        });
      }, 300);

      return attribution;
    }

    // Fall back to stored attribution from previous landing
    if (!cachedAttribution) {
      const stored = localStorage.getItem(ATTRIBUTION_KEY);
      if (stored) {
        cachedAttribution = JSON.parse(stored);
      }
    }

    return cachedAttribution;
  } catch {
    return null;
  }
}

/**
 * Get current or stored inward attribution metadata
 */
export function getStoredAttribution(): AttributionData | null {
  if (cachedAttribution) return cachedAttribution;
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(ATTRIBUTION_KEY);
    if (stored) {
      cachedAttribution = JSON.parse(stored);
      return cachedAttribution;
    }
  } catch {}
  return null;
}

/**
 * Helper to construct standardized outward URLs with partner UTM tags
 */
export function buildOutboundPartnerUrl(baseUrl: string, params: {
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
} = {}): string {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('utm_source', 'powerup_armory');
    url.searchParams.set('utm_medium', params.utm_medium || 'partner_link');
    url.searchParams.set('utm_campaign', params.utm_campaign || 'ecosystem_referral');
    if (params.utm_content) {
      url.searchParams.set('utm_content', params.utm_content);
    }
    return url.toString();
  } catch {
    return baseUrl;
  }
}

/**
 * Track user clicking an outward partner link (e.g. RapportVerse, MiniBarnMaster)
 */
export function trackOutboundPartnerClick(partnerName: string, destinationUrl: string, placement: string) {
  trackEvent('outbound_partner_click', {
    partner_name: partnerName,
    destination_url: destinationUrl,
    placement,
    utm_source: 'powerup_armory',
    utm_medium: placement,
    utm_campaign: `${partnerName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_ecosystem`
  });
}

/**
 * Track social leaderboard sharing (Twitter, Bluesky, Reddit, Native Web Share, Clipboard)
 */
export function trackLeaderboardShare(platform: string, details: Record<string, any> = {}) {
  trackEvent('leaderboard_shared', {
    platform,
    ...details
  });
}

/**
 * Track squad referral invite actions (shared or redeemed)
 */
export function trackSquadInvite(action: 'shared' | 'redeemed', code: string, details: Record<string, any> = {}) {
  trackEvent(action === 'shared' ? 'squad_invite_shared' : 'squad_invite_redeemed', {
    invite_code: code,
    ...details
  });
}

/**
 * Resolves a single, persistent device client ID per browser installation
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server_session';
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      const isDev = isDevPreviewContainer();
      const prefix = isDev ? 'dev_client_' : 'client_';
      deviceId = `${prefix}${Math.random().toString(36).substring(2, 11)}${Date.now().toString(36)}`;
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch {
    return 'fallback_device_id';
  }
}

export const DEFAULT_CONSENT: CookieConsentPreferences = {
  necessary: true,
  analytics: true,
  marketing: true,
  decided: false
};

let firebaseAnalyticsInstance: Analytics | null = null;
let isInitialized = false;

// Persistent User Identity Context
let currentUserId: string | null = typeof window !== 'undefined' ? (localStorage.getItem('armory_user_id') || null) : null;
let currentUserTraits: Record<string, any> = {};

// Declare global telemetry objects for Google Analytics dataLayer
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
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
 * Main Analytics Initialization
 */
export function initAnalytics() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  if (isDevPreviewContainer()) {
    console.info(
      `🏷️ [Dev Workspace Container] AI Studio preview host detected (${window.location.hostname}). Telemetry events will be prepended with dev_ and tagged as environment: 'dev_beta'.`
    );
  }

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

  // Initialize Vemetric script runtime
  initVemetric();

  // Anonymous Session Discipline:
  // Only restore identity if a real registered UID exists from a previous login.
  // DO NOT identify anonymous users with a client_id hash, so Vemetric can automatically
  // merge all prior anonymous sessions once the user signs in with Gmail/Email.
  const deviceId = getDeviceId();
  const savedRegisteredUid = currentUserId || (typeof window !== 'undefined' ? localStorage.getItem('armory_user_id') : null);

  if (savedRegisteredUid && typeof window !== 'undefined' && !savedRegisteredUid.startsWith('client_') && !savedRegisteredUid.startsWith('dev_client_')) {
    trackUserIdentify(savedRegisteredUid, currentUserTraits);
  } else if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('set', 'user_properties', {
      client_id: deviceId,
      registered_user: false
    });
  }

  // Capture and persist inward UTM / partner / squad referral attribution
  captureInwardAttribution();

  applyConsentToTrackers(consent);
}

/**
 * Track custom event across Google Analytics, Vemetric, and Firebase
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  const consent = getSavedConsent();
  if (!consent.analytics && !consent.marketing) return;

  const isDev = isDevPreviewContainer();
  const taggedEventName = getTaggedEventName(eventName);
  const deviceId = getDeviceId();
  const registeredUid = currentUserId || (typeof window !== 'undefined' ? localStorage.getItem('armory_user_id') : null);
  const activeUid = registeredUid || deviceId;
  const attribution = getStoredAttribution();

  // Auto-enrich parameters with user context, page context, timestamp, attribution, and DEV/BETA tags
  const enrichedParams: Record<string, any> = {
    ...params,
    user_id: activeUid,
    client_id: deviceId,
    registered_user: !!registeredUid,
    ...(attribution ? {
      attr_source: attribution.utm_source || 'direct',
      attr_medium: attribution.utm_medium || 'none',
      attr_campaign: attribution.utm_campaign || 'none',
      ...(attribution.creator ? { attr_creator: attribution.creator } : {}),
      ...(attribution.squad_invite ? { attr_squad_invite: attribution.squad_invite } : {}),
      ...(attribution.ref ? { attr_ref: attribution.ref } : {})
    } : {
      attr_source: 'direct',
      attr_medium: 'none',
      attr_campaign: 'none'
    }),
    ...(isDev ? {
      environment: 'dev_beta',
      environment_tag: 'dev/beta',
      is_dev_preview: true,
      app_channel: 'dev_workspace_preview'
    } : {
      environment: 'production',
      environment_tag: 'production',
      is_dev_preview: false,
      app_channel: 'production'
    }),
    ...(registeredUid ? {
      ...(currentUserTraits.email ? { user_email: currentUserTraits.email } : {}),
      ...(currentUserTraits.displayName ? {
        player_name: isDev ? `[DEV/BETA] ${currentUserTraits.displayName}` : currentUserTraits.displayName
      } : {})
    } : {}),
    page_location: typeof window !== 'undefined' ? window.location.href : '',
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    timestamp: new Date().toISOString()
  };

  // 1. Google Analytics
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', taggedEventName, enrichedParams);
  }

  // 2. Firebase Analytics
  if (consent.analytics && firebaseAnalyticsInstance) {
    try {
      logEvent(firebaseAnalyticsInstance, taggedEventName, enrichedParams);
    } catch {}
  }

  // 3. Vemetric (via dedicated module)
  if (consent.analytics) {
    vemetricTrack(taggedEventName, enrichedParams, currentUserTraits);
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

  vemetricPage(normalizedPath);
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

let isLoggingOut = false;

/**
 * Reset tracked user session on logout across Google Analytics and Vemetric
 * IMPORTANT: Emits the 'user_logged_out' event WHILE the user identity is STILL ACTIVE!
 * This guarantees the logout action is attributed to the registered user rather than creating an anonymous session.
 */
export function trackUserLogout(explicitUid?: string): void {
  if (typeof window === 'undefined') return;

  const loggingOutUid = explicitUid || currentUserId || localStorage.getItem('armory_user_id') || getVemetricIdentifier();

  // If there's no active user session, do nothing to avoid duplicate anonymous resets
  if (!loggingOutUid && !currentUserId) {
    return;
  }

  // Guard against re-entrancy / double firing from simultaneous AccountModal & onAuthStateChanged
  if (isLoggingOut) return;
  isLoggingOut = true;

  try {
    // 1. Dispatch explicit logout event WITH user identity attached before wiping
    trackEvent('user_logged_out', {
      user_id: loggingOutUid,
      registered_user: true,
      action: 'sign_out'
    });

    // 2. Reset Google Analytics User Identity
    if (typeof window.gtag === 'function') {
      if (GA_MEASUREMENT_ID) {
        window.gtag('config', GA_MEASUREMENT_ID, {
          user_id: null
        });
      }
      window.gtag('set', 'user_properties', {
        user_id: null,
        registered_user: false,
        displayName: null,
        email: null,
        is_anonymous: true
      });
    }

    // 3. Reset Vemetric User Identity via dedicated module
    // This calls window.vmtrc('resetUser') and clears sessionStorage _vmId, _vmDn
    vemetricResetUser();

    // 4. Cleanse stored identity markers
    try {
      localStorage.removeItem('armory_user_id');
      localStorage.removeItem('armory_anon_uid');
      localStorage.removeItem('armory_inward_attribution');
    } catch {}

    // 5. Clear in-memory identity
    currentUserId = null;
    currentUserTraits = {};
  } finally {
    // Reset lockout debounce after 1.5s
    setTimeout(() => {
      isLoggingOut = false;
    }, 1500);
  }
}

/**
 * Update authenticated user data attributes in Vemetric and Google Analytics
 */
export function trackUserUpdate(data: VemetricUpdateUserPayload): void {
  if (typeof window === 'undefined') return;
  const consent = getSavedConsent();
  if (!consent.analytics && !consent.marketing) return;

  const isDev = isDevPreviewContainer();
  const displayName = data.displayName 
    ? (isDev && !data.displayName.startsWith('[DEV/BETA]') ? `[DEV/BETA] ${data.displayName}` : data.displayName)
    : undefined;

  const payload: VemetricUpdateUserPayload = {
    ...(displayName ? { displayName } : {}),
    ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}),
    set: {
      ...(data.set || {}),
      environment: isDev ? 'dev_beta' : 'production',
      is_dev_preview: isDev,
      app_channel: isDev ? 'dev_workspace_preview' : 'production',
      updated_at: new Date().toISOString()
    },
    ...(data.setOnce ? { setOnce: data.setOnce } : {}),
    ...(data.unset ? { unset: data.unset } : {})
  };

  vemetricUpdateUser(payload);

  if (typeof window.gtag === 'function') {
    window.gtag('set', 'user_properties', {
      ...(displayName ? { display_name: displayName } : {}),
      ...(data.avatarUrl ? { avatar_url: data.avatarUrl } : {}),
      ...(payload.set || {})
    });
  }
}

/**
 * Identify authenticated user session across Google Analytics and Vemetric
 * Merges prior anonymous events into the identified user profile
 */
export function trackUserIdentify(userId: string, traits: Record<string, any> = {}): void {
  if (typeof window === 'undefined') return;
  if (currentUserId === userId) return;

  if (userId) {
    currentUserId = userId;
    currentUserTraits = { ...currentUserTraits, ...traits };
    try {
      localStorage.setItem('armory_user_id', userId);
    } catch {}

    const isDev = isDevPreviewContainer();
    const resolvedEmail = traits.email || (currentUserTraits.email as string) || undefined;
    const rawName = traits.displayName || (currentUserTraits.displayName as string) || (resolvedEmail ? resolvedEmail.split('@')[0] : 'Champion');
    const resolvedDisplayName = isDev && !rawName.startsWith('[DEV/BETA]') 
      ? `[DEV/BETA] ${rawName}` 
      : rawName;
    const resolvedAvatar = traits.avatarUrl || traits.avatar || (currentUserTraits.avatar as string) || '⚔️';
    const resolvedAvatarUrl = typeof resolvedAvatar === 'string' && resolvedAvatar.startsWith('http') ? resolvedAvatar : undefined;
    const attribution = getStoredAttribution();

    // Prepare traits for user updates
    const updateUserPayload: VemetricUpdateUserPayload = {
      displayName: resolvedDisplayName,
      avatarUrl: resolvedAvatarUrl,
      set: {
        userId,
        email: resolvedEmail,
        displayName: resolvedDisplayName,
        avatar: resolvedAvatar,
        title: traits.title || currentUserTraits.title || 'Grand Champion',
        powerScore: traits.powerScore ?? currentUserTraits.powerScore ?? 0,
        totalBossesDefeated: traits.totalBossesDefeated ?? currentUserTraits.totalBossesDefeated ?? 0,
        coins: traits.coins ?? currentUserTraits.coins ?? 0,
        gems: traits.gems ?? currentUserTraits.gems ?? 0,
        registered_user: true,
        is_anonymous: false,
        environment: isDev ? 'dev_beta' : 'production',
        environment_tag: isDev ? 'dev/beta' : 'production',
        is_dev_preview: isDev,
        app_channel: isDev ? 'dev_workspace_preview' : 'production',
        ...(attribution?.utm_source ? { last_attr_source: attribution.utm_source } : {}),
        ...(attribution?.utm_medium ? { last_attr_medium: attribution.utm_medium } : {}),
        ...(attribution?.utm_campaign ? { last_attr_campaign: attribution.utm_campaign } : {}),
        ...(attribution?.creator ? { last_attr_creator: attribution.creator } : {}),
        ...(attribution?.squad_invite ? { last_attr_squad: attribution.squad_invite } : {})
      },
      setOnce: {
        first_identified_at: new Date().toISOString(),
        ...(attribution?.utm_source ? { initial_attr_source: attribution.utm_source } : {}),
        ...(attribution?.utm_medium ? { initial_attr_medium: attribution.utm_medium } : {}),
        ...(attribution?.utm_campaign ? { initial_attr_campaign: attribution.utm_campaign } : {}),
        ...(attribution?.creator ? { initial_attr_creator: attribution.creator } : {})
      },
      ...(traits.unset ? { unset: traits.unset } : {})
    };

    // 1. Google Analytics User Identity
    if (typeof window.gtag === 'function') {
      if (GA_MEASUREMENT_ID) {
        window.gtag('config', GA_MEASUREMENT_ID, {
          user_id: userId
        });
      }
      window.gtag('set', 'user_properties', {
        user_id: userId,
        email: resolvedEmail,
        displayName: resolvedDisplayName,
        registered_user: true,
        is_anonymous: false,
        ...updateUserPayload.set
      });
    }

    // 2. Vemetric Identify: Merges all events from anonymous session into identified user
    vemetricIdentify(userId, {
      identifier: userId,
      displayName: resolvedDisplayName,
      avatarUrl: resolvedAvatarUrl,
      data: {
        ...(updateUserPayload.set || {}),
        set: updateUserPayload.set,
        setOnce: updateUserPayload.setOnce
      }
    });

    // 3. Vemetric updateUser: Persist display name, avatar, and trait sets
    vemetricUpdateUser(updateUserPayload);
  } else {
    trackUserLogout();
  }
}
