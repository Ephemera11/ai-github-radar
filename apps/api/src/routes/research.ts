import { Router, Request, Response } from 'express';
import type { Pool } from 'mysql2/promise';
import { upsertNote, upsertTags, markHidden, toggleFavorite, getFavoriteRepoIds } from '../services/research-store.js';
import { fetchAiProjects } from '../services/github.js';

export function createResearchRouter(pool: Pool): Router {
  const router = Router();

  router.post('/research/:owner/:repo/note', async (req: Request, res: Response) => {
    const repoId = `${req.params.owner}/${req.params.repo}`;
    const { note } = req.body;
    await upsertNote(pool, repoId, note, [], false, false);
    res.json({ saved: true, repoId, note });
  });

  router.post('/research/:owner/:repo/tags', async (req: Request, res: Response) => {
    const repoId = `${req.params.owner}/${req.params.repo}`;
    const { tags } = req.body;
    await upsertTags(pool, repoId, tags);
    res.json({ saved: true, repoId, tags });
  });

  router.post('/research/:owner/:repo/hide', async (req: Request, res: Response) => {
    const repoId = `${req.params.owner}/${req.params.repo}`;
    await markHidden(pool, repoId, true);
    res.json({ hidden: true, repoId });
  });

  router.post('/research/:owner/:repo/favorite', async (req: Request, res: Response) => {
    const repoId = `${req.params.owner}/${req.params.repo}`;
    const { favorite } = req.body;
    await toggleFavorite(pool, repoId, favorite);
    res.json({ favorite: !!favorite, repoId });
  });

  router.get('/favorites', async (_req: Request, res: Response) => {
    const favorited = await getFavoriteRepoIds(pool);
    const allProjects = await fetchAiProjects();
    const items = allProjects.filter((p) => favorited.includes(p.repoId));
    res.json({ items, updatedAt: new Date().toISOString() });
  });

  return router;
}
