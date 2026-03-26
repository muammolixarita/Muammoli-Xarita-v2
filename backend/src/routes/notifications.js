import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/notifications — foydalanuvchi bildirishnomalari
router.get('/', authenticate, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where:   { user_id: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: {
        id: true, message: true, is_read: true, type: true, createdAt: true,
        problem: { select: { id: true, title: true } },
      },
    });
    const unreadCount = await prisma.notification.count({
      where: { user_id: req.user.id, is_read: false },
    });
    res.json({ notifications, unreadCount });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/notifications/read-all — hammasini o'qilgan deb belgilash
router.patch('/read-all', authenticate, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { user_id: req.user.id, is_read: false },
      data:  { is_read: true },
    });
    res.json({ message: 'Barcha bildirishnomalar o\'qildi' });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/notifications/:id/read — bitta o'qilgan
router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, user_id: req.user.id },
      data:  { is_read: true },
    });
    res.json({ message: 'O\'qildi' });
  } catch (error) {
    next(error);
  }
});

export default router;
