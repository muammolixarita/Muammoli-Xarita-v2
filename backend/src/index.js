import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

import authRoutes          from './routes/auth.js';
import problemsRoutes      from './routes/problems.js';
import organizationsRoutes from './routes/organizations.js';
import notificationsRoutes from './routes/notifications.js';
import adminRoutes         from './routes/admin.js';
import orgRoutes           from './routes/organization.js';

import { errorHandler, notFound } from './middleware/errorHandler.js';
import prisma from './lib/prisma.js';

dotenv.config();

// ─── Rate Limiters ────────────────────────────────────────────────────────────
// Login/Register: 1 daqiqada 10 urinish
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Juda ko'p urinish. 1 daqiqa kutib qayta urining." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Umumiy API: 1 daqiqada 100 so'rov
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: "Juda ko'p so'rov. Biroz kutib qayta urining." },
  standardHeaders: true,
  legacyHeaders: false,
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rasmlarni statik fayl sifatida serve qilish
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/auth',          authLimiter, authRoutes);  // Login/Register himoyasi
app.use('/api/problems',      apiLimiter,  problemsRoutes);
app.use('/api/organizations', apiLimiter,  organizationsRoutes);
app.use('/api/notifications', apiLimiter,  notificationsRoutes);
app.use('/api/admin',         apiLimiter,  adminRoutes);
app.use('/api/org',           apiLimiter,  orgRoutes);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`
  🗺️  Muammo Xarita API  —  RBAC enabled
  ────────────────────────────────────────
  🚀  http://localhost:${PORT}
  📋  Roles: user | admin | organization | moderator
  `);
});

const shutdown = async () => { await prisma.$disconnect(); server.close(() => process.exit(0)); };
process.on('SIGINT',  shutdown);
process.on('SIGTERM', shutdown);
