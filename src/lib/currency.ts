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

// This product's home market — every new store defaults to this unless the
// signup form's explicit country dropdown says otherwise (see
// getCurrencyByCountry). No longer guessed from browser/Accept-Language
// locale: that produced USD for plenty of real Indian shop owners whose
// device locale just happened to be set to en-US or similar.
export const DEFAULT_CURRENCY = CURRENCIES[0]; // INR

/** ISO 3166-1 country code -> currency code, for the explicit signup country dropdown. */
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

/** Countries offered on the signup form — explicit selection, not a guess. */
export const COUNTRIES: { code: string; name: string }[] = [
  { code: 'IN', name: 'India' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
  { code: 'NP', name: 'Nepal' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'IE', name: 'Ireland' },
  { code: 'OTHER', name: 'Other / Not Listed' }
];

/** Explicit country selection (e.g. from signup) is the authoritative lookup
 * once a user has told us where their business is; DEFAULT_CURRENCY (INR)
 * is used when no country was picked at all. */
export function getCurrencyByCountry(countryCode?: string): CurrencyDef {
  if (!countryCode || countryCode === 'OTHER') return DEFAULT_CURRENCY;
  const currencyCode = COUNTRY_TO_CURRENCY[countryCode.toUpperCase()];
  return currencyCode ? getCurrencyByCode(currencyCode) : DEFAULT_CURRENCY;
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
