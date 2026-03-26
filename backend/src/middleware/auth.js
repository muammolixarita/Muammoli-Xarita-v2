import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

// ─── Single source of truth ───────────────────────────────────────────────────
export const ROLES = {
  USER:         'user',
  ADMIN:        'admin',
  ORGANIZATION: 'organization',
  MODERATOR:    'moderator',
};

// Statuses each role may set (backend enforced)
export const STATUS_PERMISSIONS = {
  admin:        ['new', 'open', 'in_progress', 'resolved', 'rejected'],
  organization: ['in_progress', 'resolved'],
  moderator:    [],
  user:         [],
};

// ─── authenticate — verify JWT, attach req.user ───────────────────────────────
export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token taqdim etilmagan', code: 'NO_TOKEN' });
    }

    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);

    const user = await prisma.user.findFirst({
      where:  { id: decoded.userId, is_active: true },
      select: {
        id: true, name: true, email: true, role: true,
        organization_id: true, avatar_url: true, district: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Foydalanuvchi topilmadi yoki bloklangan', code: 'USER_NOT_FOUND' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ error: "Noto'g'ri token",       code: 'INVALID_TOKEN' });
    if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token muddati tugagan', code: 'TOKEN_EXPIRED' });
    next(err);
  }
};

// ─── optionalAuth — attaches user if token present, never blocks ──────────────
export const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return next();
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    const user = await prisma.user.findFirst({
      where:  { id: decoded.userId, is_active: true },
      select: {
        id: true, name: true, email: true, role: true,
        organization_id: true, avatar_url: true, district: true,
      },
    });
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
};

// ─── authorize(...roles) — role whitelist guard ───────────────────────────────
// Usage: authorize('admin', 'moderator')
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Tizimga kirish talab etiladi', code: 'UNAUTHENTICATED' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      error:    "Bu amalni bajarish uchun ruxsat yo'q",
      code:     'FORBIDDEN',
      required: roles,
      current:  req.user.role,
    });
  }
  next();
};

// backward-compat alias
export const requireRole = (...roles) => authorize(...roles);

// ─── isSelf — user can only touch their own resource (admin bypasses) ─────────
export const isSelf = (getResourceUserId) => async (req, res, next) => {
  try {
    const resourceUserId = await getResourceUserId(req);
    if (req.user.role !== ROLES.ADMIN && req.user.id !== resourceUserId) {
      return res.status(403).json({ error: 'Bu resursga kirish taqiqlangan', code: 'FORBIDDEN' });
    }
    next();
  } catch (err) { next(err); }
};
