import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { ensureMongoSeeded } from './services/dataService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

dotenv.config({ path: path.resolve(projectRoot, 'backend/.env') });
dotenv.config({ path: path.resolve(projectRoot, '.env') });

function resolvePort() {
  const portArgIndex = process.argv.indexOf('--port');
  const cliPort = portArgIndex !== -1 ? Number(process.argv[portArgIndex + 1]) : NaN;
  const envPort = Number(process.env.PORT);
  const defaultPort = Number(process.env.DEFAULT_APP_PORT);
  return !Number.isNaN(cliPort) && cliPort > 0
    ? cliPort
    : defaultPort || (envPort && envPort !== 8080 ? envPort : 3000);
}

async function startServer() {
  await connectDatabase();
  await ensureMongoSeeded();

  const app = createApp();
  const PORT = resolvePort();

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(projectRoot, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      root: projectRoot,
      configFile: path.resolve(projectRoot, 'vite.config.js'),
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CUEC] Portal server listening on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err) => {
    console.error('[CUEC] Server error:', err);
  });
}

startServer().catch((err) => {
  console.error('[CUEC] Error initializing server:', err);
  process.exit(1);
});
