import express from 'express';
import * as memberRequestController from '../controllers/memberRequestController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

const router = express.Router();

router.get('/', requireAuth, asyncHandler(memberRequestController.getMemberRequests));
router.post('/', requireAuth, asyncHandler(memberRequestController.createMemberRequest));
router.patch('/:id/approve', requireRole('administrator', 'controller'), asyncHandler(memberRequestController.approveMemberRequest));
router.patch('/:id/reject', requireRole('administrator', 'controller'), asyncHandler(memberRequestController.rejectMemberRequest));

export default router;
