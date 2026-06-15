import type { ProjectRecord } from '@ai-radar/shared';

const API_BASE = 'http://localhost:8787';

export async function getProjects(): Promise<ProjectRecord[]> {
  const response = await fetch(`${API_BASE}/api/projects`);
  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`);
  }
  return response.json() as Promise<ProjectRecord[]>;
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
  return response.json() as Promise<{ items: ProjectRecord[]; updatedAt: string }>;
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
