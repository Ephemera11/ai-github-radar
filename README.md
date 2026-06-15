# AI GitHub Radar

AI GitHub Radar 是一个基于增长趋势发现热门 AI 开源项目的研究工具。它不按总星标排序，而是通过分析项目的**增长曲线陡峭程度**，帮你找到正在快速崛起、值得关注的应用层 AI 项目。

![screenshot](https://img.shields.io/badge/status-active-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 核心特性

- **趋势优先排序** — 专有算法优先计算近 30 天增长速率，而非累计星标，让"正在变热"的项目排在最前面
- **三栏研究工作台** — 发现控制 → 推荐榜单 → 研究侧栏，一条完整的探索与研究工作流
- **项目研究助手** — 收藏项目、打标签、写备注、加入对比，支持导出研究清单
- **不感兴趣过滤** — 标记不感兴趣的项目可自动隐藏，刷新后有新项目替补
- **手动添加收藏** — 粘贴任意 GitHub 链接即可收藏并追踪自己关注的项目

## 系统架构

```
ai-github-radar/
├── apps/
│   ├── api/          # Express API 服务（端口 8787）
│   │   ├── src/
│   │   │   ├── routes/       # 路由：项目列表、研究动作、导出
│   │   │   ├── services/     # 核心：排名算法、GitHub 数据、存储
│   │   │   └── fixtures/     # 22 个知名 AI 应用层项目示例数据
│   │   └── data/             # SQLite 数据库（自动创建）
│   └── web/          # React 前端（端口 5173）
│       └── src/
│           ├── components/   # LayoutShell、ProjectCard、FiltersPanel 等
│           ├── lib/          # API 请求、格式化、导出工具
│           └── store/        # 研究状态管理（对比、标签、备注）
└── packages/
    └── shared/       # 共享契约（zod 类型定义）
```

## 增长排名算法

综合推荐分 = 四个信号加权求和，核心看**增长曲线的陡峭程度**：

| 因子 | 权重 | 计算方式 |
|---|---|---|
| 增长速率 | **50%** | `(近30天新增 × 12) / 总星标`，年化增长率反映曲线陡峭程度 |
| 近期活跃度 | 20% | 距离最后推送的天数，30 天内更新的拿满分 |
| 总星标 | 15% | `log10(stars+1)/5`，对数缩放，仅作参考基线 |
| 主题匹配度 | 15% | 默认 0.9，后续可动态调整 |

## 本地开发

### 要求

- Node.js 20+
- npm

### 启动

```bash
# 安装依赖
npm install

# 启动 API 服务（端口 8787）
npm run dev:api

# 另一个终端启动前端（端口 5173）
npm run dev:web

# 运行所有测试
npm run test:api
npm run test:web
```

### 测试

- **API 测试** — 20 个测试用例（排名算法、接口路由、存储层）
- **Web 测试** — 11 个测试用例（组件渲染、交互回调、状态管理）

## 设计文档

- [产品设计规格](docs/superpowers/specs/2026-06-14-ai-github-projects-design.md)
- [实施计划](docs/superpowers/plans/2026-06-14-ai-github-projects-implementation-plan.md)

## 技术栈

- **前端** — React, TypeScript, Vite, Vitest
- **后端** — Express, TypeScript, better-sqlite3, zod
- **测试** — Vitest, Testing Library
- **类型共享** — 通过 npm workspace 共享 zod 类型契约

## 许可证

MIT
