import { dataService } from '../services/dataService.js';
import { sanitizeString } from '../utils/validators.js';

export async function getApplications(_req, res) {
  const applications = await dataService.getApplications();
  res.json({ success: true, applications });
}

export async function submitApplication(req, res) {
  const applicantName = sanitizeString(req.body?.applicantName, 100);
  const applicantEmail = sanitizeString(req.body?.applicantEmail, 120);
  const studentId = sanitizeString(req.body?.studentId, 50);
  const targetClub = sanitizeString(req.body?.targetClub, 40);
  const targetWing = sanitizeString(req.body?.targetWing, 40);
  const statementOfIntent = sanitizeString(req.body?.statementOfIntent, 3000);

  if (!applicantName || !applicantEmail || !studentId || !targetClub || !targetWing || !statementOfIntent) {
    return res.status(400).json({
      success: false,
      message: 'Please complete all required application fields.'
    });
  }

  const allApps = await dataService.getApplications();
  const existing = allApps.find((a) => a.studentId === studentId && a.status === 'pending');
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'You already have an active pending controller application under review.'
    });
  }

  const newApp = {
    id: `app-${Date.now()}`,
    applicantName,
    applicantEmail,
    studentId,
    department: sanitizeString(req.body?.department, 100) || 'Undergraduate',
    currentSemester: sanitizeString(req.body?.currentSemester, 40) || '5th Semester',
    cgpa: sanitizeString(req.body?.cgpa, 20) || '3.50',
    targetClub,
    targetWing,
    statementOfIntent,
    experience: sanitizeString(req.body?.experience, 2000) || 'Active university volunteer',
    portfolioLink: sanitizeString(req.body?.portfolioLink, 300) || undefined,
    status: 'pending',
    submittedAt: new Date().toISOString()
  };

  const created = await dataService.createApplication(newApp);
  res.status(201).json({ success: true, application: created });
}

export async function approveApplication(req, res) {
  const authUser = req.authUser;
  const appItem = await dataService.getApplicationById(req.params.id);
  if (!appItem) {
    return res.status(404).json({ success: false, message: 'Application not found.' });
  }

  const updatedApp = await dataService.updateApplication(appItem.id, {
    status: 'approved',
    reviewedAt: new Date().toISOString(),
    reviewedBy: authUser.name,
    adminNotes:
      sanitizeString(req.body?.adminNotes, 1000) ||
      'Application reviewed and approved for official Controller status.'
  });

  const existingUser = await dataService.findUserByEmailOrStudentId(
    appItem.applicantEmail,
    appItem.studentId
  );
  if (existingUser) {
    await dataService.updateUser(existingUser.id, {
      role: 'controller',
      clubAffiliation: appItem.targetClub,
      assignedWing: appItem.targetWing
    });
  } else {
    await dataService.createUser({
      id: `usr-ctrl-${Date.now()}`,
      name: appItem.applicantName,
      email: appItem.applicantEmail,
      role: 'controller',
      studentId: appItem.studentId,
      department: appItem.department,
      semester: appItem.currentSemester,
      clubAffiliation: appItem.targetClub,
      assignedWing: appItem.targetWing,
      joinedAt: new Date().toISOString().split('T')[0]
    });
  }

  res.json({
    success: true,
    application: updatedApp,
    message: 'Controller application approved successfully.'
  });
}

export async function rejectApplication(req, res) {
  const authUser = req.authUser;
  const appItem = await dataService.getApplicationById(req.params.id);
  if (!appItem) {
    return res.status(404).json({ success: false, message: 'Application not found.' });
  }

  const updatedApp = await dataService.updateApplication(appItem.id, {
    status: 'rejected',
    reviewedAt: new Date().toISOString(),
    reviewedBy: authUser.name,
    adminNotes:
      sanitizeString(req.body?.adminNotes, 1000) ||
      'Does not meet current trimester prerequisites. Encouraged to reapply next session.'
  });

  res.json({
    success: true,
    application: updatedApp,
    message: 'Application marked as rejected.'
  });
}

export async function deleteApplication(req, res) {
  await dataService.deleteApplication(req.params.id);
  res.json({ success: true, message: 'Application record removed.' });
}
