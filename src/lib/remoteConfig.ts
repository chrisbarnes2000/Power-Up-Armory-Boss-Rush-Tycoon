export const forceRefreshRemoteConfig = async () => {
  console.log('Remote config refreshed');
};

export const getIsBetaTester = (): boolean => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('is_beta_tester') === 'true';
  }
  return false;
};

export const setBetaTesterMode = (enabled: boolean) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('is_beta_tester', enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('beta_mode_changed', { detail: { enabled } }));
  }
};

export const getLocalBetaFeatureOverride = (feature: string, defaultValue: boolean = true): boolean => {
  if (typeof window !== 'undefined') {
    const val = localStorage.getItem(`beta_${feature}`);
    if (val === 'true') return true;
    if (val === 'false') return false;
  }
  return defaultValue;
};

export const setLocalBetaFeatureOverride = (feature: string, enabled: boolean) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`beta_${feature}`, enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('beta_feature_changed', { detail: { feature, enabled } }));
  }
};

// Specialized Beta Feature Flags (Future Paywalled Features)
export const getIsParticleFxEnabled = (): boolean => {
  return getLocalBetaFeatureOverride('particle_fx', false);
};

export const setIsParticleFxEnabled = (enabled: boolean) => {
  setLocalBetaFeatureOverride('particle_fx', enabled);
};

export const getIsCloudAutoSyncEnabled = (): boolean => {
  return getLocalBetaFeatureOverride('auto_sync', false);
};

export const setIsCloudAutoSyncEnabled = (enabled: boolean) => {
  setLocalBetaFeatureOverride('auto_sync', enabled);
};

export const useRemoteConfig = () => {
  return {
    config: {},
    loading: false
  };
};
