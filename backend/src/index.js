import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes          from './routes/auth.js';
import problemsRoutes      from './routes/problems.js';
import organizationsRoutes from './routes/organizations.js';
import notificationsRoutes from './routes/notifications.js';
import adminRoutes         from './routes/admin.js';
import orgRoutes           from './routes/organization.js';

import { errorHandler, notFound } from './middleware/errorHandler.js';
import prisma from './lib/prisma.js';

dotenv.config();

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
app.use('/api/auth',          authRoutes);
app.use('/api/problems',      problemsRoutes);
app.use('/api/organizations', organizationsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin',         adminRoutes);    // ADMIN only
app.use('/api/org',           orgRoutes);      // ORGANIZATION only

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
