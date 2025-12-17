// src/services/cbrApi.ts

export interface Currency {
  id: string;
  numCode: string;
  charCode: string;
  nominal: number;
  name: string;
  value: number;
  rate: number;
}

export interface HistoricalRate {
  date: string;
  rate: number;
}

export interface CurrencyWithChange extends Currency {
  change24h: number;
  change24hPercent: number;
}

const API_BASE = 'http://localhost:5000/api';
const CACHE_KEY = 'cbr_currency_cache';
const LAST_UPDATE_KEY = 'cbr_last_update';
const CACHE_MAX_AGE = 60 * 60 * 1000; // 1 hour

interface CachedData {
  timestamp: number;
  currencies: Currency[];
}

const saveToCache = (currencies: Currency[]): void => {
  try {
    const cacheData: CachedData = {
      timestamp: Date.now(),
      currencies,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString().split('T')[0]);
  } catch (e) {
    console.warn('Failed to save to localStorage', e);
  }
};

const loadFromCache = (): Currency[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const cacheData: CachedData = JSON.parse(cached);
    if (Date.now() - cacheData.timestamp > CACHE_MAX_AGE) {
      return null;
    }
    return cacheData.currencies;
  } catch (e) {
    console.warn('Failed to load from localStorage', e);
    return null;
  }
};

export const fetchCurrenciesWithChange = async (): Promise<CurrencyWithChange[]> => {
  const response = await fetch(`${API_BASE}/rates`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const freshCurrencies: Currency[] = await response.json();

  saveToCache(freshCurrencies);

  const prevCurrencies = loadFromCache();

  if (!prevCurrencies) {
    return freshCurrencies.map(c => ({
      ...c,
      change24h: 0,
      change24hPercent: 0,
    }));
  }

  const prevMap = new Map<string, number>();
  prevCurrencies.forEach(c => prevMap.set(c.charCode, c.rate));

  return freshCurrencies.map(c => {
    const prevRate = prevMap.get(c.charCode) || c.rate;
    const change24h = c.rate - prevRate;
    const change24hPercent = prevRate ? ((change24h / prevRate) * 100) : 0;

    return {
      ...c,
      change24h,
      change24hPercent,
    };
  });
};

export const fetchHistoricalRates = async (
  charCode: string,
  daysBack: number
): Promise<HistoricalRate[]> => {
  const response = await fetch(`${API_BASE}/rates/history/${charCode}/${daysBack}`);
  if (!response.ok) {
    throw new Error('Failed to load historical data');
  }
  return await response.json();
};