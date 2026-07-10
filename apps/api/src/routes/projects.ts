import { Router, Request, Response } from 'express';
import type { Pool } from 'mysql2/promise';
import { fetchAiProjects } from '../services/github.js';
import { getHiddenRepoIds } from '../services/research-store.js';
import { saveProjects } from '../services/project-store.js';
import { type SortType } from '../services/rank.js';

export function createProjectsRouter(pool: Pool): Router {
  const router = Router();

  router.get('/projects', async (req: Request, res: Response) => {
    const hidden = await getHiddenRepoIds(pool);
    const hiddenSet = new Set(hidden);
    const sortType = req.query.sort as SortType ?? 'recommended';
    const items = (await fetchAiProjects({ sortType })).filter((p) => !hiddenSet.has(p.repoId));
    res.json({ items, updatedAt: new Date().toISOString() });
  });

  router.post('/projects/refresh', async (_req: Request, res: Response) => {
    await fetchAiProjects({ forceRefresh: true });
    res.status(202).json({ queued: true });
  });

  router.post('/projects/add', async (req: Request, res: Response) => {
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
    await saveProjects(pool, [project]);
    res.json({ added: true, project });
  });

  router.post('/projects/:owner/:repo/summarize', async (req: Request, res: Response) => {
    const { owner, repo } = req.params;
    const repoId = `${owner}/${repo}`;
    const projects = (await fetchAiProjects()).filter((p) => p.repoId === repoId);

    if (projects.length === 0) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const p = projects[0];
    const topicsStr = (p.topics ?? []).slice(0, 5).join('、');
    const summary = [
      `**${p.name}** 是一个基于 ${p.language || '多种技术'} 构建的开源项目，` +
      `在 GitHub 上获得了 ${p.stars.toLocaleString()} 颗星标。`,
      p.summary ? `\n\n该项目的主要功能是：${p.summary}` : '',
      topicsStr ? `\n\n涉及关键技术标签：${topicsStr}。` : '',
      p.recommendationReason ? `\n\n上榜理由：${p.recommendationReason}` : '',
    ].join('');

    res.json({ summary });
  });

  return router;
}
