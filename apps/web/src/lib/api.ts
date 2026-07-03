import { filterEligibleRecommendationRepos, type ProjectRecord } from '@ai-radar/shared';

// 开发环境用 localhost，生产环境用环境变量或同源
const API_BASE = import.meta.env.DEV
  ? 'http://localhost:8787'
  : (import.meta.env.VITE_API_BASE || '');

export async function getProjects(): Promise<{ items: ProjectRecord[]; updatedAt: string }> {
  const response = await fetch(`${API_BASE}/api/projects`);
  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`);
  }
  const data = await response.json() as { items: ProjectRecord[]; updatedAt: string };
  return { ...data, items: filterEligibleRecommendationRepos(data.items ?? []) };
}

export async function refreshProjects(): Promise<{ queued: boolean }> {
  const response = await fetch(`${API_BASE}/api/projects/refresh`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to refresh projects: ${response.statusText}`);
  }
  return response.json() as Promise<{ queued: boolean }>;
}

export async function hideProject(repoId: string): Promise<{ hidden: boolean }> {
  const [owner, repo] = repoId.split('/');
  const response = await fetch(`${API_BASE}/api/research/${owner}/${repo}/hide`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to hide project: ${response.statusText}`);
  }
  return response.json() as Promise<{ hidden: boolean }>;
}

export async function toggleFavorite(repoId: string, favorite: boolean): Promise<{ favorite: boolean }> {
  const [owner, repo] = repoId.split('/');
  const response = await fetch(`${API_BASE}/api/research/${owner}/${repo}/favorite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ favorite }),
  });
  if (!response.ok) {
    throw new Error(`Failed to toggle favorite: ${response.statusText}`);
  }
  return response.json() as Promise<{ favorite: boolean }>;
}

export async function getFavorites(): Promise<{ items: ProjectRecord[]; updatedAt: string }> {
  const response = await fetch(`${API_BASE}/api/favorites`);
  if (!response.ok) {
    throw new Error(`Failed to fetch favorites: ${response.statusText}`);
  }
  const data = await response.json() as { items: ProjectRecord[]; updatedAt: string };
  return { ...data, items: filterEligibleRecommendationRepos(data.items ?? []) };
}

export async function addProject(data: {
  repoId: string;
  name: string;
  owner?: string;
  url: string;
  summary?: string;
  language?: string;
  license?: string;
  topics?: string[];
  stars?: number;
  forks?: number;
}): Promise<{ added: boolean; project: ProjectRecord }> {
  const response = await fetch(`${API_BASE}/api/projects/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to add project');
  }
  return response.json() as Promise<{ added: boolean; project: ProjectRecord }>;
}

export async function summarizeProject(repoId: string): Promise<{ summary: string }> {
  const [owner, repo] = repoId.split('/');
  const response = await fetch(`${API_BASE}/api/projects/${owner}/${repo}/summarize`, {
    method: 'POST',
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'AI summary failed');
  }
  return response.json() as Promise<{ summary: string }>;
}
