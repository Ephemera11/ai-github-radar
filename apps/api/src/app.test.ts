import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';
import type { Pool } from 'mysql2/promise';

// 创建一个极简的 mock Pool
function mockPool(): Pool {
  return { execute: vi.fn().mockResolvedValue([[], []]) } as unknown as Pool;
}

// Mock 所有需要 DB 的 store 模块
vi.mock('./services/research-store.js', () => ({
  upsertNote: vi.fn().mockResolvedValue(undefined),
  upsertTags: vi.fn().mockResolvedValue(undefined),
  markHidden: vi.fn().mockResolvedValue(undefined),
  toggleFavorite: vi.fn().mockResolvedValue(undefined),
  getHiddenRepoIds: vi.fn().mockResolvedValue([]),
  getFavoriteRepoIds: vi.fn().mockResolvedValue([]),
}));

vi.mock('./services/project-store.js', () => ({
  saveProjects: vi.fn().mockResolvedValue(undefined),
}));

// Mock db.ts 避免连接真实数据库
vi.mock('./db.js', () => ({
  createPool: vi.fn().mockResolvedValue(mockPool()),
}));

describe('GET /api/health', () => {
  it('should return { ok: true }', async () => {
    const app = await createApp(mockPool());
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe('Projects routes', () => {
  let pool: Pool;

  beforeEach(() => {
    pool = mockPool();
  });

  it('GET /api/projects should return 200 with items', async () => {
    const app = await createApp(pool);
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.items.some((item: { repoId: string }) => item.repoId === 'getomni-ai/omni')).toBe(false);
    expect(res.body.updatedAt).toBeDefined();
  });

  it('POST /api/projects/refresh should return 202 { queued: true }', async () => {
    const app = await createApp(pool);
    const res = await request(app).post('/api/projects/refresh');
    expect(res.status).toBe(202);
    expect(res.body).toEqual({ queued: true });
  });

  it('POST /api/research/langgenius/dify/note should return 200 { saved: true }', async () => {
    const app = await createApp(pool);
    const res = await request(app)
      .post('/api/research/langgenius/dify/note')
      .send({ note: 'test note' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ saved: true, repoId: 'langgenius/dify', note: 'test note' });
  });

  it('POST /api/export should return text/plain with project names', async () => {
    const app = await createApp(pool);
    const res = await request(app)
      .post('/api/export')
      .send({ items: [{ name: 'dify', url: 'https://github.com/langgenius/dify' }] });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
    expect(res.text).toContain('dify');
  });
});
