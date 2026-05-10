import express from 'express';
import { verifyFirebase } from '../middleware/verifyFirebase.js';
import { getBudget, addExpense, deleteExpense } from '../controllers/budgetController.js';
import { getPacking, addPackingItem, togglePacking, deletePackingItem } from '../controllers/packingController.js';
import { getNotes, addNote, deleteNote } from '../controllers/notesController.js';

const router = express.Router();
router.use(verifyFirebase);

// Budget
router.get('/trips/:id/budget', getBudget);
router.post('/trips/:id/expenses', addExpense);
router.delete('/expenses/:id', deleteExpense);

// Packing
router.get('/trips/:id/packing', getPacking);
router.post('/trips/:id/packing', addPackingItem);
router.patch('/packing/:id/toggle', togglePacking);
router.delete('/packing/:id', deletePackingItem);

// Notes
router.get('/trips/:id/notes', getNotes);
router.post('/trips/:id/notes', addNote);
router.delete('/notes/:id', deleteNote);

export default router;
