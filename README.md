# Personal AI Knowledge Site

Astro-based bilingual content platform for personal brand, podcast publishing, blog posts, knowledge base documents, topic hubs, project cases, resources, glossary, search, RSS, sitemap, dark mode, Docker deployment, and future admin/CMS/AI retrieval workflows.

## Status

Round 1 platform foundation is implemented:

- Astro app in `apps/web`
- `zh-CN` and `en` route prefixes
- Content Collections for podcast, posts, knowledge, topics, projects, resources, glossary, and timeline
- Editorial Brutalism UI tokens with light/dark themes
- Pagefind search shell
- `/rss.xml` and `/podcast/rss.xml`
- Docker Compose production static deployment through Nginx
- `/admin` noindex reserved shell
- AGENTS.md, project Skill, Agile docs, and architecture docs

## Commands

```bash
pnpm install
pnpm -C apps/web dev
pnpm -C apps/web check
pnpm -C apps/web build
pnpm -C apps/web preview
```

## Docker

```bash
docker compose up --build
```

Then open:

- `http://localhost:8080/zh-CN/`
- `http://localhost:8080/en/`
- `http://localhost:8080/rss.xml`
- `http://localhost:8080/podcast/rss.xml`

## Structure

```txt
apps/web                         Astro public site
docs/agile                       Agile Markdown roadmap, epics, stories, sprints
docs/architecture                Architecture and platform decisions
.skills/astro-content-platform   Project-specific agent skill
AGENTS.md                        Coding agent instructions
Dockerfile                       Static production image
docker-compose.yml               Local production deployment
nginx/default.conf               Nginx static serving config
```

## License

MIT
