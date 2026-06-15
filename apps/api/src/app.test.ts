import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import BetterSqlite3 from 'better-sqlite3';
import { createApp } from './app.js';
import { openDatabase } from './db.js';

describe('GET /api/health', () => {
  it('should return { ok: true }', async () => {
    const app = createApp();
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe('Projects routes', () => {
  let db: BetterSqlite3.Database;

  beforeAll(() => {
    process.env.DB_FILE = ':memory:';
    db = openDatabase();
  });

  afterAll(() => {
    db.close();
  });

  it('GET /api/projects should return 200 with items', async () => {
    const app = createApp(db);
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.updatedAt).toBeDefined();
  });

  it('POST /api/projects/refresh should return 202 { queued: true }', async () => {
    const app = createApp(db);
    const res = await request(app).post('/api/projects/refresh');
    expect(res.status).toBe(202);
    expect(res.body).toEqual({ queued: true });
  });

  it('POST /api/research/langgenius/dify/note should return 200 { saved: true }', async () => {
    const app = createApp(db);
    const res = await request(app)
      .post('/api/research/langgenius/dify/note')
      .send({ note: 'test note' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ saved: true, repoId: 'langgenius/dify', note: 'test note' });
  });

  it('POST /api/export should return text/plain with project names', async () => {
    const app = createApp(db);
    const res = await request(app)
      .post('/api/export')
      .send({ items: [{ name: 'dify', url: 'https://github.com/langgenius/dify' }] });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
    expect(res.text).toContain('dify');
  });
});
