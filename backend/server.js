import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import stopRoutes from './routes/stops.js';
import featureRoutes from './routes/features.js';
import aiRoutes from './routes/ai.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api', stopRoutes);
app.use('/api', featureRoutes);
app.use('/api/ai', aiRoutes);

// ─── Static files for Frontend ──────────────────────────────────
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Handle SPA routing: serve index.html for all non-api routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// ─── Health check ────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ─── 404 handler ─────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.url} not found` }));

// ─── Error handler ───────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🌍 Roamio API running on http://localhost:${PORT}`);
  console.log(`🔑 Auth mode: ${process.env.DEV_AUTH_BYPASS === 'true' ? 'DEV BYPASS (no Firebase needed)' : 'Firebase'}`);
  console.log(`🤖 AI mode: ${process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '' ? 'Groq Llama 3' : 'Mock (set GROQ_API_KEY to enable)'}`);
});
