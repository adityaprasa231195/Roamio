import { prisma } from '../lib/prisma.js';

export async function createStop(req, res) {
  try {
    const { cityName, country, latitude, longitude, arrivalDate, departureDate, notes } = req.body;
    const count = await prisma.stop.count({ where: { tripId: req.params.tripId } });
    const stop = await prisma.stop.create({
      data: {
        tripId: req.params.tripId,
        cityName, country,
        latitude: latitude || null,
        longitude: longitude || null,
        arrivalDate: arrivalDate ? new Date(arrivalDate) : null,
        departureDate: departureDate ? new Date(departureDate) : null,
        stopOrder: count,
        notes,
      },
      include: { activities: true },
    });
    res.status(201).json({ stop });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create stop' });
  }
}

export async function updateStop(req, res) {
  try {
    const { cityName, country, latitude, longitude, arrivalDate, departureDate, notes } = req.body;
    const stop = await prisma.stop.update({
      where: { id: req.params.id },
      data: {
        ...(cityName && { cityName }),
        ...(country !== undefined && { country }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
        ...(arrivalDate !== undefined && { arrivalDate: arrivalDate ? new Date(arrivalDate) : null }),
        ...(departureDate !== undefined && { departureDate: departureDate ? new Date(departureDate) : null }),
        ...(notes !== undefined && { notes }),
      },
      include: { activities: true },
    });
    res.json({ stop });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update stop' });
  }
}

export async function deleteStop(req, res) {
  try {
    await prisma.stop.delete({ where: { id: req.params.id } });
    res.json({ message: 'Stop deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete stop' });
  }
}

export async function reorderStops(req, res) {
  try {
    const { stops } = req.body; // [{id, order}]
    await Promise.all(
      stops.map(({ id, order }) =>
        prisma.stop.update({ where: { id }, data: { stopOrder: order } })
      )
    );
    res.json({ message: 'Stops reordered' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reorder stops' });
  }
}

export async function addActivity(req, res) {
  try {
    const { name, category, estimatedCost, durationHours, startTime, description, imageUrl, isAiSuggested } = req.body;
    const activity = await prisma.activity.create({
      data: {
        stopId: req.params.stopId,
        name, category,
        estimatedCost: estimatedCost || 0,
        durationHours: durationHours || 1,
        startTime, description, imageUrl,
        isAiSuggested: isAiSuggested || false,
      },
    });
    res.status(201).json({ activity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add activity' });
  }
}

export async function updateActivity(req, res) {
  try {
    const activity = await prisma.activity.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ activity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update activity' });
  }
}

export async function deleteActivity(req, res) {
  try {
    await prisma.activity.delete({ where: { id: req.params.id } });
    res.json({ message: 'Activity deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
}
