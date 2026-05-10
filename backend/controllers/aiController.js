import Groq from 'groq-sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getGroqClient() {
  const keys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY?.replace(/ll2/g, 'II2'),
    process.env.GROQ_API_KEY?.replace(/II2/g, 'll2')
  ].filter(k => k && k.trim() !== '');
  
  if (keys.length === 0) return null;
  return new Groq({ apiKey: keys[0] });
}

async function streamOrMock(res, prompt, mockData) {
  const groq = getGroqClient();
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  let useMock = !groq;

  if (!useMock) {
    try {
      res.write(`data: ${JSON.stringify({ type: 'start' })}\n\n`);
      const stream = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are a professional travel planner. You MUST return ONLY valid JSON. No conversational text, no markdown code blocks, just the raw JSON." },
          { role: "user", content: prompt }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ type: 'delta', text: content })}\n\n`);
        }
      }
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
      return;
    } catch (err) {
      console.error('Groq failure, falling back to mock:', err.message);
      useMock = true;
    }
  }

  if (useMock) {
    const text = typeof mockData === 'string' ? mockData : JSON.stringify(mockData, null, 2);
    res.write(`data: ${JSON.stringify({ type: 'start' })}\n\n`);
    for (let i = 0; i < text.length; i += 15) {
      res.write(`data: ${JSON.stringify({ type: 'delta', text: text.slice(i, i + 15) })}\n\n`);
      await new Promise(r => setTimeout(r, 10));
    }
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  }
}

// ─── Curated real-place activities per city ───────────────────────
const REAL_ACTIVITIES = {
  paris: [
    { name: 'Eiffel Tower Summit Visit', category: 'Sightseeing', estimatedCost: 28, description: 'Ascend to the summit for panoramic views of the City of Light — book the stairs for a workout or the lift for comfort.', durationHours: 2, bestTimeOfDay: 'Evening' },
    { name: 'Louvre Museum — Mona Lisa & Winged Victory', category: 'Culture', estimatedCost: 20, description: 'Home to 35,000 artworks including the Mona Lisa, Venus de Milo, and Winged Victory of Samothrace.', durationHours: 3.5, bestTimeOfDay: 'Morning' },
    { name: 'Seine River Sunset Cruise (Bateaux Mouches)', category: 'Sightseeing', estimatedCost: 18, description: 'Glide past Notre-Dame, Musée d\'Orsay, and illuminated bridges as the sun sets over Paris.', durationHours: 1.5, bestTimeOfDay: 'Evening' },
    { name: 'Montmartre & Sacré-Cœur Basilica Walk', category: 'Culture', estimatedCost: 0, description: 'Bohemian hilltop village with street artists, Place du Tertre, and stunning basilica views over all of Paris.', durationHours: 2.5, bestTimeOfDay: 'Afternoon' },
    { name: 'Café de Flore Breakfast on Boulevard Saint-Germain', category: 'Food', estimatedCost: 25, description: 'Legendary Left Bank café since 1887 — perfect croissants, café crème, and people-watching.', durationHours: 1, bestTimeOfDay: 'Morning' },
  ],
  tokyo: [
    { name: 'Shibuya Crossing & Hachikō Statue', category: 'Sightseeing', estimatedCost: 0, description: 'World\'s busiest pedestrian crossing — watch from the Starbucks above or dive into the organized chaos.', durationHours: 1, bestTimeOfDay: 'Evening' },
    { name: 'Tsukiji Outer Market Street Food Breakfast', category: 'Food', estimatedCost: 30, description: 'Fresh tuna sashimi, tamagoyaki (rolled omelette), and matcha at the legendary market stalls.', durationHours: 2, bestTimeOfDay: 'Morning' },
    { name: 'teamLab Borderless Digital Art Museum', category: 'Culture', estimatedCost: 32, description: 'Immersive digital art installation in Odaiba — walk through living, flowing digital paintings.', durationHours: 2.5, bestTimeOfDay: 'Afternoon' },
    { name: 'Meiji Shrine & Yoyogi Park', category: 'Culture', estimatedCost: 0, description: 'Tranquil Shinto shrine in a 170-acre forest, steps from Harajuku\'s Takeshita Street.', durationHours: 1.5, bestTimeOfDay: 'Morning' },
    { name: 'Akihabara Electric Town Shopping', category: 'Shopping', estimatedCost: 50, description: 'Anime mega-stores, retro game arcades, maid cafés, and cutting-edge electronics paradise.', durationHours: 2, bestTimeOfDay: 'Afternoon' },
  ],
  bali: [
    { name: 'Tanah Lot Temple at Sunset', category: 'Sightseeing', estimatedCost: 5, description: 'Iconic sea temple perched on a rocky outcrop, silhouetted against a golden Balinese sky.', durationHours: 2, bestTimeOfDay: 'Evening' },
    { name: 'Tegallalang Rice Terrace Trek', category: 'Adventure', estimatedCost: 15, description: 'Walk through UNESCO-listed cascading emerald rice terraces with jungle swing photo ops.', durationHours: 3, bestTimeOfDay: 'Morning' },
    { name: 'Ubud Sacred Monkey Forest Sanctuary', category: 'Sightseeing', estimatedCost: 8, description: 'Ancient Hindu temple complex with 700+ long-tailed macaques in a lush jungle setting.', durationHours: 1.5, bestTimeOfDay: 'Morning' },
    { name: 'Balinese Cooking Class in Ubud', category: 'Food', estimatedCost: 35, description: 'Learn to make nasi goreng, satay, and lawar in a traditional Balinese family compound.', durationHours: 4, bestTimeOfDay: 'Morning' },
    { name: 'Mount Batur Sunrise Volcano Hike', category: 'Adventure', estimatedCost: 70, description: 'Pre-dawn trek up an active volcano — witness a breathtaking sunrise over the crater lake.', durationHours: 6, bestTimeOfDay: 'Morning' },
  ],
  barcelona: [
    { name: 'Sagrada Família Interior Tour', category: 'Culture', estimatedCost: 26, description: 'Gaudí\'s unfinished masterpiece — the forest-like columns and kaleidoscopic stained glass are unforgettable.', durationHours: 2, bestTimeOfDay: 'Morning' },
    { name: 'La Boqueria Market on La Rambla', category: 'Food', estimatedCost: 20, description: 'Colorful market since 1217 — fresh fruit juices, jamón ibérico, and seafood tapas at the bar.', durationHours: 1.5, bestTimeOfDay: 'Morning' },
    { name: 'Park Güell Sunset Viewpoint', category: 'Sightseeing', estimatedCost: 10, description: 'Gaudí\'s mosaic wonderland with panoramic views of the city and Mediterranean Sea.', durationHours: 2, bestTimeOfDay: 'Evening' },
    { name: 'Gothic Quarter (Barri Gòtic) Walking Tour', category: 'Culture', estimatedCost: 0, description: 'Medieval labyrinth of narrow streets, hidden plazas, Roman walls, and the Barcelona Cathedral.', durationHours: 2.5, bestTimeOfDay: 'Afternoon' },
    { name: 'Barceloneta Beach & Seafood Paella', category: 'Food', estimatedCost: 35, description: 'Sandy Mediterranean beach followed by authentic paella at a beachfront chiringuito.', durationHours: 3, bestTimeOfDay: 'Afternoon' },
  ],
  'new york': [
    { name: 'Statue of Liberty & Ellis Island Ferry', category: 'Sightseeing', estimatedCost: 24, description: 'Take the ferry to Liberty Island, climb to the crown, and visit the Immigration Museum on Ellis Island.', durationHours: 4, bestTimeOfDay: 'Morning' },
    { name: 'Central Park Walking Tour — Bethesda Fountain to Bow Bridge', category: 'Sightseeing', estimatedCost: 0, description: '843-acre urban oasis — iconic Bethesda Fountain, Bow Bridge, Strawberry Fields, and the Ramble.', durationHours: 2.5, bestTimeOfDay: 'Morning' },
    { name: 'Metropolitan Museum of Art (The Met)', category: 'Culture', estimatedCost: 30, description: 'Over 2 million works spanning 5,000 years — Egyptian Temple of Dendur, European paintings, and rooftop bar.', durationHours: 3, bestTimeOfDay: 'Afternoon' },
    { name: 'Times Square & Broadway Show', category: 'Entertainment', estimatedCost: 120, description: 'The neon-lit crossroads of the world — grab TKTS discount tickets for a Broadway or Off-Broadway show.', durationHours: 3.5, bestTimeOfDay: 'Evening' },
    { name: 'Joe\'s Pizza in Greenwich Village', category: 'Food', estimatedCost: 8, description: 'Iconic NYC slice joint since 1975 — crispy, cheesy, perfectly foldable New York-style pizza.', durationHours: 0.5, bestTimeOfDay: 'Afternoon' },
  ],
  rome: [
    { name: 'Colosseum & Roman Forum Guided Tour', category: 'Culture', estimatedCost: 22, description: 'Walk where gladiators fought — explore the arena floor, underground tunnels, and 2,000-year-old Forum ruins.', durationHours: 3, bestTimeOfDay: 'Morning' },
    { name: 'Vatican Museums & Sistine Chapel', category: 'Culture', estimatedCost: 20, description: 'Michelangelo\'s ceiling masterpiece, Raphael\'s School of Athens, and St. Peter\'s Basilica dome climb.', durationHours: 3.5, bestTimeOfDay: 'Morning' },
    { name: 'Trastevere Food Tour — Da Enzo & Supplizio', category: 'Food', estimatedCost: 45, description: 'Rome\'s most charming neighborhood — cacio e pepe at Da Enzo, supplì at Supplizio, and artisan gelato.', durationHours: 3, bestTimeOfDay: 'Evening' },
    { name: 'Trevi Fountain & Spanish Steps at Golden Hour', category: 'Sightseeing', estimatedCost: 0, description: 'Toss a coin for luck, then stroll to the Spanish Steps as the baroque facades glow in golden light.', durationHours: 1.5, bestTimeOfDay: 'Evening' },
    { name: 'Pantheon Visit', category: 'Culture', estimatedCost: 5, description: '2,000-year-old temple with the world\'s largest unreinforced concrete dome — watch the light beam move through the oculus.', durationHours: 1, bestTimeOfDay: 'Afternoon' },
  ],
  london: [
    { name: 'Tower of London & Crown Jewels', category: 'Culture', estimatedCost: 33, description: '1,000 years of royal history — see the Crown Jewels, Yeoman Warder tours, and the infamous Traitors\' Gate.', durationHours: 3, bestTimeOfDay: 'Morning' },
    { name: 'British Museum — Rosetta Stone & Parthenon Marbles', category: 'Culture', estimatedCost: 0, description: 'Free entry to 8 million objects spanning human history — Egyptian mummies, Greek sculptures, and Enlightenment galleries.', durationHours: 3, bestTimeOfDay: 'Afternoon' },
    { name: 'Borough Market Street Food Lunch', category: 'Food', estimatedCost: 20, description: 'London\'s oldest food market (since 1756) — artisan cheeses, fresh oysters, raclette, and Neal\'s Yard pastries.', durationHours: 1.5, bestTimeOfDay: 'Afternoon' },
    { name: 'Westminster Abbey to Big Ben Walk', category: 'Sightseeing', estimatedCost: 0, description: 'See Westminster Abbey, Houses of Parliament, and Big Ben along the Thames — cross Westminster Bridge for the classic photo.', durationHours: 2, bestTimeOfDay: 'Morning' },
    { name: 'West End Theatre Show', category: 'Entertainment', estimatedCost: 55, description: 'World-class musicals and plays — Les Misérables, Phantom, or Hamilton in the iconic theatre district.', durationHours: 3, bestTimeOfDay: 'Evening' },
  ],
  dubai: [
    { name: 'Burj Khalifa At the Top — 124th & 148th Floor', category: 'Sightseeing', estimatedCost: 45, description: 'World\'s tallest building at 828m — sunset views from the observation deck are absolutely breathtaking.', durationHours: 1.5, bestTimeOfDay: 'Evening' },
    { name: 'Dubai Mall Aquarium & Underwater Zoo', category: 'Sightseeing', estimatedCost: 35, description: '10-million-litre tank with 33,000+ marine animals — walk through the 48m tunnel surrounded by sharks and rays.', durationHours: 2, bestTimeOfDay: 'Afternoon' },
    { name: 'Desert Safari with BBQ Dinner & Dune Bashing', category: 'Adventure', estimatedCost: 65, description: '4x4 dune bashing, camel rides, sandboarding, henna painting, and a BBQ dinner under the stars.', durationHours: 6, bestTimeOfDay: 'Afternoon' },
    { name: 'Gold & Spice Souk in Deira', category: 'Shopping', estimatedCost: 0, description: 'Traditional market with glittering gold shops and aromatic spice stalls — haggling is expected and fun.', durationHours: 2, bestTimeOfDay: 'Morning' },
    { name: 'Dubai Fountain Show at Burj Khalifa Lake', category: 'Sightseeing', estimatedCost: 0, description: 'World\'s largest choreographed fountain — 6,600 lights and 25 colour projectors set to music every 30 minutes.', durationHours: 0.5, bestTimeOfDay: 'Evening' },
  ],
  singapore: [
    { name: 'Gardens by the Bay & Supertree Grove Light Show', category: 'Sightseeing', estimatedCost: 20, description: 'Futuristic Supertrees up to 50m tall — the free nightly light & sound show (7:45pm & 8:45pm) is magical.', durationHours: 2.5, bestTimeOfDay: 'Evening' },
    { name: 'Marina Bay Sands SkyPark Observation Deck', category: 'Sightseeing', estimatedCost: 26, description: '57 floors up — infinity pool views (hotel guests only) and a 360° panorama of the Singapore skyline.', durationHours: 1, bestTimeOfDay: 'Evening' },
    { name: 'Hawker Centre Food Tour at Maxwell & Chinatown', category: 'Food', estimatedCost: 15, description: 'Michelin Bib Gourmand chicken rice at Tian Tian, char kway teow, and laksa — all under $5 per dish.', durationHours: 2, bestTimeOfDay: 'Afternoon' },
    { name: 'Sentosa Island — S.E.A. Aquarium & Beaches', category: 'Adventure', estimatedCost: 40, description: 'World\'s largest aquarium with 100,000+ marine animals, plus Palawan Beach and adventure zip-lines.', durationHours: 4, bestTimeOfDay: 'Morning' },
    { name: 'Little India & Kampong Glam Heritage Walk', category: 'Culture', estimatedCost: 0, description: 'Vibrant Sri Veeramakaliamman Temple, Tekka Market, Sultan Mosque, and Haji Lane street art.', durationHours: 2.5, bestTimeOfDay: 'Morning' },
  ],
  istanbul: [
    { name: 'Hagia Sophia Grand Mosque', category: 'Culture', estimatedCost: 0, description: '1,500-year-old architectural wonder — Byzantine mosaics meet Ottoman minarets in this former cathedral-turned-mosque.', durationHours: 1.5, bestTimeOfDay: 'Morning' },
    { name: 'Grand Bazaar Shopping Experience', category: 'Shopping', estimatedCost: 30, description: 'One of the world\'s oldest covered markets — 4,000+ shops selling carpets, ceramics, spices, and Turkish lamps.', durationHours: 2.5, bestTimeOfDay: 'Morning' },
    { name: 'Bosphorus Strait Sunset Cruise', category: 'Sightseeing', estimatedCost: 15, description: 'Sail between Europe and Asia — passing Dolmabahçe Palace, Rumeli Fortress, and waterfront yalı mansions.', durationHours: 2, bestTimeOfDay: 'Evening' },
    { name: 'Blue Mosque (Sultan Ahmed Mosque)', category: 'Culture', estimatedCost: 0, description: 'Iconic six-minaret mosque with 20,000+ hand-painted İznik tiles in mesmerizing blue patterns.', durationHours: 1, bestTimeOfDay: 'Afternoon' },
    { name: 'Turkish Breakfast at Çakmak Kahvaltı Salonu', category: 'Food', estimatedCost: 12, description: 'Legendary spread — eggs, cheeses, olives, honey, kaymak, simit, and unlimited çay (tea).', durationHours: 1.5, bestTimeOfDay: 'Morning' },
  ],
  kyoto: [
    { name: 'Fushimi Inari Shrine — 10,000 Torii Gates', category: 'Culture', estimatedCost: 0, description: 'Iconic tunnel of vermillion torii gates winding up Mount Inari — arrive at dawn to avoid crowds.', durationHours: 2.5, bestTimeOfDay: 'Morning' },
    { name: 'Arashiyama Bamboo Grove & Tenryu-ji Temple', category: 'Sightseeing', estimatedCost: 8, description: 'Towering bamboo stalks creating an ethereal green corridor, adjacent to a UNESCO World Heritage Zen temple.', durationHours: 2, bestTimeOfDay: 'Morning' },
    { name: 'Kinkaku-ji (Golden Pavilion)', category: 'Culture', estimatedCost: 5, description: 'Zen temple covered in gold leaf reflecting perfectly in the mirror pond — one of Japan\'s most iconic sights.', durationHours: 1, bestTimeOfDay: 'Afternoon' },
    { name: 'Nishiki Market — "Kyoto\'s Kitchen"', category: 'Food', estimatedCost: 20, description: '400-year-old market with 100+ stalls — try yuba (tofu skin), matcha treats, pickles, and fresh mochi.', durationHours: 1.5, bestTimeOfDay: 'Afternoon' },
    { name: 'Geisha District (Gion) Evening Walk', category: 'Culture', estimatedCost: 0, description: 'Historic entertainment district with wooden machiya houses — you may spot a geiko or maiko at dusk.', durationHours: 1.5, bestTimeOfDay: 'Evening' },
  ],
  amsterdam: [
    { name: 'Anne Frank House', category: 'Culture', estimatedCost: 16, description: 'The preserved secret annex where Anne Frank wrote her diary during WWII — deeply moving and essential.', durationHours: 1.5, bestTimeOfDay: 'Morning' },
    { name: 'Rijksmuseum — Rembrandt\'s Night Watch', category: 'Culture', estimatedCost: 22, description: 'Netherlands\' national museum — Rembrandt\'s Night Watch, Vermeer\'s Milkmaid, and 8,000 objects spanning 800 years.', durationHours: 3, bestTimeOfDay: 'Morning' },
    { name: 'Canal Ring Boat Tour', category: 'Sightseeing', estimatedCost: 18, description: 'UNESCO-listed canal belt — cruise past 17th-century merchant houses, houseboats, and 1,500 bridges.', durationHours: 1.5, bestTimeOfDay: 'Afternoon' },
    { name: 'Jordaan Neighborhood & Albert Cuyp Market', category: 'Food', estimatedCost: 15, description: 'Trendy neighborhood with indie shops and galleries, then Amsterdam\'s biggest street market for stroopwafels and herring.', durationHours: 2.5, bestTimeOfDay: 'Afternoon' },
    { name: 'Vondelpark & Heineken Experience', category: 'Sightseeing', estimatedCost: 23, description: 'Relax in Amsterdam\'s beloved park, then tour the original Heineken brewery with tastings included.', durationHours: 2.5, bestTimeOfDay: 'Afternoon' },
  ],
  seoul: [
    { name: 'Gyeongbokgung Palace & Hanbok Rental', category: 'Culture', estimatedCost: 15, description: 'Grand Joseon dynasty palace — rent a hanbok (traditional dress) for free palace entry and stunning photos.', durationHours: 2.5, bestTimeOfDay: 'Morning' },
    { name: 'Myeongdong Street Food & Shopping', category: 'Food', estimatedCost: 20, description: 'Neon-lit shopping street with Korean skincare, K-pop merch, and street food — tteokbokki, hotteok, and egg bread.', durationHours: 2, bestTimeOfDay: 'Evening' },
    { name: 'Bukchon Hanok Village Walk', category: 'Culture', estimatedCost: 0, description: '600-year-old village of traditional Korean hanok houses nestled between two palaces — Instagram paradise.', durationHours: 1.5, bestTimeOfDay: 'Morning' },
    { name: 'N Seoul Tower (Namsan Tower) Sunset', category: 'Sightseeing', estimatedCost: 12, description: 'Iconic tower on Namsan Mountain — take the cable car up for 360° city views and love lock fences.', durationHours: 2, bestTimeOfDay: 'Evening' },
    { name: 'Gwangjang Market Traditional Korean Feast', category: 'Food', estimatedCost: 15, description: 'Korea\'s oldest traditional market — legendary bindaetteok (mung bean pancakes), japchae, and raw beef yukhoe.', durationHours: 1.5, bestTimeOfDay: 'Afternoon' },
  ],
  mumbai: [
    { name: 'Gateway of India & Taj Mahal Palace Hotel', category: 'Sightseeing', estimatedCost: 0, description: 'Iconic colonial-era arch overlooking the Arabian Sea, next to the legendary 1903 Taj Mahal Palace Hotel.', durationHours: 1.5, bestTimeOfDay: 'Morning' },
    { name: 'Dharavi Slum Tour (Reality Tours)', category: 'Culture', estimatedCost: 12, description: 'Eye-opening community-led tour of Asia\'s largest slum — a thriving economy with leather, pottery, and recycling industries.', durationHours: 2.5, bestTimeOfDay: 'Morning' },
    { name: 'Mumbai Street Food Trail — Chowpatty to Mohammed Ali Road', category: 'Food', estimatedCost: 8, description: 'Vada pav, pav bhaji, pani puri on Chowpatty Beach, then kebabs and malpua on Mohammed Ali Road.', durationHours: 3, bestTimeOfDay: 'Evening' },
    { name: 'Elephanta Caves Ferry Trip', category: 'Culture', estimatedCost: 10, description: 'UNESCO World Heritage rock-cut cave temples on an island — 7th-century Hindu sculptures of Shiva Trimurti.', durationHours: 4, bestTimeOfDay: 'Morning' },
    { name: 'Colaba Causeway & Leopold Café', category: 'Shopping', estimatedCost: 20, description: 'Bustling street market for souvenirs, then drinks at the iconic Leopold Café featured in Shantaram.', durationHours: 2, bestTimeOfDay: 'Afternoon' },
  ],
};

function getRealMockActivities(city) {
  const key = city.toLowerCase().trim();
  if (REAL_ACTIVITIES[key]) return REAL_ACTIVITIES[key];
  // Partial match
  for (const [k, v] of Object.entries(REAL_ACTIVITIES)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  // Fallback: generate city-specific but generic-ish suggestions
  return [
    { name: `${city} Old Town Walking Tour`, category: 'Culture', estimatedCost: 15, description: `Explore the historic heart of ${city} — ancient streets, local architecture, and hidden squares.`, durationHours: 2.5, bestTimeOfDay: 'Morning' },
    { name: `${city} Central Market & Street Food`, category: 'Food', estimatedCost: 20, description: `Taste authentic local cuisine at ${city}'s busiest market — fresh produce, street snacks, and regional specialties.`, durationHours: 2, bestTimeOfDay: 'Afternoon' },
    { name: `${city} Panoramic Viewpoint`, category: 'Sightseeing', estimatedCost: 0, description: `Head to the highest point in ${city} for a stunning panoramic view — best at golden hour.`, durationHours: 1.5, bestTimeOfDay: 'Evening' },
    { name: `${city} Museum of History & Art`, category: 'Culture', estimatedCost: 18, description: `Discover ${city}'s rich heritage through artifacts, paintings, and interactive exhibits.`, durationHours: 2, bestTimeOfDay: 'Morning' },
    { name: `${city} Local Neighborhood Food Tour`, category: 'Food', estimatedCost: 35, description: `A guided walk through ${city}'s best-kept culinary secrets — from family-run restaurants to legendary bakeries.`, durationHours: 3, bestTimeOfDay: 'Evening' },
  ];
}

export async function suggestActivities(req, res) {
  const { city } = req.body;
  const prompt = `You are a travel expert. Suggest exactly 5 REAL, SPECIFIC activities for a tourist visiting ${city}. Use actual names of real landmarks, restaurants, temples, museums, neighborhoods, and attractions that exist in ${city}. For each activity, include specific details like the real name of the place, approximate ticket prices in USD, and realistic time estimates. Return ONLY a JSON array with objects having these fields: name (real place name), category (one of: Sightseeing, Culture, Food, Adventure, Shopping, Entertainment), estimatedCost (number in USD), description (1-2 vivid sentences about the real place), durationHours (number), bestTimeOfDay (Morning/Afternoon/Evening).`;
  const mock = getRealMockActivities(city);
  await streamOrMock(res, prompt, mock);
}

export async function buildItinerary(req, res) {
  const { tripId, contextSuggestions } = req.body;
  const trip = await prisma.trip.findUnique({ where: { id: tripId }, include: { stops: true } });
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  const cities = trip.stops.map(s => s.city).join(', ');
  const prompt = `Create a daily itinerary for "${trip.name}" to ${cities}. Return JSON with "days" array.`;
  const mock = { days: [{ dayNumber: 1, theme: "The Arrival", activities: [] }] };
  await streamOrMock(res, prompt, mock);
}

export async function budgetAdvice(req, res) {
  const prompt = "Give me 3 tips to save money on this trip.";
  const mock = ["Eat at local markets.", "Use public transport.", "Book activities in advance."];
  await streamOrMock(res, prompt, mock);
}

export async function tripDescription(req, res) {
  const prompt = "Write a poetic 2-sentence description for this trip.";
  const mock = "A journey through time and culture.";
  await streamOrMock(res, prompt, mock);
}

export async function inspireMe(req, res) {
  const prompt = "Suggest one unique travel destination.";
  const mock = "Sapa, Vietnam — the misty mountains.";
  await streamOrMock(res, prompt, mock);
}
