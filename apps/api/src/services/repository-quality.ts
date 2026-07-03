import type { GitHubRepo } from './normalize.js';

const KNOWN_UNAVAILABLE_REPO_IDS = new Set([
  'getomni-ai/omni',
]);

function normalizeRepoId(value: string): string {
  return value.trim().replace(/\.git$/i, '').toLowerCase();
}

export function isSupportedGitHubRepoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com') return false;

    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length !== 2) return false;

    return parts.every((part) => /^[A-Za-z0-9_.-]+$/.test(part));
  } catch {
    return false;
  }
}

export function isKnownUnavailableRepo(repo: Pick<GitHubRepo, 'full_name'>): boolean {
  return KNOWN_UNAVAILABLE_REPO_IDS.has(normalizeRepoId(repo.full_name));
}

export function isEligibleRecommendationRepo(repo: GitHubRepo): boolean {
  if (isKnownUnavailableRepo(repo)) return false;
  if (!isSupportedGitHubRepoUrl(repo.html_url)) return false;

  const repoId = normalizeRepoId(repo.full_name);
  const urlRepoId = normalizeRepoId(new URL(repo.html_url).pathname.split('/').filter(Boolean).join('/'));

  return repoId === urlRepoId;
}

export function filterEligibleRecommendationRepos(repos: GitHubRepo[]): GitHubRepo[] {
  return repos.filter(isEligibleRecommendationRepo);
}
