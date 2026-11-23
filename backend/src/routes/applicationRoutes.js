import express from 'express';
import * as applicationController from '../controllers/applicationController.js';
import { requireRole } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

const router = express.Router();

router.get('/', requireRole('administrator'), asyncHandler(applicationController.getApplications));
router.post('/', asyncHandler(applicationController.submitApplication));
router.patch('/:id/approve', requireRole('administrator'), asyncHandler(applicationController.approveApplication));
router.patch('/:id/reject', requireRole('administrator'), asyncHandler(applicationController.rejectApplication));
router.delete('/:id', requireRole('administrator'), asyncHandler(applicationController.deleteApplication));

export default router;
