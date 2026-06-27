# Agent Workflow

## Rules

- Read `AGENTS.md` before coding.
- Read the project Skill for platform changes.
- Prefer official Astro docs for framework behavior.
- Update architecture docs when schema, routing, deployment, or UI rules change.
- Update Agile Markdown when task scope changes.

## Verification

Run:

```bash
pnpm -C apps/web check
pnpm -C apps/web build
```

For deployment changes, also run:

```bash
docker compose up --build
```
