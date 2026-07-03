---
updated: 2026-07-03
last_agent: codex
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
│   └── shared/   # 共享 zod 契约和类型
└── .agent-memory/
```

## 关键数据流

推荐列表当前来自：

```text
apps/api/src/fixtures/github-search.json
  -> apps/api/src/services/github.ts
  -> packages/shared/src/repository-quality.ts 过滤不合格候选
  -> normalize.ts 转换为 ProjectRecord
  -> rank.ts 计算 recommendationScore
  -> routes/projects.ts 返回 /api/projects
```

## 当前重要决策

- 项目卡片标题在 `apps/web/src/components/ProjectCard.tsx` 中渲染，点击标题会用 `ProjectRecord.url` 打开 GitHub 仓库。
- “查看详情”按钮仍保留为应用内研究侧栏入口。
- `getomni-ai/omni` 当前访问 GitHub 返回 404，已在共享推荐候选质量过滤中排除。
- 推荐逻辑在 API 排序前先做候选质量过滤，前端 API client 也会兜底过滤，避免线上旧 API 仍返回失效仓库时继续展示。
- 前端样式集中在 `apps/web/src/styles.css`。

## 常用命令

本机若 `npm` 不在 PATH，可先临时加入 WorkBuddy Node：

```powershell
$env:PATH = 'C:\Users\WTY\.workbuddy\binaries\node\versions\22.22.2;' + $env:PATH
```

常用验证：

```powershell
npm --workspace @ai-radar/api run test
npm --workspace @ai-radar/web run test
npm run build
```
