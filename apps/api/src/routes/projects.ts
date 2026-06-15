import { Router, Request, Response } from 'express';
import BetterSqlite3 from 'better-sqlite3';
import { fetchAiProjects } from '../services/github.js';
import { getHiddenRepoIds } from '../services/research-store.js';
import { saveProjects } from '../services/project-store.js';

export function createProjectsRouter(db: BetterSqlite3.Database): Router {
  const router = Router();

  router.get('/projects', (_req: Request, res: Response) => {
    const hidden = getHiddenRepoIds(db);
    const hiddenSet = new Set(hidden);
    const items = fetchAiProjects().filter((p) => !hiddenSet.has(p.repoId));
    res.json({ items, updatedAt: new Date().toISOString() });
  });

  router.post('/projects/refresh', (_req: Request, res: Response) => {
    fetchAiProjects();
    res.status(202).json({ queued: true });
  });

  router.post('/projects/add', (req: Request, res: Response) => {
    const { repoId, name, owner, url, summary, language, license, topics, stars, forks } = req.body;
    if (!repoId || !name || !url) {
      res.status(400).json({ error: 'repoId, name, and url are required' });
      return;
    }
    const project = {
      repoId,
      name,
      owner: owner || '',
      url,
      summary: summary || '',
      language: language || '',
      license: license || '',
      topics: topics || [],
      stars: stars || 0,
      forks: forks || 0,
      pushedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      last30dStars: 0,
      starGrowthRate: 0,
      activityScore: 0,
      recommendationScore: 0,
      recommendationReason: '手动收藏的项目',
    };
    saveProjects(db, [project]);
    res.json({ added: true, project });
  });

  return router;
}
