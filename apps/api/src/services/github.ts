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
const DEFAULT_CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * 每个 Tab 对应不同的 GitHub Search 查询策略
 *
 * - recommended: 广泛 AI 主题，中等 star 门槛，综合排序
 * - trending: 仅查近 7 天有推送的仓库，捕捉本周活跃项目
 * - stars: 高 star 门槛（>20000），聚焦历史高赞项目
 * - rising: 仅查近 180 天创建的新项目，发掘新上升项目
 */
interface SearchConfig {
  queries: string[];
  sort: 'stars' | 'updated' | 'forks';
  order: 'desc' | 'asc';
  perPage: number;
}

function getDateNDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function buildSearchConfigs(): Record<SortType, SearchConfig> {
  const weekAgo = getDateNDaysAgo(7);
  const halfYearAgo = getDateNDaysAgo(180);

  return {
    recommended: {
      queries: [
        'topic:llm stars:>1000 archived:false',
        'topic:ai-agents stars:>500 archived:false',
        'topic:rag stars:>500 archived:false',
        'topic:chatbot stars:>1000 archived:false',
      ],
      sort: 'stars',
      order: 'desc',
      perPage: 25,
    },
    trending: {
      queries: [
        `topic:llm stars:>500 archived:false pushed:>=${weekAgo}`,
        `topic:ai-agents stars:>200 archived:false pushed:>=${weekAgo}`,
        `topic:rag stars:>200 archived:false pushed:>=${weekAgo}`,
        `topic:chatbot stars:>500 archived:false pushed:>=${weekAgo}`,
      ],
      sort: 'stars',
      order: 'desc',
      perPage: 25,
    },
    stars: {
      queries: [
        'topic:llm stars:>20000 archived:false',
        'topic:ai-agents stars:>10000 archived:false',
        'topic:rag stars:>10000 archived:false',
        'topic:chatbot stars:>20000 archived:false',
      ],
      sort: 'stars',
      order: 'desc',
      perPage: 25,
    },
    rising: {
      queries: [
        `topic:llm stars:>100 archived:false created:>=${halfYearAgo}`,
        `topic:ai-agents stars:>50 archived:false created:>=${halfYearAgo}`,
        `topic:rag stars:>50 archived:false created:>=${halfYearAgo}`,
        `topic:chatbot stars:>100 archived:false created:>=${halfYearAgo}`,
      ],
      sort: 'stars',
      order: 'desc',
      perPage: 25,
    },
  };
}

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

  const projects = await fetchLiveProjects(sortType).catch(() => loadFixtureProjects());
  const sortedProjects = sortProjectsByType(projects, sortType);

  cachedProjects.set(cacheKey, {
    items: sortedProjects,
    expiresAt: now + getCacheTtlMs(),
  });

  return sortedProjects;
}

async function fetchLiveProjects(sortType: SortType): Promise<ProjectRecord[]> {
  const repos = await fetchGitHubSearchRepos(sortType);
  const projects = filterEligibleRecommendationRepos(repos).map(normalizeRepo);

  if (projects.length === 0) {
    throw new Error('GitHub search returned no eligible repositories.');
  }

  return projects;
}

async function fetchGitHubSearchRepos(sortType: SortType): Promise<GitHubRepo[]> {
  const config = getSearchConfig(sortType);
  const reposById = new Map<string, GitHubRepo>();
  let hasSuccessfulResponse = false;

  for (const query of config.queries) {
    const url = new URL(GITHUB_SEARCH_URL);
    url.searchParams.set('q', query);
    url.searchParams.set('sort', config.sort);
    url.searchParams.set('order', config.order);
    url.searchParams.set('per_page', String(config.perPage));

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



function getSearchConfig(sortType: SortType): SearchConfig {
  const configs = buildSearchConfigs();

  // GITHUB_SEARCH_QUERIES 环境变量仅覆盖 recommended 类型的查询语句
  if (sortType === 'recommended') {
    const customQueries = process.env.GITHUB_SEARCH_QUERIES?.split(';')
      .map((query) => query.trim())
      .filter(Boolean);

    if (customQueries && customQueries.length > 0) {
      return { ...configs.recommended, queries: customQueries };
    }
  }

  return configs[sortType];
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
