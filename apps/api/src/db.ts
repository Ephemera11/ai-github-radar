import BetterSqlite3 from 'better-sqlite3';
import { config } from './config';

export function openDatabase(): BetterSqlite3.Database {
  const db = new BetterSqlite3(config.dbFile);

  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      repoId TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner TEXT NOT NULL,
      url TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      language TEXT NOT NULL DEFAULT '',
      license TEXT NOT NULL DEFAULT '',
      topics TEXT NOT NULL DEFAULT '[]',
      stars INTEGER NOT NULL DEFAULT 0,
      forks INTEGER NOT NULL DEFAULT 0,
      pushedAt TEXT NOT NULL DEFAULT '',
      last30dStars INTEGER NOT NULL DEFAULT 0,
      activityScore REAL NOT NULL DEFAULT 0,
      recommendationScore REAL NOT NULL DEFAULT 0,
      recommendationReason TEXT NOT NULL DEFAULT '',
      payload TEXT NOT NULL DEFAULT '{}',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS research_records (
      repoId TEXT PRIMARY KEY,
      favorite INTEGER NOT NULL DEFAULT 0,
      hidden INTEGER NOT NULL DEFAULT 0,
      tags TEXT NOT NULL DEFAULT '[]',
      note TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  return db;
}
