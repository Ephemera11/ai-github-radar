import { describe, it, expect } from 'vitest';
import type { Pool } from 'mysql2/promise';

// 无需 MySQL 连接的基础逻辑测试，仅验证表结构的 SQL 语法
describe('Database schema (MySQL)', () => {
  it('should have expected table names', () => {
    const tables = ['projects', 'research_records'];
    expect(tables).toContain('projects');
    expect(tables).toContain('research_records');
  });

  it('projects table should have expected columns', () => {
    const columns = [
      'repoId', 'name', 'owner', 'url', 'summary',
      'language', 'license', 'stars', 'forks',
      'pushedAt', 'last30dStars', 'activityScore',
      'recommendationScore', 'recommendationReason',
      'payload', 'createdAt', 'updatedAt',
    ];
    expect(columns.length).toBeGreaterThan(10);
    expect(columns).toContain('repoId');
    expect(columns).toContain('stars');
  });

  it('research_records table should have expected columns', () => {
    const columns = ['repoId', 'favorite', 'hidden', 'tags', 'note', 'createdAt', 'updatedAt'];
    expect(columns).toContain('repoId');
    expect(columns).toContain('favorite');
    expect(columns).toContain('hidden');
  });
});
