import type { Pool, ResultSetHeader } from 'mysql2/promise';
import type { ProjectRecord } from '@ai-radar/shared';

export async function saveProjects(pool: Pool, projects: ProjectRecord[]): Promise<void> {
  // 用事务批量写入
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const item of projects) {
      await conn.execute(
        `INSERT INTO projects (repoId, name, owner, url, summary, language, license, topics, stars, forks, pushedAt, last30dStars, activityScore, recommendationScore, recommendationReason, payload, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           owner = VALUES(owner),
           url = VALUES(url),
           summary = VALUES(summary),
           language = VALUES(language),
           license = VALUES(license),
           topics = VALUES(topics),
           stars = VALUES(stars),
           forks = VALUES(forks),
           pushedAt = VALUES(pushedAt),
           last30dStars = VALUES(last30dStars),
           activityScore = VALUES(activityScore),
           recommendationScore = VALUES(recommendationScore),
           recommendationReason = VALUES(recommendationReason),
           payload = VALUES(payload),
           updatedAt = NOW()`,
        [
          item.repoId, item.name, item.owner, item.url,
          item.summary, item.language, item.license,
          JSON.stringify(item.topics),
          item.stars, item.forks, item.pushedAt,
          item.last30dStars, item.activityScore,
          item.recommendationScore, item.recommendationReason,
          JSON.stringify(item),
        ],
      );
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
