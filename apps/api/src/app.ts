import express from 'express';
import cors from 'cors';
import BetterSqlite3 from 'better-sqlite3';
import { healthRouter } from './routes/health.js';
import { createProjectsRouter } from './routes/projects.js';
import { createResearchRouter } from './routes/research.js';
import { createExportRouter } from './routes/export.js';
import { openDatabase } from './db.js';

export function createApp(db?: BetterSqlite3.Database) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api', healthRouter);

  const database = db ?? openDatabase();
  app.use('/api', createProjectsRouter(database));
  app.use('/api', createResearchRouter(database));
  app.use('/api', createExportRouter());

  return app;
}
