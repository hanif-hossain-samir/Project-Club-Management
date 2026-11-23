import express from 'express';
import * as galleryController from '../controllers/galleryController.js';
import { requireRole } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

const router = express.Router();

router.get('/', asyncHandler(galleryController.getGallery));
router.post('/', requireRole('administrator', 'controller'), asyncHandler(galleryController.createGalleryItem));
router.post('/:id/like', asyncHandler(galleryController.likeGalleryItem));
router.put('/:id', requireRole('administrator', 'controller'), asyncHandler(galleryController.updateGalleryItem));
router.delete('/:id', requireRole('administrator', 'controller'), asyncHandler(galleryController.deleteGalleryItem));

export default router;
