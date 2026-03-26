import express from 'express';
import { body } from 'express-validator';
import {
  getProblems, getProblemById, createProblem,
  updateProblemStatus, deleteProblem,
  voteProblem, addComment,
  getUserProblems, getStats,
  adminGetAllProblems,
} from '../controllers/problemsController.js';
import { authenticate, optionalAuth, authorize } from '../middleware/auth.js';
import { upload } from '../config/upload.js';

const router = express.Router();

// ─── Public / optional auth ───────────────────────────────────────────────────
router.get('/',      optionalAuth, getProblems);
router.get('/stats', optionalAuth, getStats);

// ─── Must come before /:id wildcard ───────────────────────────────────────────
router.get('/my/list',   authenticate, getUserProblems);
router.get('/admin/all', authenticate, authorize('admin'), adminGetAllProblems);

router.get('/:id', optionalAuth, getProblemById);

// ─── POST /problems — USER only ───────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  authorize('user'),
  upload.single('image'),
  [
    body('title').trim().isLength({ min: 5, max: 500 }).withMessage("Sarlavha 5-500 belgi bo'lishi kerak"),
    body('description').trim().isLength({ min: 10 }).withMessage("Tavsif kamida 10 belgi bo'lishi kerak"),
    body('latitude').isFloat({ min: -90,  max: 90  }).withMessage("Noto'g'ri kenglik"),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage("Noto'g'ri uzunlik"),
  ],
  createProblem
);

// ─── PATCH /problems/:id/status — ADMIN (any status) | ORGANIZATION (own, limited) ──
router.patch('/:id/status', authenticate, authorize('admin', 'organization'), updateProblemStatus);

// ─── DELETE /problems/:id — ADMIN | MODERATOR ────────────────────────────────
router.delete('/:id', authenticate, authorize('admin', 'moderator'), deleteProblem);

// ─── Interactions — any authenticated user ────────────────────────────────────
router.post('/:id/vote',     authenticate, voteProblem);
router.post('/:id/comments', authenticate, addComment);

export default router;
