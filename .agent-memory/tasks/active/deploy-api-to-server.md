---
created: 2026-07-10
status: pending
---

# 任务：部署后端 API 到腾讯云服务器

## 背景

AI GitHub Radar 项目的后端 API 部署在腾讯云服务器 `1.15.145.150` 上，端口 `8787`。前端部署在 Vercel（已自动更新）。后端代码已更新但尚未同步到服务器，导致四个 Tab 返回的数据完全相同（旧代码不识别 `?sort=` 参数）。

需要 SSH 登录服务器，拉取最新代码并重启服务。

## 服务器信息

- **IP**: `1.15.145.150`
- **SSH 端口**: `22`
- **用户**: `root`
- **认证方式**: SSH 密钥（ED25519），私钥路径 `~/.ssh/id_ed25519`
- **API 服务端口**: `8787`

## 验证当前问题

执行以下命令，三个 Tab 返回的数据完全相同（都是 79 条，顺序一致），说明后端跑的是旧代码：

```bash
curl -s "http://1.15.145.150:8787/api/projects?sort=trending" | python3 -c "import sys,json; d=json.load(sys.stdin); print('trending:', len(d.get('items',[])), [i['repoId'] for i in d.get('items',[])[:3]])"
curl -s "http://1.15.145.150:8787/api/projects?sort=rising" | python3 -c "import sys,json; d=json.load(sys.stdin); print('rising:', len(d.get('items',[])), [i['repoId'] for i in d.get('items',[])[:3]])"
curl -s "http://1.15.145.150:8787/api/projects" | python3 -c "import sys,json; d=json.load(sys.stdin); print('default:', len(d.get('items',[])), [i['repoId'] for i in d.get('items',[])[:3]])"
```

预期结果（修复后）：三个请求应返回不同数量和不同顺序的项目。

## 部署步骤

### 第 1 步：SSH 登录服务器

```bash
ssh -o StrictHostKeyChecking=no -i ~/.ssh/id_ed25519 root@1.15.145.150
```

### 第 2 步：找到项目目录

如果已知项目路径，直接 `cd` 进入。如果不确定，执行：

```bash
find / -name "ai-github-radar" -type d 2>/dev/null | head -5
# 或者查找包含 server.ts 的目录
find / -path "*/apps/api/src/server.ts" 2>/dev/null | head -5
```

找到后进入项目根目录（包含 `package.json` 和 `apps/` 目录的那一级）：

```bash
cd <项目路径>
```

### 第 3 步：检查当前 Git 状态

```bash
git remote -v
# 应显示 origin https://github.com/Ephemera11/ai-github-radar
git log --oneline -3
git status
```

如果当前 HEAD 不是 `19629d4`，说明需要拉取代码。

### 第 4 步：拉取最新代码

```bash
git pull origin master
```

如果拉取失败（本地有修改），可以暂存后重试：

```bash
git stash
git pull origin master
```

### 第 5 步：安装依赖

```bash
npm install
```

### 第 6 步：构建

```bash
npm run build --workspace @ai-radar/shared
npm run build --workspace @ai-radar/api
```

构建成功应该没有错误输出。如果 `tsc` 报类型错误，说明代码拉取不完整。

### 第 7 步：重启后端服务

先检查当前服务是怎么启动的：

```bash
# 检查 pm2
pm2 list 2>/dev/null

# 检查 systemd
systemctl status ai-radar-api 2>/dev/null
# 或其他可能的服务名
systemctl list-units --type=service | grep -i radar

# 检查是否有 node 进程在跑
ps aux | grep -i "server\|ai-radar\|8787" | grep -v grep
```

根据发现的方式重启：

```bash
# 方式 A：pm2
pm2 restart ai-radar-api
# 如果 pm2 里没有，可能叫别的名字，用 pm2 list 查看

# 方式 B：systemd
systemctl restart ai-radar-api

# 方式 C：直接 node 进程（先 kill 再启动）
kill $(lsof -t -i:8787)
nohup node apps/api/dist/server.js > /var/log/ai-radar.log 2>&1 &

# 方式 D：tsx 方式（开发模式）
kill $(lsof -t -i:8787)
nohup npx tsx apps/api/src/server.ts > /var/log/ai-radar.log 2>&1 &
```

### 第 8 步：验证部署成功

```bash
# 1. 检查服务是否存活
curl -s http://localhost:8787/api/health
# 应返回 {"ok":true}

# 2. 检查三个 Tab 返回不同数据
curl -s "http://localhost:8787/api/projects?sort=trending" | python3 -c "import sys,json; d=json.load(sys.stdin); print('trending:', len(d.get('items',[])), [i['repoId'] for i in d.get('items',[])[:3]])"
curl -s "http://localhost:8787/api/projects?sort=rising" | python3 -c "import sys,json; d=json.load(sys.stdin); print('rising:', len(d.get('items',[])), [i['repoId'] for i in d.get('items',[])[:3]])"
curl -s "http://localhost:8787/api/projects" | python3 -c "import sys,json; d=json.load(sys.stdin); print('default:', len(d.get('items',[])), [i['repoId'] for i in d.get('items',[])[:3]])"
```

预期结果：三个请求返回**不同数量**和**不同顺序**的项目。如果三个结果完全相同，说明部署失败，检查日志：

```bash
cat /var/log/ai-radar.log
# 或
pm2 logs ai-radar-api --lines 20
```

## 注意事项

- 服务器上需要有 `GITHUB_TOKEN` 环境变量配置（如果之前有的话），否则 GitHub API 可能限流
- 如果项目目录里有 `.env` 文件，`git pull` 不会覆盖它（已在 `.gitignore` 中）
- 重启服务前确认构建成功，否则服务会启动失败
- 如果服务器上 Node.js 版本低于 20，需要先升级 Node.js
