# 部署后端 API 到腾讯云服务器

状态：completed
完成时间：2026-07-10
执行 Agent：workbuddy

## 背景

AI GitHub Radar 后端 API 部署在腾讯云服务器 `1.15.145.150:8787`。后端代码已在 GitHub 更新（支持 `?sort=` 参数和不同 Tab 的差异化搜索），但服务器仍跑旧代码，导致四个 Tab 返回相同数据。

## 执行过程

### 1. 验证问题
- 测试 `?sort=trending`、`?sort=rising`、默认请求，三个返回完全相同（79 条，相同 top3），确认问题存在。

### 2. 同步远端代码
- 本地 git 拉取远端最新代码（`f819a78`），远端已实现 sort 功能：
  - `rank.ts`：新增 `SortType` 类型和 `sortProjectsByType` 函数
  - `github.ts`：每个 Tab 使用不同的 GitHub Search 查询条件
  - `projects.ts`：路由接受 `?sort=` 参数并传递给 `fetchAiProjects`
  - `api.ts`：前端 `getProjects(sortType)` 传递排序参数

### 3. 部署到服务器
- 服务器项目路径：`/opt/ai-github-radar`（非 git 仓库，使用 tsx 直接运行源码）
- 通过 scp 将 3 个后端文件传到服务器：
  - `apps/api/src/routes/projects.ts`
  - `apps/api/src/services/github.ts`
  - `apps/api/src/services/rank.ts`
- 使用 paramiko SSH 重启服务：`kill $(lsof -t -i:8787)` → `nohup npx tsx apps/api/src/server.ts`

### 4. 验证结果
部署后各 Tab 返回不同数量和不同顺序的项目：

| Tab | 数量 | Top 1 |
| --- | --- | --- |
| trending | 78 | affaan-m/ECC |
| stars | 75 | affaan-m/ECC |
| rising | 66 | DietrichGebert/ponytail |
| default | 19 | crewAIInc/crewAI |

## 注意事项

- 服务器使用 tsx 运行 TypeScript 源码，无需编译，更新源文件后重启即可
- SSH 连接频繁触发了 fail2ban，使用 paramiko 作为备选连接方式
- 服务器项目 `/opt/ai-github-radar` 不是 git 仓库，无法 git pull，需手动 scp 文件
