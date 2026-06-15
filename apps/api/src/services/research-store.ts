import BetterSqlite3 from 'better-sqlite3';

export function upsertNote(
  db: BetterSqlite3.Database,
  repoId: string,
  note: string,
  tags: string[],
  favorite: boolean,
  hidden: boolean,
): void {
  const upsert = db.prepare(`
    INSERT INTO research_records (repoId, favorite, hidden, tags, note, updatedAt)
    VALUES (@repoId, @favorite, @hidden, @tags, @note, datetime('now'))
    ON CONFLICT(repoId) DO UPDATE SET
      favorite = @favorite,
      hidden = @hidden,
      tags = @tags,
      note = @note,
      updatedAt = datetime('now')
  `);

  upsert.run({
    repoId,
    favorite: favorite ? 1 : 0,
    hidden: hidden ? 1 : 0,
    tags: JSON.stringify(tags),
    note,
  });
}

export function markHidden(
  db: BetterSqlite3.Database,
  repoId: string,
  hidden: boolean,
): void {
  db.prepare(`
    INSERT INTO research_records (repoId, hidden, updatedAt)
    VALUES (@repoId, @hidden, datetime('now'))
    ON CONFLICT(repoId) DO UPDATE SET
      hidden = @hidden,
      updatedAt = datetime('now')
  `).run({ repoId, hidden: hidden ? 1 : 0 });
}

/** 获取所有被隐藏的 repoId 列表 */
export function getHiddenRepoIds(db: BetterSqlite3.Database): string[] {
  const rows = db.prepare(
    "SELECT repoId FROM research_records WHERE hidden = 1"
  ).all() as Array<{ repoId: string }>;
  return rows.map((r) => r.repoId);
}

/** 标记/取消收藏 */
export function toggleFavorite(
  db: BetterSqlite3.Database,
  repoId: string,
  favorite: boolean,
): void {
  db.prepare(`
    INSERT INTO research_records (repoId, favorite, updatedAt)
    VALUES (@repoId, @favorite, datetime('now'))
    ON CONFLICT(repoId) DO UPDATE SET
      favorite = @favorite,
      updatedAt = datetime('now')
  `).run({ repoId, favorite: favorite ? 1 : 0 });
}

/** 获取所有已收藏项目的 repoId 列表 */
export function getFavoriteRepoIds(db: BetterSqlite3.Database): string[] {
  const rows = db.prepare(
    "SELECT repoId FROM research_records WHERE favorite = 1"
  ).all() as Array<{ repoId: string }>;
  return rows.map((r) => r.repoId);
}

export function upsertTags(
  db: BetterSqlite3.Database,
  repoId: string,
  tags: string[],
): void {
  const upsert = db.prepare(`
    INSERT INTO research_records (repoId, tags, updatedAt)
    VALUES (@repoId, @tags, datetime('now'))
    ON CONFLICT(repoId) DO UPDATE SET
      tags = @tags,
      updatedAt = datetime('now')
  `);

  upsert.run({
    repoId,
    tags: JSON.stringify(tags),
  });
}
