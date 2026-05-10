import { PrismaClient } from '@prisma/client';

// Ensure DATABASE_URL is set before instantiating
if ((process.env.VERCEL || process.env.RENDER) && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:/tmp/roamio.db';
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./dev.db',
    },
  },
});
