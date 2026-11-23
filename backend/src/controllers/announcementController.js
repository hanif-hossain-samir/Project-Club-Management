import { dataService } from '../services/dataService.js';
import { isValidImageUrl, sanitizePlainObject, sanitizeString } from '../utils/validators.js';

export async function getAnnouncements(req, res) {
  const announcements = await dataService.getAnnouncements({
    clubId: typeof req.query.clubId === 'string' ? req.query.clubId : undefined,
    priority: typeof req.query.priority === 'string' ? req.query.priority : undefined
  });
  res.json({ success: true, announcements });
}

export async function createAnnouncement(req, res) {
  const authUser = req.authUser;
  const title = sanitizeString(req.body?.title, 200);
  const content = sanitizeString(req.body?.content, 4000);

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required.' });
  }

  const rawImageUrl = sanitizeString(req.body?.imageUrl, 500);
  if (rawImageUrl && !isValidImageUrl(rawImageUrl)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid announcement image URL. Only http/https URLs, local image assets, or data:image URIs are permitted.'
    });
  }

  let effectiveClubId = req.body?.clubId || 'all';
  if (authUser.role === 'controller') {
    effectiveClubId = authUser.clubAffiliation || 'computer_club';
  }

  const newAnnouncement = {
    id: `ann-${Date.now()}`,
    title,
    content,
    clubId: effectiveClubId,
    wingSlug: sanitizeString(req.body?.wingSlug, 40) || 'all',
    priority: ['urgent', 'important', 'general', 'competition'].includes(req.body?.priority)
      ? req.body.priority
      : 'general',
    publishedAt: new Date().toISOString(),
    authorName: authUser.name,
    authorRole:
      authUser.role === 'administrator'
        ? 'Administrator'
        : `Club Controller (${effectiveClubId === 'computer_club' ? 'CUCC' : 'Events & Clubs'})`,
    attachmentName: sanitizeString(req.body?.attachmentName, 160) || undefined,
    imageUrl: rawImageUrl || undefined,
    category: sanitizeString(req.body?.category, 60) || 'Notice',
    pinned: Boolean(req.body?.pinned)
  };

  const created = await dataService.createAnnouncement(newAnnouncement);
  res.status(201).json({ success: true, announcement: created });
}

export async function updateAnnouncement(req, res) {
  const authUser = req.authUser;
  const existing = await dataService.getAnnouncementById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Announcement not found.' });
  }
  if (authUser.role === 'controller' && existing.clubId !== authUser.clubAffiliation) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. You can only edit announcements for your own club.'
    });
  }

  const safeBody = sanitizePlainObject(req.body);
  if (safeBody.imageUrl !== undefined && safeBody.imageUrl !== '' && !isValidImageUrl(String(safeBody.imageUrl))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid announcement image URL.'
    });
  }
  delete safeBody.id;
  const updatedClubId =
    authUser.role === 'controller' ? existing.clubId : safeBody.clubId || existing.clubId;

  const updated = await dataService.updateAnnouncement(req.params.id, {
    ...safeBody,
    clubId: updatedClubId
  });
  res.json({ success: true, announcement: updated });
}

export async function deleteAnnouncement(req, res) {
  const authUser = req.authUser;
  const existing = await dataService.getAnnouncementById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Announcement not found.' });
  }
  if (authUser.role === 'controller' && existing.clubId !== authUser.clubAffiliation) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. You can only delete announcements for your own club.'
    });
  }

  await dataService.deleteAnnouncement(req.params.id);
  res.json({ success: true, message: 'Announcement removed successfully.' });
}
