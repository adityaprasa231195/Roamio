# 🌍 Traveloop — Claude Code Build Prompt + Hackathon Product Spec

> **Hackathon Brief:** Build a personalized, intelligent travel planning platform within 8 hours.
> **Organizer:** Odoo Hackathon
> **Stack Assumption:** React + Node.js/Express + PostgreSQL (adjust at bottom if needed)

---

## CLAUDE CODE MASTER PROMPT

Paste this into Claude Code to bootstrap the entire project:

```
Build a full-stack travel planning web application called "Traveloop" with the following spec.

## Tech Stack
- Frontend: React 18 + Vite + TailwindCSS + Framer Motion
- Backend: Node.js + Express
- Database: PostgreSQL with Prisma ORM
- Auth: Firebase Authentication (Email/Password + Google OAuth)
- AI: Anthropic Claude API (claude-sonnet-4-20250514) for trip suggestions and budget advice
- Charts: Recharts
- Maps: Leaflet.js (free, no API key needed)
- Icons: Lucide React

## Design System

### Color Palette — "Obsidian & Champagne"
A dark luxury aesthetic inspired by five-star hotels, private aviation, and Amex Centurion:

```css
:root {
  /* Backgrounds */
  --bg-base:       #080810;   /* near-black with subtle violet undertone */
  --bg-surface:    #101018;   /* card backgrounds */
  --bg-elevated:   #18181F;   /* modals, dropdowns */
  --bg-subtle:     #1E1E28;   /* hover states, input fields */

  /* Champagne Gold — the signature accent */
  --gold-bright:   #D4AF6A;   /* primary CTA buttons, active states */
  --gold-muted:    #A8895A;   /* secondary accents, icons */
  --gold-dim:      #5C4A2A;   /* borders, subtle dividers */
  --gold-glow:     rgba(212,175,106,0.15); /* glow effect backgrounds */

  /* Text */
  --text-primary:  #F2EDE4;   /* headings — warm ivory, not harsh white */
  --text-secondary:#A09880;   /* body copy — aged parchment */
  --text-muted:    #5A5448;   /* labels, placeholders */

  /* Semantic */
  --success:       #4CAF7D;   /* under budget */
  --warning:       #C9874A;   /* near limit */
  --danger:        #C94A4A;   /* over budget */
  --info:          #5A8AC9;   /* AI suggestions */
}
```

### Typography
- **Display / Hero headings:** `"Cormorant Garamond"` (Google Fonts) — weight 300–600. Elegant, editorial, distinctly luxury. Pairs with an italic variant for pull quotes.
- **UI / Body:** `"Outfit"` (Google Fonts) — weight 300–500. Clean, modern, highly legible on dark backgrounds. NOT Inter or Roboto.
- **Monospace / Numbers:** `"DM Mono"` for budget figures and dates — numbers feel intentional and precise.

### Visual Language
- **Dark-first.** Everything renders on the obsidian base. No light mode needed for hackathon.
- **Gold is earned, not scattered.** Only interactive elements (buttons, active tabs, hover states, AI response borders) use gold. Decorative use is minimal.
- **Texture & depth.** Cards have a very subtle noise grain overlay (SVG feTurbulence at 3–5% opacity) to avoid flat matte look. Think: luxury leather texture, not matte plastic.
- **Glow effects.** Gold-glow box-shadow on active cards (`0 0 40px rgba(212,175,106,0.12)`). Map pins glow gold on hover.
- **Photography treatment.** City cover images use a dark scrim overlay (`linear-gradient(to top, #080810 0%, transparent 60%)`) so text is always readable and photos feel cinematic rather than garish.
- **Borders.** Use `1px solid rgba(212,175,106,0.12)` for card borders — barely visible gold hairlines, not harsh dividers.
- **Animated gradient hero.** Dashboard hero background: a very slow-moving radial gradient shifting between `#0D0A1A` (deep violet-black) and `#1A100A` (deep bronze-black). Subtle but alive.
- **Style:** High-end concierge app meets editorial travel magazine. Think: Monocle magazine × Soho House member portal × Apple TV screensaver energy.

### Tailwind Config Extension
```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      obsidian: { DEFAULT: '#080810', surface: '#101018', elevated: '#18181F', subtle: '#1E1E28' },
      gold:     { bright: '#D4AF6A', muted: '#A8895A', dim: '#5C4A2A' },
      ivory:    { DEFAULT: '#F2EDE4', secondary: '#A09880', muted: '#5A5448' },
    },
    fontFamily: {
      display: ['"Cormorant Garamond"', 'serif'],
      body:    ['"Outfit"', 'sans-serif'],
      mono:    ['"DM Mono"', 'monospace'],
    },
    boxShadow: {
      gold: '0 0 40px rgba(212,175,106,0.12)',
      'gold-sm': '0 0 16px rgba(212,175,106,0.10)',
    },
  }
}
```

### Google Fonts Import
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
```

## Project Structure
traveloop/
├── frontend/          # React app
│   ├── src/
│   │   ├── pages/     # One file per screen
│   │   ├── components/# Reusable UI components
│   │   ├── hooks/     # Custom React hooks
│   │   ├── api/       # Axios API client
│   │   └── store/     # Zustand state management
├── backend/           # Express API
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── prisma/        # Schema + migrations
└── README.md

## Database Schema (Prisma)

Create these models:

User { id (= Firebase UID), email, name, avatar, createdAt }
  — No password stored. Firebase owns authentication. User row is auto-created
    on first login by calling POST /api/auth/sync with the Firebase ID token.
Trip { id, userId, name, description, coverImage, startDate, endDate, totalBudget, isPublic, shareToken, createdAt }
Stop { id, tripId, cityName, country, latitude, longitude, arrivalDate, departureDate, order, notes }
Activity { id, stopId, name, category, cost, duration, startTime, description, imageUrl }
PackingItem { id, tripId, name, category, isPacked }
TripNote { id, tripId, stopId, content, createdAt }
Expense { id, tripId, category (transport|stay|food|activity|other), amount, label, date }

## Backend API Routes

## Firebase Authentication Setup

### Frontend (firebase SDK)
Install: npm install firebase

// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Auth actions used in the app:
// signInWithEmailAndPassword(auth, email, password)
// createUserWithEmailAndPassword(auth, email, password)
// signInWithPopup(auth, googleProvider)
// signOut(auth)
// onAuthStateChanged(auth, user => { ... })   ← wrap in useAuth() hook

// After any sign-in, call:
// const token = await user.getIdToken();
// POST /api/auth/sync with Authorization: Bearer {token}
// This creates the user row in Postgres if it doesn't exist.

// For all subsequent API calls, get a fresh token:
// const token = await auth.currentUser.getIdToken();
// Attach as Authorization: Bearer {token} header on every request.

### Backend (firebase-admin SDK)
Install: npm install firebase-admin

// middleware/verifyFirebase.js
import admin from 'firebase-admin';
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });

export async function verifyFirebase(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name };
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}
// Apply to all routes except /api/trips/shared/:token

Auth: Handled by Firebase SDK on the frontend.
  POST /api/auth/sync              — called once after Firebase login; creates/updates DB user row
                                     Authorization: Bearer {Firebase ID token}
  All other routes: verifyFirebase middleware extracts uid → req.user

Trips:
  GET    /api/trips               — user's trips
  POST   /api/trips               — create trip
  GET    /api/trips/:id           — single trip with stops + activities
  PUT    /api/trips/:id           — update trip
  DELETE /api/trips/:id           — delete trip
  GET    /api/trips/shared/:token — public shared view

Stops:
  POST   /api/trips/:id/stops
  PUT    /api/stops/:id
  DELETE /api/stops/:id
  PATCH  /api/stops/reorder       — reorder stops array

Activities:
  POST   /api/stops/:id/activities
  PUT    /api/activities/:id
  DELETE /api/activities/:id

Budget:
  GET    /api/trips/:id/budget    — aggregate breakdown
  POST   /api/trips/:id/expenses  — log expense

Packing:
  GET    /api/trips/:id/packing
  POST   /api/trips/:id/packing
  PATCH  /api/packing/:id/toggle

Notes:
  GET    /api/trips/:id/notes
  POST   /api/trips/:id/notes
  DELETE /api/notes/:id

AI:
  POST   /api/ai/suggest-activities   — {city, interests, budget}
  POST   /api/ai/budget-advice        — {tripId} → smart budget tips
  POST   /api/ai/trip-summary         — generate shareable trip description

## Frontend Pages

1. /auth — Full-screen dark split layout. Left panel: slow-motion parallax city video loop (or CSS animated gradient mesh in obsidian/violet). Right panel: Firebase Email/Password form + Google Sign-In button (gold bordered). "Traveloop" wordmark in Cormorant Garamond. No clutter, pure luxury hotel check-in energy.

2. /dashboard — Obsidian background with slow-shifting radial gradient hero. Greeting: "Good evening, [name]" in large Cormorant italic. Horizontal carousel of trip cards. "Inspire Me" button triggers Claude AI. Trending cities in a sleek horizontal strip with country flags and cost tier badges.

3. /trips — Masonry-style grid of TripCards on obsidian background. Filter pills (upcoming / ongoing / past) in gold-bordered capsule style. Skeleton loaders use shimmer animation in --bg-subtle. Empty state: elegant illustration with "Your first journey awaits" in Cormorant italic.

4. /trips/new — 3-step stepper on full-screen dark background. Step indicators: gold filled circle for completed, gold ring for active, dim ring for upcoming. Step 1: Trip name + dates. Step 2: Cover city (Unsplash auto-fetch preview). Step 3: AI destination suggestions as swipeable gold-bordered cards.

5. /trips/:id — Trip detail hub. Hero banner: city photography with dark scrim + trip name in large Cormorant display type + date range in DM Mono. Tab bar: Overview | Itinerary | Budget | Packing | Notes — tabs use gold underline indicator, not pill style.

6. /trips/:id/builder — Split screen: left = vertical stop timeline (obsidian surface cards, gold left-border on active stop, drag handles in gold), right = dark-themed Leaflet map (use CartoDB Dark Matter tile layer) with gold numbered pins and animated polyline route.

7. /trips/:id/budget — Large Recharts PieChart with gold/bronze/amber segment palette on dark background. Day-by-day bar chart with gold budget-limit threshold line. Over-budget days: bars pulse in --danger red. AI Advisor card: gold-left-bordered panel with streaming Claude text.

8. /trips/:id/packing — Categories as collapsible accordion sections. SVG circular progress ring in gold stroke on obsidian. Checkbox items: checking triggers a smooth strikethrough + gold opacity fade. At 100%: gold particle burst animation + "Ready to fly ✈" toast.

9. /trips/:id/notes — Timeline of notes with faint gold connecting line. Each note: obsidian surface card, DM Mono timestamp in --text-muted, body in Outfit. Add note: expanding textarea with gold focus ring.

10. /shared/:token — The showstopper. Full-width cinematic dark page. Hero: city photo full-bleed with Cormorant display name overlay. Route: horizontal stop timeline with gold dots. Activities listed per city as elegant rows. Total cost in large DM Mono. "Copy This Trip" in a full-width gold button. Social share icons.

## Key UI Components

TripCard — dark surface card (#101018), hairline gold border, city photo top half with dark scrim, trip name in Cormorant, date in DM Mono, status badge (gold=upcoming, muted=past). Hover: subtle gold glow shadow + 2px lift translateY.
StopTimeline — vertical spine in --gold-dim, stop dots in --gold-bright, city name in Outfit medium, dates in DM Mono muted. Drag handle: six-dot grid icon in gold-dim.
ActivityCard — horizontal scroll row per day. Card: obsidian elevated, category color tag (left border only), name in Outfit, cost in DM Mono gold, duration chip. AI-suggested badge: small "✦ AI" in italic Cormorant.
MapPanel — CartoDB Dark Matter base tile. Pins: gold circles with white number. Active pin: gold glow pulse animation. Route polyline: gold (#D4AF6A) dashed line, animated dash-offset for "moving" effect.
BudgetDonut — dark background, gold/muted-gold/bronze/amber segments, center shows total in large DM Mono. Custom tooltip: obsidian elevated card.
PackingRing — 120px SVG circle. Track: --bg-subtle. Fill: gold stroke with stroke-dasharray animation. Center: percentage in DM Mono.
AIPanel — floating button: 48px gold circle, sparkle icon, bottom-right. Click: slides up a 380px dark drawer. Response streams in Outfit, bordered left with --gold-bright. Typing: three gold dots pulse animation.
ShareModal — full-screen overlay. Preview card renders trip as a "postcard" — cinematic photo header, route stops as gold timeline, total cost. Copy link button: gold filled. Social icons: ghost gold bordered.
GoldButton — primary CTA. Background: linear-gradient(135deg, #D4AF6A, #A8895A). Text: obsidian #080810. Hover: brightness(1.1) + gold-sm shadow. Active: scale(0.97).
GhostButton — transparent, 1px solid --gold-dim border, --text-secondary text. Hover: border becomes --gold-bright, text becomes --text-primary.

## AI Features (use Anthropic API)

1. "Suggest Activities" — When a city stop is added, call Claude with {city, tripDates, interests, budgetPerDay}. Return 6 activity suggestions with name, category, estimated cost, why it fits. Display as swipeable cards.

2. "Budget Advisor" — Call Claude with full trip data. Return: estimated total, savings tips, over-budget warnings, suggested cuts. Show in Budget tab with warm advisory tone.

3. "Write My Trip Description" — One-click generation of a shareable paragraph about the trip for the Public View page.

4. "Inspire Me" — On dashboard, Claude suggests a city + 3-day itinerary skeleton if user is undecided.

Use streaming for all AI responses (stream: true in API calls). Show animated typing indicator.

## Animations & Interactions

- Page transitions: Framer Motion AnimatePresence with slide-up effect (y: 20 → 0, opacity 0 → 1, duration 0.3s)
- Trip card hover: subtle 3D tilt (CSS perspective + rotateX/Y on mousemove)
- Dashboard hero: animated gradient background that slowly shifts hues
- Add Stop: card slides in from right, city pin drops onto map with bounce
- Budget chart: animates on load (Recharts animation prop)
- Packing item check: strikethrough animation + confetti burst on 100% complete
- Shared view: scroll-triggered fade-in for each city section

## Hackathon Shortcuts (build fast, look premium)

- Use Unsplash Source API for city cover images: https://source.unsplash.com/800x400/?{city},travel (no key needed)
- Seed the DB with 20 popular cities and 5 sample activities each so City Search works instantly
- Pre-build 3 sample trips for the demo account (login: demo@traveloop.com / demo1234)
- Use localStorage to persist auth token
- Skip real email verification — just show success toast

## Judging Differentiators

- AI is deeply integrated (not bolted on) — it appears at the right moment in the user flow
- The shared public view is stunning — judges will screenshot it
- Budget tracking with visual alerts stands out in demo
- Drag-and-drop reordering feels premium
- Mobile responsive from day one

## README Structure

# Traveloop
> Plan smarter. Travel better.

## Features | Tech Stack | Setup | Demo Account | Team | License

Setup:
  cd backend && npm install && npx prisma migrate dev && npm run seed && npm start
  cd frontend && npm install && npm run dev

## Environment Variables

BACKEND:
  DATABASE_URL=postgresql://...
  ANTHROPIC_API_KEY=your_key
  FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}  ← paste JSON as string
  PORT=3001

FRONTEND:
  VITE_API_URL=http://localhost:3001
  VITE_FIREBASE_API_KEY=your_key
  VITE_FIREBASE_AUTH_DOMAIN=yourapp.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=your_project_id

Start building now. Prioritize in this order:
1. Auth + DB setup (30 min)
2. Trip CRUD + Dashboard (45 min)
3. Itinerary Builder + Map (60 min)
4. Budget + Packing screens (45 min)
5. AI features (45 min)
6. Public Share view (30 min)
7. Polish + seed demo data (45 min)
```

---

## PRODUCT VISION & USP

### What Makes Traveloop Win

The original mockup is functional but generic. Here's how to make it **memorable**:

| Original Mockup | Upgraded Traveloop |
|---|---|
| Form-heavy, static screens | Animated, step-by-step progressive disclosure |
| No AI integration | Claude-powered suggestions at every decision point |
| Basic list views | Interactive map + timeline hybrid view |
| Manual budget entry | Auto-estimated budget from activity data |
| Flat card design | Glassmorphism + destination photography overlays |
| No sharing wow factor | Stunning public itinerary page judges will screenshot |

**USP Statement:** *"Traveloop is the only travel planner that thinks with you — AI suggests what to do, where to eat, and how not to blow your budget, while making your itinerary look good enough to post."*

---

## BETTER UI/UX IDEAS (vs. the Mockup)

### 1. Dashboard — "Concierge Lobby"
Obsidian full-bleed background with a slow-pulsing radial gradient (deep violet-black ↔ deep bronze-black). The hero greeting is in large Cormorant Garamond italic — "*Good evening, Aryan.*" — feels personal and luxurious. Trip cards sit in a horizontal carousel with the next upcoming trip highlighted by a faint gold glow. Trending cities scroll in an auto-animated strip at the bottom.

### 2. Itinerary Builder — "Dark Map Room"
Split screen: left = vertical stop timeline on obsidian surface cards with gold left-border accents and drag handles. Right = CartoDB Dark Matter map (dark tiles, no harsh white backgrounds) with animated gold polyline route and glowing numbered pins. Dragging a stop on the left re-animates the pin sequence on the right. Feels like a war-room mission planner — dramatic, impressive in demos.

### 3. Budget Screen — "Wealth Overview"
A large Recharts donut chart with gold/bronze/amber segments on pure obsidian. The center shows the total in large DM Mono numerals. Below: a bar chart where bars are gold, and the budget ceiling is a thin red horizontal line. Over-budget bars pulse --danger red. The AI Advisor appears as a left-gold-bordered panel with streaming italic Cormorant tips — feels like advice from a private wealth manager.

### 4. Packing — "Pre-Flight Ritual"
Categories styled as luxury accordion sections with hairline gold borders. The SVG progress ring uses gold stroke on obsidian track. Checking an item triggers a smooth gold-shimmer strikethrough animation. At 100%, a gold particle burst explodes from the ring and a toast reads "*You're ready to fly. ✈*" in Cormorant italic.

### 5. Public Share View — "The Private Edition"
The shared itinerary renders as a dark luxury editorial page — cinematic full-bleed city photography, trip name in massive Cormorant display, stops as a gold-dot horizontal timeline, activities in clean ivory Outfit rows. Total cost badge in DM Mono. The "Copy This Trip" CTA is a full-width gold gradient button. This is the page judges will open on their own phone.

---

## DATABASE SCHEMA (Detailed)

```sql
-- Users (id = Firebase UID, no password stored — Firebase owns auth)
users (id, email, name, avatar_url, created_at)

-- Trips
trips (id, user_id→users, name, description, cover_image_url,
       start_date, end_date, total_budget, is_public, share_token,
       created_at, updated_at)

-- Stops (cities in the trip, ordered)
stops (id, trip_id→trips, city_name, country, latitude, longitude,
       arrival_date, departure_date, stop_order, notes)

-- Activities (things to do at each stop)
activities (id, stop_id→stops, name, category ENUM(sightseeing|food|adventure|culture|shopping|transport),
            estimated_cost, duration_hours, start_time, description, image_url, is_ai_suggested)

-- Expenses (actual money logged)
expenses (id, trip_id→trips, category ENUM(transport|stay|food|activity|other),
          amount, label, date, currency)

-- Packing items
packing_items (id, trip_id→trips, name, category ENUM(clothing|documents|electronics|essentials|other),
               is_packed, created_at)

-- Notes
trip_notes (id, trip_id→trips, stop_id→stops NULLABLE, content, created_at)
```

---

## API STRUCTURE

```
POST   /api/auth/register          { email, name, password }
POST   /api/auth/login             { email, password } → { token, user }

GET    /api/trips                  → Trip[]
POST   /api/trips                  { name, startDate, endDate, totalBudget }
GET    /api/trips/:id              → Trip + stops + activities
PUT    /api/trips/:id              { ...updates }
DELETE /api/trips/:id
GET    /api/trips/shared/:token    → read-only trip data

POST   /api/trips/:id/stops        { cityName, country, lat, lng, arrivalDate, departureDate }
PATCH  /api/stops/reorder          { stops: [{id, order}] }
DELETE /api/stops/:id

POST   /api/stops/:id/activities   { name, category, estimatedCost, durationHours }
PUT    /api/activities/:id
DELETE /api/activities/:id

GET    /api/trips/:id/budget       → { total, byCategory, byDay, overBudgetDays }
POST   /api/trips/:id/expenses     { category, amount, label, date }

GET    /api/trips/:id/packing
POST   /api/trips/:id/packing      { name, category }
PATCH  /api/packing/:id/toggle
DELETE /api/packing/:id

GET    /api/trips/:id/notes
POST   /api/trips/:id/notes        { content, stopId? }
DELETE /api/notes/:id

POST   /api/ai/suggest-activities  { city, budget, interests, days } → Activity[]
POST   /api/ai/budget-advice       { tripId } → { tips, warnings, savings }
POST   /api/ai/trip-description    { tripId } → { description }
POST   /api/ai/inspire-me          { interests? } → { city, highlights, skeleton }
```

---

## FRONTEND PAGES & COMPONENTS

```
Pages
├── AuthPage          Login/Signup tabs, split-screen layout
├── DashboardPage     Hero, upcoming trip, trending cities, quick stats
├── MyTripsPage       Grid of TripCards, filter bar, empty state
├── CreateTripPage    3-step wizard with progress bar
├── TripDetailPage    Tabbed: Overview | Builder | Budget | Packing | Notes
├── ItineraryBuilder  Split timeline + map view
├── BudgetPage        Charts, expense logger, AI advisor
├── PackingPage       Categorized checklist with progress ring
├── NotesPage         Notes timeline per stop
└── SharedTripPage    Public read-only view

Components
├── TripCard          Cover image, gradient overlay, date badge, status chip
├── StopTimeline      Vertical timeline with drag handles
├── ActivityCard      Category color tag, cost badge, duration, AI chip
├── MapPanel          Leaflet map, numbered pins, polyline route
├── BudgetDonut       Recharts PieChart, animated, custom tooltip
├── DayBars           Recharts BarChart with budget limit line
├── PackingRing       SVG circle progress, confetti on complete
├── AIPanel           Floating button → slide-up drawer with streaming text
├── CitySearch        Debounced search → city cards with flag + cost index
├── ShareModal        Preview card, copy link, QR code, social buttons
├── StepWizard        Generic multi-step form with validation
└── DestinationHero   City name + country + large gradient photo header
```

---

## AI INTEGRATION GUIDE

### Activity Suggester (most impressive for demo)

```javascript
// Trigger: user adds a city stop
const prompt = `
You are a travel expert. Suggest 6 activities for a ${days}-day trip to ${city}.
Budget per day: $${budget}. Traveler interests: ${interests.join(', ')}.

Return ONLY a JSON array:
[{
  "name": "activity name",
  "category": "sightseeing|food|adventure|culture",
  "estimatedCost": 25,
  "durationHours": 2,
  "description": "one sentence why this is great",
  "bestTimeOfDay": "morning|afternoon|evening"
}]
`
```

### Budget Advisor

```javascript
const prompt = `
Analyze this trip and give budget advice. Trip data:
${JSON.stringify(tripSummary)}

Return JSON:
{
  "totalEstimate": 1200,
  "warnings": ["Day 3 in Paris looks 30% over budget"],
  "tips": ["Swap dinner at X for Y to save $40"],
  "greenFlags": ["Accommodation costs are very reasonable"]
}
`
```

---

## 8-HOUR BUILD TIMELINE

| Hour | Focus |
|------|-------|
| 0:00–0:30 | Project scaffold, DB setup, Prisma migrate, seed cities |
| 0:30–1:15 | Auth (register/login/JWT), basic layout shell, nav |
| 1:15–2:15 | Trip CRUD, Dashboard, My Trips page |
| 2:15–3:15 | Itinerary Builder (stops + activities), Map integration |
| 3:15–4:00 | Budget screen (charts + expense logger) |
| 4:00–4:45 | Packing checklist + Notes |
| 4:45–5:30 | AI features (activity suggest + budget advisor) |
| 5:30–6:00 | Public Share view (the wow moment) |
| 6:00–6:45 | Polish: animations, loading states, empty states, mobile |
| 6:45–7:15 | Seed demo account + 3 sample trips |
| 7:15–7:30 | README, .env.example, deploy (Railway / Render) |
| 7:30–8:00 | Demo rehearsal + slide prep |

---

## HACKATHON-WINNING DIFFERENTIATORS

### Technical
- **Streaming AI responses** — text appears word by word, not all at once. Visually dramatic.
- **Drag-and-drop reordering** — stops can be reordered with real-time map update
- **Auto-budget estimation** — adding an activity automatically updates the budget total
- **Share token** — one-click unique URL generation, shareable without login

### UX/Design
- **Destination photography** — every city gets a beautiful Unsplash cover (zero API cost)
- **Mobile-first responsive** — judges may check on phone
- **Dark mode** — toggle in nav, persisted via localStorage
- **Smooth transitions** — Framer Motion on every page change makes it feel like a native app

### Demo-Specific
- Pre-loaded "Europe Backpacker" demo trip with 5 cities, 20 activities, full budget + packing
- AI suggestions fire in ~2 seconds during live demo (pre-warm the endpoint)
- Public share URL ready to show on a second device

---

## DEPLOYMENT PLAN

**Recommended (free tier):**
- **Database:** Supabase (free PostgreSQL, get connection string)
- **Backend:** Railway.app (free tier, push-to-deploy from GitHub)
- **Frontend:** Vercel (free, deploy from GitHub, set VITE_API_URL env var)

**Steps:**
```bash
# 1. Create Supabase project → copy DATABASE_URL
# 2. Push to GitHub
# 3. Railway: New Project → GitHub repo → backend/ folder → add env vars
# 4. Vercel: New Project → GitHub repo → frontend/ folder → add VITE_API_URL
# 5. Done — share the Vercel URL with judges
```

---

## DEMO FLOW (5 minutes)

1. **Open dashboard** — Show the hero with the demo trip "Europe Summer 2025". Point out the countdown.
2. **Create a new trip** — Type "Japan Adventure", pick dates. AI suggests Kyoto, Tokyo, Osaka in 3 clicks.
3. **Add a stop + AI activities** — Add Tokyo → click "Suggest Activities" → Claude streams 6 suggestions. Pick 3.
4. **Show the map** — Zoom into the Leaflet map with animated pin drops. Drag a stop to reorder.
5. **Budget tab** — Show the donut chart + "You're ¥12,000 over in Tokyo" warning. Click "AI Advice" → streaming tip.
6. **Packing list** — Check 3 items, progress ring fills. Check last item → confetti burst.
7. **Share the trip** — Click "Share" → copy link → open in incognito → show the gorgeous public view.
8. **Close with pitch:** "We built Traveloop to make travel planning as exciting as the trip. AI isn't a feature — it's your co-pilot."

---

## PITCH-READY EXPLANATION

> "Every traveler has experienced the chaos of planning across 10 browser tabs, spreadsheets, and group chats. Traveloop collapses all of that into one intelligent, beautiful platform.
>
> We use Claude AI not as a gimmick but as a genuine planning partner — it suggests activities based on your budget, warns you before you overspend, and writes a shareable version of your itinerary that your friends will actually want to read.
>
> In 8 hours, we built a full-stack app with auth, a relational database, real-time AI streaming, interactive maps, drag-and-drop itineraries, and a public sharing system.
>
> Traveloop is production-ready. The same codebase, with payment integration and a social layer, is a fundable product."

---

## README TEMPLATE

```markdown
# 🌍 Traveloop
> Plan smarter. Travel better.

Traveloop is a personalized travel planning platform powered by AI. Build multi-city itineraries, track your budget, manage your packing list, and share your plans with the world.

## ✨ Features
- 🗺️ Interactive itinerary builder with map view
- 🤖 AI-powered activity suggestions (Claude)
- 💰 Auto-estimated budgets with visual breakdowns
- 🧳 Smart packing checklist
- 🔗 One-click public sharing
- 📱 Mobile responsive

## 🚀 Tech Stack
React · Vite · TailwindCSS · Framer Motion · Node.js · Express · PostgreSQL · Prisma · Anthropic Claude API · Leaflet.js

## 🏃 Quick Start
\`\`\`bash
# Backend
cd backend && cp .env.example .env  # fill in values
npm install && npx prisma migrate dev && npm run seed && npm start

# Frontend
cd frontend && cp .env.example .env  # fill in VITE_API_URL
npm install && npm run dev
\`\`\`

## 🔑 Demo Account
Email: demo@traveloop.com | Password: demo1234

## 👥 Team
Built at [Hackathon Name] by [Team Name]

## 📄 License
MIT
```

---

*Built for the Odoo Hackathon · Traveloop spec by Claude · Stack is flexible — swap PostgreSQL for SQLite locally, or MongoDB if your team prefers.*
