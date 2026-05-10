import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getPacking(req, res) {
  try {
    const items = await prisma.packingItem.findMany({
      where: { tripId: req.params.id },
      orderBy: [{ category: 'asc' }, { createdAt: 'asc' }],
    });
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch packing items' });
  }
}

export async function addPackingItem(req, res) {
  try {
    const { name, category } = req.body;
    const item = await prisma.packingItem.create({
      data: { tripId: req.params.id, name, category: category || 'essentials' },
    });
    res.status(201).json({ item });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add packing item' });
  }
}

export async function togglePacking(req, res) {
  try {
    const item = await prisma.packingItem.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    const updated = await prisma.packingItem.update({
      where: { id: req.params.id },
      data: { isPacked: !item.isPacked },
    });
    res.json({ item: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle packing item' });
  }
}

export async function deletePackingItem(req, res) {
  try {
    await prisma.packingItem.delete({ where: { id: req.params.id } });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
}
