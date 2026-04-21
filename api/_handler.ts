import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import hiAnimeRoutes from '../src/routes/routes';
import config from '../src/config/config';
import { AppError } from '../src/utils/errors';
import { fail } from '../src/utils/response';

const app = new Hono();

// CORS Configuration
const origins = config.origin.includes(',')
  ? config.origin.split(',').map(o => o.trim())
  : config.origin === '*'
    ? '*'
    : [config.origin];

app.use(
  '*',
  cors({
    origin: origins,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposeHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 600,
    credentials: true,
  })
);

// Logging
if (!config.isProduction || config.enableLogging) {
  app.use('/api/v2/*', logger());
}

// Root route
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: 'HiAnime API Server',
    timestamp: new Date().toISOString(),
    environment: 'vercel',
  });
});

// Health Check
app.get('/ping', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: 'vercel',
  });
});

// Routes
app.route('/api/v2', hiAnimeRoutes);

// Error Handling
app.onError((err, c) => {
  if (err instanceof AppError) {
    return fail(c, err.message, err.statusCode, err.details);
  }

  console.error('[v0] Vercel Unexpected Error:', err instanceof Error ? err.message : String(err));
  console.error('[v0] Error Stack:', err instanceof Error ? err.stack : 'No stack trace');
  return fail(c, 'Internal server error', 500);
});

app.notFound((c) => {
  return fail(c, 'Route not found', 404);
});

// Wrap handler with safety check
let handler_export: any;
try {
  handler_export = handle(app);
} catch (initError) {
  console.error('[v0] Failed to initialize handler:', initError instanceof Error ? initError.message : String(initError));
  handler_export = (req: any, res: any) => {
    res.status(500).json({ error: 'Handler initialization failed' });
  };
}

export default handler_export;
