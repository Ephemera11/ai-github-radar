---
updated: 2026-07-03
last_agent: codex
---

# Project Context

AI GitHub Radar is a TypeScript monorepo for discovering and researching AI-related GitHub repositories. It ranks projects by growth and research usefulness rather than only total stars.

## Stack

| Area | Technology |
| --- | --- |
| Web app | React, TypeScript, Vite |
| API | Express, TypeScript |
| Data | SQLite via `better-sqlite3` |
| Shared contracts | `zod` in `packages/shared` |
| Tests | Vitest, Testing Library, Playwright |
| Workspace | npm workspaces |

## Structure

```text
ai-github-radar/
├── apps/
│   ├── api/      # Express API, ranking, storage, GitHub fixtures
│   └── web/      # React frontend
├── packages/
│   └── shared/   # Shared zod contracts and TypeScript types
└── .agent-memory/
```

## Current Notes

- Project card data uses `ProjectRecord.url` for the GitHub repository URL.
- Project card titles in `apps/web/src/components/ProjectCard.tsx` link directly to the GitHub repository in a new tab.
- The separate "view details" action remains available for opening the in-app research sidebar.
- The frontend CSS is centralized in `apps/web/src/styles.css`.

## Local Commands

```powershell
npm install
npm run test:web
npm run test:api
npm run build
```
