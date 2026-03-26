import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes under /api/admin require ADMIN role
router.use(authenticate, authorize('admin'));

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (role)   where.role = role;
    if (search) where.OR = [
      { name:  { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, email: true, role: true,
          is_active: true, district: true, phone: true, createdAt: true,
          organization: { select: { id: true, name: true } },
          _count: { select: { problems: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// ─── PATCH /api/admin/users/:id/role ─────────────────────────────────────────
router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role, organization_id } = req.body;
    const allowed = ['user', 'admin', 'organization', 'moderator'];
    if (!allowed.includes(role)) return res.status(400).json({ error: "Noto'g'ri rol" });

    const user = await prisma.user.update({
      where:  { id: req.params.id },
      data:   { role, organization_id: organization_id || null },
      select: { id: true, name: true, email: true, role: true, organization_id: true },
    });
    res.json({ user });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    next(err);
  }
});

// ─── PATCH /api/admin/users/:id/toggle-active ────────────────────────────────
router.patch('/users/:id/toggle-active', async (req, res, next) => {
  try {
    const current = await prisma.user.findUnique({ where: { id: req.params.id }, select: { is_active: true } });
    if (!current) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });

    const user = await prisma.user.update({
      where:  { id: req.params.id },
      data:   { is_active: !current.is_active },
      select: { id: true, name: true, is_active: true },
    });
    res.json({ user });
  } catch (err) { next(err); }
});

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
router.get('/stats', async (req, res, next) => {
  try {
    const [totalUsers, totalProblems, byRole, byStatus] = await prisma.$transaction([
      prisma.user.count(),
      prisma.problem.count(),
      prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
      prisma.problem.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);
    res.json({
      totalUsers,
      totalProblems,
      byRole:   byRole.map(r   => ({ role: r.role,     count: r._count._all })),
      byStatus: byStatus.map(s => ({ status: s.status, count: s._count._all })),
    });
  } catch (err) { next(err); }
});

export default router;
