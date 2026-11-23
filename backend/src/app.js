import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { attachAuthUser } from './middleware/authMiddleware.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';
import { dataService } from './services/dataService.js';
import { isMongoConnected } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import clubRoutes from './routes/clubRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import memberRequestRoutes from './routes/memberRequestRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Same-origin / local preview CORS policy without wildcard origin exposure
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      try {
        const parsedOrigin = new URL(origin);
        const reqHost = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(':')[0];
        if (
          parsedOrigin.hostname === 'localhost' ||
          parsedOrigin.hostname === '127.0.0.1' ||
          (reqHost && parsedOrigin.hostname === reqHost)
        ) {
          res.setHeader('Access-Control-Allow-Origin', origin);
          res.setHeader('Vary', 'Origin');
        }
      } catch {
        // Ignore malformed Origin headers
      }
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Static uploads directory
  const uploadsDir = path.resolve(__dirname, '../../backend/uploads');
  app.use('/uploads', express.static(uploadsDir));

  // Attach authenticated user context when x-user-id header is present
  app.use(attachAuthUser);

  // Health & stats
  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      app: 'City University Events & Clubs (CUEC)',
      status: 'healthy',
      version: '2.0.0',
      database: isMongoConnected() ? 'mongodb' : 'in-memory-fallback',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/stats', async (_req, res, next) => {
    try {
      const stats = await dataService.getStats();
      res.json({ success: true, stats });
    } catch (err) {
      next(err);
    }
  });

  // Resource routes
  app.use('/api/auth', authRoutes);
  app.use('/api/clubs', clubRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/announcements', announcementRoutes);
  app.use('/api/gallery', galleryRoutes);
  app.use('/api/member-requests', memberRequestRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api', userRoutes);

  // 404 for unknown API endpoints + unified error handler
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
