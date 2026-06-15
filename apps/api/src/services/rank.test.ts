import { describe, it, expect } from 'vitest';
import { scoreProject, buildRecommendationReason } from './rank.js';

describe('scoreProject', () => {
  it('should return a low score for minimal values', () => {
    const score = scoreProject({
      stars: 0,
      last30dStars: 0,
      createdAt: '2020-01-01T00:00:00Z',
      pushedAt: '2020-01-01T00:00:00Z', // far in the past
      topicMatchScore: 0,
    });
    // starScore = log10(1)/5 ≈ 0
    // growthVelocity = 0
    // recencyScore ≈ 0 (very old)
    // topicMatchScore = 0
    // final ≈ 0
    expect(score).toBeCloseTo(0, 1);
  });

  it('should give much higher score for fast-growing projects', () => {
    const now = new Date().toISOString();

    // A project with steep growth curve (high last30dStars relative to total)
    const steepGrowth = scoreProject({
      stars: 50000,
      last30dStars: 3000,  // very active, steep curve: (3000*12)/50000 = 0.72
      createdAt: '2023-01-01T00:00:00Z',
      pushedAt: now,
      topicMatchScore: 0.9,
    });

    // A project with high total stars but flat growth
    const flatGrowth = scoreProject({
      stars: 150000,
      last30dStars: 100,  // barely any new stars: (100*12)/150000 = 0.008
      createdAt: '2022-01-01T00:00:00Z',
      pushedAt: now,
      topicMatchScore: 0.9,
    });

    expect(steepGrowth).toBeGreaterThan(flatGrowth);
  });

  it('should produce score between 0 and 1', () => {
    const now = new Date().toISOString();

    const score = scoreProject({
      stars: 50000,
      last30dStars: 800,
      createdAt: '2023-06-01T00:00:00Z',
      pushedAt: now,
      topicMatchScore: 0.9,
    });

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('should compute growthVelocity as primary factor', () => {
    const now = new Date().toISOString();

    // High growth velocity (steep curve)
    const highGrowth = scoreProject({
      stars: 30000,
      last30dStars: 2400,   // (2400*12)/30000 = 0.96 → growthVelocity = 1.0
      createdAt: '2023-01-01T00:00:00Z',
      pushedAt: now,
      topicMatchScore: 0,
    });

    // Low growth velocity (flat curve)
    const lowGrowth = scoreProject({
      stars: 100000,
      last30dStars: 50,     // (50*12)/100000 = 0.006 → growthVelocity ≈ 0.008
      createdAt: '2022-01-01T00:00:00Z',
      pushedAt: now,
      topicMatchScore: 0,
    });

    // The difference should be driven by growthVelocity (which has 0.5 weight)
    expect(highGrowth).toBeGreaterThan(lowGrowth + 0.3);
  });

  it('should compute recencyScore correctly for recent projects', () => {
    const now = new Date().toISOString();

    const score = scoreProject({
      stars: 0,
      last30dStars: 0,
      createdAt: '2020-01-01T00:00:00Z',
      pushedAt: now,
      topicMatchScore: 0,
    });
    // starScore ≈ 0, growthVelocity = 0
    // recencyScore = 1 - 0/30 = 1
    // final = 0*0.5 + 1*0.2 + 0*0.15 + 0*0.15 = 0.2
    expect(score).toBeCloseTo(0.2, 5);
  });

  it('should compute recencyScore correctly for old projects', () => {
    const score = scoreProject({
      stars: 0,
      last30dStars: 0,
      createdAt: '2020-01-01T00:00:00Z',
      pushedAt: '2020-01-01T00:00:00Z',
      topicMatchScore: 0,
    });
    // recencyScore should be close to 0
    expect(score).toBeLessThan(0.01);
  });

  it('should handle topicMatchScore weight correctly', () => {
    const now = new Date().toISOString();

    const scoreWithTopic = scoreProject({
      stars: 0,
      last30dStars: 0,
      createdAt: '2020-01-01T00:00:00Z',
      pushedAt: now,
      topicMatchScore: 1,
    });
    // final = 0*0.5 + 1*0.2 + 0*0.15 + 1*0.15 = 0.35

    const scoreNoTopic = scoreProject({
      stars: 0,
      last30dStars: 0,
      createdAt: '2020-01-01T00:00:00Z',
      pushedAt: now,
      topicMatchScore: 0,
    });
    // final = 0*0.5 + 1*0.2 + 0*0.15 + 0*0.15 = 0.2

    expect(scoreWithTopic).toBeCloseTo(0.35, 5);
    expect(scoreNoTopic).toBeCloseTo(0.2, 5);
  });

  it('should score a steep-growth small project higher than a flat-growth large one', () => {
    const now = new Date().toISOString();

    // Smaller project, steep curve
    const smallSteep = scoreProject({
      stars: 10000,
      last30dStars: 1000,    // (1000*12)/10000 = 1.2 → growthVelocity clamped to 1.0
      createdAt: '2024-01-01T00:00:00Z',
      pushedAt: now,
      topicMatchScore: 0.5,
    });

    // Large project, flat curve
    const largeFlat = scoreProject({
      stars: 180000,
      last30dStars: 100,     // (100*12)/180000 = 0.007 → growthVelocity ≈ 0.008
      createdAt: '2022-01-01T00:00:00Z',
      pushedAt: now,
      topicMatchScore: 0.5,
    });

    expect(smallSteep).toBeGreaterThan(largeFlat);
  });
});

describe('buildRecommendationReason', () => {
  it('should mention steep growth for very active projects', () => {
    const reason = buildRecommendationReason({
      stars: 100000,
      last30dStars: 2500,
      createdAt: '2023-01-01T00:00:00Z',
      topic: 'AI-Agents',
      recentlyUpdated: true,
    });

    expect(reason).toContain('增长曲线极其陡峭');
    expect(reason).toContain('近期仍在频繁更新');
    expect(reason).toContain('AI-Agents');
  });

  it('should mention strong growth for active projects', () => {
    const reason = buildRecommendationReason({
      stars: 50000,
      last30dStars: 900,
      createdAt: '2023-01-01T00:00:00Z',
      topic: 'Machine-Learning',
      recentlyUpdated: false,
    });

    expect(reason).toContain('增长趋势非常强劲');
    expect(reason).not.toContain('近期仍在频繁更新');
    expect(reason).toContain('Machine-Learning');
  });

  it('should mention stable growth for older projects', () => {
    const reason = buildRecommendationReason({
      stars: 100,
      last30dStars: 10,
      createdAt: '2023-01-01T00:00:00Z',
      topic: '',
      recentlyUpdated: true,
    });

    expect(reason).toContain('增长趋于平稳');
    expect(reason).toContain('近期仍在频繁更新');
    expect(reason).not.toContain('属于');
  });

  it('should handle high growth with medium stars', () => {
    const reason = buildRecommendationReason({
      stars: 15000,
      last30dStars: 800,
      createdAt: '2023-06-01T00:00:00Z',
      topic: 'LLM',
      recentlyUpdated: true,
    });

    expect(reason).toContain('增长趋势非常强劲');
    expect(reason).toContain('近期仍在频繁更新');
    expect(reason).toContain('LLM');
  });

  it('should return consistent string structure', () => {
    const reason = buildRecommendationReason({
      stars: 50000,
      last30dStars: 500,
      createdAt: '2023-01-01T00:00:00Z',
      topic: 'AI',
      recentlyUpdated: true,
    });

    expect(reason).toBeTruthy();
    expect(typeof reason).toBe('string');
    expect(reason.length).toBeGreaterThan(5);
  });
});
