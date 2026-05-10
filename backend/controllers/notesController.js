import { prisma } from '../lib/prisma.js';

export async function getNotes(req, res) {
  try {
    const notes = await prisma.tripNote.findMany({
      where: { tripId: req.params.id },
      include: { stop: { select: { cityName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
}

export async function addNote(req, res) {
  try {
    const { content, stopId } = req.body;
    const note = await prisma.tripNote.create({
      data: { tripId: req.params.id, content, stopId: stopId || null },
      include: { stop: { select: { cityName: true } } },
    });
    res.status(201).json({ note });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add note' });
  }
}

export async function deleteNote(req, res) {
  try {
    await prisma.tripNote.delete({ where: { id: req.params.id } });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
}
