/**
 * Universal currency support.
 *
 * A store's currency is a property of the store, not of whoever happens to
 * be logged in on a given day — so this module detects a sensible default
 * ONCE (from the signed-up user's browser locale) at store-registration
 * time, and otherwise the store keeps whatever currency is saved in its
 * settings until someone changes it in Settings.
 */

export interface CurrencyDef {
  code: string;
  symbol: string;
  name: string;
  /** BCP-47 locale used for digit grouping / decimal conventions */
  locale: string;
}

export const CURRENCIES: CurrencyDef[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-IE' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', locale: 'en-AE' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', locale: 'en-SA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', locale: 'en-NZ' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', locale: 'en-KE' },
  { code: 'NPR', symbol: 'Rs', name: 'Nepalese Rupee', locale: 'en-IN' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', locale: 'en-BD' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', locale: 'en-PK' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', locale: 'en-LK' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', locale: 'en-MY' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', locale: 'en-PH' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', locale: 'id-ID' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' }
];

const DEFAULT_CURRENCY = CURRENCIES[0]; // INR

/** ISO 3166-1 country code -> currency code, for locale-based auto-detect. */
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  IN: 'INR', US: 'USD', GB: 'GBP', AE: 'AED', SA: 'SAR',
  AU: 'AUD', CA: 'CAD', SG: 'SGD', NZ: 'NZD', ZA: 'ZAR',
  NG: 'NGN', KE: 'KES', NP: 'NPR', BD: 'BDT', PK: 'PKR',
  LK: 'LKR', MY: 'MYR', PH: 'PHP', ID: 'IDR', JP: 'JPY', CN: 'CNY',
  // Eurozone
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR',
  PT: 'EUR', IE: 'EUR', AT: 'EUR', FI: 'EUR', GR: 'EUR', LU: 'EUR'
};

export function getCurrencyByCode(code?: string): CurrencyDef {
  return CURRENCIES.find(c => c.code === code) || DEFAULT_CURRENCY;
}

export function getCurrencyBySymbol(symbol?: string): CurrencyDef {
  return CURRENCIES.find(c => c.symbol === symbol) || DEFAULT_CURRENCY;
}

/**
 * Core detector: given a list of BCP-47 locale tags (most-preferred first,
 * e.g. ["en-US", "en;q=0.9"]), returns the matching currency. Shared by both
 * the browser-side and server-side detectors below — no IP lookup, no
 * third-party geolocation service, no network call either way. Falls back
 * to INR (this product's home market) when no region can be determined.
 */
export function detectCurrencyFromLocales(locales: string[]): CurrencyDef {
  for (const loc of locales) {
    const region = loc.split(';')[0]?.split('-')[1]?.toUpperCase();
    if (region && COUNTRY_TO_CURRENCY[region]) {
      return getCurrencyByCode(COUNTRY_TO_CURRENCY[region]);
    }
  }
  return DEFAULT_CURRENCY;
}

/**
 * Detects a currency from the browser's own locale (e.g. "en-US" -> USD).
 * Use this in client-side code (React components, clientStore.ts).
 */
export function detectCurrencyFromLocale(): CurrencyDef {
  try {
    const locales = (typeof navigator !== 'undefined' && navigator.languages && navigator.languages.length)
      ? Array.from(navigator.languages)
      : [typeof navigator !== 'undefined' ? navigator.language : 'en-IN'];
    return detectCurrencyFromLocales(locales);
  } catch {
    return DEFAULT_CURRENCY;
  }
}

/**
 * Detects a currency from a raw `Accept-Language` request header
 * (e.g. "en-US,en;q=0.9,hi;q=0.8"). Use this on the server (Express),
 * where there is no `navigator` — the browser sends this header on every
 * request based on the visitor's own OS/browser locale.
 */
export function detectCurrencyFromAcceptLanguage(header?: string | null): CurrencyDef {
  if (!header) return DEFAULT_CURRENCY;
  const locales = header.split(',').map(s => s.trim()).filter(Boolean);
  return detectCurrencyFromLocales(locales);
}

/**
 * Formats an amount using the store's currency symbol, with locale-correct
 * digit grouping (e.g. 1,00,000 for INR vs 100,000 for USD).
 */
export function formatMoney(amount: number | null | undefined, symbol: string = '₹', currencyCode?: string): string {
  const value = amount ?? 0;
  const currency = currencyCode ? getCurrencyByCode(currencyCode) : getCurrencyBySymbol(symbol);
  const hasFraction = Math.round(value * 100) % 100 !== 0;
  const formatted = value.toLocaleString(currency.locale, {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2
  });
  return `${symbol}${formatted}`;
}
