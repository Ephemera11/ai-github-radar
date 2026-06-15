import { describe, it, expect } from 'vitest';
import { projectRecordSchema } from './contracts';

describe('projectRecordSchema', () => {
  it('should validate a complete project record', () => {
    const data = {
      repoId: '123',
      name: 'test-repo',
      owner: 'test-owner',
      url: 'https://github.com/test-owner/test-repo',
      summary: 'A test repository',
      language: 'TypeScript',
      license: 'MIT',
      topics: ['testing', 'typescript'],
      stars: 100,
      forks: 10,
      pushedAt: '2024-01-01T00:00:00Z',
      createdAt: '2023-06-01T00:00:00Z',
      last30dStars: 5,
      starGrowthRate: 0.05,
      activityScore: 85.5,
      recommendationScore: 90.0,
      recommendationReason: 'High quality project',
    };

    const result = projectRecordSchema.parse(data);
    expect(result).toEqual(data);
  });
});
