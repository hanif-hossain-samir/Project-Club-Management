import express from 'express';
import * as eventController from '../controllers/eventController.js';
import { requireRole } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

const router = express.Router();

router.get('/', asyncHandler(eventController.getEvents));
router.get('/:id', asyncHandler(eventController.getEventById));
router.post('/', requireRole('administrator', 'controller'), asyncHandler(eventController.createEvent));
router.put('/:id', requireRole('administrator', 'controller'), asyncHandler(eventController.updateEvent));
router.delete('/:id', requireRole('administrator', 'controller'), asyncHandler(eventController.deleteEvent));
router.post('/:id/register', asyncHandler(eventController.registerForEvent));

export default router;
