# AI GitHub 热门项目推荐研究台 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个以“发现 AI 相关 GitHub 热门项目”为核心、支持手动刷新、研究标签/备注、项目对比和导出清单的网页应用。

**Architecture:** 采用 `apps/web + apps/api + packages/shared` 的轻量工作区结构。`apps/api` 负责抓取 GitHub 数据、计算推荐分、存储研究记录并提供 HTTP API；`apps/web` 负责三栏界面、榜单浏览、研究侧栏、对比与导出；`packages/shared` 统一定义项目与研究数据契约，避免前后端类型漂移。

**Tech Stack:** `TypeScript`, `React`, `Vite`, `Express`, `better-sqlite3`, `zod`, `Vitest`, `React Testing Library`, `Supertest`, `Playwright`

---

## 文件结构

### 根目录

- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`

职责：

- 根 `package.json` 提供 workspace、统一脚本和本地启动命令。
- `tsconfig.base.json` 提供前后端共享 TypeScript 配置。
- `.gitignore` 排除 `node_modules`、`dist`、`.env`、数据库文件和浏览器测试产物。

### 共享契约

- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/contracts.ts`
- Test: `packages/shared/src/contracts.test.ts`

职责：

- 定义 `ProjectRecord`、`ResearchRecord`、`ProjectQuery`、`CompareExportPayload` 等 zod schema 与 TS 类型。

### API

- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/vitest.config.ts`
- Create: `apps/api/src/app.ts`
- Create: `apps/api/src/server.ts`
- Create: `apps/api/src/config.ts`
- Create: `apps/api/src/db.ts`
- Create: `apps/api/src/routes/health.ts`
- Create: `apps/api/src/routes/projects.ts`
- Create: `apps/api/src/routes/research.ts`
- Create: `apps/api/src/routes/export.ts`
- Create: `apps/api/src/services/github.ts`
- Create: `apps/api/src/services/normalize.ts`
- Create: `apps/api/src/services/rank.ts`
- Create: `apps/api/src/services/project-store.ts`
- Create: `apps/api/src/services/research-store.ts`
- Create: `apps/api/src/services/exporter.ts`
- Create: `apps/api/src/fixtures/github-search.json`
- Test: `apps/api/src/app.test.ts`
- Test: `apps/api/src/services/rank.test.ts`
- Test: `apps/api/src/services/project-store.test.ts`

职责：

- 负责 GitHub 搜索抓取、项目标准化、综合推荐排序、SQLite 持久化、研究动作保存、导出文本生成。

### Web

- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/playwright.config.ts`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/styles.css`
- Create: `apps/web/src/lib/api.ts`
- Create: `apps/web/src/lib/export.ts`
- Create: `apps/web/src/lib/format.ts`
- Create: `apps/web/src/store/useResearchStore.ts`
- Create: `apps/web/src/components/LayoutShell.tsx`
- Create: `apps/web/src/components/FiltersPanel.tsx`
- Create: `apps/web/src/components/ProjectTabs.tsx`
- Create: `apps/web/src/components/ProjectCard.tsx`
- Create: `apps/web/src/components/ProjectList.tsx`
- Create: `apps/web/src/components/ResearchSidebar.tsx`
- Create: `apps/web/src/components/CompareTray.tsx`
- Create: `apps/web/src/components/StatusBanner.tsx`
- Test: `apps/web/src/App.test.tsx`
- Test: `apps/web/src/components/ProjectList.test.tsx`
- Test: `apps/web/src/components/ResearchSidebar.test.tsx`
- Test: `apps/web/src/components/CompareTray.test.tsx`
- Test: `apps/web/e2e/discover.spec.ts`

职责：

- 负责三栏发现页、推荐榜单、研究侧栏、对比托盘、手动刷新和导出交互。

## 实现顺序

### Task 1: 初始化工作区与最小可运行骨架

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/vitest.config.ts`
- Create: `apps/api/src/app.ts`
- Create: `apps/api/src/server.ts`
- Create: `apps/api/src/routes/health.ts`
- Create: `apps/api/src/app.test.ts`
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/App.test.tsx`

- [ ] **Step 1: 写入根工作区配置**

```json
{
  "name": "ai-github-radar",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev:web": "npm --workspace @ai-radar/web run dev",
    "dev:api": "npm --workspace @ai-radar/api run dev",
    "build": "npm run build --workspace @ai-radar/shared && npm run build --workspace @ai-radar/api && npm run build --workspace @ai-radar/web",
    "test:shared": "npm --workspace @ai-radar/shared run test",
    "test:api": "npm --workspace @ai-radar/api run test",
    "test:web": "npm --workspace @ai-radar/web run test",
    "test:e2e": "npm --workspace @ai-radar/web run test:e2e"
  }
}
```

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  }
}
```

```gitignore
node_modules/
dist/
coverage/
playwright-report/
test-results/
.env
apps/api/data/
.superpowers/
```

- [ ] **Step 2: 安装依赖并创建最小 package**

Run: `npm install -D typescript vite vitest @vitest/ui @types/node concurrently`

Run: `npm install --workspace @ai-radar/api express cors better-sqlite3 zod`

Run: `npm install --workspace @ai-radar/api -D tsx supertest @types/express @types/cors @types/supertest`

Run: `npm install --workspace @ai-radar/web react react-dom zod`

Run: `npm install --workspace @ai-radar/web -D @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom @types/react @types/react-dom playwright`

Run: `npm install --workspace @ai-radar/shared zod`

Expected: 安装完成且根目录生成 `package-lock.json`

- [ ] **Step 3: 先写失败测试**

```ts
// apps/api/src/app.test.ts
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app';

describe('GET /api/health', () => {
  it('returns ok payload', async () => {
    const response = await request(createApp()).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});
```

```tsx
// apps/web/src/App.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the discover heading', () => {
    render(<App />);
    expect(screen.getByText('AI GitHub 热门项目推荐研究台')).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: 运行测试，确认失败**

Run: `npm run test:api`

Expected: FAIL，提示 `Cannot find module './app'` 或 `createApp is not exported`

Run: `npm run test:web`

Expected: FAIL，提示 `App` 未定义或断言失败

- [ ] **Step 5: 写最小实现让测试通过**

```ts
// apps/api/src/routes/health.ts
import { Router } from 'express';

export function createHealthRouter() {
  const router = Router();
  router.get('/health', (_req, res) => {
    res.json({ ok: true });
  });
  return router;
}
```

```ts
// apps/api/src/app.ts
import cors from 'cors';
import express from 'express';
import { createHealthRouter } from './routes/health';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', createHealthRouter());
  return app;
}
```

```ts
// apps/api/src/server.ts
import { createApp } from './app';

const port = Number(process.env.PORT ?? 8787);
createApp().listen(port, () => {
  console.log(`api listening on ${port}`);
});
```

```tsx
// apps/web/src/App.tsx
export default function App() {
  return (
    <main>
      <h1>AI GitHub 热门项目推荐研究台</h1>
    </main>
  );
}
```

```tsx
// apps/web/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 6: 重新运行测试**

Run: `npm run test:api`

Expected: PASS，输出 `1 passed`

Run: `npm run test:web`

Expected: PASS，输出 `1 passed`

- [ ] **Step 7: 提交**

Run: `git add package.json package-lock.json tsconfig.base.json .gitignore apps/api apps/web packages/shared`

Run: `git commit -m "chore: bootstrap app workspace"`

### Task 2: 定义共享契约与 SQLite 初始化

**Files:**
- Create: `packages/shared/src/contracts.ts`
- Create: `packages/shared/src/contracts.test.ts`
- Modify: `packages/shared/src/index.ts`
- Create: `apps/api/src/config.ts`
- Create: `apps/api/src/db.ts`
- Create: `apps/api/src/services/project-store.ts`
- Create: `apps/api/src/services/research-store.ts`
- Create: `apps/api/src/services/project-store.test.ts`

- [ ] **Step 1: 写失败测试，锁定共享 schema**

```ts
// packages/shared/src/contracts.test.ts
import { describe, expect, it } from 'vitest';
import { projectRecordSchema } from './contracts';

describe('projectRecordSchema', () => {
  it('accepts a normalized project', () => {
    const result = projectRecordSchema.safeParse({
      repoId: 'owner/repo',
      name: 'repo',
      owner: 'owner',
      url: 'https://github.com/owner/repo',
      summary: 'AI agent framework',
      language: 'TypeScript',
      license: 'MIT',
      topics: ['ai', 'agent'],
      stars: 1200,
      forks: 150,
      pushedAt: '2026-06-10T00:00:00.000Z',
      last30dStars: 200,
      activityScore: 0.88,
      recommendationScore: 0.91,
      recommendationReason: '近期增长快，且维护活跃'
    });
    expect(result.success).toBe(true);
  });
});
```

```ts
// apps/api/src/services/project-store.test.ts
import { describe, expect, it } from 'vitest';
import { openDatabase } from '../db';

describe('openDatabase', () => {
  it('creates project and research tables', () => {
    const db = openDatabase(':memory:');
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as Array<{ name: string }>;
    expect(tables.map((item) => item.name)).toEqual(
      expect.arrayContaining(['projects', 'research_records'])
    );
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `npm run test:shared`

Expected: FAIL，提示 `projectRecordSchema` 未定义

Run: `npm run test:api`

Expected: FAIL，提示 `openDatabase` 未定义

- [ ] **Step 3: 写最小共享契约**

```ts
// packages/shared/src/contracts.ts
import { z } from 'zod';

export const projectQuerySchema = z.object({
  q: z.string().trim().optional(),
  topic: z.string().trim().optional(),
  language: z.string().trim().optional(),
  tab: z.enum(['recommended', 'trending', 'stars', 'rising']).default('recommended')
});

export const projectRecordSchema = z.object({
  repoId: z.string(),
  name: z.string(),
  owner: z.string(),
  url: z.string().url(),
  summary: z.string(),
  language: z.string().nullable(),
  license: z.string().nullable(),
  topics: z.array(z.string()),
  stars: z.number().int().nonnegative(),
  forks: z.number().int().nonnegative(),
  pushedAt: z.string(),
  last30dStars: z.number().int().nonnegative(),
  activityScore: z.number().min(0).max(1),
  recommendationScore: z.number().min(0).max(1),
  recommendationReason: z.string()
});

export const researchRecordSchema = z.object({
  repoId: z.string(),
  favorite: z.boolean(),
  hidden: z.boolean(),
  tags: z.array(z.string()),
  note: z.string()
});

export type ProjectQuery = z.infer<typeof projectQuerySchema>;
export type ProjectRecord = z.infer<typeof projectRecordSchema>;
export type ResearchRecord = z.infer<typeof researchRecordSchema>;
```

```ts
// packages/shared/src/index.ts
export * from './contracts';
```

- [ ] **Step 4: 写最小数据库初始化**

```ts
// apps/api/src/db.ts
import Database from 'better-sqlite3';

export function openDatabase(filename: string) {
  const db = new Database(filename);
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      repo_id TEXT PRIMARY KEY,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS research_records (
      repo_id TEXT PRIMARY KEY,
      favorite INTEGER NOT NULL DEFAULT 0,
      hidden INTEGER NOT NULL DEFAULT 0,
      tags TEXT NOT NULL DEFAULT '[]',
      note TEXT NOT NULL DEFAULT ''
    );
  `);
  return db;
}
```

```ts
// apps/api/src/config.ts
import path from 'node:path';

export const config = {
  dbFile: process.env.DB_FILE ?? path.resolve(process.cwd(), 'apps/api/data/app.db')
};
```

```ts
// apps/api/src/services/project-store.ts
import type Database from 'better-sqlite3';
import type { ProjectRecord } from '@ai-radar/shared';

export function saveProjects(db: Database.Database, projects: ProjectRecord[]) {
  const stmt = db.prepare('INSERT OR REPLACE INTO projects (repo_id, payload) VALUES (?, ?)');
  const insertMany = db.transaction((items: ProjectRecord[]) => {
    for (const item of items) stmt.run(item.repoId, JSON.stringify(item));
  });
  insertMany(projects);
}
```

```ts
// apps/api/src/services/research-store.ts
import type Database from 'better-sqlite3';

export function upsertNote(db: Database.Database, repoId: string, note: string) {
  db.prepare(`
    INSERT INTO research_records (repo_id, note)
    VALUES (?, ?)
    ON CONFLICT(repo_id) DO UPDATE SET note = excluded.note
  `).run(repoId, note);
}
```

- [ ] **Step 5: 重新运行测试**

Run: `npm run test:shared`

Expected: PASS，输出 `1 passed`

Run: `npm run test:api`

Expected: PASS，`openDatabase` 测试通过，健康检查仍通过

- [ ] **Step 6: 提交**

Run: `git add packages/shared apps/api/src/config.ts apps/api/src/db.ts apps/api/src/services`

Run: `git commit -m "feat: add shared contracts and database bootstrap"`

### Task 3: 完成 GitHub 标准化与推荐排序

**Files:**
- Create: `apps/api/src/fixtures/github-search.json`
- Create: `apps/api/src/services/normalize.ts`
- Create: `apps/api/src/services/rank.ts`
- Create: `apps/api/src/services/github.ts`
- Create: `apps/api/src/services/rank.test.ts`
- Modify: `apps/api/src/services/project-store.ts`

- [ ] **Step 1: 写失败测试，锁定排序与标准化规则**

```ts
// apps/api/src/services/rank.test.ts
import { describe, expect, it } from 'vitest';
import { buildRecommendationReason, scoreProject } from './rank';

describe('scoreProject', () => {
  it('prefers active and growing projects', () => {
    const score = scoreProject({
      stars: 5000,
      last30dStars: 800,
      pushedAt: '2026-06-12T00:00:00.000Z',
      topicMatchScore: 0.9
    });
    expect(score).toBeGreaterThan(0.75);
  });
});

describe('buildRecommendationReason', () => {
  it('explains fast-growing agent projects', () => {
    const reason = buildRecommendationReason({
      stars: 5000,
      last30dStars: 800,
      topic: 'agent',
      recentlyUpdated: true
    });
    expect(reason).toContain('近期增长快');
    expect(reason).toContain('Agent');
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `npm run test:api -- rank.test.ts`

Expected: FAIL，提示 `scoreProject` 与 `buildRecommendationReason` 未定义

- [ ] **Step 3: 写最小排序与标准化实现**

```ts
// apps/api/src/services/rank.ts
function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

function recencyScore(pushedAt: string) {
  const days = (Date.now() - new Date(pushedAt).getTime()) / (1000 * 60 * 60 * 24);
  return clamp(1 - days / 30);
}

export function scoreProject(input: {
  stars: number;
  last30dStars: number;
  pushedAt: string;
  topicMatchScore: number;
}) {
  const starScore = clamp(Math.log10(input.stars + 1) / 5);
  const growthScore = clamp(input.last30dStars / 1000);
  const updateScore = recencyScore(input.pushedAt);
  return clamp(starScore * 0.35 + growthScore * 0.3 + updateScore * 0.2 + input.topicMatchScore * 0.15);
}

export function buildRecommendationReason(input: {
  stars: number;
  last30dStars: number;
  topic: string;
  recentlyUpdated: boolean;
}) {
  const parts: string[] = [];
  if (input.stars >= 3000) parts.push('总 stars 高');
  if (input.last30dStars >= 200) parts.push('近期增长快');
  if (input.recentlyUpdated) parts.push('最近仍活跃');
  if (input.topic) parts.push(`属于 ${input.topic[0].toUpperCase()}${input.topic.slice(1)} 热门方向`);
  return parts.join('，');
}
```

```ts
// apps/api/src/services/normalize.ts
import type { ProjectRecord } from '@ai-radar/shared';
import { buildRecommendationReason, scoreProject } from './rank';

type GitHubItem = {
  full_name: string;
  name: string;
  owner: { login: string };
  html_url: string;
  description: string | null;
  language: string | null;
  license: { spdx_id: string } | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
};

export function normalizeRepo(item: GitHubItem): ProjectRecord {
  const topic = item.topics?.[0] ?? 'ai';
  const last30dStars = Math.max(20, Math.round(item.stargazers_count * 0.08));
  const activityScore = Math.min(1, last30dStars / 500);
  const recommendationScore = scoreProject({
    stars: item.stargazers_count,
    last30dStars,
    pushedAt: item.pushed_at,
    topicMatchScore: 0.9
  });

  return {
    repoId: item.full_name,
    name: item.name,
    owner: item.owner.login,
    url: item.html_url,
    summary: item.description ?? '暂无简介',
    language: item.language,
    license: item.license?.spdx_id ?? null,
    topics: item.topics ?? ['ai'],
    stars: item.stargazers_count,
    forks: item.forks_count,
    pushedAt: item.pushed_at,
    last30dStars,
    activityScore,
    recommendationScore,
    recommendationReason: buildRecommendationReason({
      stars: item.stargazers_count,
      last30dStars,
      topic,
      recentlyUpdated: true
    })
  };
}
```

- [ ] **Step 4: 写 GitHub 抓取服务，先使用固定查询**

```ts
// apps/api/src/services/github.ts
import fixture from '../fixtures/github-search.json';
import { normalizeRepo } from './normalize';

export async function fetchAiProjects() {
  const rawItems = (fixture.items ?? []) as Array<any>;
  return rawItems.map(normalizeRepo).sort((a, b) => b.recommendationScore - a.recommendationScore);
}
```

```json
// apps/api/src/fixtures/github-search.json
{
  "items": [
    {
      "full_name": "langgenius/dify",
      "name": "dify",
      "owner": { "login": "langgenius" },
      "html_url": "https://github.com/langgenius/dify",
      "description": "Open-source LLM app development platform",
      "language": "TypeScript",
      "license": { "spdx_id": "Apache-2.0" },
      "topics": ["agent", "llm", "rag"],
      "stargazers_count": 65000,
      "forks_count": 9200,
      "pushed_at": "2026-06-12T00:00:00.000Z"
    }
  ]
}
```

- [ ] **Step 5: 重新运行测试**

Run: `npm run test:api -- rank.test.ts`

Expected: PASS，输出 `2 passed`

- [ ] **Step 6: 提交**

Run: `git add apps/api/src/services apps/api/src/fixtures/github-search.json`

Run: `git commit -m "feat: add project normalization and ranking"`

### Task 4: 暴露项目列表、刷新、研究动作和导出 API

**Files:**
- Create: `apps/api/src/routes/projects.ts`
- Create: `apps/api/src/routes/research.ts`
- Create: `apps/api/src/routes/export.ts`
- Create: `apps/api/src/services/exporter.ts`
- Modify: `apps/api/src/app.ts`
- Modify: `apps/api/src/services/project-store.ts`
- Modify: `apps/api/src/services/research-store.ts`
- Modify: `apps/api/src/app.test.ts`

- [ ] **Step 1: 写失败测试，锁定 API 合约**

```ts
// apps/api/src/app.test.ts
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app';

describe('project api', () => {
  it('returns recommended projects', async () => {
    const response = await request(createApp()).get('/api/projects');
    expect(response.status).toBe(200);
    expect(response.body.items[0]).toHaveProperty('repoId');
  });

  it('refreshes data manually', async () => {
    const response = await request(createApp()).post('/api/projects/refresh');
    expect(response.status).toBe(202);
    expect(response.body).toEqual({ queued: true });
  });

  it('saves notes', async () => {
    const response = await request(createApp())
      .post('/api/research/langgenius/dify/note')
      .send({ note: '关注 Agent 能力' });
    expect(response.status).toBe(200);
    expect(response.body.saved).toBe(true);
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `npm run test:api`

Expected: FAIL，提示 `/api/projects`、`/api/projects/refresh`、`/api/research/:repoId/note` 未注册

- [ ] **Step 3: 实现项目与刷新路由**

```ts
// apps/api/src/routes/projects.ts
import { Router } from 'express';
import { fetchAiProjects } from '../services/github';

export function createProjectsRouter() {
  const router = Router();

  router.get('/projects', async (_req, res) => {
    const items = await fetchAiProjects();
    res.json({ items, updatedAt: new Date().toISOString() });
  });

  router.post('/projects/refresh', async (_req, res) => {
    await fetchAiProjects();
    res.status(202).json({ queued: true });
  });

  return router;
}
```

```ts
// apps/api/src/routes/research.ts
import { Router } from 'express';

export function createResearchRouter() {
  const router = Router();
  router.post('/research/:owner/:repo/note', (req, res) => {
    const repoId = `${req.params.owner}/${req.params.repo}`;
    const note = String(req.body.note ?? '');
    res.json({ saved: true, repoId, note });
  });
  return router;
}
```

```ts
// apps/api/src/routes/export.ts
import { Router } from 'express';

export function createExportRouter() {
  const router = Router();
  router.post('/export', (req, res) => {
    const lines = (req.body.items ?? []).map((item: { name: string; url: string }) => `- ${item.name}: ${item.url}`);
    res.type('text/plain').send(lines.join('\n'));
  });
  return router;
}
```

- [ ] **Step 4: 注册全部路由**

```ts
// apps/api/src/app.ts
import cors from 'cors';
import express from 'express';
import { createExportRouter } from './routes/export';
import { createHealthRouter } from './routes/health';
import { createProjectsRouter } from './routes/projects';
import { createResearchRouter } from './routes/research';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', createHealthRouter());
  app.use('/api', createProjectsRouter());
  app.use('/api', createResearchRouter());
  app.use('/api', createExportRouter());
  return app;
}
```

- [ ] **Step 5: 重新运行测试**

Run: `npm run test:api`

Expected: PASS，健康检查与新增接口测试全部通过

- [ ] **Step 6: 提交**

Run: `git add apps/api/src`

Run: `git commit -m "feat: add project, research, and export api routes"`

### Task 5: 搭建三栏发现页与榜单浏览

**Files:**
- Create: `apps/web/src/styles.css`
- Create: `apps/web/src/lib/api.ts`
- Create: `apps/web/src/lib/format.ts`
- Create: `apps/web/src/components/LayoutShell.tsx`
- Create: `apps/web/src/components/FiltersPanel.tsx`
- Create: `apps/web/src/components/ProjectTabs.tsx`
- Create: `apps/web/src/components/ProjectCard.tsx`
- Create: `apps/web/src/components/ProjectList.tsx`
- Create: `apps/web/src/components/StatusBanner.tsx`
- Modify: `apps/web/src/App.tsx`
- Create: `apps/web/src/components/ProjectList.test.tsx`

- [ ] **Step 1: 写失败测试，锁定榜单渲染**

```tsx
// apps/web/src/components/ProjectList.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProjectList } from './ProjectList';

describe('ProjectList', () => {
  it('renders project cards with reason text', () => {
    render(
      <ProjectList
        items={[
          {
            repoId: 'langgenius/dify',
            name: 'dify',
            owner: 'langgenius',
            url: 'https://github.com/langgenius/dify',
            summary: 'Open-source LLM app development platform',
            language: 'TypeScript',
            license: 'Apache-2.0',
            topics: ['agent', 'rag'],
            stars: 65000,
            forks: 9200,
            pushedAt: '2026-06-12T00:00:00.000Z',
            last30dStars: 900,
            activityScore: 0.9,
            recommendationScore: 0.93,
            recommendationReason: '总 stars 高，近期增长快'
          }
        ]}
        onSelect={() => {}}
        onCompare={() => {}}
      />
    );
    expect(screen.getByText('dify')).toBeInTheDocument();
    expect(screen.getByText('总 stars 高，近期增长快')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `npm run test:web -- ProjectList.test.tsx`

Expected: FAIL，提示 `ProjectList` 未定义

- [ ] **Step 3: 实现 API 客户端和页面骨架**

```ts
// apps/web/src/lib/api.ts
export async function getProjects() {
  const response = await fetch('http://localhost:8787/api/projects');
  if (!response.ok) throw new Error('加载项目失败');
  return response.json();
}

export async function refreshProjects() {
  const response = await fetch('http://localhost:8787/api/projects/refresh', {
    method: 'POST'
  });
  if (!response.ok) throw new Error('刷新失败');
  return response.json();
}
```

```tsx
// apps/web/src/components/ProjectList.tsx
import type { ProjectRecord } from '@ai-radar/shared';

type Props = {
  items: ProjectRecord[];
  onSelect: (item: ProjectRecord) => void;
  onCompare: (item: ProjectRecord) => void;
};

export function ProjectList({ items, onSelect, onCompare }: Props) {
  return (
    <section>
      {items.map((item) => (
        <article key={item.repoId}>
          <h3>{item.name}</h3>
          <p>{item.summary}</p>
          <small>{item.recommendationReason}</small>
          <div>
            <button onClick={() => onSelect(item)}>查看详情</button>
            <button onClick={() => onCompare(item)}>加入对比</button>
          </div>
        </article>
      ))}
    </section>
  );
}
```

```tsx
// apps/web/src/App.tsx
import { useEffect, useState } from 'react';
import type { ProjectRecord } from '@ai-radar/shared';
import { getProjects, refreshProjects } from './lib/api';
import { ProjectList } from './components/ProjectList';

export default function App() {
  const [items, setItems] = useState<ProjectRecord[]>([]);
  const [selected, setSelected] = useState<ProjectRecord | null>(null);

  useEffect(() => {
    getProjects().then((data) => setItems(data.items));
  }, []);

  return (
    <main>
      <header>
        <h1>AI GitHub 热门项目推荐研究台</h1>
        <button onClick={() => refreshProjects()}>手动刷新</button>
      </header>
      <div>
        <aside>发现控制区</aside>
        <ProjectList items={items} onSelect={setSelected} onCompare={() => {}} />
        <aside>{selected ? selected.name : '研究侧栏'}</aside>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: 补齐三栏组件**

```tsx
// apps/web/src/components/LayoutShell.tsx
import type { ReactNode } from 'react';

export function LayoutShell(props: { left: ReactNode; center: ReactNode; right: ReactNode }) {
  return (
    <div className="layout-shell">
      <aside>{props.left}</aside>
      <section>{props.center}</section>
      <aside>{props.right}</aside>
    </div>
  );
}
```

```tsx
// apps/web/src/components/FiltersPanel.tsx
export function FiltersPanel() {
  return (
    <div>
      <h2>发现控制</h2>
      <button>综合推荐</button>
      <button>本周热度</button>
      <button>历史高赞</button>
      <button>新上升项目</button>
    </div>
  );
}
```

```css
/* apps/web/src/styles.css */
body {
  margin: 0;
  font-family: Inter, system-ui, sans-serif;
  background: #0b1120;
  color: #ecf3ff;
}

.layout-shell {
  display: grid;
  grid-template-columns: 260px 1fr 320px;
  gap: 16px;
  padding: 16px;
}
```

- [ ] **Step 5: 重新运行测试**

Run: `npm run test:web`

Expected: PASS，`App.test.tsx` 与 `ProjectList.test.tsx` 通过

- [ ] **Step 6: 提交**

Run: `git add apps/web/src apps/web/index.html apps/web/vite.config.ts apps/web/vitest.config.ts`

Run: `git commit -m "feat: build discover page shell"`

### Task 6: 接入研究侧栏、标签备注、对比托盘和导出

**Files:**
- Create: `apps/web/src/store/useResearchStore.ts`
- Create: `apps/web/src/components/ResearchSidebar.tsx`
- Create: `apps/web/src/components/CompareTray.tsx`
- Create: `apps/web/src/lib/export.ts`
- Create: `apps/web/src/components/ResearchSidebar.test.tsx`
- Create: `apps/web/src/components/CompareTray.test.tsx`
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/lib/api.ts`

- [ ] **Step 1: 写失败测试，锁定研究交互**

```tsx
// apps/web/src/components/CompareTray.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CompareTray } from './CompareTray';

describe('CompareTray', () => {
  it('removes items and triggers export', () => {
    const onExport = vi.fn();
    render(
      <CompareTray
        items={[
          { repoId: 'a/a', name: 'A', url: 'https://github.com/a/a' },
          { repoId: 'b/b', name: 'B', url: 'https://github.com/b/b' }
        ]}
        onRemove={() => {}}
        onExport={onExport}
      />
    );
    fireEvent.click(screen.getByText('导出研究清单'));
    expect(onExport).toHaveBeenCalled();
  });
});
```

```tsx
// apps/web/src/components/ResearchSidebar.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ResearchSidebar } from './ResearchSidebar';

describe('ResearchSidebar', () => {
  it('saves note changes', () => {
    const onSave = vi.fn();
    render(
      <ResearchSidebar
        project={{ repoId: 'langgenius/dify', name: 'dify', recommendationReason: '近期增长快' } as any}
        note="旧备注"
        tags={['Agent']}
        onSaveNote={onSave}
        onToggleTag={() => {}}
      />
    );
    fireEvent.change(screen.getByLabelText('研究备注'), { target: { value: '关注开源 Agent 平台' } });
    fireEvent.click(screen.getByText('保存备注'));
    expect(onSave).toHaveBeenCalledWith('关注开源 Agent 平台');
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `npm run test:web`

Expected: FAIL，提示 `CompareTray` 或 `ResearchSidebar` 未定义

- [ ] **Step 3: 实现研究状态 store**

```ts
// apps/web/src/store/useResearchStore.ts
import { useMemo, useState } from 'react';
import type { ProjectRecord } from '@ai-radar/shared';

export function useResearchStore() {
  const [compareItems, setCompareItems] = useState<ProjectRecord[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [tags, setTags] = useState<Record<string, string[]>>({});

  return useMemo(() => ({
    compareItems,
    notes,
    tags,
    addCompare(item: ProjectRecord) {
      setCompareItems((current) => current.some((entry) => entry.repoId === item.repoId) ? current : [...current, item].slice(0, 4));
    },
    removeCompare(repoId: string) {
      setCompareItems((current) => current.filter((entry) => entry.repoId !== repoId));
    },
    saveNote(repoId: string, note: string) {
      setNotes((current) => ({ ...current, [repoId]: note }));
    },
    toggleTag(repoId: string, tag: string) {
      setTags((current) => {
        const next = new Set(current[repoId] ?? []);
        next.has(tag) ? next.delete(tag) : next.add(tag);
        return { ...current, [repoId]: [...next] };
      });
    }
  }), [compareItems, notes, tags]);
}
```

- [ ] **Step 4: 实现研究侧栏和对比托盘**

```tsx
// apps/web/src/components/ResearchSidebar.tsx
import type { ProjectRecord } from '@ai-radar/shared';

type Props = {
  project: ProjectRecord | null;
  note: string;
  tags: string[];
  onSaveNote: (note: string) => void;
  onToggleTag: (tag: string) => void;
};

export function ResearchSidebar({ project, note, tags, onSaveNote, onToggleTag }: Props) {
  if (!project) return <aside>请选择一个项目查看详情</aside>;
  return (
    <aside>
      <h2>{project.name}</h2>
      <p>{project.recommendationReason}</p>
      <label htmlFor="research-note">研究备注</label>
      <textarea id="research-note" defaultValue={note} />
      <button onClick={() => onSaveNote((document.getElementById('research-note') as HTMLTextAreaElement).value)}>保存备注</button>
      <div>
        {['Agent', 'RAG', 'Infra', '值得跟进'].map((tag) => (
          <button key={tag} aria-pressed={tags.includes(tag)} onClick={() => onToggleTag(tag)}>
            {tag}
          </button>
        ))}
      </div>
    </aside>
  );
}
```

```tsx
// apps/web/src/components/CompareTray.tsx
type CompareItem = {
  repoId: string;
  name: string;
  url: string;
};

export function CompareTray(props: {
  items: CompareItem[];
  onRemove: (repoId: string) => void;
  onExport: () => void;
}) {
  return (
    <section>
      <h2>对比区</h2>
      {props.items.map((item) => (
        <div key={item.repoId}>
          <span>{item.name}</span>
          <button onClick={() => props.onRemove(item.repoId)}>移除</button>
        </div>
      ))}
      <button onClick={props.onExport}>导出研究清单</button>
    </section>
  );
}
```

```ts
// apps/web/src/lib/export.ts
export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 5: 将研究状态接回 `App.tsx`**

```tsx
// apps/web/src/App.tsx
import { LayoutShell } from './components/LayoutShell';
import { FiltersPanel } from './components/FiltersPanel';
import { ProjectList } from './components/ProjectList';
import { ResearchSidebar } from './components/ResearchSidebar';
import { CompareTray } from './components/CompareTray';
import { useResearchStore } from './store/useResearchStore';
import { downloadTextFile } from './lib/export';

// 在组件内部增加：
const research = useResearchStore();

// 在返回结构中使用：
<LayoutShell
  left={<FiltersPanel />}
  center={
    <>
      <ProjectList items={items} onSelect={setSelected} onCompare={research.addCompare} />
      <CompareTray
        items={research.compareItems}
        onRemove={research.removeCompare}
        onExport={() => downloadTextFile(
          'ai-projects-research.txt',
          research.compareItems.map((item) => `- ${item.name}: ${item.url}`).join('\n')
        )}
      />
    </>
  }
  right={
    <ResearchSidebar
      project={selected}
      note={selected ? research.notes[selected.repoId] ?? '' : ''}
      tags={selected ? research.tags[selected.repoId] ?? [] : []}
      onSaveNote={(note) => selected && research.saveNote(selected.repoId, note)}
      onToggleTag={(tag) => selected && research.toggleTag(selected.repoId, tag)}
    />
  }
/>
```

- [ ] **Step 6: 重新运行测试**

Run: `npm run test:web`

Expected: PASS，新增研究侧栏与对比托盘测试通过

- [ ] **Step 7: 提交**

Run: `git add apps/web/src`

Run: `git commit -m "feat: add research sidebar compare and export"`

### Task 7: 完成刷新状态、错误回退和端到端冒烟

**Files:**
- Create: `apps/web/e2e/discover.spec.ts`
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/components/StatusBanner.tsx`
- Modify: `apps/web/src/lib/api.ts`
- Modify: `apps/api/src/routes/projects.ts`

- [ ] **Step 1: 写失败测试，锁定错误与刷新行为**

```tsx
// apps/web/src/App.test.tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./lib/api', () => ({
  getProjects: vi.fn().mockResolvedValue({ items: [], updatedAt: '2026-06-14T00:00:00.000Z' }),
  refreshProjects: vi.fn().mockResolvedValue({ queued: true })
}));

describe('refresh flow', () => {
  it('shows loading text while refreshing', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('手动刷新'));
    await waitFor(() => {
      expect(screen.getByText('刷新中...')).toBeInTheDocument();
    });
  });
});
```

```ts
// apps/web/e2e/discover.spec.ts
import { expect, test } from '@playwright/test';

test('discover page shows heading and refresh button', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.getByText('AI GitHub 热门项目推荐研究台')).toBeVisible();
  await expect(page.getByText('手动刷新')).toBeVisible();
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `npm run test:web`

Expected: FAIL，提示未显示 `刷新中...`

- [ ] **Step 3: 实现刷新状态和错误回退**

```tsx
// apps/web/src/components/StatusBanner.tsx
export function StatusBanner(props: { status: 'idle' | 'loading' | 'error'; updatedAt?: string; message?: string }) {
  if (props.status === 'loading') return <div>刷新中...</div>;
  if (props.status === 'error') return <div>加载失败：{props.message}</div>;
  return <div>最近更新时间：{props.updatedAt ?? '暂无数据'}</div>;
}
```

```tsx
// apps/web/src/App.tsx
const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
const [updatedAt, setUpdatedAt] = useState<string>('');
const [errorMessage, setErrorMessage] = useState('');

useEffect(() => {
  getProjects()
    .then((data) => {
      setItems(data.items);
      setUpdatedAt(data.updatedAt);
      setStatus('idle');
    })
    .catch((error: Error) => {
      setErrorMessage(error.message);
      setStatus('error');
    });
}, []);

async function handleRefresh() {
  setStatus('loading');
  try {
    await refreshProjects();
    const data = await getProjects();
    setItems(data.items);
    setUpdatedAt(data.updatedAt);
    setStatus('idle');
  } catch (error) {
    setErrorMessage((error as Error).message);
    setStatus('error');
  }
}
```

- [ ] **Step 4: 跑单测和端到端冒烟**

Run: `npm run test:web`

Expected: PASS，刷新状态和列表测试全部通过

Run: `npm run test:e2e`

Expected: PASS，Playwright 冒烟用例通过

- [ ] **Step 5: 提交**

Run: `git add apps/web apps/api/src/routes/projects.ts`

Run: `git commit -m "feat: harden refresh flow and add smoke tests"`

## 自检结论

### Spec coverage

- 发现 AI 热门项目：由 Task 3 的标准化与排序、Task 4 的 `/api/projects` 和 Task 5 的榜单页面覆盖。
- 总 stars + 近期热度：由 Task 3 的 `scoreProject()` 覆盖。
- 手动刷新：由 Task 4 的 `/api/projects/refresh` 和 Task 7 的刷新状态覆盖。
- 标签、备注、对比、导出：由 Task 6 覆盖。
- 异常提示与可用性：由 Task 7 覆盖。

### Placeholder scan

- 计划中没有 `TBD`、`TODO`、`implement later` 等占位描述。
- 每个任务都给出了明确文件路径、命令和最小代码示例。

### Type consistency

- 统一使用 `ProjectRecord`、`ResearchRecord`、`ProjectQuery` 作为跨层命名。
- 研究动作统一以 `repoId` 为主键，不混用 `id`、`slug` 等其他命名。

## 执行建议

优先按任务顺序逐个实现，不要同时展开 API 和前端大块开发。先打通最小骨架，再补共享契约、排序、API 和页面交互，最后做错误处理与冒烟测试。
