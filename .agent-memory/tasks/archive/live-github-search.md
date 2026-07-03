# 实时 GitHub 推荐源实施记录

状态：completed
完成时间：2026-07-03

## 目标

将推荐列表从纯 fixture 死数据调整为优先实时 GitHub Search API，失败时再回退 fixture，并过滤已知 404 仓库。

## 已完成

- [x] 添加 shared 过滤测试，确认 `bubble-io/bubble-templates` 会被排除。
- [x] 更新 shared 过滤规则，已知失效仓库包括 `getomni-ai/omni` 和 `bubble-io/bubble-templates`。
- [x] 给 API service 添加测试：GitHub API 成功时使用实时数据，失败时回退 fixture。
- [x] 实现异步 `fetchAiProjects()`，支持 `GITHUB_TOKEN` 可选鉴权。
- [x] 支持 `GITHUB_SEARCH_QUERIES` 自定义搜索语句，多个查询用英文分号分隔。
- [x] 增加 10 分钟缓存，刷新接口可强制重新拉取。
- [x] 支持 Node 16：没有全局 `fetch` 时使用 Node 内置 `https` 请求。
- [x] 更新 projects 和 favorites 相关路由为异步调用。
- [x] 更新 README 和中文 memory，澄清 fixture 是开发/兜底数据，不是实时源。
- [x] 推送 GitHub 并同步腾讯云服务器 `/opt/ai-github-radar`。

## 验证结果

- `npm --workspace @ai-radar/shared run test`：通过。
- `npm --workspace @ai-radar/api run test`：通过。
- `npm --workspace @ai-radar/web run test`：通过。
- `npm run build`：通过。
- 服务器直连 `http://1.15.145.150:8787/api/projects`：返回 19 条，`hasOmni=False`，`hasBubble=False`。
- Vercel 域名 `https://github.wuqiulei.com/api/projects`：返回 19 条，`hasOmni=False`，`hasBubble=False`。

## 注意

腾讯云服务器当前 Node 版本是 `v16.20.2`，因此 API service 保留了 `https` fallback，不能只依赖全局 `fetch`。
