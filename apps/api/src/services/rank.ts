export interface ScoreInput {
  stars: number;
  last30dStars: number;
  createdAt: string;
  pushedAt: string;
  topicMatchScore: number;
}

export interface ReasonInput {
  stars: number;
  last30dStars: number;
  createdAt: string;
  topic: string;
  recentlyUpdated: boolean;
}

export type SortType = 'recommended' | 'trending' | 'stars' | 'rising';

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * 计算项目的综合评分，核心是「增长速率」而非总星标
 *
 * starScore: log10(stars+1)/5 — 总星标影响降到最低
 * growthVelocity: 年化增长率 / 0.8（参考值），反映曲线陡峭程度
 * recencyScore: 1 - daysSincePush/30 — 最近是否还在更新
 * topicMatchScore: 主题匹配度
 *
 * 最终权重：growthVelocity*0.5 + recencyScore*0.2 + starScore*0.15 + topicMatchScore*0.15
 */
export function scoreProject(input: ScoreInput): number {
  const { stars, last30dStars, createdAt, pushedAt, topicMatchScore } = input;

  // starScore: 对数缩放，上限约 1（100k stars）
  const starScore = Math.log10(stars + 1) / 5;

  // growthVelocity: 年化增长速率，反映增长曲线陡峭程度
  // 公式：(last30dStars * 12) / max(1, stars) — 近30天新增 * 12 年化后 / 总星标
  // 值越大说明曲线越陡。标准化：以 0.8（年增长 80% 参考值）为上限
  const annualGrowthRate = (last30dStars * 12) / Math.max(1, stars);
  const growthVelocity = clamp(annualGrowthRate / 0.8);

  // recencyScore: 近 30 天活跃度
  const now = new Date();
  const pushedDate = new Date(pushedAt);
  const daysSincePush = Math.max(0, (now.getTime() - pushedDate.getTime()) / (1000 * 60 * 60 * 24));
  const recencyScore = clamp(1 - daysSincePush / 30);

  // 新权重：增长速率占主导
  const score = growthVelocity * 0.50 + recencyScore * 0.20 + starScore * 0.15 + topicMatchScore * 0.15;

  return clamp(score);
}

/**
 * 根据项目增长趋势生成推荐理由，聚焦增长态势而非总星标
 */
export function buildRecommendationReason(input: ReasonInput): string {
  const { last30dStars, topic, recentlyUpdated } = input;

  const reasons: string[] = [];

  if (last30dStars >= 2000) {
    reasons.push('增长曲线极其陡峭');
  } else if (last30dStars >= 800) {
    reasons.push('增长趋势非常强劲');
  } else if (last30dStars >= 300) {
    reasons.push('增长势头良好');
  } else if (last30dStars >= 100) {
    reasons.push('有稳定增长');
  } else {
    reasons.push('增长趋于平稳');
  }

  if (recentlyUpdated) {
    reasons.push('近期仍在频繁更新');
  }

  if (topic) {
    reasons.push(`属于 ${topic.charAt(0).toUpperCase() + topic.slice(1)} 热门方向`);
  }

  return reasons.join('，');
}

export interface ProjectRecordForSort {
  repoId: string;
  stars: number;
  last30dStars: number;
  createdAt: string;
  pushedAt: string;
  recommendationScore: number;
}

export function sortProjectsByType(projects: ProjectRecordForSort[], sortType: SortType): ProjectRecordForSort[] {
  return [...projects].sort((a, b) => {
    switch (sortType) {
      case 'recommended':
        return b.recommendationScore - a.recommendationScore;
      case 'trending':
        return b.last30dStars - a.last30dStars;
      case 'stars':
        return b.stars - a.stars;
      case 'rising':
        const ageA = (new Date().getTime() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        const ageB = (new Date().getTime() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        const risingScoreA = (a.last30dStars / Math.max(1, ageA)) * (1 - Math.min(1, ageA / 365));
        const risingScoreB = (b.last30dStars / Math.max(1, ageB)) * (1 - Math.min(1, ageB / 365));
        return risingScoreB - risingScoreA;
      default:
        return b.recommendationScore - a.recommendationScore;
    }
  });
}
