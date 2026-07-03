---
updated: 2026-07-03
last_agent: codex
---

# 编码规范与约定

## 通用原则

- 保持改动聚焦，优先沿用现有 monorepo 结构。
- 共享数据契约和可复用业务规则放在 `packages/shared`。
- API 行为放在 `apps/api`，UI 行为放在 `apps/web`。
- 不提交真实密钥、token、Deploy Hook 或本地 `.env`。
- 新增业务规则时尽量拆成小的 service 函数，并补测试。

## 后端约定

- 推荐候选过滤逻辑放在 `packages/shared/src/repository-quality.ts`，API 和 Web 都复用同一套规则。
- GitHub 推荐源入口在 `apps/api/src/services/github.ts`。
- 推荐源优先使用 GitHub Search API；如果没有网络、GitHub 限流或返回异常，再回退到 `apps/api/src/fixtures/github-search.json`。
- `fixtures/github-search.json` 只作为开发/兜底示例数据，不代表实时爬取结果。
- 可通过 `GITHUB_TOKEN` 提高 GitHub API 限额，通过 `GITHUB_SEARCH_QUERIES` 覆盖搜索语句，多个查询用英文分号分隔。
- GitHub API 原始数据到前端记录的转换在 `apps/api/src/services/normalize.ts`。
- 推荐分数和理由在 `apps/api/src/services/rank.ts`。
- 已知 404 或失效仓库应在排序前过滤，不能只靠前端点击后暴露问题。
- 线上可能存在旧 API 部署，前端 `apps/web/src/lib/api.ts` 也要做一次兜底过滤。

## 前端约定

- 组件位于 `apps/web/src/components`。
- 样式位于 `apps/web/src/styles.css`。
- 外部链接使用真实 `<a>` 标签，并设置 `target="_blank"` 和 `rel="noreferrer"`。
- 应用内动作使用 `<button>`，例如查看详情、收藏、加入对比。
- 保持现有暗色研究仪表盘风格，不做无关重设计。
- 生产环境 API 通过 Vercel rewrite 转发，修改 API 域名或端口时同步更新 `vercel.json`。

## 测试约定

- UI 行为变化要更新组件测试。
- API 推荐规则变化要更新 service 或 route 测试。
- 优先运行最相关测试，再根据影响范围运行 build。

推荐命令：

```powershell
npm --workspace @ai-radar/api run test
npm --workspace @ai-radar/web run test
npm run build
```

## Git 约定

Commit message 简短明确：

```text
feat(web): link project titles to github
fix(api): filter unavailable recommendation repos
feat(api): fetch live github recommendations
```
