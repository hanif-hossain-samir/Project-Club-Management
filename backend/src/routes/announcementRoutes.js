import express from 'express';
import * as announcementController from '../controllers/announcementController.js';
import { requireRole } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

const router = express.Router();

router.get('/', asyncHandler(announcementController.getAnnouncements));
router.post('/', requireRole('administrator', 'controller'), asyncHandler(announcementController.createAnnouncement));
router.put('/:id', requireRole('administrator', 'controller'), asyncHandler(announcementController.updateAnnouncement));
router.delete('/:id', requireRole('administrator', 'controller'), asyncHandler(announcementController.deleteAnnouncement));

export default router;
