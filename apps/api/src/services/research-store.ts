import type { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export async function upsertNote(
  pool: Pool,
  repoId: string,
  note: string,
  tags: string[],
  favorite: boolean,
  hidden: boolean,
): Promise<void> {
  await pool.execute(
    `INSERT INTO research_records (repoId, favorite, hidden, tags, note, updatedAt)
     VALUES (?, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       favorite = VALUES(favorite),
       hidden = VALUES(hidden),
       tags = VALUES(tags),
       note = VALUES(note),
       updatedAt = NOW()`,
    [repoId, favorite ? 1 : 0, hidden ? 1 : 0, JSON.stringify(tags), note],
  );
}

export async function markHidden(
  pool: Pool,
  repoId: string,
  hidden: boolean,
): Promise<void> {
  await pool.execute(
    `INSERT INTO research_records (repoId, hidden, updatedAt)
     VALUES (?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       hidden = VALUES(hidden),
       updatedAt = NOW()`,
    [repoId, hidden ? 1 : 0],
  );
}

/** 获取所有被隐藏的 repoId 列表 */
export async function getHiddenRepoIds(pool: Pool): Promise<string[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT repoId FROM research_records WHERE hidden = 1',
  );
  return rows.map((r) => r.repoId as string);
}

/** 标记/取消收藏 */
export async function toggleFavorite(
  pool: Pool,
  repoId: string,
  favorite: boolean,
): Promise<void> {
  await pool.execute(
    `INSERT INTO research_records (repoId, favorite, updatedAt)
     VALUES (?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       favorite = VALUES(favorite),
       updatedAt = NOW()`,
    [repoId, favorite ? 1 : 0],
  );
}

/** 获取所有已收藏项目的 repoId 列表 */
export async function getFavoriteRepoIds(pool: Pool): Promise<string[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT repoId FROM research_records WHERE favorite = 1',
  );
  return rows.map((r) => r.repoId as string);
}

export async function upsertTags(
  pool: Pool,
  repoId: string,
  tags: string[],
): Promise<void> {
  await pool.execute(
    `INSERT INTO research_records (repoId, tags, updatedAt)
     VALUES (?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       tags = VALUES(tags),
       updatedAt = NOW()`,
    [repoId, JSON.stringify(tags)],
  );
}
