import express from 'express';
import { verifyFirebase } from '../middleware/verifyFirebase.js';
import {
  getTrips, createTrip, getTripById, updateTrip, deleteTrip, getSharedTrip, autoGenerateItinerary
} from '../controllers/tripsController.js';

const router = express.Router();

// Public route — no auth needed
router.get('/shared/:token', getSharedTrip);

// Protected routes
router.use(verifyFirebase);
router.get('/', getTrips);
router.post('/', createTrip);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.post('/:id/auto-generate', autoGenerateItinerary);

export default router;
