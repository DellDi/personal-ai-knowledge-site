# STORY-001: Bootstrap Project

## Background

The repository started as a minimal shell. The platform needs an Astro application and shared project commands.

## Scope

- pnpm workspace
- `apps/web` Astro app
- React, MDX, Sitemap, RSS, Tailwind v4, Pagefind, Sharp, reading-time, clsx
- Root scripts

## Acceptance

- [ ] `pnpm install` works
- [ ] `pnpm -C apps/web dev` starts the app
- [ ] `pnpm -C apps/web build` builds static output and Pagefind index
