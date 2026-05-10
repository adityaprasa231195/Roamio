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

// ─── Routes ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api', stopRoutes);
app.use('/api', featureRoutes);
app.use('/api/ai', aiRoutes);

// ─── Health check ────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.get('/api/db-check', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({ status: 'connected', users: userCount, db: process.env.DATABASE_URL });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message, db: process.env.DATABASE_URL });
  }
});

// ─── Static files for Frontend ──────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Handle SPA routing: serve index.html for all non-api routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// ─── Error handler ───────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL || !process.env.RENDER) {
  app.listen(PORT, () => {
    console.log(`\n🌍 Roamio API running on http://localhost:${PORT}`);
  });
}

export default app;
