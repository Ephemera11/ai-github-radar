import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { normalizeRepo, type GitHubRepo, type ProjectRecord } from './normalize.js';
import { filterEligibleRecommendationRepos } from './repository-quality.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 从 fixture 文件读取 GitHub 搜索数据，标准化并按 recommendationScore 降序排列后返回
 */
export function fetchAiProjects(): ProjectRecord[] {
  const fixturePath = join(__dirname, '..', 'fixtures', 'github-search.json');
  const raw = readFileSync(fixturePath, 'utf-8');
  const data = JSON.parse(raw) as { items: GitHubRepo[] };

  const projects = filterEligibleRecommendationRepos(data.items).map(normalizeRepo);

  // 按 recommendationScore 降序排列
  projects.sort((a, b) => b.recommendationScore - a.recommendationScore);

  return projects;
}
