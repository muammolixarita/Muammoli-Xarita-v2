import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require ORGANIZATION role
router.use(authenticate, authorize('organization'));

// ─── GET /api/org/problems — problems assigned to this org ────────────────────
router.get('/problems', async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = { organization_id: req.user.organization_id };
    if (status) where.status = status;

    const problems = await prisma.problem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, status: true, priority: true,
        category: true, address: true, createdAt: true,
        user: { select: { name: true, phone: true, district: true } },
        _count: { select: { votes: true, comments: true } },
      },
    });

    res.json({ problems: problems.map(p => ({
      ...p,
      created_at:   p.createdAt,
      user_name:    p.user?.name,
      vote_count:   p._count.votes,
      comment_count: p._count.comments,
    })) });
  } catch (err) { next(err); }
});

// ─── GET /api/org/profile ─────────────────────────────────────────────────────
router.get('/profile', async (req, res, next) => {
  try {
    if (!req.user.organization_id) {
      return res.status(404).json({ error: 'Tashkilot topilmadi' });
    }
    const org = await prisma.organization.findUnique({
      where:  { id: req.user.organization_id },
      select: {
        id: true, name: true, name_uz: true, category: true,
        email: true, phone: true, description: true,
        _count: { select: { problems: true } },
      },
    });
    res.json({ organization: org });
  } catch (err) { next(err); }
});

export default router;
