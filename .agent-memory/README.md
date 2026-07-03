---
title: ".agent-memory 共享记忆系统"
description: "AI GitHub Radar 多 Agent 协作记忆"
version: "1.0"
updated: 2026-07-03
---

# .agent-memory 共享记忆系统

## 这是什么

`.agent-memory/` 是本项目给 AI Agent 使用的共享记忆目录。Agent 接手项目时，应先阅读这里的文件，了解项目背景、编码约定、当前任务和历史决策。

## 启动时必读

每次开始工作前，请按顺序阅读：

1. `README.md`：了解记忆系统的使用方式。
2. `CONTEXT.md`：了解项目背景、架构和关键模块。
3. `CONVENTIONS.md`：了解编码、测试和 Git 约定。
4. `tasks/` 下的任务记录：了解最近完成或仍需跟进的事项。

## 完成工作后

完成或推进任务后，请更新对应记忆：

| 你做了什么 | 更新哪个文件 |
| --- | --- |
| 改变项目背景、架构、数据流或部署方式 | `CONTEXT.md` |
| 新增或修改编码规范 | `CONVENTIONS.md` |
| 推进当前任务 | `tasks/active/<task-id>.md` |
| 完成任务 | 将任务状态改为 `completed`，必要时移到 `tasks/archive/` |

## 核心原则

1. 写给人看，也写给 Agent 看。
2. 任务完成后留下清晰记录，方便下一次接手。
3. 不把 GitHub token、Vercel token、Deploy Hook、密码或真实 `.env` 内容写进仓库。
4. 代码变更后运行相关测试，并在最终回复里说明验证结果。
