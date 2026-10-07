import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes/api.js';

dotenv.config();

const __dirname = process.cwd();

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Mount API router
  app.use('/api/v1', apiRouter);

  if (!isProduction) {
    // Mount Vite dev server middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[NSight Engine] Server listening at http://0.0.0.0:${port}`);
    console.log(`[NSight Engine] Groq Multi-Key Pool Ready`);
  });
}

startServer().catch((err) => {
  console.error('[NSight Engine] Fatal server startup error:', err);
  process.exit(1);
});
