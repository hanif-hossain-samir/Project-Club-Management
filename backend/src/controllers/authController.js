import { dataService } from '../services/dataService.js';
import { sanitizeString, isValidEmail } from '../utils/validators.js';

export async function login(req, res) {
  const email = sanitizeString(req.body?.email, 120);
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }
  const user = await dataService.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User account not found. Try one of the pre-seeded accounts or register below.'
    });
  }
  res.json({ success: true, user });
}

export async function register(req, res) {
  const name = sanitizeString(req.body?.name, 100);
  const email = sanitizeString(req.body?.email, 120);
  const studentId = sanitizeString(req.body?.studentId, 50);
  const department = sanitizeString(req.body?.department, 100) || 'Undergraduate';
  const semester = sanitizeString(req.body?.semester, 40) || '1st Semester';
  const clubAffiliation = req.body?.clubAffiliation || undefined;
  const assignedWing = req.body?.assignedWing || undefined;

  if (!name || !email || !studentId) {
    return res.status(400).json({ success: false, message: 'Name, email, and Student ID are required.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  const existing = await dataService.findUserByEmailOrStudentId(email, studentId);
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'A student account with this email or ID already exists.'
    });
  }

  const newUser = {
    id: `usr-std-${Date.now()}`,
    name,
    email,
    role: 'user',
    studentId,
    department,
    semester,
    clubAffiliation,
    assignedWing,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=D40000`,
    joinedAt: new Date().toISOString().split('T')[0]
  };

  const created = await dataService.createUser(newUser);
  res.status(201).json({ success: true, user: created });
}
