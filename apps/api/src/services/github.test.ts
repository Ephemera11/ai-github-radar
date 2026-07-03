import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearAiProjectsCache, fetchAiProjects } from './github';
import type { GitHubRepo } from './normalize';

function repo(overrides: Partial<GitHubRepo> = {}): GitHubRepo {
  return {
    full_name: 'example/live-ai-app',
    name: 'live-ai-app',
    owner: { login: 'example' },
    html_url: 'https://github.com/example/live-ai-app',
    description: 'Live AI application project',
    language: 'TypeScript',
    license: { spdx_id: 'MIT' },
    topics: ['llm'],
    stargazers_count: 2500,
    forks_count: 120,
    created_at: '2025-01-01T00:00:00Z',
    pushed_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('fetchAiProjects', () => {
  beforeEach(() => {
    clearAiProjectsCache();
    vi.stubEnv('GITHUB_SEARCH_CACHE_TTL_MS', '0');
  });

  afterEach(() => {
    clearAiProjectsCache();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('uses live GitHub search results when the API succeeds', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ items: [repo()] }),
    }));

    const projects = await fetchAiProjects({ forceRefresh: true });

    expect(projects.map((project) => project.repoId)).toContain('example/live-ai-app');
    expect(projects.some((project) => project.repoId === 'bubble-io/bubble-templates')).toBe(false);
  });

  it('falls back to fixture data when GitHub search fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    const projects = await fetchAiProjects({ forceRefresh: true });

    expect(projects.length).toBeGreaterThan(0);
    expect(projects.some((project) => project.repoId === 'getomni-ai/omni')).toBe(false);
    expect(projects.some((project) => project.repoId === 'bubble-io/bubble-templates')).toBe(false);
  });
});
