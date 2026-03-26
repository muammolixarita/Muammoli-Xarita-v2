import express from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, updateProfile, getMe } from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/register',
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage("Ism 2-100 belgi bo'lishi kerak"),
    body('email').isEmail().normalizeEmail().withMessage("Noto'g'ri email"),
    body('password').isLength({ min: 6 }).withMessage("Parol kamida 6 belgi bo'lishi kerak"),
  ],
  register
);

router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage("Noto'g'ri email"),
    body('password').notEmpty().withMessage("Parol kiritilishi shart"),
  ],
  login
);

router.get('/me',      authenticate, getMe);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;
