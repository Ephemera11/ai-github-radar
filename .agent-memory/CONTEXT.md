---
updated: 2026-07-10
last_agent: trae
---

# 项目背景

AI GitHub Radar 是一个用于发现和研究 AI 相关 GitHub 仓库的 TypeScript monorepo。项目不只按总 star 排序，而是重点关注增长趋势、近期活跃度和研究价值。

## 技术栈

| 模块 | 技术 |
| --- | --- |
| 前端 | React、TypeScript、Vite |
| 后端 | Express、TypeScript |
| 数据存储 | MySQL 接口类型，开发测试中使用 mock pool |
| 共享契约 | `packages/shared` 中的 zod schema 和 TypeScript 类型 |
| 测试 | Vitest、Testing Library、Playwright |
| 包管理 | npm workspaces |

## 目录结构

```text
ai-github-radar/
├── apps/
│   ├── api/      # Express API、推荐排序、仓库数据、研究记录
│   └── web/      # React 前端
├── packages/
│   └── shared/   # 共享 zod 契约、类型和仓库质量过滤
└── .agent-memory/
```

## 关键数据流

推荐列表当前优先来自 GitHub Search API，失败时再回退到本地 fixture：

```text
GitHub Search API (每个 Tab 用不同查询条件)
  -> apps/api/src/services/github.ts (按 sortType 选择 SearchConfig)
  -> packages/shared/src/repository-quality.ts 过滤不合格候选
  -> normalize.ts 转换为 ProjectRecord
  -> rank.ts sortProjectsByType 按对应策略排序
  -> routes/projects.ts 返回 /api/projects?sort=<sortType>

apps/api/src/fixtures/github-search.json
  -> 只作为开发和线上请求失败时的兜底示例数据
```

## Tab 数据获取与排序策略

四个 Tab 现在在数据获取层就使用不同的 GitHub Search 查询条件，而非仅排序不同：

| Tab | sortType | 查询条件 | 排序方式 | 说明 |
| --- | --- | --- | --- | --- |
| 综合推荐 | recommended | 广泛 AI 主题，stars:>500-1000 | recommendationScore | 综合考虑增长速率、活跃度、总星标、主题匹配 |
| 本周热度 | trending | 仅查近 7 天有推送的仓库 (pushed:>=7天前) | last30dStars | 捕捉本周活跃项目 |
| 历史高赞 | stars | 高 star 门槛 (stars:>10000-20000) | stars | 聚焦历史高赞项目 |
| 新上升项目 | rising | 仅查近 180 天创建的新项目 (created:>=180天前) | risingScore | 发掘新上升项目 |

搜索配置定义在 `apps/api/src/services/github.ts` 的 `buildSearchConfigs()` 函数中，每个 Tab 有独立的 queries、sort、order、perPage 参数。缓存按 sortType 分别存储。

## 当前重要决策

- 项目卡片标题在 `apps/web/src/components/ProjectCard.tsx` 中渲染，点击标题会用 `ProjectRecord.url` 打开 GitHub 仓库。
- “查看详情”按钮保留为应用内研究侧栏入口。
- 已知 404 或失效仓库要在 `packages/shared/src/repository-quality.ts` 排除，目前包括 `getomni-ai/omni` 和 `bubble-io/bubble-templates`。
- 推荐逻辑在 API 排序前先做候选质量过滤，前端 API client 也会兜底过滤，避免线上旧 API 仍返回失效仓库时继续展示。
- `apps/api/src/fixtures/github-search.json` 不是实时爬取数据，不应被描述为生产推荐源。
- Vercel 只部署静态前端，通过 `vercel.json` 的 `/api/:path*` rewrite 代理到腾讯云服务器 `http://1.15.145.150:8787/api/:path*`。

## 常用命令

本机若 `npm` 不在 PATH，可先临时加入 WorkBuddy Node：

```powershell
$env:PATH = 'C:\Users\WTY\.workbuddy\binaries\node\versions\22.22.2;' + $env:PATH
```

常用验证：

```powershell
npm --workspace @ai-radar/shared run test
npm --workspace @ai-radar/api run test
npm --workspace @ai-radar/web run test
npm run build
```
