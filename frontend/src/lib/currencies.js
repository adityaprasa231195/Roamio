// currencies.js - Dynamic Currency System using Public APIs

// Initial fallback rates (synced with USD)
export let EXCHANGE_RATES = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 150, INR: 83, AED: 3.67,
};

// Initial fallback currencies
export let CURRENCIES = [
  { code: 'USD', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', symbol: '¥', flag: '🇯🇵' },
  { code: 'INR', symbol: '₹', flag: '🇮🇳' },
];

// Cache for country/currency mapping
let countryCurrencyMap = {};

/**
 * Initializes the currency system by fetching real-time rates and country data.
 */
export async function initCurrencySystem() {
  try {
    const API_KEY = import.meta.env.VITE_CURRENCY_API_KEY;
    
    // 1. Fetch Exchange Rates
    // If user provided a key, use the V6 endpoint, otherwise use the open endpoint
    const rateUrl = API_KEY 
      ? `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`
      : 'https://open.er-api.com/v6/latest/USD';
      
    const rateRes = await fetch(rateUrl);
    const rateData = await rateRes.json();
    if (rateData && rateData.rates) {
      EXCHANGE_RATES = rateData.rates;
      console.log('✅ Real-time exchange rates loaded');
    }

    // 2. Fetch Country Data for mapping and flags
    const countryRes = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies,flag,cca2');
    const countries = await countryRes.json();
    
    if (Array.isArray(countries)) {
      const newCurrencies = [];
      const seen = new Set();

      countries.forEach(c => {
        if (c.currencies) {
          const code = Object.keys(c.currencies)[0];
          const info = c.currencies[code];
          
          // Map country name to currency code
          countryCurrencyMap[c.name.common.toLowerCase()] = code;
          if (c.cca2) countryCurrencyMap[c.cca2.toLowerCase()] = code;

          if (!seen.has(code)) {
            newCurrencies.push({
              code,
              symbol: info.symbol || code,
              flag: c.flag || '🏳️'
            });
            seen.add(code);
          }
        }
      });

      // Sort and update global list
      CURRENCIES = newCurrencies.sort((a, b) => a.code.localeCompare(b.code));
      console.log(`✅ Loaded ${CURRENCIES.length} currencies from REST Countries API`);
    }
  } catch (err) {
    console.error('❌ Failed to initialize currency API:', err);
  }
}

/**
 * Detects currency based on city/country string
 */
export function getCurrencyForCity(input) {
  if (!input) return 'USD';
  const parts = input.toLowerCase().split(',').map(p => p.trim());
  
  // Try matching any part of the string to a country in our map
  for (const part of parts) {
    if (countryCurrencyMap[part]) return countryCurrencyMap[part];
  }

  // Fallback: extensive city-to-currency mapping
  const cityFallbacks = {
    // Pakistan
    'karachi': 'PKR', 'lahore': 'PKR', 'islamabad': 'PKR', 'rawalpindi': 'PKR', 'faisalabad': 'PKR', 'peshawar': 'PKR', 'quetta': 'PKR', 'multan': 'PKR',
    // India
    'delhi': 'INR', 'mumbai': 'INR', 'bangalore': 'INR', 'bengaluru': 'INR', 'chennai': 'INR', 'kolkata': 'INR', 'hyderabad': 'INR', 'pune': 'INR', 'jaipur': 'INR', 'goa': 'INR', 'agra': 'INR', 'varanasi': 'INR',
    // Europe
    'paris': 'EUR', 'rome': 'EUR', 'barcelona': 'EUR', 'amsterdam': 'EUR', 'berlin': 'EUR', 'vienna': 'EUR', 'lisbon': 'EUR', 'athens': 'EUR', 'brussels': 'EUR', 'dublin': 'EUR', 'milan': 'EUR', 'madrid': 'EUR', 'prague': 'CZK', 'budapest': 'HUF',
    'london': 'GBP', 'edinburgh': 'GBP', 'manchester': 'GBP',
    'istanbul': 'TRY', 'ankara': 'TRY',
    'moscow': 'RUB', 'st petersburg': 'RUB',
    'zurich': 'CHF', 'geneva': 'CHF',
    'oslo': 'NOK', 'stockholm': 'SEK', 'copenhagen': 'DKK', 'warsaw': 'PLN',
    // Japan
    'tokyo': 'JPY', 'kyoto': 'JPY', 'osaka': 'JPY',
    // Middle East
    'dubai': 'AED', 'abu dhabi': 'AED', 'doha': 'QAR', 'riyadh': 'SAR', 'jeddah': 'SAR', 'muscat': 'OMR', 'kuwait city': 'KWD', 'bahrain': 'BHD',
    // Southeast Asia
    'bangkok': 'THB', 'phuket': 'THB', 'singapore': 'SGD', 'kuala lumpur': 'MYR', 'jakarta': 'IDR', 'bali': 'IDR', 'manila': 'PHP', 'hanoi': 'VND', 'ho chi minh': 'VND', 'phnom penh': 'KHR', 'vientiane': 'LAK',
    // East Asia
    'seoul': 'KRW', 'busan': 'KRW', 'beijing': 'CNY', 'shanghai': 'CNY', 'hong kong': 'HKD', 'taipei': 'TWD',
    // Africa
    'cairo': 'EGP', 'cape town': 'ZAR', 'johannesburg': 'ZAR', 'nairobi': 'KES', 'marrakech': 'MAD', 'lagos': 'NGN',
    // Oceania
    'sydney': 'AUD', 'melbourne': 'AUD', 'auckland': 'NZD',
    // Americas
    'new york': 'USD', 'los angeles': 'USD', 'san francisco': 'USD', 'miami': 'USD', 'hawaii': 'USD',
    'toronto': 'CAD', 'vancouver': 'CAD', 'montreal': 'CAD',
    'mexico city': 'MXN', 'cancun': 'MXN',
    'rio de janeiro': 'BRL', 'sao paulo': 'BRL', 'buenos aires': 'ARS', 'lima': 'PEN', 'bogota': 'COP',
  };
  return cityFallbacks[parts[0]] || 'USD';
}

export function getCurrencySymbol(code) {
  const c = CURRENCIES.find(curr => curr.code === code);
  return c ? c.symbol : (EXCHANGE_RATES[code] ? code : '$');
}

export function formatCurrency(amount, code = 'USD') {
  const symbol = getCurrencySymbol(code);
  const formatted = Number(amount).toLocaleString(undefined, { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  });
  // If symbol is long (e.g. "AED"), add a space
  return symbol.length > 1 ? `${symbol} ${formatted}` : `${symbol}${formatted}`;
}

export function convertCurrency(amount, fromCode, toCode) {
  if (!amount || fromCode === toCode) return amount;
  const fromRate = EXCHANGE_RATES[fromCode] || 1;
  const toRate = EXCHANGE_RATES[toCode] || 1;
  const converted = (Number(amount) / fromRate) * toRate;
  return Math.round(converted);
}

// Auto-init on import (or you can call it manually in App.jsx)
initCurrencySystem();
