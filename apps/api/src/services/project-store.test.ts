import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import BetterSqlite3 from 'better-sqlite3';
import { openDatabase } from '../db';

describe('Database schema', () => {
  let db: BetterSqlite3.Database;

  beforeAll(() => {
    process.env.DB_FILE = ':memory:';
    db = openDatabase();
  });

  afterAll(() => {
    db.close();
  });

  it('should create projects table', () => {
    const result = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='projects'",
    ).get();
    expect(result).toBeTruthy();
  });

  it('should create research_records table', () => {
    const result = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='research_records'",
    ).get();
    expect(result).toBeTruthy();
  });
});
