import { readFileSync } from 'fs';
import { request as httpsRequest } from 'https';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { filterEligibleRecommendationRepos } from '@ai-radar/shared';
import { normalizeRepo, type GitHubRepo, type ProjectRecord } from './normalize.js';
import { sortProjectsByType, type SortType } from './rank.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const GITHUB_SEARCH_URL = 'https://api.github.com/search/repositories';
const DEFAULT_SEARCH_QUERIES = [
  'topic:llm stars:>1000 archived:false',
  'topic:ai-agents stars:>500 archived:false',
  'topic:rag stars:>500 archived:false',
  'topic:chatbot stars:>1000 archived:false',
];
const DEFAULT_CACHE_TTL_MS = 10 * 60 * 1000;

interface GitHubSearchResponse {
  items: GitHubRepo[];
}

export interface FetchAiProjectsOptions {
  forceRefresh?: boolean;
  sortType?: SortType;
}

interface CachedEntry {
  items: ProjectRecord[];
  expiresAt: number;
}

let cachedProjects = new Map<SortType | 'default', CachedEntry>();

export function clearAiProjectsCache(): void {
  cachedProjects.clear();
}

export async function fetchAiProjects(options: FetchAiProjectsOptions = {}): Promise<ProjectRecord[]> {
  const now = Date.now();
  const sortType = options.sortType ?? 'recommended';
  const cacheKey = sortType;

  if (!options.forceRefresh) {
    const cachedEntry = cachedProjects.get(cacheKey);
    if (cachedEntry && cachedEntry.expiresAt > now) {
      return cachedEntry.items;
    }
  }

  const projects = await fetchLiveProjects().catch(() => loadFixtureProjects());
  const sortedProjects = sortProjectsByType(projects, sortType);

  cachedProjects.set(cacheKey, {
    items: sortedProjects,
    expiresAt: now + getCacheTtlMs(),
  });

  return sortedProjects;
}

async function fetchLiveProjects(): Promise<ProjectRecord[]> {
  const repos = await fetchGitHubSearchRepos();
  const projects = filterEligibleRecommendationRepos(repos).map(normalizeRepo);

  if (projects.length === 0) {
    throw new Error('GitHub search returned no eligible repositories.');
  }

  return projects;
}

async function fetchGitHubSearchRepos(): Promise<GitHubRepo[]> {
  const queries = getSearchQueries();
  const reposById = new Map<string, GitHubRepo>();
  let hasSuccessfulResponse = false;

  for (const query of queries) {
    const url = new URL(GITHUB_SEARCH_URL);
    url.searchParams.set('q', query);
    url.searchParams.set('sort', 'stars');
    url.searchParams.set('order', 'desc');
    url.searchParams.set('per_page', '25');

    const data = await requestGitHubSearch(url, buildGitHubHeaders());
    if (!data) {
      continue;
    }

    hasSuccessfulResponse = true;
    for (const repo of data.items ?? []) {
      reposById.set(repo.full_name.toLowerCase(), {
        ...repo,
        url: repo.html_url,
      });
    }
  }

  if (!hasSuccessfulResponse) {
    throw new Error('GitHub search did not return a successful response.');
  }

  return [...reposById.values()];
}

function loadFixtureProjects(): ProjectRecord[] {
  const fixturePath = join(__dirname, '..', 'fixtures', 'github-search.json');
  const raw = readFileSync(fixturePath, 'utf-8');
  const data = JSON.parse(raw) as { items: GitHubRepo[] };

  return filterEligibleRecommendationRepos(data.items).map(normalizeRepo);
}

async function requestGitHubSearch(
  url: URL,
  headers: Record<string, string>,
): Promise<GitHubSearchResponse | null> {
  if (typeof fetch === 'function') {
    const response = await fetch(url, { headers });
    if (!response.ok) return null;
    return await response.json() as GitHubSearchResponse;
  }

  return await requestJsonWithHttps(url, headers);
}

function requestJsonWithHttps(
  url: URL,
  headers: Record<string, string>,
): Promise<GitHubSearchResponse | null> {
  return new Promise((resolve, reject) => {
    const req = httpsRequest(url, { headers }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        const statusCode = res.statusCode ?? 0;
        if (statusCode < 200 || statusCode >= 300) {
          resolve(null);
          return;
        }

        try {
          resolve(JSON.parse(body) as GitHubSearchResponse);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.setTimeout(15000, () => {
      req.destroy(new Error('GitHub search request timed out.'));
    });
    req.on('error', reject);
    req.end();
  });
}



function getSearchQueries(): string[] {
  const customQueries = process.env.GITHUB_SEARCH_QUERIES?.split(';')
    .map((query) => query.trim())
    .filter(Boolean);

  return customQueries && customQueries.length > 0 ? customQueries : DEFAULT_SEARCH_QUERIES;
}

function getCacheTtlMs(): number {
  const ttl = Number(process.env.GITHUB_SEARCH_CACHE_TTL_MS);
  return Number.isFinite(ttl) && ttl >= 0 ? ttl : DEFAULT_CACHE_TTL_MS;
}

function buildGitHubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'ai-github-radar',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}
