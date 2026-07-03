# AI GitHub Radar

AI GitHub Radar 是一个用于发现和研究 AI 应用层开源项目的工具。它不只按总 star 排序，而是结合近期增长、活跃度、主题匹配和研究价值生成推荐列表。

![status](https://img.shields.io/badge/status-active-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 核心特性

- **实时推荐源**：后端优先从 GitHub Search API 获取仓库，失败时回退到本地 fixture。
- **趋势优先排序**：用近 30 天增长、最近推送时间、总 star 和主题匹配计算推荐分。
- **研究工作台**：支持查看详情、收藏、标签、备注、对比和导出。
- **失效仓库过滤**：已知 404 或 URL 不合法的仓库会在排序和渲染前过滤。
- **手动添加收藏**：可粘贴 GitHub 仓库链接，加入自己的研究列表。

## 系统架构

```text
ai-github-radar/
├── apps/
│   ├── api/          # Express API 服务，默认端口 8787
│   │   └── src/
│   │       ├── routes/       # 项目列表、研究动作、导出
│   │       ├── services/     # GitHub 数据源、排序、存储
│   │       └── fixtures/     # 开发和 API 失败时的兜底示例数据
│   └── web/          # React 前端，默认端口 5173
│       └── src/
│           ├── components/   # LayoutShell、ProjectCard、FiltersPanel 等
│           ├── lib/          # API 请求、格式化、导出工具
│           └── store/        # 研究状态管理
├── packages/
│   └── shared/       # 共享契约、类型和仓库质量过滤
└── .agent-memory/    # Agent 协作记忆
```

## 推荐数据流

```text
GitHub Search API
  -> apps/api/src/services/github.ts
  -> packages/shared/src/repository-quality.ts
  -> apps/api/src/services/normalize.ts
  -> apps/api/src/services/rank.ts
  -> /api/projects
```

`apps/api/src/fixtures/github-search.json` 不是实时数据源，只用于开发和线上 GitHub API 请求失败时兜底。

## 环境变量

- `GITHUB_TOKEN`：可选，用于提高 GitHub API 访问限额。
- `GITHUB_SEARCH_QUERIES`：可选，自定义 GitHub 搜索语句，多个查询用英文分号分隔。
- `GITHUB_SEARCH_CACHE_TTL_MS`：可选，推荐列表缓存时间，默认 10 分钟。

## 本地开发

要求：

- Node.js 20+
- npm

启动：

```bash
npm install
npm run dev:api
npm run dev:web
```

测试和构建：

```bash
npm --workspace @ai-radar/shared run test
npm --workspace @ai-radar/api run test
npm --workspace @ai-radar/web run test
npm run build
```

## 部署说明

Vercel 部署静态前端，并通过 `vercel.json` 将 `/api/:path*` 转发到腾讯云 API 服务。

## 许可证

MIT
