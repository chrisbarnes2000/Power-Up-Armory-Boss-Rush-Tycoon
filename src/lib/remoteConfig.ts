export const forceRefreshRemoteConfig = async () => {
  console.log('Remote config refreshed');
};

export const getIsBetaTester = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('is_beta_tester') === 'true';
  }
  return false;
};

export const setBetaTesterMode = (enabled: boolean) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('is_beta_tester', enabled ? 'true' : 'false');
  }
};

export const setLocalBetaFeatureOverride = (feature: string, enabled: boolean) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`beta_${feature}`, enabled ? 'true' : 'false');
  }
};

export const useRemoteConfig = () => {
  return {
    config: {},
    loading: false
  };
};
