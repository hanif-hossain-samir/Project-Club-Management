import { dataService } from '../services/dataService.js';
import { canManageClub } from '../middleware/authMiddleware.js';
import { ALLOWED_CLUB_WINGS, sanitizeString } from '../utils/validators.js';

export async function getMemberRequests(req, res) {
  const authUser = req.authUser;
  let result = await dataService.getMemberRequests();

  if (authUser.role === 'controller') {
    result = result.filter((r) => r.clubId === authUser.clubAffiliation);
  } else if (authUser.role === 'user') {
    result = result.filter((r) => r.userId === authUser.id || r.studentId === authUser.studentId);
  }

  res.json({ success: true, requests: result });
}

export async function createMemberRequest(req, res) {
  const authUser = req.authUser;
  const clubId = sanitizeString(req.body?.clubId, 40);
  const wingSlug = sanitizeString(req.body?.wingSlug, 40);
  const reason = sanitizeString(req.body?.reason, 2000);

  if (!clubId || !wingSlug || !reason) {
    return res.status(400).json({
      success: false,
      message: 'Club, wing choice, and statement of interest are required.'
    });
  }

  if (!ALLOWED_CLUB_WINGS[clubId]?.includes(wingSlug)) {
    return res.status(400).json({
      success: false,
      message: `Wing '${wingSlug}' does not belong to the selected club.`
    });
  }

  const allRequests = await dataService.getMemberRequests();
  const hasPending = allRequests.some(
    (r) =>
      (r.userId === authUser.id || r.studentId === authUser.studentId) &&
      r.clubId === clubId &&
      r.status === 'pending'
  );
  if (hasPending) {
    return res.status(400).json({
      success: false,
      message: 'You already have an active pending membership request for this club under review.'
    });
  }

  const newRequest = {
    id: `mreq-${Date.now()}`,
    userId: authUser.id,
    name: authUser.name,
    studentId: authUser.studentId,
    email: authUser.email,
    department: authUser.department || 'General',
    clubId,
    wingSlug,
    reason,
    status: 'pending',
    submittedAt: new Date().toISOString()
  };

  const created = await dataService.createMemberRequest(newRequest);
  res.status(201).json({ success: true, request: created });
}

export async function approveMemberRequest(req, res) {
  const authUser = req.authUser;
  const request = await dataService.getMemberRequestById(req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, message: 'Member request not found.' });
  }
  if (!canManageClub(authUser, request.clubId)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. You can only approve member requests for your own club.'
    });
  }
  if (request.status === 'approved') {
    return res.status(400).json({ success: false, message: 'Member request is already approved.' });
  }

  const updatedRequest = await dataService.updateMemberRequest(request.id, {
    status: 'approved',
    reviewedAt: new Date().toISOString(),
    reviewedBy: `${authUser.name} (${authUser.role === 'administrator' ? 'Administrator' : 'Controller'})`
  });

  const users = await dataService.getUsers();
  const targetUser = users.find((u) => u.id === request.userId || u.studentId === request.studentId);
  if (targetUser) {
    await dataService.updateUser(targetUser.id, {
      clubAffiliation: request.clubId,
      assignedWing: request.wingSlug
    });
  }

  await dataService.incrementClubMembers(request.clubId, 1);

  res.json({
    success: true,
    request: updatedRequest,
    message: 'Member request approved and student joined the wing.'
  });
}

export async function rejectMemberRequest(req, res) {
  const authUser = req.authUser;
  const request = await dataService.getMemberRequestById(req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, message: 'Member request not found.' });
  }
  if (!canManageClub(authUser, request.clubId)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. You can only reject member requests for your own club.'
    });
  }

  const updatedRequest = await dataService.updateMemberRequest(request.id, {
    status: 'rejected',
    reviewedAt: new Date().toISOString(),
    reviewedBy: `${authUser.name} (${authUser.role === 'administrator' ? 'Administrator' : 'Controller'})`
  });

  res.json({
    success: true,
    request: updatedRequest,
    message: 'Member request marked as rejected.'
  });
}
