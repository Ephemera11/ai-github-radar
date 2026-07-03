import { describe, expect, it } from 'vitest';
import type { GitHubRepo } from './normalize.js';
import {
  filterEligibleRecommendationRepos,
  isEligibleRecommendationRepo,
  isKnownUnavailableRepo,
  isSupportedGitHubRepoUrl,
} from './repository-quality.js';

function repo(overrides: Partial<GitHubRepo>): GitHubRepo {
  return {
    full_name: 'langgenius/dify',
    name: 'dify',
    owner: { login: 'langgenius' },
    html_url: 'https://github.com/langgenius/dify',
    description: 'AI app platform',
    language: 'TypeScript',
    license: { spdx_id: 'Apache-2.0' },
    topics: ['ai'],
    stargazers_count: 100,
    forks_count: 10,
    created_at: '2023-01-01T00:00:00Z',
    pushed_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('repository quality filter', () => {
  it('allows standard GitHub repository URLs', () => {
    expect(isSupportedGitHubRepoUrl('https://github.com/langgenius/dify')).toBe(true);
  });

  it('rejects non-repository GitHub URLs', () => {
    expect(isSupportedGitHubRepoUrl('https://github.com/langgenius/dify/issues')).toBe(false);
    expect(isSupportedGitHubRepoUrl('https://example.com/langgenius/dify')).toBe(false);
  });

  it('marks known unavailable repositories', () => {
    expect(isKnownUnavailableRepo({ full_name: 'getomni-ai/omni' })).toBe(true);
  });

  it('rejects stale repositories before ranking', () => {
    expect(isEligibleRecommendationRepo(repo({
      full_name: 'getomni-ai/omni',
      name: 'omni',
      owner: { login: 'getomni-ai' },
      html_url: 'https://github.com/getomni-ai/omni',
    }))).toBe(false);
  });

  it('rejects mismatched full_name and URL pairs', () => {
    expect(isEligibleRecommendationRepo(repo({
      full_name: 'langgenius/dify',
      html_url: 'https://github.com/other-owner/dify',
    }))).toBe(false);
  });

  it('filters only eligible repositories', () => {
    const repos = filterEligibleRecommendationRepos([
      repo({ full_name: 'langgenius/dify' }),
      repo({
        full_name: 'getomni-ai/omni',
        name: 'omni',
        owner: { login: 'getomni-ai' },
        html_url: 'https://github.com/getomni-ai/omni',
      }),
    ]);

    expect(repos.map((item) => item.full_name)).toEqual(['langgenius/dify']);
  });
});
