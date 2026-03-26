import prisma from '../lib/prisma.js';

export const getOrganizations = async (req, res, next) => {
  try {
    const organizations = await prisma.organization.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true, name: true, name_uz: true, category: true,
        email: true, phone: true, description: true,
        _count: { select: { problems: true } },
      },
    });

    // Add breakdown counts per status
    const withStats = await Promise.all(
      organizations.map(async (org) => {
        const [open, solved] = await prisma.$transaction([
          prisma.problem.count({ where: { organization_id: org.id, status: 'open' } }),
          prisma.problem.count({ where: { organization_id: org.id, status: 'solved' } }),
        ]);
        return {
          ...org,
          total_problems: org._count.problems,
          open_problems:  open,
          solved_problems: solved,
        };
      })
    );

    res.json({ organizations: withStats });
  } catch (error) {
    next(error);
  }
};

export const getOrganizationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) return res.status(404).json({ error: 'Tashkilot topilmadi' });

    const problems = await prisma.problem.findMany({
      where:   { organization_id: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true, title: true, status: true, category: true, priority: true, createdAt: true,
        user: { select: { name: true } },
        _count: { select: { votes: true } },
      },
    });

    res.json({
      organization: org,
      problems: problems.map(p => ({
        ...p,
        user_name:  p.user.name,
        vote_count: p._count.votes,
      })),
    });
  } catch (error) {
    next(error);
  }
};
