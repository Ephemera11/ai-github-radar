import express from 'express';
import cors from 'cors';
import type { Pool } from 'mysql2/promise';
import { healthRouter } from './routes/health.js';
import { createProjectsRouter } from './routes/projects.js';
import { createResearchRouter } from './routes/research.js';
import { createExportRouter } from './routes/export.js';
import { createPool } from './db.js';

let poolPromise: Promise<Pool> | null = null;

async function getPool(): Promise<Pool> {
  if (!poolPromise) {
    poolPromise = createPool();
  }
  return poolPromise;
}

export async function createApp(pool?: Pool) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api', healthRouter);

  const database = pool ?? await getPool();
  app.use('/api', createProjectsRouter(database));
  app.use('/api', createResearchRouter(database));
  app.use('/api', createExportRouter());

  return app;
}
