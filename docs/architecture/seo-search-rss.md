# SEO、搜索与 RSS

## SEO

所有页面通过 `BaseLayout` 统一处理：

- title
- description
- canonical
- alternate locale links
- Open Graph 基础信息 + og:image
- Twitter card 基础信息 + twitter:image
- JSON-LD 结构化数据（详情页注入 Article / PodcastEpisode / BreadcrumbList）

中文页面的 title 和 description 必须围绕个人展示、知识沉淀、技能储备和项目实践表达，避免把英文内部概念或泛泛用户定位作为主描述。

## JSON-LD

详情页通过 `EntryLayout` 构造并注入：

- `Article`：文章、知识库、专题、项目、资源、术语、时间线详情页
- `PodcastEpisode`：播客详情页（含 episodeNumber、partOfSeason、duration、transcript）
- `BreadcrumbList`：所有详情页

构造逻辑位于 `apps/web/src/lib/seo.ts`，通过 `BaseLayout` 的 `jsonLd` prop 注入。

## OG 图

默认 OG 图位于 `apps/web/public/og-default.svg`，尺寸 1200×630，编辑式野兽派风格。通过 `BaseLayout` 的 `ogImage` prop 注入 `og:image` 和 `twitter:image`。后续可按内容生成动态 OG 图。

## 搜索

Pagefind 在 Astro 构建后运行：

```bash
astro build && pagefind --site dist
```

搜索页在生产构建后加载 `/pagefind/pagefind.js`，并按当前语言过滤结果。

## RSS

Feed：

- `/rss.xml`
- `/podcast/rss.xml`

草稿内容不得进入 RSS。RSS 标题和描述优先中文，技术名词按通用写法保留。
