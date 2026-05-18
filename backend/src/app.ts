import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { config } from './config/env';
import { corsOptions } from './config/cors';
import authRoutes from './routes/auth.routes';
import leadRoutes from './routes/lead.routes';
import healthRoutes from './routes/health.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

export const createApp = (): Application => {
  const app = express();

  // ── Trust Render / Vercel / any reverse proxy so req.ip is correct ──
  app.set('trust proxy', 1);

  // ── Security headers ────────────────────────────────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow CSV downloads
      contentSecurityPolicy: config.isProd,                  // CSP only in prod
    })
  );
  app.use(mongoSanitize());

  // ── CORS — production-safe, env-driven ─────────────────────────────
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions)); // explicit preflight for all routes

  // ── Rate limiting ───────────────────────────────────────────────────
  app.use(
    '/api',
    rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
      // Use X-Forwarded-For via trust proxy setting above
      keyGenerator: (req) => req.ip ?? 'unknown',
      message: { success: false, message: 'Too many requests, please try again later.' },
      skip: (req) => req.path === '/health',
    })
  );

  // ── Body parsing & compression ──────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(compression());

  // ── Request logging ─────────────────────────────────────────────────
  if (config.isDev) {
    app.use(morgan('dev'));
  } else {
    app.use(
      morgan('combined', {
        stream: { write: (msg) => logger.info(msg.trim()) },
      })
    );
  }

  app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "Smart Leads Dashboard API",
    version: "1.0.0",
    status: "healthy"
  });
});

  // ── Routes ──────────────────────────────────────────────────────────
  app.use('/health', healthRoutes);          // Render health check
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/leads', leadRoutes);

  // ── Error handling ──────────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};