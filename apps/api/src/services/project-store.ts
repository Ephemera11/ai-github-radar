import BetterSqlite3 from 'better-sqlite3';
import type { ProjectRecord } from '@ai-radar/shared';

export function saveProjects(db: BetterSqlite3.Database, projects: ProjectRecord[]): void {
  const insert = db.prepare(`
    INSERT OR REPLACE INTO projects (repoId, name, owner, url, summary, language, license, topics, stars, forks, pushedAt, last30dStars, activityScore, recommendationScore, recommendationReason, payload, updatedAt)
    VALUES (@repoId, @name, @owner, @url, @summary, @language, @license, @topics, @stars, @forks, @pushedAt, @last30dStars, @activityScore, @recommendationScore, @recommendationReason, @payload, datetime('now'))
  `);

  const transaction = db.transaction((items: ProjectRecord[]) => {
    for (const item of items) {
      insert.run({
        repoId: item.repoId,
        name: item.name,
        owner: item.owner,
        url: item.url,
        summary: item.summary,
        language: item.language,
        license: item.license,
        topics: JSON.stringify(item.topics),
        stars: item.stars,
        forks: item.forks,
        pushedAt: item.pushedAt,
        last30dStars: item.last30dStars,
        activityScore: item.activityScore,
        recommendationScore: item.recommendationScore,
        recommendationReason: item.recommendationReason,
        payload: JSON.stringify(item),
      });
    }
  });

  transaction(projects);
}
