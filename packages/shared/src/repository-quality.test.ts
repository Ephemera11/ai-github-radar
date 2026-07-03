import { describe, expect, it } from 'vitest';
import {
  filterEligibleRecommendationRepos,
  isEligibleRecommendationRepo,
  isKnownUnavailableRepo,
  isSupportedGitHubRepoUrl,
} from './repository-quality';

describe('repository quality filter', () => {
  it('allows standard GitHub repository URLs', () => {
    expect(isSupportedGitHubRepoUrl('https://github.com/langgenius/dify')).toBe(true);
  });

  it('rejects non-repository GitHub URLs', () => {
    expect(isSupportedGitHubRepoUrl('https://github.com/langgenius/dify/issues')).toBe(false);
    expect(isSupportedGitHubRepoUrl('https://example.com/langgenius/dify')).toBe(false);
  });

  it('marks known unavailable repositories', () => {
    expect(isKnownUnavailableRepo({ repoId: 'getomni-ai/omni' })).toBe(true);
    expect(isKnownUnavailableRepo({ full_name: 'getomni-ai/omni' })).toBe(true);
    expect(isKnownUnavailableRepo({ full_name: 'bubble-io/bubble-templates' })).toBe(true);
  });

  it('rejects stale repositories before ranking or rendering', () => {
    expect(isEligibleRecommendationRepo({
      repoId: 'getomni-ai/omni',
      url: 'https://github.com/getomni-ai/omni',
    })).toBe(false);
    expect(isEligibleRecommendationRepo({
      repoId: 'bubble-io/bubble-templates',
      url: 'https://github.com/bubble-io/bubble-templates',
    })).toBe(false);
  });

  it('rejects mismatched repo id and URL pairs', () => {
    expect(isEligibleRecommendationRepo({
      repoId: 'langgenius/dify',
      url: 'https://github.com/other-owner/dify',
    })).toBe(false);
  });

  it('filters only eligible repositories', () => {
    const repos = filterEligibleRecommendationRepos([
      { repoId: 'langgenius/dify', url: 'https://github.com/langgenius/dify' },
      { repoId: 'getomni-ai/omni', url: 'https://github.com/getomni-ai/omni' },
      { repoId: 'bubble-io/bubble-templates', url: 'https://github.com/bubble-io/bubble-templates' },
    ]);

    expect(repos.map((item) => item.repoId)).toEqual(['langgenius/dify']);
  });
});
