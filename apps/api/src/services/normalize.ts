import type { ProjectRecord } from '@ai-radar/shared';
import { scoreProject, buildRecommendationReason } from './rank.js';

/**
 * GitHub API 返回的仓库数据结构
 */
export interface GitHubRepo {
  id?: number;
  full_name: string;
  name: string;
  url?: string;
  owner: {
    login: string;
    avatar_url?: string;
    url?: string;
  };
  html_url: string;
  description: string | null;
  language: string | null;
  license: {
    key?: string;
    name?: string;
    spdx_id?: string;
  } | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  pushed_at: string;
  /** 近 30 天实际新增 star 数（来自 GitHub star 历史数据） */
  last30d_stars_count?: number;
}

export type { ProjectRecord };

/**
 * 将 GitHub API 格式的仓库对象转换为 ProjectRecord
 *
 * - last30dStars: 优先使用 last30d_stars_count（真实数据），否则按 stars 估算
 * - starGrowthRate: 年化增长速率，反映曲线陡峭程度
 * - 推荐排序以增长速率为核心指标
 */
export function normalizeRepo(repo: GitHubRepo): ProjectRecord {
  const stars = repo.stargazers_count;

  // 优先使用真实的近 30 天新增数，否则按总星标 * 比率估算
  const last30dStars = repo.last30d_stars_count ?? Math.max(20, Math.round(stars * 0.08));

  // 判断是否近期更新（30 天内）
  const now = new Date();
  const pushedDate = new Date(repo.pushed_at);
  const daysSincePush = (now.getTime() - pushedDate.getTime()) / (1000 * 60 * 60 * 24);
  const recentlyUpdated = daysSincePush <= 30;

  // 计算年化增长速率（近 30 天增长 * 12 后 / 总星标）
  const annualGrowthRate = (last30dStars * 12) / Math.max(1, stars);
  const starGrowthRate = Math.min(1, annualGrowthRate);

  // 取第一个 topic 作为主要方向，如果没有则用空字符串
  const topic = repo.topics && repo.topics.length > 0 ? repo.topics[0] : '';
  const topicMatchScore = 0.9;

  const recommendationScore = scoreProject({
    stars,
    last30dStars,
    createdAt: repo.created_at,
    pushedAt: repo.pushed_at,
    topicMatchScore,
  });

  const recommendationReason = buildRecommendationReason({
    stars,
    last30dStars,
    createdAt: repo.created_at,
    topic,
    recentlyUpdated,
  });

  return {
    repoId: repo.full_name,
    name: repo.name,
    owner: repo.owner.login,
    url: repo.html_url,
    summary: repo.description || '',
    language: repo.language || '',
    license: repo.license?.spdx_id || repo.license?.key || '',
    topics: repo.topics || [],
    stars,
    forks: repo.forks_count,
    pushedAt: repo.pushed_at,
    createdAt: repo.created_at,
    last30dStars,
    starGrowthRate,
    activityScore: recommendationScore,
    recommendationScore,
    recommendationReason,
  };
}
