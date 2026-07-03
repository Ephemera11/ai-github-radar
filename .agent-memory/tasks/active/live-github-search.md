# 实时 GitHub 推荐源实施计划

目标：将推荐列表从纯 fixture 死数据调整为优先实时 GitHub Search API，失败时再回退 fixture，并过滤已知 404 仓库。

架构：`apps/api/src/services/github.ts` 负责数据源选择、GitHub 请求、fixture 回退和排序。`packages/shared/src/repository-quality.ts` 继续负责仓库候选过滤，前后端共用。`apps/api/src/routes/projects.ts` 改为异步等待项目列表。

技术栈：Node.js fetch、Express、Vitest、TypeScript。

## 文件

- 修改 `packages/shared/src/repository-quality.ts`：加入 `bubble-io/bubble-templates` 失效仓库过滤。
- 修改 `packages/shared/src/repository-quality.test.ts`：覆盖新失效仓库。
- 修改 `apps/api/src/services/github.ts`：新增实时 GitHub Search API，失败回退 fixture。
- 修改 `apps/api/src/routes/projects.ts`：异步调用项目拉取。
- 修改 `apps/api/src/app.test.ts`：覆盖 bubble 过滤和 GitHub API 回退。
- 修改 `.agent-memory`：说明 fixture 是开发/兜底数据，不是实时源。

## 步骤

- [x] 添加 shared 过滤测试，确认 `bubble-io/bubble-templates` 会被排除。
- [x] 更新 shared 过滤规则。
- [x] 给 API service 添加测试：GitHub API 成功时使用实时数据，失败时回退 fixture。
- [x] 实现异步 `fetchAiProjects()`，支持 `GITHUB_TOKEN` 可选鉴权。
- [x] 更新 projects 路由为 `await fetchAiProjects()`。
- [x] 更新中文 memory，澄清 fixture 用途。
- [x] 跑 shared/api 测试和总构建。
- [ ] 提交、推送，并同步服务器 API。
