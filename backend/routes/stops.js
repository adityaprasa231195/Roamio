import express from 'express';
import { verifyFirebase } from '../middleware/verifyFirebase.js';
import { createStop, updateStop, deleteStop, reorderStops, addActivity, updateActivity, deleteActivity } from '../controllers/stopsController.js';

const router = express.Router();
router.use(verifyFirebase);

// Stops
router.post('/trips/:tripId/stops', createStop);
router.put('/stops/:id', updateStop);
router.delete('/stops/:id', deleteStop);
router.patch('/stops/reorder', reorderStops);

// Activities
router.post('/stops/:stopId/activities', addActivity);
router.put('/activities/:id', updateActivity);
router.delete('/activities/:id', deleteActivity);

export default router;
