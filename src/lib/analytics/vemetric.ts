/**
 * Dedicated Vemetric Analytics Integration Module
 * Handles script initialization, identity synchronization, user traits, and session lifecycle
 * Specifications match Vemetric Client Script v0.6.3 (cdn.vemetric.com/main.js & hub.vemetric.com)
 */

import { APP_CONFIG } from '../../config/appConfig';

export const VEMETRIC_PROJECT_ID = APP_CONFIG.analytics.vemetricProjectId || 'noe2otBcUczGyZJF';

export interface VemetricUpdateUserPayload {
  displayName?: string;
  avatarUrl?: string;
  set?: Record<string, any>;
  setOnce?: Record<string, any>;
  unset?: string[];
  [key: string]: any;
}

export interface VemetricIdentifyOptions {
  identifier: string;
  displayName?: string;
  avatarUrl?: string;
  data?: Record<string, any>;
  allowCookies?: boolean;
}

// Global typing for Vemetric runtime window hooks
declare global {
  interface Window {
    vmtrc?: (...args: any[]) => void;
    vmtrcq?: any[][];
    vmtrcOptions?: Record<string, any>;
    vemetric?: {
      q?: any[];
      track?: (eventName: string, data?: Record<string, any>) => void;
      page?: (pageName?: string) => void;
      identify?: (userIdOrData: string | Record<string, any>, traitsOrOptions?: Record<string, any>) => void;
      updateUser?: (data: VemetricUpdateUserPayload) => void;
      reset?: () => void;
      resetUser?: () => void;
      getUserIdentifier?: () => string | undefined;
    };
  }
}

/**
 * Check if the Vemetric CDN script has executed and window.vmtrc is available
 */
export function isVemetricReady(): boolean {
  return typeof window !== 'undefined' && typeof window.vmtrc === 'function';
}

/**
 * Returns the active Vemetric user identifier directly from sessionStorage (_vmId)
 */
export function getVemetricIdentifier(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return sessionStorage.getItem('_vmId') || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Initialize Vemetric tracking script and client interface
 * Configures window.vmtrcOptions and window.vmtrcq queue safely
 */
export function initVemetric(): void {
  if (typeof window === 'undefined') return;

  window.vmtrcq = window.vmtrcq || [];
  window.vmtrcOptions = {
    token: VEMETRIC_PROJECT_ID,
    host: 'https://hub.vemetric.com',
    allowCookies: true,
    allowLocalhost: true,
    trackPageViews: false, // We control virtual page views in React
    trackOutboundLinks: false,
    trackDataAttributes: false
  };

  // Provide high-level window.vemetric helper object
  if (!window.vemetric) {
    const q: any[] = [];
    window.vemetric = {
      q,
      getUserIdentifier: () => getVemetricIdentifier(),
      track: (eventName: string, data?: Record<string, any>) => {
        vemetricTrack(eventName, data);
      },
      page: (pagePath?: string) => {
        vemetricPage(pagePath);
      },
      identify: (userIdOrData: string | Record<string, any>, traitsOrOptions?: Record<string, any>) => {
        let identifier = '';
        let options: Record<string, any> = {};

        if (typeof userIdOrData === 'string') {
          identifier = userIdOrData;
          options = traitsOrOptions || {};
        } else if (userIdOrData && typeof userIdOrData === 'object') {
          identifier = userIdOrData.identifier || userIdOrData.userId || userIdOrData.id || '';
          options = { ...userIdOrData, ...(traitsOrOptions || {}) };
        }

        if (!identifier) return;

        vemetricIdentify(identifier, {
          identifier,
          displayName: options.displayName,
          avatarUrl: options.avatarUrl,
          data: options.data || options.set || options
        });
      },
      updateUser: (data: VemetricUpdateUserPayload) => {
        vemetricUpdateUser(data);
      },
      resetUser: () => {
        vemetricResetUser();
      },
      reset: () => {
        vemetricResetUser();
      }
    };
  }

  // Inject Vemetric CDN script if not present in DOM
  if (!document.getElementById('vmtrc-scr') && !document.getElementById('vemetric-script') && VEMETRIC_PROJECT_ID) {
    const script = document.createElement('script');
    script.id = 'vmtrc-scr';
    script.defer = true;
    script.src = 'https://cdn.vemetric.com/main.js';
    script.setAttribute('data-token', VEMETRIC_PROJECT_ID);
    script.setAttribute('data-allow-cookies', 'true');
    script.setAttribute('data-allow-localhost', 'true');
    script.setAttribute('data-track-page-views', 'false');
    script.setAttribute('data-track-outbound-links', 'false');
    script.setAttribute('data-track-data-attributes', 'false');
    script.onerror = () => {
      console.warn('Vemetric: CDN script failed to load, analytics will use safe memory fallbacks.');
    };
    document.head.appendChild(script);
  }
}

/**
 * Identify a user in Vemetric
 * Automatically links prior anonymous session events into the identified user profile
 * Sets sessionStorage _vmId immediately so subsequent events carry the user identifier
 */
export function vemetricIdentify(identifier: string, options: Partial<VemetricIdentifyOptions> = {}): void {
  if (typeof window === 'undefined' || !identifier) return;

  const displayName = options.displayName;
  const avatarUrl = options.avatarUrl;
  const data = options.data || {};

  // Pre-seed sessionStorage so Vemetric main.js helper h() reads it synchronously for any concurrent events
  try {
    sessionStorage.setItem('_vmId', identifier);
    if (displayName) {
      sessionStorage.setItem('_vmDn', displayName);
    }
  } catch {}

  const payload = {
    identifier,
    displayName,
    avatarUrl,
    data,
    allowCookies: true
  };

  // Dispatch via window.vmtrc or queue into window.vmtrcq
  // NOTE: Vemetric's CDN script handles the POST to https://hub.vemetric.com/i and sets withCredentials
  // Do NOT make a secondary fetch to avoid duplicate identity calls and conflicting anonymous sessions!
  if (typeof window.vmtrc === 'function') {
    try {
      window.vmtrc('identify', payload);
    } catch (err) {
      console.warn('Vemetric identify error:', err);
    }
  } else {
    window.vmtrcq = window.vmtrcq || [];
    window.vmtrcq.push(['identify', payload]);
  }
}

/**
 * Update user attributes in Vemetric
 * Dispatches to window.vmtrc('updateUser', payload)
 */
export function vemetricUpdateUser(payload: VemetricUpdateUserPayload): void {
  if (typeof window === 'undefined' || !payload) return;

  const currentId = getVemetricIdentifier();
  if (!currentId) {
    // If no user is identified yet, skip updateUser to prevent orphan updates
    return;
  }

  // Ensure _vmDn is updated if display name changed
  if (payload.displayName) {
    try {
      sessionStorage.setItem('_vmDn', payload.displayName);
    } catch {}
  }

  if (typeof window.vmtrc === 'function') {
    try {
      window.vmtrc('updateUser', payload);
    } catch (err) {
      console.warn('Vemetric updateUser error:', err);
    }
  } else {
    window.vmtrcq = window.vmtrcq || [];
    window.vmtrcq.push(['updateUser', payload]);
  }
}

/**
 * Track custom event in Vemetric
 */
export function vemetricTrack(eventName: string, eventData?: Record<string, any>, userData?: Record<string, any>): void {
  if (typeof window === 'undefined' || !eventName) return;

  const payload = {
    eventData: eventData || {},
    userData: userData || {}
  };

  if (typeof window.vmtrc === 'function') {
    try {
      window.vmtrc('trackEvent', eventName, payload);
    } catch (err) {
      console.warn('Vemetric track error:', err);
    }
  } else {
    window.vmtrcq = window.vmtrcq || [];
    window.vmtrcq.push(['trackEvent', eventName, payload]);
  }
}

/**
 * Track virtual page view in Vemetric
 */
export function vemetricPage(pagePath?: string): void {
  if (typeof window === 'undefined') return;

  const path = pagePath 
    ? (pagePath.startsWith('/') ? pagePath : `/${pagePath}`)
    : window.location.pathname;

  if (typeof window.vmtrc === 'function') {
    try {
      window.vmtrc('trackPageView', path);
    } catch (err) {
      console.warn('Vemetric page view error:', err);
    }
  } else {
    window.vmtrcq = window.vmtrcq || [];
    window.vmtrcq.push(['trackPageView', path]);
  }
}

/**
 * Reset user identity in Vemetric on logout
 * IMPORTANT: Call this AFTER the 'user_logged_out' event has been dispatched with the user's ID
 * Clears sessionStorage _vmId, _vmDn and invokes window.vmtrc('resetUser')
 */
export function vemetricResetUser(): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.removeItem('_vmId');
    sessionStorage.removeItem('_vmDn');
    sessionStorage.removeItem('_vmCtx');
  } catch {}

  if (typeof window.vmtrc === 'function') {
    try {
      window.vmtrc('resetUser');
    } catch (err) {
      console.warn('Vemetric resetUser error:', err);
    }
  } else {
    window.vmtrcq = window.vmtrcq || [];
    window.vmtrcq.push(['resetUser']);
  }
}
