import express from 'express';
import * as clubController from '../controllers/clubController.js';
import { requireRole } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

const router = express.Router();

router.get('/', asyncHandler(clubController.getClubs));
router.get('/:id', asyncHandler(clubController.getClubById));
router.put('/:id', requireRole('administrator'), asyncHandler(clubController.updateClub));

export default router;
