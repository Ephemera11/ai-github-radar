import { describe, expect, it, vi } from 'vitest';
import { getProjects } from './api';

describe('web api client', () => {
  it('filters unavailable repositories returned by a stale API deployment', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        updatedAt: '2026-07-03T00:00:00.000Z',
        items: [
          {
            repoId: 'getomni-ai/omni',
            name: 'omni',
            owner: 'getomni-ai',
            url: 'https://github.com/getomni-ai/omni',
            summary: '',
            language: '',
            license: '',
            topics: [],
            stars: 1,
            forks: 0,
            pushedAt: '2024-01-01T00:00:00.000Z',
            createdAt: '2024-01-01T00:00:00.000Z',
            last30dStars: 0,
            starGrowthRate: 0,
            activityScore: 0,
            recommendationScore: 0,
            recommendationReason: '',
          },
          {
            repoId: 'langgenius/dify',
            name: 'dify',
            owner: 'langgenius',
            url: 'https://github.com/langgenius/dify',
            summary: '',
            language: 'TypeScript',
            license: '',
            topics: [],
            stars: 1,
            forks: 0,
            pushedAt: '2024-01-01T00:00:00.000Z',
            createdAt: '2024-01-01T00:00:00.000Z',
            last30dStars: 0,
            starGrowthRate: 0,
            activityScore: 0,
            recommendationScore: 0,
            recommendationReason: '',
          },
        ],
      }),
    }));

    const result = await getProjects();

    expect(result.items.map((item) => item.repoId)).toEqual(['langgenius/dify']);
  });
});
