import express from 'express';
import * as authController from '../controllers/authController.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

const router = express.Router();

router.post('/login', asyncHandler(authController.login));
router.post('/register', asyncHandler(authController.register));

export default router;
