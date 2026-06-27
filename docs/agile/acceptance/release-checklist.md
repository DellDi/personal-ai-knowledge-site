# Release Checklist

- [ ] `pnpm install`
- [ ] `pnpm -C apps/web check`
- [ ] `pnpm -C apps/web build`
- [ ] `docker compose up --build`
- [ ] `/zh-CN/`
- [ ] `/en/`
- [ ] `/rss.xml`
- [ ] `/podcast/rss.xml`
- [ ] `/search`
- [ ] `/admin` is noindex
- [ ] Mobile width 320px has no horizontal scroll
- [ ] Desktop width 1440px layout is stable
- [ ] Light, dark, and system theme preferences work
- [ ] Canonical and hreflang tags are present
