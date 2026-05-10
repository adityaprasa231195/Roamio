import { prisma } from '../lib/prisma.js';
import { v4 as uuidv4 } from 'uuid';

const tripInclude = {
  stops: {
    include: { activities: true, tripNotes: true },
    orderBy: { stopOrder: 'asc' },
  },
  expenses: { orderBy: { date: 'desc' } },
  packing: { orderBy: { createdAt: 'asc' } },
  notes: { orderBy: { createdAt: 'desc' } },
};

export async function getTrips(req, res) {
  try {
    const trips = await prisma.trip.findMany({
      where: { userId: req.user.uid },
      include: { stops: { orderBy: { stopOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ trips });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
}

export async function createTrip(req, res) {
  try {
    const { name, description, startDate, endDate, totalBudget, coverImage, currency } = req.body;
    
    // ENSURE USER EXISTS (Sync on-the-fly for robustness)
    await prisma.user.upsert({
      where: { id: req.user.uid },
      update: { email: req.user.email || '' },
      create: { 
        id: req.user.uid, 
        email: req.user.email || `${req.user.uid}@traveloop.com`,
        name: req.user.name || 'Traveler'
      }
    });

    console.log('🚀 CREATE TRIP REQUEST:', { userId: req.user?.uid, body: req.body });
    
    if (!req.user?.uid) {
      throw new Error('Authentication failed: No User ID found in request');
    }

    const trip = await prisma.trip.create({
      data: {
        userId: req.user.uid,
        name,
        description,
        coverImage: coverImage || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        totalBudget: totalBudget || 0,
        currency: currency || 'USD',
        shareToken: uuidv4(),
      },
    });
    console.log('✅ Trip created successfully:', trip.id);
    res.status(201).json({ trip });
  } catch (err) {
    console.error('❌ TRIP CREATION FATAL ERROR:', err);
    res.status(500).json({ 
      error: `DB Error: ${err.message.substring(0, 50)}... (UID: ${req.user?.uid || 'NONE'})` 
    });
  }
}

export async function getTripById(req, res) {
  try {
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.id, userId: req.user.uid },
      include: tripInclude,
    });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.json({ trip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
}

export async function updateTrip(req, res) {
  try {
    const { name, description, startDate, endDate, totalBudget, coverImage, isPublic } = req.body;
    const trip = await prisma.trip.updateMany({
      where: { id: req.params.id, userId: req.user.uid },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(totalBudget !== undefined && { totalBudget }),
        ...(coverImage !== undefined && { coverImage }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });
    if (trip.count === 0) return res.status(404).json({ error: 'Trip not found' });
    const updated = await prisma.trip.findUnique({ where: { id: req.params.id }, include: tripInclude });
    res.json({ trip: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update trip' });
  }
}

export async function deleteTrip(req, res) {
  try {
    await prisma.trip.deleteMany({ where: { id: req.params.id, userId: req.user.uid } });
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
}

export async function getSharedTrip(req, res) {
  try {
    const trip = await prisma.trip.findFirst({
      where: { shareToken: req.params.token, isPublic: true },
      include: tripInclude,
    });
    if (!trip) return res.status(404).json({ error: 'Shared trip not found or is private' });
    res.json({ trip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch shared trip' });
  }
}

// ─── City lookup data for auto-generation ──────────────────────────
const CITY_DATA = {
  paris:     { country: 'France', lat: 48.8566, lng: 2.3522 },
  tokyo:     { country: 'Japan', lat: 35.6762, lng: 139.6503 },
  'new york': { country: 'USA', lat: 40.7128, lng: -74.006 },
  bali:      { country: 'Indonesia', lat: -8.4095, lng: 115.1889 },
  barcelona: { country: 'Spain', lat: 41.3851, lng: 2.1734 },
  kyoto:     { country: 'Japan', lat: 35.0116, lng: 135.7681 },
  santorini: { country: 'Greece', lat: 36.3932, lng: 25.4615 },
  amsterdam: { country: 'Netherlands', lat: 52.3676, lng: 4.9041 },
  marrakech: { country: 'Morocco', lat: 31.6295, lng: -7.9811 },
  sydney:    { country: 'Australia', lat: -33.8688, lng: 151.2093 },
  rome:      { country: 'Italy', lat: 41.9028, lng: 12.4964 },
  dubai:     { country: 'UAE', lat: 25.2048, lng: 55.2708 },
  prague:    { country: 'Czech Republic', lat: 50.0755, lng: 14.4378 },
  'cape town': { country: 'South Africa', lat: -33.9249, lng: 18.4241 },
  istanbul:  { country: 'Turkey', lat: 41.0082, lng: 28.9784 },
  lisbon:    { country: 'Portugal', lat: 38.7223, lng: -9.1393 },
  bangkok:   { country: 'Thailand', lat: 13.7563, lng: 100.5018 },
  vienna:    { country: 'Austria', lat: 48.2082, lng: 16.3738 },
  osaka:     { country: 'Japan', lat: 34.6937, lng: 135.5023 },
  dubrovnik: { country: 'Croatia', lat: 42.6507, lng: 18.0944 },
  london:    { country: 'UK', lat: 51.5074, lng: -0.1278 },
  berlin:    { country: 'Germany', lat: 52.52, lng: 13.405 },
  singapore: { country: 'Singapore', lat: 1.3521, lng: 103.8198 },
  seoul:     { country: 'South Korea', lat: 37.5665, lng: 126.978 },
  mumbai:    { country: 'India', lat: 19.076, lng: 72.8777 },
  delhi:     { country: 'India', lat: 28.6139, lng: 77.209 },
  cairo:     { country: 'Egypt', lat: 30.0444, lng: 31.2357 },
  'rio de janeiro': { country: 'Brazil', lat: -22.9068, lng: -43.1729 },
  mexico:    { country: 'Mexico', lat: 19.4326, lng: -99.1332 },
  hawaii:    { country: 'USA', lat: 21.3069, lng: -157.8583 },
  maldives:  { country: 'Maldives', lat: 3.2028, lng: 73.2207 },
};

// Curated activities per city (rich, realistic data)
const CITY_ACTIVITIES = {
  paris: [
    { name: 'Eiffel Tower Summit Visit', category: 'sightseeing', estimatedCost: 28, durationHours: 2, description: 'Ascend to the summit for panoramic views of the City of Light' },
    { name: 'Louvre Museum Masterpieces', category: 'culture', estimatedCost: 20, durationHours: 3, description: 'Mona Lisa, Venus de Milo, and 35,000 works of art' },
    { name: 'Seine River Evening Cruise', category: 'sightseeing', estimatedCost: 18, durationHours: 1.5, description: 'Glide past Notre-Dame and illuminated bridges at sunset' },
    { name: 'Café de Flore Breakfast', category: 'food', estimatedCost: 25, durationHours: 1, description: 'Legendary Left Bank café — perfect croissants and café crème' },
    { name: 'Montmartre & Sacré-Cœur', category: 'culture', estimatedCost: 0, durationHours: 2.5, description: 'Bohemian hilltop village with street artists and basilica views' },
  ],
  tokyo: [
    { name: 'Shibuya Crossing & Hachiko', category: 'sightseeing', estimatedCost: 0, durationHours: 1, description: "World's busiest intersection — an unmissable urban spectacle" },
    { name: 'Tsukiji Outer Market Breakfast', category: 'food', estimatedCost: 30, durationHours: 2, description: 'Fresh sushi, tamagoyaki, and matcha at the legendary market' },
    { name: 'teamLab Borderless Digital Art', category: 'culture', estimatedCost: 32, durationHours: 2.5, description: 'Immersive digital art installation — walk through living paintings' },
    { name: 'Shinjuku Gyoen Garden', category: 'sightseeing', estimatedCost: 5, durationHours: 1.5, description: 'Tranquil 144-acre garden in the heart of the city' },
    { name: 'Akihabara Electric Town', category: 'shopping', estimatedCost: 50, durationHours: 2, description: 'Anime, retro games, and cutting-edge tech paradise' },
  ],
  bali: [
    { name: 'Tanah Lot Temple at Sunset', category: 'sightseeing', estimatedCost: 5, durationHours: 2, description: 'Iconic sea temple silhouetted against a golden sky' },
    { name: 'Tegallalang Rice Terrace Trek', category: 'adventure', estimatedCost: 15, durationHours: 3, description: 'Walk through UNESCO-listed cascading emerald terraces' },
    { name: 'Ubud Monkey Forest', category: 'sightseeing', estimatedCost: 8, durationHours: 1.5, description: 'Sacred sanctuary with 700 long-tailed macaques in ancient jungle' },
    { name: 'Balinese Cooking Class', category: 'food', estimatedCost: 35, durationHours: 4, description: 'Learn authentic recipes at a traditional Balinese compound' },
    { name: 'Mount Batur Sunrise Hike', category: 'adventure', estimatedCost: 70, durationHours: 6, description: 'Pre-dawn volcano climb with breathtaking crater-lake sunrise' },
  ],
  barcelona: [
    { name: 'Sagrada Família Tour', category: 'culture', estimatedCost: 26, durationHours: 2, description: "Gaudí's unfinished masterpiece — stained glass that paints with light" },
    { name: 'La Boqueria Market', category: 'food', estimatedCost: 20, durationHours: 1.5, description: 'Colorful market off Las Ramblas — fresh juices, jamón, and tapas' },
    { name: 'Park Güell Sunset', category: 'sightseeing', estimatedCost: 10, durationHours: 2, description: 'Mosaic wonderland with panoramic views of the Mediterranean' },
    { name: 'Gothic Quarter Walking Tour', category: 'culture', estimatedCost: 0, durationHours: 2.5, description: 'Medieval labyrinth of narrow streets, hidden squares, and Roman walls' },
    { name: 'Barceloneta Beach & Seafood', category: 'food', estimatedCost: 35, durationHours: 3, description: 'Sandy beach followed by paella at a beachfront chiringuito' },
  ],
  rome: [
    { name: 'Colosseum & Roman Forum', category: 'culture', estimatedCost: 22, durationHours: 3, description: 'Walk where gladiators fought — 2000 years of history' },
    { name: 'Vatican Museums & Sistine Chapel', category: 'culture', estimatedCost: 20, durationHours: 3, description: "Michelangelo's ceiling masterpiece and Renaissance treasures" },
    { name: 'Trastevere Food Tour', category: 'food', estimatedCost: 45, durationHours: 3, description: "Rome's most charming neighborhood — pasta, supplì, and gelato" },
    { name: 'Trevi Fountain & Spanish Steps', category: 'sightseeing', estimatedCost: 0, durationHours: 1.5, description: 'Toss a coin, make a wish, and stroll baroque Rome' },
    { name: 'Pantheon Visit', category: 'culture', estimatedCost: 0, durationHours: 1, description: "2000-year-old temple with the world's largest unreinforced concrete dome" },
  ],
};

// Generic activities for cities without curated data
function getGenericActivities(cityName) {
  return [
    { name: `${cityName} City Highlights Tour`, category: 'sightseeing', estimatedCost: 30, durationHours: 3, description: `Discover the most iconic landmarks and hidden gems of ${cityName}` },
    { name: `Local Food & Market Walk`, category: 'food', estimatedCost: 25, durationHours: 2, description: `Taste authentic local cuisine and browse vibrant street markets` },
    { name: `${cityName} Cultural Museum`, category: 'culture', estimatedCost: 15, durationHours: 2, description: `Explore the rich history and artistic heritage of the region` },
    { name: `Sunset Viewpoint Experience`, category: 'sightseeing', estimatedCost: 0, durationHours: 1.5, description: `Watch the golden hour from the city's most breathtaking vantage point` },
    { name: `Neighborhood Street Food Night`, category: 'food', estimatedCost: 20, durationHours: 2, description: `Navigate bustling night markets and local street-food stalls` },
  ];
}

async function geocodeCity(cityName) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1&accept-language=en`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Roamio-TravelApp/1.0' } });
    const data = await res.json();
    if (data && data.length > 0) {
      const place = data[0];
      // Extract country from display_name (last part)
      const parts = place.display_name.split(', ');
      const country = parts[parts.length - 1] || '';
      console.log(`📍 Geocoded "${cityName}" → ${place.lat}, ${place.lon} (${country})`);
      return { name: cityName, country, lat: parseFloat(place.lat), lng: parseFloat(place.lon) };
    }
  } catch (err) {
    console.error('Geocoding failed for', cityName, err.message);
  }
  return null;
}

async function lookupCity(name) {
  const key = name.toLowerCase().trim();
  if (CITY_DATA[key]) return { name, ...CITY_DATA[key] };
  for (const [k, v] of Object.entries(CITY_DATA)) {
    if (key.includes(k) || k.includes(key)) return { name, ...v };
  }
  // Fallback: geocode using Nominatim (free, no API key needed)
  const geocoded = await geocodeCity(name);
  if (geocoded) return geocoded;
  return { name, country: '', lat: null, lng: null };
}

function getActivitiesForCity(cityName) {
  const key = cityName.toLowerCase().trim();
  if (CITY_ACTIVITIES[key]) return CITY_ACTIVITIES[key];
  for (const [k, v] of Object.entries(CITY_ACTIVITIES)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return getGenericActivities(cityName);
}

export async function autoGenerateItinerary(req, res) {
  try {
    const { city } = req.body;
    const tripId = req.params.id;

    // Verify trip belongs to user
    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: req.user.uid } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    // Delete existing stops (regenerate mode)
    await prisma.stop.deleteMany({ where: { tripId } });

    // Determine destination(s)
    const cityName = city || trip.name;
    const cityInfo = await lookupCity(cityName);
    
    // Use AI suggestions from the creation step if available
    let activities = [];
    if (req.body.contextSuggestions && Array.isArray(req.body.contextSuggestions)) {
      activities = req.body.contextSuggestions.map(s => ({
        name: s.name,
        category: s.category || 'other',
        estimatedCost: parseFloat(s.estimatedCost) || 0,
        durationHours: parseFloat(s.durationHours) || 2,
        description: s.description || ''
      }));
    } else {
      activities = getActivitiesForCity(cityName);
    }

    // Calculate trip days
    const tripDays = trip.startDate && trip.endDate
      ? Math.max(1, Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000))
      : 5;

    // Create the stop
    const stop = await prisma.stop.create({
      data: {
        tripId,
        cityName: cityInfo.name,
        country: cityInfo.country,
        latitude: cityInfo.lat,
        longitude: cityInfo.lng,
        arrivalDate: trip.startDate,
        departureDate: trip.endDate,
        stopOrder: 0,
      },
    });

    // Create activities
    const createdActivities = [];
    for (const act of activities) {
      const activity = await prisma.activity.create({
        data: {
          stopId: stop.id,
          name: act.name,
          category: act.category,
          estimatedCost: act.estimatedCost,
          durationHours: act.durationHours,
          description: act.description,
          isAiSuggested: true,
        },
      });
      createdActivities.push(activity);
    }

    // Also generate some packing essentials
    const packingEssentials = [
      { name: 'Passport & travel docs', category: 'documents' },
      { name: 'Phone charger & adapter', category: 'electronics' },
      { name: 'Comfortable walking shoes', category: 'clothing' },
      { name: 'Sunscreen SPF50', category: 'essentials' },
      { name: 'Reusable water bottle', category: 'essentials' },
      { name: 'Day backpack', category: 'essentials' },
    ];
    for (const item of packingEssentials) {
      await prisma.packingItem.create({
        data: { tripId, ...item },
      }).catch(() => {}); // ignore if exists
    }

    // Return the fully populated trip
    const fullTrip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: tripInclude,
    });

    res.json({ trip: fullTrip });
  } catch (err) {
    console.error('autoGenerateItinerary error:', err);
    res.status(500).json({ error: 'Failed to auto-generate itinerary' });
  }
}

