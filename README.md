# 🌍 Roamio
> Roam further. Plan smarter.

Roamio is a personalized AI-powered travel planning platform. Build multi-city itineraries,
track your budget, manage your packing list, and share cinematic trip pages with the world.
Dark. Fast. Beautiful. Built in 8 hours.

## ✨ Features
- 🗺️ Interactive itinerary builder with dark-themed map view
- 🤖 AI-powered activity suggestions & budget advice (Claude)
- 💰 Visual budget breakdowns with over-spend alerts
- 🧳 Smart packing checklist with progress ring
- 🔗 One-click cinematic public trip sharing
- 🔐 Firebase Auth (Email + Google Sign-In)
- 📱 Fully mobile responsive

## 🎨 Design
Obsidian & Champagne — dark luxury aesthetic.
Fonts: Cormorant Garamond (display) · Outfit (UI) · DM Mono (numbers)
Colors: #080810 base · #D4AF6A gold · #F2EDE4 ivory

## 🚀 Tech Stack
React · Vite · TailwindCSS · Framer Motion · Node.js · Express · PostgreSQL · Prisma
Firebase Auth · Anthropic Claude API · Leaflet.js · Recharts

## 🏃 Quick Start
\`\`\`bash
# Backend
cd backend && cp .env.example .env  # fill in values
npm install && npx prisma migrate dev && npm run seed && npm start

# Frontend
cd frontend && cp .env.example .env  # fill in Firebase + API URL
npm install && npm run dev
\`\`\`

## 🔑 Demo Account
Email: demo@roamio.app | Password: demo1234
(Includes 3 pre-loaded trips: Europe Backpacker · Japan 10 Days · Goa Weekend)

## 👥 Team
Built at Odoo Hackathon by [Team Name]

## 📄 License
MIT