# Roamio — Plan Smarter. Travel Better.

Roamio is an AI-powered travel planning application that helps you create curated itineraries, manage budgets, and explore the world with ease.

## ✨ Key Features
- **AI Itinerary Generation**: Powered by Groq (Llama 3.3) for fast, real-world suggestions.
- **Dynamic Map Pins**: Automatic geocoding for any city in the world using Nominatim.
- **Multi-Currency Support**: Automatic currency detection and conversion based on your destination.
- **Interactive Itinerary Builder**: Drag-and-drop stops and activities.
- **Budget Tracking**: Manage your travel expenses in local and base currencies.
- **Dual Auth Mode**: Seamless Firebase Google/Email login + a dedicated Guest Mode for quick testing.

## 🚀 Tech Stack
- **Frontend**: React, Vite, Framer Motion, Leaflet, Lucide.
- **Backend**: Node.js, Express, Prisma (SQLite), Groq SDK.
- **Auth**: Firebase Authentication.

## 🛠 Setup & Installation

### Backend
1. Navigate to `backend/`
2. Run `npm install`
3. Create a `.env` file based on `.env.example`:
   ```env
   DATABASE_URL="file:./dev.db"
   GROQ_API_KEY=your_key_here
   DEV_AUTH_BYPASS=true
   ```
4. Run `npx prisma migrate dev --name init`
5. Run `npm run dev`

### Frontend
1. Navigate to `frontend/`
2. Run `npm install`
3. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:3001
   VITE_DEV_AUTH=true
   ```
4. Run `npm run dev`

## 🌍 License
MIT
