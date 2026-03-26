import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';

// Role + org encoded into token so frontend never needs an extra request
const generateToken = (user) =>
  jwt.sign(
    { userId: user.id, role: user.role, organization_id: user.organization_id ?? null },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const sanitize = ({ password_hash, createdAt, updatedAt, ...u }) => ({
  ...u,
  created_at: createdAt,
});

// ─── POST /auth/register ──────────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, phone, district } = req.body;

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(409).json({ error: 'Email allaqachon ro\'yxatdan o\'tgan' });

    const user = await prisma.user.create({
      data: {
        name,
        email:         email.toLowerCase(),
        password_hash: await bcrypt.hash(password, 12),
        role:          'user',
        phone:         phone    || null,
        district:      district || null,
      },
    });

    res.status(201).json({
      message: 'Ro\'yxatdan muvaffaqiyatli o\'tdingiz',
      token:   generateToken(user),
      user:    sanitize(user),
    });
  } catch (err) { next(err); }
};

// ─── POST /auth/login ─────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user || !user.is_active)
      return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri' });

    if (!await bcrypt.compare(password, user.password_hash))
      return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri' });

    res.json({
      message: 'Tizimga muvaffaqiyatli kirdingiz',
      token:   generateToken(user),
      user:    sanitize(user),
    });
  } catch (err) { next(err); }
};

// ─── GET /auth/profile ────────────────────────────────────────────────────────
export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.user.id },
      select: {
        id: true, name: true, email: true, role: true,
        avatar_url: true, phone: true, district: true,
        organization_id: true, createdAt: true,
        _count:       { select: { problems: true, votes: true, comments: true } },
        organization: { select: { id: true, name: true, name_uz: true, category: true } },
      },
    });
    res.json({ user: { ...user, created_at: user.createdAt } });
  } catch (err) { next(err); }
};

// ─── PUT /auth/profile ────────────────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, district } = req.body;
    const user = await prisma.user.update({
      where:  { id: req.user.id },
      data:   { name: name || undefined, phone: phone || null, district: district || null },
      select: { id: true, name: true, email: true, role: true, avatar_url: true, phone: true, district: true },
    });
    res.json({ user });
  } catch (err) { next(err); }
};

// ─── GET /auth/me — lightweight token info ────────────────────────────────────
export const getMe = async (req, res) => res.json({ user: req.user });
