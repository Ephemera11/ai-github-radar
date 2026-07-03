---
updated: 2026-07-03
last_agent: codex
---

# Conventions

## General

- Keep changes focused and consistent with the existing monorepo structure.
- Put shared contracts in `packages/shared`.
- Keep API behavior in `apps/api` and UI behavior in `apps/web`.
- Do not commit real secrets or local `.env` files.

## Frontend

- Components live in `apps/web/src/components`.
- Styling lives in `apps/web/src/styles.css`.
- Prefer accessible HTML semantics. Use real anchors for external links and buttons for in-app actions.
- External links should use `target="_blank"` and `rel="noreferrer"`.
- Preserve existing UI density and dark dashboard style unless a task explicitly asks for redesign.

## Testing

- Update component tests when UI behavior changes.
- Use Testing Library queries by role or visible text when possible.
- Run the most focused workspace test first, then broader tests if the change touches shared behavior.

Recommended commands:

```powershell
npm --workspace @ai-radar/web run test
npm --workspace @ai-radar/api run test
npm run build
```

## Git

Commit messages should be short and scoped when useful:

```text
feat(web): link project titles to github
docs(agent-memory): add shared project memory
```
