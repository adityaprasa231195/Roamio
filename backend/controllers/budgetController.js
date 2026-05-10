import { prisma } from '../lib/prisma.js';

export async function getBudget(req, res) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: {
        expenses: true,
        stops: { include: { activities: true } },
      },
    });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const totalSpent = trip.expenses.reduce((s, e) => s + e.amount, 0);
    const activityTotal = trip.stops.flatMap(s => s.activities).reduce((s, a) => s + a.estimatedCost, 0);

    const byCategory = trip.expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    // Group by day
    const byDay = {};
    for (const exp of trip.expenses) {
      const day = exp.date.toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + exp.amount;
    }

    const dailyBudget = trip.totalBudget > 0 && trip.startDate && trip.endDate
      ? trip.totalBudget / Math.max(1, Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000))
      : null;

    const overBudgetDays = dailyBudget
      ? Object.entries(byDay).filter(([, amt]) => amt > dailyBudget).map(([day]) => day)
      : [];

    res.json({ totalBudget: trip.totalBudget, totalSpent, activityTotal, byCategory, byDay, overBudgetDays, dailyBudget });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
}

export async function addExpense(req, res) {
  try {
    const { category, amount, label, date, currency } = req.body;
    const expense = await prisma.expense.create({
      data: {
        tripId: req.params.id,
        category: category || 'other',
        amount: parseFloat(amount),
        label,
        date: date ? new Date(date) : new Date(),
        currency: currency || 'USD',
      },
    });
    res.status(201).json({ expense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add expense' });
  }
}

export async function deleteExpense(req, res) {
  try {
    await prisma.expense.delete({ where: { id: req.params.id } });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
}
