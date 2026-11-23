import { dataService } from '../services/dataService.js';

export function canManageClub(user, targetClubId) {
  if (!user) return false;
  if (user.role === 'administrator') return true;
  if (user.role === 'controller' && user.clubAffiliation === targetClubId) return true;
  return false;
}

export async function attachAuthUser(req, _res, next) {
  const userIdHeader = req.headers['x-user-id'];
  const userId = typeof userIdHeader === 'string' ? userIdHeader.trim() : '';
  if (userId) {
    try {
      req.authUser = await dataService.findUserById(userId);
    } catch {
      req.authUser = undefined;
    }
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.authUser) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in.'
    });
  }
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.authUser) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in.'
      });
    }
    if (!roles.includes(req.authUser.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission for this action.'
      });
    }
    next();
  };
}
