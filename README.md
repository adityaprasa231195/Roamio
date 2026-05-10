# 🌍 Roamio — Your AI-Powered Travel Architect

[Live Demo](https://roamio-eju3.onrender.com/auth)
*Experience the future of travel planning instantly.*

**Roamio** is a state-of-the-art travel planning application that transforms the way you explore the world. By combining the power of **Groq Llama 3.3 AI** with real-time geocoding and a sleek, premium interface, Roamio turns vague travel ideas into detailed, actionable itineraries.

---

## ✨ Key Features

### 🤖 Intelligent Itineraries
- **AI-Generated Suggestions**: Get hyper-localized activity recommendations powered by the world's fastest AI (Groq Llama 3.3).
- **Smart Fallbacks**: Curated suggestions for 50+ major global cities when offline or in restricted environments.

### 📍 Precision Mapping
- **Auto-Geocoding**: Every city you type is instantly mapped using the **Nominatim (OpenStreetMap)** API—no more missing map pins.
- **Interactive Map Builder**: Visualize your journey with beautiful Leaflet-powered map visualizations.

### 💰 Financial Intelligence
- **Dynamic Localization**: Automatically detects and switches to local currencies (PKR, EUR, JPY, etc.) based on your destination.
- **Budget Tracking**: Real-time expense monitoring and budget breakdown by category (Transport, Food, Stay).

### 🔐 Modern Authentication
- **Dual-Mode Login**: Seamlessly transition between **Google/Email (Firebase)** and a fast **Guest Mode** for quick experimentation.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Animations**: Framer Motion
- **Icons/UI**: Lucide React + Custom CSS (Premium Glassmorphism)
- **State Management**: Zustand

### Backend
- **Server**: Node.js + Express
- **Database**: Prisma ORM (SQLite for edge/dev)
- **AI Orchestration**: Groq SDK + Llama 3.3 70B
- **Deployment**: Render Monorepo Orchestration

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install
```bash
git clone https://github.com/adityaprasa231195/Roamio.git
cd Roamio
npm install # Root install
```

### 2. Configure Environment
Create a `.env` in the root and subdirectories with your API keys:
- `GROQ_API_KEY`: Get from [Groq Console](https://console.groq.com)
- `FIREBASE_SERVICE_ACCOUNT`: Get from Firebase Settings

### 3. Run
```bash
npm run build # Build both frontend and backend
npm start     # Start the unified server
```

---
## 👥 Team
Built at Odoo Hackathon by [SignalZero]
---

## 🌍 License
This project is licensed under the **MIT License**.
