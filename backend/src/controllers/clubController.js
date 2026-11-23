import { dataService } from '../services/dataService.js';
import { sanitizePlainObject } from '../utils/validators.js';

export async function getClubs(_req, res) {
  const clubs = await dataService.getClubs();
  res.json({ success: true, clubs });
}

export async function getClubById(req, res) {
  const club = await dataService.getClubById(req.params.id);
  if (!club) {
    return res.status(404).json({ success: false, message: 'Club not found' });
  }
  res.json({ success: true, club });
}

export async function updateClub(req, res) {
  const existing = await dataService.getClubById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Club not found' });
  }
  const safeBody = sanitizePlainObject(req.body);
  delete safeBody.id;
  const club = await dataService.updateClub(req.params.id, safeBody);
  res.json({ success: true, club });
}
