# SEO, Search, RSS

## SEO

All pages use `BaseLayout` for:

- title
- description
- canonical
- alternate locale links
- Open Graph basics
- Twitter card basics

## Search

Pagefind runs after Astro build:

```bash
astro build && pagefind --site dist
```

The search page loads `/pagefind/pagefind.js` in production and filters results by current locale.

## RSS

Feeds:

- `/rss.xml`
- `/podcast/rss.xml`

Draft content is excluded.
