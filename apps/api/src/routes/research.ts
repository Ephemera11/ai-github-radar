import { Router, Request, Response } from 'express';
import BetterSqlite3 from 'better-sqlite3';
import { upsertNote, upsertTags, markHidden, toggleFavorite, getFavoriteRepoIds } from '../services/research-store.js';
import { fetchAiProjects } from '../services/github.js';

export function createResearchRouter(db: BetterSqlite3.Database): Router {
  const router = Router();

  router.post('/research/:owner/:repo/note', (req: Request, res: Response) => {
    const repoId = `${req.params.owner}/${req.params.repo}`;
    const { note } = req.body;
    upsertNote(db, repoId, note, [], false, false);
    res.json({ saved: true, repoId, note });
  });

  router.post('/research/:owner/:repo/tags', (req: Request, res: Response) => {
    const repoId = `${req.params.owner}/${req.params.repo}`;
    const { tags } = req.body;
    upsertTags(db, repoId, tags);
    res.json({ saved: true, repoId, tags });
  });

  router.post('/research/:owner/:repo/hide', (req: Request, res: Response) => {
    const repoId = `${req.params.owner}/${req.params.repo}`;
    markHidden(db, repoId, true);
    res.json({ hidden: true, repoId });
  });

  router.post('/research/:owner/:repo/favorite', (req: Request, res: Response) => {
    const repoId = `${req.params.owner}/${req.params.repo}`;
    const { favorite } = req.body;
    toggleFavorite(db, repoId, favorite);
    res.json({ favorite: !!favorite, repoId });
  });

  router.get('/favorites', (_req: Request, res: Response) => {
    const favorited = getFavoriteRepoIds(db);
    const allProjects = fetchAiProjects();
    const items = allProjects.filter((p) => favorited.includes(p.repoId));
    res.json({ items, updatedAt: new Date().toISOString() });
  });

  return router;
}
