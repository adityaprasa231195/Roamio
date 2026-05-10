import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import stopRoutes from './routes/stops.js';
import featureRoutes from './routes/features.js';
import aiRoutes from './routes/ai.js';
import { prisma } from './lib/prisma.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── Health checks (BEFORE auth-protected routes) ────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.get('/api/db-check', async (_, res) => {
  try {
    const userCount = await prisma.user.count();
    const tripCount = await prisma.trip.count();
    res.json({ status: 'connected', users: userCount, trips: tripCount });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ─── Routes ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', stopRoutes);
app.use('/api', featureRoutes);

// ─── Static files for Frontend ──────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

// ─── Error handler ───────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🌍 Roamio API running on port ${PORT}`);
});

export default app;
