import { dataService } from '../services/dataService.js';
import { canManageClub } from '../middleware/authMiddleware.js';
import { ALLOWED_CLUB_WINGS, isValidImageUrl, sanitizePlainObject, sanitizeString } from '../utils/validators.js';

export async function getEvents(req, res) {
  const events = await dataService.getEvents({
    clubId: typeof req.query.clubId === 'string' ? req.query.clubId : undefined,
    wingSlug: typeof req.query.wingSlug === 'string' ? req.query.wingSlug : undefined,
    status: typeof req.query.status === 'string' ? req.query.status : undefined,
    search: typeof req.query.search === 'string' ? req.query.search : undefined
  });
  res.json({ success: true, events });
}

export async function getEventById(req, res) {
  const evt = await dataService.getEventById(req.params.id);
  if (!evt) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }
  res.json({ success: true, event: evt });
}

export async function createEvent(req, res) {
  const authUser = req.authUser;
  const effectiveClubId =
    authUser.role === 'controller'
      ? authUser.clubAffiliation || 'computer_club'
      : req.body?.clubId || 'computer_club';

  const title = sanitizeString(req.body?.title, 180);
  const wingSlug = sanitizeString(req.body?.wingSlug, 40);
  const date = sanitizeString(req.body?.date, 30);
  const venue = sanitizeString(req.body?.venue, 180);

  if (!title || !wingSlug || !date || !venue) {
    return res.status(400).json({
      success: false,
      message: 'Missing required event fields (title, wing, date, venue).'
    });
  }

  const validWings = ALLOWED_CLUB_WINGS[effectiveClubId] || [];
  if (!validWings.includes(wingSlug)) {
    return res.status(403).json({
      success: false,
      message: `Invalid wing '${wingSlug}' for ${effectiveClubId === 'computer_club' ? 'Computer Club' : 'Events & Clubs'}. Allowed wings: ${validWings.join(', ')}.`
    });
  }

  const rawBannerUrl = sanitizeString(req.body?.bannerUrl, 500);
  if (rawBannerUrl && !isValidImageUrl(rawBannerUrl)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid event banner URL. Only http/https URLs, local image assets, or data:image URIs are permitted.'
    });
  }

  const category = sanitizeString(req.body?.category, 80) || 'General Event';
  const description = sanitizeString(req.body?.description, 2000);
  const newEvent = {
    id: `evt-${Date.now()}`,
    title,
    clubId: effectiveClubId,
    wingSlug,
    category,
    kicker: sanitizeString(req.body?.kicker, 120) || `${category.toUpperCase()} · ${wingSlug.replace('_', ' ').toUpperCase()}`,
    description,
    fullDetails: sanitizeString(req.body?.fullDetails, 4000) || description,
    bannerUrl:
      rawBannerUrl ||
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    date,
    time: sanitizeString(req.body?.time, 60) || '10:00 AM',
    venue,
    registrationDeadline: sanitizeString(req.body?.registrationDeadline, 30) || date,
    capacity: Number(req.body?.capacity) || 100,
    registeredCount: 0,
    chiefGuests: Array.isArray(req.body?.chiefGuests)
      ? req.body.chiefGuests
      : req.body?.chiefGuests
      ? [String(req.body.chiefGuests)]
      : [],
    tags: Array.isArray(req.body?.tags) ? req.body.tags : ['CUEC', 'Campus'],
    isFeatured: Boolean(req.body?.isFeatured),
    status: 'upcoming',
    registrations: []
  };

  const created = await dataService.createEvent(newEvent);
  res.status(201).json({ success: true, event: created });
}

export async function updateEvent(req, res) {
  const authUser = req.authUser;
  const existing = await dataService.getEventById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }
  if (!canManageClub(authUser, existing.clubId)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. You can only modify events belonging to your own club.'
    });
  }

  const safeBody = sanitizePlainObject(req.body);
  const updatedClubId =
    authUser.role === 'administrator' ? safeBody.clubId || existing.clubId : existing.clubId;
  const updatedWing = safeBody.wingSlug || existing.wingSlug;

  if (!ALLOWED_CLUB_WINGS[updatedClubId]?.includes(updatedWing)) {
    return res.status(400).json({
      success: false,
      message: `Wing '${updatedWing}' does not belong to ${updatedClubId}.`
    });
  }

  if (safeBody.bannerUrl !== undefined && safeBody.bannerUrl !== '' && !isValidImageUrl(String(safeBody.bannerUrl))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid event banner URL.'
    });
  }

  delete safeBody.id;
  const updated = await dataService.updateEvent(req.params.id, {
    ...safeBody,
    clubId: updatedClubId,
    wingSlug: updatedWing
  });

  res.json({ success: true, event: updated });
}

export async function deleteEvent(req, res) {
  const authUser = req.authUser;
  const evt = await dataService.getEventById(req.params.id);
  if (!evt) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }
  if (!canManageClub(authUser, evt.clubId)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. You can only delete events belonging to your own club.'
    });
  }

  await dataService.deleteEvent(req.params.id);
  res.json({ success: true, message: 'Event removed successfully.' });
}

export async function registerForEvent(req, res) {
  const evt = await dataService.getEventById(req.params.id);
  if (!evt) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  const userName = sanitizeString(req.body?.userName, 100);
  const studentId = sanitizeString(req.body?.studentId, 50);
  const email = sanitizeString(req.body?.email, 120);
  const userId = sanitizeString(req.body?.userId, 60);
  const department = sanitizeString(req.body?.department, 100) || 'General Studies';

  if (!userName || !studentId || !email) {
    return res.status(400).json({
      success: false,
      message: 'Student information is required for registration.'
    });
  }

  const registrations = Array.isArray(evt.registrations) ? [...evt.registrations] : [];
  const alreadyRegistered = registrations.some(
    (r) => r.studentId === studentId || r.email === email || (userId && r.userId === userId)
  );
  if (alreadyRegistered) {
    return res.status(400).json({
      success: false,
      message: 'Student is already registered for this event.'
    });
  }

  const registration = {
    id: `reg-${Date.now()}`,
    userId: userId || `guest-${Date.now()}`,
    userName,
    studentId,
    email,
    department,
    registeredAt: new Date().toISOString(),
    ticketCode: `CUEC-${evt.clubId.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
  };

  registrations.push(registration);
  const updated = await dataService.updateEvent(evt.id, {
    registrations,
    registeredCount: registrations.length
  });

  res.status(201).json({ success: true, registration, event: updated });
}
