---
id: filter-unavailable-repos
status: completed
priority: high
created: 2026-07-03
last_agent: codex
blocked_by: []
---

# 过滤 404 仓库并中文化 Agent 记忆

## 背景

用户反馈推荐列表第一个 `getomni-ai/omni` 点击后 GitHub 返回 404。检查后发现推荐列表来自静态 fixture，原逻辑只 normalize 并按 `recommendationScore` 排序，没有在排序前检查仓库是否仍可推荐。

## 完成内容

- [x] 新增共享过滤模块 `packages/shared/src/repository-quality.ts`。
- [x] 在排序前过滤非标准 GitHub 仓库 URL。
- [x] 在排序前过滤已知失效仓库 `getomni-ai/omni`。
- [x] 为过滤逻辑新增单元测试。
- [x] 在 `/api/projects` 路由测试中断言 `getomni-ai/omni` 不再返回。
- [x] 前端 API client 复用共享过滤逻辑，兜底过滤旧 API 仍返回的失效仓库。
- [x] 将 `.agent-memory` 核心文件改为中文内容。
- [x] 更新服务器 `/opt/ai-github-radar` 的 API 代码并重启 8787 服务。
- [x] 在 `vercel.json` 增加 `/api/:path*` rewrite，代理到腾讯云 API。

## 后续建议

当前过滤能解决已知 404 和明显非法 URL。后续如果接入实时 GitHub 搜索，可以在 refresh 流程中调用 GitHub API 校验仓库是否存在，并缓存校验结果，避免每次列表请求都访问 GitHub。
