---
name: astro-content-platform
description: Use this skill when building or modifying this Astro content platform, including content collections, i18n, dark mode, podcast pages, knowledge base, topics, SEO, RSS, search, Docker deployment, admin reservation, and UI components.
---

# Astro Content Platform Skill

## Use When

- Creating routes
- Modifying content schemas
- Adding MDX components
- Building podcast, blog, knowledge, topic, project, resource, glossary, or timeline features
- Improving SEO, RSS, sitemap, Pagefind, i18n, theme, Docker, or admin reservation
- Refactoring UI components

## Required References

Read these before coding:

- `docs/architecture/content-model.md`
- `docs/architecture/ui-system.md`
- `docs/architecture/i18n.md`
- `docs/architecture/seo-search-rss.md`
- `docs/architecture/deployment.md`
- `docs/architecture/admin-design.md`
- `docs/agile/roadmap.md`

## Development Rules

- Prefer `.astro` components.
- Use `.tsx` only for interactive islands.
- Keep all structured content inside Content Collections.
- Never add a new content type without updating schema and docs.
- Every public route must support SEO metadata.
- Every visible module must be responsive.
- Preserve explicit `/zh-CN` and `/en` prefixes.
- Keep `/admin` noindex until real admin auth and writes are implemented.

## Acceptance

A task is complete only when:

- `pnpm -C apps/web check` passes
- `pnpm -C apps/web build` passes
- Changed pages are responsive
- Relevant stories or architecture docs are updated
