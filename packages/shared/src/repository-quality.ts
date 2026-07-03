export interface RepositoryCandidate {
  repoId?: string;
  full_name?: string;
  url?: string;
  html_url?: string;
}

const KNOWN_UNAVAILABLE_REPO_IDS = new Set([
  'getomni-ai/omni',
  'bubble-io/bubble-templates',
]);

function normalizeRepoId(value: string): string {
  return value.trim().replace(/\.git$/i, '').toLowerCase();
}

function getRepoId(candidate: RepositoryCandidate): string {
  return candidate.repoId ?? candidate.full_name ?? '';
}

function getRepoUrl(candidate: RepositoryCandidate): string {
  return candidate.url ?? candidate.html_url ?? '';
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

export function isKnownUnavailableRepo(candidate: RepositoryCandidate): boolean {
  return KNOWN_UNAVAILABLE_REPO_IDS.has(normalizeRepoId(getRepoId(candidate)));
}

export function isEligibleRecommendationRepo(candidate: RepositoryCandidate): boolean {
  const repoId = normalizeRepoId(getRepoId(candidate));
  const url = getRepoUrl(candidate);

  if (!repoId) return false;
  if (isKnownUnavailableRepo(candidate)) return false;
  if (!isSupportedGitHubRepoUrl(url)) return false;

  const urlRepoId = normalizeRepoId(new URL(url).pathname.split('/').filter(Boolean).join('/'));

  return repoId === urlRepoId;
}

export function filterEligibleRecommendationRepos<T extends RepositoryCandidate>(repos: T[]): T[] {
  return repos.filter(isEligibleRecommendationRepo);
}
