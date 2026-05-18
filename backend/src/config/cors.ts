
import { CorsOptions } from 'cors';
import { config } from './env';

// Allowed origins — driven entirely by env vars, never hardcoded
const ALLOWED_ORIGINS: string[] = [
  config.frontendUrl,
  // Support comma-separated EXTRA_ORIGINS for staging / preview URLs
  ...(process.env.EXTRA_ORIGINS ? process.env.EXTRA_ORIGINS.split(',').map((o) => o.trim()) : []),
].filter(Boolean);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server calls (Render health checks, cURL) that send no Origin
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    // In development also allow any localhost port
    if (config.isDev && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    callback(new Error(`CORS: origin '${origin}' is not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition'],   // needed for CSV download
  maxAge: 86400,                             // preflight cache 24 h
};