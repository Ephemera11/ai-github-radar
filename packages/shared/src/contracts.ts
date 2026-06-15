import { z } from 'zod';

export const projectQuerySchema = z.object({
  q: z.string().optional(),
  topic: z.string().optional(),
  language: z.string().optional(),
  tab: z.enum(['recommended', 'trending', 'stars', 'rising']),
});

export const projectRecordSchema = z.object({
  repoId: z.string(),
  name: z.string(),
  owner: z.string(),
  url: z.string(),
  summary: z.string(),
  language: z.string(),
  license: z.string(),
  topics: z.array(z.string()),
  stars: z.number().int().nonnegative(),
  forks: z.number().int().nonnegative(),
  pushedAt: z.string(),
  createdAt: z.string(),
  last30dStars: z.number().int().nonnegative(),
  starGrowthRate: z.number().min(0).max(1),
  activityScore: z.number(),
  recommendationScore: z.number(),
  recommendationReason: z.string(),
});

export const researchRecordSchema = z.object({
  repoId: z.string(),
  favorite: z.boolean(),
  hidden: z.boolean(),
  tags: z.array(z.string()),
  note: z.string(),
});

export type ProjectQuery = z.infer<typeof projectQuerySchema>;
export type ProjectRecord = z.infer<typeof projectRecordSchema>;
export type ResearchRecord = z.infer<typeof researchRecordSchema>;
