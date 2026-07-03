---
id: project-title-links-and-memory
status: completed
priority: high
created: 2026-07-03
last_agent: codex
blocked_by: []
---

# 项目标题跳转与 Agent 记忆初始化

## 目标

让项目卡片标题可以打开对应的 GitHub 仓库，并为仓库新增 `.agent-memory/` 共享记忆目录。

## 已完成

- [x] 定位标题渲染位置：`apps/web/src/components/ProjectCard.tsx`。
- [x] 确认 `ProjectRecord.url` 已保存 GitHub 仓库地址。
- [x] 将项目标题从纯文本改成外部链接。
- [x] 为标题链接增加 hover 和 focus-visible 样式。
- [x] 增加标题链接行为的前端组件测试。
- [x] 新增 `.agent-memory/README.md`。
- [x] 新增 `.agent-memory/CONTEXT.md`。
- [x] 新增 `.agent-memory/CONVENTIONS.md`。
- [x] 新增本任务归档记录。
