import { dataService } from '../services/dataService.js';
import { canManageClub } from '../middleware/authMiddleware.js';
import {
  ALLOWED_CLUB_WINGS,
  getClubForWing,
  isValidImageUrl,
  sanitizePlainObject,
  sanitizeString
} from '../utils/validators.js';

export async function getGallery(req, res) {
  const gallery = await dataService.getGallery({
    clubId: typeof req.query.clubId === 'string' ? req.query.clubId : undefined,
    wingSlug: typeof req.query.wingSlug === 'string' ? req.query.wingSlug : undefined
  });
  res.json({ success: true, gallery });
}

export async function createGalleryItem(req, res) {
  const authUser = req.authUser;
  const wingSlug = sanitizeString(req.body?.wingSlug, 40);
  if (!wingSlug) {
    return res.status(400).json({ success: false, message: 'Target wing slug is required.' });
  }

  const effectiveClubId =
    authUser.role === 'controller'
      ? authUser.clubAffiliation || 'computer_club'
      : req.body?.clubId || getClubForWing(wingSlug);

  if (!ALLOWED_CLUB_WINGS[effectiveClubId]?.includes(wingSlug)) {
    return res.status(403).json({
      success: false,
      message: `Wing '${wingSlug}' does not belong to ${effectiveClubId === 'computer_club' ? 'Computer Club' : 'Events & Clubs'}.`
    });
  }

  const title = sanitizeString(req.body?.title, 180);
  const caption = sanitizeString(req.body?.caption, 1000);
  const eventName = sanitizeString(req.body?.eventName, 140) || 'University Album Photo';
  const imageUrls = req.body?.imageUrls;

  if (Array.isArray(imageUrls) && imageUrls.length > 0) {
    const validUrls = imageUrls.filter((u) => typeof u === 'string' && isValidImageUrl(u));
    if (validUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid image URLs provided. Only http/https URLs, local image assets, or data:image URIs are permitted.'
      });
    }
    const createdItems = [];
    for (let index = 0; index < validUrls.length; index++) {
      const url = validUrls[index];
      const newItem = {
        id: `gal-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
        title: title || `${wingSlug.replace('_', ' ')} Photo ${index + 1}`,
        caption,
        imageUrl: url,
        clubId: effectiveClubId,
        wingSlug,
        eventName,
        date: new Date().toISOString().split('T')[0],
        photogName: authUser.name,
        likes: 0
      };
      const saved = await dataService.createGalleryItem(newItem);
      createdItems.push(saved);
    }
    return res.status(201).json({ success: true, items: createdItems, item: createdItems[0] });
  }

  const imageUrl = typeof req.body?.imageUrl === 'string' ? req.body.imageUrl : '';
  if (!imageUrl || !isValidImageUrl(imageUrl)) {
    return res.status(400).json({
      success: false,
      message: 'Valid image URL is required.'
    });
  }

  const newItem = {
    id: `gal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: title || `${wingSlug.replace('_', ' ')} Photo`,
    caption,
    imageUrl,
    clubId: effectiveClubId,
    wingSlug,
    eventName,
    date: new Date().toISOString().split('T')[0],
    photogName: authUser.name,
    likes: 0
  };

  const created = await dataService.createGalleryItem(newItem);
  res.status(201).json({ success: true, item: created });
}

export async function likeGalleryItem(req, res) {
  const item = await dataService.likeGalleryItem(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Gallery item not found.' });
  }
  res.json({ success: true, likes: item.likes });
}

export async function updateGalleryItem(req, res) {
  const authUser = req.authUser;
  const item = await dataService.getGalleryById(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Gallery item not found.' });
  }
  if (!canManageClub(authUser, item.clubId)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. You can only edit photos in your own club album.'
    });
  }

  const safeBody = sanitizePlainObject(req.body);
  if (safeBody.imageUrl !== undefined && !isValidImageUrl(String(safeBody.imageUrl))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid gallery image URL.'
    });
  }
  delete safeBody.id;
  safeBody.clubId = item.clubId;

  const updated = await dataService.updateGalleryItem(req.params.id, safeBody);
  res.json({ success: true, item: updated });
}

export async function deleteGalleryItem(req, res) {
  const authUser = req.authUser;
  const item = await dataService.getGalleryById(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Gallery item not found.' });
  }
  if (!canManageClub(authUser, item.clubId)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. You can only delete photos from your own club album.'
    });
  }

  await dataService.deleteGalleryItem(req.params.id);
  res.json({ success: true, message: 'Gallery item deleted.' });
}
