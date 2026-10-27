import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In production, execute the pre-bundled server bundle in dist/server.mjs
const prodBundlePath = path.resolve(__dirname, 'dist', 'server.mjs');

if (fs.existsSync(prodBundlePath) && (process.env.NODE_ENV === 'production' || !process.env.VITE_DEV_MODE)) {
  await import(`file://${prodBundlePath}`);
} else {
  // In development, load server/app.ts directly
  await import('./server/app.ts');
}
