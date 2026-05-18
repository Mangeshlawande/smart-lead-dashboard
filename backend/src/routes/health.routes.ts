import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { config } from '../config/env';

const router = Router();

const DB_STATES: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
};

// GET /health  — used by Render, Docker, and uptime monitors
router.get('/', (_req: Request, res: Response) => {
    const dbState = mongoose.connection.readyState;
    const healthy = dbState === 1;

    const payload = {
        status: healthy ? 'ok' : 'degraded',
        env: config.env,
        version: process.env.npm_package_version ?? '1.0.0',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        services: {
            database: {
                status: DB_STATES[dbState] ?? 'unknown',
                healthy,
            },
        },
    };

    // Return 200 even when degraded so Render doesn't restart immediately;
    // set 503 only when DB is completely unreachable (readyState 0).
    res.status(dbState === 0 ? 503 : 200).json(payload);
});

export default router;