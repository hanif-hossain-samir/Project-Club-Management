import express from 'express';
import * as userController from '../controllers/userController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

const router = express.Router();

router.get('/users', requireAuth, asyncHandler(userController.getUsers));
router.post('/users', requireRole('administrator'), asyncHandler(userController.createUser));
router.put('/users/:id', requireRole('administrator'), asyncHandler(userController.updateUser));
router.delete('/users/:id', requireRole('administrator'), asyncHandler(userController.deleteUser));

router.get('/members', requireRole('administrator', 'controller'), asyncHandler(userController.getMembers));
router.delete('/members/:userId', requireRole('administrator', 'controller'), asyncHandler(userController.removeMember));

export default router;
