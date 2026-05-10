import { prisma } from '../lib/prisma.js';

export async function syncUser(req, res) {
  try {
    const { uid, email, name } = req.user;

    // Check if another user already has this email (e.g. dev user)
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== uid) {
      // Another user has this email — update that user's id to match the Firebase uid
      // This handles the case where a dev user was seeded with the same email
      await prisma.user.update({
        where: { email },
        data: { id: uid, name: name || existing.name },
      });
      const user = await prisma.user.findUnique({ where: { id: uid } });
      return res.json({ user });
    }

    const user = await prisma.user.upsert({
      where: { id: uid },
      update: { email, name: name || email.split('@')[0] },
      create: {
        id: uid,
        email,
        name: name || email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
      },
    });
    res.json({ user });
  } catch (err) {
    console.error('syncUser error:', err);
    res.status(500).json({ error: 'Failed to sync user' });
  }
}
