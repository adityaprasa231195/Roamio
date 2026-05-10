import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// ─── Demo Cities ──────────────────────────────────────────────────
const cities = [
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
  { name: 'New York', country: 'USA', lat: 40.7128, lng: -74.006 },
  { name: 'Bali', country: 'Indonesia', lat: -8.4095, lng: 115.1889 },
  { name: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734 },
  { name: 'Kyoto', country: 'Japan', lat: 35.0116, lng: 135.7681 },
  { name: 'Santorini', country: 'Greece', lat: 36.3932, lng: 25.4615 },
  { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041 },
  { name: 'Marrakech', country: 'Morocco', lat: 31.6295, lng: -7.9811 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708 },
  { name: 'Prague', country: 'Czech Republic', lat: 50.0755, lng: 14.4378 },
  { name: 'Cape Town', country: 'South Africa', lat: -33.9249, lng: 18.4241 },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784 },
  { name: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393 },
  { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018 },
  { name: 'Vienna', country: 'Austria', lat: 48.2082, lng: 16.3738 },
  { name: 'Osaka', country: 'Japan', lat: 34.6937, lng: 135.5023 },
  { name: 'Dubrovnik', country: 'Croatia', lat: 42.6507, lng: 18.0944 },
];

// ─── Sample activities per city ──────────────────────────────────
const getActivities = (cityName) => {
  const map = {
    Paris: [
      { name: 'Eiffel Tower Visit', category: 'sightseeing', estimatedCost: 28, durationHours: 2, description: 'Iconic iron lattice tower with panoramic city views' },
      { name: 'Louvre Museum', category: 'culture', estimatedCost: 20, durationHours: 3, description: 'World\'s largest art museum, home to the Mona Lisa' },
      { name: 'Seine River Cruise', category: 'sightseeing', estimatedCost: 15, durationHours: 1, description: 'Scenic boat ride past Notre-Dame and historic bridges' },
      { name: 'Café de Flore Breakfast', category: 'food', estimatedCost: 25, durationHours: 1, description: 'Legendary Left Bank café with perfect croissants' },
      { name: 'Montmartre Walking Tour', category: 'culture', estimatedCost: 0, durationHours: 2, description: 'Bohemian hilltop village with Sacré-Cœur Basilica' },
    ],
    Tokyo: [
      { name: 'Shibuya Crossing', category: 'sightseeing', estimatedCost: 0, durationHours: 1, description: 'World\'s busiest pedestrian crossing — unmissable spectacle' },
      { name: 'Tsukiji Outer Market', category: 'food', estimatedCost: 30, durationHours: 2, description: 'Fresh sushi breakfast at Tokyo\'s legendary fish market' },
      { name: 'teamLab Borderless', category: 'culture', estimatedCost: 32, durationHours: 2.5, description: 'Immersive digital art installation — borderless wonder' },
      { name: 'Shinjuku Gyoen Garden', category: 'sightseeing', estimatedCost: 5, durationHours: 2, description: 'Tranquil national garden with cherry blossoms in spring' },
      { name: 'Akihabara Electronics Tour', category: 'shopping', estimatedCost: 50, durationHours: 2, description: 'Electric Town — anime, gadgets, and retro games' },
    ],
    Bali: [
      { name: 'Tanah Lot Sunset', category: 'sightseeing', estimatedCost: 5, durationHours: 2, description: 'Iconic sea temple at golden hour — photograph of a lifetime' },
      { name: 'Rice Terrace Trek', category: 'adventure', estimatedCost: 15, durationHours: 3, description: 'Walk through UNESCO-listed Tegallalang terraces' },
      { name: 'Ubud Monkey Forest', category: 'sightseeing', estimatedCost: 8, durationHours: 1.5, description: 'Sacred sanctuary with 700 Balinese long-tailed macaques' },
      { name: 'Waroeng Semesta Dinner', category: 'food', estimatedCost: 12, durationHours: 1.5, description: 'Organic farm-to-table Balinese cuisine in a jungle setting' },
      { name: 'Sunrise at Mount Batur', category: 'adventure', estimatedCost: 70, durationHours: 6, description: 'Pre-dawn volcano hike with breathtaking sunrise views' },
    ],
  };
  return map[cityName] || [
    { name: `${cityName} City Tour`, category: 'sightseeing', estimatedCost: 25, durationHours: 3, description: `Explore the best of ${cityName} with a guided city tour` },
    { name: `${cityName} Local Cuisine`, category: 'food', estimatedCost: 20, durationHours: 2, description: `Sample authentic local dishes and flavors` },
    { name: `${cityName} Museum`, category: 'culture', estimatedCost: 15, durationHours: 2, description: `Discover the history and culture of ${cityName}` },
    { name: `${cityName} Markets`, category: 'shopping', estimatedCost: 30, durationHours: 2, description: `Browse local markets for unique souvenirs` },
    { name: `${cityName} Park Walk`, category: 'sightseeing', estimatedCost: 0, durationHours: 1.5, description: `Relaxing walk through the city\'s green spaces` },
  ];
};

async function main() {
  console.log('🌍 Seeding Traveloop database...');

  // ─── Demo User ────────────────────────────────────────────────────
  const demoUser = await prisma.user.upsert({
    where: { id: 'demo-user-001' },
    update: {},
    create: {
      id: 'demo-user-001',
      email: 'demo@traveloop.com',
      name: 'Alex Rivera',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=traveloop',
    },
  });
  console.log('✅ Demo user created:', demoUser.email);

  // ─── Trip 1: Europe Summer ────────────────────────────────────────
  const europeCities = [
    { ...cities.find(c => c.name === 'Paris'), arrival: '2025-07-10', departure: '2025-07-14' },
    { ...cities.find(c => c.name === 'Barcelona'), arrival: '2025-07-14', departure: '2025-07-18' },
    { ...cities.find(c => c.name === 'Rome'), arrival: '2025-07-18', departure: '2025-07-23' },
  ];

  const europeTrip = await prisma.trip.create({
    data: {
      id: 'trip-europe-2025',
      userId: demoUser.id,
      name: 'Europe Summer 2025',
      description: 'The grand European summer adventure — art, food, and golden hours.',
      coverImage: 'https://source.unsplash.com/1600x900/?paris,europe,travel',
      startDate: new Date('2025-07-10'),
      endDate: new Date('2025-07-23'),
      totalBudget: 4000,
      isPublic: true,
      shareToken: 'europe-summer-2025-share',
    },
  });

  for (let i = 0; i < europeCities.length; i++) {
    const city = europeCities[i];
    const stop = await prisma.stop.create({
      data: {
        tripId: europeTrip.id,
        cityName: city.name,
        country: city.country,
        latitude: city.lat,
        longitude: city.lng,
        arrivalDate: new Date(city.arrival),
        departureDate: new Date(city.departure),
        stopOrder: i,
      },
    });

    const activities = getActivities(city.name);
    for (const act of activities) {
      await prisma.activity.create({
        data: { stopId: stop.id, ...act, isAiSuggested: Math.random() > 0.6 },
      });
    }
  }

  // Add expenses for Europe trip
  const europeExpenses = [
    { category: 'transport', amount: 450, label: 'Flights Paris→Barcelona→Rome', date: new Date('2025-07-10') },
    { category: 'stay', amount: 900, label: 'Hotels (13 nights avg $69/night)', date: new Date('2025-07-10') },
    { category: 'food', amount: 480, label: 'Restaurants and cafés', date: new Date('2025-07-12') },
    { category: 'activity', amount: 220, label: 'Museums, tours, attractions', date: new Date('2025-07-13') },
    { category: 'transport', amount: 180, label: 'Metro, taxis, local transport', date: new Date('2025-07-14') },
    { category: 'other', amount: 95, label: 'Shopping and souvenirs', date: new Date('2025-07-20') },
  ];
  for (const exp of europeExpenses) {
    await prisma.expense.create({ data: { tripId: europeTrip.id, ...exp } });
  }

  // Add packing items
  const packingItems = [
    { name: 'Passport', category: 'documents', isPacked: true },
    { name: 'Travel insurance docs', category: 'documents', isPacked: true },
    { name: 'Universal power adapter', category: 'electronics', isPacked: true },
    { name: 'Noise-cancelling headphones', category: 'electronics', isPacked: false },
    { name: 'Lightweight jacket', category: 'clothing', isPacked: true },
    { name: 'Comfortable walking shoes', category: 'clothing', isPacked: false },
    { name: 'Sunscreen SPF50', category: 'essentials', isPacked: false },
    { name: 'Reusable water bottle', category: 'essentials', isPacked: true },
  ];
  for (const item of packingItems) {
    await prisma.packingItem.create({ data: { tripId: europeTrip.id, ...item } });
  }

  // Add notes
  await prisma.tripNote.create({
    data: { tripId: europeTrip.id, content: 'Book Eiffel Tower tickets at least 2 weeks in advance! They sell out fast during summer. Night visit is magical.' },
  });
  await prisma.tripNote.create({
    data: { tripId: europeTrip.id, content: 'Pack light — European cobblestone streets are rough on wheeled luggage. A good backpack is essential.' },
  });

  console.log('✅ Europe Summer 2025 trip seeded');

  // ─── Trip 2: Japan Adventure ─────────────────────────────────────
  const japanCities = [
    { ...cities.find(c => c.name === 'Tokyo'), arrival: '2025-10-05', departure: '2025-10-09' },
    { ...cities.find(c => c.name === 'Kyoto'), arrival: '2025-10-09', departure: '2025-10-12' },
    { ...cities.find(c => c.name === 'Osaka'), arrival: '2025-10-12', departure: '2025-10-15' },
  ];

  const japanTrip = await prisma.trip.create({
    data: {
      id: 'trip-japan-2025',
      userId: demoUser.id,
      name: 'Japan Adventure',
      description: 'Neon lights, ancient temples, world-class ramen — the full Japan experience.',
      coverImage: 'https://source.unsplash.com/1600x900/?tokyo,japan,temple',
      startDate: new Date('2025-10-05'),
      endDate: new Date('2025-10-15'),
      totalBudget: 3500,
      isPublic: true,
      shareToken: 'japan-adventure-2025-share',
    },
  });

  for (let i = 0; i < japanCities.length; i++) {
    const city = japanCities[i];
    const stop = await prisma.stop.create({
      data: {
        tripId: japanTrip.id,
        cityName: city.name,
        country: city.country,
        latitude: city.lat,
        longitude: city.lng,
        arrivalDate: new Date(city.arrival),
        departureDate: new Date(city.departure),
        stopOrder: i,
      },
    });

    const activities = getActivities(city.name);
    for (const act of activities) {
      await prisma.activity.create({
        data: { stopId: stop.id, ...act, isAiSuggested: Math.random() > 0.5 },
      });
    }
  }

  console.log('✅ Japan Adventure trip seeded');

  // ─── Trip 3: Bali Escape ─────────────────────────────────────────
  const baliStop = cities.find(c => c.name === 'Bali');
  const baliTrip = await prisma.trip.create({
    data: {
      id: 'trip-bali-2025',
      userId: demoUser.id,
      name: 'Bali Escape',
      description: 'Rice terraces, spiritual temples, and beach sunsets. Pure serenity.',
      coverImage: 'https://source.unsplash.com/1600x900/?bali,rice-terrace,temple',
      startDate: new Date('2025-12-20'),
      endDate: new Date('2025-12-30'),
      totalBudget: 2000,
      isPublic: false,
      shareToken: null,
    },
  });

  const baliStopRecord = await prisma.stop.create({
    data: {
      tripId: baliTrip.id,
      cityName: 'Bali',
      country: 'Indonesia',
      latitude: baliStop.lat,
      longitude: baliStop.lng,
      arrivalDate: new Date('2025-12-20'),
      departureDate: new Date('2025-12-30'),
      stopOrder: 0,
    },
  });

  const baliActivities = getActivities('Bali');
  for (const act of baliActivities) {
    await prisma.activity.create({ data: { stopId: baliStopRecord.id, ...act } });
  }

  console.log('✅ Bali Escape trip seeded');
  console.log('\n🎉 Seeding complete! Demo account: demo@traveloop.com / demo1234');
  console.log('🔑 Login with DEV_AUTH_BYPASS=true — use any token, or Firebase credentials');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
