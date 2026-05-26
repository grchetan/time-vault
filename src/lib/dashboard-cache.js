let cachedVaults = null;
let lastFetched = 0;
const CACHE_TTL = 30000; // 30 seconds

export function getCachedVaults() {
  return cachedVaults;
}

export function setCachedVaults(vaults) {
  cachedVaults = vaults;
  lastFetched = Date.now();
  try {
    localStorage.setItem('tv_dashboard_vaults', JSON.stringify(vaults));
    localStorage.setItem('tv_dashboard_last_fetched', String(lastFetched));
  } catch (e) {
    console.error('[CACHE] Failed to save vaults to localStorage:', e);
  }
}

export function loadInitialCache() {
  if (cachedVaults) return cachedVaults;
  try {
    const localData = localStorage.getItem('tv_dashboard_vaults');
    const localTime = localStorage.getItem('tv_dashboard_last_fetched');
    if (localData && localTime) {
      cachedVaults = JSON.parse(localData);
      lastFetched = Number(localTime);
      return cachedVaults;
    }
  } catch (e) {
    console.error('[CACHE] Failed to load vaults from localStorage:', e);
  }
  return null;
}

export function isCacheStale() {
  return Date.now() - lastFetched > CACHE_TTL;
}
