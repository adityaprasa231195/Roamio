import express from 'express';
import { verifyFirebase } from '../middleware/verifyFirebase.js';
import { suggestActivities, budgetAdvice, tripDescription, inspireMe } from '../controllers/aiController.js';

const router = express.Router();
router.use(verifyFirebase);

router.post('/suggest-activities', suggestActivities);
router.post('/budget-advice', budgetAdvice);
router.post('/trip-description', tripDescription);
router.post('/inspire-me', inspireMe);

export default router;
