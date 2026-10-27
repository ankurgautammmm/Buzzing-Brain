import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { apiRouter } from './api';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function startServer() {
  const app = express();
  const port = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json({ limit: '15mb' }));

  // Cloud Run Health check probes (both /health and /api/health)
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'buzzing-brain', timestamp: new Date().toISOString() });
  });

  // REST API endpoints
  app.use('/api', apiRouter);

  // Locate the built frontend dist/ directory
  const candidatePaths = [
    path.resolve(__dirname, 'index.html'),
    path.resolve(__dirname, 'dist', 'index.html'),
    path.resolve(__dirname, '../dist', 'index.html'),
    path.resolve(process.cwd(), 'dist', 'index.html'),
  ];

  let resolvedDistPath = '';
  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      resolvedDistPath = path.dirname(candidate);
      break;
    }
  }

  const isProduction = process.env.NODE_ENV === 'production' || Boolean(resolvedDistPath && !process.env.VITE_DEV_MODE);

  if (resolvedDistPath && (isProduction || !process.env.VITE_DEV_MODE)) {
    console.log(`[Buzzing Brain] Serving static production build from ${resolvedDistPath}`);
    app.use(express.static(resolvedDistPath, { maxAge: '1h', index: 'index.html' }));

    // SPA fallback: serve index.html for all non-API GET requests
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      res.sendFile(path.join(resolvedDistPath, 'index.html'));
    });
  } else {
    console.log('[Buzzing Brain] Starting Vite in middleware mode for development...');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`[Buzzing Brain] Server successfully listening on http://0.0.0.0:${port} (bound to 0.0.0.0)`);
  });

  server.on('error', (err: any) => {
    console.error(`[Buzzing Brain] Server error on port ${port}:`, err);
    process.exit(1);
  });

  // Graceful shutdown handling for Cloud Run container lifecycle
  process.on('SIGTERM', () => {
    console.log('[Buzzing Brain] SIGTERM received. Gracefully shutting down HTTP server...');
    server.close(() => {
      console.log('[Buzzing Brain] HTTP server closed cleanly.');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('[Buzzing Brain] SIGINT received. Shutting down...');
    server.close(() => {
      process.exit(0);
    });
  });

  return server;
}

// Automatically start server when executed as main entry
startServer().catch((err) => {
  console.error('[Buzzing Brain] Failed to start server:', err);
  process.exit(1);
});
