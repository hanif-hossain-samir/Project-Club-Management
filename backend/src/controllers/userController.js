import { dataService } from '../services/dataService.js';
import { canManageClub } from '../middleware/authMiddleware.js';
import { sanitizeString, sanitizePlainObject, isValidEmail } from '../utils/validators.js';

export async function getUsers(_req, res) {
  const users = await dataService.getUsers();
  res.json({ success: true, users });
}

export async function createUser(req, res) {
  const name = sanitizeString(req.body?.name, 100);
  const email = sanitizeString(req.body?.email, 120);
  const studentId = sanitizeString(req.body?.studentId, 50);
  const department = sanitizeString(req.body?.department, 100) || 'Undergraduate';
  const semester = sanitizeString(req.body?.semester, 40) || '1st Semester';
  const role = ['user', 'controller', 'administrator'].includes(req.body?.role) ? req.body.role : 'user';
  const clubAffiliation = req.body?.clubAffiliation || 'computer_club';
  const assignedWing = req.body?.assignedWing || undefined;
  const phone = sanitizeString(req.body?.phone, 40) || undefined;

  if (!name || !email || !studentId) {
    return res.status(400).json({ success: false, message: 'Name, email, and Student ID are required.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  const existing = await dataService.findUserByEmailOrStudentId(email, studentId);
  if (existing) {
    return res.status(400).json({ success: false, message: 'A user with this email or ID already exists.' });
  }

  const newUser = {
    id: `usr-${role}-${Date.now()}`,
    name,
    email,
    role,
    studentId,
    department,
    semester,
    clubAffiliation,
    assignedWing,
    phone,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=D40000`,
    joinedAt: new Date().toISOString().split('T')[0]
  };

  const created = await dataService.createUser(newUser);
  res.status(201).json({ success: true, user: created });
}

export async function updateUser(req, res) {
  const existing = await dataService.findUserById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }
  const safeBody = sanitizePlainObject(req.body);
  delete safeBody.id;
  const updated = await dataService.updateUser(req.params.id, safeBody);
  res.json({ success: true, user: updated });
}

export async function deleteUser(req, res) {
  const targetUser = await dataService.findUserById(req.params.id);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }
  await dataService.deleteUser(req.params.id);
  res.json({ success: true, message: `User "${targetUser.name}" successfully removed.` });
}

export async function getMembers(req, res) {
  const authUser = req.authUser;
  const users = await dataService.getUsers();
  let members = users.filter((u) => u.role === 'user');

  if (authUser.role === 'controller') {
    members = members.filter((u) => u.clubAffiliation === authUser.clubAffiliation);
  } else {
    const clubId = typeof req.query.clubId === 'string' ? req.query.clubId : '';
    if (clubId && clubId !== 'all') {
      members = members.filter((u) => u.clubAffiliation === clubId);
    }
  }
  res.json({ success: true, members });
}

export async function removeMember(req, res) {
  const authUser = req.authUser;
  const targetUser = await dataService.findUserById(req.params.userId);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: 'Member not found.' });
  }
  if (targetUser.role !== 'user') {
    return res.status(403).json({
      success: false,
      message: 'Only regular student members can be removed here. Controllers and administrators cannot be removed via member management.'
    });
  }
  if (targetUser.clubAffiliation && !canManageClub(authUser, targetUser.clubAffiliation)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. You can only remove members from your own club.'
    });
  }

  const oldClubId = targetUser.clubAffiliation;
  const updated = await dataService.updateUser(targetUser.id, {
    clubAffiliation: null,
    assignedWing: null
  });
  if (oldClubId) {
    await dataService.incrementClubMembers(oldClubId, -1);
  }

  res.json({
    success: true,
    user: updated,
    message: 'Student removed from club membership successfully.'
  });
}
