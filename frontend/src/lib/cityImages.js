// City image mapping using direct Unsplash URLs (source.unsplash.com is dead)
// These are curated, high-quality photos for each city

const CITY_IMAGES = {
  // Europe
  'paris':       'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=500&fit=crop',
  'barcelona':   'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=500&fit=crop',
  'rome':        'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=500&fit=crop',
  'lisbon':      'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&h=500&fit=crop',
  'amsterdam':   'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=500&fit=crop',
  'prague':      'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=500&fit=crop',
  'santorini':   'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=500&fit=crop',
  'vienna':      'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&h=500&fit=crop',
  'dubrovnik':   'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800&h=500&fit=crop',
  'istanbul':    'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=500&fit=crop',

  // Asia
  'tokyo':       'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=500&fit=crop',
  'kyoto':       'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=500&fit=crop',
  'osaka':       'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&h=500&fit=crop',
  'bali':        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=500&fit=crop',
  'bangkok':     'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=500&fit=crop',
  'dubai':       'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=500&fit=crop',

  // Americas
  'new york':    'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=500&fit=crop',
  'new-york':    'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=500&fit=crop',

  // Africa
  'marrakech':   'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&h=500&fit=crop',
  'cape town':   'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=500&fit=crop',

  // Oceania
  'sydney':      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=500&fit=crop',
};

// Hero-sized versions (for full-width banners)
const HERO_IMAGES = {
  'paris':       'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&h=900&fit=crop',
  'barcelona':   'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1600&h=900&fit=crop',
  'rome':        'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600&h=900&fit=crop',
  'tokyo':       'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&h=900&fit=crop',
  'kyoto':       'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600&h=900&fit=crop',
  'osaka':       'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=1600&h=900&fit=crop',
  'bali':        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&h=900&fit=crop',
  'lisbon':      'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1600&h=900&fit=crop',
  'amsterdam':   'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1600&h=900&fit=crop',
  'santorini':   'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1600&h=900&fit=crop',
  'new york':    'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1600&h=900&fit=crop',
  'marrakech':   'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=1600&h=900&fit=crop',
  'prague':      'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1600&h=900&fit=crop',
  'dubai':       'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&h=900&fit=crop',
  'bangkok':     'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1600&h=900&fit=crop',
  'istanbul':    'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1600&h=900&fit=crop',
  'sydney':      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1600&h=900&fit=crop',
  'cape town':   'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1600&h=900&fit=crop',
  'vienna':      'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1600&h=900&fit=crop',
  'dubrovnik':   'https://images.unsplash.com/photo-1555990793-da11153b2473?w=1600&h=900&fit=crop',
};

// Default travel image for unknown cities
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop';
const DEFAULT_HERO  = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&h=900&fit=crop';

// Auth page background
export const AUTH_BG_IMAGE = 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&h=900&fit=crop';

/**
 * Get a city image URL. Tries to match city name to curated photos.
 * @param {string} cityOrName - City name or trip name
 * @param {'card'|'hero'} size - 'card' (800px) or 'hero' (1600px)
 */
export function getCityImage(cityOrName, size = 'card') {
  if (!cityOrName) return size === 'hero' ? DEFAULT_HERO : DEFAULT_IMAGE;

  const key = cityOrName.toLowerCase().trim();
  const lookup = size === 'hero' ? HERO_IMAGES : CITY_IMAGES;

  // Direct match
  if (lookup[key]) return lookup[key];

  // Partial match — check if any city key is contained in the name
  for (const [city, url] of Object.entries(lookup)) {
    if (key.includes(city) || city.includes(key)) return url;
  }

  // Fallback
  return size === 'hero' ? DEFAULT_HERO : DEFAULT_IMAGE;
}

/**
 * Get image for a trip — tries coverImage first, then matches trip name/stops
 */
export function getTripImage(trip, size = 'card') {
  if (trip?.coverImage && !trip.coverImage.includes('source.unsplash.com')) {
    return trip.coverImage;
  }
  // Try trip name, then first stop city
  const name = trip?.name || '';
  const firstCity = trip?.stops?.[0]?.cityName || '';
  return getCityImage(firstCity || name, size);
}
