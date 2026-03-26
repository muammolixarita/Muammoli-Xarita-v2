import { validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { categorizeAndAnalyzeProblem } from '../utils/aiService.js';
import { STATUS_PERMISSIONS } from '../middleware/auth.js';

// ─── Shared select objects ────────────────────────────────────────────────────
const problemSelect = {
  id: true, title: true, description: true, category: true,
  status: true, priority: true, latitude: true, longitude: true,
  address: true, image_url: true, ai_analysis: true,
  resolved_at: true, resolution_note: true,
  createdAt: true, updatedAt: true, user_id: true, organization_id: true,
  user:         { select: { id: true, name: true, avatar_url: true, district: true } },
  organization: { select: { id: true, name: true, name_uz: true, email: true, phone: true } },
  _count:       { select: { votes: true, comments: true } },
};

// ─── flatten Prisma row → flat object frontend expects ────────────────────────
function flat(p) {
  if (!p) return null;
  const { user, organization, _count, createdAt, updatedAt, ...rest } = p;
  return {
    ...rest,
    created_at:    createdAt,
    updated_at:    updatedAt,
    latitude:      rest.latitude  != null ? parseFloat(rest.latitude)  : null,
    longitude:     rest.longitude != null ? parseFloat(rest.longitude) : null,
    user_name:     user?.name        ?? null,
    user_avatar:   user?.avatar_url  ?? null,
    user_district: user?.district    ?? null,
    org_name:      organization?.name    ?? null,
    org_name_uz:   organization?.name_uz ?? null,
    org_email:     organization?.email   ?? null,
    org_phone:     organization?.phone   ?? null,
    vote_count:    _count?.votes    ?? 0,
    comment_count: _count?.comments ?? 0,
  };
}

// ─── GET /problems ────────────────────────────────────────────────────────────
export const getProblems = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, category, status, sort = 'newest' } = req.query;
    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (category) where.category = category;
    if (status)   where.status   = status;

    const orderBy =
      sort === 'votes'    ? [{ votes: { _count: 'desc' } }, { createdAt: 'desc' }] :
      sort === 'oldest'   ? { createdAt: 'asc' } :
      sort === 'priority' ? [{ priority: 'desc' }, { createdAt: 'desc' }] :
                            { createdAt: 'desc' };

    const [problems, total] = await prisma.$transaction([
      prisma.problem.findMany({ where, skip, take: parseInt(limit), orderBy, select: problemSelect }),
      prisma.problem.count({ where }),
    ]);

    res.json({ problems: problems.map(flat), total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// ─── GET /problems/stats ──────────────────────────────────────────────────────
export const getStats = async (req, res, next) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [total, byStatus, byCategory, recentWeek] = await prisma.$transaction([
      prisma.problem.count(),
      prisma.problem.groupBy({ by: ['status'],   _count: { _all: true } }),
      prisma.problem.groupBy({ by: ['category'], _count: { _all: true }, orderBy: { _count: { category: 'desc' } } }),
      prisma.problem.count({ where: { createdAt: { gte: weekAgo } } }),
    ]);
    res.json({
      total,
      byStatus:   byStatus.map(s  => ({ status: s.status,     count: s._count._all })),
      byCategory: byCategory.map(c => ({ category: c.category, count: c._count._all })),
      recentWeek,
    });
  } catch (err) { next(err); }
};

// ─── GET /problems/my/list — own problems ─────────────────────────────────────
export const getUserProblems = async (req, res, next) => {
  try {
    const problems = await prisma.problem.findMany({
      where:   { user_id: req.user.id },
      orderBy: { createdAt: 'desc' },
      select:  problemSelect,
    });
    res.json({ problems: problems.map(flat) });
  } catch (err) { next(err); }
};

// ─── GET /problems/:id ────────────────────────────────────────────────────────
export const getProblemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const problem = await prisma.problem.findUnique({
      where:  { id },
      select: {
        ...problemSelect,
        comments: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true, content: true, is_official: true, createdAt: true,
            user: { select: { id: true, name: true, avatar_url: true, role: true } },
          },
        },
      },
    });

    if (!problem) return res.status(404).json({ error: 'Muammo topilmadi' });

    let userVoted = false;
    if (req.user) {
      const vote = await prisma.vote.findUnique({
        where: { problem_id_user_id: { problem_id: id, user_id: req.user.id } },
      });
      userVoted = !!vote;
    }

    const comments = problem.comments.map(({ user, createdAt, ...c }) => ({
      ...c, created_at: createdAt, user_name: user.name, avatar_url: user.avatar_url, user_role: user.role,
    }));

    res.json({ problem: flat(problem), comments, userVoted });
  } catch (err) { next(err); }
};

// ─── POST /problems — USER only ───────────────────────────────────────────────
export const createProblem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, latitude, longitude, address } = req.body;
    // Lokal saqlash: fayl nomi dan URL yasash
    const image_url       = req.file ? `${process.env.BACKEND_URL || 'http://localhost:' + (process.env.PORT || 5000)}/uploads/${req.file.filename}` : null;
    const image_public_id = req.file?.filename ?? null;

    console.log('🤖 AI tahlil boshlandi...');
    const ai = await categorizeAndAnalyzeProblem(title, description, image_url);

    const org = await prisma.organization.findFirst({ where: { category: ai.category }, select: { id: true } });

    const problem = await prisma.problem.create({
      data: {
        title, description,
        category:        ai.category || 'other',
        priority:        ai.priority || 'medium',
        status:          'new',
        latitude:        parseFloat(latitude),
        longitude:       parseFloat(longitude),
        address:         address || null,
        image_url,
        image_public_id,
        ai_analysis:     ai,
        user_id:         req.user.id,
        organization_id: org?.id ?? null,
      },
      select: problemSelect,
    });

    await prisma.notification.create({
      data: {
        user_id:    req.user.id,
        problem_id: problem.id,
        message:    `Muammongiz qabul qilindi va "${ai.category}" toifasiga yo'naltirildi.`,
        type:       'problem_received',
      },
    }).catch(() => {});

    res.status(201).json({ message: 'Muammo muvaffaqiyatli yuborildi', problem: flat(problem) });
  } catch (err) { next(err); }
};

// ─── PATCH /problems/:id/status — ADMIN (any) | ORGANIZATION (limited + own) ──
export const updateProblemStatus = async (req, res, next) => {
  try {
    const { id }                      = req.params;
    const { status, resolution_note } = req.body;
    const { role, organization_id }   = req.user;

    // Validate status value
    const allStatuses = ['new', 'open', 'in_progress', 'resolved', 'rejected'];
    if (!allStatuses.includes(status)) {
      return res.status(400).json({ error: "Noto'g'ri status", allowed: allStatuses });
    }

    // Role-based status permission
    if (role !== 'admin') {
      const allowed = STATUS_PERMISSIONS[role] ?? [];
      if (!allowed.includes(status)) {
        return res.status(403).json({
          error: `${role} roli faqat ${allowed.length ? allowed.join(', ') : 'hech qanday'} statusini o'rnatishi mumkin`,
          code:  'FORBIDDEN_STATUS',
        });
      }
    }

    // Load problem
    const existing = await prisma.problem.findUnique({
      where:  { id },
      select: { id: true, user_id: true, organization_id: true, title: true },
    });
    if (!existing) return res.status(404).json({ error: 'Muammo topilmadi' });

    // ORGANIZATION can only update problems assigned to their org
    if (role === 'organization' && existing.organization_id !== organization_id) {
      return res.status(403).json({
        error: "Siz faqat o'zingizga biriktirilgan muammolarni yangilashingiz mumkin",
        code:  'NOT_ASSIGNED',
      });
    }

    const updated = await prisma.problem.update({
      where: { id },
      data: {
        status,
        resolution_note: resolution_note || null,
        resolved_at:     status === 'resolved' ? new Date() : null,
      },
      select: problemSelect,
    });

    await prisma.notification.create({
      data: {
        user_id:    existing.user_id,
        problem_id: id,
        message:    `"${existing.title}" muammosi holati "${status}" ga o'zgartirildi.`,
        type:       'status_change',
      },
    }).catch(() => {});

    res.json({ problem: flat(updated) });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Muammo topilmadi' });
    next(err);
  }
};

// ─── DELETE /problems/:id — ADMIN + MODERATOR ─────────────────────────────────
export const deleteProblem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const problem = await prisma.problem.findUnique({ where: { id }, select: { id: true } });
    if (!problem) return res.status(404).json({ error: 'Muammo topilmadi' });

    await prisma.problem.delete({ where: { id } });
    res.json({ message: "Muammo o'chirildi" });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Muammo topilmadi' });
    next(err);
  }
};

// ─── POST /problems/:id/vote ──────────────────────────────────────────────────
export const voteProblem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.vote.findUnique({
      where: { problem_id_user_id: { problem_id: id, user_id: req.user.id } },
    });

    if (existing) {
      await prisma.vote.delete({ where: { id: existing.id } });
    } else {
      await prisma.vote.create({ data: { problem_id: id, user_id: req.user.id } });
    }

    const voteCount = await prisma.vote.count({ where: { problem_id: id } });
    res.json({ voted: !existing, voteCount });
  } catch (err) { next(err); }
};

// ─── POST /problems/:id/comments ─────────────────────────────────────────────
export const addComment = async (req, res, next) => {
  try {
    const { id }      = req.params;
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Izoh matni kiritilishi shart' });

    const is_official = ['admin', 'organization', 'moderator'].includes(req.user.role);

    const comment = await prisma.comment.create({
      data:   { problem_id: id, user_id: req.user.id, content: content.trim(), is_official },
      select: {
        id: true, content: true, is_official: true, createdAt: true,
        user: { select: { id: true, name: true, avatar_url: true, role: true } },
      },
    });

    const problem = await prisma.problem.findUnique({ where: { id }, select: { user_id: true, title: true } });
    if (problem?.user_id !== req.user.id) {
      await prisma.notification.create({
        data: {
          user_id:    problem.user_id,
          problem_id: id,
          message:    `"${problem.title}" muammosiga yangi izoh qo'shildi.`,
          type:       'new_comment',
        },
      }).catch(() => {});
    }

    res.status(201).json({
      comment: {
        ...comment,
        created_at: comment.createdAt,
        user_name:  comment.user.name,
        avatar_url: comment.user.avatar_url,
        user_role:  comment.user.role,
      },
    });
  } catch (err) { next(err); }
};

// ─── GET /problems/admin/all — ADMIN full unfiltered list ─────────────────────
export const adminGetAllProblems = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category, userId } = req.query;
    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status)   where.status   = status;
    if (category) where.category = category;
    if (userId)   where.user_id  = userId;

    const [problems, total] = await prisma.$transaction([
      prisma.problem.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' }, select: problemSelect }),
      prisma.problem.count({ where }),
    ]);

    res.json({ problems: problems.map(flat), total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};
