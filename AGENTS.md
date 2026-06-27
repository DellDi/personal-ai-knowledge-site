# AGENTS.md

## Project

默认中文输出。

This repository is an Astro-based content platform for personal brand, podcast, blog, knowledge base, topics, projects, resources, glossary, search, RSS, sitemap, i18n, dark mode, and future admin/CMS/AI retrieval workflows.

## Commands

- Install: `pnpm install`
- Dev: `pnpm -C apps/web dev`
- Build: `pnpm -C apps/web build`
- Preview: `pnpm -C apps/web preview`
- Check: `pnpm -C apps/web check`
- Docker: `docker compose up --build`

## Core Rules

- Use Astro components for static UI.
- Use React only for interactive islands such as theme switching and future search controls.
- Use Astro Content Collections for all structured content.
- Validate content through `apps/web/src/content.config.ts`.
- Keep public routes static-first.
- Keep `zh-CN` and `en` URL prefixes explicit.
- Do not bypass `status: published` filtering for public pages, RSS, or search entry points.
- Keep `/admin` as a reserved static shell until an explicit admin implementation task exists.

## Content Rules

All published content must include:

- `title`
- `description`
- `lang`
- `translationKey`
- `slug`
- `tags`
- `status: published`

Podcast content must also include:

- `episode`
- `season`
- `audio`
- `date`

## UI Rules

- Follow `docs/architecture/ui-system.md`.
- Use tokens from `apps/web/src/styles/global.css`.
- Preserve Editorial Brutalism: strong typography, hard borders, clear grids, and controlled accent colors.
- Keep reading experience stable before visual effects.
- Dark mode must be a first-class theme, not an afterthought.
- Avoid visible text that explains how to use UI controls.

## Done Criteria

Before finishing implementation work:

- Run `pnpm -C apps/web check`.
- Run `pnpm -C apps/web build`.
- Verify `/zh-CN/`, `/en/`, `/rss.xml`, `/podcast/rss.xml`, `/search`, and `/admin`.
- Check mobile layout at 320px and desktop layout at 1440px when UI changes.
- Update Agile Markdown story or architecture docs when scope changes.
