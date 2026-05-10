import express from 'express';
import { syncUser } from '../controllers/authController.js';
import { verifyFirebase } from '../middleware/verifyFirebase.js';

const router = express.Router();

router.post('/sync', verifyFirebase, syncUser);

export default router;
