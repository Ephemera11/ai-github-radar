---
title: ".agent-memory shared memory"
description: "Shared project memory for AI agents working on AI GitHub Radar"
version: "1.0"
updated: 2026-07-03
---

# .agent-memory shared memory

## What this is

This directory is the shared project memory for AI agents working on AI GitHub Radar. Read it before making changes so work can continue with the same context, conventions, and task history.

## Startup checklist

Read these files in order:

1. `README.md`
2. `CONTEXT.md`
3. `CONVENTIONS.md`
4. Files under `tasks/`

## After work

Update memory when project context, conventions, release details, or task status changes. Do not store secrets, tokens, passwords, or private environment values here.

Suggested flow:

```text
read .agent-memory
make focused changes
run relevant tests
update task memory
commit and push
```
