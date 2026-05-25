import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import assignmentsRouter from './routes/assignments';
import authRouter from './routes/auth';
import groupsRouter from './routes/groups';
import notificationsRouter from './routes/notifications';
import toolkitRouter from './routes/toolkit';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use('/api/auth', authRouter);
  app.use('/api/assignments', assignmentsRouter);
  app.use('/api/groups', groupsRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/toolkit', toolkitRouter);

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[error]', err);
    if (res.headersSent) return;
    res.status(500).json({ error: err.message || 'Internal server error' });
  });

  return app;
}
